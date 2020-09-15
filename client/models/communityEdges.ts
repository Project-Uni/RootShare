const mongoose = require('mongoose');

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
