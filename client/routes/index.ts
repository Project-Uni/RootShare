import { Express } from 'express';
import { sendPacket } from '../helpers/functions';

import communityRoutes from './community/community';
import communityAdminPortalRoutes from './community/admin-portal';
import discoverRoutes from './discover';
import eventRoutes from './event';
import feedbackRoutes from './feedback';
import mediaRoutes from './media';
import mtgRoutes from './meet-the-greeks';
import messagingRoutes from './messaging';
import opentokRoutes from './opentok';
import postRoutes from './post';
import commentRoutes from './comment';
import proxyRoutes from './proxy';
import registrationExternalRoutes from './registrationExternal';
import registrationInternalRoutes from './registrationInternal';
import universityRoutes from './university';
import userRoutes from './user';
import utilityRoutes from './utilities';
import webhookRoutes from './webhooks';
import { authRoutes } from './newAuth';
import notificationRoutes from './notification';

import adminRoutes from './admin';

export default function RootshareRoutes(app: Express, io) {
  adminRoutes(app);

  communityRoutes(app);
  communityAdminPortalRoutes(app);
  discoverRoutes(app);
  eventRoutes(app);
  feedbackRoutes(app);
  mediaRoutes(app);
  mtgRoutes(app);
  messagingRoutes(app, io);
  opentokRoutes(app);
  postRoutes(app);
  commentRoutes(app);
  proxyRoutes(app);
  registrationExternalRoutes(app);
  registrationInternalRoutes(app);
  universityRoutes(app);
  userRoutes(app);
  utilityRoutes(app);
  webhookRoutes(app);
  authRoutes(app);
  notificationRoutes(app);

  app.all('/api/*', async (req, res) => {
    return res.status(404).json(sendPacket(-1, 'Path not found'));
  });
}
