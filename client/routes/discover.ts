import { Express } from 'express';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';

import { populateDiscoverForUser } from '../interactions/discover';

export default function discoverRoutes(app) {
  app.get('/api/discover/populate', isAuthenticatedWithJWT, async (req, res) => {
    const userID = req.user['_id'];
    const packet = await populateDiscoverForUser(userID);
    return res.json(packet);
  });
}
