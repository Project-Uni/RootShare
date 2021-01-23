const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 *
 * @swagger
 *  components:
 *    schemas:
 *      Company:
 *        type: object
 *        required:
 *          - name
 *          - description
 *        properties:
 *          _id:
 *            type: string
 *            description: Auto-generated id
 *          name:
 *            type: string
 *            description: Company Name
 *          description:
 *            type: string
 *            description: Company Description
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

const CompanySchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

mongoose.model('companies', CompanySchema);
const CompanyModel = mongoose.model('companies');

type IDsOptions = { includeDefaultFields?: boolean; limit?: number };

// Typescript classes documentation - https://www.typescriptlang.org/docs/handbook/classes.html

export class Company {
  static DefaultFields = ['name', 'description'] as const;
  static AcceptedFields = [...Company.DefaultFields] as const;
  static DefaultOptions: IDsOptions = {
    includeDefaultFields: true,
  };

  static create = async (params: { name: string; description: string }) => {
    const company = await new CompanyModel({ ...params }).save();
    return company;
  };

  static getByIDs = async (
    _ids: string[],
    params: {
      fields?: typeof Company.AcceptedFields[number][];
      options?: IDsOptions;
    }
  ) => {
    const { fields: fieldsParam, options: optionsParam } = params;
    const options: typeof params.options = {
      ...Company.DefaultOptions,
      ...(optionsParam || {}),
    };

    const fields = (fieldsParam || []).filter((field) =>
      Company.AcceptedFields.includes(field)
    );
    if (options.includeDefaultFields) {
      fields.push(
        ...[...Company.DefaultFields].filter((field) => fields.includes(field))
      );
    }

    let result = CompanyModel.find({ _id: { $in: _ids } }, fields);
    if (options.limit) result = result.limit(options.limit);

    const output = await result.lean().exec();

    return output;
  };
}

/**
 *
 * EXAMPLE USAGE
 *
 * import { Company } from 'models';
 *
 * var newCompany = await Company.create({ name: 'fake company', description: 'We are a company' });
 * var companies = await Company.getByIDs(['id1234', 'id2345'], {
 *   fields: ['description'],
 *   options: { includeDefaultFields: false },
 * });
 *
 */
