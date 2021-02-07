const mongoose = require('mongoose');

/**
 *
 * @swagger
 *  components:
 *    schemas:
 *      CommunityEdge:
 *        type: object
 *        required:
 *          - accepted
 *        properties:
 *          _id:
 *            type: string
 *            description: Auto-generated ID
 *          from:
 *            $ref: '#/components/schemas/Community'
 *            description: The community the follow request was sent from
 *          to:
 *            $ref: '#/components/schemas/Community'
 *            description: The community the follow request was sent to
 *          accepted:
 *            type: boolean
 *            description: Whether the request has been accepted or not
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
 *          from:
 *          to:
 *          accepted:
 *
 */

const communityEdgeSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.ObjectId, ref: 'communities' },
    to: { type: mongoose.Schema.ObjectId, ref: 'communities' },
    accepted: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

mongoose.model('community_edges', communityEdgeSchema);
const CommunityEdge = mongoose.model('community_edges');

export default CommunityEdge;
