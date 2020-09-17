import { sendPacket } from '../helpers/functions';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';

import {
  //General Posting
  createBroadcastUserPost,
  getGeneralFeed,
  getPostsByUser,
  //New Community Internal
  createInternalCurrentMemberCommunityPost,
  createInternalAlumniPost,
  getInternalCurrentMemberPosts,
  getInternalAlumniPosts,
} from '../interactions/posts';

export default function postsRoutes(app) {
  app.post('/api/posts/broadcast/user', isAuthenticatedWithJWT, async (req, res) => {
    const { message } = req.body;
    if (!message) return res.json(sendPacket(-1, 'message is missing from request'));

    const packet = await createBroadcastUserPost(message, req.user);
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

  app.post(
    '/api/posts/community/:communityID/internal/current',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const { _id: userID, accountType } = req.user;
      const { message } = req.body;

      if (!message)
        return res.json(sendPacket(-1, 'message is missing from request body'));

      const packet = await createInternalCurrentMemberCommunityPost(
        communityID,
        userID,
        accountType,
        message
      );
      return res.json(packet);
    }
  );

  app.post(
    '/api/posts/community/:communityID/internal/alumni',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const { _id: userID, accountType } = req.user;
      const { message } = req.body;

      if (!message)
        return res.json(sendPacket(-1, 'message is missing from request body'));

      const packet = await createInternalAlumniPost(
        communityID,
        userID,
        accountType,
        message
      );
      return res.json(packet);
    }
  );

  app.get(
    '/api/posts/community/:communityID/internal/current',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const { _id: userID, accountType } = req.user;

      const packet = await getInternalCurrentMemberPosts(
        communityID,
        userID,
        accountType
      );
      return res.json(packet);
    }
  );

  app.get(
    '/api/posts/community/:communityID/internal/alumni',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const { _id: userID, accountType } = req.user;

      const packet = await getInternalAlumniPosts(communityID, userID, accountType);
      return res.json(packet);
    }
  );
}
