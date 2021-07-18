import { stringify } from 'query-string';
import { makeRequest } from '../../../helpers/functions';

export const deleteCommunityAdminExternalEvent = async (
  communityID: string,
  eventID: string
) => {
  const params = stringify({ communityID, eventID });
  const { data } = await makeRequest(
    'DELETE',
    `/api/communityAdmin/event?${params}`
  );

  return (data as unknown) as {
    successful: boolean;
    message: string;
    content: {};
    status: number;
  };
};
