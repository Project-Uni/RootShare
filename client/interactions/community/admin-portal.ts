import {
  Community,
  CommunityBoardMember,
  User,
  IUser,
  ICommunityBoardMember,
} from '../../rootshare_db/models';
import { ObjectIdVal, ObjectIdType } from '../../rootshare_db/types';
import {
  log,
  sendPacket,
  capitalizeFirstLetter,
  retrieveSignedUrl,
} from '../../helpers/functions';
import { addProfilePicturesAll } from '../utilities';
import NotificationService from '../notification';

export async function getMembersCommunityAdmin(communityID: ObjectIdType) {
  const community = await Community.getByIDs([communityID], {
    fields: ['members', 'pendingMembers', 'boardMembers'],
    options: {
      populates: [
        { path: 'members', select: '_id profilePicture firstName lastName email' },
        {
          path: 'pendingMembers',
          select: '_id profilePicture firstName lastName email',
        },
        {
          path: 'boardMembers',
          select: '_id user title',
          populate: {
            path: 'user',
            select: '_id profilePicture firstName lastName email',
          },
        },
      ],
    },
  });
  const {
    members,
    pendingMembers,
    boardMembers: boardMembersRaw,
  } = community[0] as {
    members: IUser[];
    pendingMembers: IUser[];
    boardMembers: ICommunityBoardMember[];
  };
  const boardMembers = boardMembersRaw.map((boardMember) => {
    return { title: boardMember.title, ...boardMember.user };
  });

  const promises = [];
  promises.push(addProfilePicturesAll(members, 'profile'));
  promises.push(addProfilePicturesAll(pendingMembers, 'profile'));
  promises.push(addProfilePicturesAll(boardMembers, 'profile'));

  return Promise.all(promises).then(() => {
    return sendPacket(1, 'Sending member info for community admin', {
      members,
      pendingMembers,
      boardMembers,
    });
  });
}

export async function addMemberToBoard(
  communityID: ObjectIdType,
  userID: ObjectIdType,
  title: string
) {
  const memberPromise = Community.model.exists({
    _id: communityID,
    members: { $elemMatch: { $eq: userID } },
  });
  const boardMemberPromise = Community.model
    .findById(communityID)
    .populate({ path: 'boardMembers', select: 'user' })
    .lean<{
      boardMembers: { _id: ObjectIdType; user: ObjectIdType }[];
    }>();

  return Promise.all([memberPromise, boardMemberPromise]).then(
    async ([isMember, community]) => {
      const existingBoardMember = community.boardMembers
        .filter((boardMember) => boardMember.user.equals(userID))
        .shift();

      if (!isMember) return sendPacket(0, 'Cannot make this user a board member');

      if (existingBoardMember) {
        await CommunityBoardMember.model.updateOne(
          { _id: existingBoardMember._id },
          { title: title }
        );

        console.log('UPDATED');
        return sendPacket(1, `Successfully update board member's title`);
      }

      // const newBoardMember = await CommunityBoardMember.model.create({
      //   user: userID,
      //   community: communityID,
      //   title: capitalizeFirstLetter(title),
      // });
      // await Community.model.updateOne(
      //   { _id: communityID },
      //   { $push: { boardMembers: newBoardMember._id } }
      // );

      return sendPacket(
        1,
        `Successfully added member to community's executive board`
      );
    }
  );
}

export async function removeMemberFromBoard(
  communityID: ObjectIdType,
  userID: ObjectIdType
) {
  const isMainAdminPromise = Community.model.exists({
    _id: communityID,
    admin: userID,
  });
  const communityPromise = Community.model
    .findById(communityID)
    .populate({ path: 'boardMembers', select: 'user' })
    .lean<{
      boardMembers: { _id: ObjectIdType; user: ObjectIdType }[];
    }>();
  return Promise.all([isMainAdminPromise, communityPromise]).then(
    ([isMainAdmin, community]) => {
      if (isMainAdmin) return sendPacket(1, `Can't remove main admin from board`);
      const filteredMembers = community.boardMembers.filter((boardMember) =>
        boardMember.user.equals(userID)
      );
      if (filteredMembers.length === 0)
        return sendPacket(0, 'This member is not on the board currently');

      const boardMember = filteredMembers[0];
      const communityPromise = Community.model
        .updateOne(
          { _id: communityID },
          { $pull: { boardMembers: boardMember._id } }
        )
        .exec();
      const boardMemberPromise = CommunityBoardMember.model
        .deleteOne({
          _id: boardMember._id,
        })
        .exec();

      return Promise.all([communityPromise, boardMemberPromise]).then(() => {
        return sendPacket(1, 'Successfully removed board member');
      });
    }
  );
}

export async function getAllPendingMembers(communityID: ObjectIdType) {
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

    new NotificationService().communityAccept({
      communityID: communityID.toString(),
      forUser: userID.toString(),
    });
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
