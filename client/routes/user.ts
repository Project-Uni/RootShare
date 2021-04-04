import { Express } from 'express';
import { Types } from 'mongoose';

import { User } from '../rootshare_db/models';
import {
  getUserFromJWT,
  log,
  sendPacket,
  getQueryParams,
} from '../helpers/functions';
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

const ObjectIdVal = Types.ObjectId;
type ObjectIdType = Types.ObjectId;

/**
 *
 *  @swagger
 *  tags:
 *    name: Users
 *    description: API to manage User Interactions
 *
 */

export default function userRoutes(app: Express) {
  app.get('/user/getConnections', isAuthenticatedWithJWT, (req, res) => {
    const { _id: userID } = getUserFromJWT(req);
    getConnections(userID, (packet) => res.json(packet));
  });

  app.get('/api/user/profile/:userID', isAuthenticatedWithJWT, (req, res) => {
    const { _id } = getUserFromJWT(req);

    if (req.params.userID === 'user')
      getPrivateProfileInformation(_id, (packet) => res.json(packet));
    else
      getPublicProfileInformation(
        _id,
        (req.params.userID as unknown) as ObjectIdType,
        (packet) => res.json(packet)
      );
  });

  app.get('/api/user/events/:userID', isAuthenticatedWithJWT, (req, res) => {
    const { userID } = req.params;
    const { _id } = getUserFromJWT(req);

    getUserEvents(userID === 'user' ? _id : ObjectIdVal(userID), (packet) =>
      res.json(packet)
    );
  });

  app.post('/user/updateProfile', isAuthenticatedWithJWT, (req, res) => {
    const { _id: userID } = getUserFromJWT(req);

    updateProfileInformation(userID, req.body, (packet) => res.json(packet));
  });

  app.post('/user/updateBio', isAuthenticatedWithJWT, (req, res) => {
    const { _id: userID } = getUserFromJWT(req);
    updateUserBio(userID, req.body.newBio, (packet) => res.json(packet));
  });

  app.get('/user/getConnectionSuggestions', isAuthenticatedWithJWT, (req, res) => {
    const { _id: userID } = getUserFromJWT(req);
    getConnectionSuggestions(userID, (packet) => res.json(packet));
  });

  app.get('/user/getPendingRequests', isAuthenticatedWithJWT, (req, res) => {
    const { _id: userID } = getUserFromJWT(req);
    getPendingRequests(userID, (packet) => res.json(packet));
  });

  app.get(
    '/api/user/:userID/connections',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { userID } = req.params;
      const { _id } = getUserFromJWT(req);

      let packet;
      if (_id === ObjectIdVal(userID))
        packet = await getSelfConnectionsFullData(userID);
      else packet = await getOtherConnectionsFullData(_id, ObjectIdVal(userID));
      return res.json(packet);
    }
  );

  app.post('/user/checkConnectedWithUser', isAuthenticatedWithJWT, (req, res) => {
    const { _id: userID } = getUserFromJWT(req);

    checkConnectedWithUser(userID, req.body.requestUserID, (packet) =>
      res.json(packet)
    );
  });

  app.post('/user/getConnectionWithUser', isAuthenticatedWithJWT, (req, res) => {
    const { _id: userID } = getUserFromJWT(req);

    getConnectionWithUser(userID, req.body.requestUserID, (packet) =>
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

    User.model.find({ $or: searchParams }, (err, users) => {
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
      const { _id } = getUserFromJWT(req);

      let packet;
      if (_id.toString() === userID.toString())
        packet = await getSelfUserCommunities(ObjectIdVal(userID));
      else packet = await getOtherUserCommunities(_id, ObjectIdVal(userID));
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
   *          - in: query
   *            name: getRelationship
   *            schema:
   *              type: string
   *            description: userID to get relationship to (connected, pending_from, pending_to, open)
   *
   *        responses:
   *          "1":
   *            description: Successfully retrieved users
   *          "-1":
   *            description: Failed to retrieve users
   *
   */

  app.get('/api/v2/users', isAuthenticatedWithJWT, async (req, res) => {
    const { _id: userID } = getUserFromJWT(req);

    const query = getQueryParams<{
      _ids: string[];
      limit?: number;
      fields?: string[];
      populates?: string[];
      getProfilePicture?: boolean;
      getBannerPicture?: boolean;
      includeDefaultFields?: boolean;
      getRelationship?: boolean;
    }>(req, {
      _ids: { type: 'string[]' },
      limit: { type: 'number', optional: true },
      fields: { type: 'string[]', optional: true },
      populates: { type: 'string[]', optional: true },
      getProfilePicture: { type: 'boolean', optional: true },
      getBannerPicture: { type: 'boolean', optional: true },
      includeDefaultFields: { type: 'boolean', optional: true },
      getRelationship: { type: 'boolean', optional: true },
    });

    if (!query) return res.status(500).json(sendPacket(-1, 'Invalid query params'));

    const {
      _ids,
      limit,
      fields,
      populates: populatesRaw,
      getProfilePicture,
      getBannerPicture,
      includeDefaultFields,
      getRelationship,
    } = query;
    const userIDs = _ids.map((_id) => ObjectIdVal(_id));

    const populates = [];
    if (populatesRaw)
      try {
        populatesRaw.forEach((populateRaw) => {
          const split = populateRaw.split(':');
          populates.push({ path: split[0], select: split[1] });
        });
      } catch (err) {
        log('err', err);
        return res.status(500).json(sendPacket(-1, 'Invalid query params'));
      }

    const options = {
      limit,
      populates,
      getProfilePicture,
      getBannerPicture,
      includeDefaultFields,
      getRelationshipTo: getRelationship ? userID : undefined,
    };
    const packet = await getUsersGeneric(userIDs, {
      fields: fields as any[],
      options: options,
    });
    return res.json(packet);
  });

  app.put('/api/v2/user/connect', isAuthenticatedWithJWT, async (req, res) => {
    const { _id: selfUserID } = getUserFromJWT(req);
    const query = getQueryParams<{
      action: string;
      otherUserID: string;
    }>(req, {
      action: { type: 'string' },
      otherUserID: { type: 'string' },
    });
    if (!query)
      return res.status(500).json(sendPacket(-1, 'Invalid query params provided'));

    const { action, otherUserID } = query;

    if (action === 'connect')
      res.json(await requestConnection(selfUserID, ObjectIdVal(otherUserID)));
    else if (action === 'reject' || action === 'cancel' || action === 'remove')
      res.json(await respondConnection(selfUserID, ObjectIdVal(otherUserID), false));
    else if (action === 'accept')
      res.json(await respondConnection(selfUserID, ObjectIdVal(otherUserID), true));
    else
      return res.json(
        sendPacket(0, 'Invalid action in route (connect, reject, accept, remove)')
      );
  });
}
