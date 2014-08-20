/**
 * Created by joey on 8/11/14.
 */

var db = require('../middleware/db');
var CONSTANTS = require('../config/constants');

// the middleware function
module.exports = function score(method) {
    return function (req, res, next) {
        var scoreModel = db.getScoreModel();
        if (method === 'post') {
            if (req.body.score) {
                try {
                    var data = JSON.parse(req.body.score);
                    if (data.student && data.term && data.month) {
                        scoreModel.update({ student: data.student, term: data.term, month: data.month }, data, { upsert: true, multi: true }, function (err, numberAffected, raw) {
                            if (err) {
                                console.error(err);
                                res.json({ code: CONSTANTS.MSG_ERR });
                            } else {
                                console.log('The number of updated documents was %d', numberAffected);
                                console.log('The raw response from Mongo was ', raw);
                                var id = '';
                                if (raw.ok && !raw.updatedExisting) {
                                    id = raw.upserted;
                                }
                                res.json({ code: CONSTANTS.MSG_SUCC, id: id });
                            }
                        });
                    } else {
                        res.json({ code: CONSTANTS.MSG_PARAM });
                    }
                } catch (err) {
                    console.error(err);
                    res.json({ code: CONSTANTS.MSG_ERR });
                }
            } else {
                res.json({ code: CONSTANTS.MSG_PARAM });
            }
        } else if (method === 'list') {
            var t = req.param('term');
            var m = req.param('month');
            var g = req.param('grade');
            var c = req.param('class');
            var conn1 = {term: t};
            if (m != '0') {
                conn1 = {term: t, month: m};
            }
            var conn2 = {};
            if (g && c) {
                conn2 = {grade: g, class: c};
            }
            var studentModel = db.getStudentModel();
            studentModel.find(conn2, function(err, students) {
                if (err) {
                    console.error(err);
                    res.json({ code: CONSTANTS.MSG_ERR });
                } else {
                    var sArr = new Array();
                    for(var i = 0; i < students.length; i++) {
                        sArr.push(students[i]._id);
                    }
                    scoreModel.find(conn1).where('student').in(sArr).exec(function(err, scores) {
                        if (err) {
                            console.error(err);
                            res.json({ code: CONSTANTS.MSG_ERR });
                        } else {
                            var sObj = new Object();
                            for(var i = 0; i < scores.length; i++) {
                                if (m != '0') {
                                    sObj[scores[i].student] = scores[i];
                                } else {
                                    if (sObj[scores[i].student]) {
                                       sObj[scores[i].student].total += scores[i].total;
                                    } else {
                                        sObj[scores[i].student] = scores[i];
                                    }

                                }
                            }
                            res.json({ code: CONSTANTS.MSG_SUCC, score: sObj });
                        }
                    });
                }
            });
        } else {
            var conn = {};
            var t = req.param('term');
            var s = req.param('student');
            var m = req.param('month');
            if (t && s && m) {
                conn = {student: s, term: t, month: m}
            }
            scoreModel.find(conn, function (err, scores) {
                if (err) {
                    console.error(err);
                    res.json({ code: CONSTANTS.MSG_ERR });
                } else {

                    res.json({ code: CONSTANTS.MSG_SUCC, score: scores });
                }
            });
        }
    }
}
