import {
  Community,
  CommunityEdge,
  User,
  University,
} from '../../rootshare_db/models';
import { CommunityType, ObjectIdType } from '../../rootshare_db/types';
import { log, sendPacket, deleteFile } from '../../helpers/functions';

import { deletePost } from '../post';

export async function retrieveAllCommunities() {
  try {
    const communities = await Community.model
      .find({}, [
        'name',
        'description',
        'admin',
        'private',
        'scaleEventType',
        'type',
        'university',
        'members',
        'pendingMembers',
      ])
      .populate({ path: 'university', select: 'universityName' })
      .populate({
        path: 'admin',
        select: ['_id', 'firstName', 'lastName', 'email'],
      });

    log('info', `Retrieved ${communities.length} communities`);
    return sendPacket(1, 'Successfully retrieved all communities', { communities });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function editCommunity(
  _id: ObjectIdType,
  name: string,
  description: string,
  adminID: ObjectIdType,
  type: CommunityType,
  isPrivate: boolean,
  additionalFlags: { scaleEventType?: string } = {},
  options: { returnCommunity?: boolean } = {}
) {
  try {
    const communityPromise = Community.model
      .updateOne(
        { _id },
        {
          $set: {
            name,
            description,
            admin: adminID,
            type,
            private: isPrivate,
            scaleEventType: additionalFlags.scaleEventType,
          },
          $addToSet: { members: adminID },
        }
      )
      .exec();

    const userPromise = User.model
      .updateOne({ _id: adminID }, { $addToSet: { joinedCommunities: _id } })
      .exec();
    await Promise.all([communityPromise, userPromise]);

    let community;
    if (options.returnCommunity) {
      community = await Community.model.findById(_id).exec();
    }

    log('info', `Successfully updated community ${name}`);
    return sendPacket(1, 'Successfully updated community', {
      community,
    });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function deleteCommunity(communityID: ObjectIdType) {
  try {
    const communityExists = await Community.model.exists({ _id: communityID });
    if (!communityExists) return sendPacket(0, 'Community does not exist');

    const community = await Community.model
      .findById(communityID)
      .select([
        'name',
        'members',
        'pendingMembers',
        'university',
        'profilePicture',
        'bannerPicture',
        'followedByCommunities',
        'followingCommunities',
        'outgoingPendingCommunityFollowRequests',
        'incomingPendingCommunityFollowRequests',
        'internalCurrentMemberPosts',
        'internalAlumniPosts',
        'externalPosts',
        'postsToOtherCommunities',
        'broadcastedPosts',
      ])
      .populate('followedByCommunities', 'from')
      .populate('followingCommunities', 'to')
      .populate('incomingPendingCommunityFollowRequests', 'from')
      .populate('outgoingPendingCommunityFollowRequests', 'to')
      .populate('internalCurrentMemberPosts', 'user')
      .populate('internalAlumniPosts', 'user')
      .populate('externalPosts', 'user')
      .populate('postsToOtherCommunities', 'user')
      .populate('broadcastedPosts', 'user')
      .exec();

    //Actions:
    const promises = [];
    //1 - Delete Posts
    community.internalCurrentMemberPosts.forEach((currPost) => {
      promises.push(deletePost(currPost._id, currPost.user));
    });
    community.internalAlumniPosts.forEach((currPost) => {
      promises.push(deletePost(currPost._id, currPost.user));
    });
    community.externalPosts.forEach((currPost) => {
      promises.push(deletePost(currPost._id, currPost.user));
    });
    community.postsToOtherCommunities.forEach((currPost) => {
      promises.push(deletePost(currPost._id, currPost.user));
    });
    community.broadcastedPosts.forEach((currPost) => {
      promises.push(deletePost(currPost._id, currPost.user));
    });
    //2 - Remove community from other communities' pending lists
    community.outgoingPendingCommunityFollowRequests.forEach(async (currRequest) => {
      promises.push(
        Community.model
          .updateOne(
            { _id: currRequest.to },
            { $pull: { incomingPendingCommunityFollowRequests: currRequest._id } }
          )
          .exec()
      );
      promises.push(CommunityEdge.model.deleteOne({ _id: currRequest._id }).exec());
    });
    community.incomingPendingCommunityFollowRequests.forEach((currRequest) => {
      promises.push(
        Community.model
          .updateOne(
            { _id: currRequest.from },
            { $pull: { outgoingPendingCommunityFollowRequests: currRequest._id } }
          )
          .exec()
      );
      promises.push(CommunityEdge.model.deleteOne({ _id: currRequest._id }).exec());
    });
    //3 - Remove community from other communities' follow lists
    community.followingCommunities.forEach((currRequest) => {
      promises.push(
        Community.model
          .updateOne(
            { _id: currRequest.to },
            { $pull: { followedByCommunities: currRequest._id } }
          )
          .exec()
      );
      promises.push(CommunityEdge.model.deleteOne({ _id: currRequest._id }).exec());
    });
    community.followedByCommunities.forEach((currRequest) => {
      promises.push(
        Community.model
          .updateOne(
            { _id: currRequest.from },
            { $pull: { followingCommunities: currRequest._id } }
          )
          .exec()
      );
      promises.push(CommunityEdge.model.deleteOne({ _id: currRequest._id }).exec());
    });
    //4 - Remove community from members' pending and existing community lists
    community.pendingMembers.forEach((currPending) => {
      promises.push(
        User.model
          .updateOne(
            { _id: currPending },
            { $pull: { pendingCommunities: community._id } }
          )
          .exec()
      );
    });
    community.members.forEach((currMember) => {
      promises.push(
        User.model
          .updateOne(
            { _id: currMember },
            { $pull: { joinedCommunities: community._id } }
          )
          .exec()
      );
    });
    //5 - Remove community from University's communities list
    promises.push(
      University.model
        .updateOne(
          { _id: community.university },
          { $pull: { communities: community._id } }
        )
        .exec()
    );
    //6 - Delete images
    if (community.profilePicture)
      promises.push(
        deleteFile('images', 'communityProfile', community.profilePicture)
      );
    if (community.bannerPicture)
      promises.push(
        deleteFile('images', 'communityBanner', community.bannerPicture)
      );
    //7 - Delete community
    promises.push(Community.model.deleteOne({ _id: communityID }).exec());

    return Promise.all([promises]).then((values) => {
      log(
        'info',
        `Successfully deleted community ${community.name} and handled all propagation`
      );
      return sendPacket(1, `Successfully deleted community ${community.name}`);
    });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}
