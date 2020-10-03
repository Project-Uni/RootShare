var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var universitySchema = new Schema({
  universityName: { type: String, required: true },
  nickname: { type: String },
  departments: { type: Array, required: true, default: [] },
  communities: {
    type: [{ type: Schema.ObjectId, ref: 'communities' }],
    required: true,
    default: [],
    message: 'Communities are required, use default []',
  },
  imageRef: String,
});

mongoose.model('universities', universitySchema);
const University = mongoose.model('universities');

export default University;
