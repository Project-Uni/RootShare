var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var connectionRequestSchema = new Schema(
  {
    from: { type: Schema.ObjectId, ref: 'users' },
    to: { type: Schema.ObjectId, ref: 'users' },
  },
  { timestamps: true }
);

mongoose.model('connectionRequests', connectionRequestSchema);
