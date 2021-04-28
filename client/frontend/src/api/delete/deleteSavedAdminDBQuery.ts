import { makeRequest } from '../../helpers/functions';
import { stringify } from 'qs';

export const deleteSavedAdminDBQuery = async (_id: string) => {
  const params = stringify({ _id });

  const { data } = await makeRequest<{ error?: { [k: string]: any } }>(
    'DELETE',
    `/api/admin/general/database/saved?${params}`
  );

  return data;
};
