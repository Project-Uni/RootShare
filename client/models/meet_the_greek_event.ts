var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MeetTheGreekEventSchema = new Schema(
  {
    title: { type: String },
    description: { type: String },
    introVideoURL: { type: String },
    speakers: [{ type: Schema.ObjectId, ref: 'users' }],
    attendees: [{ type: Schema.ObjectId, ref: 'users' }],
    host: { type: Schema.ObjectId, ref: 'users' },
    conversation: { type: Schema.ObjectId, ref: 'conversations' },
    dateTime: { type: Date },
    opentokSessionID: String,
    opentokBroadcastID: String,
    muxStreamKey: String,
    muxLiveStreamID: String,
    muxPlaybackID: String,
    muxAssetPlaybackID: String,
    community: { type: Schema.ObjectId, ref: 'communities' },
    eventImage: { type: String },
    eventBanner: { type: String },
    isDev: Boolean,
    // interestedUsers: {}
  },
  { timestamps: true }
);

mongoose.model('meet_the_greek_events', MeetTheGreekEventSchema);
const MeetTheGreekEvent = mongoose.model('meet_the_greek_events');

export default MeetTheGreekEvent;
