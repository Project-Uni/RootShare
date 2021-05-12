export function formatPhoneNumber(pn: string) {
  if (!pn) return '';
  if (pn.length < 10 || pn.length > 11) return pn;
  if (pn.length === 10)
    return `(${pn.substr(0, 3)}) ${pn.substr(3, 3)}-${pn.substr(6, 4)}`;
  return `+${pn.charAt(0)} (${pn.substr(1, 3)}) ${pn.substr(4, 3)}-${pn.substr(
    7,
    4
  )}`;
}
