import mongoose = require('mongoose');
const { Schema, Types } = mongoose;

var universitySchema = new Schema({
  universityName: { type: String, required: true },
  departments: { type: Array, required: true },
  communities: {
    type: [{ type: Types.ObjectId, ref: 'communities' }],
    required: true,
    default: [],
    message: 'Communities are required, use default []',
  },
  imageRef: String,
});

mongoose.model('universities', universitySchema);
const University = mongoose.model('universities');

export default University;
