import { stringify } from 'qs';
import { makeRequest } from '../../helpers/functions';

export type GetRecentEventResponse = {
  title: string;
  brief_description: string;
  full_description: string;
  dateTime: string;
  eventImage?: string;
  _id: string;
};

export const getRecentEvents = async (limit: number) => {
  const query = stringify({ limit });
  const { data } = await makeRequest<{ events: GetRecentEventResponse[] }>(
    'GET',
    `/api/webinar/recent?${query}`
  );
  return data;
};
