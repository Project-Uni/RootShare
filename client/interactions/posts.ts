import { log, sendPacket, retrieveSignedUrl } from '../helpers/functions';
import { Community, Post } from '../models';
const mongoose = require('mongoose');

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

export async function createInternalCurrentMemberCommunityPost(
  communityID: string,
  userID: string,
  accountType: 'student' | 'alumni' | 'faculty' | 'fan',
  message: string,
  universityID: string
) {
  //Checking that user is a part of the community
  const community = await getValidatedCommunity(communityID, userID, ['admin']);
  if (!community) {
    log(
      'info',
      `User ${userID} attempted to post to internal current member feed for community ${communityID} they are not a member of`
    );
    return sendPacket(0, 'User is not a member of this community');
  }

  //Checking if person is a student or admin
  if (accountType !== 'student' && community.admin != userID) {
    log(
      'info',
      `User ${userID} who is alumni attempted to post into current member feed for ${communityID}`
    );
    return sendPacket(
      0,
      'Alumni are not allowed to post into the current member feed'
    );
  }

  try {
    const raw_post = new Post({
      user: userID,
      message,
      toCommunity: communityID,
      type: 'internalCurrent',
      university: universityID,
    });
    const post = await raw_post.save();

    await Community.updateOne(
      { _id: communityID },
      { $push: { internalCurrentMemberPosts: post._id } }
    );

    log(
      'info',
      `User ${userID} successfully posted into the internal current member feed of community ${communityID}`
    );
    return sendPacket(1, 'Successfully posted into internal member feed', { post });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

// GETTERS

export async function getInternalCurrentMemberPosts(
  communityID: string,
  userID: string,
  accountType: 'student' | 'alumni' | 'faculty' | 'fan'
) {
  //Validate that community exists with user as member
}

//Helpers
async function getValidatedCommunity(
  communityID: string,
  userID: string,
  retrievedFields: string[]
) {
  try {
    const community = await Community.findOne({
      _id: communityID,
      members: { $elemMatch: { $eq: mongoose.Types.ObjectId(userID) } },
    }).select(retrievedFields);

    if (!community) {
      return false;
    }
    return community;
  } catch (err) {
    log('error', err);
    return false;
  }
}
