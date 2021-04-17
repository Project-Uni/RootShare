import { isAuthenticatedWithJWT, isRootshareAdmin } from '.';
import { getUserData } from '../../interactions/admin';

export default function adminMiscRoutes(app) {
  app.get(
    '/api/admin/userCount',
    isAuthenticatedWithJWT,
    isRootshareAdmin,
    (req, res) => {
      getUserData((packet) => {
        res.json(packet);
      });
    }
  );

  //NOTE - Keep this for now, and update text if we need it for upcoming events, so we don't have to randomly write up and format an email 20 minutes before the event
  app.put(
    '/api/admin/massEmail',
    isAuthenticatedWithJWT,
    isRootshareAdmin,
    async (req, res) => {
      // const subject = `RootShare Presents: Chris Kramer All-Access`;
      // const message = `
      //   <h3>The Purdue Days, Basketball, and What Comes Next</h3>
      //   <h4>Join us today, September 4th, at 7pm EST to get the inside scoop from one of Purdue's top basketball players in history. Hear from Chris Kramer on how he juggled academics, athletics and his faith on his journey to success.</h4>
      //   <h3>Special Hosts: Chris Hartley & Robbie Hummel</h3>
      //   <p>Kramer will be joined by former Boiler Ball players Chris Hartley
      //   and Robbie Hummel for a night you won't want to miss!</p>
      //   <p><b>Log into your Rootshare account to access the Live Event <a href='https://rootshare.io/event/5f502ef670f5ff2eaa1f8e9a'>here</a></b></p>
      //   <p>Or visit https://rootshare.io/event/5f502ef670f5ff2eaa1f8e9a.</p>

      //   <p>Thanks!</p>
      //   <p><b>The RootShare Team</b></p>
      // `;
      // const response = await phasedEmergencyEmailRollout(subject, message);
      // return res.send(response);
      res.status(401).send('Re-activate this route if you want this data');
    }
  );

  app.put(
    '/api/admin/massSMS',
    isAuthenticatedWithJWT,
    isRootshareAdmin,
    async (req, res) => {
      // const users = await User.find({
      //   $and: [{ phoneNumber: { $exists: true } }, { phoneNumber: { $ne: '' } }],
      // }).exec();
      // const phoneNumbers = users.map((u) => u.phoneNumber);

      // sendSMS(
      //   phoneNumbers,
      //   'Hey it’s Chris Hartley, CEO of 🌱RootShare! I wanted to remind you that we are hosting an EXCLUSIVE event with Northwestern Mutual for Purdue students and alumni TONIGHT! Tune with your Rootshare account using the link below. \n\nhttps://RootShare.io/event/6058db7add0bb42382a5dd37',
      //   'https://rootshare-profile-images.s3.us-east-2.amazonaws.com/images/messaging/nwm_Graphic.png'
      // );

      // return res.json(
      //   sendPacket(1, 'Users', {
      //     phoneNumbers,
      //   })
      // );
      res.status(401).send('This is an example usage route');
    }
  );
}
