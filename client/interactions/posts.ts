import { log, sendPacket, retrieveSignedUrl } from '../helpers/functions';
import { Post, User } from '../models';

const NUM_POSTS_RETRIEVED = 20;

export async function createBroadcastUserPost(message: string, userID: string) {
  try {
    const post = await new Post({ message, user: userID }).save();
    await User.updateOne({ _id: userID }, { $push: { broadcastedPosts: post._id } });

    log('info', `Successfully created for user ${userID}`);
    return sendPacket(1, 'Successfully created post', { newPost: post });
  } catch (err) {
    log('error', err);
    return sendPacket(0, err);
  }
}

export async function getGeneralFeed(universityID: string) {
  try {
    const posts = await Post.aggregate([
      { $match: { university: universityID } },
      { $sort: { createdAt: -1 } },
      { $limit: NUM_POSTS_RETRIEVED },
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
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          user: {
            _id: '$user._id',
            firstName: '$user.firstName',
            lastName: '$user.lastName',
            profilePicture: '$user.profilePicture',
          },
        },
      },
    ]).exec();

    const imagePromises = [];

    for (let i = 0; i < posts.length; i++) {
      if (posts[i].user.profilePicture) {
        try {
          const signedImageUrlPromise = retrieveSignedUrl(
            'profile',
            posts[i].user.profilePicture
          );
          imagePromises.push(signedImageUrlPromise);
        } catch (err) {
          log('error', err);
          imagePromises.push(null);
        }
      } else {
        imagePromises.push(null);
      }
    }
    return Promise.all(imagePromises)
      .then((signedImageURLs) => {
        for (let i = 0; i < posts.length; i++)
          if (signedImageURLs[i]) posts[i].user.profilePicture = signedImageURLs[i];

        return sendPacket(1, 'Successfully retrieved the latest posts', { posts });
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

export async function getPostsByUser(userID: string) {
  try {
    const user = await User.findById(userID).select(['broadcastedPosts']).exec();
    if (!user) return sendPacket(0, 'Could not find user');

    const posts = await Post.aggregate([
      { $match: { _id: { $in: user.broadcastedPosts } } },
      { $sort: { createdAt: -1 } },
      { $limit: NUM_POSTS_RETRIEVED },
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
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          user: {
            _id: '$user._id',
            firstName: '$user.firstName',
            lastName: '$user.lastName',
            profilePicture: '$user.profilePicture',
          },
        },
      },
    ]).exec();

    log('info', `Successfully retrieved all posts by user ${userID}`);
    return sendPacket(1, 'Successfully retrieved all posts by user', { posts });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}
