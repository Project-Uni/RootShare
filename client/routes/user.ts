import { getUserFromJWT, log, sendPacket } from '../helpers/functions';
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
} from '../interactions/user';

module.exports = (app) => {
  app.get('/user/getConnections', isAuthenticatedWithJWT, (req, res) => {
    const { _id: userID } = getUserFromJWT(req);
    getConnections(userID, (packet) => res.json(packet));
  });

  app.get('/api/user/profile/:userID', isAuthenticatedWithJWT, (req, res) => {
    const { _id } = getUserFromJWT(req);

    if (req.params.userID === 'user')
      getPrivateProfileInformation(_id, (packet) => res.json(packet));
    else
      getPublicProfileInformation(_id, req.params.userID, (packet) =>
        res.json(packet)
      );
  });

  app.get('/api/user/events/:userID', isAuthenticatedWithJWT, (req, res) => {
    let { userID } = req.params;
    const { _id } = getUserFromJWT(req);

    if (userID === 'user') userID = _id;
    getUserEvents(userID, (packet) => res.json(packet));
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
      if (_id.toString() === userID.toString())
        packet = await getSelfConnectionsFullData(userID);
      else packet = await getOtherConnectionsFullData(_id, userID);
      return res.json(packet);
    }
  );

  app.post('/user/requestConnection', isAuthenticatedWithJWT, (req, res) => {
    const { _id: userID } = getUserFromJWT(req);

    requestConnection(userID, req.body.requestUserID, (packet) => res.json(packet));
  });

  app.post('/user/respondConnection', isAuthenticatedWithJWT, (req, res) => {
    const { _id: userID } = getUserFromJWT(req);

    respondConnection(userID, req.body.requestID, req.body.accepted, (packet) =>
      res.json(packet)
    );
  });

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
      const { _id } = getUserFromJWT(req);

      let packet;
      if (_id.toString() === userID.toString())
        packet = await getSelfUserCommunities(userID);
      else packet = await getOtherUserCommunities(_id, userID);
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
};
