import { log, sendPacket, retrieveSignedUrl } from '../helpers/functions';
import { Post, Comment, User } from '../models';

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

export async function leaveCommentOnPost(
  userID: string,
  postID: string,
  message: string
) {
  const cleanedMessage = message.trim();
  if (cleanedMessage.length === 0) {
    return sendPacket(0, 'Message is empty');
  }
  try {
    const userExistsPromise = User.exists({ _id: userID }).exec();
    const postExistsPromise = Post.exists({ _id: postID }).exec();

    return Promise.all([userExistsPromise, postExistsPromise])
      .then(async ([userExists, postExists]) => {
        if (!userExists) return sendPacket(0, 'Invalid userID provided');
        if (!postExists) return sendPacket(0, 'Invalid PostID provided');

        const comment = new Comment({
          user: userID,
          message: cleanedMessage,
          post: postID,
        });

        const savedComment = await comment.save();
        return sendPacket(1, `Successfully posted comment on post ${postID}`, {
          comment: savedComment,
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
