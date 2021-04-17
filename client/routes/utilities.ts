import { User } from '../rootshare_db/models';
import { log, sendPacket, getQueryParams } from '../helpers/functions';
import { getViewersForEvents } from '../helpers/data_aggregation/getViewersForEvents';
import {
  getTotalMTGViewers,
  getUniqueInterested,
} from '../helpers/data_aggregation/getMTGUniqueUserInfo';
import { getUserGrowthByPeriod } from '../helpers/data_aggregation/getUserGrowthByPeriod';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';

export default function utilityRoutes(app) {
  app.get('/api/utilities/mtg/interested', async (req, res) => {
    // const data = await getUniqueInterested();
    // return res.json(
    //   sendPacket(1, 'Retrieved Data', {
    //     users: data,
    //     count: Object.keys(data).length,
    //   })
    // );
    res.status(401).send('Re-activate this route if you want this data');
  });

  app.get('/api/utilities/mtg/viewers', async (req, res) => {
    // const data = await getTotalMTGViewers();
    // return res.json(
    //   sendPacket(1, 'Retrieved Viewers:', { viewers: data, length: data.length })
    // );
    res.status(401).send('Re-activate this route if you want this data');
  });

  app.get('/api/utilities/events/viewers', async (req, res) => {
    // const eventsCSV = await getViewersForEvents(['6058db7add0bb42382a5dd37']);
    // if (eventsCSV) {
    //   res.attachment('events_aggregation.csv');
    //   res.status(200).send(eventsCSV);
    // } else {
    //   res.status(500).send('Failed to retrieve information and convert to CSV');
    // }
    res.status(401).send('Re-activate this route if you want this data');
  });

  app.get('/api/utilities/growth', async (req, res) => {
    // const query = getQueryParams<{period: string}>(req, { period: { type: 'string' } });
    // if (!query) return res.status(500).send('Invalid query');
    // const growthCSV = await getUserGrowthByPeriod('month');
    // if (growthCSV) {
    //   res.attachment('user_growth.csv');
    //   res.status(200).send(growthCSV);
    // } else res.status(401).send('Failure');
    res.status(401).send('Re-activate this route if you want this data');
  });
}
