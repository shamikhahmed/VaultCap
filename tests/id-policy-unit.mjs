#!/usr/bin/env node
/**
 * Node unit test for IdPolicy (no browser).
 * Run: node tests/id-policy-unit.mjs
 */
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const code = fs.readFileSync(path.join(root, 'js/core/id-policy.js'), 'utf8');
const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const IdPolicy = sandbox.window.IdPolicy || sandbox.IdPolicy;
if (!IdPolicy) {
  console.error('FAIL: IdPolicy not defined');
  process.exit(1);
}

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exit(1);
  }
}

assert(IdPolicy.isSafe('i1700000000000abc'), 'normal U.id-shaped id is safe');
assert(IdPolicy.isSafe('audit_bank_1'), 'underscore id is safe');
assert(!IdPolicy.isSafe("x');Store.reset();('"), 'act-breakout id rejected');
assert(!IdPolicy.isSafe('x" autofocus data-x="'), 'attr-breakout id rejected');
assert(IdPolicy.actId("x');Store.reset();('") === '', 'actId rejects malicious');
assert(IdPolicy.actId('bank1') === 'bank1', 'actId passes safe');

const vault = {
  banks: [
    { id: "x');Store.reset();('", bankName: 'Evil Bank' },
    { id: 'good_bank_01', bankName: 'Safe Bank' },
  ],
  cards: [
    {
      id: 'x" autofocus data-x="',
      cardName: 'Evil Card',
      linkedBankId: "x');Store.reset();('",
    },
    { id: 'good_card_01', cardName: 'Safe Card', linkedBankId: 'good_bank_01' },
  ],
  wallet: ["x');Store.reset();('"],
  documents: [{ id: 'doc_ok', ownerId: 'self', title: 'Passport' }],
};

const beforeGoodBank = vault.banks[1].id;
const beforeGoodCard = vault.cards[1].id;
const beforeGoodLink = vault.cards[1].linkedBankId;

const { remapped } = IdPolicy.sanitizeVault(vault);
assert(remapped >= 2, 'malicious ids remapped (got ' + remapped + ')');
assert(IdPolicy.isSafe(vault.banks[0].id), 'evil bank id sanitized');
assert(!String(vault.banks[0].id).includes('Store.reset'), 'no Store.reset in bank id');
assert(vault.banks[1].id === beforeGoodBank, 'normal bank id unchanged');
assert(vault.cards[1].id === beforeGoodCard, 'normal card id unchanged');
assert(vault.cards[1].linkedBankId === beforeGoodLink, 'normal linkedBankId unchanged');
assert(vault.cards[0].linkedBankId === vault.banks[0].id, 'card→bank ref remapped consistently');
assert(vault.wallet[0] === vault.banks[0].id || IdPolicy.isSafe(vault.wallet[0]), 'wallet id remapped/safe');
assert(vault.documents[0].ownerId === 'self', 'self ownerId preserved');

// Idempotent
const r2 = IdPolicy.sanitizeVault(vault);
assert(r2.remapped === 0, 'second sanitize is no-op');

console.log('PASS: id-policy-unit (' + remapped + ' remapped, round-trip ok)');

// Valid numeric ids keep their type (legacy records use Date.now() ids compared with ===)
{
  const vault = { banks: [{ id: 1729000000000, bankName: 'Num' }], cards: [{ id: 'c1', linkedBankId: 1729000000000 }] };
  IdPolicy.sanitizeVault(vault);
  if (vault.banks[0].id !== 1729000000000 || vault.cards[0].linkedBankId !== 1729000000000) {
    console.error('FAIL numeric id type changed', vault);
    process.exit(1);
  }
  console.log('PASS numeric ids unchanged');
}
