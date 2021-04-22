import { Express } from 'express';
import { isAuthenticatedWithJWT } from '../../passport/middleware/isAuthenticated';
import { isRootshareAdmin } from '../middleware/privilegeAuthentication';
import { FilterQuery } from 'mongoose';

import { Model, AdminDatabase } from '../../interactions/admin';
//TODO - Swagger

export default function adminDatabaseRoutes(app: Express) {
  app.put(
    '/api/admin/general/database',
    isAuthenticatedWithJWT,
    isRootshareAdmin,
    async (req, res) => {
      const { model, select, query, populates, limit, sort } = req.body as {
        model: Model;
        select: string;
        query: FilterQuery<any>;
        populates?: {
          path: string;
          select: string;
          populate?: { path: string; select: string };
        }[];
        limit?: number;
        sort: { [k: string]: 1 | -1 };
      };

      const result = await new AdminDatabase().find({
        model,
        select,
        query,
        populates,
        limit,
        sort,
      });

      const status = result.success === 1 ? 200 : 500;
      res.status(status).json(result);
    }
  );
}
