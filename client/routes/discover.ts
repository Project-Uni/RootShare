import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import {
  populateDiscoverForUser,
  exactMatchSearchFor,
} from '../interactions/discover';
import { sendPacket } from '../helpers/functions';

export default function discoverRoutes(app) {
  app.get('/api/discover/populate', isAuthenticatedWithJWT, async (req, res) => {
    const userID = req.user['_id'];
    const packet = await populateDiscoverForUser(userID);
    return res.json(packet);
  });

  app.get(
    '/api/discover/search/v1/exactMatch',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { query, limit: queryLimit } = req.query;
      if (!query) return res.json(sendPacket(0, 'No query provided'));

      const userID = req.user['_id'];

      let limit;
      if (queryLimit)
        try {
          limit = parseInt(limit);
        } catch (err) {}
      const packet = await exactMatchSearchFor(userID, query, limit);
      return res.json(packet);
    }
  );
}
