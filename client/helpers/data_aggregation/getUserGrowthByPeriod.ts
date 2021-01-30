import { User } from '../../models';
import { log } from '../functions';
import json2csv = require('json2csv');

const fs = require('fs');
const dayjs = require('dayjs');

const { Parser } = json2csv;
const {
  transforms: { unwind },
} = json2csv;

/**
 * Returns how many new users were created within a given window, broken down by period
 * @function getUserGrowthByPeriod
 * @param period Frame to group users by
 * @param range Optional start date and optional end date to count user growth between.
 * Defaults: start=rootshare creation && end=present
 */
export const getUserGrowthByPeriod = async (
  period: 'day' | 'month' | 'year',
  range?: { start?: Date; end?: Date }
) => {
  const query: { createdAt: { [k: string]: unknown } } = {
    createdAt: { $ne: undefined },
  };

  if (range?.start) query.createdAt.$gte = range?.start;
  if (range?.end) query.createdAt.$lte = range?.end;

  try {
    const users = await User.find(query, ['createdAt', 'firstName'])
      .sort('createdAt')
      .exec();

    const groupedUsers = groupByPeriod(users, period);

    const csv = countAndConvertToCSV(groupedUsers);
    return csv;
  } catch (err) {
    log('error', err.message);
    return false;
  }
};

/**
 *
 * @param objArr Array of objects to group, only required field is createdAt. Object will not be modified
 * @param period Period to group by
 * @returns Dictionary, each key is one period, values are array of created within that period
 */

const groupByPeriod = (
  objArr: { [k: string]: unknown; createdAt: Date }[],
  period: 'day' | 'month' | 'year'
) => {
  const format = getDateFormat(period);
  let output: { [k: string]: typeof objArr } = {};
  objArr.forEach((obj) => {
    const frame = dayjs(obj.createdAt).format(format);
    if (!(frame in output)) output[frame] = [];
    output[frame].push(obj);
  });
  return output;
};

const getDateFormat = (period: 'day' | 'month' | 'year') => {
  switch (period) {
    case 'day':
      return 'MMM D YYYY';
    case 'month':
      return 'MMM YYYY';
    case 'year':
      return 'YYYY';
  }
};

const countAndConvertToCSV = (periodGroupedUsers: {
  [key: string]: { [key: string]: unknown; createdAt: Date }[];
}) => {
  const periodCounts: { periods: { period: string; newUsers: number }[] } = {
    periods: Object.keys(periodGroupedUsers).map((key) => ({
      period: key,
      newUsers: periodGroupedUsers[key].length,
    })),
  };

  const parser = new Parser({
    fields: [
      { label: 'Period', value: 'periods.period' },
      { label: 'New users', value: 'periods.newUsers' },
    ],
    transforms: [unwind({ paths: 'periods', blankOut: true })],
  });

  try {
    const csv = parser.parse(periodCounts);
    return csv;
  } catch (err) {
    log('error', `Failed to parse CSV: ${err.message}`);
    return false;
  }
};
