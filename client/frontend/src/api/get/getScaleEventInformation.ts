import { makeRequest } from '../../helpers/functions';
import { EventInformationServiceResponse } from '../../main-platform/community/components/MeetTheGreeks/EventEditor/MeetTheGreeksModal';

export const getScaleEventInformation = async (communityID: string) => {
  const { data } = await makeRequest<EventInformationServiceResponse>(
    'GET',
    `/api/mtg/event/${communityID}/grand-prix`
  );
  return data;
};
