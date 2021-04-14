import { stringify } from 'qs';

import { makeRequest } from '../../helpers/functions';
import {
  SidebarComponents,
  SidebarComponentTypes,
} from '../../main-platform/RightSidebar/RightSidebar';

export const getSidebarData = async (sidebarComponents: SidebarComponents) => {
  const { names, communityID, userID } = sidebarComponents;
  const query = stringify(
    {
      dataSources: names,
      communityID,
      otherUserID: userID,
    },
    { arrayFormat: 'repeat' }
  );

  const { data } = await makeRequest<{ [key in SidebarComponentTypes]?: any }>(
    'GET',
    `/api/v2/discover/sidebar?${query}`
  );
  return data;
};
