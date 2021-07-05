import { isAuthenticatedWithJWT, isRootshareAdmin } from '.';
import { sendPacket, sendSMS } from '../../helpers/functions';
import { getUserData } from '../../interactions/admin';
import { User } from '../../rootshare_db/models';

const unique = (arr: string[]) => {
  const output: string[] = [];
  for (let i = 0; i < arr.length; i++) {
    if (output.indexOf(arr[i]) === -1) {
      output.push(arr[i]);
    }
  }
  return output;
};

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

  app.get(
    '/api/admin/sms',
    // isAuthenticatedWithJWT,
    // isRootshareAdmin,
    async (req, res) => {
      //   const users = await User.model
      //     .find({
      //       $and: [{ phoneNumber: { $exists: true } }, { phoneNumber: { $ne: '' } }],
      //     })
      //     .exec();
      //   const phoneNumbers = unique(users.map((u) => u.phoneNumber));

      //   await sendSMS(
      //     phoneNumbers,
      //     `With end of the school year quickly approaching with finals week, graduations, & job searching, Rootshare is happy to be hosting “How To Build A Winning Management Strategy” with Pro Basketball Player & Purdue Legend, Robbie Hummel & Northwestern Mutual CFO, Adam Turner!!!\n\nBe sure to tune in TONIGHT @ 8-9pm EST/ 5-6pm PST. #PurdueDayOfGiving\n\nClick to claim your spot now!\nRootshare.io🌱`,
      //     'https://rootshare-profile-images.s3.us-east-2.amazonaws.com/images/messaging/winning_strategy.png'
      //   );

      //   return res.json(
      //     sendPacket(1, 'Users', {
      //       phoneNumbers,
      //     })
      //   );
      res.status(401).send('This is an example usage route');
    }
  );
}
