const mongoose = require('mongoose');
const { Schema } = mongoose;

const ExternalCommunicationSchema = new Schema(
  {
    mode: { type: String, required: true },
    user: { type: Schema.ObjectId, ref: 'users' },
    community: { type: Schema.ObjectId, ref: 'communities' },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

mongoose.model('external_communications', ExternalCommunicationSchema);
const ExternalCommunication = mongoose.model('external_communications');

export default ExternalCommunication;
