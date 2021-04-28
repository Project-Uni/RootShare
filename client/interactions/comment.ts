import {
  Community,
  CommunityEdge,
  Comment,
  Post,
  User,
  Image,
  IImage,
  ICommunity,
  IConnection,
  ICommunityEdge,
  IUser,
} from '../rootshare_db/models';
import { AccountType, ObjectIdVal, ObjectIdType } from '../rootshare_db/types';
import {
  log,
  sendPacket,
  retrieveSignedUrl,
  uploadFile,
  decodeBase64Image,
  deleteFile,
} from '../helpers/functions';
import { generateSignedProfilePromises } from './utilities';
import { generatePostSignedImagePromises } from './post';
import NotificationService from './notification';

export async function leaveCommentOnPost(
  userID: ObjectIdType,
  postID: ObjectIdType,
  message: string
) {
  const cleanedMessage = message.trim();
  if (cleanedMessage.length === 0) {
    return sendPacket(0, 'Message is empty');
  }
  try {
    const userExistsPromise = await User.model.exists({ _id: userID });
    const postExistsPromise = await Post.model.exists({ _id: postID });

    return Promise.all([userExistsPromise, postExistsPromise])
      .then(async ([userExists, postExists]) => {
        if (!userExists) return sendPacket(0, 'Invalid userID provided');
        if (!postExists) return sendPacket(0, 'Invalid PostID provided');

        const comment = await new Comment.model({
          user: userID,
          message: cleanedMessage,
          post: postID,
        }).save();

        await comment
          .populate({
            path: 'user',
            select: 'firstName lastName email major work position graduationYear',
          })
          .execPopulate();

        await Post.model
          .updateOne({ _id: postID }, { $push: { comments: comment._id } })
          .exec();

        new NotificationService().comment({
          fromUser: userID.toString(),
          postID: postID.toString(),
          comment: message,
        });

        return sendPacket(1, `Successfully posted comment on post ${postID}`, {
          comment,
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

export async function retrieveComments(
  userID: ObjectIdType,
  postID: ObjectIdType,
  startingTimestamp: Date = new Date()
) {
  try {
    const post = await Post.model.findOne({ _id: postID }, ['comments']).exec();

    if (!post) return sendPacket(0, 'Post not found');

    const { comments: commentIDs } = post;

    const conditions = {
      $and: [
        { _id: { $in: commentIDs } },
        { createdAt: { $lt: startingTimestamp } },
      ],
    };

    const comments = await Comment.model
      .aggregate([
        { $match: conditions },
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            message: '$message',
            likes: { $size: '$likes' },
            liked: { $in: [userID, '$likes'] },
            createdAt: '$createdAt',
            updatedAt: '$updatedAt',
            user: {
              _id: '$user._id',
              firstName: '$user.firstName',
              lastName: '$user.lastName',
              profilePicture: '$user.profilePicture',
              major: '$user.major',
              graduationYear: '$user.graduationYear',
              work: '$user.work',
              position: '$user.position',
            },
          },
        },
      ])
      .exec();

    const imagePromises = generatePostSignedImagePromises(comments);

    return Promise.all(imagePromises)
      .then((signedImageURLs) => {
        for (let i = 0; i < comments.length; i++)
          if (signedImageURLs[i]) {
            comments[i].user.profilePicture = signedImageURLs[i];
          }

        return sendPacket(1, 'Successfully retrieved all comments', {
          comments,
        });
      })
      .catch((err) => {
        log('error', err);
        return sendPacket(
          1,
          'Successfully retrieved all comments, but failed to retrieve profile pictures',
          {
            comments,
          }
        );
      });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function toggleCommentLike(
  userID: ObjectIdType,
  commentID: ObjectIdType,
  liked: boolean
) {
  const commentExistsPromise = Comment.model.exists({ _id: commentID });
  const userExistsPromise = User.model.exists({ _id: userID });

  return Promise.all([commentExistsPromise, userExistsPromise]).then(
    async ([commentExists, userExists]) => {
      if (!commentExists) return sendPacket(0, 'Comment does not exist');
      if (!userExists) return sendPacket(0, 'User does not exist');

      const updateAction = liked ? '$addToSet' : '$pull';
      await Comment.model
        .updateOne({ _id: commentID }, { [updateAction]: { likes: userID } })
        .exec();

      // new NotificationService().like({
      //   fromUser: userID.toString(),
      //   postID: commentID.toString(),
      // });

      log(
        'info',
        `User ${userID} successfully updated like on comment ${commentID}`
      );
      return sendPacket(1, 'Successfully updated like on comment');
    }
  );
}
