export function capitalizeFirstLetter(word: string) {
  if (!word) return '';
  return word.replace(/^./, word[0].toUpperCase());
}

export function cropText(text: string, maxLength: number) {
  if (!text || !maxLength) return '';

  return text.length < maxLength ? text : `${text.substring(0, maxLength)}...`;
}

export function getInitials(primaryName?: string, secondaryName?: string) {
  if (!primaryName || primaryName.length === 0) return '';
  let output = primaryName[0].toUpperCase();

  if (!secondaryName || secondaryName.length === 0) return output;

  return output.concat(secondaryName[0].toUpperCase());
}
