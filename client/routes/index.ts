import { Request, Response } from 'express';
import { sendPacket } from '../helpers/functions';

import communityRoutes from './community';
import discoverRoutes from './discover';
import eventRoutes from './event';
import feedbackRoutes from './feedback';
import imageRoutes from './images';
// import mtgRoutes from './meet-the-greeks';
import messagingRoutes from './messaging';
import opentokRoutes from './opentok';
import postRoutes from './posts';
import proxyRoutes from './proxy';
import registrationExternalRoutes from './registrationExternal';
import registrationInternalRoutes from './registrationInternal';
import universityRoutes from './university';
import userRoutes from './user';
import utilityRoutes from './utilities';
import webhookRoutes from './webhooks';

export default function allRoutes(app, io) {
  communityRoutes(app);
  discoverRoutes(app);
  eventRoutes(app);
  feedbackRoutes(app);
  imageRoutes(app);
  // mtgRoutes(app);
  messagingRoutes(app, io);
  opentokRoutes(app);
  postRoutes(app);
  proxyRoutes(app);
  registrationExternalRoutes(app);
  registrationInternalRoutes(app);
  universityRoutes(app);
  userRoutes(app);
  utilityRoutes(app);
  webhookRoutes(app);

  //Ashwin: Not sure if we need this
  app.all('/api/*', async (req: Request, res: Response) => {
    console.log('TEST');
    return res.json(sendPacket(-1, 'Path not found'));
  });
}
