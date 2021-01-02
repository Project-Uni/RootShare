var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MeetTheGreekInterestchema = new Schema(
  {
    user: { type: Schema.ObjectId, ref: 'users' },
    community: { type: Schema.ObjectId, ref: 'communities' },
    answers: [{ type: String }],
  },
  { timestamps: true }
);

mongoose.model('meet_the_greek_interests', MeetTheGreekInterestchema);
const MeetTheGreekInterest = mongoose.model('meet_the_greek_interests');

export default MeetTheGreekInterest;
