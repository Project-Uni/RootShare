import { log, sendPacket } from '../helpers/functions';
import { Post, User } from '../models';

import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import {
  getCurrentUser,
  getPrivateProfileInformation,
  getPublicProfileInformation,
  getUserEvents,
  updateProfileInformation,
  updateUserBio,
  getConnections,
  getConnectionSuggestions,
  getPendingRequests,
  requestConnection,
  respondConnection,
  getSelfUserCommunities,
  getOtherUserCommunities,
  checkConnectedWithUser,
  getConnectionWithUser,
  getSelfConnectionsFullData,
  getOtherConnectionsFullData,
  getUserAdminCommunities,
  getBasicUserInfo,
  getUsersGeneric,
} from '../interactions/user';

/**
 *
 *  @swagger
 *  tags:
 *    name: Users
 *    description: API to manage User Interactions
 *
 */

module.exports = (app) => {
  app.get('/user/getCurrent', (req, res) => {
    return getCurrentUser(req.user, (packet) => res.json(packet));
  });

  app.get('/user/getConnections', isAuthenticatedWithJWT, (req, res) => {
    getConnections(req.user._id, (packet) => res.json(packet));
  });

  app.get('/api/user/profile/:userID', isAuthenticatedWithJWT, (req, res) => {
    if (req.params.userID === 'user')
      getPrivateProfileInformation(req.user._id, (packet) => res.json(packet));
    else
      getPublicProfileInformation(req.user._id, req.params.userID, (packet) =>
        res.json(packet)
      );
  });

  app.get('/api/user/events/:userID', isAuthenticatedWithJWT, (req, res) => {
    let { userID } = req.params;
    if (userID === 'user') userID = req.user._id;
    getUserEvents(userID, (packet) => res.json(packet));
  });

  app.post('/user/updateProfile', isAuthenticatedWithJWT, (req, res) => {
    updateProfileInformation(req.user._id, req.body, (packet) => res.json(packet));
  });

  app.post('/user/updateBio', isAuthenticatedWithJWT, (req, res) => {
    updateUserBio(req.user._id, req.body.newBio, (packet) => res.json(packet));
  });

  app.get('/user/getConnectionSuggestions', isAuthenticatedWithJWT, (req, res) => {
    getConnectionSuggestions(req.user._id, (packet) => res.json(packet));
  });

  app.get('/user/getPendingRequests', isAuthenticatedWithJWT, (req, res) => {
    getPendingRequests(req.user._id, (packet) => res.json(packet));
  });

  app.get(
    '/api/user/:userID/connections',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { userID } = req.params;
      let packet;
      if (req.user._id.toString() === userID.toString())
        packet = await getSelfConnectionsFullData(userID);
      else packet = await getOtherConnectionsFullData(req.user._id, userID);
      return res.json(packet);
    }
  );

  app.post('/user/requestConnection', isAuthenticatedWithJWT, (req, res) => {
    requestConnection(req.user._id, req.body.requestUserID, (packet) =>
      res.json(packet)
    );
  });

  app.post('/user/respondConnection', isAuthenticatedWithJWT, (req, res) => {
    respondConnection(
      req.user._id,
      req.body.requestID,
      req.body.accepted,
      (packet) => res.json(packet)
    );
  });

  app.post('/user/checkConnectedWithUser', isAuthenticatedWithJWT, (req, res) => {
    checkConnectedWithUser(req.user._id, req.body.requestUserID, (packet) =>
      res.json(packet)
    );
  });

  app.post('/user/getConnectionWithUser', isAuthenticatedWithJWT, (req, res) => {
    getConnectionWithUser(req.user._id, req.body.requestUserID, (packet) =>
      res.json(packet)
    );
  });

  app.post('/api/getMatchingUsers', isAuthenticatedWithJWT, (req, res) => {
    const { query } = req.body;
    if (!query || query === '') return res.json(sendPacket(0, 'Invalid query'));

    const queryTerms = query.split(' ');
    const searchParams = [];

    const firstRegex = new RegExp(queryTerms[0], 'g');
    searchParams.push({ firstName: firstRegex });
    //TODO - email search doesn't work like this. Leaving this as is for now
    searchParams.push({ email: firstRegex });

    if (queryTerms.length > 1) {
      const secondRegex = new RegExp(queryTerms[1], 'g');
      searchParams.push({ lastName: secondRegex });
    } else searchParams.push({ lastName: firstRegex });

    User.find({ $or: searchParams }, (err, users) => {
      if (err) {
        log('error', err);
        return res.json(sendPacket(-1, 'Error fetching users from DB'));
      }
      return res.json(
        sendPacket(1, 'Received request', {
          users: users
            .map((user) => ({
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              _id: user._id,
            }))
            .slice(0, 10),
        })
      );
    });
  });

  app.get(
    '/api/user/:userID/communities/all',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { userID } = req.params;
      let packet;
      if (req.user._id.toString() === userID.toString())
        packet = await getSelfUserCommunities(userID);
      else packet = await getOtherUserCommunities(req.user._id, userID);
      return res.json(packet);
    }
  );

  app.get(
    '/api/user/:userID/communities/admin',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { userID } = req.params;
      const packet = await getUserAdminCommunities(userID);
      return res.json(packet);
    }
  );
  app.get('/api/user/:userID/basic', isAuthenticatedWithJWT, async (req, res) => {
    const { userID } = req.params;
    const packet = await getBasicUserInfo(userID);
    return res.json(packet);
  });

  /**
   *
   * @swagger
   * paths:
   *    /api/v2/user:
   *      get:
   *        summary: Retrieve users by IDs
   *        tags:
   *          - User
   *        parameters:
   *          - in: query
   *            name: _ids
   *            schema:
   *              type: array
   *              items:
   *                type: string
   *            description: The IDs of the users you are trying to retrieve
   *
   *          - in: query
   *            name: fields
   *            schema:
   *              type: array
   *              items:
   *                type: string
   *            description: The fields you are trying to retrieve.
   *
   *          - in: query
   *            name: limit
   *            schema:
   *              type: number
   *            description: Max number of users to retrieve
   *
   *          - in: query
   *            name: populates
   *            schema:
   *              type: array
   *              items:
   *                type: string
   *            description: The names of the fields you are trying to populate
   *
   *          - in: query
   *            name: lean
   *            schema:
   *              type: boolean
   *            description: Lean query or not
   *            default: true
   *
   *          - in: query
   *            name: includeDefaultFields
   *            schema:
   *              type: boolean
   *            description: Option to include default fields or not
   *            default: true
   *
   *          - in: query
   *            name: getProfilePicture
   *            schema:
   *              type: boolean
   *            description: Option to get profile picture from s3
   *            default: true
   *
   *          - in: query
   *            name: getBannerPicture
   *            schema:
   *              type: boolean
   *            description: Option to get banner picture
   *            default: false
   *
   *        responses:
   *          "1":
   *            description: Successfully retrieved users
   *          "-1":
   *            description: Failed to retrieve users
   *
   */

  app.get('/api/v2/users', isAuthenticatedWithJWT, async (req, res) => {
    const {
      _ids,
      fields,
      limit,
      populates, //Need to figure out how to do this, we should define the populate fields ourselves within the function
      getProfilePicture,
      getBannerPicture,
      includeDefaultFields,
      getRelationship,
    }: {
      _ids: string[];
      fields?: string[];
      limit?: string;
      populates?: string[];
      getProfilePicture?: boolean;
      getBannerPicture?: boolean;
      includeDefaultFields?: boolean;
      getRelationship?: boolean;
    } = req.query;
    const options = {
      limit: parseInt(limit),
      populates,
      getProfilePicture,
      getBannerPicture,
      includeDefaultFields,
      getRelationship: getRelationship ? req.user._id : undefined,
    };
    const packet = await getUsersGeneric(_ids, {
      fields: fields as any,
      options: options as any,
    });
    return res.json(packet);
  });
};
