var mongoose = require("mongoose");
const {dbKey} = require('../keys')

//DEFINE Database Stuff here
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://dbUser1:${dbKey}@clusteru-xuq4v.mongodb.net/test?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {useUnifiedTopology: true, useNewUrlParser: true});
var db: any;

module.exports = {
    connectDB: function(callback) {
        mongoose.connect(uri, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true
        })
        .then(() => {
            console.log("Connected to MongoDB!")
        })
        .catch(err => {
            console.log(`DB Connection Error: ${err.message}`);
        })
    },
}
