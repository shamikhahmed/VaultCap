'use strict';
/* skeletonCard, initSwipeDelete, pullToRefresh, showContextMenu, initLongPress, promptAddAnother, SmartSuggest */

function skeletonCard() {
  return `<div class="entry vc-ix-171">
    <div class="entry-main">
      <div class="entry-ic skel" style="width:40px;height:40px;border-radius:var(--rsm);flex-shrink:0"></div>
      <div class="entry-body" style="gap:6px;display:flex;flex-direction:column">
        <div class="skel skel-line medium" style="height:14px;border-radius:6px"></div>
        <div class="skel skel-line short" style="height:11px;border-radius:5px"></div>
      </div>
    </div>
  </div>`;
}

function initSwipeDelete(containerEl, deleteCallback) {
  if (!containerEl) return;
  containerEl.querySelectorAll('.entry:not([data-swipe])').forEach(entry => {
    entry.setAttribute('data-swipe', '1');
    if (!entry.querySelector('.entry-del-bg')) {
      const bg = document.createElement('div');
      bg.className = 'entry-del-bg';
      bg.textContent = 'DELETE';
      entry.appendChild(bg);
    }
    if (!entry.querySelector('.entry-fav-bg')) {
      const favBg = document.createElement('div');
      favBg.className = 'entry-fav-bg';
      favBg.textContent = '⭐';
      favBg.style.cssText = 'position:absolute;left:0;top:0;bottom:0;width:80px;background:var(--ok);display:flex;align-items:center;justify-content:center;font-size:22px;border-radius:var(--r) 0 0 var(--r);transform:translateX(-100%);transition:transform .25s var(--spring)';
      entry.appendChild(favBg);
    }
    const main = entry.querySelector('.entry-main');
    const bg = entry.querySelector('.entry-del-bg');
    const favBg = entry.querySelector('.entry-fav-bg');
    let startX = 0, dx = 0;
    entry.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX; dx = 0;
      if (main) { main.style.transition = 'none'; }
    }, {passive: true});
    entry.addEventListener('touchmove', e => {
      dx = e.touches[0].clientX - startX;
      if (dx < 0 && main) {
        const offset = Math.max(-140, dx);
        main.style.transform = `translateX(${offset}px)`;
        if (bg) bg.style.transform = `translateX(${Math.max(0, 100 + (offset / 80) * 100)}%)`;
        if (favBg) favBg.style.transform = 'translateX(-100%)';
      } else if (dx > 0 && main) {
        const offset = Math.min(80, dx);
        main.style.transform = `translateX(${offset}px)`;
        if (favBg) favBg.style.transform = `translateX(${Math.min(0, -100 + (offset / 80) * 100)}%)`;
        if (bg) bg.style.transform = 'translateX(100%)';
      }
    }, {passive: true});
    entry.addEventListener('touchend', () => {
      if (main) main.style.transition = 'transform .25s var(--spring)';
      if (bg) bg.style.transition = 'transform .25s var(--spring)';
      if (favBg) favBg.style.transition = 'transform .25s var(--spring)';
      if (dx < -120) {
        if (navigator.vibrate) navigator.vibrate([50,30,50]);
        if (main) main.style.transform = '';
        if (bg) bg.style.transform = '';
        const delBtn = entry.querySelector('.icb.del');
        if (delBtn) delBtn.click();
        else if (deleteCallback) deleteCallback(entry.dataset.id);
      } else if (dx < -60) {
        if (main) main.style.transform = 'translateX(-80px)';
        if (bg) bg.style.transform = 'translateX(0%)';
      } else if (dx > 80) {
        if (navigator.vibrate) navigator.vibrate(30);
        if (main) main.style.transform = '';
        if (favBg) favBg.style.transform = 'translateX(-100%)';
        const id = entry.dataset.id;
        if (id) {
          const allArrs = ['banks','cards','investments','sims','assets','expenses','emails','gadgets','digital','loans','cash','friends','vehicles'];
          for (const k of allArrs) {
            const item = (S[k]||[]).find(x => x.id === id);
            if (item) { item.favorite = !item.favorite; Store.save(); Toast.show(item.favorite ? '⭐ Favorited' : 'Removed from favorites', 'success', 1500); break; }
          }
        }
      } else {
        if (main) main.style.transform = '';
        if (bg) bg.style.transform = '';
        if (favBg) favBg.style.transform = 'translateX(-100%)';
      }
    }, {passive: true});
  });
}

