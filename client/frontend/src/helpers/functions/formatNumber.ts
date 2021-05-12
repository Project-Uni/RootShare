const THOUSAND = 1000;
const MILLION = 1000 * 1000;
const BILLION = 1000 * 1000 * 1000;

export function formatLargeNumber(num: number) {
  if (!num) return '0';
  if (num > BILLION) return shapeNumber(num, BILLION, 'b');
  if (num > MILLION) return shapeNumber(num, MILLION, 'm');
  if (num > THOUSAND) return shapeNumber(num, THOUSAND, 'k');

  return num.toString();
}

function shapeNumber(num: number, divisor: number, suffix: string) {
  let shortened = (Math.trunc((num * 10) / divisor) / 10).toString();
  if (shortened.length === 5) shortened = shortened.substring(0, 3);
  return `${shortened}${suffix}`;
}
