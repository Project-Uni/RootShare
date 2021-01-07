var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var webinarSchema = new Schema(
  {
    title: { type: String },
    brief_description: { type: String },
    full_description: { type: String },
    host: { type: Schema.ObjectId, ref: 'users' },
    speakers: [{ type: Schema.ObjectId, ref: 'users' }],
    conversation: { type: Schema.ObjectId, ref: 'conversations' },
    RSVPs: { type: [{ type: Schema.ObjectId, ref: 'users' }], default: [] },
    attendees: { type: {}, default: {} },
    dateTime: { type: Date },
    opentokSessionID: String,
    opentokBroadcastID: String,
    muxStreamKey: String,
    muxLiveStreamID: String,
    muxPlaybackID: String,
    muxAssetPlaybackID: String,
    availableCommunities: {
      type: [{ type: Schema.ObjectId, ref: 'communities' }],
    },
    hostCommunity: { type: Schema.ObjectId, ref: 'communities' },
    private: { type: Boolean },
    eventImage: { type: String },
    eventBanner: { type: String },
    blockedUsers: [{ type: Schema.ObjectId, ref: 'users' }],
    isDev: { type: Boolean },
  },
  { timestamps: true }
);

mongoose.model('webinars', webinarSchema);
const Webinar = mongoose.model('webinars');

export default Webinar;
