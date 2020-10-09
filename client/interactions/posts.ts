import { log, sendPacket, retrieveSignedUrl } from '../helpers/functions';
import { Community, CommunityEdge, Post, User } from '../models';
const mongoose = require('mongoose');

const NUM_POSTS_RETRIEVED = 20;

export async function createBroadcastUserPost(message: string, userID: string) {
  try {
    const post = await new Post({ message, user: userID, type: 'broadcast' }).save();
    await User.updateOne({ _id: userID }, { $push: { broadcastedPosts: post._id } });

    log('info', `Successfully created for user ${userID}`);
    return sendPacket(1, 'Successfully created post', { newPost: post });
  } catch (err) {
    log('error', err);
    return sendPacket(0, err);
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
    const raw_post = await new Post({
      user: userID,
      message,
      toCommunity: communityID,
      type: 'internalCurrent',
      university: community.university,
    }).save();

    const post = await Post.findById(raw_post._id)
      .populate({ path: 'user', select: 'firstName lastName profilePicture' })
      .exec();

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
    const raw_post = await new Post({
      user: userID,
      message,
      toCommunity: communityID,
      type: 'internalAlumni',
      university: community.university,
    }).save();
    const post = await Post.findById(raw_post._id)
      .populate({ path: 'user', select: 'firstName lastName profilePicture' })
      .exec();

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

    const isFollowingPromise = CommunityEdge.exists({
      from: fromCommunityID,
      to: toCommunityID,
      accepted: true,
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
            'User is not admin of the community they they are posting as'
          );
        }
        if (!isFollowing) {
          log(
            'info',
            `Admin of community ${fromCommunityID} is attempting to post to ${toCommunityID}, and they are not following`
          );
          return sendPacket(0, 'Your community is not following this community');
        }

        const raw_post = await new Post({
          user: userID,
          message,
          toCommunity: toCommunityID,
          fromCommunity: fromCommunityID,
          type: 'external',
          anonymous: true,
        }).save();

        const post = await Post.findById(raw_post._id)
          .populate({ path: 'fromCommunity', select: 'name profilePicture' })
          .exec();

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

export async function createExternalPostAsCommunityAdmin(
  userID: string,
  communityID: string,
  message: string
) {
  try {
    const raw_post = await new Post({
      user: userID,
      message,
      fromCommunity: communityID,
      toCommunity: communityID,
      anonymous: true,
      type: 'external',
    }).save();

    const post = await Post.findById(raw_post._id)
      .populate({ path: 'fromCommunity', select: 'name profilePicture' })
      .exec();

    await Community.updateOne(
      { _id: communityID },
      { $push: { externalPosts: post._id } }
    );

    log(
      'info',
      `Created external post ${post._id} for community ${communityID} as admin ${userID}`
    );
    return sendPacket(1, 'Successfully created external post', { post });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function createExternalPostAsMember(
  userID: string,
  communityID: string,
  message: string
) {
  try {
    const communityExists = await Community.exists({
      $and: [
        { _id: communityID },
        { members: { $elemMatch: { $eq: mongoose.Types.ObjectId(userID) } } },
      ],
    });
    if (!communityExists)
      return sendPacket(
        0,
        'The community does not exist or the user is not a member of the community'
      );

    const raw_post = await new Post({
      user: userID,
      message,
      toCommunity: communityID,
      type: 'external',
    }).save();

    const post = await Post.findById(raw_post._id)
      .populate({ path: 'user', select: 'firstName lastName profilePicture' })
      .exec();

    await Community.updateOne(
      { _id: communityID },
      { $push: { externalPosts: post._id } }
    );

    log(
      'info',
      `Created external post ${post._id} for community ${communityID} as user ${userID}`
    );
    return sendPacket(1, 'Successfully created external post', { post });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, 'There was an error.', { err });
  }
}

export async function createBroadcastCommunityPost(
  userID: string,
  communityID: string,
  message: string
) {
  try {
    const raw_post = await new Post({
      user: userID,
      message,
      fromCommunity: communityID,
      anonymous: true,
      type: 'broadcast',
    }).save();

    const post = await Post.findById(raw_post._id)
      .populate({ path: 'fromCommunity', select: 'name profilePicture' })
      .exec();

    await Community.updateOne(
      { _id: communityID },
      { $push: { broadcastedPosts: post._id } }
    );

    log('info', `Broadcasted post ${post._id} as community ${communityID}`);
    return sendPacket(1, 'Successfully broadcasted post', { post });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

// GETTERS

export async function getGeneralFeed(universityID: string) {
  try {
    const condition = {
      university: universityID,
      toCommunity: null,
      type: { $eq: 'broadcast' },
    };
    const posts = await retrievePosts(condition, NUM_POSTS_RETRIEVED);
    if (!posts) return sendPacket(-1, 'There was an error');

    return sendPacket(1, 'Successfully retrieved the latest posts', { posts });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function getFollowingFeed(userID: string) {
  const numSkipped = 0;
  try {
    //Get users connections, communities, and all communities that those communities are following
    const user = await User.findById(userID)
      .select(['joinedCommunities', 'connections', 'accountType'])
      .populate({ path: 'connections', select: 'from to' })
      .populate({
        path: 'joinedCommunities',
        select: 'followingCommunities',
        populate: {
          path: 'followingCommunities',
          select: 'to',
        },
      })
      .exec();
    if (!user) return sendPacket(0, 'No user found with this ID');

    const connections = extractOtherUserFromConnections(user.connections, userID);
    const joinedCommunities = user.joinedCommunities.map(
      (community) => community._id
    );
    const followingCommunities = [];
    user.joinedCommunities.forEach((community) => {
      community.followingCommunities.forEach((edge) => {
        followingCommunities.push(edge.to);
      });
    });

    const conditions = getFollowingFeedConditions(
      user,
      connections,
      joinedCommunities,
      followingCommunities
    );

    const posts = await retrievePosts(conditions, NUM_POSTS_RETRIEVED);
    if (!posts) return sendPacket(-1, 'There was an error');

    return sendPacket(1, 'Successfully retrieved the latest posts', { posts });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function getPostsByUser(userID: string) {
  try {
    const user = await User.findById(userID).select(['broadcastedPosts']).exec();
    if (!user) return sendPacket(0, 'Could not find user');

    const condition = { _id: { $in: user.broadcastedPosts } };

    const posts = await retrievePosts(condition, NUM_POSTS_RETRIEVED);

    log('info', `Successfully retrieved all posts by user ${userID}`);
    return sendPacket(1, 'Successfully retrieved all posts by user', { posts });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

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
      `User ${userID} who is not a student attempted to retrieve current member feed for ${communityID}`
    );
    return sendPacket(
      0,
      'Alumni are not allowed to retrieve the current member feed'
    );
  }

  try {
    const condition = { _id: { $in: community.internalCurrentMemberPosts } };

    const posts = await retrievePosts(condition, NUM_POSTS_RETRIEVED);
    if (!posts) return sendPacket(-1, 'There was an error');

    return sendPacket(1, 'Successfully retrieved the latest posts', { posts });
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
    return sendPacket(0, 'Students are not allowed to retrieve alumni feed');
  }

  try {
    const condition = { _id: { $in: community.internalAlumniPosts } };

    const posts = await retrievePosts(condition, NUM_POSTS_RETRIEVED);
    if (!posts) return sendPacket(-1, 'There was an error');

    return sendPacket(1, 'Successfully retrieved the latest posts', { posts });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function getExternalPosts(communityID: string, userID: string) {
  try {
    const user = await User.findById(userID).select(['joinedCommunities']).exec();
    if (!user) return sendPacket(0, 'Could not find user');

    // user is a member of the community itself
    if (user.joinedCommunities.indexOf(communityID) !== -1)
      return getExternalPostsMember_Helper(communityID);

    // user is a member of one of the communities that is following this community
    return getExternalPostsNonMember_Helper(communityID, user);
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function getFollowingCommunityPosts(communityID: string) {
  try {
    const community = await Community.findById(communityID)
      .select(['followingCommunities'])
      .populate({
        path: 'followingCommunities',
        select: 'to',
        populate: { path: 'to', select: 'externalPosts' },
      })
      .exec();
    //Potentially add in $slice in the future to limit num posts retrieved from the community.
    if (!community) return sendPacket(-1, 'Could not find community');

    const postIDs = [];

    for (let i = 0; i < community.followingCommunities.length; i++) {
      postIDs.push(...community.followingCommunities[i].to.externalPosts);
    }

    const condition = { _id: { $in: postIDs } };

    const posts = await retrievePosts(condition, NUM_POSTS_RETRIEVED);
    if (!posts) return sendPacket(-1, 'There was an error');

    return sendPacket(1, 'Successfully retrieved the latest posts', { posts });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, 'There was an error retrieving the posts');
  }
}

//HELPERS

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

function generatePostSignedImagePromises(posts: {
  [key: string]: any;
  user: { [key: string]: any; profilePicture?: string };
}) {
  const profilePicturePromises = [];

  for (let i = 0; i < posts.length; i++) {
    const pictureType = posts[i].anonymous ? 'communityProfile' : 'profile';
    const picturePath =
      pictureType === 'profile'
        ? posts[i].user.profilePicture
        : posts[i].fromCommunity.profilePicture;

    if (picturePath) {
      try {
        const signedImageUrlPromise = retrieveSignedUrl(pictureType, picturePath);
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
  condition: { [key: string]: any },
  numRetrieved: number,
  numSkipped: number = 0, //Used when we're loading more, we can just update this count to get the next previous
  //TODO - Also possibly, start with the time of final post, ie {$le: {createdAt: timeOfLastElemement_FromPrevRetrieve}}
  withProfileImage: boolean = true
) {
  const posts = await Post.aggregate([
    { $match: condition },
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
    {
      $lookup: {
        from: 'communities',
        localField: 'fromCommunity',
        foreignField: '_id',
        as: 'fromCommunity',
      },
    },
    {
      $lookup: {
        from: 'communities',
        localField: 'toCommunity',
        foreignField: '_id',
        as: 'toCommunity',
      },
    },
    { $unwind: '$user' },
    { $unwind: { path: '$fromCommunity', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$toCommunity', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        message: '$message',
        likes: { $size: '$likes' },
        createdAt: '$createdAt',
        updatedAt: '$updatedAt',
        type: '$type',
        anonymous: '$anonymous',
        user: {
          _id: '$user._id',
          firstName: '$user.firstName',
          lastName: '$user.lastName',
          profilePicture: '$user.profilePicture',
        },
        toCommunity: {
          _id: '$toCommunity._id',
          name: '$toCommunity.name',
          profilePicture: '$toCommunity.profilePicture',
        },
        fromCommunity: {
          _id: '$fromCommunity._id',
          name: '$fromCommunity.name',
          profilePicture: '$fromCommunity.profilePicture',
        },
      },
    },
  ]).exec();

  if (!withProfileImage) return posts;

  const imagePromises = generatePostSignedImagePromises(posts);

  return Promise.all(imagePromises)
    .then((signedImageURLs) => {
      for (let i = 0; i < posts.length; i++)
        if (signedImageURLs[i]) {
          if (posts[i].anonymous)
            posts[i].fromCommunity.profilePicture = signedImageURLs[i];
          else posts[i].user.profilePicture = signedImageURLs[i];
        }

      return posts;
    })
    .catch((err) => {
      log('error', err);
      return false;
    });
}

async function getExternalPostsMember_Helper(communityID: string) {
  try {
    const community = await Community.findById(communityID)
      .select(['externalPosts', 'broadcastedPosts'])
      .exec();
    if (!community) return sendPacket(0, 'Community does not exist');

    const condition = {
      _id: { $in: community.externalPosts.concat(community.broadcastedPosts) },
    };

    const posts = await retrievePosts(condition, NUM_POSTS_RETRIEVED);
    if (!posts) return sendPacket(-1, 'There was an error');

    return sendPacket(1, 'Successfully retrieved the latest posts', { posts });
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
    })
      .select('externalPosts')
      .exec();
    if (!community) return sendPacket(0, 'Community does not exist');

    // Retrieve all posts from external feed

    const condition = { _id: { $in: community.externalPosts } };
    const posts = await retrievePosts(condition, NUM_POSTS_RETRIEVED);
    if (!posts) return sendPacket(-1, 'There was an error');

    return sendPacket(1, 'Successfully retrieved the latest posts', { posts });
  } catch (err) {
    log('info', err);
    return sendPacket(-1, err);
  }
}

function extractOtherUserFromConnections(
  connections: { [key: string]: any; from: string; to: string }[],
  userID: string
) {
  const output = connections.map((connection) => {
    return connection.from.toString() != userID ? connection.from : connection.to;
  });

  return output;
}

function getFollowingFeedConditions(
  user: { [key: string]: any; accountType: string },
  connections: string[],
  joinedCommunities: string[],
  followingCommunities: string[]
) {
  // retrieve all posts from these groups. Sort by timestamp.
  const conditions = [];
  const userCondition = {
    $and: [
      { user: { $in: connections } },
      { toCommunity: null },
      { fromCommunity: null },
      { type: { $eq: 'broadcast' } },
    ],
  };

  const internalPostCondition =
    user.accountType === 'student'
      ? // Post is type internal_student and user is student and to is in joined list
        {
          $and: [
            { type: { $eq: 'internalCurrent' } },
            { toCommunity: { $in: joinedCommunities } },
          ],
        }
      : // Post is type internal_alumni and user is not student and to is in joined list
        {
          $and: [
            { type: { $eq: 'internalAlumni' } },
            { toCommunity: { $in: joinedCommunities } },
          ],
        };

  const joinedCommunityCondition = {
    $or: [
      // Post is type external and (to is in joined list or from is in joined list)
      {
        $and: [
          { type: { $eq: 'external' } },
          {
            $or: [
              { toCommunity: { $in: joinedCommunities } },
              { fromCommunity: { $in: joinedCommunities } },
            ],
          },
        ],
      },

      internalPostCondition,
      // Post is type broadcast, and from is in joined list
      {
        $and: [
          { type: { $eq: 'broadcast' } },
          { fromCommunity: { $in: joinedCommunities } },
        ],
      },
    ],
  };

  const followingCommunityCondition = {
    $or: [
      //Post is type external, to is in following list
      {
        $and: [
          { type: { $eq: 'external' } },
          { toCommunity: { $in: followingCommunities } },
        ],
      },
      //Post is type broadcast, from is in following list
      {
        $and: [
          { type: { $eq: 'broadcast' } },
          { fromCommunity: { $in: followingCommunities } },
        ],
      },
    ],
  };

  conditions.push(
    userCondition,
    joinedCommunityCondition,
    followingCommunityCondition
  );

  const finalConditions = { $or: conditions };

  return finalConditions;
}
