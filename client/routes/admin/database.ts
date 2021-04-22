import { Express } from 'express';
import { isAuthenticatedWithJWT } from '../../passport/middleware/isAuthenticated';
import { isRootshareAdmin } from '../middleware/privilegeAuthentication';
import { FilterQuery } from 'mongoose';

import { Model, AdminDatabase } from '../../interactions/admin';

export default function adminDatabaseRoutes(app: Express) {
  /**
   *
   * @swagger
   * paths:
   *    /api/admin/general/database:
   *      put:
   *        summary: Perform a database query
   *        tags:
   *          - Admin
   *        parameters:
   *          - in: body
   *            name: dbQuery
   *            schema:
   *              type: object
   *              required:
   *                - model
   *                - select
   *                - query
   *              properties:
   *                model:
   *                  type: string
   *                  description: The model to query
   *                  example: 'user'
   *
   *                select:
   *                  type: string
   *                  description: Space seperated string of all the fields you want to retrieve
   *                  example: 'firstName lastName email'
   *
   *                query:
   *                  type: object
   *                  description: JSON mongoose query you are trying to perform
   *                  example: {_id: {$in: ['1234', '5678']}}
   *
   *                populates:
   *                  type: array
   *                  items:
   *                    type: object
   *                    properties:
   *                      path: string
   *                      select: string
   *                  description: Fields to populate
   *                  example: [{ path: 'joinedCommunities', select: 'name admin' }, { path: 'broadcastedPosts', select: 'message likes' }]
   *
   *                limit:
   *                  type: number
   *                  description: Maximum documents to retrieve
   *                  example: 35
   *
   *                sort:
   *                  type: object
   *                  properties:
   *                    sortField: string
   *                    order: number
   *                  description: Field to sort by, and order to sort in
   *                  example: { "createdAt": -1 }
   *
   *        responses:
   *          "200":
   *            description: Successfully retrieved query data
   *          "500":
   *            description: Failed to retrieve query data
   *
   */

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
