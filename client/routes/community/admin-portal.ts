import { ObjectIdVal, ObjectIdType } from '../../rootshare_db/types';
import {
  getUserFromJWT,
  sendPacket,
  getQueryParams,
  log,
  createPacket,
} from '../../helpers/functions';
import { isAuthenticatedWithJWT } from '../../passport/middleware/isAuthenticated';
import {
  isCommunityAdmin,
  isCommunityAdminFromQueryParams,
  isCommunityMemberFromQueryParams,
} from '../middleware/communityAuthentication';
import {
  getMembersCommunityAdmin,
  getMemberDataCommunityAdmin,
  addMemberToBoard,
  removeMemberFromBoard,
  getAllPendingMembers,
  acceptPendingMember,
  rejectPendingMember,
  createExternalEvent,
  getExternalEvents,
} from '../../interactions/community/admin-portal';
import { leaveCommunity } from '../../interactions/community/community';

/**
 *
 *  @swagger
 *  tags:
 *    name: Community Admin Portal
 *    description: API to manage Community Admin Portal Interactions
 *
 */

export default function communityAdminPortalRoutes(app) {
  app.get(
    '/api/communityAdmin/members',
    isAuthenticatedWithJWT,
    isCommunityAdminFromQueryParams,
    async (req, res) => {
      try {
        const query = getQueryParams<{ communityID: string }>(req, {
          communityID: { type: 'string' },
        });
        if (!query)
          return res.status(500).json(sendPacket(-1, 'Invalid query params'));
        const { communityID } = query;

        const packet = await getMembersCommunityAdmin(ObjectIdVal(communityID));
        res.json(packet);
      } catch (err) {
        log('err', err);
        res.json(sendPacket(-1, err.message));
      }
    }
  );

  app.get(
    '/api/communityAdmin/memberData',
    isAuthenticatedWithJWT,
    isCommunityAdminFromQueryParams,
    async (req, res) => {
      try {
        const query = getQueryParams<{ communityID: string }>(req, {
          communityID: { type: 'string' },
        });
        if (!query)
          return res.status(500).json(sendPacket(-1, 'Invalid query params'));
        const { communityID } = query;

        const packet = await getMemberDataCommunityAdmin(ObjectIdVal(communityID));
        res.json(packet);
      } catch (err) {
        log('err', err);
        res.json(sendPacket(-1, err.message));
      }
    }
  );

  app.put(
    '/api/communityAdmin/board',
    isAuthenticatedWithJWT,
    isCommunityAdminFromQueryParams,
    async (req, res) => {
      try {
        const query = getQueryParams<{
          communityID: string;
          userID: string;
          title: string;
        }>(req, {
          communityID: { type: 'string' },
          userID: { type: 'string' },
          title: { type: 'string' },
        });
        if (!query)
          return res.status(500).json(sendPacket(-1, 'Invalid query params'));
        const { communityID, userID, title } = query;

        const packet = await addMemberToBoard(
          ObjectIdVal(communityID),
          ObjectIdVal(userID),
          title
        );
        res.json(packet);
      } catch (err) {
        log('err', err);
        res.json(sendPacket(-1, err.message));
      }
    }
  );

  app.delete(
    '/api/communityAdmin/board',
    isAuthenticatedWithJWT,
    isCommunityAdminFromQueryParams,
    async (req, res) => {
      try {
        const query = getQueryParams<{
          communityID: string;
          userID: string;
        }>(req, {
          communityID: { type: 'string' },
          userID: { type: 'string' },
        });
        if (!query)
          return res.status(500).json(sendPacket(-1, 'Invalid query params'));
        const { communityID, userID } = query;

        const packet = await removeMemberFromBoard(
          ObjectIdVal(communityID),
          ObjectIdVal(userID)
        );
        res.json(packet);
      } catch (err) {
        log('err', err);
        res.json(sendPacket(-1, err.message));
      }
    }
  );

  app.delete(
    '/api/communityAdmin/member',
    isAuthenticatedWithJWT,
    isCommunityAdminFromQueryParams,
    async (req, res) => {
      try {
        const query = getQueryParams<{
          communityID: string;
          userID: string;
        }>(req, {
          communityID: { type: 'string' },
          userID: { type: 'string' },
        });
        if (!query)
          return res.status(500).json(sendPacket(-1, 'Invalid query params'));
        const { communityID, userID } = query;
        const packet = await leaveCommunity(
          ObjectIdVal(communityID),
          ObjectIdVal(userID)
        );
        res.json(packet);
      } catch (err) {
        log('err', err);
        res.json(sendPacket(-1, err.message));
      }
    }
  );

  app.get(
    '/api/communityAdmin/member/pending',
    isAuthenticatedWithJWT,
    isCommunityAdminFromQueryParams,
    async (req, res) => {
      try {
        const query = getQueryParams<{
          communityID: string;
        }>(req, {
          communityID: { type: 'string' },
        });
        if (!query)
          return res.status(500).json(sendPacket(-1, 'Invalid query params'));
        const { communityID } = query;
        const packet = await getAllPendingMembers(ObjectIdVal(communityID));
        res.json(packet);
      } catch (err) {
        log('err', err);
        res.json(sendPacket(-1, err.message));
      }
    }
  );

  app.put(
    '/api/communityAdmin/member/pending',
    isAuthenticatedWithJWT,
    isCommunityAdminFromQueryParams,
    async (req, res) => {
      try {
        const query = getQueryParams<{
          communityID: string;
          userID: string;
          action: 'reject' | 'accept';
        }>(req, {
          communityID: { type: 'string' },
          userID: { type: 'string' },
          action: { type: 'string' },
        });
        if (!query)
          return res.status(500).json(sendPacket(-1, 'Invalid query params'));
        const { communityID, userID, action } = query;
        let packet;
        if (action === 'reject')
          packet = await rejectPendingMember(
            ObjectIdVal(communityID),
            ObjectIdVal(userID)
          );
        else if (action === 'accept')
          packet = await acceptPendingMember(
            ObjectIdVal(communityID),
            ObjectIdVal(userID)
          );
        else return res.status(500).json(sendPacket(-1, 'Invalid query params'));
        res.json(packet);
      } catch (err) {
        log('err', err);
        res.json(sendPacket(-1, err.message));
      }
    }
  );

  app.post('/api/communityAdmin/event', isAuthenticatedWithJWT, async (req, res) => {
    const { _id: userID } = getUserFromJWT(req);
    const {
      title,
      type,
      streamLink,
      startTime,
      endTime,
      donationLink,
      description,
      communityID,
      image,
      privacy,
    } = req.body;

    const packet = await createExternalEvent({
      title,
      type,
      streamLink,
      startTime,
      endTime,
      donationLink,
      description,
      communityID,
      image,
      userID,
      privacy,
    });

    return res.status(packet.status).json(packet);
  });

  app.get('/api/communityAdmin/events', isAuthenticatedWithJWT, async (req, res) => {
    const query = getQueryParams<{ communityID?: string }>(req, {
      communityID: { type: 'string', optional: true },
    });
    const packet = await getExternalEvents(query ? query.communityID : undefined);
    res.status(packet.status).json(packet);
  });
}
