import { makeRequest } from '../../helpers/functions';
import { stringify } from 'query-string';
import { Document } from '../../helpers/types';

export const postUploadDocuments = async (
  documents: FileList,
  entityID: string,
  entityType: 'user' | 'community'
) => {
  const params = stringify({
    entityID,
    entityType,
  });
  const bodyFormData = new FormData();
  for (let i = 0; i < documents.length; i++)
    bodyFormData.append('documents', documents[i]);
  const { data } = await makeRequest<{ documents: Document[] }>(
    'POST',
    `/api/media/documents?${params}`,
    bodyFormData,
    { 'Content-Type': 'multipart/form-data' }
  );
  return data;
};
