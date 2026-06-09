'use strict';
/* Shared family + contact option lists for joint accounts, BC organiser, etc. */

function _fpEsc(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function familyMemberNames() {
  const members = (typeof S !== 'undefined' && S.familyMembers) ? S.familyMembers : [];
  return members.map(m => m.name).filter(Boolean);
}

function familyJointOptionsHtml(selectedValue) {
  const sel = selectedValue || '';
  const fam = familyMemberNames().map(name => {
    const v = 'family:' + name;
    return `<option value="${_fpEsc(v)}"${sel === v ? ' selected' : ''}>${_fpEsc(name)} (Family)</option>`;
  }).join('');
  const contacts = ((typeof S !== 'undefined' && S.friends) ? S.friends : []).map(f => {
    const name = f.name || '';
    if (!name) return '';
    const v = 'contact:' + name;
    return `<option value="${_fpEsc(v)}"${sel === v ? ' selected' : ''}>${_fpEsc(name)} (Contact)</option>`;
  }).join('');
  return fam + contacts;
}

function familyOrganiserDatalistHtml() {
  const names = familyMemberNames();
  if (!names.length) return '';
  return '<datalist id="bcOrgDL">' + names.map(n =>
    `<option value="${_fpEsc(n)}">`
  ).join('') + '</datalist>';
}

window.familyJointOptionsHtml = familyJointOptionsHtml;
window.familyOrganiserDatalistHtml = familyOrganiserDatalistHtml;
