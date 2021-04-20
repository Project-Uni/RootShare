import { Request, Response } from 'express';

import { ObjectIdVal } from '../rootshare_db/types';
import {
  getUserFromJWT,
  sendPacket,
  getQueryParams,
  invalidInputsMessage,
} from '../helpers/functions';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import { isCommunityAdmin } from './middleware/communityAuthentication';
import {
  createScaleEvent,
  uploadMTGBanner,
  retrieveMTGEventInfo,
  sendMTGCommunications,
  updateUserInfo,
  getInterestAnswers,
  updateInterestAnswers,
  getMTGEvents,
  getInterestedUsers,
} from '../interactions/meet-the-greeks';

/**
 *
 *  @swagger
 *  tags:
 *    name: MeetTheGreeks
 *    description: API to manage MeetTheGreek Interactions
 *
 */

export default function meetTheGreekRoutes(app) {
  app.get(
    '/api/mtg/events',
    isAuthenticatedWithJWT,
    async (req: Request, res: Response) => {
      const query = getQueryParams<{ scaleEventType: string }>(req, {
        scaleEventType: { type: 'string' },
      });
      if (!query)
        return res.status(500).json(sendPacket(-1, 'Invalid query params provided'));

      const { scaleEventType } = query;
      const packet = await getMTGEvents(scaleEventType);
      return res.json(packet);
    }
  );

  app.get('/api/mtg/event', isAuthenticatedWithJWT, async (req, res) => {
    const query = getQueryParams<{ communityID: string; scaleEventType: string }>(
      req,
      {
        communityID: { type: 'string' },
        scaleEventType: { type: 'string' },
      }
    );
    if (!query)
      return res.status(500).json(sendPacket(-1, 'Invalid query params provided'));
    const { communityID, scaleEventType } = query;

    const packet = await retrieveMTGEventInfo(
      ObjectIdVal(communityID),
      scaleEventType
    );
    return res.json(packet);
  });

  app.get(
    '/api/mtg/interestAnswers/:communityID',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const { _id: userID } = getUserFromJWT(req);

      return res.json(await getInterestAnswers(userID, communityID));
    }
  );

  /**
   *
   * @swagger
   * paths:
   *    /api/mtg/interested/{communityID}:
   *      get:
   *        summary: Gets information of all users interersted in a community, if user is community admin
   *        tags:
   *          - MeetTheGreeks
   *        parameters:
   *          - in: path
   *            name: communityID
   *            schema:
   *              type: string
   *            required: true
   *            description: The ID of the community
   *        responses:
   *          "1":
   *            description: The list of all interested users for community
   *            content:
   *              application/json:
   *                schema:
   *                   type: array
   *                   items:
   *                    $ref: '#/components/schemas/MeetTheGreekInterest'
   *          "0":
   *            description: Could not find community or failed to find responses
   *          "-1":
   *            description: Internal error occured
   *
   */

  app.get(
    '/api/mtg/interested/:communityID',
    isAuthenticatedWithJWT,
    isCommunityAdmin,
    async (req, res) => {
      const { communityID } = req.params;
      const packet = await getInterestedUsers(communityID);
      return res.json(packet);
    }
  );

  app.post(
    '/api/mtg/update/:communityID',
    isAuthenticatedWithJWT,
    isCommunityAdmin,
    async (req: Request, res: Response) => {
      const { communityID } = req.params;

      const {
        introVideoURL,
        eventTime,
        description,
        speakers,
        scaleEventType,
      } = req.body;
      if (
        // !introVideoURL ||
        // !eventTime ||
        !description ||
        !speakers ||
        !Array.isArray(speakers) ||
        !scaleEventType
      )
        return res.json(
          sendPacket(
            -1,
            invalidInputsMessage([
              // 'introVideoURL',
              // 'eventTime',
              'description',
              'speakers',
              'scaleEventType',
            ])
          )
        );

      const packet = await createScaleEvent(
        ObjectIdVal(communityID),
        description,
        speakers,
        scaleEventType,
        introVideoURL
        // eventTime,
      );
      return res.json(packet);
    }
  );

  app.put(
    '/api/mtg/interested/:communityID',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const { _id: userID } = getUserFromJWT(req);
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
      const query = getQueryParams<{ scaleEventType: string }>(req, {
        scaleEventType: { type: 'string' },
      });
      if (!query)
        return res.status(500).json(sendPacket(-1, 'Invalid query params provided'));
      const { scaleEventType } = query;
      const { communityID } = req.params;
      const { image } = req.body;
      if (!image || !communityID)
        return res.json(sendPacket(0, invalidInputsMessage(['image'])));

      const packet = await uploadMTGBanner(
        ObjectIdVal(communityID),
        image,
        scaleEventType
      );
      return res.json(packet);
    }
  );

  /**
   *
   * @swagger
   * paths:
   *    /api/mtg/communications/{communityID}:
   *      put:
   *        summary: Create a new communication from a community to all interested users
   *        tags:
   *          - MeetTheGreeks
   *        parameters:
   *          - in: path
   *            name: communityID
   *            schema:
   *              type: string
   *            required: true
   *            description: The ID of the community sending the message
   *
   *          - in: body
   *            name: requested_message
   *            schema:
   *              type: object
   *              required: message
   *              properties:
   *                message:
   *                  type: string
   *            required: true
   *            description: The message the user is sending
   *
   *          - in: query
   *            name: mode
   *            schema:
   *              type: string
   *            required: true
   *            description: text or email
   *        responses:
   *          "1":
   *            description: Successfully sent message
   *          "0":
   *            description: Failed to send message
   *          "-1":
   *            description: Internal error occured
   *
   */

  app.put(
    '/api/mtg/communications/:communityID',
    isAuthenticatedWithJWT,
    isCommunityAdmin,
    async (req, res) => {
      const { communityID } = req.params;
      const query = getQueryParams<{ mode: string }>(req, {
        mode: { type: 'string' },
      });

      if (!query)
        return res.status(500).json(sendPacket(-1, 'Invalid query params'));

      const { mode } = query;
      const { message } = req.body;
      const { _id: userID } = getUserFromJWT(req);
      if (!message || (mode !== 'text' && mode !== 'email'))
        return res.json(
          sendPacket(
            0,
            '[Required Query Params] - mode, [Required Body Params] - message'
          )
        );
      const packet = await sendMTGCommunications(userID, communityID, mode, message);
      return res.json(packet);
    }
  );

  app.put('/api/mtg/updateUserInfo', isAuthenticatedWithJWT, (req, res) => {
    const { _id: userID } = getUserFromJWT(req);
    updateUserInfo(userID, req.body, (packet) => res.json(packet));
  });
}
