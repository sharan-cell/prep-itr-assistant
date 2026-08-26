/**
 * Formats a number in the Indian numbering system (Lakhs and Crores).
 * Example: 850000 -> ₹ 8,50,000
 */
export function formatINR(amount: number | undefined | null, includeSymbol: boolean = true): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return includeSymbol ? '₹ 0' : '0';
  }

  const isNegative = amount < 0;
  const absAmount = Math.round(Math.abs(amount));
  const str = absAmount.toString();

  let formatted = '';
  if (str.length <= 3) {
    formatted = str;
  } else {
    // Last 3 digits
    const lastThree = str.substring(str.length - 3);
    // Other digits grouped by 2
    const otherDigits = str.substring(0, str.length - 3);
    const withCommas = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    formatted = `${withCommas},${lastThree}`;
  }

  const prefix = isNegative ? '- ' : '';
  return includeSymbol ? `${prefix}₹ ${formatted}` : `${prefix}${formatted}`;
}

/**
 * Formats large amounts in Lakhs and Crores text format
 * Example: 1250000 -> ₹ 12.50 Lakhs
 */
export function formatINRLakhsCrores(amount: number): string {
  if (isNaN(amount) || amount === 0) return '₹ 0';

  const abs = Math.abs(amount);
  const prefix = amount < 0 ? '-' : '';

  if (abs >= 10000000) {
    const cr = (abs / 10000000).toFixed(2);
    return `${prefix}₹ ${cr} Cr`;
  }
  if (abs >= 100000) {
    const lk = (abs / 100000).toFixed(2);
    return `${prefix}₹ ${lk} Lakhs`;
  }
  return formatINR(amount);
}

/**
 * Converts numbers to Indian currency words representation
 */
export function numberToIndianWords(num: number): string {
  if (isNaN(num) || num === 0) return 'Zero Rupees';

  const abs = Math.abs(Math.round(num));
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertTwoDigits(n: number): string {
    if (n < 20) return ones[n];
    const rem = n % 10;
    return tens[Math.floor(n / 10)] + (rem > 0 ? ' ' + ones[rem] : '');
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rem = n % 100;
    let res = '';
    if (hundred > 0) {
      res += ones[hundred] + ' Hundred';
    }
    if (rem > 0) {
      res += (res ? ' and ' : '') + convertTwoDigits(rem);
    }
    return res;
  }

  let words = '';
  const crore = Math.floor(abs / 10000000);
  let rem = abs % 10000000;
  const lakh = Math.floor(rem / 100000);
  rem = rem % 100000;
  const thousand = Math.floor(rem / 1000);
  rem = rem % 1000;

  if (crore > 0) words += convertTwoDigits(crore) + ' Crore ';
  if (lakh > 0) words += convertTwoDigits(lakh) + ' Lakh ';
  if (thousand > 0) words += convertTwoDigits(thousand) + ' Thousand ';
  if (rem > 0) words += convertThreeDigits(rem);

  return `${words.trim()} Rupees`;
}

export function parseNumericInput(val: string | number): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : Math.max(0, val);
  const clean = val.replace(/[^0-9.]/g, '');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : Math.max(0, num);
}
