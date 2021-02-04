import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import { getDepartments } from '../interactions/university';
import { getUserFromJWT } from '../helpers/functions';

export default function university(app) {
  app.get(
    '/api/university/departments',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { _id: userID } = getUserFromJWT(req);
      getDepartments(userID, (packet) => res.json(packet));
    }
  );
}
