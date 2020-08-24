import sendPacket from '../helpers/sendPacket';
import log from '../helpers/logger';

import { Community, User } from '../models';

import { COMMUNITY_TYPE } from '../types/types';

import { retrieveSignedUrl } from '../helpers/S3';

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
  });

  try {
    const savedCommunity = await newCommunity.save();

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
    log('info', `Successfully updated community ${name}`);
    return sendPacket(1, 'Successfully updated community', {
      community: savedCommunity,
    });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function getCommunityInformation(communityID: string) {
  try {
    const community = await Community.findById(communityID, [
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
      });

    log(
      'info',
      `Successfully retrieved community information for ${community.name}`
    );
    return sendPacket(1, 'Successfully retrieved community', { community });
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
        const user = await User.findById(pendingMembers[i]._id).select([
          'profilePicture',
        ]);
        if (user.profilePicture) pictureFileName = user.profilePicture;
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
