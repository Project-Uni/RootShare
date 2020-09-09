import { log, sendPacket } from '../helpers/functions';
import { Post, User } from '../models';

const NUM_POSTS_RETRIEVED = 30;

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
    // const { university } = await User.findById(userID)
    //   .select('university')
    //   .populate({ path: 'university', select: ['universityName'] });

    const posts = await Post.find({ university: universityID })
      .sort({ createdAt: 'desc' })
      .limit(30)
      .exec();

    return sendPacket(1, 'Successfully retrieved the latest posts', { posts });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}