function pullToRefresh(el, callback) {
  if (!el || el._ptrInited) return;
  el._ptrInited = true;
  const ind = document.createElement('div');
  ind.className = 'ptr-indicator';
  ind.textContent = '↻';
  el.style.position = 'relative';
  el.insertBefore(ind, el.firstChild);
  let startY = 0, pulling = false;
  el.addEventListener('touchstart', e => {
    if (el.scrollTop === 0) { startY = e.touches[0].clientY; pulling = true; }
  }, {passive: true});
  el.addEventListener('touchmove', e => {
    if (!pulling) return;
    const dy = e.touches[0].clientY - startY;
    if (dy > 0 && el.scrollTop === 0) {
      const pull = Math.min(80, dy);
      ind.style.top = (pull - 44) + 'px';
      el.style.transform = `translateY(${pull * 0.25}px)`;
      el.style.transition = 'none';
    }
  }, {passive: true});
  el.addEventListener('touchend', e => {
    if (!pulling) return;
    pulling = false;
    const dy = e.changedTouches[0].clientY - startY;
    el.style.transition = 'transform .3s var(--spring)';
    el.style.transform = '';
    ind.style.top = '-44px';
    if (dy > 60) {
      ind.textContent = '⟳';
      setTimeout(() => { callback(); ind.textContent = '↻'; }, 300);
    }
    setTimeout(() => { el.style.transition = ''; }, 400);
  }, {passive: true});
}

let _ctxMenuItems = [];
function showContextMenu(x, y, items) {
  document.getElementById('_ctxOverlay')?.remove();
  _ctxMenuItems = items;
  const overlay = document.createElement('div');
  overlay.id = '_ctxOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:1000;';
  overlay.addEventListener('click', () => overlay.remove());
  const menu = document.createElement('div');
  menu.className = 'ctx-menu';
  const mw = 220, mh = items.length * 50;
  const left = Math.min(x, window.innerWidth - mw - 12);
  const top = Math.min(y, window.innerHeight - mh - 12);
  menu.style.cssText = `left:${Math.max(8, left)}px;top:${Math.max(8, top)}px;`;
  menu.innerHTML = items.map((item, i) => {
    const ic = item.ic && typeof VC !== 'undefined' && VC.icon
      ? VC.icon(item.ic, 16)
      : (item.icon || '');
    return `<div class="ctx-menu-item${item.destructive ? ' destructive' : ''}" data-ci="${i}">
      <span class="ctx-menu-ic">${ic}</span><span>${item.label}</span>
    </div>`;
  }).join('');
  menu.addEventListener('click', e => {
    const el = e.target.closest('[data-ci]');
    if (el) { _ctxMenuItems[+el.dataset.ci]?.action?.(); overlay.remove(); }
    e.stopPropagation();
  });
  overlay.appendChild(menu);
  document.body.appendChild(overlay);
}

function initLongPress(containerEl, buildItems) {
  if (!containerEl) return;
  containerEl.querySelectorAll('.entry:not([data-lp])').forEach(entry => {
    entry.setAttribute('data-lp', '1');
    let timer = null;
    entry.addEventListener('touchstart', e => {
      const id = entry.dataset.id;
      if (!id) return;
      timer = setTimeout(() => {
        if (navigator.vibrate) navigator.vibrate(10);
        const touch = e.touches[0];
        showContextMenu(touch.clientX, touch.clientY, buildItems(id));
      }, 500);
    }, {passive: true});
    entry.addEventListener('touchmove', () => { clearTimeout(timer); timer = null; }, {passive: true});
    entry.addEventListener('touchend', () => { clearTimeout(timer); timer = null; }, {passive: true});
  });
}

// ===================== SMART SUGGEST =====================
const SmartSuggest = {
  forBank(countryCode) {
    const popMap = {
      PK: ['HBL','Meezan Bank','UBL','MCB Bank','Bank Alfalah','Allied Bank','Sadapay','NayaPay'],
      GB: ['Monzo','Starling Bank','Barclays','HSBC UK','Lloyds Bank','NatWest','Revolut','Wise'],
      AE: ['Emirates NBD','FAB','ADCB','Dubai Islamic Bank','Mashreq Bank','ADIB','Wio Bank','Liv.'],
      US: ['Chase','Bank of America','Wells Fargo','Citibank','Capital One'],
    };
    const names = popMap[countryCode] || [];
    return names.map(n => SMART_DB.banks.find(b => b.name === n)).filter(Boolean);
  },
  forCard(bankName) {
    const lc = (bankName || '').toLowerCase();
    return SMART_DB.cards.filter(c => c.name.toLowerCase().includes(lc.split(' ')[0])).slice(0, 6);
  },
  forExpense(name) {
    const n = (name || '').toLowerCase();
    const subs = [
      {k:'netflix',cat:'Streaming',freq:'monthly'},{k:'spotify',cat:'Streaming',freq:'monthly'},
      {k:'youtube',cat:'Streaming',freq:'monthly'},{k:'amazon',cat:'Shopping',freq:'monthly'},
      {k:'apple',cat:'Tech',freq:'monthly'},{k:'google',cat:'Tech',freq:'monthly'},
      {k:'gym',cat:'Fitness',freq:'monthly'},{k:'electricity',cat:'Utilities',freq:'monthly'},
      {k:'internet',cat:'Utilities',freq:'monthly'},{k:'insurance',cat:'Insurance',freq:'monthly'},
      {k:'rent',cat:'Housing',freq:'monthly'},{k:'mortgage',cat:'Housing',freq:'monthly'},
    ];
    return subs.find(s => n.includes(s.k)) || null;
  },
  forInvestment(ticker) {
    return SMART_DB.investments.find(i => i.ticker === (ticker || '').toUpperCase()) || null;
  }
};

// ===================== MORE SHEET =====================
