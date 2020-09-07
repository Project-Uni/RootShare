export function capitalizeFirstLetter(word: string) {
  return word.replace(/^./, word[0].toUpperCase());
}

export function cropText(text: string, maxLength: number) {
  if (text.length < maxLength) return text;
  else return `${text.substring(0, maxLength)}...`;
}
