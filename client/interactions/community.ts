const mongoose = require('mongoose');

import { Community, CommunityEdge, User, University } from '../models';
import {
  log,
  sendPacket,
  retrieveSignedUrl,
  deleteFile,
} from '../helpers/functions';
import { CommunityType, U2CR } from '../helpers/types';
import {
  generateSignedImagePromises,
  connectionsToUserIDStrings,
  getUserToUserRelationship,
  addCalculatedUserFields,
  addCalculatedCommunityFields,
  getUserToCommunityRelationship,
  addProfilePicturesAll,
} from '../interactions/utilities';
import { deletePost } from './posts';
import { CommunityC, CommunityGetOptions } from '../models/communities';

export async function createNewCommunity(
  name: string,
  description: string,
  adminID: string,
  type: CommunityType,
  isPrivate: boolean,
  additionalFlags: { isMTG?: boolean } = {},
  options: {} = {}
) {
  const userExists = await User.exists({ _id: adminID });
  if (!userExists) return sendPacket(0, 'Admin does not exist');

  const newCommunity = new Community({
    name,
    description,
    type,
    private: isPrivate,
    admin: adminID,
    members: [adminID],
    isMTGFlag: additionalFlags.isMTG || false,
  });

  try {
    const savedCommunity = await newCommunity.save();

    const adminUpdate = User.updateOne(
      { _id: adminID },
      { $addToSet: { joinedCommunities: savedCommunity._id } }
    ).exec();

    const universityUpdate = University.updateOne(
      { _id: savedCommunity.university },
      { $push: { communities: savedCommunity._id } }
    ).exec();

    return Promise.all([adminUpdate, universityUpdate]).then(() => {
      log('info', `Successfully created community ${name}`);
      return sendPacket(1, 'Successfully created new community', {
        community: savedCommunity,
      });
    });
  } catch (err) {
    log('error', err);
    return sendPacket(0, `Failed to create community ${name}`);
  }
}

export async function deleteCommunity(communityID) {
  try {
    const communityExists = await Community.exists({ _id: communityID });
    if (!communityExists) return sendPacket(0, 'Community does not exist');

    const community = await Community.findById(communityID)
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
        Community.updateOne(
          { _id: currRequest.to },
          { $pull: { incomingPendingCommunityFollowRequests: currRequest._id } }
        ).exec()
      );
      promises.push(CommunityEdge.deleteOne({ _id: currRequest._id }).exec());
    });
    community.incomingPendingCommunityFollowRequests.forEach((currRequest) => {
      promises.push(
        Community.updateOne(
          { _id: currRequest.from },
          { $pull: { outgoingPendingCommunityFollowRequests: currRequest._id } }
        ).exec()
      );
      promises.push(CommunityEdge.deleteOne({ _id: currRequest._id }).exec());
    });
    //3 - Remove community from other communities' follow lists
    community.followingCommunities.forEach((currRequest) => {
      promises.push(
        Community.updateOne(
          { _id: currRequest.to },
          { $pull: { followedByCommunities: currRequest._id } }
        ).exec()
      );
      promises.push(CommunityEdge.deleteOne({ _id: currRequest._id }).exec());
    });
    community.followedByCommunities.forEach((currRequest) => {
      promises.push(
        Community.updateOne(
          { _id: currRequest.from },
          { $pull: { followingCommunities: currRequest._id } }
        ).exec()
      );
      promises.push(CommunityEdge.deleteOne({ _id: currRequest._id }).exec());
    });
    //4 - Remove community from members' pending and existing community lists
    community.pendingMembers.forEach((currPending) => {
      promises.push(
        User.updateOne(
          { _id: currPending },
          { $pull: { pendingCommunities: community._id } }
        ).exec()
      );
    });
    community.members.forEach((currMember) => {
      promises.push(
        User.updateOne(
          { _id: currMember },
          { $pull: { joinedCommunities: community._id } }
        ).exec()
      );
    });
    //5 - Remove community from University's communities list
    promises.push(
      University.updateOne(
        { _id: community.university },
        { $pull: { communities: community._id } }
      ).exec()
    );
    //6 - Delete images
    if (community.profilePicture)
      promises.push(deleteFile('communityProfile', community.profilePicture));
    if (community.bannerPicture)
      promises.push(deleteFile('communityBanner', community.bannerPicture));
    //7 - Delete community
    promises.push(Community.deleteOne({ _id: communityID }).exec());

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

