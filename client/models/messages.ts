var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var messageSchema = new Schema(
  {
    conversationID: {
      type: Schema.ObjectId,
      ref: 'conversations',
      required: true,
    },
    senderName: { type: String, required: true },
    sender: { type: Schema.ObjectId, ref: 'users', required: true },
    content: { type: String, required: true },
    likes: [{ type: Schema.ObjectId, ref: 'users' }],
  },
  { timestamps: true }
);

mongoose.model('messages', messageSchema);
const Message = mongoose.model('messages');

export default Message;
