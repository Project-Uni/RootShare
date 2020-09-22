import { sendPacket } from '../helpers/functions';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';

import {
  createBroadcastUserPost,
  getGeneralFeed,
  getPostsByUser,
} from '../interactions/posts';

export default function postsRoutes(app) {
  app.post('/api/posts/broadcast/user', isAuthenticatedWithJWT, async (req, res) => {
    const userID = req.user._id;
    const { message } = req.body;
    if (!message) return res.json(sendPacket(-1, 'message is missing from request'));

    const packet = await createBroadcastUserPost(message, userID);
    return res.json(packet);
  });

  app.get('/api/posts/feed/general', isAuthenticatedWithJWT, async (req, res) => {
    const packet = await getGeneralFeed(req.user.university._id);
    return res.json(packet);
  });

  app.get(
    '/api/posts/user/:userID/all',
    isAuthenticatedWithJWT,
    async (req, res) => {
      let { userID } = req.params;
      if (userID === 'user') userID = req.user._id;
      const packet = await getPostsByUser(userID);
      return res.json(packet);
    }
  );
}
