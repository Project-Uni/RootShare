const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'users',
      required: true,
      message: 'User is required',
    },
    post: { type: mongoose.Schema.ObjectId, ref: 'posts' },
    imageType: { type: String, default: 'post' }, //Might need this as we expand
    fileName: {
      type: String,
      required: true,
      message: 'fileName is required for image',
    },
  },
  { timestamps: true }
);

mongoose.model('images', ImageSchema);
const Image = mongoose.model('images');

export default Image;
