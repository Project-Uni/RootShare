const mongoose = require('mongoose');

import { Community, CommunityEdge, User } from '../models';
import { log, sendPacket, retrieveSignedUrl } from '../helpers/functions';
import { COMMUNITY_TYPE } from '../helpers/types';
import {
  generateSignedImagePromises,
  connectionsToUserIDStrings,
} from '../interactions/utilities';

export async function createNewCommunity(
  name: string,
  description: string,
  adminID: string,
  type: COMMUNITY_TYPE,
  isPrivate: boolean
) {
  //TODO - Add check to see if community with same name already exists

  const newCommunity = new Community({
    name,
    description,
    type,
    private: isPrivate,
    admin: adminID,
    members: [adminID],
  });

  try {
    const savedCommunity = await newCommunity.save();

    const adminUpdate = await User.updateOne(
      { _id: adminID },
      { $push: { joinedCommunities: savedCommunity._id } }
    ).exec();

    log('info', `Successfully created community ${name}`);
    return sendPacket(1, 'Successfully created new community', {
      community: savedCommunity,
    });
  } catch (err) {
    log('error', err);
    return sendPacket(0, `Failed to create community ${name}`);
  }
}

export async function retrieveAllCommunities() {
  try {
    const communities = await Community.find({}, [
      'name',
      'description',
      'admin',
      'private',
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
  type: COMMUNITY_TYPE,
  isPrivate: boolean
) {
  try {
    const community = await Community.findById({ _id });
    community.name = name;
    community.description = description;
    community.admin = adminID;
    community.type = type;
    community.private = isPrivate;

    const savedCommunity = await community.save();

    const communityPromise = Community.updateOne(
      { _id },
      { $addToSet: { members: adminID } }
    ).exec();
    const userPromise = User.updateOne(
      { _id: adminID },
      { $addToSet: { joinedCommunities: _id } }
    ).exec();
    await Promise.all([communityPromise, userPromise]);

    log('info', `Successfully updated community ${name}`);
    return sendPacket(1, 'Successfully updated community', {
      community: savedCommunity,
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
    ])
      .populate({ path: 'university', select: 'universityName' })
      .populate({
        path: 'admin',
        select: ['_id', 'firstName', 'lastName', 'email'],
      })
      .exec();

    const userPromise = User.findById(userID)
      .select('connections')
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

        log(
          'info',
          `Successfully retrieved community information for ${community.name}`
        );
        return sendPacket(1, 'Successfully retrieved community', {
          community,
          mutualConnections,
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
  communityID: string,
  userID: { [key: string]: any }
) {
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
            { $push: { members: userID } }
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

          newStatus = 'JOINED';
        } else {
          communityUpdatePromise = Community.updateOne(
            { _id: communityID },
            { $push: { pendingMembers: userID } }
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

          newStatus = 'PENDING';
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
            { $push: { joinedCommunities: communityID } }
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

          newStatus = 'JOINED';
        } else {
          userUpdatePromise = User.updateOne(
            { _id: userID },
            { $push: { pendingCommunities: communityID } }
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

          newStatus = 'PENDING';
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
      { $pull: { pendingMembers: userID }, $push: { members: userID } }
    ).exec();

    const userPromise = User.updateOne(
      { _id: userID },
      {
        $pull: { pendingCommunities: communityID },
        $push: { joinedCommunities: communityID },
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
        return sendPacket(1, 'Successfully left community', { newStatus: 'OPEN' });
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
          newStatus: 'OPEN',
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
    const community = await Community.findById(communityID)
      .select(['followingCommunities'])
      .populate({
        path: 'followingCommunities',
        select: 'to',
        populate: {
          path: 'to',
          select: 'name description type profilePicture',
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
    const community = await Community.findById(communityID)
      .select(['followedByCommunities'])
      .populate({
        path: 'followedByCommunities',
        select: 'from',
        populate: {
          path: 'from',
          select: 'name description type profilePicture',
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
      return edge.from;
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
