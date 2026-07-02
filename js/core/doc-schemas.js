'use strict';
/* doc-schemas — DOC_SCHEMAS, DOC_TYPES
   user-context — getUserContext(), __vos_confirm(), __vos_confirmTyped(), _vaultEntityCount() */

const DOC_SCHEMAS = {
  passport:{
    label:'Passport',ic:'id-card',
    fields:[
      {id:'docNumber',label:'Passport Number',ph:'e.g. AB1234567'},
      {id:'issuingCountry',label:'Issuing Country',ph:'e.g. United Kingdom'},
      {id:'nationality',label:'Nationality',ph:'e.g. British'},
      {id:'holderName',label:'Full Name (as printed)',ph:'Full name on passport'},
      {id:'dob',label:'Date of Birth',type:'date'},
      {id:'issueDate',label:'Issue Date',type:'date'},
      {id:'expiryDate',label:'Expiry Date',type:'date'},
      {id:'issuingAuthority',label:'Issuing Authority',ph:'Passport Office'},
      {id:'mrzLine',label:'MRZ Line (optional)',ph:'Machine readable zone line 1'},
      {id:'storageLocation',label:'Physical Storage',ph:'Safe, drawer, wallet...'},
    ]
  },
  nic:{
    label:'National ID',ic:'id-card',
    fields:[
      {id:'docNumber',label:'ID Number',ph:'National ID number'},
      {id:'issuingCountry',label:'Issuing Country',ph:'Issuing country'},
      {id:'holderName',label:'Full Name',ph:'Name on document'},
      {id:'dob',label:'Date of Birth',type:'date'},
      {id:'issueDate',label:'Issue Date',type:'date'},
      {id:'expiryDate',label:'Expiry Date',type:'date'},
      {id:'storageLocation',label:'Storage Location',ph:'Wallet, safe...'},
    ]
  },
  driving_license:{
    label:'Driving Licence',ic:'car',
    fields:[
      {id:'docNumber',label:'Licence Number',ph:'Driving licence number'},
      {id:'issuingCountry',label:'Issuing Country',ph:'Country'},
      {id:'holderName',label:'Full Name',ph:'Name on licence'},
      {id:'dob',label:'Date of Birth',type:'date'},
      {id:'issueDate',label:'Issue Date',type:'date'},
      {id:'expiryDate',label:'Expiry Date',type:'date'},
      {id:'vehicleCategories',label:'Categories',ph:'B, C, D...'},
      {id:'storageLocation',label:'Storage',ph:'Wallet, glove box...'},
    ]
  },
  visa:{
    label:'Visa / Entry Permit',ic:'arrows',
    fields:[
      {id:'docNumber',label:'Visa Number',ph:'Visa reference number'},
      {id:'visaType',label:'Visa Type',ph:'Tourist, Work, Student, ILR...',list:'Student,Work/Skilled Worker,Tourist,Family/Spouse,Student,Indefinite Leave to Remain,Business,Transit,Investor'},
      {id:'issuingCountry',label:'Issuing Country',ph:'Country that issued visa'},
      {id:'holderName',label:'Holder Name',ph:'Full name'},
      {id:'issueDate',label:'Issue Date',type:'date'},
      {id:'expiryDate',label:'Expiry Date',type:'date'},
      {id:'validEntries',label:'Entry Type',ph:'Single, Multiple, Multiple (2 years)...'},
      {id:'linkedPassportNum',label:'Linked Passport No.',ph:'Passport this visa is in'},
      {id:'storageLocation',label:'Storage',ph:'In passport, safe...'},
    ]
  },
  property_doc:{
    label:'Property Document',ic:'building',
    fields:[
      {id:'docSubType',label:'Document Type',ph:'Title deed, Sale agreement, Mortgage docs...',list:'Title Deed,Sale Agreement,Mortgage Documents,Property Survey,Planning Permission,Lease Agreement,Building Certificate,Insurance Policy'},
      {id:'propertyRef',label:'Property / Address',ph:'Which property does this relate to?'},
      {id:'ownerName',label:'Owner Name',ph:'Registered owner(s)'},
      {id:'plotNumber',label:'Plot / Unit Number',ph:'Plot or unit reference'},
      {id:'handoverDate',label:'Handover Date',type:'date'},
      {id:'developer',label:'Developer / Seller',ph:'Developer or seller name'},
      {id:'registrationRef',label:'Registration / Registry Ref',ph:'Land registry or title ref'},
      {id:'issueDate',label:'Document Date',type:'date'},
      {id:'expiryDate',label:'Expiry Date (if applicable)',type:'date'},
      {id:'storageLocation',label:'Storage',ph:'Safe, solicitor, bank...'},
    ]
  },
  insurance_doc:{
    label:'Insurance Document',ic:'shield',
    fields:[
      {id:'docSubType',label:'Insurance Type',ph:'Health, Auto, Home, Life...',list:'Health,Auto/Car,Home,Life,Travel,Business,Pet,Gadget'},
      {id:'policyNumber',label:'Policy Number',ph:'Policy reference'},
      {id:'provider',label:'Insurance Provider',ph:'Company name'},
      {id:'holderName',label:'Policy Holder',ph:'Name on policy'},
      {id:'beneficiary',label:'Beneficiary',ph:'Who benefits'},
      {id:'coverAmount',label:'Cover Amount',ph:'e.g. 250000'},
      {id:'premium',label:'Premium (per period)',ph:'Monthly or annual premium'},
      {id:'issueDate',label:'Start Date',type:'date'},
      {id:'expiryDate',label:'Renewal Date',type:'date'},
      {id:'storageLocation',label:'Storage',ph:'Email, safe, broker...'},
    ]
  },
  vehicle_reg:{
    label:'Vehicle Registration',ic:'car',
    fields:[
      {id:'regNumber',label:'Registration / Plate No.',ph:'e.g. ABC-1234'},
      {id:'vehicleMake',label:'Make / Brand',ph:'Toyota, BMW, Mercedes...'},
      {id:'vehicleModel',label:'Model',ph:'Corolla, 3 Series...'},
      {id:'vin',label:'VIN / Chassis Number',ph:'17-character VIN'},
      {id:'ownerName',label:'Registered Owner',ph:'Owner name'},
      {id:'issueDate',label:'Registration Date',type:'date'},
      {id:'expiryDate',label:'Expiry / Renewal Date',type:'date'},
      {id:'issuingAuthority',label:'Issuing Authority',ph:'DVLA, RTA, MTMIS...'},
      {id:'storageLocation',label:'Storage',ph:'Glove box, safe...'},
    ]
  },
  tax:{
    label:'Tax Document',ic:'receipt',
    fields:[
      {id:'docSubType',label:'Tax Doc Type',ph:'Tax Return, Tax Certificate, VAT Reg...',list:'Income Tax Return,Tax Certificate,VAT Registration,NTN Certificate,Tax Clearance,CNIC Tax Filing,Corporate Tax'},
      {id:'taxYear',label:'Tax Year / Period',ph:'e.g. 2023-24'},
      {id:'referenceNum',label:'Reference Number',ph:'Tax reference or UTR'},
      {id:'issuingAuthority',label:'Issuing Authority',ph:'HMRC, FBR, IRS...'},
      {id:'holderName',label:'Taxpayer Name',ph:'Your name or company'},
      {id:'issueDate',label:'Issue / Filing Date',type:'date'},
      {id:'expiryDate',label:'Expiry (if applicable)',type:'date'},
      {id:'storageLocation',label:'Storage',ph:'Accountant, cloud, safe...'},
    ]
  },
  medical:{
    label:'Medical Record',ic:'cross',
    fields:[
      {id:'docSubType',label:'Record Type',ph:'Prescription, Test Result, Vaccination...',list:'Prescription,Test Results,Vaccination Record,Medical Report,Discharge Summary,Dental Records,Blood Type Card,Allergy Info'},
      {id:'holderName',label:'Patient Name',ph:'Patient name'},
      {id:'doctor',label:'Doctor / Hospital',ph:'Name of doctor or hospital'},
      {id:'issueDate',label:'Date',type:'date'},
      {id:'expiryDate',label:'Valid Until (if applicable)',type:'date'},
      {id:'notes',label:'Notes',ph:'Brief description of document',multi:true},
      {id:'storageLocation',label:'Storage',ph:'Physical or digital location'},
    ]
  },
  warranty:{
    label:'Warranty / Receipt',ic:'receipt',
    fields:[
      {id:'productName',label:'Product Name',ph:'What is covered?'},
      {id:'serialNum',label:'Serial / Model Number',ph:'Product serial number'},
      {id:'retailer',label:'Retailer / Seller',ph:'Where purchased'},
      {id:'purchasePrice',label:'Purchase Price',ph:'Amount paid'},
      {id:'issueDate',label:'Purchase Date',type:'date'},
      {id:'expiryDate',label:'Warranty Expiry',type:'date'},
      {id:'warrantyProvider',label:'Warranty Provider',ph:'Brand or extended warranty company'},
      {id:'claimProcess',label:'How to Claim',ph:'Warranty claim process or URL'},
      {id:'storageLocation',label:'Storage',ph:'Drawer, email, safe...'},
    ]
  },
  contract:{
    label:'Contract / Agreement',ic:'book',
    fields:[
      {id:'contractTitle',label:'Contract Title',ph:'e.g. Employment Agreement, NDA...'},
      {id:'parties',label:'Parties Involved',ph:'Names of all parties'},
      {id:'issueDate',label:'Signing Date',type:'date'},
      {id:'expiryDate',label:'Expiry Date (if applicable)',type:'date'},
      {id:'keyTerms',label:'Key Terms / Summary',ph:'Brief summary of key points',multi:true},
      {id:'lawyer',label:'Lawyer / Solicitor',ph:'Legal representative'},
      {id:'storageLocation',label:'Storage',ph:'Safe, solicitor, email...'},
    ]
  },
  certificate:{
    label:'Certificate / Award',ic:'star',
    fields:[
      {id:'certTitle',label:'Certificate Name',ph:'e.g. Bachelor of Science, AWS Certified...'},
      {id:'holderName',label:'Holder Name',ph:'Your name on certificate'},
      {id:'issuingAuthority',label:'Issued By',ph:'University, company, body...'},
      {id:'issueDate',label:'Issue Date',type:'date'},
      {id:'expiryDate',label:'Expiry / Renewal',type:'date'},
      {id:'certNumber',label:'Certificate Number',ph:'Reference number (if any)'},
      {id:'storageLocation',label:'Storage',ph:'Frame, folder, cloud...'},
    ]
  },
  other:{
    label:'Other Document',ic:'file',
    fields:[
      {id:'docSubType',label:'Document Description',ph:'What is this document?'},
      {id:'holderName',label:'Related Person/Entity',ph:'Who does this relate to?'},
      {id:'referenceNum',label:'Reference Number',ph:'Any reference or ID number'},
      {id:'issueDate',label:'Date Issued',type:'date'},
      {id:'expiryDate',label:'Expiry Date',type:'date'},
      {id:'issuingAuthority',label:'Issued By',ph:'Authority or organization'},
      {id:'notes',label:'Notes',ph:'Additional details',multi:true},
      {id:'storageLocation',label:'Storage',ph:'Where is this kept?'},
    ]
  },
};

