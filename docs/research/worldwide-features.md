# VaultCap worldwide features — research and shortlist

*Researched 2026-11-25 with four parallel web-research passes: regional money practices; giving, tax and pensions; identity, inheritance, calendars, RTL, accessibility and offline use; competitor apps. Figures marked **verify** were not confirmed against the official source and must be checked before they are relied on. Most competitor feature claims are vendors' own marketing.*

VaultCap constraints that shape every recommendation: local-first, encrypted at rest, no server, no bank connections, optional network only for FX/metal rates. Anything needing a third party to keep time (a true dead-man's switch) or to sync between people is out of scope or must be done with files/QR.

---

## 1. Regional money practices

### 1.1 Rotating savings groups (ROSCAs)
- Hundreds of local names for one structure: **BC / committee** (PK, IN), **chit fund** (IN, LK, NP — regulated by the Chit Funds Act 1982), **tontine** (CI, CM, francophone Africa), **susu / sou-sou / partner** (GH, Caribbean), **esusu / ajo / adashe** (NG), **gameya** (EG), **jam'iya** (Arab world), **ekub** (ET), **chama** (KE), **hagbad** (SO), **stokvel** (ZA), **arisan** (ID), **paluwagan** (PH), **hui** (CN, VN, TH), **kye** (KR), **tanomoshi** (JP), **tanda / cundina** (MX, Central America), **sol** (HT), **san** (DO), **gün** (TR). Sources: https://en.wikipedia.org/wiki/Rotating_savings_and_credit_association, https://en.wikipedia.org/wiki/Sou-sou
- Three payout mechanisms: fixed order, lottery each round, or **bid/auction** (a member accepts a discount to take the pot early). Kenyan ROSCAs: ~71% fixed, 29% random. Source: https://www.philadelphiafed.org/-/media/frbp/assets/community-development/discussion-papers/discussionpaper-ROSCAs.pdf
- Indian chit funds: the winning bid's discount pays the foreman's commission and the rest is a **dividend** shared by all members, which lowers that round's instalment. Discount capped at 40% of chit value. Sources: https://prsindia.org/theprsblog/chit-funds-q-a, https://financialservices.gov.in/beta/sites/default/files/2022-10/4.%20THE%20CHIT%20FUNDS%20ACT,%201982.pdf
- Stokvel apps (Stoki, StokFella) track contributions and payouts; founders note low financial literacy among older members, so the UI must stay simple. Sources: https://apps.apple.com/ar/app/stoki/id6757810060, https://personal.nedbank.co.za/learn/blog/stokvel-options.html

**VaultCap today:** BC module with ballot/fixed/bid types, members, contribution, my-turn round. **Gap:** labelled only as Pakistani "BC"; no bid discount / dividend / organiser fee maths.

### 1.2 Remittances
- World Bank Remittance Prices Worldwide: global average cost of sending USD 200 ≈ **6.49% (Q1 2025)**; Sub-Saharan Africa ≈ 8.8%. SDG 10.c target: **below 3%**, no corridor above 5% by 2030. Sources: https://remittanceprices.worldbank.org, https://sdg.data.gov/10-c-1
- True cost = fee + FX margin, where margin = (mid-market × sent − received) / (mid-market × sent). Banks typically add 1–5% over mid-market. Source: https://wise.com/gb/blog/mid-market-rate
- Hawala/hundi flows leave no official receipt trail; users must keep their own. Source: https://www.imf.org/external/pubs/nft/op/222

**Gap:** nothing in VaultCap records transfers or their real cost.

### 1.3 Mobile money and instant-payment handles
- GSMA: 2.3 billion registered mobile-money accounts (2025), >$2 trillion transacted. Source: https://www.gsma.com/sotir/
- Identifiers people need to keep and share: **Pix** keys (CPF/CNPJ, phone, email, random key; up to 5 per account — https://bcb.gov.br/en/financialstability/pix_en), **UPI** VPA `name@handle` (https://razorpay.com/learn/what-is-virtual-payment-address-vpa/), **PayNow** proxy (mobile, NRIC/FIN, UEN — https://www.dpi.global/globaldpi/singapore_paynow), **Raast** ID = mobile linked to IBAN (https://www.bankalfalah.com/personal-banking/digital-banking/raast/), **M-Pesa** Paybill + account / Till / phone (https://www.safaricom.co.ke/images/Downloads/Mpesa-paybill-guide.pdf), plus PromptPay, DuitNow, QRIS, SPEI CLABE (18 digits), Bizum, Swish, MobilePay, Interac, Zelle, Venmo, bKash, JazzCash, Easypaisa, GCash, Maya, MTN MoMo, Airtel Money, Orange Money, Alipay, WeChat Pay.

**Gap:** no place to store these handles; heirs can't find orphaned wallets.

### 1.4 Multi-currency, cash-heavy and high-inflation households
- Parallel rates are normal in AR (official/blue/MEP/CCL), LB ("lollars"), NG, EG, ZW. Sources: https://buenosairesherald.com/economics/dollar-peso/all-argentinas-dollar-exchange-rates-explained, https://www.aljazeera.com/economy/2020/4/21/lebanon-depositors-to-get-market-rate-dollars-in-local-currency
- Zimbabwe: ZiG devalued 43% in Sept 2024; USD still ~80% of transactions. Source: https://www.aljazeera.com/news/2024/10/24/zimbabwes-gold-backed-currency-loses-half-its-value-why-and-whats-next
- Envelope budgeting with manual entry suits offline apps (Goodbudget). Source: https://www.nerdwallet.com/blog/finance/goodbudget-app-review

**VaultCap today:** per-item currency, live/offline FX, manual rate override field (which conversions ignored until this change). **Gap:** rates were quoted only against PKR.

---

## 2. Giving, tax and pensions

### 2.1 Religious and charitable giving
| Tradition | Rule | Base |
|---|---|---|
| Zakat | 2.5% of zakatable wealth held a lunar year | above nisab (85 g gold / 595 g silver) — VaultCap has a calculator |
| Zakat al-fitr / fitrana | per household member, before Eid prayer | local per-head rate |
| Sadaqah | voluntary | — |
| Christian tithe | 10% | gross or net (debated) |
| Jewish ma'aser kesafim / tzedakah | 10% (up to 20%) | net income |
| Sikh dasvandh | 10% | earnings |
| Hindu / Buddhist dana | voluntary, sometimes 1/10 | — |
| Bahá'í Huqúqu'lláh | 19% | surplus wealth above 19 mithqal of gold |

Tax relief for donations: UK Gift Aid (charity reclaims 25%; https://www.gov.uk/donating-to-charity/gift-aid), US itemised deduction / new $1,000 non-itemiser deduction from 2026 (https://www.irs.gov/charities-non-profits/charitable-contribution-deductions), India 80G (old regime only; https://incometaxindia.gov.in), Canada credit 15%/29–33%, Singapore 250% for IPC gifts.

### 2.2 Personal income tax (country presets)
Tables shipped as presets in `js/modules/tax-presets.js` (resident, single, as stated). Each preset carries its tax year, source URL and a `verify` flag where the research could not confirm a figure.

| Country | Year | Allowance / notes | Source |
|---|---|---|---|
| United States (federal) | 2025 | std deduction $15,750; states & FICA extra | https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2025 |
| United Kingdom | 2025/26 | £12,570 PA, tapered over £100k | https://www.gov.uk/income-tax-rates |
| Canada (federal) | 2025 | BPA $16,129 credit; provinces extra | https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/canadian-income-tax-rates-individuals-current-previous-years.html |
| Australia | 2025-26 | $18,200 tax-free; Medicare 2% | https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents |
| India (new regime) | FY 2025-26 | ₹75k std deduction, 87A rebate ≤ ₹12 L, 4% cess | https://incometaxindia.gov.in |
| Pakistan (salaried) | 2025-26 | upper bands **verify** | https://www.fbr.gov.pk |
| Nigeria (NTA 2025) | 2026 | ₦800k zero band; 23% band **verify** | https://taxsummaries.pwc.com/nigeria/individual/taxes-on-personal-income |
| Kenya (PAYE, annualised) | 2025 | personal relief KES 2,400/month | https://www.kra.go.ke/individual/filing-paying/types-of-taxes/paye |
| South Africa | 2025/26 | primary rebate R17,235 | https://www.sars.gov.za/tax-rates/income-tax/rates-of-tax-for-individuals/ |
| Brazil (IRPF, annualised monthly table) | 2025 | from May 2025 | https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas/2025 |
| Mexico (ISR annual) | 2025 | Anexo 8 RMF | https://www.sat.gob.mx |
| Indonesia (PPh 21) | 2025 | PTKP Rp54 M single | https://www.pajak.go.id |
| Philippines (TRAIN) | 2023+ | ₱250k zero band | https://www.bir.gov.ph/income-tax |
| Bangladesh | FY 2025-26 | Tk 350k threshold; top bands **verify** | https://nbr.gov.bd |
| Egypt | 2024+ | high-income band clawback not modelled; **verify** | https://taxsummaries.pwc.com/egypt/individual/taxes-on-personal-income |
| Japan (national) | 2025 | ¥580k basic deduction; +2.1% surtax; resident tax ~10% extra | https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm |
| Singapore | YA 2025 | chargeable income | https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-residency-and-tax-rates/individual-income-tax-rates |
| Malaysia | YA 2025 | RM9,000 self relief | https://www.hasil.gov.my/en/individual/individual-life-cycle/how-to-declare-income/tax-rate/ |
| Turkey (wages) | 2025 | | https://www.gib.gov.tr |
| Spain (state + avg regional, approx.) | 2025 | €5,550 personal minimum; regions differ | https://sede.agenciatributaria.gob.es |
| Italy (IRPEF) | 2025 | regional/municipal surcharges extra | https://www.agenziaentrate.gov.it/portale/web/guest/irpef-aliquote |
| Netherlands (box 1, < AOW age) | 2025 | tax credits not modelled | https://www.belastingdienst.nl |
| New Zealand | from 31 Jul 2024 | no tax-free band | https://www.ird.govt.nz/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/tax-rates-for-individuals |
| Germany (approx. of §32a formula) | 2025 | €12,096 Grundfreibetrag; progressive zones approximated | https://www.gesetze-im-internet.de/estg/__32a.html |
| France (barème per part, 1 part) | 2025 | quotient familial not modelled | https://www.service-public.fr/particuliers/vosdroits/F1419 |
| Saudi Arabia / UAE / Qatar / Kuwait / Bahrain / Oman | — | no personal income tax on salary | — |

Every other country: the **custom bracket editor** (any currency, any number of bands, saved per country in the encrypted vault).

### 2.3 Pensions and retirement (for a later pension record)
Common fields: scheme, provider, member number, employer, employee % / employer %, balance + as-of date, nominee(s). Country identifiers: US 401(k)/IRA/SSA record; UK NI qualifying years (35 for full State Pension £230.25/wk 2025/26); Canada RRSP/TFSA room, CPP; Australia super fund USI, SG 12% from Jul 2025; India EPF UAN / PPF / NPS PRAN; Pakistan EOBI / VPS; Singapore CPF OA/SA/MA/RA; Malaysia EPF/KWSP; Hong Kong MPF; Nigeria RSA PIN; Kenya NSSF; South Africa two-pot; Japan kiso nenkin bangō / iDeCo / NISA; Gulf end-of-service gratuity (UAE: 21 days' basic pay per year for years 1–5, 30 after, capped at 2 years' pay). Sources in the tax-research pass; key: https://www.gov.uk/new-state-pension, https://www.cpf.gov.sg, https://www.ato.gov.au/individuals-and-families/super-for-individuals, https://u.ae/en/information-and-services/jobs/employment-in-the-private-sector/end-of-service-benefits-for-employees-in-the-private-sector

---

## 3. Identity documents per country

Soft validation (warn, never block) — public check algorithms:

| Document | Format | Check |
|---|---|---|
| Any passport / MRZ ID | ICAO 9303 | 7-3-1 mod 10 (https://www.icao.int/publications/Documents/9303_p3_cons_en.pdf) |
| India Aadhaar | 12 digits, first 2–9 | Verhoeff (https://uidai.gov.in) |
| India PAN | AAAAA9999A | format only |
| Pakistan CNIC / NICOP | 99999-9999999-9 | format only (https://www.nadra.gov.pk) |
| South Africa ID | 13 digits | Luhn (http://www.dha.gov.za) |
| Canada SIN | 9 digits | Luhn; leading 9 = temporary, set reminder |
| UAE Emirates ID | 784-YYYY-NNNNNNN-C | Luhn (community-documented) |
| Saudi ID / Iqama | 10 digits, 1 = citizen, 2 = resident | Luhn (community-documented) |
| Brazil CPF | 11 digits | two mod-11 digits (https://www.gov.br/receitafederal) |
| Argentina CUIL/CUIT | 11 digits | weighted mod 11 |
| Turkey TC Kimlik | 11 digits | two check digits (https://www.nvi.gov.tr) |
| Singapore NRIC/FIN | S/T/F/G + 7 digits + letter | weighted mod 11 letter; M-series format only |
| Spain DNI / NIE | 8 digits + letter; X/Y/Z + 7 + letter | mod 23 letter |
| China resident ID | 17 digits + digit/X | ISO 7064 MOD 11-2 |
| Japan My Number | 12 digits | mod 11 (https://www.digital.go.jp) |
| Australia TFN | 9 digits | weighted mod 11 |
| US SSN | AAA-GG-SSSS | structural rules only (https://www.ssa.gov/employer/randomization.html) |
| UK NI number | AA999999A | prefix rules (https://www.gov.uk/hmrc-internal-manuals/national-insurance-manual/nim39110) |
| Nigeria NIN / BVN, Indonesia NIK, Malaysia MyKad, Egypt NID, Bangladesh NID | fixed digit counts | format only |

Reference corpus: https://arthurdejong.org/python-stdnum/formats. Renewal facts worth reminders: UK BRPs replaced by eVisas (2025), US REAL ID enforced from 7 May 2025, passports usually need 6 months' validity to travel → remind ~9 months ahead.

---

## 4. Inheritance and emergency access
- Apple Legacy Contact (access key + death certificate; https://support.apple.com/en-us/102631), Google Inactive Account Manager (3–18 months; https://support.google.com/accounts/answer/3036546), Bitwarden/LastPass emergency access with wait period (https://bitwarden.com/help/emergency-access/), 1Password Emergency Kit (https://support.1password.com/emergency-kit/).
- Without a server, the honest options are: **Shamir split** of a recovery key (2-of-3) printed as QR cards (audited library: https://github.com/privy-io/shamir-secret-sharing), an **encrypted ICE export**, and **local check-in reminders**. A true time-lock needs a third party.
- Executor checklist: will location, executors/guardians, accounts, insurance, property, debts, subscriptions to cancel, digital accounts and 2FA devices, tax IDs, funeral and religious wishes. Model: https://www.gov.uk/after-a-death/organisations-you-need-to-contact-and-tell-us-once
- Islamic farāʾiḍ shares and civil-law forced heirship (France réserve, Spain legítima, Germany Pflichtteil; EU Regulation 650/2012 https://eur-lex.europa.eu/eli/reg/2012/650/oj) — informational only, with disclaimer.

## 5. Dates, numbers, calendars
- `Intl.DateTimeFormat` with `-u-ca-` supports islamic-umalqura, islamic-civil, persian, hebrew, buddhist, ethiopic, indian, chinese, japanese, coptic, roc in all three engines; feature-detect with `Intl.supportedValuesOf('calendar')` (Safari 15.4+). Plain `islamic` is deprecated. Offer a ±2-day Hijri adjustment for local moon sighting. Sources: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/supportedValuesOf, https://tc39.es/proposal-intl-era-monthcode/
- Numbering systems via `-u-nu-` (arab, arabext, deva, beng, thai); normalise native digits on input. Lakh/crore grouping via en-IN.
- Week start / weekend via `Intl.Locale#getWeekInfo` (Safari 17+, Chrome 130+); weekend Fri–Sat in SA/AE/EG/BD.
- Personal tax years: UK 6 Apr; IN, NZ 1 Apr; AU, PK, BD 1 Jul; IR ~21 Mar; NP ~16 Jul; ET ~8 Jul; most others 1 Jan. Source: https://en.wikipedia.org/wiki/Fiscal_year

## 6. Right-to-left
`dir` from locale, CSS logical properties, `dir="auto"` on user text, `<bdi>`/`dir="ltr"` for IBANs, IDs and amounts, mirror only directional icons. Sources: https://www.w3.org/International/questions/qa-html-dir, https://www.w3.org/International/articles/inline-bidi-markup/, https://m2.material.io/design/usability/bidirectionality.html

## 7. Accessibility (WCAG 2.2 AA)
New criteria: 2.4.11 focus not obscured, 2.5.7 dragging alternatives, 2.5.8 target size ≥ 24 px (VaultCap keeps 44 pt), 3.3.7 redundant entry, 3.2.6 consistent help, **3.3.8 accessible authentication** (PIN recall needs a supporting mechanism: paste/autofill or biometrics). Sources: https://www.w3.org/TR/WCAG22/, https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum. Also prefers-reduced-motion, prefers-contrast, forced-colors, Dynamic Type via rem.

## 8. Offline and low bandwidth
- Storage durability is the top risk for a local-first vault: call `navigator.storage.persist()`, show `estimate()`; Safari evicts script storage after 7 days without interaction for non-installed sites (https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/).
- `navigator.connection.saveData` (Chromium only) plus a manual Lite mode; keep critical JS small (https://infrequently.org/2024/01/performance-inequality-gap-2024/). KaiOS needs ES5 + D-pad — defer.

## 9. Competitor landscape (gaps only)
Most-marketed features VaultCap lacks or only partly has: subscriptions with trial-end/price-history/cancel letters (Emma https://emma-app.com/subscriptions, Finanzguru https://apps.apple.com/DE/app/id1214803607), insurance register (Trustworthy https://trustworthy.com/features), emergency medical ID (Apple https://support.apple.com/105072), goals/sinking funds (Monzo Pots https://monzo.com/features/pots, Monarch https://www.monarch.com/features/tracking), cash-flow forecast (PocketSmith https://www.pocketsmith.com/tour/cash-flow-forecasts/), debt payoff planner (YNAB https://www.ynab.com/whats-new/introducing-ynabs-loan-planner), bank CSV/OFX presets (Actual https://actualbudget.org/), travel mode (1Password https://support.1password.com/travel-mode/), group splits (Splitwise).

---

## 10. Ranked shortlist (impact × effort, fits local-first)

| # | Feature | Impact | Effort | Status |
|---|---|---|---|---|
| 1 | **Country-neutral tax**: 25 researched presets + no-PIT Gulf + custom bracket editor for every other country | Very high | M | **Shipped** |
| 2 | **Currency page in the display currency**, world list, search, manual rates used app-wide | Very high | S | **Shipped** |
| 3 | **Payment handles** (UPI, Pix, PayNow, Raast, M-Pesa, mobile wallets…) with copy, linked bank, search, emergency view | High | S | **Shipped** |
| 4 | **Remittance log** with true cost % (fee + FX margin) and SDG 3% / 6.5% world-average badges | High | M | **Shipped** |
| 5 | **Giving tracker** (sadaqah, fitrana, tithe, ma'aser, dasvandh, dana, Huqúq, general) with % pledges, tax-relief flag, yearly totals | High | M | **Shipped** |
| 6 | **Savings circles worldwide**: BC renamed by region (tontine, tanda, susu, chit, stokvel…) + bid discount / organiser fee / dividend maths | High | S | **Shipped** |
| 7 | **Soft ID-number checks** (MRZ, Luhn, Verhoeff, CPF, TCKN, NRIC, DNI/NIE, China ID, My Number, TFN, CUIT, SSN, NI) | High | S | **Shipped** |
| 8 | **Second calendar** (Hijri Umm al-Qura/civil, Persian, Hebrew, Buddhist, Ethiopic, Indian, Chinese…) with Hijri day offset, shown on reminders | High | S | **Shipped** |
| 9 | **Persistent storage request** + status in Settings | Very high | S | **Shipped** |
| 10 | Insurance register + emergency medical ID card | High | S–M | Next |
| 11 | Shamir 2-of-3 recovery cards + ICE pack | Very high | M | Next |
| 12 | Subscriptions with trial-end / price history / cancel letter | High | S–M | Next |
| 13 | RTL layout pass (Arabic, Urdu, Persian, Hebrew) — needs translations first | High | M–L | Later |
| 14 | Pension records with country templates + Gulf gratuity calculator | Medium | M | Later |
| 15 | Goals / sinking funds, cash-flow forecast, debt payoff planner | Medium | M | Later |
| 16 | Named parallel rate sets, inflation-adjusted view | Medium | M–L | Later |
| 17 | Bank CSV/OFX presets and rules | Medium | M | Later |
