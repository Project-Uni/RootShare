import { Express } from 'express';

import { ObjectIdVal } from '../rootshare_db/types';
import { getUserFromJWT, sendPacket, getQueryParams } from '../helpers/functions';
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
  createBroadcastCommunityPost,
  //Post Actions
  togglePostLike,
  getLikes,
  deletePost,
  getPost,
} from '../interactions/post';

export default function postRoutes(app: Express) {
  app.post('/api/posts/broadcast/user', isAuthenticatedWithJWT, async (req, res) => {
    const { _id: userID } = getUserFromJWT(req);
    const { message, image } = req.body;
    if (!message) return res.json(sendPacket(-1, 'message is missing from request'));

    const packet = await createBroadcastUserPost(message, userID, image);
    return res.json(packet);
  });

  app.get('/api/posts/feed/general', isAuthenticatedWithJWT, async (req, res) => {
    const { _id: userID } = getUserFromJWT(req);
    const packet = await getGeneralFeed(userID);
    return res.json(packet);
  });

  app.get('/api/posts/feed/following', isAuthenticatedWithJWT, async (req, res) => {
    const { _id: userID } = getUserFromJWT(req);
    const packet = await getFollowingFeed(userID);
    return res.json(packet);
  });

  app.get(
    '/api/posts/user/:userID/all',
    isAuthenticatedWithJWT,
    async (req, res) => {
      let { userID } = req.params;
      const { _id } = getUserFromJWT(req);
      if (userID === 'user') userID = (_id as unknown) as string;
      const packet = await getPostsByUser(ObjectIdVal(userID), _id);
      return res.json(packet);
    }
  );

  app.post(
    '/api/posts/community/:communityID/internal/current',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const { _id: userID, accountType } = getUserFromJWT(req);
      const { message, image } = req.body;

      if (!message)
        return res.json(sendPacket(-1, 'message is missing from request body'));

      const packet = await createInternalCurrentMemberCommunityPost(
        ObjectIdVal(communityID),
        userID,
        accountType,
        message,
        image
      );
      return res.json(packet);
    }
  );

  app.post(
    '/api/posts/community/:communityID/internal/alumni',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const { _id: userID, accountType } = getUserFromJWT(req);
      const { message, image } = req.body;

      if (!message)
        return res.json(sendPacket(-1, 'message is missing from request body'));

      const packet = await createInternalAlumniPost(
        ObjectIdVal(communityID),
        userID,
        accountType,
        message,
        image
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
      const { _id: userID } = getUserFromJWT(req);
      const { message, image } = req.body;

      if (!message)
        return res.json(sendPacket(-1, 'message is missing from request body'));

      const packet = await createExternalPostAsCommunityAdmin(
        userID,
        ObjectIdVal(communityID),
        message,
        image
      );
      return res.json(packet);
    }
  );

  app.post(
    '/api/posts/community/:communityID/external/following',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID: toCommunityID } = req.params;
      const { _id: userID } = getUserFromJWT(req);
      const { fromCommunityID, message, image } = req.body;

      if (!fromCommunityID || !message)
        return res.json(
          sendPacket(0, 'fromCommunityID or message missing from request body')
        );

      const packet = await createExternalPostAsFollowingCommunityAdmin(
        userID,
        fromCommunityID,
        ObjectIdVal(toCommunityID),
        message,
        image
      );

      return res.json(packet);
    }
  );

  app.get(
    '/api/posts/community/:communityID/internal/current',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const { _id: userID, accountType } = getUserFromJWT(req);

      const packet = await getInternalCurrentMemberPosts(
        ObjectIdVal(communityID),
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
      const { _id: userID, accountType } = getUserFromJWT(req);

      const packet = await getInternalAlumniPosts(
        ObjectIdVal(communityID),
        userID,
        accountType
      );
      return res.json(packet);
    }
  );

  app.get(
    '/api/posts/community/:communityID/external',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const { _id: userID } = getUserFromJWT(req);

      const packet = await getExternalPosts(ObjectIdVal(communityID), userID);
      return res.json(packet);
    }
  );

  app.get(
    '/api/posts/community/:communityID/following',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const { _id: userID } = getUserFromJWT(req);

      const packet = await getFollowingCommunityPosts(
        ObjectIdVal(communityID),
        userID
      );
      return res.json(packet);
    }
  );

  app.post(
    '/api/posts/community/:communityID/broadcast',
    isAuthenticatedWithJWT,
    isCommunityAdmin,
    async (req, res) => {
      const { communityID } = req.params;
      const { _id: userID } = getUserFromJWT(req);
      const { message, image } = req.body;

      if (!message)
        return res.json(sendPacket(-1, 'message is missing from request body'));

      const packet = await createBroadcastCommunityPost(
        userID,
        ObjectIdVal(communityID),
        message,
        image
      );
      return res.json(packet);
    }
  );

  app.post(
    '/api/posts/community/:communityID/external/member',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const { _id: userID } = getUserFromJWT(req);
      const { message, image } = req.body;

      if (!message)
        return res.json(sendPacket(-1, 'message is missing from request body'));

      const packet = await createExternalPostAsMember(
        userID,
        ObjectIdVal(communityID),
        message,
        image
      );
      return res.json(packet);
    }
  );

  app.put('/api/posts/like', isAuthenticatedWithJWT, async (req, res) => {
    const { _id: userID } = getUserFromJWT(req);

    const query = getQueryParams<{
      postID: string;
      liked: boolean;
    }>(req, {
      postID: { type: 'string' },
      liked: { type: 'boolean' },
    });
    if (!query) return res.status(500).json(sendPacket(-1, 'Invalid query params'));
    const { postID, liked } = query;

    return res.json(await togglePostLike(userID, ObjectIdVal(postID), liked));
  });

  app.get('/api/posts/likes/:postID', isAuthenticatedWithJWT, async (req, res) => {
    const { postID } = req.params;
    const { _id: userID } = getUserFromJWT(req);

    const packet = await getLikes(ObjectIdVal(postID), userID);
    return res.json(packet);
  });

  app.delete(
    '/api/posts/delete/:postID',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { postID } = req.params;
      const { _id: userID } = getUserFromJWT(req);

      const packet = await deletePost(ObjectIdVal(postID), userID);
      return res.json(packet);
    }
  );

  app.get('/api/post', isAuthenticatedWithJWT, async (req, res) => {
    const query = getQueryParams<{ _id: string }>(req, {
      _id: { type: 'string' },
    });
    if (!query)
      return res.status(400).json(sendPacket(-1, 'Missing query param _id'));

    const { _id: postID } = query;
    const { _id: userID } = getUserFromJWT(req);
    const post = await getPost({
      postID: postID as string,
      userID,
    });
    if (!post)
      return res.status(400).json(sendPacket(-1, 'Could not retrieve post'));
    return res.status(200).json(sendPacket(1, 'Retrieved post', { post }));
  });
}
