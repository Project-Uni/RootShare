import { stringify } from 'qs';

import { makeRequest } from '../../helpers/functions';
import { SidebarComponents } from '../../main-platform/RightSidebar/RightSidebar';

export const getSidebarData = async (dataSources: SidebarComponents[]) => {
  const query = stringify(
    {
      dataSources,
    },
    { arrayFormat: 'repeat' }
  );

  const { data } = await makeRequest<{ [key in SidebarComponents]?: any }>(
    'GET',
    `/api/v2/discover/sidebar?${query}`
  );
  return data;
};
