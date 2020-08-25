import mongoose = require('mongoose');
const { Schema, Types } = mongoose;

var conversationSchema = new Schema(
  {
    participants: [{ type: Types.ObjectId, ref: 'users', required: true }],
    lastMessage: { type: Types.ObjectId, ref: 'messages' },
  },
  { timestamps: true }
);

mongoose.model('conversations', conversationSchema);
const Conversation = mongoose.model('conversations');

export default Conversation;
