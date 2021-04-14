import { Types } from 'mongoose';

import {
  getUserFromJWT,
  sendPacket,
  getQueryParams,
  log,
} from '../helpers/functions';
import { MAX_FILE_SIZE_MBS } from '../helpers/constants';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import { isCommunityAdmin } from './middleware/communityAuthentication';

import {
  //Images
  updateUserProfilePicture,
  updateUserBanner,
  updateCommunityProfilePicture,
  updateCommunityBanner,
  getUserProfileAndBanner,
  getCommunityProfileAndBanner,

  //Links
  updateLinks,

  //Documents
  uploadDocuments,
  deleteDocuments,
} from '../interactions/media';

const ObjectIdVal = Types.ObjectId;

export default function mediaRoutes(app) {
  app.post(
    '/api/media/images/profile/updateProfilePicture',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { image } = req.body;
      const { _id: userID } = getUserFromJWT(req);
      if (!image) return res.json(sendPacket(-1, 'image not in request body'));

      const packet = await updateUserProfilePicture(image, userID);
      return res.json(packet);
    }
  );

  app.post(
    '/api/media/images/profile/banner',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { image } = req.body;
      const { _id: userID } = getUserFromJWT(req);
      if (!image) return res.json(sendPacket(-1, 'image not in request body'));

      const packet = await updateUserBanner(image, userID);
      return res.json(packet);
    }
  );

  app.post(
    '/api/media/images/community/:communityID/updateProfilePicture',
    isAuthenticatedWithJWT,
    isCommunityAdmin,
    async (req, res) => {
      const { communityID } = req.params;

      const { image } = req.body;
      if (!image) return res.json(sendPacket(-1, 'image not in request body'));

      const packet = await updateCommunityProfilePicture(image, communityID);
      return res.json(packet);
    }
  );

  app.post(
    '/api/media/images/community/:communityID/banner',
    isAuthenticatedWithJWT,
    isCommunityAdmin,
    async (req, res) => {
      const { communityID } = req.params;
      const { image } = req.body;
      if (!image) return res.json(sendPacket(-1, 'image not in request body'));

      const packet = await updateCommunityBanner(image, communityID);
      return res.json(packet);
    }
  );

  /**
   *
   * @swagger
   * paths:
   *    /api/media/images/profile:
   *      get:
   *        summary: Retrieve profile and banner for a user
   *        tags:
   *          - Image
   *        parameters:
   *          - in: query
   *            name: _id
   *            schema:
   *              type: string
   *            description: The ID of the user or community whos profile and banner you are trying to retrieve
   *
   *          - in: query
   *            name: getProfile
   *            schema:
   *              type: boolean
   *            description: Option to retrieve profile picture (true if you want it)
   *
   *          - in: query
   *            name: getBanner
   *            schema:
   *              type: boolean
   *            description: Option to retrieve banner picture (true if you want it)
   *
   *          - in: query
   *            name: type
   *            schema:
   *               type: string
   *            description: Entity type to retrieve information of (community or user)
   *
   *        responses:
   *          "1":
   *            description: Successfully retrieved profile picture / banner
   *          "-1":
   *            description: Failed to retrieve profile picture / banner
   *
   */

  app.get('/api/media/images/profile', isAuthenticatedWithJWT, async (req, res) => {
    const query = getQueryParams<{
      _id: string;
      type: string;
      getBanner?: boolean;
      getProfile?: boolean;
    }>(req, {
      _id: { type: 'string' },
      type: { type: 'string' },
      getBanner: { type: 'boolean', optional: true },
      getProfile: { type: 'boolean', optional: true },
    });
    if (!query) return res.status(500).json(sendPacket(-1, 'Invalid query params'));

    let { getProfile, getBanner, _id, type } = query;

    let packet: {
      success: number;
      message: string;
      content: {
        [key: string]: any;
      };
    };

    let entityID = _id === 'user' ? getUserFromJWT(req)._id : ObjectIdVal(_id);
    if (type === 'user')
      packet = await getUserProfileAndBanner(entityID, {
        getProfile,
        getBanner,
      });
    else if (type === 'community')
      packet = await getCommunityProfileAndBanner(entityID, {
        getProfile,
        getBanner,
      });
    else packet = sendPacket(-1, 'Invalid type');

    return res.json(packet);
  });

  app.post('/api/media/links', isAuthenticatedWithJWT, async (req, res) => {
    try {
      const { _id: userID } = getUserFromJWT(req);

      const query = getQueryParams<{
        entityID: string;
        entityType: string;
      }>(req, {
        entityID: { type: 'string' },
        entityType: { type: 'string' },
      });
      if (!query)
        return res.status(500).json(sendPacket(-1, 'Invalid query params'));
      const { entityID, entityType } = query;
      const { links, removeIDs } = req.body;

      const packet = await updateLinks(
        userID,
        ObjectIdVal(entityID),
        entityType,
        links || [],
        removeIDs ? removeIDs.map((id) => ObjectIdVal(id)) : []
      );
      return res.json(packet);
    } catch (err) {
      res.json(sendPacket(-1, err.message));
    }
  });

  app.post('/api/media/documents', isAuthenticatedWithJWT, async (req, res) => {
    try {
      let documents = req.files.documents;
      if (!documents) return res.json(sendPacket(0, 'No documents to upload'));
      if (!Array.isArray(documents)) documents = [documents];

      for (let i = 0; i < documents.length; i++)
        if (documents[i].truncated)
          return res.json(
            sendPacket(
              0,
              `File: ${documents[i].name} is over size limit of ${MAX_FILE_SIZE_MBS}MB`
            )
          );

      const query = getQueryParams<{
        entityID: string;
        entityType: string;
      }>(req, {
        entityID: { type: 'string' },
        entityType: { type: 'string' },
      });
      if (!query)
        return res.status(500).json(sendPacket(-1, 'Invalid query params'));
      const { entityID, entityType } = query;

      const { _id: userID } = getUserFromJWT(req);
      const packet = await uploadDocuments(
        userID,
        ObjectIdVal(entityID),
        entityType,
        documents
      );
      return res.json(packet);
    } catch (err) {
      log('err', err.message);
      res.json(sendPacket(-1, err.message));
    }
  });

  app.delete('/api/media/documents', isAuthenticatedWithJWT, async (req, res) => {
    try {
      const query = getQueryParams<{
        entityID: string;
        entityType: string;
        documentIDs: string[];
      }>(req, {
        entityID: { type: 'string' },
        entityType: { type: 'string' },
        documentIDs: { type: 'string[]' },
      });
      if (!query)
        return res.status(500).json(sendPacket(-1, 'Invalid query params'));
      const { entityID, entityType, documentIDs } = query;
      const { _id: userID } = getUserFromJWT(req);

      const packet = await deleteDocuments(
        userID,
        ObjectIdVal(entityID),
        entityType,
        documentIDs.map((doc) => ObjectIdVal(doc))
      );
      res.json(packet);
    } catch (err) {
      log('err', err.message);
      res.json(sendPacket(-1, err.message));
    }
  });
}
