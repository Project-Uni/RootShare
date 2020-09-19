import { log, sendPacket, retrieveSignedUrl } from '../helpers/functions';
import { Community, Post, User } from '../models';
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

export async function getGeneralFeed(universityID: string) {
  try {
    const condition = {
      university: universityID,
      toCommunity: null,
      type: { $eq: 'broadcast' },
    };
    const posts = await retrievePosts(condition, NUM_POSTS_RETRIEVED);

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

    const posts = await retrievePosts(finalConditions, NUM_POSTS_RETRIEVED);

    const imagePromises = generateSignedImagePromises(posts);

    return Promise.all(imagePromises)
      .then((signedImageURLs) => {
        for (let i = 0; i < posts.length; i++)
          if (signedImageURLs[i]) {
            const pictureType = posts[i].anonymous ? 'communityProfile' : 'profile';
            if (pictureType === 'profile')
              posts[i].user.profilePicture = signedImageURLs[i];
            else posts[i].fromCommunity.profilePicture = signedImageURLs[i];
          }
        log('info', `Retrieved following feed for user ${userID}`);
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

    const condition = { _id: { $in: user.broadcastedPosts } };

    const posts = await retrievePosts(condition, NUM_POSTS_RETRIEVED);

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
    const condition = { _id: { $in: community.internalCurrentMemberPosts } };

    const posts = await retrievePosts(condition, NUM_POSTS_RETRIEVED);

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
    const condition = { _id: { $in: community.internalAlumniPosts } };

    const posts = await retrievePosts(condition, NUM_POSTS_RETRIEVED);

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
          type: 'external',
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
    const pictureType = posts[i].anonymous ? 'communityProfile' : 'profile';

    if (
      (pictureType === 'profile' && posts[i].user.profilePicture) ||
      (pictureType === 'communityProfile' && posts[i].fromCommunity.profilePicture)
    ) {
      const picturePath =
        pictureType === 'profile'
          ? posts[i].user.profilePicture
          : posts[i].fromCommunity.profilePicture;

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
  numSkipped: number = 0 //Used when we're loading more, we can just update this count to get the next previous
  //TODO - Also possibly, start with the time of final post, ie {$le: {createdAt: timeOfLastElemement_FromPrevRetrieve}}
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
        user: {
          _id: '$user._id',
          firstName: '$user.firstName',
          lastName: '$user.lastName',
          profilePicture: '$user.profilePicture',
        },
        toCommunity: {
          _id: '$toCommunity._id',
          name: '$toCommunity.name',
          profilePicture: '$toComunity.profilePicture',
        },
        fromCommunity: {
          _id: '$fromCommunity._id',
          name: '$fromCommunity.name',
          profilePicture: '$fromComunity.profilePicture',
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

    const condition = { _id: { $in: community.externalPosts } };

    const posts = await retrievePosts(condition, NUM_POSTS_RETRIEVED);

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

    const condition = { _id: { $in: community.externalPosts } };
    const posts = await retrievePosts(condition, NUM_POSTS_RETRIEVED);
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

function extractOtherUserFromConnections(
  connections: { [key: string]: any; from: string; to: string }[],
  userID: string
) {
  const userID_typed = mongoose.Types.ObjectId(userID);
  const output = connections.map((connection) => {
    return connection.from != userID_typed ? connection.from : connection.to;
  });

  return output;
}
