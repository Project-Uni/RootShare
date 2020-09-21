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
  getUserCommunities,
  checkConnectedWithUser,
  getConnectionWithUser,
  getConnectionsFullData,
  getBasicUserInfo,
} from '../interactions/user';

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
      getPublicProfileInformation(req.params.userID, (packet) => res.json(packet));
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
      const packet = await getConnectionsFullData(userID);
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
      const packet = await getUserCommunities(userID);
      return res.json(packet);
    }
  );

  app.get('/api/user/:userID/basic', isAuthenticatedWithJWT, async (req, res) => {
    const { userID } = req.params;
    const packet = await getBasicUserInfo(userID);
    return res.json(packet);
  });
};
