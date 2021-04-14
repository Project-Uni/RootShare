import { Types } from 'mongoose';

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
import { AccountType } from '../rootshare_db/types';
import {
  log,
  sendPacket,
  retrieveSignedUrl,
  uploadFile,
  decodeBase64Image,
  deleteFile,
} from '../helpers/functions';
import { generateSignedProfilePromises } from './utilities';
import NotificationService from './notification';

const ObjectIdVal = Types.ObjectId;
type ObjectIdType = Types.ObjectId;

const NUM_POSTS_RETRIEVED = 40;

export async function createBroadcastUserPost(
  message: string,
  userID: ObjectIdType,
  image?: string
) {
  try {
    let post = await new Post.model({
      message,
      user: userID,
      type: 'broadcast',
    }).save();
    await User.model.updateOne(
      { _id: userID },
      { $push: { broadcastedPosts: post._id } }
    );
    await post
      .populate({
        path: 'user',
        select:
          'firstName lastName profilePicture major graduationYear work position',
      })
      .execPopulate();

    if (image) {
      const result = await uploadPostImage(image, post._id, userID);
      if (result === -1) {
        log(
          'info',
          `Successfully created for user ${userID}, but failed to upload image`
        );
        return sendPacket(1, 'Successfully created post, but the image was invalid');
      }
      const { imageID, fileName } = result;
      await Post.model.updateOne({ _id: post._id }, { $push: { images: imageID } });
      try {
        const imageURL = await retrieveSignedUrl('images', 'postImage', fileName);
        var postObj = post.toObject();
        postObj.images = [{ fileName: imageURL || '' } as IImage];
      } catch (err) {
        log('error', err);
      }
    }

    log('info', `Successfully created for user ${userID}`);
    return sendPacket(1, 'Successfully created post', { post: postObj });
  } catch (err) {
    log('error', err);
    return sendPacket(0, err);
  }
}

