var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var webinarSchema = new Schema(
  {
    title: { type: String },
    brief_description: { type: String },
    full_description: { type: String },
    host: { type: Schema.ObjectId, ref: 'users' },
    speakers: [{ type: Schema.ObjectId, ref: 'users' }],
    attendees: [{ type: Schema.ObjectId, ref: 'users' }],
    date: { type: String },
    time: { type: String },
    opentokSessionID: String,
    opentokBroadcastID: String,
    muxStreamKey: String,
    muxLiveStreamID: String,
    muxPlaybackID: String,
    communities: {
      type: [{ type: Schema.ObjectId, ref: 'communities' }],
    },
    private: { type: Boolean },
    //TODO - Add field for image
  },
  { timestamps: true }
);

mongoose.model('webinars', webinarSchema);
