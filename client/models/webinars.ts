var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 *
 * @swagger
 *  components:
 *    schemas:
 *      Webinar:
 *        type: object
 *        required:
 *          - host
 *          - dateTime
 *          - private
 *          - isDev
 *        properties:
 *          _id:
 *            type: string
 *            description: Auto-generated ID
 *          title:
 *            type: string
 *            description: The title of the event
 *          brief_description:
 *            type: string
 *            description: A short description of the event
 *          full_description:
 *            type: string
 *            description: A complete description of the event
 *          host:
 *            $ref: '#/components/schemas/User'
 *            description: The event's host
 *          speakers:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/User'
 *            description: The speakers other than the host for the event
 *          conversation:
 *            $ref: '#/components/schemas/Conversation'
 *            description: The conversation for the event's message feed
 *          RSVPs:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/User'
 *            description: The users who RSVP'd for the event
 *          attendees_V2:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/User'
 *            description: The users who atteneded the event
 *          dateTime:
 *            type: date-time
 *            description: The date and time of the event
 *          opentokSessionID:
 *            type: string
 *            description: Unique ID for OpenTok session/chatroom associated with the event
 *          opentokBroadcastID:
 *            type: string
 *            description: Unique ID for OpenTok broadcast that is sent to MUX
 *          muxStreamKey:
 *            type: string
 *            description: Private MUX key that allows sending feed to the MUX live stream
 *          muxLiveStreamID:
 *            type: string
 *            description: Unique identifier for the MUX live stream
 *          muxPlaybackID:
 *            type: string
 *            description: Key that allows users to playback the MUX live stream
 *          muxAssetPlaybackID:
 *            type: string
 *            description: Key that allows users to playback the MUX stream after the event is over
 *          availableCommunities:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/Community'
 *            description: The communities that are allowed to view the event
 *          hostCommunity:
 *            $ref: '#/components/schemas/Community'
 *            description: The community that's hosting the event
 *          private:
 *            type: boolean
 *            description: Whether or not the event is private to specified communities or not
 *          eventImage:
 *            type: string
 *            description: The main image for the event
 *          eventBanner:
 *            type: string
 *            description: The banner image for the event
 *          blockedUsers:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/User'
 *            description: Users that are banned from the event
 *          isDev:
 *            type: boolean
 *            description: Whether the document is for development purposes only
 *          createdAt:
 *            type: string
 *            format: date-time
 *            description: The date of the record creation.
 *          updatedAt:
 *            type: string
 *            format: date-time
 *            description: When the record was last updated
 *        example:
 *          _id: 0123456789abcdef
 *          title: Test Event
 *          brief_description: The is a test event
 *          full_description: I am creating this event as an example of what they look like
 *          host: 1123456789abcdef
 *          speakers: [2123456789abcdef, 3123456789abcdef]
 *          conversation: 4123456789abcdef
 *          RSVPs: [5123456789abcdef, 6123456789abcdef, 7123456789abcdef]
 *          attendees_V2: [5123456789abcdef, 7123456789abcdef]
 *          dateTime: 2020-08-14T23:00:00.000+00:00
 *          opentokSessionID: 1_MX40Njc5OTYzNH5-MTYwNjE2MjY5OTM2MH44YUtsU1JTN2lGUkpIVnF6SmU1MFhXUHl-fg
 *          opentokBroadcastID: ead3f5b2-1dd7-4fc3-bb76-35e40b3b4a1f
 *          muxStreamKey: 4870599f-1243-5ae2-20a3-a06ae1afb71e
 *          muxLiveStreamID: vz5KXAT9018o9wuG00uETIfSCzAQ01GiSYQq9lIi839h02E
 *          muxPlaybackID: gjVxvpZAczZudPu8F00kdwNeKcRXIODxjlpK4iDGsSXI
 *          muxAssetPlaybackID: gjEqDaxeGdPu8F00kdwNeKcRXIODxjlpK4iDExFBG
 *          availableCommunities: [8123456789abcdef, 9123456789abcdef]
 *          hostCommunity: a123456789abcdef
 *          private: true
 *          eventImage: 0123456789abcdef_eventImage.jpeg
 *          eventBanner: 0123456789abcdef_eventBanner.jpeg
 *          blockedUsers: [7123456789abcdef]
 *          isDev: true
 *
 *
 */

var webinarSchema = new Schema(
  {
    title: { type: String },
    brief_description: { type: String },
    full_description: { type: String },
    host: { type: Schema.ObjectId, ref: 'users', required: true },
    speakers: [{ type: Schema.ObjectId, ref: 'users' }],
    conversation: { type: Schema.ObjectId, ref: 'conversations' },
    RSVPs: { type: [{ type: Schema.ObjectId, ref: 'users' }], default: [] },
    // attendees: { type: {}, default: {} },
    attendees_V2: { type: [{ type: Schema.ObjectId, ref: 'users' }], default: [] },
    dateTime: { type: Date, required: true },
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
    private: { type: Boolean, required: true, default: false },
    eventImage: { type: String },
    eventBanner: { type: String },
    blockedUsers: [{ type: Schema.ObjectId, ref: 'users' }],
    isDev: { type: Boolean, required: true, default: false },
    //MTG Fields
    isMTG: { type: Boolean },
    introVideoURL: { type: String },
  },
  { timestamps: true }
);

mongoose.model('webinars', webinarSchema);
const Webinar = mongoose.model('webinars');

export default Webinar;
