/**
 * Created by joey on 8/10/14.
 */

/**
 * Created by joey on 8/10/14.
 */

var CONSTANTS = require('./config/constants.js');
var CONFIG = require('./config/' + CONSTANTS.ENV + '.js');
var mongoose = require('mongoose');
mongoose.connect(CONFIG.DB);
var conn;

var Schema = mongoose.Schema;

// 定义Schema
// 学生
var studentSchema = new Schema({
    id: String,
    name: String,
    number: String,
    grade: Number,
    class: Number,
    pid: Number,
    sex: Number
});

exports.findOne = function (id, cb) {
    conn = mongoose.connection;
    conn.on('error', console.error.bind(console, 'connection error:'));
    conn.once('open', function () {

    });
}

