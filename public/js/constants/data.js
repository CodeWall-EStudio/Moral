// 定义Schema
// 学生
var studentSchema = new Schema({
    id: String,
    name: String,
    number: String,
    grade:  Number,
    class: Number,
    pid:   Number,
    sex: Number
});
// 老师
var teacherSchema = new Schema({
    id: String,
    name:  String,
    authority:   Number, /*是否足够*/
    classes: [{grade: Numer, class: Number}]
});
// 学期
var termSchema = new Schema({
    name:  String,
    months:   [{grade: Numer, class: Number}],
    day: String
});
// 指标
var indicatorSchema = new Schema({
    order: Number,
    name:  String,
    score:   Number,
    desc: String,
    term: String
});
// 评分
var scoreSchema = new Schema({
    student: String,
    term:  String,
    year:   Number,
    month: Number,
    scores: Number,
    selfScores: [{indicator: String, score: Number}],
    parentScores: [{indicator: String, score: Number}],
    teacherScores: [{indicator: String, score: Number}]
});
