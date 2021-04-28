import { Express } from 'express';

export { isAuthenticatedWithJWT } from '../../passport/middleware/isAuthenticated';
export {
  isRootshareAdmin,
  isRootshareSuperAdmin,
} from '../middleware/privilegeAuthentication';

import adminMiscRoutes from './misc';
import adminCommunityRoutes from './community';
import adminEventRoutes from './event';
import adminDatabaseRoutes from './database';

/**
 *
 *  @swagger
 *  tags:
 *    name: Admin
 *    description: API to manage Admin Interactions
 *
 */

export default function adminRoutes(app: Express) {
  adminMiscRoutes(app);
  adminCommunityRoutes(app);
  adminEventRoutes(app);
  adminDatabaseRoutes(app);
}
