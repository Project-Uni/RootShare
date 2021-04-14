import { makeRequest } from '../../helpers/functions';
import { stringify } from 'query-string';

export const deleteDocuments = async (
  entityID: string,
  entityType: 'user' | 'community',
  documentIDs: string[]
) => {
  const params = stringify({
    entityID,
    entityType,
    documentIDs,
  });
  const { data } = await makeRequest('DELETE', `/api/media/documents?${params}`);
  return data;
};
