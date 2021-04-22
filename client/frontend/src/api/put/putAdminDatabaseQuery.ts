import { makeRequest } from '../../helpers/functions';

export const putAdminDatabaseQuery = async ({
  query,
  limit,
  select,
  model,
  populates,
  sort,
}: {
  query: string;
  limit?: string;
  select: string[];
  model: string;
  populates?: {
    path: string;
    select: string[];
    populate?: { path: string; select: string[] };
  }[];
  sort: { field: string; order: 1 | -1 };
}) => {
  const cleanedPopulates = populates?.map((p) => {
    const populateSelect = p.select.join(' ');
    let nestedPopulate: { path: string; select: string } | undefined = undefined;
    if (p.populate)
      nestedPopulate = {
        path: p.populate.path,
        select: p.populate.select.join(' '),
      };

    return {
      path: p.path,
      select: populateSelect,
      populate: nestedPopulate,
    };
  });

  const cleanedSort = sort.field ? { [sort.field]: sort.order } : undefined;

  const { data } = await makeRequest<{ data: { [k: string]: any }[] }>(
    'PUT',
    `/api/admin/general/database`,
    {
      query: JSON.parse(query),
      limit: limit ? parseInt(limit) : undefined,
      select: select.join(' '),
      model,
      populates: cleanedPopulates,
      sort: cleanedSort,
    }
  );

  return data;
};
