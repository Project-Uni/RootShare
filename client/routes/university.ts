import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import { getDepartments } from '../interactions/university';

export default function university(app) {
  app.get(
    '/api/university/departments',
    isAuthenticatedWithJWT,
    async (req, res) => {
      getDepartments(req.user.university, (packet) => res.json(packet));
    }
  );
}
