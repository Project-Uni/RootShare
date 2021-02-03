export default function checkSpeakingTokenMatches(
  speakingTokens: string[],
  newSpeakingToken: string
) {
  if (!speakingTokens || !newSpeakingToken) return false;

  for (let i = 0; i < speakingTokens.length; i++)
    if (speakingTokens[i] === newSpeakingToken) return true;

  return false;
}
