import { Request, Response } from 'express';

import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import { sendPacket } from '../helpers/functions';
import { isCommunityAdmin } from './middleware/communityAuthentication';
import invalidInputsMessage from '../helpers/functions/invalidInputsMessage';
import {
  createMTGEvent,
  uploadMTGBanner,
  retrieveMTGEventInfo,
  sendMTGCommunications,
  updateUserInfo,
  getInterestAnswers,
  updateInterestAnswers,
  getMTGEvents,
} from '../interactions/meet-the-greeks';

export default function meetTheGreekRoutes(app) {
  app.get(
    '/api/mtg/events',
    isAuthenticatedWithJWT,
    async (req: Request, res: Response) => {
      const packet = await getMTGEvents();
      return res.json(packet);
    }
  );

  app.get(
    '/api/mtg/event/:communityID',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const packet = await retrieveMTGEventInfo(communityID);
      return res.json(packet);
    }
  );

  app.get(
    '/api/mtg/interestAnswers/:communityID',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const userID = req.user._id;

      return res.json(await getInterestAnswers(userID, communityID));
    }
  );

  app.post(
    '/api/mtg/update/:communityID',
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
    }
  );

  app.put(
    '/api/mtg/interested/:communityID',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const userID = req.user._id;
      const { answers } = req.body;

      if (!answers)
        return res.json(sendPacket(-1, 'answers missing from request body'));

      res.json(await updateInterestAnswers(userID, communityID, answers));
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
    '/api/mtg/communications/:communityID',
    isAuthenticatedWithJWT,
    isCommunityAdmin,
    async (req, res) => {
      const { communityID } = req.params;
      const { mode }: { mode: 'text' | 'email' } = req.query;
      const { message } = req.body;
      if (!mode || !message || (mode !== 'text' && mode !== 'email'))
        return res.json(
          sendPacket(
            0,
            '[Required Query Params] - mode, [Required Body Params] - message'
          )
        );
      const packet = await sendMTGCommunications(
        req.user._id,
        communityID,
        mode,
        message
      );
      return res.json(packet);
    }
  );

  app.put('/api/mtg/updateUserInfo', isAuthenticatedWithJWT, (req, res) => {
    updateUserInfo(req.user._id, req.body, (packet) => res.json(packet));
  });

  app.all('/api/mtg/', async (req: Request, res: Response) => {
    return res.json(sendPacket(-1, 'Path not found'));
  });
}
