// @ts-check
/** Id policy — malicious backup ids remapped; Act strings reject unsafe ids; normal ids round-trip. */
const { test, expect } = require('@playwright/test');
const { unlockDemoVault, dismissOverlays } = require('./demo-unlock');

test.describe('IdPolicy record-id hardening', () => {
  test('restoring backup with malicious id sanitizes and blocks Act breakout', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('load');
    await page.waitForFunction(() => typeof IdPolicy !== 'undefined' && typeof Banks !== 'undefined', { timeout: 30000 });
    await unlockDemoVault(page);
    await dismissOverlays(page);

    const result = await page.evaluate(async () => {
      window.__vos_confirm = async () => true;
      const evilId = "x');Store.reset();('";
      const attrEvil = 'x" autofocus data-x="';
      const goodId = 'good_bank_roundtrip_01';
      const payload = {
        banks: [
          { id: evilId, bankName: 'Evil Inject Bank', currency: 'GBP', country: 'GB', createdAt: new Date().toISOString() },
          { id: goodId, bankName: 'Honest Bank', currency: 'GBP', country: 'GB', createdAt: new Date().toISOString() },
        ],
        cards: [
          { id: attrEvil, cardName: 'Evil Card', linkedBankId: evilId, network: 'Visa', createdAt: new Date().toISOString() },
        ],
      };
      IdPolicy.sanitizeVault(payload);
      ['banks', 'cards'].forEach((k) => {
        if (!Array.isArray(payload[k])) return;
        S[k] = [...(S[k] || []), ...payload[k].filter((x) => !(S[k] || []).find((y) => y.id === x.id))];
      });
      Store.sanitizeIds();

      const evilBank = (S.banks || []).find((b) => b.bankName === 'Evil Inject Bank');
      const goodBank = (S.banks || []).find((b) => b.id === goodId);
      const evilCard = (S.cards || []).find((c) => c.cardName === 'Evil Card');

      Banks.render();
      const html = document.getElementById('bItems')?.innerHTML || '';
      const entry = document.querySelector('#bItems .entry[data-id]');
      const act = entry?.getAttribute('data-act') || '';
      const dataId = entry?.getAttribute('data-id') || '';

      // Simulate tap Act path: only the sanitized id must appear in the statement
      let resetCalled = false;
      const prevReset = Store.reset;
      Store.reset = function () { resetCalled = true; };

      const tapAct = document.querySelector(`#bItems .entry-body[data-act*="Banks.detail"]`);
      const stmt = tapAct?.getAttribute('data-act') || '';
      if (typeof Act !== 'undefined' && Act.run && stmt) {
        try { Act.run(stmt, { el: tapAct, event: null }); } catch (e) {}
      }
      Store.reset = prevReset;

      // cleanup
      S.banks = (S.banks || []).filter((b) => b.bankName !== 'Evil Inject Bank' && b.id !== goodId);
      S.cards = (S.cards || []).filter((c) => c.cardName !== 'Evil Card');

      return {
        evilIdNow: evilBank?.id || null,
        evilSafe: evilBank ? IdPolicy.isSafe(evilBank.id) : false,
        goodUnchanged: !!goodBank && goodBank.id === goodId,
        cardLinked: evilCard?.linkedBankId === evilBank?.id,
        htmlHasStoreReset: html.includes('Store.reset'),
        htmlHasAttrBreak: html.includes('autofocus'),
        actHasStoreReset: act.includes('Store.reset') || stmt.includes('Store.reset'),
        dataIdSafe: IdPolicy.isSafe(dataId),
        actIdReject: IdPolicy.actId(evilId) === '',
        resetCalled,
      };
    });

    expect(result.evilSafe).toBe(true);
    expect(result.evilIdNow).not.toBe("x');Store.reset();('");
    expect(result.goodUnchanged).toBe(true);
    expect(result.cardLinked).toBe(true);
    expect(result.htmlHasStoreReset).toBe(false);
    expect(result.htmlHasAttrBreak).toBe(false);
    expect(result.actHasStoreReset).toBe(false);
    expect(result.dataIdSafe).toBe(true);
    expect(result.actIdReject).toBe(true);
    expect(result.resetCalled).toBe(false);
  });

  test('normal demo bank ids round-trip through sanitize unchanged', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('load');
    await page.waitForFunction(() => typeof IdPolicy !== 'undefined', { timeout: 30000 });
    await unlockDemoVault(page);
    await dismissOverlays(page);

    const snap = await page.evaluate(() => {
      const before = (S.banks || []).map((b) => b.id);
      const r = IdPolicy.sanitizeVault(S);
      const after = (S.banks || []).map((b) => b.id);
      return { remapped: r.remapped, before, after, same: JSON.stringify(before) === JSON.stringify(after) };
    });
    expect(snap.remapped).toBe(0);
    expect(snap.same).toBe(true);
    expect(snap.before.every((id) => /^[A-Za-z0-9_-]{1,64}$/.test(id))).toBe(true);
  });
});
