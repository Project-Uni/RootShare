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
 *            description: Auto-generated id
 *          user:
 *            type: string
 *            description: The id of the user who made the search
 *          query:
 *            type: string
 *            description: The message the user sent
 *          createdAt:
 *            type: string
 *            format: date
 *            description: The date of the record creation.
 *          updatedAt:
 *            type: string
 *            format: date
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

//Still trying to figure out how to do this, might have to make everything an aggregation pipeline for the options
const ACCEPTED_FIELDS = ['user', 'query', 'createdAt', 'updatedAt'] as const;

export const getSearchesByIds = async (
  _ids: string[],
  fields: typeof ACCEPTED_FIELDS[number][] = [
    'user',
    'query',
    'createdAt',
    'updatedAt',
  ],
  options: {
    populateUser?: string[];
    limit?: number;
    lean?: boolean;
  } = {}
) => {
  // const searches = await Search.find({ _id: { $in: _ids } }, fields).exec();
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
