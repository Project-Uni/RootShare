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
 *            $ref: '#/components/schemas/User'
 *            description: The id of the user who requested the connection
 *          to:
 *            $ref: '#/components/schemas/User'
 *            description: The id of the user whom the request was sent to
 *          createdAt:
 *            type: date-time
 *            description: The date of the record creation.
 *          updatedAt:
 *            type: date-time
 *            description: When the record was last updated
 *        example:
 *          from: 0123456789abcdef
 *          to: 1123456789abcdef
 *          accepted: true
 *
 */

const connectionSchema = new Schema(
  {
    from: { type: Schema.ObjectId, ref: 'users', required: true },
    to: { type: Schema.ObjectId, ref: 'users', required: true },
    accepted: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

mongoose.model('connections', connectionSchema);
const ConnectionModel = mongoose.model('connections');

export default class Connection {
  static model = ConnectionModel;
  static DefaultConnectionFields = [
    'from',
    'to',
    'accepted',
    'createdAt',
    'updatedAt',
  ] as const;

  static create = async (params: { from: string; to: string }) => {
    const connection = await new ConnectionModel({ ...params }).save();
    return connection;
  };

  static getByIDs = async (
    _ids: string[],
    fields: typeof Connection.DefaultConnectionFields[number][] = [
      ...Connection.DefaultConnectionFields,
    ],
    options: {
      populateFromFields?: string[];
      populateToFields?: string[];
      limit?: number;
      lean?: boolean;
    } = {}
  ) => {
    let output = ConnectionModel.find({ _id: { $in: _ids } }, fields);
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

  static update = async (connectionID: string, updates: { accepted: boolean }) => {
    const update = await ConnectionModel.updateOne({ _id: connectionID }, updates);
    return update;
  };

  static getConnectionStatuses = async (userID: string, otherUserIDs: string[]) => {
    let sentPromises = [];
    let receivedPromises = [];
    const length = otherUserIDs.length;
    let connections = new Array(length);
    connections.fill({ status: 'PUBLIC' });

    otherUserIDs.forEach((otherUserID) => {
      sentPromises.push(
        ConnectionModel.findOne({ from: userID, to: otherUserID }).lean().exec()
      );
      receivedPromises.push(
        ConnectionModel.findOne({ from: otherUserID, to: userID }).lean().exec()
      );
    });

    return Promise.all([...sentPromises, ...receivedPromises]).then(
      (allRequests) => {
        for (let i = 0; i < length; i++) {
          if (!!allRequests[i]) {
            connections[i] = { ...allRequests[i] };
            if (allRequests[i].accepted) connections[i].status = 'CONNECTED';
            else connections[i].status = 'TO';
          }

          const j = i + length;
          if (!!allRequests[j]) {
            connections[i] = { ...allRequests[j] };
            if (allRequests[j].accepted) connections[i].status = 'CONNECTED';
            else connections[i].status = 'FROM';
          }
        }

        return connections;
      }
    );
  };
}
