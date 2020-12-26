import { Request, Response } from 'express';

import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import { sendPacket } from '../helpers/functions';
import { isCommunityAdmin } from './middleware/communityAuthentication';
import invalidInputsMessage from '../helpers/functions/invalidInputsMessage';
import { createMTGEvent, uploadMTGBanner } from '../interactions/meet-the-greeks';

type Question = {
  question: string;
  required: boolean;
};

export default function meetTheGreekRoutes(app) {
  app.get(
    '/api/mtg/events',
    isAuthenticatedWithJWT,
    async (req: Request, res: Response) => {
      return res.json({ test: 1, world: 'hello' });
    }
  );
  app.post(
    '/api/mtg/create/:communityID',
    isAuthenticatedWithJWT,
    isCommunityAdmin,
    async (req: Request, res: Response) => {
      const { communityID } = req.params;
      const { introVideoURL, eventTime, description, speakers } = req.body;
      if (
        !introVideoURL ||
        !eventTime ||
        !description ||
        !speakers ||
        !Array.isArray(speakers)
      )
        return res.json(
          sendPacket(
            -1,
            invalidInputsMessage([
              'introVideoURL',
              'eventTime',
              'description',
              'speakers',
            ])
          )
        );

      const packet = await createMTGEvent(
        communityID,
        description,
        introVideoURL,
        eventTime,
        speakers
      );
      return res.json(packet);
      //Banner Image with crop
    }
  );

  app.put(
    '/api/mtg/banner/:communityID',
    isAuthenticatedWithJWT,
    isCommunityAdmin,
    async (req, res) => {
      const { communityID } = req.params;
      const { image } = req.body;
      if (!image) return res.json(sendPacket(0, invalidInputsMessage(['image'])));

      const packet = await uploadMTGBanner(communityID, image);
      return res.json(packet);
    }
  );
  app.put(
    '/api/mtg/interested/:communityID',
    isAuthenticatedWithJWT,
    async (req, res: Response) => {
      const userID = req.user!._id;
      const { questions } = req.body;
      return res.json('');
    }
  );
  app.put(
    '/api/mtg/communications/:communityID/:communicationForm',
    isAuthenticatedWithJWT,
    isCommunityAdmin,
    async (req, res) => {}
  );
  app.all('/api/mtg/', async (req: Request, res: Response) => {
    return res.json(sendPacket(-1, 'Path not found'));
  });
}
