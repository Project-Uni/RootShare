import { log, sendPacket, retrieveSignedUrl } from '../helpers/functions';
import { Community, Post, User } from '../models';
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

    const imagePromises = generateSignedImagePromises(posts);

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
  message: string
) {
  //Checking that user is a part of the community
  const community = await getValidatedCommunity(communityID, userID, [
    'admin',
    'university',
  ]);
  if (!community) {
    log(
      'info',
      `User ${userID} attempted to post to internal current member feed for community ${communityID} which they are not a member of`
    );
    return sendPacket(0, 'User is not a member of this community');
  }

  //Checking if person is a student or admin
  if (accountType !== 'student' && community.admin.toString() != userID) {
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
      university: community.university,
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

export async function createInternalAlumniPost(
  communityID: string,
  userID: string,
  accountType: 'student' | 'alumni' | 'faculty' | 'fan',
  message: string
) {
  //Checking if user is a part of this community
  const community = await getValidatedCommunity(communityID, userID, [
    'admin',
    'university',
  ]);
  if (!community) {
    log(
      'info',
      `User ${userID} attempted to post to internal alumni feed for community ${communityID} which they are not a member of`
    );
    return sendPacket(0, 'User is not a member of this community');
  }

  //Validating that user is allowed to post into alumni code
  if (accountType === 'student' && community.admin.toString() != userID) {
    log(
      'info',
      `User ${userID} who is student attempted to post into alumni feed for ${communityID}`
    );
    return sendPacket(
      0,
      'Current Members are not allowed to post into the current member feed'
    );
  }

  try {
    const raw_post = new Post({
      user: userID,
      message,
      toCommunity: communityID,
      type: 'internalAlumni',
      university: community.university,
    });
    const post = await raw_post.save();

    await Community.updateOne(
      { _id: communityID },
      { $push: { internalAlumniPosts: post._id } }
    );

    log(
      'info',
      `User ${userID} successfully posted into the internal alumni feed of community ${communityID}`
    );
    return sendPacket(1, 'Successfully posted into internal alumni member feed', {
      post,
    });
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
  const community = await getValidatedCommunity(communityID, userID, [
    'name',
    'admin',
    'internalCurrentMemberPosts',
  ]);
  if (!community) {
    log(
      'info',
      `User ${userID} attempted to retrieve internal current member feed for community ${communityID} which they are not a member of`
    );
    return sendPacket(0, 'User is not a member of this community');
  }

  if (accountType !== 'student' && community.admin.toString() != userID) {
    log(
      'info',
      `User ${userID} who is an attempted to retrieve current member feed for ${communityID}`
    );
    return sendPacket(
      0,
      'Alumni are not allowed to post into the current member feed'
    );
  }

  try {
    const posts = await retrievePosts(
      community.internalCurrentMemberPosts,
      NUM_POSTS_RETRIEVED
    );

    const imagePromises = generateSignedImagePromises(posts);

    return Promise.all(imagePromises)
      .then((signedImageURLs) => {
        for (let i = 0; i < posts.length; i++)
          if (signedImageURLs[i]) posts[i].user.profilePicture = signedImageURLs[i];

        log(
          'info',
          `Successfully retrieved internal current member feed for community ${community.name}`
        );
        return sendPacket(1, 'Successfully retrieved internal current member feed', {
          posts,
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

export async function getInternalAlumniPosts(
  communityID: string,
  userID: string,
  accountType: 'student' | 'alumni' | 'faculty' | 'fan'
) {
  //Validate that community exists with user as member
  const community = await getValidatedCommunity(communityID, userID, [
    'name',
    'admin',
    'internalAlumniPosts',
  ]);

  if (!community) {
    log(
      'info',
      `User ${userID} attempted to retrieve internal alumni feed for community ${communityID} which they are not a member of`
    );
    return sendPacket(0, 'User is not a member of this community');
  }

  if (accountType === 'student' && community.admin.toString() != userID) {
    log(
      'info',
      `User ${userID} who is a student attempted to retrieve alumni feed for ${communityID}`
    );
    return sendPacket(0, 'Students are not allowed to post into the alumni feed');
  }

  try {
    const posts = await retrievePosts(
      community.internalAlumniPosts,
      NUM_POSTS_RETRIEVED
    );

    const imagePromises = generateSignedImagePromises(posts);

    return Promise.all(imagePromises)
      .then((signedImageURLs) => {
        for (let i = 0; i < posts.length; i++)
          if (signedImageURLs[i]) posts[i].user.profilePicture = signedImageURLs[i];

        log(
          'info',
          `Successfully retrieved internal current member feed for community ${community.name}`
        );
        return sendPacket(1, 'Successfully retrieved internal current member feed', {
          posts,
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

export async function createExternalPostAsFollowingCommunityAdmin(
  userID: string,
  fromCommunityID: string,
  toCommunityID: string,
  message: string
) {
  try {
    const isCommunityAdminPromise = Community.exists({
      _id: fromCommunityID,
      admin: userID,
    });

    const isFollowingPromise = Community.exists({
      _id: toCommunityID,
      followedByCommunities: { $elemMatch: { $eq: fromCommunityID } },
    });

    return Promise.all([isCommunityAdminPromise, isFollowingPromise])
      .then(async ([isCommunityAdmin, isFollowing]) => {
        if (!isCommunityAdmin) {
          log(
            'info',
            `User ${userID} is attempting to post as community ${fromCommunityID}, and they are not admin`
          );
          return sendPacket(
            0,
            'User is not admin of the community hey they are posting as'
          );
        }
        if (!isFollowing) {
          log(
            'info',
            `Admin of community ${fromCommunityID} is attempting to post to ${toCommunityID}, and they are not admin`
          );
          return sendPacket(0, 'Your community is not following this community');
        }

        const raw_post = new Post({
          user: userID,
          message,
          toCommunity: toCommunityID,
          fromCommunity: fromCommunityID,
          anonymous: true,
        });

        const post = await raw_post.save();

        const fromCommunityUpdate = Community.updateOne(
          { _id: fromCommunityID },
          { $push: { postsToOtherCommunities: post._id } }
        );
        const toCommunityUpdate = Community.updateOne(
          { _id: toCommunityID },
          { $push: { externalPosts: post._id } }
        );

        return Promise.all([fromCommunityUpdate, toCommunityUpdate]).then(
          (values) => {
            log(
              'info',
              `Post sent from community ${fromCommunityID} to ${toCommunityID}`
            );
            return sendPacket(
              1,
              'Successfully created post to external feed of other community',
              {
                post,
              }
            );
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

export async function createExternalPostAsCommunityAdmin() {}

export async function createExternalPostAsMember() {}

export async function getExternalPosts(communityID: string, userID: string) {
  try {
    // validate that user is a member of one of the communities that is following this community
    // Or is a member of the community itself
    const user = await User.findById(userID).select(['joinedCommunities']).exec();
    if (!user) return sendPacket(0, 'Could not find user');

    if (user.joinedCommunities.indexOf(communityID) !== -1)
      return getExternalPostsMember_Helper(communityID);

    return getExternalPostsNonMember_Helper(communityID, user);
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function broadcastAsCommunityAdmin() {}

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

function generateSignedImagePromises(posts: {
  [key: string]: any;
  user: { [key: string]: any; profilePicture?: string };
}) {
  const profilePicturePromises = [];

  for (let i = 0; i < posts.length; i++) {
    if (posts[i].user.profilePicture) {
      try {
        const signedImageUrlPromise = retrieveSignedUrl(
          'profile',
          posts[i].user.profilePicture
        );
        profilePicturePromises.push(signedImageUrlPromise);
      } catch (err) {
        log('error', err);
        profilePicturePromises.push(null);
      }
    } else {
      profilePicturePromises.push(null);
    }
  }
  return profilePicturePromises;
}

async function retrievePosts(
  IDList: string[],
  numRetrieved: number,
  numSkipped: number = 0
) {
  const posts = await Post.aggregate([
    { $match: { _id: { $in: IDList } } },
    { $sort: { createdAt: -1 } },
    { $skip: numSkipped },
    { $limit: numRetrieved },
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

  return posts;
}

async function getExternalPostsMember_Helper(communityID: string) {
  try {
    const community = await Community.findById(communityID)
      .select(['externalPosts'])
      .exec();
    if (!community) return sendPacket(0, 'Community does not exist');

    const posts = await retrievePosts(community.externalPosts, NUM_POSTS_RETRIEVED);

    const imagePromises = generateSignedImagePromises(posts);
    return Promise.all(imagePromises).then((signedImageURLs) => {
      for (let i = 0; i < posts.length; i++)
        if (signedImageURLs[i]) posts[i].user.profilePicture = signedImageURLs[i];

      log(
        'info',
        `Successfully retrieved external feed for community ${community.name}`
      );
      return sendPacket(1, 'Successfully retrieved external feed', {
        posts,
      });
    });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

async function getExternalPostsNonMember_Helper(
  communityID: string,
  user: { [key: string]: any; joinedCommunities }
) {
  try {
    //retrieve community and check if any of the user's communities are in its following list
    const community = await Community.findOne({
      _id: communityID,
      $elemMatch: { followedByCommunities: { $in: user.joinedCommunities } },
    }).select('externalPosts');
    if (!community) return sendPacket(0, 'Community does not exist');

    // Retrieve all posts from external feed
    const posts = await retrievePosts(community.externalPosts, NUM_POSTS_RETRIEVED);
    const imagePromises = await generateSignedImagePromises(posts);

    return Promise.all(imagePromises).then((signedImageURLs) => {
      for (let i = 0; i < posts.length; i++)
        if (signedImageURLs[i]) posts[i].user.profilePicture = signedImageURLs[i];

      log(
        'info',
        `Successfully retrieved external feed for community ${community.name}`
      );
      return sendPacket(1, 'Successfully retrieved external feed', {
        posts,
      });
    });
  } catch (err) {
    log('info', err);
    return sendPacket(-1, err);
  }
}
