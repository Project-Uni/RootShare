import { makeRequest } from '../../helpers/functions';
import { stringify } from 'qs';

export const putNotificationsSeen = async ({
  notifications,
}: {
  notifications: { [k: string]: unknown; _id: string }[];
}) => {
  const params = stringify(
    { _ids: notifications.map((n) => n._id) },
    { arrayFormat: 'repeat' }
  );
  const { data } = await makeRequest('PUT', `/api/notifications/seen?${params}`);
  return data;
};
