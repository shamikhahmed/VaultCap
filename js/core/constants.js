// VaultOS — © 2026 Shamikh Ahmed. Source-available. See LICENSE.
// Centralised constants — future migration target from app.js

const VAULT_VERSION = 7;
const VER = window.VER || '5.3.1';
const APP_VERSION = VER;
window.VER = VER;
const MAX_STORAGE_MB = 5;
const BACKUP_REMINDER_DAYS = 30;
const MAX_AUDIT_ENTRIES = 10;
const MAX_SEARCH_RESULTS = 50;
const PIN_MIN_LENGTH = 6;
const PIN_MAX_ATTEMPTS = 5;
/** Live VaultDB target. Legacy 310k still accepted on unlock migrate. */
const PBKDF2_ITERATIONS = 600000;
const PBKDF2_LEGACY_ITERATIONS = 310000;

const COUNTRY_CUR = { PK:'PKR', GB:'GBP', AE:'AED', US:'USD', CA:'CAD', AU:'AUD', SA:'SAR', QA:'QAR', IN:'INR', SG:'SGD', OTHER:'USD' };
window.COUNTRY_CUR = COUNTRY_CUR;
/* Any country → its own currency. Used when live FX (open.er-api, ~160 currencies) or the
   built-in fallback covers it; otherwise USD (changeable in Settings → Display Currency). */
const EURO_AREA = 'AD AT BE CY DE EE ES FI FR GR HR IE IT LT LU LV MC ME MT NL PT SI SK SM VA XK'.split(' ');
const WORLD_CUR = ('AF:AFN AL:ALL DZ:DZD AO:AOA AR:ARS AM:AMD AZ:AZN BS:BSD BH:BHD BD:BDT BB:BBD BY:BYN BZ:BZD BJ:XOF BT:BTN BO:BOB ' +
  'BA:BAM BW:BWP BR:BRL BN:BND BG:BGN BF:XOF BI:BIF KH:KHR CM:XAF CV:CVE CF:XAF TD:XAF CL:CLP CN:CNY CO:COP KM:KMF CG:XAF ' +
  'CD:CDF CR:CRC CI:XOF CU:CUP CZ:CZK DK:DKK DJ:DJF DO:DOP EC:USD EG:EGP SV:USD GQ:XAF ER:ERN ET:ETB FJ:FJD GA:XAF GM:GMD ' +
  'GE:GEL GH:GHS GT:GTQ GN:GNF GW:XOF GY:GYD HT:HTG HN:HNL HK:HKD HU:HUF IS:ISK ID:IDR IR:IRR IQ:IQD IL:ILS JM:JMD JP:JPY ' +
  'JO:JOD KZ:KZT KE:KES KW:KWD KG:KGS LA:LAK LB:LBP LS:LSL LR:LRD LY:LYD MO:MOP MG:MGA MW:MWK MY:MYR MV:MVR ML:XOF MR:MRU ' +
  'MU:MUR MX:MXN MD:MDL MN:MNT MA:MAD MZ:MZN MM:MMK NA:NAD NP:NPR NZ:NZD NI:NIO NE:XOF NG:NGN KP:KPW MK:MKD NO:NOK OM:OMR ' +
  'PA:PAB PG:PGK PY:PYG PE:PEN PH:PHP PL:PLN PR:USD RO:RON RU:RUB RW:RWF WS:WST ST:STN SN:XOF RS:RSD SC:SCR SL:SLE SB:SBD ' +
  'SO:SOS ZA:ZAR KR:KRW SS:SSP LK:LKR SD:SDG SR:SRD SE:SEK CH:CHF LI:CHF SY:SYP TW:TWD TJ:TJS TZ:TZS TH:THB TL:USD TG:XOF ' +
  'TO:TOP TT:TTD TN:TND TR:TRY TM:TMT UG:UGX UA:UAH UY:UYU UZ:UZS VU:VUV VE:VES VN:VND YE:YER ZM:ZMW ZW:USD ' +
  'AG:XCD DM:XCD GD:XCD KN:XCD LC:XCD VC:XCD MH:USD FM:USD PW:USD KI:AUD NR:AUD TV:AUD').split(' ')
  .reduce((m, p) => { const [c, v] = p.split(':'); m[c] = v; return m; }, {});
function countryCurrency(code) {
  if (!code) return 'USD';
  if (COUNTRY_CUR[code]) return COUNTRY_CUR[code];
  if (EURO_AREA.includes(code)) return 'EUR';
  const cur = WORLD_CUR[code];
  if (!cur) return 'USD';
  try {
    const fx = typeof RatesEngine !== 'undefined' && RatesEngine.getFX ? RatesEngine.getFX() : null;
    if (fx && fx[cur]) return cur;
  } catch (_) {}
  return 'USD';
}
window.countryCurrency = countryCurrency;
