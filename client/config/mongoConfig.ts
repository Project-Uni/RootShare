var mongoose = require("mongoose");
const { DB_KEY } = require('../../keys/keys.json')
import log from '../helpers/logger'

//DEFINE Database Stuff here
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://dbUser1:${DB_KEY}@clusteru-xuq4v.mongodb.net/test?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useUnifiedTopology: true, useNewUrlParser: true });
var db: any;

module.exports = {
    connectDB: function (callback) {
        mongoose.connect(uri, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true
        })
            .then(() => {
                log("MONGO", "connected to DB")
            })
            .catch(err => {
                log("MONGO ERROR", err.message);
            })
    },
}
