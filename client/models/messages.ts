import mongoose = require('mongoose');
const { Schema, Types } = mongoose;

var messageSchema = new Schema(
  {
    conversationID: {
      type: Types.ObjectId,
      ref: 'conversations',
      required: true,
    },
    senderName: { type: String, required: true },
    sender: { type: Types.ObjectId, ref: 'users', required: true },
    content: { type: String, required: true },
    likes: [{ type: Types.ObjectId, ref: 'users' }],
  },
  { timestamps: true }
);

mongoose.model('messages', messageSchema);
const Message = mongoose.model('messages');

export default Message;
