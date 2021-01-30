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

    const groupedUsers = groupUsersByPeriod(users, period);

    console.log('Grouped:', Object.keys(groupedUsers as any));

    return true;
  } catch (err) {
    log('error', err.message);
    return false;
  }
};

const groupUsersByPeriod = (
  users: { _id: string; createdAt: Date }[],
  period: 'day' | 'month' | 'year'
) => {
  switch (period) {
    case 'day':
    // return groupByDay(users);
    case 'month':
      return groupByMonth(users);
    case 'year':
      return groupByYear(users);
  }
};
const groupByDay = (obj: { [k: string]: unknown; createdAt: Date }) => {
  let output: { [k: string]: typeof obj } = {};
  // let d = newDate();
};

const groupByMonth = (objArr: { [k: string]: unknown; createdAt: Date }[]) => {
  let output: { [k: string]: typeof objArr } = {};
  objArr.forEach((obj) => {
    const month = dayjs(obj.createdAt).format('MMM YYYY');
    if (!(month in output)) output[month] = [];
    output[month].push(obj);
  });
  return output;
};
const groupByYear = (objArr: { [k: string]: unknown; createdAt: Date }[]) => {
  const output: { [k: string]: typeof objArr } = {};
};
