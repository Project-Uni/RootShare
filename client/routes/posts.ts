import { log, sendPacket } from '../helpers/functions';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';

import { Post } from '../models';

export default function postsRoutes(app) {
  app.post('/api/posts/broadcast/user', isAuthenticatedWithJWT, async (req, res) => {
    const { message } = req.body;

    if (!message) return res.json(sendPacket(-1, 'message is missing from request'));

    try {
      const newPost = await new Post({ message, user: req.user._id }).save();
      log(
        'info',
        `Successfully created for user ${req.user.firstName} ${req.user.lastName}`
      );
      return res.json(sendPacket(1, 'Successfully created post', { newPost }));
    } catch (err) {
      log('error', err);
      return res.json(sendPacket(0, err));
    }
  });
}
