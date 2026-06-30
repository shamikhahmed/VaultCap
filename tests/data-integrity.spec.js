// @ts-check
const { test, expect } = require('@playwright/test');
const { unlockDemoVault } = require('./demo-unlock');

test.describe('VaultCap data integrity', () => {
  test('demo counts, net-worth math, and module renders are consistent', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await unlockDemoVault(page);

    await page.evaluate(() => R.goto('cards'));
    await page.waitForTimeout(200);
    await page.evaluate(() => R.goto('assets'));
    await page.waitForTimeout(200);
    await page.evaluate(() => R.goto('family'));
    await page.waitForTimeout(200);

    const audit = await page.evaluate(() => {
      const counts = {
        banks: (S.banks || []).length,
        cards: (S.cards || []).length,
        investments: (S.investments || []).length,
        cash: (S.cash || []).length,
        loans: (S.loans || []).length,
        assets: (S.assets || []).length,
        documents: (S.documents || []).length,
        friends: (S.friends || []).length,
        familyMembers: (S.familyMembers || []).length,
        bc: (S.bc || []).length,
        bonds: (S.bonds || []).length,
      };

      const nw = CurrencyEngine.computeNetWorthPKR();
      const sum =
        nw.bankPKR + nw.invPKR + nw.asPKR + nw.cashPKR + nw.bcPKR + nw.bondsPKR - nw.debtPKR;
      const mathOk = Math.abs(sum - nw.nwPKR) < 1;

      const cur = S.user.currency || 'GBP';
      const heroText = document.querySelector('#dashBody .sens')?.textContent || '';
      const fmtHero = U.fmtCur(nw.nwPKR, cur);

      const creditLimits = (S.cards || [])
        .filter(c => c.cardType === 'Credit')
        .map(c => c.limit || c.creditLimit || 0);
      const hasCreditLimits = creditLimits.some(v => v > 0);

      Cards.render();
      const cardsHtml = document.getElementById('cItems')?.innerHTML || '';
      const cardsShowLimit = cardsHtml.includes('Total Credit Limit');

      Assets.render();
      const assetsHtml = document.getElementById('aItems')?.innerHTML || '';

      Family.render();
      const familyHtml = document.getElementById('pg-family-body')?.innerHTML || '';

      Loans.render();
      const loanSummary = document.getElementById('loanSummary')?.innerHTML || '';

      Inv.render();
      const invSummary = document.getElementById('invSummary')?.innerHTML || '';

      Friends.render();
      const friendSummary = document.getElementById('friendSummary')?.innerHTML || '';

      const familyNW = Family.totalNetWorthPKR();

      return {
        counts,
        nw,
        mathOk,
        fmtHero,
        heroText,
        hasCreditLimits,
        cardsShowLimit,
        cardsHasEntries: cardsHtml.includes('Barclays') || cardsHtml.includes('Card'),
        assetsHasEntries: assetsHtml.includes('London') || assetsHtml.includes('Asset') || assetsHtml.length > 80,
        familyHasMembers: familyHtml.includes('Alex Khan') && familyHtml.includes('Sara Khan'),
        loanSummaryLen: loanSummary.length,
        invSummaryLen: invSummary.length,
        friendSummaryLen: friendSummary.length,
        familyNW,
        displayCur: cur,
      };
    });

    expect(audit.counts.banks).toBe(6);
    expect(audit.counts.cards).toBe(5);
    expect(audit.counts.investments).toBe(6);
    expect(audit.counts.cash).toBe(3);
    expect(audit.counts.loans).toBe(4);
    expect(audit.counts.assets).toBeGreaterThanOrEqual(5);
    expect(audit.counts.documents).toBe(5);
    expect(audit.counts.friends).toBe(3);
    expect(audit.counts.familyMembers).toBe(3);
    expect(audit.counts.bc).toBe(2);
    expect(audit.counts.bonds).toBe(2);

    expect(audit.mathOk).toBe(true);
    expect(audit.nw.nwPKR).toBeGreaterThan(0);
    expect(audit.nw.bankPKR).toBeGreaterThan(0);
    expect(audit.nw.invPKR).toBeGreaterThan(0);
    expect(audit.nw.asPKR).toBeGreaterThan(0);
    expect(audit.nw.debtPKR).toBeGreaterThan(0);

    expect(audit.hasCreditLimits).toBe(true);
    expect(audit.cardsShowLimit).toBe(true);
    expect(audit.cardsHasEntries).toBe(true);
    expect(audit.assetsHasEntries).toBe(true);
    expect(audit.familyHasMembers).toBe(true);
    expect(audit.loanSummaryLen).toBeGreaterThan(50);
    expect(audit.invSummaryLen).toBeGreaterThan(50);
    expect(audit.friendSummaryLen).toBeGreaterThan(50);
    expect(audit.familyNW).toBeGreaterThan(0);

    const fatal = errors.filter((e) => /escHtml|ReferenceError|SyntaxError/i.test(e));
    expect(fatal, fatal.join('\n')).toEqual([]);
  });
});
