import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import { populateDiscoverForUser } from '../interactions/discover';
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
      const query = req.query.query;
      if (!query || query === '') {
        return res.json(sendPacket(0, 'Invalid query provided'));
      }
      const userID = req.user['_id'];
      const packet = {};
      return res.json(packet);
    }
  );
}
