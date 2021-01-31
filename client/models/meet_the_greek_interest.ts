var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 *
 * @swagger
 *  components:
 *    schemas:
 *      MeetTheGreekInterest:
 *        type: object
 *        required:
 *          - user
 *          - community
 *          - answers
 *        properties:
 *          id:
 *            type: string
 *            description: Auto-generated ID
 *          user:
 *            $ref: '#/components/schemas/User'
 *            description: The ID of the user who is interested
 *          community:
 *            $ref: '#/components/schemas/Community'
 *            description: The ID of the community the user is interested in
 *          answers:
 *            type: string
 *            description: A JSON string of the users responses, needs to be parsed before being sent back
 *          createdAt:
 *            type: string
 *            format: date
 *            description: The date of the record creation.
 *          updatedAt:
 *            type: string
 *            format: date
 *            description: When the record was last updated
 *        example:
 *          user: 1jknj209asd0
 *          community: 20931nk1k90
 *          answers: { 'Hometown': 'San Jose, CA' }
 *
 */

var MeetTheGreekInterestchema = new Schema(
  {
    user: { type: Schema.ObjectId, ref: 'users' },
    community: { type: Schema.ObjectId, ref: 'communities' },
    answers: { type: String },
  },
  { timestamps: true }
);

mongoose.model('meet_the_greek_interests', MeetTheGreekInterestchema);
const MeetTheGreekInterest = mongoose.model('meet_the_greek_interests');

export default MeetTheGreekInterest;
