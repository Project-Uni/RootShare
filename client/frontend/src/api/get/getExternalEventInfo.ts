import { stringify } from 'qs';
import { makeRequest } from '../../helpers/functions';
import { ExternalEvent } from '../../helpers/types';

export const getExternalEventInfo = async (eventID: string, userID?: string) => {
  const query = stringify({ eventID, userID });
  const { data } = await makeRequest<{ event: ExternalEvent }>(
    'GET',
    `/api/event/external?${query}`
  );
  return (data as unknown) as {
    successful: boolean;
    message: string;
    content: { event: ExternalEvent };
    status: number;
  };
};
