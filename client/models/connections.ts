var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var connectionSchema = new Schema(
  {
    from: { type: Schema.ObjectId, ref: 'users' },
    to: { type: Schema.ObjectId, ref: 'users' },
    accepted: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

mongoose.model('connections', connectionSchema);
const Connection = mongoose.model('connections');

export default Connection;
