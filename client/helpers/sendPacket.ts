const sendPacket = (success: Number, message: String, content: Object = {}) => {
  return { success: success, message: message, content: content };
};

export default sendPacket;
