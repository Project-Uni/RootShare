import { makeRequest } from '../../helpers/functions';
import { stringify } from 'qs';

export const getCommunities = async <T = { [k: string]: any }>(
  _ids: string[],
  params: {
    fields?: string[];
    options?: {
      getProfilePicture?: boolean;
      getBannerPicture?: boolean;
      getRelationship?: boolean;
      limit?: number;
      includeDefaultFields?: boolean;
      // populates?: string[];
    };
  }
) => {
  const query = stringify(
    {
      _ids,
      fields: params.fields,
      ...params.options,
    },
    { arrayFormat: 'repeat' }
  );
  const { data } = await makeRequest<T>('GET', `/api/v2/community?${query}`);
  return data;
};
