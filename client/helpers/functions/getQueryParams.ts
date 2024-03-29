import { IRequest } from '../../rootshare_db/types';
import { log } from './';

type QueryValue = string | string[] | number | number[] | boolean | boolean[];

//Added this type in for autocomplete on fields arg when calling the function
type DefaultQueryType = {
  [key: string]: {
    optional?: boolean;
    type: 'string' | 'string[]' | 'number' | 'number[]' | 'boolean' | 'boolean[]';
  };
};

/**
 * Extracts and type validates query parameters
 * @param req - HTTP Request
 * @param fields - Fields to test for. If it is an array, end the field with []
 * @returns False OR Dictionary with query params
 */
export const getQueryParams = <T>(
  req: IRequest,
  fields: DefaultQueryType
): T | false => {
  const query = new URLSearchParams((req.query as unknown) as string);
  let output = {};
  const keys = Object.keys(fields);

  for (let i = 0; i < keys.length; i++) {
    const field = keys[i];

    let val: QueryValue;

    const { type, optional } = fields[field];

    if (type.endsWith('[]')) {
      // val = query.getAll(field);
      val = req.query[field] as any; //TODO - Arrays arent working with URLSearchParams for some reason
    } else val = query.get(field);

    if (!val && !optional) {
      log('error', `Missing parameter: ${field}`);
      return false;
    }

    // Type conversion
    // Ensures that undefined optional parameters don't get cast as empty objects
    if (!val) continue;

    try {
      if (type.startsWith('number')) {
        if (type.endsWith('[]'))
          if (typeof val === 'string') val = [parseFloat(val)];
          else val = (val as Array<string>).map((arrVal) => parseFloat(arrVal));
        else val = parseInt(val as string);
      } else if (type.startsWith('boolean')) {
        if (type.endsWith('[]'))
          if (typeof val === 'string') val = [val === 'true'];
          else val = (val as Array<string>).map((arrVal) => arrVal === 'true');
        else val = val === 'true';
      } else if (type.startsWith('string')) {
        if (type.endsWith('[]')) if (typeof val === 'string') val = [val];
      }
    } catch (err) {
      log('error', `Type Mismatch: ${err.message}`);
      return false;
    }

    output[field] = val;
  }

  return output as T;
};
