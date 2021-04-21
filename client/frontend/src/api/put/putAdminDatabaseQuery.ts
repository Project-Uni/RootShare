import { makeRequest } from '../../helpers/functions';

export const putAdminDatabaseQuery = async ({
  query,
  limit,
  select,
  model,
  populates,
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
}) => {
  const cleanedPopulates = populates?.map((p) => {
    const s = p.select.join(' ');
    let pp: { path: string; select: string } | undefined = undefined;
    if (p.populate)
      pp = { path: p.populate.path, select: p.populate.select.join(' ') };

    return {
      path: p.path,
      select: s,
      populate: pp,
    };
  });

  const { data } = await makeRequest<{ data: { [k: string]: any }[] }>(
    'PUT',
    `/api/admin/general/database`,
    {
      query: JSON.parse(query),
      limit: limit ? parseInt(limit) : undefined,
      select: select.join(' '),
      model,
      populates: cleanedPopulates,
    }
  );

  return data;
};