export async function createInternalCurrentMemberCommunityPost(
  communityID: ObjectIdType,
  userID: ObjectIdType,
  accountType: AccountType,
  message: string,
  image?: string
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
  if (accountType !== 'student' && (community.admin as ObjectIdType) !== userID) {
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
    const raw_post = await new Post.model({
      user: userID,
      message,
      toCommunity: communityID,
      type: 'internalCurrent',
      university: community.university,
    }).save();

    if (image) {
      const result = await uploadPostImage(image, raw_post._id, userID);
      if (result === -1) {
        log(
          'info',
          `Successfully created for user ${userID}, but failed to upload image`
        );
        return sendPacket(1, 'Successfully created post, but the image was invalid');
      }
      const { imageID, fileName } = result;
      await Post.model.updateOne(
        { _id: raw_post._id },
        { $push: { images: imageID } }
      );
    }

    const post = await Post.model
      .findById(raw_post._id)
      .populate({ path: 'user', select: 'firstName lastName profilePicture' })
      .populate({ path: 'images', select: 'fileName' })
      .exec();

    if (post.images && post.images.length > 0) {
      try {
        post.images = post.images as IImage[];
        const imageURL = await retrieveSignedUrl(
          'images',
          'postImage',
          post.images[0].fileName
        );
        post.images[0].fileName = imageURL || '';
      } catch (err) {
        log('error', err);
      }
    }

    await Community.model.updateOne(
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
  communityID: ObjectIdType,
  userID: ObjectIdType,
  accountType: AccountType,
  message: string,
  image?: string
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
  if (accountType === 'student' && (community.admin as ObjectIdType) !== userID) {
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
    const raw_post = await new Post.model({
      user: userID,
      message,
      toCommunity: communityID,
      type: 'internalAlumni',
      university: community.university,
    }).save();

    if (image) {
      const result = await uploadPostImage(image, raw_post._id, userID);
      if (result === -1) {
        log(
          'info',
          `Successfully created for user ${userID}, but failed to upload image`
        );
        return sendPacket(1, 'Successfully created post, but the image was invalid');
      }
      const { imageID, fileName } = result;
      await Post.model.updateOne(
        { _id: raw_post._id },
        { $push: { images: imageID } }
      );
    }

    const post = await Post.model
      .findById(raw_post._id)
      .populate({ path: 'user', select: 'firstName lastName profilePicture' })
      .populate({ path: 'images', select: 'fileName' })
      .exec();

    if (post.images && post.images.length > 0) {
      try {
        post.images = post.images as IImage[];
        const imageURL = await retrieveSignedUrl(
          'images',
          'postImage',
          post.images[0].fileName
        );
        post.images[0].fileName = imageURL || '';
      } catch (err) {
        log('error', err);
      }
    }

    await Community.model.updateOne(
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
  userID: ObjectIdType,
  fromCommunityID: ObjectIdType,
  toCommunityID: ObjectIdType,
  message: string,
  image?: string
) {
  try {
    const isCommunityAdminPromise = Community.model.exists({
      _id: fromCommunityID,
      admin: userID,
    });

    const isFollowingPromise = CommunityEdge.model.exists({
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

        const raw_post = await new Post.model({
          user: userID,
          message,
          toCommunity: toCommunityID,
          fromCommunity: fromCommunityID,
          type: 'external',
          anonymous: true,
        }).save();

        if (image) {
          const result = await uploadPostImage(image, raw_post._id, userID);
          if (result === -1) {
            log(
              'info',
              `Successfully created for user ${userID}, but failed to upload image`
            );
            return sendPacket(
              1,
              'Successfully created post, but the image was invalid'
            );
          }
          const { imageID, fileName } = result;
          await Post.model.updateOne(
            { _id: raw_post._id },
            { $push: { images: imageID } }
          );
        }

        const post = await Post.model
          .findById(raw_post._id)
          .populate({ path: 'fromCommunity', select: 'name profilePicture' })
          .populate({ path: 'images', select: 'fileName' })
          .exec();

        if (post.images && post.images.length > 0) {
          try {
            post.images = post.images as IImage[];
            const imageURL = await retrieveSignedUrl(
              'images',
              'postImage',
              post.images[0].fileName
            );
            post.images[0].fileName = imageURL || '';
          } catch (err) {
            log('error', err);
          }
        }

        const fromCommunityUpdate = Community.model.updateOne(
          { _id: fromCommunityID },
          { $push: { postsToOtherCommunities: post._id } }
        );
        const toCommunityUpdate = Community.model.updateOne(
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
  userID: ObjectIdType,
  communityID: ObjectIdType,
  message: string,
  image?: string
) {
  try {
    const raw_post = await new Post.model({
      user: userID,
      message,
      fromCommunity: communityID,
      toCommunity: communityID,
      anonymous: true,
      type: 'external',
    }).save();

    if (image) {
      const result = await uploadPostImage(image, raw_post._id, userID);
      if (result === -1) {
        log(
          'info',
          `Successfully created for user ${userID}, but failed to upload image`
        );
        return sendPacket(1, 'Successfully created post, but the image was invalid');
      }
      const { imageID, fileName } = result;
      await Post.model.updateOne(
        { _id: raw_post._id },
        { $push: { images: imageID } }
      );
    }

    const post = await Post.model
      .findById(raw_post._id)
      .populate({ path: 'fromCommunity', select: 'name profilePicture' })
      .populate({ path: 'images', select: 'fileName' })
      .exec();

    if (post.images && post.images.length > 0) {
      try {
        post.images = post.images as IImage[];
        const imageURL = await retrieveSignedUrl(
          'images',
          'postImage',
          post.images[0].fileName
        );
        post.images[0].fileName = imageURL || '';
      } catch (err) {
        log('error', err);
      }
    }

    await Community.model.updateOne(
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
  userID: ObjectIdType,
  communityID: ObjectIdType,
  message: string,
  image?: string
) {
  try {
    const communityExists = await Community.model.exists({
      $and: [
        { _id: communityID },
        {
          $or: [
            { private: { $eq: false } },
            { members: { $elemMatch: { $eq: userID } } },
          ],
        },
      ],
    });
    if (!communityExists)
      return sendPacket(
        0,
        'The community does not exist or the user is not a member of the community'
      );

    const raw_post = await new Post.model({
      user: userID,
      message,
      toCommunity: communityID,
      type: 'external',
    }).save();

    if (image) {
      const result = await uploadPostImage(image, raw_post._id, userID);
      if (result === -1) {
        log(
          'info',
          `Successfully created for user ${userID}, but failed to upload image`
        );
        return sendPacket(1, 'Successfully created post, but the image was invalid');
      }
      const { imageID, fileName } = result;
      await Post.model.updateOne(
        { _id: raw_post._id },
        { $push: { images: imageID } }
      );
    }

    const post = await Post.model
      .findById(raw_post._id)
      .populate({
        path: 'user',
        select:
          'firstName lastName profilePicture major graduationYear work position',
      })
      .populate({ path: 'images', select: 'fileName' })
      .exec();

    if (post.images && post.images.length > 0) {
      try {
        post.images = post.images as IImage[];
        const imageURL = await retrieveSignedUrl(
          'images',
          'postImage',
          post.images[0].fileName
        );
        post.images[0].fileName = imageURL || '';
      } catch (err) {
        log('error', err);
      }
    }

    await Community.model.updateOne(
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
  userID: ObjectIdType,
  communityID: ObjectIdType,
  message: string,
  image?: string
) {
  try {
    const raw_post = await new Post.model({
      user: userID,
      message,
      fromCommunity: communityID,
      anonymous: true,
      type: 'broadcast',
    }).save();

    if (image) {
      const result = await uploadPostImage(image, raw_post._id, userID);
      if (result === -1) {
        log(
          'info',
          `Successfully created for user ${userID}, but failed to upload image`
        );
        return sendPacket(1, 'Successfully created post, but the image was invalid');
      }
      const { imageID, fileName } = result;
      await Post.model.updateOne(
        { _id: raw_post._id },
        { $push: { images: imageID } }
      );
    }

    const post = await Post.model
      .findById(raw_post._id)
      .populate({ path: 'fromCommunity', select: 'name profilePicture' })
      .populate({ path: 'images', select: 'fileName' })
      .populate({
        path: 'user',
        select: 'firstName lastName major position work graduationYear',
      })
      .exec();

    post.fromCommunity = post.fromCommunity as ICommunity;
    const communityProfilePicture = post.fromCommunity.profilePicture
      ? await retrieveSignedUrl(
          'images',
          'communityProfile',
          post.fromCommunity.profilePicture
        )
      : undefined;

    post.fromCommunity.profilePicture = communityProfilePicture || '';

    if (post.images && post.images.length > 0) {
      try {
        post.images = post.images as IImage[];
        const imageURL = await retrieveSignedUrl(
          'images',
          'postImage',
          post.images[0].fileName
        );
        post.images[0].fileName = imageURL || '';
      } catch (err) {
        log('error', err);
      }
    }

    await Community.model.updateOne(
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

export async function getGeneralFeed(userID: ObjectIdType) {
  try {
    const { university: universityID } = await User.model
      .findOne({ _id: userID }, 'university')
      .lean()
      .exec();
    const condition = {
      university: universityID,
      toCommunity: null,
      type: { $eq: 'broadcast' },
    };
    const posts = await retrievePosts(condition, NUM_POSTS_RETRIEVED, userID);
    if (!posts) return sendPacket(-1, 'There was an error');

    return sendPacket(1, 'Successfully retrieved the latest posts', { posts });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function getFollowingFeed(userID: ObjectIdType) {
  const numSkipped = 0;
  try {
    //Get users connections, communities, and all communities that those communities are following
    const user = await User.model
      .findById(userID)
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

    const connections = extractOtherUserFromConnections(
      user.connections as IConnection[],
      userID
    );
    const joinedCommunities = (user.joinedCommunities as ICommunity[]).map(
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

    const posts = await retrievePosts(conditions, NUM_POSTS_RETRIEVED, userID);
    if (!posts) return sendPacket(-1, 'There was an error');

    return sendPacket(1, 'Successfully retrieved the latest posts', { posts });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function getPostsByUser(
  userID: ObjectIdType,
  currUserID: ObjectIdType
) {
  try {
    const user = await User.model
      .findById(userID)
      .select(['broadcastedPosts'])
      .exec();
    if (!user) return sendPacket(0, 'Could not find user');

    const condition = { _id: { $in: user.broadcastedPosts } };

    const posts = await retrievePosts(condition, NUM_POSTS_RETRIEVED, currUserID);

    log('info', `Successfully retrieved all posts by user ${userID}`);
    return sendPacket(1, 'Successfully retrieved all posts by user', { posts });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

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

export async function getInternalCurrentMemberPosts(
  communityID: ObjectIdType,
  userID: ObjectIdType,
  accountType: AccountType
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

  if (
    accountType !== 'student' &&
    !(community.admin as ObjectIdType).equals(userID)
  ) {
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

    const posts = await retrievePosts(condition, NUM_POSTS_RETRIEVED, userID);
    if (!posts) return sendPacket(-1, 'There was an error');

    return sendPacket(1, 'Successfully retrieved the latest posts', { posts });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function getInternalAlumniPosts(
  communityID: ObjectIdType,
  userID: ObjectIdType,
  accountType: AccountType
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

  if (
    accountType === 'student' &&
    !(community.admin as ObjectIdType).equals(userID)
  ) {
    log(
      'info',
      `User ${userID} who is a student attempted to retrieve alumni feed for ${communityID}`
    );
    return sendPacket(0, 'Students are not allowed to retrieve alumni feed');
  }

  try {
    const condition = { _id: { $in: community.internalAlumniPosts } };

    const posts = await retrievePosts(condition, NUM_POSTS_RETRIEVED, userID);
    if (!posts) return sendPacket(-1, 'There was an error');

    return sendPacket(1, 'Successfully retrieved the latest posts', { posts });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function getExternalPosts(
  communityID: ObjectIdType,
  userID: ObjectIdType
) {
  try {
    const user = await User.model
      .findById(userID)
      .select(['joinedCommunities'])
      .exec();
    if (!user) return sendPacket(0, 'Could not find user');

    // user is a member of the community itself
    if ((user.joinedCommunities as ObjectIdType[]).indexOf(communityID) !== -1)
      return getExternalPostsMember_Helper(communityID, userID);

    // user is a member of one of the communities that is following this community
    return getExternalPostsNonMember_Helper(communityID, user);
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function getFollowingCommunityPosts(
  communityID: ObjectIdType,
  userID: ObjectIdType
) {
  try {
    const community = await Community.model
      .findById(communityID)
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
      postIDs.push(
        ...((community.followingCommunities[i] as ICommunityEdge).to as ICommunity)
          .externalPosts
      );
    }

    const condition = { _id: { $in: postIDs } };

    const posts = await retrievePosts(condition, NUM_POSTS_RETRIEVED, userID);
    if (!posts) return sendPacket(-1, 'There was an error');

    return sendPacket(1, 'Successfully retrieved the latest posts', { posts });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, 'There was an error retrieving the posts');
  }
}

//Actions
export async function likePost(postID: ObjectIdType, userID: ObjectIdType) {
  try {
    const postExistsPromise = Post.model.exists({ _id: postID });
    const userExistsPromise = User.model.exists({ _id: userID });

    return Promise.all([postExistsPromise, userExistsPromise]).then(
      ([postExists, userExists]) => {
        if (!postExists) return sendPacket(0, 'Post does not exist');
        if (!userExists) return sendPacket(0, 'User does not exist');

        const postUpdate = Post.model
          .updateOne({ _id: postID }, { $addToSet: { likes: userID } })
          .exec();
        const userUpdate = User.model
          .updateOne({ _id: userID }, { $addToSet: { likes: postID } })
          .exec();

        new NotificationService().like({
          fromUser: userID.toString(),
          postID: postID.toString(),
        });
        return Promise.all([postUpdate, userUpdate]).then(() => {
          log('info', `User ${userID} successfully liked post ${postID}`);
          return sendPacket(1, 'Successfully liked post');
        });
      }
    );
  } catch (err) {
    log('error', err);
    return sendPacket(-1, 'There was an error updating the models', {
      error: err.message,
    });
  }
}

export async function unlikePost(postID: ObjectIdType, userID: ObjectIdType) {
  try {
    const postExistsPromise = Post.model.exists({ _id: postID });
    const userExistsPromise = User.model.exists({ _id: userID });

    return Promise.all([postExistsPromise, userExistsPromise]).then(
      ([postExists, userExists]) => {
        if (!postExists) return sendPacket(0, 'Post does not exist');
        if (!userExists) return sendPacket(0, 'User does not exist');

        const postUpdate = Post.model
          .updateOne({ _id: postID }, { $pull: { likes: userID } })
          .exec();
        const userUpdate = User.model
          .updateOne({ _id: userID }, { $pull: { likes: postID } })
          .exec();

        return Promise.all([postUpdate, userUpdate]).then(() => {
          log(
            'info',
            `User ${userID} successfully removed like from post ${postID}`
          );
          return sendPacket(1, 'Successfully removed like from post');
        });
      }
    );
  } catch (err) {
    log('error', err);
    return sendPacket(-1, 'There was an error updating the models', {
      error: err.message,
    });
  }
}

export async function getLikes(postID: ObjectIdType, userID: ObjectIdType) {
  try {
    const post = await Post.model
      .findById(postID)
      .select('likes')
      .populate({ path: 'likes', select: 'firstName lastName profilePicture' })
      .exec();

    if (!post) return sendPacket(0, 'Could not find post');

    const { likes } = post as { likes: IUser[] };
    const signedImagePromises = generateSignedProfilePromises(likes, 'profile');

    return Promise.all(signedImagePromises)
      .then((signedImageURLs) => {
        for (let i = 0; i < signedImageURLs.length; i++)
          if (signedImageURLs[i])
            likes[i].profilePicture = signedImageURLs[i] as string;

        return sendPacket(1, 'Successfully retrieved likes', { likes });
      })
      .catch((err) => {
        log(
          'info',
          'Successfully retrieved likes but failed to retrieve profile pictures'
        );
        return sendPacket(
          1,
          'Successfully retrieved likes but failed to retrieve profile pictures',
          { likes }
        );
      });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

//REMOVERS

export async function deletePost(postID: ObjectIdType, userID: ObjectIdType) {
  try {
    const postExists = await Post.model.exists({ _id: postID, user: userID });
    if (!postExists)
      return sendPacket(0, 'Post does not exist or user did not create post');

    const post = await Post.model
      .findById(postID)
      .select(['comments', 'toCommunity', 'fromCommunity', 'type', 'images'])
      .populate({ path: 'images', select: 'fileName' })
      .exec();

    //Actions:
    //1 - Delete Comments
    const promises = [];
    const commentDeletion = Comment.model
      .deleteMany({
        _id: { $in: post.comments },
      })
      .exec();
    promises.push(commentDeletion);
    //2 - Pull post from user if broadcast
    if (post.type === 'broadcast') {
      if (!post.fromCommunity) {
        const userPromise = User.model
          .updateOne({ _id: userID }, { $pull: { broadcastedPosts: postID } })
          .exec();
        promises.push(userPromise);
      } else {
        const communityPromise = Community.model
          .updateOne(
            { _id: post.fromCommunity },
            { $pull: { broadcastedPosts: postID } }
          )
          .exec();
        promises.push(communityPromise);
      }
    }
    //3 - Pull post from community based on relations
    else if (post.type === 'external') {
      const toCommunityPromise = Community.model
        .updateOne({ _id: post.toCommunity }, { $pull: { externalPosts: postID } })
        .exec();
      promises.push(toCommunityPromise);
      if (post.fromCommunity !== post.toCommunity) {
        const fromCommunityPromise = Community.model
          .updateOne(
            { _id: post.fromCommunity },
            { $pull: { postsToOtherCommunities: postID } }
          )
          .exec();
        promises.push(fromCommunityPromise);
      }
    } else if (post.type === 'internalCurrent') {
      const communityPromise = Community.model
        .updateOne(
          { _id: post.toCommunity },
          { $pull: { internalCurrentMemberPosts: postID } }
        )
        .exec();
      promises.push(communityPromise);
    } else {
      //post.type === 'internalAlumni'
      const communityPromise = Community.model
        .updateOne(
          { _id: post.toCommunity },
          { $pull: { internalAlumniPosts: postID } }
        )
        .exec();
      promises.push(communityPromise);
    }

    //4 - Delete images
    if (post.images && post.images.length > 0) {
      post.images = post.images as IImage[];
      const imageIDs = post.images.map((image) => image._id);
      const imageS3Promises = post.images.map((image) =>
        deleteFile('images', 'postImage', image.fileName)
      );
      const imageDBPromise = Image.model.deleteMany({ _id: { $in: imageIDs } }).exec;

      promises.push(imageDBPromise);
      promises.push(...imageS3Promises);
    }
    //5 - Delete post
    const postPromise = Post.model.deleteOne({ _id: postID }).exec();
    promises.push(postPromise);

    return Promise.all([promises]).then((values) => {
      log('info', `Successfully deleted post ${postID} for user ${userID}`);
      return sendPacket(1, 'Successfully deleted post');
    });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

//HELPERS
async function getValidatedCommunity(
  communityID: ObjectIdType,
  userID: ObjectIdType,
  retrievedFields: string[]
) {
  try {
    const community = await Community.model
      .findOne({
        _id: communityID,
        members: { $elemMatch: { $eq: userID } },
      })
      .select(retrievedFields);

    if (!community) {
      return false;
    }
    return community;
  } catch (err) {
    log('error', err);
    return false;
  }
}

function generatePostSignedImagePromises(
  posts: {
    [key: string]: any;
    _id: ObjectIdType;
    user: { [key: string]: any; profilePicture?: string };
    images: [{ fileName: string }];
  },
  hasImages = false
) {
  const profilePicturePromises = [];

  for (let i = 0; i < posts.length; i++) {
    //Adding profile picture
    const pictureType = posts[i].anonymous ? 'communityProfile' : 'profile';
    const picturePath =
      pictureType === 'profile'
        ? posts[i].user.profilePicture
        : posts[i].fromCommunity.profilePicture;

    if (picturePath) {
      try {
        const signedImageUrlPromise = retrieveSignedUrl(
          'images',
          pictureType,
          picturePath
        );
        profilePicturePromises.push(signedImageUrlPromise);
      } catch (err) {
        log('error', err);
        profilePicturePromises.push(null);
      }
    } else {
      profilePicturePromises.push(null);
    }

    //Adding post image picture
    if (hasImages) {
      for (let j = 0; j < posts[i].images.length; j++) {
        const image = posts[i].images[j];
        const signedImagePromise = retrieveSignedUrl(
          'images',
          'postImage',
          image.fileName
        );
        profilePicturePromises.push(signedImagePromise);
      }
    }
  }
  return profilePicturePromises;
}

export async function retrieveComments(
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

export const getPost = async ({
  userID,
  postID,
}: {
  postID: string;
  userID: ObjectIdType;
}) => {
  //TODO - Determine if user has access to get post
  const hasAccess = true;
  try {
    const post = await retrievePosts({ _id: ObjectIdVal(postID) }, 1, userID);
    if (!post) return false;

    return post[0];
  } catch (err) {
    log('error', err.message);
    return false;
  }
};

export async function retrievePosts(
  condition: { [key: string]: any },
  numRetrieved: number,
  userID: ObjectIdType,
  numSkipped: number = 0, //Used when we're loading more, we can just update this count to get the next previous
  //TODO - Also possibly, start with the time of final post, ie {$le: {createdAt: timeOfLastElemement_FromPrevRetrieve}}
  withProfileImage: boolean = true
) {
  const posts = await Post.model
    .aggregate([
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
      {
        $lookup: {
          from: 'images',
          localField: 'images',
          foreignField: '_id',
          as: 'images',
        },
      },
      { $unwind: '$user' },
      { $unwind: { path: '$fromCommunity', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$toCommunity', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          message: '$message',
          likes: { $size: '$likes' },
          comments: {
            $size: { $ifNull: ['$comments', []] },
          },
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          type: '$type',
          anonymous: '$anonymous',
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
          liked: {
            $in: [ObjectIdVal(userID.toString()), '$likes'],
          },
          images: {
            $map: {
              input: '$images',
              as: 'image',
              in: {
                fileName: '$$image.fileName',
              },
            },
          },
        },
      },
    ])
    .exec();

  if (!withProfileImage) return posts;

  const imagePromises = generatePostSignedImagePromises(posts, true);

  return Promise.all(imagePromises)
    .then((signedImageURLs) => {
      let urlIndex = 0;
      for (let i = 0; i < posts.length; i++) {
        if (signedImageURLs[urlIndex]) {
          if (posts[i].anonymous)
            posts[i].fromCommunity.profilePicture = signedImageURLs[urlIndex];
          else posts[i].user.profilePicture = signedImageURLs[urlIndex];
        }
        urlIndex += 1;
        for (let j = 0; j < posts[i].images.length; j++) {
          posts[i].images[j].fileName = signedImageURLs[urlIndex + j];
        }
        urlIndex += posts[i].images.length;
      }
      return posts;
    })
    .catch((err) => {
      log('error', err);
      return false;
    });
}

async function getExternalPostsMember_Helper(
  communityID: ObjectIdType,
  userID: ObjectIdType
) {
  try {
    const community = await Community.model
      .findById(communityID)
      .select(['externalPosts', 'broadcastedPosts'])
      .exec();
    if (!community) return sendPacket(0, 'Community does not exist');

    const condition = {
      _id: {
        $in: (community.externalPosts as ObjectIdType[]).concat(
          community.broadcastedPosts as ObjectIdType[]
        ),
      },
    };

    const posts = await retrievePosts(condition, NUM_POSTS_RETRIEVED, userID);
    if (!posts) return sendPacket(-1, 'There was an error');

    return sendPacket(1, 'Successfully retrieved the latest posts', { posts });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

async function getExternalPostsNonMember_Helper(
  communityID: ObjectIdType,
  user: { [key: string]: any; joinedCommunities }
) {
  try {
    const community = await Community.model
      .findById(communityID)
      .select('followedByCommunities private externalPosts')
      .populate({ path: 'followedByCommunities', select: 'from' })
      .exec();

    if (!community) return sendPacket(0, 'Community does not exist');

    // disabling so anyone can view the external feed of a community

    // if (community.private) {
    //   const followedByCommunities = (community.followedByCommunities as ICommunityEdge[]).map(
    //     (community) => community.from.toString()
    //   );
    //   const communityIntersections = user.joinedCommunities.filter((community) =>
    //     followedByCommunities.includes(community.toString())
    //   );
    //   if (communityIntersections.length === 0)
    //     return sendPacket(0, 'User does not have access to this feed');
    // }

    const condition = { _id: { $in: community.externalPosts } };
    const posts = await retrievePosts(condition, NUM_POSTS_RETRIEVED, user._id);
    if (!posts) return sendPacket(-1, 'There was an error');

    return sendPacket(1, 'Successfully retrieved the latest posts', { posts });
  } catch (err) {
    log('info', err);
    return sendPacket(-1, err);
  }
}

function extractOtherUserFromConnections(
  connections: IConnection[],
  userID: ObjectIdType
) {
  return connections.map((connection) =>
    connection.from.toString() !== userID.toString()
      ? (connection.from as ObjectIdType)
      : (connection.to as ObjectIdType)
  );
}

function getFollowingFeedConditions(
  user: { [key: string]: any; accountType: string },
  connections: ObjectIdType[],
  joinedCommunities: ObjectIdType[],
  followingCommunities: ObjectIdType[]
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

async function uploadPostImage(
  image: string,
  postID: ObjectIdType,
  userID: ObjectIdType
) {
  try {
    const imageBuffer: { type?: string; data?: Buffer } = decodeBase64Image(image);
    if (!imageBuffer.data) return -1;

    const fileName = `${postID}_image_01.jpeg`;

    const success = await uploadFile(
      'images',
      'postImage',
      fileName,
      imageBuffer.data
    );
    if (!success) return -1;

    const imageObj = await new Image.model({
      user: userID,
      post: postID,
      fileName,
    }).save();
    return { imageID: imageObj._id, fileName };
  } catch (err) {
    log('error', err);
    return -1;
  }
}
