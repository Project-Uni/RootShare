import { Types } from 'mongoose';

import {
  Community,
  CommunityEdge,
  User,
  University,
  Image,
  ICommunity,
  IUser,
  ICommunityEdge,
  IConnection,
} from '../rootshare_db/models';
import { CommunityGetOptions } from '../rootshare_db/models/communities';
import { CommunityType, U2CR, AccountType } from '../rootshare_db/types';
import {
  log,
  sendPacket,
  retrieveSignedUrl,
  deleteFile,
} from '../helpers/functions';
import {
  generateSignedProfilePromises,
  connectionsToUserIDStrings,
  getUserToUserRelationship,
  addCalculatedUserFields,
  addProfilePicturesAll,
} from './utilities';
import { retrieveAllUrls } from './media';
import { deletePost } from './posts';

type ObjectIdType = Types.ObjectId;

export async function createNewCommunity(
  name: string,
  description: string,
  adminID: ObjectIdType,
  type: CommunityType,
  isPrivate: boolean,
  additionalFlags: { isMTG?: boolean } = {},
  options: {} = {}
) {
  const userExists = await User.model.exists({ _id: adminID });
  if (!userExists) return sendPacket(0, 'Admin does not exist');

  const newCommunity = new Community.model({
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

    const adminUpdate = User.model
      .updateOne(
        { _id: adminID },
        { $addToSet: { joinedCommunities: savedCommunity._id } }
      )
      .exec();

    const universityUpdate = University.model
      .updateOne(
        { _id: savedCommunity.university },
        { $push: { communities: savedCommunity._id } }
      )
      .exec();

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

export async function retrieveAllCommunities() {
  try {
    const communities = await Community.model
      .find({}, [
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
  _id: ObjectIdType,
  name: string,
  description: string,
  adminID: ObjectIdType,
  type: CommunityType,
  isPrivate: boolean,
  additionalFlags: { isMTG?: boolean } = {},
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
            isMTGFlag: additionalFlags.isMTG || false,
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

export async function getCommunityInformation(
  communityID: ObjectIdType,
  userID: ObjectIdType
) {
  try {
    const communityPromise = Community.model
      .findById(communityID, [
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

    const userPromise = User.model
      .findById(userID)
      .select(['connections', 'joinedCommunities'])
      .populate({ path: 'connections', select: ['from', 'to', 'accepted'] })
      .exec();

    return Promise.all([communityPromise, userPromise])
      .then(([community, user]) => {
        //Calculating Connections in Community
        const connections = connectionsToUserIDStrings(
          userID,
          user.connections as IConnection[]
        );
        const members = (community.members as ObjectIdType[]).map(
          (member) => member
        );

        const mutualConnections = members.filter(
          (member) => connections.indexOf(member) !== -1
        );

        let hasFollowingAccess = false;

        if (community.private) {
          const followedByCommunities = (community.followedByCommunities as ICommunityEdge[]).map(
            (community) => community.from.toString()
          );
          const communityIntersection = (user.joinedCommunities as ObjectIdType[]).filter(
            (community) => followedByCommunities.includes(community.toString())
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

export async function joinCommunity(
  communityID: ObjectIdType,
  userID: ObjectIdType
) {
  try {
    let userPromise = User.model.findById(userID).exec();
    let communityPromise = Community.model.findById(communityID).exec();

    return Promise.all([userPromise, communityPromise]).then((values) => {
      const [user, community] = values;

      var userUpdatePromise;
      var communityUpdatePromise;
      var isMember = true;
      var newStatus = '';

      //Update community DB entry
      if (
        (community.members as ObjectIdType[]).indexOf(userID) === -1 &&
        (community.pendingMembers as ObjectIdType[]).indexOf(userID) === -1
      ) {
        isMember = false;

        if (community.private === false) {
          communityUpdatePromise = Community.model
            .updateOne({ _id: communityID }, { $addToSet: { members: userID } })
            .exec();

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
          communityUpdatePromise = Community.model
            .updateOne(
              { _id: communityID },
              { $addToSet: { pendingMembers: userID } }
            )
            .exec();

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
        (user.joinedCommunities as ObjectIdType[]).indexOf(communityID) === -1 &&
        (user.pendingCommunities as ObjectIdType[]).indexOf(communityID) == -1
      ) {
        isMember = false;
        if (community.private === false) {
          userUpdatePromise = User.model
            .updateOne(
              { _id: userID },
              { $addToSet: { joinedCommunities: communityID } }
            )
            .exec();

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
          userUpdatePromise = User.model
            .updateOne(
              { _id: userID },
              { $addToSet: { pendingCommunities: communityID } }
            )
            .exec();

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

export async function getAllPendingMembers(communityID: ObjectIdType) {
  try {
    const { pendingMembers } = (await Community.model
      .findById(communityID)
      .select(['pendingMembers'])
      .populate({
        path: 'pendingMembers',
        select: ['_id', 'firstName', 'lastName', 'profilePicture'],
      })) as { pendingMembers: IUser[] };

    for (let i = 0; i < pendingMembers.length; i++) {
      let pictureFileName = `${pendingMembers[i]._id}_profile.jpeg`;

      try {
        if (pendingMembers[i].profilePicture)
          pictureFileName = pendingMembers[i].profilePicture;
      } catch (err) {
        log('err', err);
      }

      const imageURL = await retrieveSignedUrl('images', 'profile', pictureFileName);
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

export async function rejectPendingMember(
  communityID: ObjectIdType,
  userID: ObjectIdType
) {
  try {
    const communityPromise = Community.model
      .updateOne({ _id: communityID }, { $pull: { pendingMembers: userID } })
      .exec();

    const userPromise = User.model
      .updateOne({ _id: userID }, { $pull: { pendingCommunities: communityID } })
      .exec();

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

export async function acceptPendingMember(
  communityID: ObjectIdType,
  userID: ObjectIdType
) {
  try {
    const community = await Community.model.findOne({
      _id: communityID,
      pendingMembers: { $elemMatch: { $eq: userID } },
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
    const communityPromise = Community.model
      .updateOne(
        { _id: communityID },
        {
          $pull: { pendingMembers: userID },
          $addToSet: { members: userID },
        }
      )
      .exec();

    const userPromise = User.model
      .updateOne(
        { _id: userID },
        {
          $pull: { pendingCommunities: communityID },
          $addToSet: { joinedCommunities: communityID },
        }
      )
      .exec();

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

export async function leaveCommunity(
  communityID: ObjectIdType,
  userID: ObjectIdType
) {
  try {
    const communityPromise = Community.model
      .updateOne({ _id: communityID }, { $pull: { members: userID } })
      .exec();

    const userPromise = User.model
      .updateOne({ _id: userID }, { $pull: { joinedCommunities: communityID } })
      .exec();

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

export function cancelCommunityPendingRequest(
  communityID: ObjectIdType,
  userID: ObjectIdType
) {
  try {
    const communityPromise = Community.model
      .updateOne({ _id: communityID }, { $pull: { pendingMembers: userID } })
      .exec();

    const userPromise = User.model
      .updateOne({ _id: userID }, { $pull: { pendingCommunities: communityID } })
      .exec();

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
  requestToFollowCommunityID: ObjectIdType,
  yourCommunityID: ObjectIdType,
  userID: ObjectIdType
) {
  try {
    //Checking if the user who requested to follow is the admin of the community they are following as
    const checkAdminPromise = Community.model.exists({
      _id: yourCommunityID,
      admin: userID,
    });
    //Checks if other community exists
    const communityExistsPromise = Community.model.exists({
      _id: requestToFollowCommunityID,
    });

    //Checks to see if there is an already existing follow request
    const edgeExistsPromise = CommunityEdge.model.exists({
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
        const followEdge = await new CommunityEdge.model({
          from: yourCommunityID,
          to: requestToFollowCommunityID,
        }).save();
        const otherCommunityPromise = Community.model
          .updateOne(
            { _id: requestToFollowCommunityID },
            { $addToSet: { incomingPendingCommunityFollowRequests: followEdge._id } }
          )
          .exec();
        const yourCommunityPromise = Community.model
          .updateOne(
            { _id: yourCommunityID },
            { $addToSet: { outgoingPendingCommunityFollowRequests: followEdge._id } }
          )
          .exec();

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

export async function acceptFollowRequest(
  yourCommunityID: ObjectIdType,
  edgeID: ObjectIdType
) {
  try {
    const edge = await CommunityEdge.model.findOne({
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
    const yourCommunityPromise = Community.model
      .updateOne(
        { _id: yourCommunityID },
        {
          $pull: { incomingPendingCommunityFollowRequests: edgeID },
          $addToSet: { followedByCommunities: edgeID },
        }
      )
      .exec();
    const otherCommunityPromise = Community.model
      .updateOne(
        { _id: edge.from },
        {
          $pull: { outgoingPendingCommunityFollowRequests: edgeID },
          $addToSet: { followingCommunities: edgeID },
        }
      )
      .exec();

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

export async function rejectFollowRequest(
  yourCommunityID: ObjectIdType,
  edgeID: ObjectIdType
) {
  try {
    //Checking if edge exists given paramters
    const edge = await CommunityEdge.model.findOne({
      _id: edgeID,
      to: yourCommunityID,
      accepted: false,
    });
    if (!edge) {
      log('error', `No edge exists with ID ${edgeID}`);
      return sendPacket(0, 'No edge exists with given ID');
    }

    //Deletes edge and pulls from DB entries for both communities
    const yourCommunityPromise = Community.model
      .updateOne(
        { _id: yourCommunityID },
        { $pull: { incomingPendingCommunityFollowRequests: edgeID } }
      )
      .exec();
    const otherCommunityPromise = Community.model
      .updateOne(
        { _id: edge.from },
        { $pull: { outgoingPendingCommunityFollowRequests: edgeID } }
      )
      .exec();
    const edgePromise = CommunityEdge.model.deleteOne({ _id: edgeID });

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
  fromCommunityID: ObjectIdType,
  toCommunityID: ObjectIdType,
  userID: ObjectIdType
) {
  try {
    //Checking if user is admin of community
    const isAdmin = await Community.model.exists({
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
    const edge = await CommunityEdge.model.findOne({
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
    const fromCommunityPromise = Community.model
      .updateOne(
        { _id: fromCommunityID },
        { $pull: { outgoingPendingCommunityFollowRequests: edgeID } }
      )
      .exec();
    const toCommunityPromise = Community.model
      .updateOne(
        { _id: toCommunityID },
        { $pull: { incomingPendingCommunityFollowRequests: edgeID } }
      )
      .exec();
    const edgePromise = CommunityEdge.model.deleteOne({ _id: edgeID });

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
  fromCommunityID: ObjectIdType,
  toCommunityID: ObjectIdType,
  userID: ObjectIdType
) {
  try {
    //Checking if user is admin of community
    const isAdmin = await Community.model.exists({
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
    const edge = await CommunityEdge.model.findOne({
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
    const fromCommunityPromise = Community.model
      .updateOne(
        { _id: fromCommunityID },
        { $pull: { followingCommunities: edgeID } }
      )
      .exec();
    const toCommunityPromise = Community.model
      .updateOne(
        { _id: toCommunityID },
        { $pull: { followedByCommunities: edgeID } }
      )
      .exec();
    const edgePromise = CommunityEdge.model.deleteOne({ _id: edgeID });

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

export async function getAllFollowingCommunities(communityID: ObjectIdType) {
  try {
    //TODO - Update this to use aggregation pipeline
    const community = await Community.model
      .findById(communityID)
      .select(['followingCommunities'])
      .populate({
        path: 'followingCommunities',
        select: 'to',
        populate: {
          path: 'to',
          select: 'name description type profilePicture members',
        },
      });

    const followingCommunities = (community.followingCommunities as ICommunityEdge[]).map(
      (edge) => {
        return edge.to as ICommunity;
      }
    );

    const profilePicturePromises = generateSignedProfilePromises(
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

export async function getAllFollowedByCommunities(communityID: ObjectIdType) {
  try {
    //TODO - Update this to use aggregation pipeline
    const community = await Community.model
      .findById(communityID)
      .select(['followedByCommunities'])
      .populate({
        path: 'followedByCommunities',
        select: 'from',
        populate: {
          path: 'from',
          select: 'name description type profilePicture members',
        },
      });

    const followedByCommunities = (community.followedByCommunities as ICommunityEdge[]).map(
      (edge) => {
        return edge.from as ICommunity;
      }
    );

    const profilePicturePromises = generateSignedProfilePromises(
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

export async function getAllPendingFollowRequests(communityID: ObjectIdType) {
  try {
    const community = await Community.model
      .findById(communityID)
      .select(['incomingPendingCommunityFollowRequests'])
      .populate({
        path: 'incomingPendingCommunityFollowRequests',
        select: 'from',
        populate: {
          path: 'from',
          select: 'name description type profilePicture',
        },
      });

    const pendingFollowRequests = (community.incomingPendingCommunityFollowRequests as ICommunityEdge[]).map(
      (edge) => {
        return { edgeID: edge._id, ...(edge.from as ICommunity) };
      }
    );

    const profilePicturePromises = generateSignedProfilePromises(
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
  userID: ObjectIdType,
  communityID: ObjectIdType,
  options: { skipCalculation?: boolean } = {}
) {
  try {
    const communityPromise = Community.model
      .findById(communityID)
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

    const userPromise = User.model
      .findById(userID)
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

        let { members } = community as { members: IUser[] };

        if (!options.skipCalculation) {
          const userConnections = connectionsToUserIDStrings(
            userID,
            user.connections as IConnection[]
          );

          for (let i = 0; i < members.length; i++) {
            let cleanedMember: any = members[i];
            cleanedMember.connections = connectionsToUserIDStrings(
              cleanedMember._id,
              cleanedMember.connections as IConnection[]
            );

            cleanedMember = await addCalculatedUserFields(
              userConnections,
              user.joinedCommunities as ObjectIdType[],
              cleanedMember
            );

            getUserToUserRelationship(
              user.connections as IConnection[],
              user.pendingConnections as IConnection[],
              members[i] as {
                [key: string]: any;
                _id: ObjectIdType;
                connections: IConnection[];
                pendingConnections: ObjectIdType[];
                joinedCommunities: ObjectIdType[];
              },
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

export async function getCommunityMedia(
  userID: ObjectIdType,
  userAccountType: AccountType,
  communityID: ObjectIdType
) {
  try {
    const communityRelationship = (
      await Community.getUserToCommunityRelationship_V2({
        userID,
        communityIDs: [communityID],
      })
    )[0].relationship;

    let fields = ['externalPosts', 'broadcastedPosts'];
    if (communityRelationship === U2CR.JOINED)
      if (userAccountType === 'alumni') fields.push('internalAlumniPosts');
      else if (userAccountType === 'student')
        fields.push('internalCurrentMemberPosts');
      else if (communityRelationship === U2CR.ADMIN)
        fields.push('internalAlumniPosts', 'internalCurrentMemberPosts');

    const {
      externalPosts,
      broadcastedPosts,
      internalAlumniPosts = [],
      internalCurrentMemberPosts = [],
    } = (await Community.model
      .findById(communityID, fields)
      .lean<ICommunity>()
      .exec()) as {
      externalPosts: ObjectIdType[];
      broadcastedPosts: ObjectIdType[];
      internalAlumniPosts: ObjectIdType[];
      internalCurrentMemberPosts: ObjectIdType[];
    };

    const postIDs = externalPosts.concat(
      broadcastedPosts,
      internalAlumniPosts,
      internalCurrentMemberPosts
    );

    const imageDocs = await Image.model
      .find({ post: { $in: postIDs } }, ['fileName'])
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()
      .exec();

    const images = await retrieveAllUrls(
      imageDocs.map((image) => {
        return { ...image, reason: 'postImage' };
      })
    );
    return sendPacket(1, 'Sending images', { images });
  } catch (err) {
    log('err', err.stack);
    return sendPacket(-1, err);
  }
}

export async function updateFields(
  communityID: ObjectIdType,
  fields: { [key: string]: any }
) {
  const updates: {
    description?: string;
    private?: boolean;
    type?: CommunityType;
    name?: string;
  } = Object.assign({}, fields);

  try {
    await Community.model.updateOne({ _id: communityID }, updates).exec();
    return sendPacket(1, 'Successfully updated community');
  } catch (err) {
    log('error', err);
    return sendPacket(-1, 'There was an error trying to update the community', {
      error: err.message,
    });
  }
}

export const getCommunitiesGeneric = async (
  _ids: ObjectIdType[],
  params: {
    fields?: typeof Community.AcceptedFields[number][];
    options?: CommunityGetOptions;
  }
) => {
  try {
    const communities = await Community.getByIDs(_ids, params);
    return sendPacket(1, 'Successfully retrieved communities', { communities });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, 'Failed to retrieve communities', { error: err.message });
  }
};
