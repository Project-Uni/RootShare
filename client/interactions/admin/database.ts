import { FilterQuery, Model as MongooseModel } from 'mongoose';
import { log, sendPacket } from '../../helpers/functions';
import { getModel } from '../../rootshare_db/models';
import { Model } from '../../rootshare_db/types';

export class AdminDatabase {
  find = async ({
    model,
    select,
    query,
    populates,
    limit,
    sort,
  }: {
    model: Model;
    select: string;
    query: FilterQuery<any>;
    populates?: {
      path: string;
      select: string;
      populate?: {
        path: string;
        select: string;
      }; //For Community Edge and connection
    }[];
    limit?: number;
    sort?: { [k: string]: 1 | -1 };
  }) => {
    if (!select) return sendPacket(-1, 'Select is required.');

    const db = getModel(model);
    if (!db) return sendPacket(-1, 'Invalid Model');

    try {
      let action = (db.model as MongooseModel<any>).find(query, select);

      if (sort) action = action.sort(sort);
      if (limit) action = action.limit(limit);

      if (populates) {
        populates.forEach((p) => {
          action = action.populate(p);
        });
      }

      const data = await action.lean().exec();

      if (!data) return sendPacket(0, 'Failed to retrieve data');

      return sendPacket(1, 'Successfully retrieved data', { data });
    } catch (error) {
      log('error', error);
      return sendPacket(-1, 'Failed with error', { error });
    }
  };
}
