import { makeRequest } from '../../helpers/functions';

export const postPromoteEvent = async ({
  eventID,
  message,
}: {
  eventID: string;
  message: string;
}) => {
  const { data } = await makeRequest('POST', `/api/notifications/promoteEvent`, {
    eventID,
    message,
  });

  return data;
};
