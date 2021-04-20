import { stringify } from 'query-string';

import { makeRequest } from '../../helpers/functions';
import { EventInformationServiceResponse } from '../../main-platform/community/components/MeetTheGreeks/EventEditor/MeetTheGreeksModal';

export const getScaleEventInformation = async (
  communityID: string,
  scaleEventType: string
) => {
  const params = stringify({
    communityID,
    scaleEventType,
  });

  const { data } = await makeRequest<EventInformationServiceResponse>(
    'GET',
    `/api/mtg/event?${params}`
  );
  return data;
};
