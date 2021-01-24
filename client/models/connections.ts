var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 *
 * @swagger
 *  components:
 *    schemas:
 *      Connection:
 *        type: object
 *        required:
 *          - from
 *          - to
 *          - accepted
 *        properties:
 *          _id:
 *            type: string
 *            description: Auto-generated id
 *          from:
 *            type: ObjectId
 *            description: The id of the user who requested the connection
 *          to:
 *            type: ObjectId
 *            description: The id of the user whom the request was sent to
 *          createdAt:
 *            type: date
 *            description: The date of the record creation.
 *          updatedAt:
 *            type: date
 *            description: When the record was last updated
 *        example:
 *          from: 0123456789abcdef
 *          to: '0123456789abcdff'
 *          accepted: 'true'
 *
 */

var connectionSchema = new Schema(
  {
    from: { type: Schema.ObjectId, ref: 'users', required: true },
    to: { type: Schema.ObjectId, ref: 'users', required: true },
    accepted: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

mongoose.model('connections', connectionSchema);
const Connection = mongoose.model('connections');

export default Connection;

export const createConnection = async (fromUserID: string, toUserID: string) => {
  const connection = await new Connection({ from: fromUserID, to: toUserID }).save();
  return connection;
};

const DefaultConnectionFields = ['from', 'to', 'accepted', 'createdAt', 'updatedAt'];
export const getConnectionsByIDs = async (
  _ids: string[],
  fields: typeof DefaultConnectionFields[number][] = [...DefaultConnectionFields],
  options: {
    populateFromFields?: string[];
    populateToFields?: string[];
    limit?: number;
    lean?: boolean;
  } = {}
) => {
  let output = Connection.find({ _id: { $in: _ids } }, fields);
  if (options.limit) output = output.limit(options.limit);
  if (options.populateFromFields)
    output = output.populate({
      path: 'from',
      select: options.populateFromFields.concat(' '),
    });
  if (options.populateToFields)
    output = output.populate({
      path: 'to',
      select: options.populateToFields.concat(' '),
    });

  if (options.lean) output = output.lean();
  const result = await output.exec();
  return result;
};

export const updateConnection = async (connectionID: string, updates: any) => {
  const update = await Connection.updateOne({ _id: connectionID }, updates);
  return update;
};
