import { IRequest } from '../types';
import { log } from './';

type QueryValue = string | string[] | number | number[] | boolean | boolean[];

//Added this type in for autocomplete on fields arg when calling the function
type DefaultQueryType = {
  [key: string]: {
    optional?: boolean;
    type: 'string' | 'string[]' | 'number' | 'number[]' | 'boolean' | 'boolean[]';
  };
};

export const getBodyParams = <T extends DefaultQueryType = DefaultQueryType>(
  req: IRequest,
  fields: T
) => {};
