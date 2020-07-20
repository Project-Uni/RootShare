var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var conversationSchema = new Schema(
  {
    participants: [{ type: Schema.ObjectId, ref: 'users', required: true }],
    lastMessage: { type: Schema.ObjectId, ref: 'messages' },
  },
  { timestamps: true }
);

mongoose.model('conversations', conversationSchema);
