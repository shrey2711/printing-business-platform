// Countries, dial codes and postal-code formats.
//
// The ISO 3166-1 alpha-2 codes are listed; the display names come from
// Intl.DisplayNames, so the list stays correct without shipping 250 hardcoded
// strings that would drift as names change.
//
// POSTAL holds the format for the countries we actually ship to most. A country
// without an entry accepts anything non-empty — an unknown format must not
// block a real order, and a wrong guess is worse than no check.

export const COUNTRY_CODES = [
  'AD','AE','AF','AG','AI','AL','AM','AO','AR','AS','AT','AU','AW','AX','AZ','BA','BB','BD','BE','BF',
  'BG','BH','BI','BJ','BL','BM','BN','BO','BQ','BR','BS','BT','BW','BY','BZ','CA','CD','CF','CG','CH',
  'CI','CK','CL','CM','CN','CO','CR','CU','CV','CW','CY','CZ','DE','DJ','DK','DM','DO','DZ','EC','EE',
  'EG','ER','ES','ET','FI','FJ','FK','FM','FO','FR','GA','GB','GD','GE','GF','GG','GH','GI','GL','GM',
  'GN','GP','GQ','GR','GT','GU','GW','GY','HK','HN','HR','HT','HU','ID','IE','IL','IM','IN','IQ','IR',
  'IS','IT','JE','JM','JO','JP','KE','KG','KH','KI','KM','KN','KP','KR','KW','KY','KZ','LA','LB','LC',
  'LI','LK','LR','LS','LT','LU','LV','LY','MA','MC','MD','ME','MF','MG','MH','MK','ML','MM','MN','MO',
  'MP','MQ','MR','MS','MT','MU','MV','MW','MX','MY','MZ','NA','NC','NE','NF','NG','NI','NL','NO','NP',
  'NR','NU','NZ','OM','PA','PE','PF','PG','PH','PK','PL','PM','PR','PS','PT','PW','PY','QA','RE','RO',
  'RS','RU','RW','SA','SB','SC','SD','SE','SG','SI','SK','SL','SM','SN','SO','SR','SS','ST','SV','SX',
  'SY','SZ','TC','TD','TG','TH','TJ','TL','TM','TN','TO','TR','TT','TV','TW','TZ','UA','UG','US','UY',
  'UZ','VA','VC','VE','VG','VI','VN','VU','WF','WS','YE','YT','ZA','ZM','ZW'
];

/** International dialling codes, for checking a number against its country. */
export const DIAL = {
  US: '1', CA: '1', GB: '44', AU: '61', NZ: '64', IE: '353', IN: '91', DE: '49', FR: '33', ES: '34',
  IT: '39', NL: '31', BE: '32', CH: '41', AT: '43', SE: '46', NO: '47', DK: '45', FI: '358', PL: '48',
  PT: '351', GR: '30', CZ: '420', HU: '36', RO: '40', MX: '52', BR: '55', AR: '54', CL: '56', CO: '57',
  ZA: '27', NG: '234', KE: '254', EG: '20', AE: '971', SA: '966', IL: '972', TR: '90', RU: '7',
  CN: '86', JP: '81', KR: '82', SG: '65', MY: '60', TH: '66', ID: '62', PH: '63', VN: '84', HK: '852',
  PK: '92', BD: '880', LK: '94', NP: '977'
};

/**
 * Postal-code formats. Deliberately incomplete: only countries whose format is
 * unambiguous and stable. A country absent from here is not validated.
 */
export const POSTAL = {
  US: { re: /^\d{5}(-\d{4})?$/, hint: '12345 or 12345-6789' },
  CA: { re: /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ ]?\d[ABCEGHJ-NPRSTV-Z]\d$/i, hint: 'K1A 0B1' },
  GB: { re: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i, hint: 'SW1A 1AA' },
  IE: { re: /^[AC-FHKNPRTV-Y]\d{2}\s?[0-9AC-FHKNPRTV-Y]{4}$/i, hint: 'D02 AF30' },
  AU: { re: /^\d{4}$/, hint: '2000' },
  NZ: { re: /^\d{4}$/, hint: '6011' },
  IN: { re: /^\d{6}$/, hint: '110001' },
  DE: { re: /^\d{5}$/, hint: '10115' },
  FR: { re: /^\d{5}$/, hint: '75001' },
  ES: { re: /^\d{5}$/, hint: '28001' },
  IT: { re: /^\d{5}$/, hint: '00184' },
  NL: { re: /^\d{4}\s?[A-Z]{2}$/i, hint: '1011 AB' },
  BE: { re: /^\d{4}$/, hint: '1000' },
  CH: { re: /^\d{4}$/, hint: '8001' },
  AT: { re: /^\d{4}$/, hint: '1010' },
  SE: { re: /^\d{3}\s?\d{2}$/, hint: '111 20' },
  NO: { re: /^\d{4}$/, hint: '0150' },
  DK: { re: /^\d{4}$/, hint: '1050' },
  FI: { re: /^\d{5}$/, hint: '00100' },
  PL: { re: /^\d{2}-\d{3}$/, hint: '00-001' },
  PT: { re: /^\d{4}-\d{3}$/, hint: '1000-001' },
  MX: { re: /^\d{5}$/, hint: '01000' },
  BR: { re: /^\d{5}-?\d{3}$/, hint: '01310-100' },
  JP: { re: /^\d{3}-?\d{4}$/, hint: '100-0001' },
  SG: { re: /^\d{6}$/, hint: '018956' },
  ZA: { re: /^\d{4}$/, hint: '0002' }
};

/** Countries that do not use postal codes at all. */
export const NO_POSTAL = new Set([
  'AE','AO','AG','AW','BS','BZ','BJ','BW','BF','BI','CM','CF','KM','CG','CD','CK','CI','DJ','DM','GQ',
  'ER','FJ','TF','GM','GH','GD','GY','HK','IE','JM','KE','KI','LY','MO','MW','ML','MR','NR','AN','NU',
  'QA','RW','KN','LC','ST','SC','SL','SB','SO','SR','SY','TZ','TL','TK','TO','TT','TV','UG','VU','YE','ZW'
]);

let displayNames = null;
function names() {
  if (displayNames === null) {
    try {
      displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
    } catch {
      displayNames = false;   // very old runtime: fall back to the code
    }
  }
  return displayNames;
}

export function countryName(code) {
  const dn = names();
  if (!dn) return code;
  try { return dn.of(code) || code; } catch { return code; }
}

/** [{ code, name }], alphabetical by name. */
export function countryOptions() {
  return COUNTRY_CODES
    .map((code) => ({ code, name: countryName(code) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
