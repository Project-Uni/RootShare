const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 *
 * @swagger
 *  components:
 *    schemas:
 *      ExternalCommunication:
 *        type: object
 *        required:
 *          - user
 *          - community
 *          - mode
 *          - message
 *        properties:
 *          id:
 *            type: string
 *            description: Auto-generated id
 *          user:
 *            type: string
 *            description: The id of the user who sent the message
 *          community:
 *            type: string
 *            description: The id of the community the user belongs to
 *          mode:
 *            type: string
 *            description: The type of message, either 'text' or 'email'
 *          message:
 *            type: string
 *            description: The message the user sent
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
 *          mode: 'text'
 *          message: 'Hey guys, this is Ashwin from RootShare!'
 *
 */

const ExternalCommunicationSchema = new Schema(
  {
    mode: { type: String, required: true },
    user: { type: Schema.ObjectId, ref: 'users' },
    community: { type: Schema.ObjectId, ref: 'communities' },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

mongoose.model('external_communications', ExternalCommunicationSchema);
const ExternalCommunication = mongoose.model('external_communications');

export default ExternalCommunication;
