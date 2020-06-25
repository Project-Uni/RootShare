var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var messageSchema = new Schema({
  conversationID: {
    type: Schema.ObjectId,
    ref: "conversations",
    required: true,
  },
  sender: { type: Schema.ObjectId, ref: "users", required: true },
  content: { type: String, required: true },
  timeCreated: { type: Date, required: true },
});

mongoose.model("messages", messageSchema);
