import { makeRequest } from '../../helpers/functions';
import { stringify } from 'qs';

export const getCommunitiesUniversity = async <T = { [k: string]: unknown }>(
  university: string,
  params: {
    fields?: string[];
    options?: {
      getProfilePicture?: boolean;
      getBannerPicture?: boolean;
      getRelationship?: boolean;
      limit?: number;
      includeDefaultFields?: boolean;
    };
  }
) => {
  const query = stringify({
    university,
    fields: params.fields,
    ...params.options,
  });
  const { data } = await makeRequest<T>('GET', `/api/v2/communitiesUniversity?${query}`);
  return data;
};
