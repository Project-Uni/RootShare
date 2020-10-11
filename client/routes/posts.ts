import { sendPacket } from '../helpers/functions';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import {
  isCommunityAdmin,
  isCommunityMember,
} from './middleware/communityAuthentication';

import {
  //General Posting
  createBroadcastUserPost,
  getGeneralFeed,
  getFollowingFeed,
  getPostsByUser,
  leaveCommentOnPost,
  //New Community Internal
  createInternalCurrentMemberCommunityPost,
  createInternalAlumniPost,
  getInternalCurrentMemberPosts,
  getInternalAlumniPosts,
  //Community Posting,
  createExternalPostAsCommunityAdmin,
  createExternalPostAsFollowingCommunityAdmin,
  createExternalPostAsMember,
  getExternalPosts,
  getFollowingCommunityPosts,
  broadcastAsCommunityAdmin,
  //Post Actions
  likePost,
  unlikePost
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
    const userID = req.user._id;
    const packet = await getGeneralFeed(req.user.university._id, userID);
    return res.json(packet);
  });

  app.get('/api/posts/feed/following', isAuthenticatedWithJWT, async (req, res) => {
    const userID = req.user._id;
    const packet = await getFollowingFeed(userID);
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
    '/api/posts/comment/new/:postID',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { postID } = req.params;
      const { message } = req.body;
      if (!message)
        return res.json(sendPacket(-1, 'Message is missing from request body.'));
      const packet = await leaveCommentOnPost(req.user._id, postID, message);
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

  app.post(
    '/api/posts/community/:communityID/external/admin',
    isAuthenticatedWithJWT,
    isCommunityAdmin,
    async (req, res) => {
      const { communityID } = req.params;
      const userID = req.user._id;
      const { message } = req.body;

      if (!message)
        return res.json(sendPacket(-1, 'message is missing from request body'));

      const packet = await createExternalPostAsCommunityAdmin(
        userID,
        communityID,
        message
      );
      return res.json(packet);
    }
  );

  app.post(
    '/api/posts/community/:communityID/external/following',
    isAuthenticatedWithJWT,
    isCommunityMember,
    async (req, res) => {
      const { communityID: toCommunityID } = req.params;
      const userID = req.user._id;
      const { fromCommunityID, message } = req.body;

      if (!fromCommunityID || !message)
        return res.json(
          sendPacket(0, 'fromCommunityID or message missing from request body')
        );

      const packet = await createExternalPostAsFollowingCommunityAdmin(
        userID,
        fromCommunityID,
        toCommunityID,
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

  app.get(
    '/api/posts/community/:communityID/external',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const userID = req.user._id;

      const packet = await getExternalPosts(communityID, userID);
      return res.json(packet);
    }
  );

  app.get(
    '/api/posts/community/:communityID/following',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const userID = req.user._id

      const packet = await getFollowingCommunityPosts(communityID, userID);
      return res.json(packet);
    }
  );

  app.post(
    '/api/posts/community/:communityID/broadcast',
    isAuthenticatedWithJWT,
    isCommunityAdmin,
    async (req, res) => {
      const { communityID } = req.params;
      const userID = req.user._id;
      const { message } = req.body;

      if (!message)
        return res.json(sendPacket(-1, 'message is missing from request body'));

      const packet = await broadcastAsCommunityAdmin(userID, communityID, message);
      return res.json(packet);
    }
  );

  app.post(
    '/api/posts/community/:communityID/external/member',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const userID = req.user._id;
      const { message } = req.body;

      if (!message)
        return res.json(sendPacket(-1, 'message is missing from request body'));

      const packet = await createExternalPostAsMember(userID, communityID, message);
      return res.json(packet);
    }
  );

  app.post('/api/posts/action/:postID/like', isAuthenticatedWithJWT, async (req, res) => {
    const { postID } = req.params;
    const userID = req.user._id;

    const packet = await likePost(postID, userID);
    return res.json(packet);
  })

  app.post('/api/posts/action/:postID/unlike', isAuthenticatedWithJWT, async (req, res) => {
    const { postID } = req.params;
    const userID = req.user._id;

    const packet = await unlikePost(postID, userID);
    return res.json(packet);
  })
}
