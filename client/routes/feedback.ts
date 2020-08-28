import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import log from '../helpers/logger';

import GitHub from 'github-api';

export default function feedbackRoutes(app) {
  app.get('/api/feedback/test', (req, res) => {
    return res.json({ message: 'Hello' });
  });
}
