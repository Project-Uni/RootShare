import mongoose = require('mongoose');
const { DB_KEY } = require('../../keys/keys.json');
import log from '../helpers/logger';

const uri = `mongodb+srv://dbUser1:${DB_KEY}@clusteru-xuq4v.mongodb.net/test?retryWrites=true&w=majority`;

export function connectDB(callback) {
  mongoose
    .connect(uri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    })
    .then(() => {
      log('info', 'Connected to Database');
    })
    .catch((err) => {
      log('error', err.message);
    });
}
