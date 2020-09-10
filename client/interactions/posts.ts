import { log, sendPacket, retrieveSignedUrl } from '../helpers/functions';
import { Post } from '../models';

const NUM_POSTS_RETRIEVED = 20;

export async function createBroadcastUserPost(
  message: string,
  user: { [key: string]: any; firstName; lastName; _id }
) {
  try {
    const newPost = await new Post({ message, user: user._id }).save();

    log('info', `Successfully created for user ${user.firstName} ${user.lastName}`);
    return sendPacket(1, 'Successfully created post', { newPost });
  } catch (err) {
    log('error', err);
    return sendPacket(0, err);
  }
}

export async function getGeneralFeed(universityID: string) {
  try {
    const posts = await Post.find({ university: universityID })
      .sort({ createdAt: 'desc' })
      .limit(NUM_POSTS_RETRIEVED)
      .populate('user', 'firstName lastName profilePicture')
      .exec();

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
        }
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
    const posts = await Post.find({ user: userID })
      .sort({ createdAt: 'desc' })
      .limit(NUM_POSTS_RETRIEVED)
      .exec();

    log('info', `Successfully retrieved all posts by user ${userID}`);
    return sendPacket(1, 'Successfully retrieved all posts by user', { posts });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}
