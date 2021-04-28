import { makeRequest } from '../../helpers/functions';
import { Model } from '../../helpers/constants/databaseQuery';

export const postSaveAdminDBQuery = async (args: {
  title: string;
  description: string;
  model: Model;
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
}) => {
  const { data } = await makeRequest<ISaveAdminDBQueryResponse>(
    'POST',
    '/api/admin/general/database/saved',
    args
  );

  return data;
};

export type ISaveAdminDBQueryResponse = {
  query: {
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
  };
};
