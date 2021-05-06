import { Express } from 'express';

import { ObjectIdVal } from '../rootshare_db/types';
import {
  getUserFromJWT,
  sendPacket,
  getQueryParams,
  log,
} from '../helpers/functions';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';

import {
  leaveCommentOnPost,
  retrieveComments,
  toggleCommentLike,
} from '../interactions/comment';

export default function commentRoutes(app: Express) {
  app.get('/api/comments/:postID', isAuthenticatedWithJWT, async (req, res) => {
    const { _id: userID } = getUserFromJWT(req);
    const { postID } = req.params;
    const query = getQueryParams<{ startingTimestamp?: string }>(req, {
      startingTimestamp: { type: 'string', optional: true },
    });
    if (!query) return res.status(500).json(sendPacket(-1, 'Invalid query params'));

    const { startingTimestamp } = query;

    const packet = await retrieveComments(
      userID,
      ObjectIdVal(postID),
      startingTimestamp ? new Date(startingTimestamp) : new Date()
    );
    return res.json(packet);
  });

  app.post('/api/comments/:postID', isAuthenticatedWithJWT, async (req, res) => {
    const { postID } = req.params;
    const { message } = req.body;
    const { _id: userID } = getUserFromJWT(req);
    if (!message)
      return res.json(sendPacket(-1, 'Message is missing from request body.'));
    const packet = await leaveCommentOnPost(userID, ObjectIdVal(postID), message);
    return res.json(packet);
  });

  app.put('/api/comments/like', isAuthenticatedWithJWT, async (req, res) => {
    try {
      const query = getQueryParams<{
        commentID: string;
        postID: string;
        liked: boolean;
      }>(req, {
        commentID: { type: 'string' },
        postID: { type: 'string' },
        liked: { type: 'boolean' },
      });
      if (!query)
        return res.status(500).json(sendPacket(-1, 'Invalid query params'));
      const { commentID, postID, liked } = query;
      const { _id: userID } = getUserFromJWT(req);

      const packet = await toggleCommentLike(
        userID,
        ObjectIdVal(commentID),
        ObjectIdVal(postID),
        liked
      );
      return res.json(packet);
    } catch (err) {
      log('err', err);
      res.json(sendPacket(-1, err.message));
    }
  });
}
