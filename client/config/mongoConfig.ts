import mongoose = require('mongoose');
const { DB_KEY } = require('../../keys/keys.json');

const uri = `mongodb+srv://dbUser1:${DB_KEY}@clusteru-xuq4v.mongodb.net/test?retryWrites=true&w=majority`;
let database: mongoose.Connection;

export const connect = () => {
  if (database) return;

  mongoose.connect(uri, {
    useNewUrlParser: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });

  database = mongoose.connection;

  database.once('open', () => {
    console.log('Connected to database');
  });
  database.on('error', () => {
    console.error('Error connecting to database');
  });
};

export const disconnect = () => {
  if (!database) return;

  mongoose.disconnect();
};
