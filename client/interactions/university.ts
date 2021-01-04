import { log, sendPacket } from '../helpers/functions';
import { University } from '../models';

const mongoose = require('mongoose');

export function getDepartments(universityID, callback) {
  University.findById(universityID, ['departments'], (err, university) => {
    if (err) {
      log('error', err);
      return callback(sendPacket(-1, err));
    }
    if (!university) return callback(sendPacket(0, 'Could not find University'));

    return callback(
      sendPacket(1, 'Sending University departments', {
        departments: university.departments,
      })
    );
  });
}
