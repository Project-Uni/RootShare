import { Model } from '../../helpers/constants/databaseQuery';
import { makeRequest } from '../../helpers/functions';

export type IGetSavedAdminDBQueriesResponse = {
  savedQueries: {
    _id: string;
    title: string;
    description: string;
    dbModel: Model;
    selectedFields: string[];
    populates: {
      path: string;
      select: string[];
      populate?: { path: string; select: string[] };
    }[];
    query: string;
    limit: string;
    sort: { field: string; order: 1 | -1 };
    displayColor: string;
    createdAt: string;
    updatedAt: string;
    user: {
      firstName: string;
      lastName: string;
      _id: string;
    };
  }[];
};

export const getSavedAdminDBQueries = async () => {
  const { data } = await makeRequest<IGetSavedAdminDBQueriesResponse>(
    'GET',
    `/api/admin/general/database/saved`
  );

  return data;
};
