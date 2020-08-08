// import AWS = require('aws-sdk');

// const AWSKeys = require('../../keys/aws_key.json');
const fs = require('fs');

import log from '../helpers/logger';
import sendPacket from '../helpers/sendPacket';

import { uploadFile, retrieveFile } from '../helpers/S3';

module.exports = (app) => {
  app.get('/test/upload', async (req, res) => {
    fs.readFile('./frontend/src/images/team/smit.jpeg', async (err, data) => {
      if (err) {
        log('error', err);
        return res.json(sendPacket(0, 'Error uploading', { err: err }));
      }
      const success = await uploadFile('profile', 'smit.jpeg', data);

      if (!success) {
        return res.json(sendPacket(0, 'Failed to upload image'));
      }
      return res.json(sendPacket(1, 'Successfully uploaded image'));
    });
  });

  app.get('/test/retrieve', async (req, res) => {
    const data = await retrieveFile('profile', 'smit.jpeg');
    if (!data) {
      return res.json(sendPacket(0, 'Failed to retrieve image'));
    }
    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
    res.write(data.Body, 'binary');
    return res.end(null, 'binary');
  });
};
