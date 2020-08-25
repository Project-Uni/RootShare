import mongoose = require('mongoose');
const { Schema, Types } = mongoose;

var connectionSchema = new Schema(
  {
    from: { type: Types.ObjectId, ref: 'users' },
    to: { type: Types.ObjectId, ref: 'users' },
    accepted: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

mongoose.model('connections', connectionSchema);
const Connection = mongoose.model('connections');

export default Connection;
