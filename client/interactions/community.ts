const mongoose = require('mongoose');

import { Community, User } from '../models';
import { log, sendPacket, retrieveSignedUrl } from '../helpers/functions';
import { COMMUNITY_TYPE } from '../helpers/types';

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

    if (community.members.indexOf(adminID) === -1) {
      const communityPromise = Community.updateOne(
        { _id },
        { $addToSet: { members: adminID } }
      ).exec();
      const userPromise = User.updateOne(
        { _id: adminID },
        { $addToSet: { joinedCommunities: _id } }
      ).exec();
      await Promise.all([communityPromise, userPromise]);
    }

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
        //Calculating Mutual Connections
        const connections = user['connections'].reduce((output, connection) => {
          if (connection.accepted) {
            const otherID =
              connection['from'].toString() != userID.toString()
                ? connection['from']
                : connection['to'];

            output.push(otherID.toString());
          }
          return output;
        }, []);

        const members = community.members.map((member) => member.toString());

        const mutualConnections = members.filter((member) => {
          if (connections.indexOf(member) !== -1) return true;
          return false;
        });

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
