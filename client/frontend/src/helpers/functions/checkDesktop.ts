export function checkDesktop() {
  if (
    /Android|webOS|iPhone|iPad|iPod|Mobile|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(
      navigator.userAgent
    )
  ) {
    return false;
  }
  return true;
}