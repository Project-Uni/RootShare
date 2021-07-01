export function capitalizeFirstLetter(word: string) {
  if (!word) return '';
  word.toLowerCase();
  return word.replace(/^./, word[0].toUpperCase());
}