const DOC_TYPES=Object.keys(DOC_SCHEMAS);

'use strict';

// ── User context helper — derives name/country/currency from stored vault ──
function getUserContext() {
  try {
    const state = JSON.parse(localStorage.getItem('vos3') || '{}');
    const user = state.user || {};
    const currency = user.currency || 'PKR';
    const currencyToCountry = { GBP: 'GB', PKR: 'PK', AED: 'AE', USD: 'US', EUR: 'GB' };
    return {
      name: user.name || '',
      country: user.country || currencyToCountry[currency] || 'GB',
      baseCurrency: currency
    };
  } catch(e) { return { name: '', country: 'GB', baseCurrency: 'PKR' }; }
}
window.getUserContext = getUserContext;

// ── VaultCap safe confirm — works in sandboxed iframe and native ──
window.__vos_confirm = function(msg) {
  try { return window.confirm(msg); }
  catch(e) {
    console.warn('[VaultCap] confirm blocked in sandbox — treating as cancelled:', msg.slice(0, 80));
    return false;
  }
};

window.__vos_confirmTyped = function(msg, word) {
  try {
    const typed = window.prompt(msg + '\n\nType ' + word + ' to continue:');
    return typed === word;
  } catch (e) {
    return false;
  }
};

function _vaultEntityCount(data) {
  if (!data || typeof data !== 'object') return 0;
  return ['banks','cards','investments','cash','loans','documents','vehicles','assets','emails','gadgets','digital','expenses','sims'].reduce(
    (n, k) => n + (Array.isArray(data[k]) ? data[k].length : 0), 0
  );
}
