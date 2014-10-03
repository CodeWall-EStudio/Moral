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
            }else{
				conn1 = {term: t};
			}
            var conn2 = {};
            if (g && c) {
                conn2 = {grade: g, class: c};
            }
            conn2.term = t;
            var studentModel = db.getStudentModel();
            studentModel.find(conn2, function(err, students) {
                if (err) {
                    console.error(err);
                    res.json({ code: CONSTANTS.MSG_ERR });
                } else {
                    var sArr = new Array();
                    var totalObj = new Object();
                    var t_index;
                    for(var i = 0; i < students.length; i++) {
                        sArr.push(students[i]._id);
                        t_index = 't_' + students[i].grade + '_' + students[i].class;
                        if (!totalObj[t_index]) {
                            totalObj[t_index] = 1;
                        }
                    }
                    scoreModel.find(conn1).where('student').in(sArr).exec(function(err, scores) {
                        if (err) {
                            console.error(err);
                            res.json({ code: CONSTANTS.MSG_ERR });
                        } else {
                            var sObj = new Object();
                            var countObj = new Object();
                            var index;
                            for(var i = 0; i < scores.length; i++) {

                                if (m != '0') {
                                    sObj[scores[i].student] = scores[i];
                                } else {
                                    if (sObj[scores[i].student]) {
                                        var tt = 0;
                                        for(var n =0;n< scores[i].scores.length;n++){
                                            var nit = scores[i].scores[n];
                                            if(nit.indicator){
                                                tt +=nit.self+nit.parent+nit.teacher;
                                            }
                                     
                                        }
                                       sObj[scores[i].student].total += tt;
                                       /*
                                        if(scores[i].student == '5400f8248f57d3f901733601'){
                                                console.log(tt);
                                                console.log(sObj[scores[i].student].total);
                                                //console.log(scores[i].scores[m])
                                        }
                                        */
                                    } else {
                                        sObj[scores[i].student] = scores[i];
                                    }
                                }
                                index = 'c_' + scores[i].grade + '_' + scores[i].class;
                                if (countObj[index]) {
                                    countObj[index] += 1;
                                } else {
                                    countObj[index] = 1;
                                }
                            }
                            var count = 1;
                            var scount = 0;
                            if (g && c) {
                                if (scores.length != 0) {
                                    if (students.length % scores.length == 0) {
                                        count = 0;
                                    }
                                }
                                if (m != '0') {
                                    scount = students.length - scores.length;
                                }
                            } else {
                                count = totalObj.length - countObj.length;
                            }
                            res.json({ code: CONSTANTS.MSG_SUCC, score: sObj, count: count, scount: scount });
                        }
                    });
                }
            });
        } else {
            var conn = {};
            var t = req.param('term');
            var s = req.param('student');
            var m = req.param('month');
            if (t && s) {
                conn = {student: s, term: t}
            }
            if(parseInt(m)){
                conn.month = m;
            }
            scoreModel.find(conn, function (err, scores) {
                if (err) {
                    console.error(err);
                    res.json({ code: CONSTANTS.MSG_ERR });
                } else {

                    if(parseInt(m)){
                        res.json({ code: CONSTANTS.MSG_SUCC, score: scores });
                    }else{
                        var obj = {
                            term : t,
                            student : s,
                            month : 0,
                            scores : []
                        }
                        var qlist = {};
                        var total = 0;
                        for(var i in scores){
                            var item = scores[i];
                            for(var j in item.scores){
                                var row = item.scores[j];
                                
                                if(qlist[row.indicator]){
                                    qlist[row.indicator].self += row.self;
                                    qlist[row.indicator].parent += row.parent;
                                    qlist[row.indicator].teacher += row.teacher;
                                }else if(row.indicator){
                                    qlist[row.indicator] = {
                                        self : row.self,
                                        teacher : row.teacher,
                                        parent : row.parent
                                    }
                                }
                                if(row.indicator){
                                    total += row.self+row.teacher+row.parent;
                                }
                            }
                        }
                        for(var i in qlist){
                            obj.scores.push({
                                'indicator' : i,
                                'self' : qlist[i].self,
                                'parent' : qlist[i].parent,
                                'teacher' : qlist[i].teacher
                            });
                        }
                        res.json({ code: CONSTANTS.MSG_SUCC, score: [obj] });

                    }
                }
            });
        }
    }
}
