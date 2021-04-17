export { isAuthenticatedWithJWT } from '../../passport/middleware/isAuthenticated';
export { isRootshareAdmin } from '../middleware/privilegeAuthentication';

import adminMiscRoutes from './misc';
import adminCommunityRoutes from './community';
import adminEventRoutes from './event';

export default function adminRoutes(app) {
  adminMiscRoutes(app);
  adminCommunityRoutes(app);
  adminEventRoutes(app);
}
