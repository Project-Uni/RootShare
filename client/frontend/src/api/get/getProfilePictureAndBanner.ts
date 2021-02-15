import { makeRequest } from '../../helpers/functions';
import { stringify } from 'query-string';

export const getProfilePictureAndBanner = async (
  type: 'user' | 'community',
  _id: string,
  options: { getProfile?: boolean; getBanner?: boolean }
) => {
  const route = '/api/images/profile';
  const params = stringify({
    _id,
    type,
    getProfile: options.getProfile,
    getBanner: options.getBanner,
  });

  const { data } = await makeRequest<{ profile?: string; banner?: string }>(
    'GET',
    `${route}?${params}`
  );
  return data;
};
