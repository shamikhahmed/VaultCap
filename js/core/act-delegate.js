'use strict';
/**
 * Act — CSP-safe event delegation for data-act* attributes.
 * No eval / new Function (blocked by script-src without unsafe-eval).
 */
const Act = (() => {
  const ATTR = {
    click: 'data-act',
    input: 'data-act-input',
    change: 'data-act-change',
    keydown: 'data-act-keydown',
    load: 'data-act-load',
  };

  function unquote(s) {
    s = String(s || '').trim();
    if ((s[0] === '"' && s[s.length - 1] === '"') || (s[0] === "'" && s[s.length - 1] === "'")) {
      return s.slice(1, -1).replace(/\\(['"])/g, '$1');
    }
    return s;
  }

  // Walk path with optional ['key'] / [0] segments
  function walkPath(base, segments) {
    let cur = base;
    for (let i = 0; i < segments.length; i++) {
      if (cur == null) return undefined;
      const p = segments[i];
      if (p === 'files' && segments[i + 1] === '0') {
        cur = cur.files && cur.files[0];
        i++;
        continue;
      }
      cur = cur[p];
    }
    return cur;
  }

  function tokenizePath(path) {
    const segs = [];
    let i = 0;
    path = String(path || '').trim();
    while (i < path.length) {
      if (path[i] === '.') { i++; continue; }
      if (path[i] === '[') {
        const end = path.indexOf(']', i);
        if (end < 0) break;
        let key = path.slice(i + 1, end).trim();
        if ((key[0] === "'" && key[key.length - 1] === "'") || (key[0] === '"' && key[key.length - 1] === '"')) {
          key = key.slice(1, -1);
        } else if (/^\d+$/.test(key)) {
          key = Number(key);
        }
        segs.push(key);
        i = end + 1;
        continue;
      }
      let j = i;
      while (j < path.length && path[j] !== '.' && path[j] !== '[') j++;
      if (j > i) segs.push(path.slice(i, j));
      i = j;
    }
    return segs;
  }

  function resolvePath(path, ctx) {
    path = String(path || '').trim();
    const gebi = path.match(/^document\.getElementById\((['"])(.+?)\1\)((?:\.\w+|\[(?:'[^']*'|"[^"]*"|\d+)\])*)$/);
    if (gebi) {
      let cur = document.getElementById(gebi[2]);
      const rest = tokenizePath(gebi[3].replace(/^\./, ''));
      return walkPath(cur, rest);
    }
    // this.closest('sel')...
    const closest = path.match(/^this\.closest\((['"])(.+?)\1\)((?:\.\w+)*)$/);
    if (closest && ctx.el) {
      let cur = ctx.el.closest(closest[2]);
      const rest = (closest[3] || '').split('.').filter(Boolean);
      return walkPath(cur, rest);
    }
    const segs = tokenizePath(path);
    if (!segs.length) return undefined;
    const head = segs[0];
    let cur;
    if (head === 'this') cur = ctx.el;
    else if (head === 'event') cur = ctx.event;
    else if (head === 'window') cur = window;
    else if (head === 'document') cur = document;
    else cur = window[head];
    return walkPath(cur, segs.slice(1));
  }

  function setPath(path, value, ctx) {
    path = String(path || '').trim();
    const gebi = path.match(/^document\.getElementById\((['"])(.+?)\1\)\.(.+)$/);
    if (gebi) {
      const el = document.getElementById(gebi[2]);
      if (!el) return false;
      const parts = tokenizePath(gebi[3]);
      if (parts.length < 1) return false;
      let cur = el;
      for (let i = 0; i < parts.length - 1; i++) {
        cur = cur[parts[i]];
        if (cur == null) return false;
      }
      cur[parts[parts.length - 1]] = value;
      return true;
    }
    const closest = path.match(/^this\.closest\((['"])(.+?)\1\)\.(.+)$/);
    if (closest && ctx.el) {
      const el = ctx.el.closest(closest[2]);
      if (!el) return false;
      const parts = tokenizePath(closest[3]);
      let cur = el;
      for (let i = 0; i < parts.length - 1; i++) {
        cur = cur[parts[i]];
        if (cur == null) return false;
      }
      cur[parts[parts.length - 1]] = value;
      return true;
    }
    const parts = tokenizePath(path);
    if (parts.length < 2) return false;
    const head = parts[0];
    let base;
    if (head === 'this') base = ctx.el;
    else if (head === 'S') base = window.S;
    else base = window[head];
    if (base == null) return false;
    let cur = base;
    for (let i = 1; i < parts.length - 1; i++) {
      cur = cur[parts[i]];
      if (cur == null) return false;
    }
    cur[parts[parts.length - 1]] = value;
    return true;
  }

  function parseLiteral(tok, ctx) {
    tok = String(tok || '').trim();
    if (!tok) return undefined;
    if (tok === 'true') return true;
    if (tok === 'false') return false;
    if (tok === 'null') return null;
    if (tok === 'undefined') return undefined;
    if (tok === 'this') return ctx.el;
    if (tok === 'event') return ctx.event;
    if (tok === 'this.value') return ctx.el && ctx.el.value;
    if (tok === 'this.checked') return ctx.el && ctx.el.checked;
    if (tok === 'this.files[0]') return ctx.el && ctx.el.files && ctx.el.files[0];
    if (tok === 'event.key') return ctx.event && ctx.event.key;
    if (tok === 'event.target') return ctx.event && ctx.event.target;
    // this.getAttribute('x')
    const ga = tok.match(/^this\.getAttribute\((['"])(.+?)\1\)$/);
    if (ga && ctx.el) return ctx.el.getAttribute(ga[2]);
    if (/^-?\d+(\.\d+)?$/.test(tok)) return Number(tok);
    if ((tok[0] === '"' && tok[tok.length - 1] === '"') || (tok[0] === "'" && tok[tok.length - 1] === "'")) {
      return unquote(tok);
    }
    if (tok.startsWith('parseInt(') && tok.endsWith(')')) {
      return parseInt(parseLiteral(tok.slice(9, -1).trim(), ctx), 10);
    }
    if (tok.startsWith('document.getElementById(')) {
      return resolvePath(tok, ctx);
    }
    // string concat with optional ternary parts
    if (tok.includes('+') && (tok.includes("'") || tok.includes('"'))) {
      const parts = [];
      let cur = '', q = null, depth = 0;
      for (let i = 0; i < tok.length; i++) {
        const ch = tok[i];
        if (q) { cur += ch; if (ch === q && tok[i - 1] !== '\\') q = null; continue; }
        if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; }
        if (ch === '(') { depth++; cur += ch; continue; }
        if (ch === ')') { depth--; cur += ch; continue; }
        if (ch === '+' && depth === 0) { parts.push(cur.trim()); cur = ''; continue; }
        cur += ch;
      }
      if (cur.trim()) parts.push(cur.trim());
      if (parts.length > 1) {
        return parts.map((p) => {
          const tern = p.match(/^(.+?)\s*\?\s*(.+?)\s*:\s*(.+)$/);
          if (tern) {
            const c = parseLiteral(tern[1].trim(), ctx);
            return c ? parseLiteral(tern[2].trim(), ctx) : parseLiteral(tern[3].trim(), ctx);
          }
          return parseLiteral(p, ctx);
        }).join('');
      }
    }
    return resolvePath(tok, ctx);
  }

  function splitArgs(argStr) {
    const args = [];
    let cur = '';
    let q = null;
    let depth = 0;
    for (let i = 0; i < argStr.length; i++) {
      const ch = argStr[i];
      if (q) {
        cur += ch;
        if (ch === q && argStr[i - 1] !== '\\') q = null;
        continue;
      }
      if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; }
      if (ch === '(') { depth++; cur += ch; continue; }
      if (ch === ')') { depth--; cur += ch; continue; }
      if (ch === ',' && depth === 0) { args.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
    if (cur.trim()) args.push(cur.trim());
    return args;
  }

  function splitStmts(code) {
    const stmts = [];
    let cur = '';
    let q = null;
    let depth = 0;
    for (let i = 0; i < code.length; i++) {
      const ch = code[i];
      if (q) {
        cur += ch;
        if (ch === q && code[i - 1] !== '\\') q = null;
        continue;
      }
      if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; }
      if (ch === '(' || ch === '{') { depth++; cur += ch; continue; }
      if (ch === ')' || ch === '}') { depth--; cur += ch; continue; }
      if (ch === ';' && depth === 0) { if (cur.trim()) stmts.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
    if (cur.trim()) stmts.push(cur.trim());
    return stmts;
  }

  function runCall(expr, ctx) {
    expr = String(expr || '').replace(/\?\./g, '.');
    const gebiCall = expr.match(/^document\.getElementById\((['"])(.+?)\1\)\.(\w+)\((.*)\)\s*$/);
    if (gebiCall) {
      const el = document.getElementById(gebiCall[2]);
      if (!el) return true;
      const fn = el[gebiCall[3]];
      if (typeof fn !== 'function') return false;
      const args = gebiCall[4].trim() ? splitArgs(gebiCall[4]).map((a) => parseLiteral(a, ctx)) : [];
      fn.apply(el, args);
      return true;
    }
    // this.closest('sel').remove() / .click()
    const closestCall = expr.match(/^this\.closest\((['"])(.+?)\1\)\.(\w+)\((.*)\)\s*$/);
    if (closestCall && ctx.el) {
      const el = ctx.el.closest(closestCall[2]);
      if (!el) return true;
      const fn = el[closestCall[3]];
      if (typeof fn !== 'function') return false;
      const args = closestCall[4].trim() ? splitArgs(closestCall[4]).map((a) => parseLiteral(a, ctx)) : [];
      fn.apply(el, args);
      return true;
    }
    // this.classList.toggle('x'[, cond])
    const clToggle = expr.match(/^this\.classList\.toggle\((.*)\)\s*$/);
    if (clToggle && ctx.el) {
      const args = splitArgs(clToggle[1]).map((a) => parseLiteral(a, ctx));
      ctx.el.classList.toggle.apply(ctx.el.classList, args);
      return true;
    }
    // document.body.classList.toggle('privacy', S.privacyMode)
    const bodyToggle = expr.match(/^document\.body\.classList\.toggle\((.*)\)\s*$/);
    if (bodyToggle) {
      const args = splitArgs(bodyToggle[1]).map((a) => parseLiteral(a, ctx));
      document.body.classList.toggle.apply(document.body.classList, args);
      return true;
    }
    // this.setAttribute('k','v')
    const setAttr = expr.match(/^this\.setAttribute\((.*)\)\s*$/);
    if (setAttr && ctx.el) {
      const args = splitArgs(setAttr[1]).map((a) => parseLiteral(a, ctx));
      ctx.el.setAttribute.apply(ctx.el, args);
      return true;
    }
    // this.querySelector('.x').remove() — rare
    const qsCall = expr.match(/^this\.querySelector\((['"])(.+?)\1\)\.(\w+)\((.*)\)\s*$/);
    if (qsCall && ctx.el) {
      const node = ctx.el.querySelector(qsCall[2]);
      if (!node) return true;
      const fn = node[qsCall[3]];
      if (typeof fn !== 'function') return false;
      const args = qsCall[4].trim() ? splitArgs(qsCall[4]).map((a) => parseLiteral(a, ctx)) : [];
      fn.apply(node, args);
      return true;
    }
    const m = expr.match(/^([A-Za-z_$][\w.$]*)\s*\((.*)\)\s*$/);
    if (!m) return false;
    const path = m[1];
    const argStr = m[2].trim();
    const fn = resolvePath(path, ctx);
    if (typeof fn !== 'function') {
      console.warn('[Act] not a function:', path);
      return false;
    }
    const parts = path.split('.');
    let receiver = window;
    if (parts.length > 1) receiver = resolvePath(parts.slice(0, -1).join('.'), ctx);
    const args = argStr ? splitArgs(argStr).map((a) => parseLiteral(a, ctx)) : [];
    fn.apply(receiver, args);
    return true;
  }

  function runAssign(expr, ctx) {
    // Support left side with getElementById / nested paths
    const eq = expr.indexOf('=');
    if (eq < 1) return false;
    // find = not inside quotes
    let q = null, depth = 0, eqAt = -1;
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if (q) { if (ch === q && expr[i - 1] !== '\\') q = null; continue; }
      if (ch === '"' || ch === "'") { q = ch; continue; }
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (ch === '=' && depth === 0 && expr[i + 1] !== '=' && expr[i - 1] !== '!' && expr[i - 1] !== '<' && expr[i - 1] !== '>') {
        eqAt = i; break;
      }
    }
    if (eqAt < 0) return false;
    const left = expr.slice(0, eqAt).trim();
    let right = expr.slice(eqAt + 1).trim();
    if (right.startsWith('!')) {
      return setPath(left, !resolvePath(right.slice(1).trim(), ctx), ctx);
    }
    const tern = right.match(/^(.+?)\s*\?\s*(.+?)\s*:\s*(.+)$/);
    if (tern && !tern[1].includes('?')) {
      const cond = parseLiteral(tern[1].trim(), ctx);
      const val = cond ? parseLiteral(tern[2].trim(), ctx) : parseLiteral(tern[3].trim(), ctx);
      return setPath(left, val, ctx);
    }
    return setPath(left, parseLiteral(right, ctx), ctx);
  }

  function runStmt(stmt, ctx) {
    stmt = stmt.trim();
    if (!stmt) return true;

    const ifKey = stmt.match(/^if\s*\(\s*event\.key\s*===\s*['"]Enter['"]\s*\)\s*\{?\s*(.*?)\}?\s*$/);
    if (ifKey) {
      if (!ctx.event || ctx.event.key !== 'Enter') return true;
      if (ctx.event.preventDefault) ctx.event.preventDefault();
      return runStmts(ifKey[1].trim(), ctx);
    }

    const ifTarget = stmt.match(/^if\s*\(\s*event\.target\s*===\s*this\s*\)\s*(.+)$/);
    if (ifTarget) {
      if (!ctx.event || ctx.event.target !== ctx.el) return true;
      return runStmts(ifTarget[1], ctx);
    }

    // if(this.checked){...}else{...}
    const ifChecked = stmt.match(/^if\s*\(\s*this\.checked\s*\)\s*\{(.*)\}\s*else\s*\{(.*)\}\s*$/);
    if (ifChecked) {
      return runStmts(ctx.el && ctx.el.checked ? ifChecked[1] : ifChecked[2], ctx);
    }

    // this.querySelector('.x').style.prop = val
    const qsStyle = stmt.match(/^this\.querySelector\((['"])(.+?)\1\)\.(style\.\w+)\s*=\s*(.+)$/);
    if (qsStyle && ctx.el) {
      const node = ctx.el.querySelector(qsStyle[2]);
      if (!node) return true;
      return setPath('this.' + qsStyle[3], parseLiteral(qsStyle[4].trim(), ctx), { el: node, event: ctx.event });
    }

    // this.closest('div').nextElementSibling.style.display = ...
    const closestAssign = stmt.match(/^this\.closest\((['"])(.+?)\1\)\.(.+)$/);
    if (closestAssign && closestAssign[3].includes('=') && ctx.el) {
      return runAssign(stmt, ctx);
    }

    if (stmt.startsWith('((') || stmt.startsWith('(function')) {
      console.warn('[Act] unsupported IIFE:', stmt.slice(0, 80));
      return false;
    }

    // Prefer call when looks like call and not simple assign
    if (stmt.includes('(') && /\)\s*$/.test(stmt) && !/^[^=]+=[^=]/.test(stmt.replace(/===/g, '').replace(/!==/g, ''))) {
      // Heuristic: if first = is after (, treat as call
      const firstParen = stmt.indexOf('(');
      const firstEq = stmt.indexOf('=');
      if (firstEq < 0 || firstEq > firstParen) {
        if (runCall(stmt, ctx)) return true;
      }
    }

    if (stmt.includes('=')) {
      if (runAssign(stmt, ctx)) return true;
    }

    if (runCall(stmt, ctx)) return true;
    console.warn('[Act] unhandled:', stmt.slice(0, 120));
    return false;
  }

  function runStmts(code, ctx) {
    const stmts = splitStmts(code);
    let ok = true;
    for (const s of stmts) {
      if (!runStmt(s, ctx)) ok = false;
    }
    return ok;
  }

  function handle(type, e) {
    const attr = ATTR[type];
    if (!attr) return;
    let el = e.target;
    if (el && el.nodeType === 3) el = el.parentElement;
    const node = el && el.closest && el.closest('[' + attr + ']');
    if (!node) return;
    const code = node.getAttribute(attr);
    if (!code) return;
    if (type === 'click' && node.disabled) return;
    runStmts(code, { el: node, event: e });
  }

  function bind() {
    if (window.__vosActBound) return;
    window.__vosActBound = true;
    document.addEventListener('click', (e) => handle('click', e), false);
    document.addEventListener('input', (e) => handle('input', e), false);
    document.addEventListener('change', (e) => handle('change', e), false);
    document.addEventListener('keydown', (e) => handle('keydown', e), false);
    document.addEventListener('load', (e) => {
      const t = e.target;
      if (t && t.getAttribute && t.getAttribute('data-act-load')) {
        runStmts(t.getAttribute('data-act-load'), { el: t, event: e });
      }
    }, true);
    // img/script error does not bubble — capture required
    document.addEventListener('error', (e) => {
      const t = e.target;
      if (t && t.getAttribute && t.getAttribute('data-act-error')) {
        runStmts(t.getAttribute('data-act-error'), { el: t, event: e });
      }
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();

  return { run: runStmts, bind, handle };
})();

window.Act = Act;
