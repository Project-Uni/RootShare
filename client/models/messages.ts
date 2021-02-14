var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 *
 * @swagger
 *  components:
 *    schemas:
 *      Message:
 *        type: object
 *        required:
 *          - conversationID
 *          - senderName
 *          - sender
 *          - content
 *        properties:
 *          _id:
 *            type: string
 *            description: Auto-generated ID
 *          conversationID:
 *            $ref: '#/components/schemas/Conversation'
 *            description: The conversation the message belongs to
 *          senderName:
 *            type: string
 *            description: The name of the message sender
 *          sender:
 *            $ref: '#/components/schemas/User'
 *            description: The ID of the message sender
 *          content:
 *            type: string
 *            description: The content of the message
 *          likes:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/User'
 *            description: The users who liked the message
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
 *          conversationID: 1123456789abcdef
 *          senderName: Jane Doe
 *          sender: 2123456789abcdef
 *          content: Hello World
 *          likes: 3123456789abcdef
 *
 */

var messageSchema = new Schema(
  {
    conversationID: {
      type: Schema.ObjectId,
      ref: 'conversations',
      required: true,
    },
    senderName: { type: String, required: true },
    sender: { type: Schema.ObjectId, ref: 'users', required: true },
    content: { type: String, required: true },
    likes: [{ type: Schema.ObjectId, ref: 'users' }],
  },
  { timestamps: true }
);

mongoose.model('messages', messageSchema);
const Message = mongoose.model('messages');

export default Message;
