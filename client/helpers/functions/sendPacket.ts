export function sendPacket(
  success: number,
  message: string,
  content: { [key: string]: any } = {}
) {
  return { success: success, message: message, content: content };
}
