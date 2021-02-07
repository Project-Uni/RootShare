import { makeRequest } from '../../helpers/functions';
import { stringify } from 'qs';

export const getUsers = async <T = { [k: string]: unknown }>(
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
  const query = stringify({
    _ids,
    fields: params.fields,
    ...params.options,
  });
  const { data } = await makeRequest<T>('GET', `/api/v2/users?${query}`);
  return data;
};