/**
 * Created by joey on 8/10/14.
 */

var CONSTANTS = require('../config/constants.js');
var CONFIG = require('../config/' + CONSTANTS.ENV + '.js');

var mongoose = require('mongoose');
mongoose.connect(CONFIG.DB);

var Schema = mongoose.Schema;

// 定义Schema
// 学生
var studentSchema = new Schema({
    id: String,
    term: Schema.Types.ObjectId,
    name: String,
    number: String,
    grade: Number,
    class: Number,
    pid: Number,
    sex: Number
});
// 老师
var teacherSchema = new Schema({
    id: String,
    term: Schema.Types.ObjectId,
    authority: Number /* 0 普通 1 数据管理 2 系统管理 3 校长*/
});
// 关系
var relationshipSchema = new Schema({
    id: String,
    term: Schema.Types.ObjectId,
    name: String,
    grade: Number,
    class: Number
});
// 学期
var termSchema = new Schema({
    name: String,
    status: Number, /* 0：当前编辑状态，1：关闭状态，2：激活状态 */
    year: Number,
    day: Number,
    months: [
        {s: Number, e: Number}
    ]
});
// 指标
var indicatorSchema = new Schema({
    term: Schema.Types.ObjectId,
    name: String,
    order: Number,
    score: Number,
    desc: String
});
// 评分
var scoreSchema = new Schema({
    student: Schema.Types.ObjectId,
    term: Schema.Types.ObjectId,
    month: Number,
    total: Number,
    scores: [
        {indicator: Schema.Types.ObjectId, self: Number, parent:Number, teacher: Number}
    ]
});

exports.getStudentModel = function () {
    return mongoose.model('student', studentSchema);
};

exports.getIndicatorModel = function () {
    return mongoose.model('indicator', indicatorSchema);
};

exports.getTermModel = function () {
    return mongoose.model('term', termSchema);
};

exports.getTeacherModel = function () {
    return mongoose.model('teacher', teacherSchema);
};

exports.getScoreModel = function () {
    return mongoose.model('score', scoreSchema);
};

exports.getRelationshipModel = function () {
    return mongoose.model('relationship', relationshipSchema);
};

