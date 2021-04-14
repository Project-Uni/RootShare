import { makeRequest } from '../../helpers/functions';
import { stringify } from 'query-string';
import { Link } from '../../helpers/types';

export const postUploadLinks = async (
  entityID: string,
  entityType: 'user' | 'community',
  links: Link[],
  removeIDs: string[]
) => {
  const params = stringify({
    entityID,
    entityType,
  });
  const { data } = await makeRequest('POST', `/api/media/links?${params}`, {
    links: links.map((link) => `${link.linkType} ${link.url}`),
    removeIDs,
  });
  return data;
};
