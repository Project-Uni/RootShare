import mongoose = require('mongoose');
const { Schema, Types } = mongoose;

var webinarSchema = new Schema(
  {
    title: { type: String },
    brief_description: { type: String },
    full_description: { type: String },
    host: { type: Types.ObjectId, ref: 'users' },
    speakers: [{ type: Types.ObjectId, ref: 'users' }],
    // attendees: { type: [{ type: Schema.ObjectId, ref: 'users' }], default: [] },
    attendees: { type: {}, default: {} },
    dateTime: { type: Date },
    opentokSessionID: String,
    opentokBroadcastID: String,
    muxStreamKey: String,
    muxLiveStreamID: String,
    muxPlaybackID: String,
    availableCommunities: {
      type: [{ type: Types.ObjectId, ref: 'communities' }],
    },
    hostCommunity: { type: Types.ObjectId, ref: 'communities' },
    private: { type: Boolean },
    //TODO - Add field for image
  },
  { timestamps: true }
);

mongoose.model('webinars', webinarSchema);
const Webinar = mongoose.model('webinars');

export default Webinar;
