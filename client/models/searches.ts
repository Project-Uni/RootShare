const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 *
 * @swagger
 *  components:
 *    schemas:
 *      Search:
 *        type: object
 *        required:
 *          - user
 *          - query
 *        properties:
 *          _id:
 *            type: string
 *            description: Auto-generated ID
 *          user:
 *            $ref: '#/components/schemas/User'
 *            description: The ID of the user who made the search
 *          query:
 *            type: string
 *            description: The message the user sent
 *          createdAt:
 *            type: string
 *            format: date-time
 *            description: The date of the record creation.
 *          updatedAt:
 *            type: string
 *            format: datetime
 *            description: When the record was last updated
 *        example:
 *          user: 1jknj209asd0
 *          query: 'Ashwin RootShare'
 *
 */

const SearchSchema = new Schema(
  {
    user: { type: Schema.ObjectId, ref: 'users' },
    query: { type: String, required: true },
  },
  { timestamps: true }
);

mongoose.model('searches', SearchSchema);
const Search = mongoose.model('searches');

export default Search;

export const createSearch = async (userID: string, query: string) => {
  const search = await new Search({ user: userID, query: query }).save();
  return search;
};

export const DefaultSearchFields = [
  'user',
  'query',
  'createdAt',
  'updatedAt',
] as const;

export const getSearchesByIds = async (
  _ids: string[],
  fields: typeof DefaultSearchFields[number][] = [...DefaultSearchFields],
  options: {
    populateUser?: string[];
    limit?: number;
    lean?: boolean;
  } = {}
) => {
  let output = Search.find({ _id: { $in: _ids } }, fields);
  if (options.limit) output = output.limit(options.limit);
  if (options.populateUser)
    output = output.populate({
      path: 'user',
      select: options.populateUser.concat(' '),
    });
  if (options.lean) output = output.lean();
  const result = await output.exec();

  return result;
};
