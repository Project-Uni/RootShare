import makeRequest from '../helpers/makeRequest';
import logger from '../helpers/logger';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import sendPacket from '../../webinar/helpers/sendPacket';

module.exports = (app) => {
  app.post('/proxy/addWebinarToCache', isAuthenticatedWithJWT, async (req, res) => {
    const { webinarID } = req.body;
    if (!webinarID) return res.json(sendPacket(-1, 'No webinarID in request body'));

    const authHeader = req.headers['authorization'];
    const accessToken = authHeader && authHeader.split(' ')[1];

    const data = await makeRequest(
      'webinarCache',
      'api/addWebinarToCache',
      'POST',
      {
        webinarID,
      },
      true,
      accessToken,
      '',
      req.user
    );

    console.log(data);
    return res.json(sendPacket(1, 'Successfully made API call'));
  });

  app.post(
    '/proxy/removeWebinarFromCache',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { webinarID } = req.body;
      if (!webinarID)
        return res.json(sendPacket(-1, 'No webinarID in request body'));

      const authHeader = req.headers['authorization'];
      const accessToken = authHeader && authHeader.split(' ')[1];

      const data = await makeRequest(
        'webinarCache',
        'api/removeWebinarFromCache',
        'POST',
        {
          webinarID,
        },
        true,
        accessToken,
        '',
        req.user
      );

      console.log(data);
      return res.json(sendPacket(1, 'Successfully made API call'));
    }
  );
};
