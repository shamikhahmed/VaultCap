'use strict';
/* Shared family + contact option lists for joint accounts, BC organiser, etc. */

function familyMemberNames() {
  const members = (typeof S !== 'undefined' && S.familyMembers) ? S.familyMembers : [];
  return members.map(m => m.name).filter(Boolean);
}

function familyJointOptionsHtml(selectedValue) {
  const sel = selectedValue || '';
  const fam = familyMemberNames().map(name => {
    const v = 'family:' + name;
    return `<option value="${v.replace(/"/g, '&quot;')}"${sel === v ? ' selected' : ''}>${name} (Family)</option>`;
  }).join('');
  const contacts = ((typeof S !== 'undefined' && S.friends) ? S.friends : []).map(f => {
    const name = f.name || '';
    if (!name) return '';
    const v = 'contact:' + name;
    return `<option value="${v.replace(/"/g, '&quot;')}"${sel === v ? ' selected' : ''}>${name} (Contact)</option>`;
  }).join('');
  return fam + contacts;
}

function familyOrganiserDatalistHtml() {
  const names = familyMemberNames();
  if (!names.length) return '';
  return '<datalist id="bcOrgDL">' + names.map(n =>
    `<option value="${String(n).replace(/"/g, '&quot;')}">`
  ).join('') + '</datalist>';
}

window.familyJointOptionsHtml = familyJointOptionsHtml;
window.familyOrganiserDatalistHtml = familyOrganiserDatalistHtml;
