/**
 * Created by joey on 8/10/14.
 */

var MongoClient = require('mongodb').MongoClient;

var CONSTANTS = require('./config/constants.js');
var CONFIG = require('./config/' + CONSTANTS.ENV + '.js');

//window
// var Mongo = require('mongodb');
// var MongoServer = require('mongodb').Server;
// var wserver  = new MongoServer('localhost', 27017, {auto_reconnect:true});
// var wdb = new Mongo.Db('xzone', MongoServer, {safe:true});


var ins = null;

exports.open = function (callback) {

    if (ins) {
        callback(null, ins);
        return;
    }
    MongoClient.connect(CONFIG.DB, function (err, db) {
        if (!err) {
            ins = db;
            console.log('DB open');
        } else {
            console.error('DB open error: ', err);
        }
        callback(err, db);
    });
};

exports.close = function () {
    if (ins) {
        ins.close();
        ins = null;
    }
};

