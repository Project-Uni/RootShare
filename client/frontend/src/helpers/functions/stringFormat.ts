export function capitalizeFirstLetter(word: string) {
  return word.replace(/^./, word[0].toUpperCase());
}

export function cropText(text: string, maxLength: number) {
  if (!text || !maxLength) return '';

  return text.length < maxLength ? text : `${text.substring(0, maxLength)}...`;
}