export async function retrieveAllCommunities() {
  try {
    const communities = await Community.find({}, [
      'name',
      'description',
      'admin',
      'private',
      'isMTGFlag',
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
  _id: string,
  name: string,
  description: string,
  adminID: string,
  type: CommunityType,
  isPrivate: boolean,
  additionalFlags: { isMTG?: boolean } = {},
  options: { returnCommunity?: boolean } = {}
) {
  try {
    const communityPromise = Community.updateOne(
      { _id },
      {
        $set: {
          name,
          description,
          admin: adminID,
          type,
          private: isPrivate,
          isMTGFlag: additionalFlags.isMTG || false,
        },
        $addToSet: { members: adminID },
      }
    ).exec();

    const userPromise = User.updateOne(
      { _id: adminID },
      { $addToSet: { joinedCommunities: _id } }
    ).exec();
    await Promise.all([communityPromise, userPromise]);

    let community;
    if (options.returnCommunity) {
      community = await Community.findById(_id).exec();
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

export async function getCommunityInformation(communityID: string, userID: string) {
  try {
    const communityPromise = Community.findById(communityID, [
      'name',
      'description',
      'admin',
      'private',
      'type',
      'members',
      'pendingMembers',
      'university',
      'profilePicture',
      'followedByCommunities',
      'incomingPendingCommunityFollowRequests',
      'isMTGFlag',
    ])
      .populate({ path: 'university', select: 'universityName' })
      .populate({
        path: 'admin',
        select: ['_id', 'firstName', 'lastName', 'email'],
      })
      .populate({
        path: 'incomingPendingCommunityFollowRequests',
        select: 'from',
      })
      .populate({ path: 'followedByCommunities', select: 'from' })
      .exec();

    const userPromise = User.findById(userID)
      .select(['connections', 'joinedCommunities'])
      .populate({ path: 'connections', select: ['from', 'to', 'accepted'] })
      .exec();

    return Promise.all([communityPromise, userPromise])
      .then(([community, user]) => {
        //Calculating Connections in Community
        const connections = connectionsToUserIDStrings(userID, user['connections']);
        const members = community.members.map((member) => member.toString());

        const mutualConnections = members.filter(
          (member) => connections.indexOf(member) !== -1
        );

        let hasFollowingAccess = false;

        if (community.private) {
          const followedByCommunities = community.followedByCommunities.map(
            (community) => community.from.toString()
          );
          const communityIntersection = user.joinedCommunities.filter((community) =>
            followedByCommunities.includes(community.toString())
          );
          if (communityIntersection.length > 0) hasFollowingAccess = true;
        }

        log(
          'info',
          `Successfully retrieved community information for ${community.name}`
        );
        return sendPacket(1, 'Successfully retrieved community', {
          community,
          mutualConnections,
          hasFollowingAccess,
        });
      })
      .catch((err) => {
        log('error', err);
        return sendPacket(-1, err);
      });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function joinCommunity(communityID: string, userID: string) {
  try {
    let userPromise = User.findById(userID).exec();
    let communityPromise = Community.findById(communityID).exec();

    return Promise.all([userPromise, communityPromise]).then((values) => {
      const [user, community] = values;

      var userUpdatePromise;
      var communityUpdatePromise;
      var isMember = true;
      var newStatus = '';

      //Update community DB entry
      if (
        community.members.indexOf(userID) === -1 &&
        community.pendingMembers.indexOf(userID) === -1
      ) {
        isMember = false;

        if (community.private === false) {
          communityUpdatePromise = Community.updateOne(
            { _id: communityID },
            { $addToSet: { members: userID } }
          ).exec();

          communityUpdatePromise
            .then(() =>
              log(
                'info',
                `User ${user.firstName} ${user.lastName} joined community ${community.name}`
              )
            )
            .catch((err) => {
              log('err', err);
              return sendPacket(
                -1,
                'There was an error pushing to user to list of community members'
              );
            });

          newStatus = U2CR.JOINED;
        } else {
          communityUpdatePromise = Community.updateOne(
            { _id: communityID },
            { $addToSet: { pendingMembers: userID } }
          ).exec();

          communityUpdatePromise
            .then(() => {
              log(
                'info',
                `User ${user.firstName} ${user.lastName} added to pending list for community ${community.name}`
              );
            })
            .catch((err) => {
              log('err', err);
              return sendPacket(
                -1,
                'There was an error pushing to user to list of community pending members'
              );
            });

          newStatus = U2CR.PENDING;
        }
      }

      //Update User DB Entry
      if (
        user.joinedCommunities.indexOf(communityID) === -1 &&
        user.pendingCommunities.indexOf(communityID) == -1
      ) {
        isMember = false;
        if (community.private === false) {
          userUpdatePromise = User.updateOne(
            { _id: userID },
            { $addToSet: { joinedCommunities: communityID } }
          ).exec();

          userUpdatePromise
            .then(() => {
              log(
                'info',
                `Successfully added community ${community.name} to joined list of communities for ${user.firstName} ${user.lastName}`
              );
            })
            .catch((err) => {
              log('error', err);
              return sendPacket(
                -1,
                'There was an error adding community to joined list for user'
              );
            });

          newStatus = U2CR.JOINED;
        } else {
          userUpdatePromise = User.updateOne(
            { _id: userID },
            { $addToSet: { pendingCommunities: communityID } }
          ).exec();

          userUpdatePromise
            .then(() => {
              log(
                'info',
                `Successfully added community ${community.name} to pending list of communities for ${user.firstName} ${user.lastName}`
              );
            })
            .catch((err) => {
              log('error', err);
              return sendPacket(
                -1,
                'There was an error adding community to pending list for user'
              );
            });

          newStatus = U2CR.PENDING;
        }
      }

      if (!isMember) {
        return Promise.all([userUpdatePromise, communityUpdatePromise]).then(
          (values) => {
            return sendPacket(
              1,
              `Successfully updated ${user.firstName} ${user.lastName} for community ${community.name}`,
              { newStatus }
            );
          }
        );
      } else {
        return sendPacket(
          0,
          `User is already a part of community ${community.name}`
        );
      }
    });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function getAllPendingMembers(communityID: string) {
  try {
    const { pendingMembers } = await Community.findById(communityID)
      .select(['pendingMembers'])
      .populate({
        path: 'pendingMembers',
        select: ['_id', 'firstName', 'lastName', 'profilePicture'],
      });

    for (let i = 0; i < pendingMembers.length; i++) {
      let pictureFileName = `${pendingMembers[i]._id}_profile.jpeg`;

      try {
        if (pendingMembers[i].profilePicture)
          pictureFileName = pendingMembers[i].profilePicture;
      } catch (err) {
        log('err', err);
      }

      const imageURL = await retrieveSignedUrl('profile', pictureFileName);
      if (imageURL) {
        pendingMembers[i].profilePicture = imageURL;
      }
    }

    log(
      'info',
      `Successfully retrieved all pending members for community ${communityID}`
    );

    return sendPacket(1, 'Successfully retrieved all pending members', {
      pendingMembers,
    });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function rejectPendingMember(communityID: string, userID: string) {
  try {
    const communityPromise = Community.updateOne(
      { _id: communityID },
      { $pull: { pendingMembers: userID } }
    ).exec();

    const userPromise = User.updateOne(
      { _id: userID },
      { $pull: { pendingCommunities: communityID } }
    ).exec();

    return Promise.all([communityPromise, userPromise])
      .then((values) => {
        log('info', `Rejected user ${userID} from community ${communityID}`);
        return sendPacket(1, 'Successfully rejected pending request');
      })
      .catch((err) => {
        log('error', err);
        return sendPacket(-1, err);
      });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function acceptPendingMember(communityID: string, userID: string) {
  try {
    const community = await Community.findOne({
      _id: communityID,
      pendingMembers: { $elemMatch: { $eq: mongoose.Types.ObjectId(userID) } },
    });
    if (!community) {
      log(
        'info',
        `Could not find pending request for user ${userID} in ${communityID}`
      );
      return sendPacket(0, 'Could not find pending request for user in community');
    }
  } catch (err) {
    log('error', err);
    return sendPacket(-1, 'There was an error');
  }

  try {
    const communityPromise = Community.updateOne(
      { _id: communityID },
      { $pull: { pendingMembers: userID }, $addToSet: { members: userID } }
    ).exec();

    const userPromise = User.updateOne(
      { _id: userID },
      {
        $pull: { pendingCommunities: communityID },
        $addToSet: { joinedCommunities: communityID },
      }
    ).exec();

    return Promise.all([communityPromise, userPromise])
      .then((values) => {
        log('info', `Accepted user ${userID} into community ${communityID}`);
        return sendPacket(1, 'Successfully accepted pending request');
      })
      .catch((err) => {
        log('error', err);
        return sendPacket(-1, err);
      });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function leaveCommunity(communityID: string, userID: string) {
  try {
    const communityPromise = Community.updateOne(
      { _id: communityID },
      { $pull: { members: userID } }
    ).exec();

    const userPromise = User.updateOne(
      { _id: userID },
      { $pull: { joinedCommunities: communityID } }
    ).exec();

    return Promise.all([communityPromise, userPromise])
      .then((values) => {
        log('info', `User ${userID} left community ${communityID}`);
        return sendPacket(1, 'Successfully left community', {
          newStatus: U2CR.OPEN,
        });
      })
      .catch((err) => {
        log('error', err);
        return sendPacket(-1, err);
      });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export function cancelCommunityPendingRequest(communityID: string, userID: string) {
  try {
    const communityPromise = Community.updateOne(
      { _id: communityID },
      { $pull: { pendingMembers: userID } }
    ).exec();

    const userPromise = User.updateOne(
      { _id: userID },
      { $pull: { pendingCommunities: communityID } }
    ).exec();

    return Promise.all([communityPromise, userPromise])
      .then((values) => {
        log(
          'info',
          `User ${userID} cancelled pending request for community ${communityID}`
        );
        return sendPacket(1, 'Successfully cancelled pending request', {
          newStatus: U2CR.OPEN,
        });
      })
      .catch((err) => {
        log('error', err);
        return sendPacket(-1, err);
      });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function followCommunity(
  requestToFollowCommunityID: string,
  yourCommunityID: string,
  userID: string
) {
  try {
    //Checking if the user who requested to follow is the admin of the community they are following as
    const checkAdminPromise = Community.exists({
      _id: yourCommunityID,
      admin: userID,
    });
    //Checks if other community exists
    const communityExistsPromise = Community.exists({
      _id: requestToFollowCommunityID,
    });

    //Checks to see if there is an already existing follow request
    const edgeExistsPromise = CommunityEdge.exists({
      from: yourCommunityID,
      to: requestToFollowCommunityID,
    });

    return Promise.all([
      checkAdminPromise,
      communityExistsPromise,
      edgeExistsPromise,
    ])
      .then(async ([isAdmin, communityExists, edgeExists]) => {
        if (!isAdmin) {
          log(
            'info',
            `User ${userID} who is not admin for community ${yourCommunityID} attempted to follow a different community`
          );
          return sendPacket(
            0,
            'User is not admin of community they are choosing to follow as.'
          );
        }
        if (!communityExists) {
          log(
            'info',
            `User ${userID} attempted to follow ${requestToFollowCommunityID} which does not exist`
          );
          return sendPacket(
            0,
            'The community you are trying to follow does not exist'
          );
        }
        if (edgeExists) {
          log(
            'info',
            `Attempting to create a follow request that already exists from ${yourCommunityID} to ${requestToFollowCommunityID}`
          );
          return sendPacket(
            0,
            'A follow request already exists from your community to the other community'
          );
        }

        //Creates and saves the new edge
        const followEdge = await new CommunityEdge({
          from: yourCommunityID,
          to: requestToFollowCommunityID,
        }).save();
        const otherCommunityPromise = Community.updateOne(
          { _id: requestToFollowCommunityID },
          { $addToSet: { incomingPendingCommunityFollowRequests: followEdge._id } }
        ).exec();
        const yourCommunityPromise = Community.updateOne(
          { _id: yourCommunityID },
          { $addToSet: { outgoingPendingCommunityFollowRequests: followEdge._id } }
        ).exec();

        return Promise.all([otherCommunityPromise, yourCommunityPromise])
          .then((values) => {
            log(
              'info',
              `Successfully created follow request from ${yourCommunityID} to ${requestToFollowCommunityID}`
            );
            return sendPacket(
              1,
              `Successfully requested to follow community ${requestToFollowCommunityID} as admin of ${yourCommunityID}`,
              { followEdge }
            );
          })
          .catch((err) => {
            log('error', err);
            return sendPacket(-1, err);
          });
      })
      .catch((err) => {
        log('error', err);
        return sendPacket(-1, err);
      });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function acceptFollowRequest(yourCommunityID: string, edgeID: string) {
  try {
    const edge = await CommunityEdge.findOne({
      _id: edgeID,
      to: yourCommunityID,
      accepted: false,
    });
    if (!edge) {
      log('error', `No edge exists with ID ${edgeID}`);
      return sendPacket(0, 'No edge exists with given ID');
    }

    edge.accepted = true;

    const edgeSavePromise = edge.save();
    const yourCommunityPromise = Community.updateOne(
      { _id: yourCommunityID },
      {
        $pull: { incomingPendingCommunityFollowRequests: edgeID },
        $addToSet: { followedByCommunities: edgeID },
      }
    ).exec();
    const otherCommunityPromise = Community.updateOne(
      { _id: edge.from },
      {
        $pull: { outgoingPendingCommunityFollowRequests: edgeID },
        $addToSet: { followingCommunities: edgeID },
      }
    ).exec();

    return Promise.all([
      edgeSavePromise,
      yourCommunityPromise,
      otherCommunityPromise,
    ])
      .then((values) => {
        log(
          'info',
          `Successfully accepted follow request ${edgeID} from ${edge.from} to ${yourCommunityID}`
        );
        return sendPacket(1, 'Successfully accepted follow request');
      })
      .catch((err) => {
        log('error', err);
        return sendPacket(-1, err);
      });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function rejectFollowRequest(yourCommunityID: string, edgeID: string) {
  try {
    //Checking if edge exists given paramters
    const edge = await CommunityEdge.findOne({
      _id: edgeID,
      to: yourCommunityID,
      accepted: false,
    });
    if (!edge) {
      log('error', `No edge exists with ID ${edgeID}`);
      return sendPacket(0, 'No edge exists with given ID');
    }

    //Deletes edge and pulls from DB entries for both communities
    const yourCommunityPromise = Community.updateOne(
      { _id: yourCommunityID },
      { $pull: { incomingPendingCommunityFollowRequests: edgeID } }
    ).exec();
    const otherCommunityPromise = Community.updateOne(
      { _id: edge.from },
      { $pull: { outgoingPendingCommunityFollowRequests: edgeID } }
    ).exec();
    const edgePromise = CommunityEdge.deleteOne({ _id: edgeID });

    return Promise.all([yourCommunityPromise, otherCommunityPromise, edgePromise])
      .then((values) => {
        log(
          'info',
          `Successfully rejected pending community follow request from ${edge.from} to ${yourCommunityID} and handled all propagation.`
        );
        return sendPacket(1, 'Successfully rejected follow request');
      })
      .catch((err) => {
        log('error', err);
        return sendPacket(-1, err);
      });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function cancelFollowRequest(
  fromCommunityID: string,
  toCommunityID: string,
  userID: string
) {
  try {
    //Checking if user is admin of community
    const isAdmin = await Community.exists({
      _id: fromCommunityID,
      admin: userID,
    });
    if (!isAdmin) {
      log(
        'info',
        `User ${userID} who is not admin for community ${fromCommunityID} attempted to cancel follow request to ${toCommunityID}`
      );
      return sendPacket(
        0,
        'User is not admin of community they are trying to reject the request as.'
      );
    }

    //Checking if edge exists given paramters
    const edge = await CommunityEdge.findOne({
      from: fromCommunityID,
      to: toCommunityID,
      accepted: false,
    });
    if (!edge) {
      log('error', `No edge exists between ${fromCommunityID} and ${toCommunityID}`);
      return sendPacket(0, 'No edge exists with given ID');
    }

    const edgeID = edge._id;

    //Deletes edge and pulls from DB entries for both communities
    const fromCommunityPromise = Community.updateOne(
      { _id: fromCommunityID },
      { $pull: { outgoingPendingCommunityFollowRequests: edgeID } }
    ).exec();
    const toCommunityPromise = Community.updateOne(
      { _id: toCommunityID },
      { $pull: { incomingPendingCommunityFollowRequests: edgeID } }
    ).exec();
    const edgePromise = CommunityEdge.deleteOne({ _id: edgeID });

    return Promise.all([fromCommunityPromise, toCommunityPromise, edgePromise])
      .then((values) => {
        log(
          'info',
          `Successfully cancelled pending community follow request from ${fromCommunityID} to ${toCommunityID} and handled all propagation.`
        );
        return sendPacket(1, 'Successfully rejected follow request');
      })
      .catch((err) => {
        log('error', err);
        return sendPacket(-1, err);
      });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function unfollowCommunity(
  fromCommunityID: string,
  toCommunityID: string,
  userID: string
) {
  try {
    //Checking if user is admin of community
    const isAdmin = await Community.exists({
      _id: fromCommunityID,
      admin: userID,
    });
    if (!isAdmin) {
      log(
        'info',
        `User ${userID} who is not admin for community ${fromCommunityID} attempted to cancel follow request to ${toCommunityID}`
      );
      return sendPacket(
        0,
        'User is not admin of community they are trying to reject the request as.'
      );
    }

    //Checking if edge exists given paramters
    const edge = await CommunityEdge.findOne({
      from: fromCommunityID,
      to: toCommunityID,
      accepted: true,
    });
    if (!edge) {
      log('error', `No edge exists between ${fromCommunityID} and ${toCommunityID}`);
      return sendPacket(0, 'No edge exists with given ID');
    }

    const edgeID = edge._id;

    //Deletes edge and pulls from DB entries for both communities
    const fromCommunityPromise = Community.updateOne(
      { _id: fromCommunityID },
      { $pull: { followingCommunities: edgeID } }
    ).exec();
    const toCommunityPromise = Community.updateOne(
      { _id: toCommunityID },
      { $pull: { followedByCommunities: edgeID } }
    ).exec();
    const edgePromise = CommunityEdge.deleteOne({ _id: edgeID });

    return Promise.all([fromCommunityPromise, toCommunityPromise, edgePromise])
      .then((values) => {
        log(
          'info',
          `Successfully removed edge from ${fromCommunityID} to ${toCommunityID} and handled all propagation.`
        );
        return sendPacket(1, 'Successfully stopped following community');
      })
      .catch((err) => {
        log('error', err);
        return sendPacket(-1, err);
      });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function getAllFollowingCommunities(communityID: string) {
  try {
    //TODO - Update this to use aggregation pipeline
    const community = await Community.findById(communityID)
      .select(['followingCommunities'])
      .populate({
        path: 'followingCommunities',
        select: 'to',
        populate: {
          path: 'to',
          select: 'name description type profilePicture members',
        },
      });

    const followingCommunities = community['followingCommunities'].map((edge) => {
      return edge.to;
    });

    const profilePicturePromises = generateSignedImagePromises(
      followingCommunities,
      'communityProfile'
    );

    return Promise.all(profilePicturePromises)
      .then((signedImageURLs) => {
        for (let i = 0; i < signedImageURLs.length; i++) {
          if (signedImageURLs[i])
            followingCommunities[i].profilePicture = signedImageURLs[i];
        }
        log(
          'info',
          `Successfully retrieved all communities that ${communityID} is following`
        );
        return sendPacket(1, 'Successfully retrieved all following communities', {
          communities: followingCommunities,
        });
      })
      .catch((err) => {
        log('error', err);
        return sendPacket(-1, err);
      });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function getAllFollowedByCommunities(communityID: string) {
  try {
    //TODO - Update this to use aggregation pipeline
    const community = await Community.findById(communityID)
      .select(['followedByCommunities'])
      .populate({
        path: 'followedByCommunities',
        select: 'from',
        populate: {
          path: 'from',
          select: 'name description type profilePicture members',
        },
      });

    const followedByCommunities = community['followedByCommunities'].map((edge) => {
      return edge.from;
    });

    const profilePicturePromises = generateSignedImagePromises(
      followedByCommunities,
      'communityProfile'
    );

    return Promise.all(profilePicturePromises)
      .then((signedImageURLs) => {
        for (let i = 0; i < signedImageURLs.length; i++) {
          if (signedImageURLs[i])
            followedByCommunities[i].profilePicture = signedImageURLs[i];
        }
        log(
          'info',
          `Successfully retrieved all communities that ${communityID} is followed by`
        );
        return sendPacket(1, 'Successfully retrieved all followed by communities', {
          communities: followedByCommunities,
        });
      })
      .catch((err) => {
        log('error', err);
        return sendPacket(-1, err);
      });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function getAllPendingFollowRequests(communityID: string) {
  try {
    const community = await Community.findById(communityID)
      .select(['incomingPendingCommunityFollowRequests'])
      .populate({
        path: 'incomingPendingCommunityFollowRequests',
        select: 'from',
        populate: {
          path: 'from',
          select: 'name description type profilePicture',
        },
      });

    const pendingFollowRequests = community[
      'incomingPendingCommunityFollowRequests'
    ].map((edge) => {
      return { edgeID: edge._id, ...edge.from.toObject() };
    });

    const profilePicturePromises = generateSignedImagePromises(
      pendingFollowRequests,
      'communityProfile'
    );

    return Promise.all(profilePicturePromises)
      .then((signedImageURLs) => {
        for (let i = 0; i < signedImageURLs.length; i++) {
          if (signedImageURLs[i])
            pendingFollowRequests[i].profilePicture = signedImageURLs[i];
        }
        log(
          'info',
          `Successfully retrieved all communities that ${communityID} has pending follow requests for`
        );
        return sendPacket(
          1,
          'Successfully retrieved pending follow request communities',
          {
            communities: pendingFollowRequests,
          }
        );
      })
      .catch((err) => {
        log('error', err);
        return sendPacket(-1, err);
      });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function getCommunityMembers(
  userID: string,
  communityID: string,
  options: { skipCalculation?: boolean } = {}
) {
  try {
    const communityPromise = Community.findById(communityID)
      .select(['members', 'name'])
      .populate({
        path: 'members',
        select:
          'firstName lastName university graduationYear work position profilePicture joinedCommunities connections pendingConnections email',
        populate: [
          { path: 'university', select: 'universityName' },
          { path: 'connections', select: 'from to accepted' },
        ],
      })
      .exec();

    const userPromise = User.findById(userID)
      .select(['connections', 'joinedCommunities', 'pendingConnections'])
      .populate([
        { path: 'connections', select: 'from to accepted' },
        { path: 'pendingConnections', select: 'from to accepted' },
      ])
      .exec();

    return Promise.all([communityPromise, userPromise]).then(
      async ([community, user]) => {
        if (!community) return sendPacket(0, 'Could not find community');
        if (!user) return sendPacket(0, 'Could not find current user');

        let { members } = community;

        if (!options.skipCalculation) {
          const userConnections = connectionsToUserIDStrings(
            userID,
            user.connections
          );

          for (let i = 0; i < members.length; i++) {
            let cleanedMember = members[i].toObject();
            cleanedMember.connections = connectionsToUserIDStrings(
              cleanedMember._id,
              cleanedMember.connections
            );

            cleanedMember = await addCalculatedUserFields(
              userConnections,
              user.joinedCommunities,
              cleanedMember
            );

            getUserToUserRelationship(
              user.connections,
              user.pendingConnections,
              members[i],
              cleanedMember
            );
            members[i] = cleanedMember;
          }
        }

        members = await addProfilePicturesAll(members, 'profile');
        return sendPacket(1, 'Sending Community Members', { members });
      }
    );
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function updateFields(
  communityID: string,
  fields: { [key: string]: any }
) {
  const acceptedFields = ['description', 'name', 'type', 'private'];
  const updates: {
    description?: string;
    private?: boolean;
    type?: CommunityType;
    name?: string;
  } = Object.assign(
    {},
    ...Object.keys(fields)
      .filter((k) => acceptedFields.includes(k))
      .map((key) => ({ [key]: fields[key] }))
  );

  try {
    await Community.updateOne({ _id: communityID }, updates).exec();
    return sendPacket(1, 'Successfully updated community');
  } catch (err) {
    log('error', err);
    return sendPacket(-1, 'There was an error trying to update the community', {
      error: err.message,
    });
  }
}

export const getCommunitiesGeneric = async (
  _ids: string[],
  params: {
    fields?: typeof CommunityC.AcceptedFields[number][];
    options?: CommunityGetOptions;
  }
) => {
  try {
    const communities = await CommunityC.getByIDs(_ids, params);
    return sendPacket(1, 'Successfully retrieved communities', { communities });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, 'Failed to retrieve communities', { error: err.message });
  }
};

export const getCommunitiesUniversityGeneric = async (
  university: string,
  params: {
    fields?: typeof CommunityC.AcceptedFields[number][];
    options?: CommunityGetOptions;
  }
) => {
  try {
    const communities = await CommunityC.getByUniveristy(university, params);

    return sendPacket(1, 'Successfully retrieved communities', { communities });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, 'Failed to retrieve communities', { error: err.message });
  }
};
