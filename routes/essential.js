/**
 * Created by joey on 8/11/14.
 */

var db = require('../middleware/db');
var CONSTANTS = require('../config/constants');
var EventProxy = require('eventproxy');

//指标
function inds2Key(data){
    var list = {};
    for(var i = 0,l=data.length;i<l;i++){
        var item = data[i];
        list[item._id] = {
            self : 0,
            parent : 0,
            teacher : 0
        };
    }
    return list;
}

function getScore(ids,data){
    var all = 0;
    if(data.selfScores){
        for(var i =0,l=data.selfScores.length;i<l;i++){
            var item = data.selfScores[i];
            ids[item.indicator].self = item.score;
            all += item.score;
        }
    }
    if(data.parentScores){
        for(var i =0,l=data.parentScores.length;i<l;i++){
            var item = data.parentScores[i];
            ids[item.indicator].parent = item.score;
            all += item.score;
        } 
    }
    if(data.teacherScores){
        for(var i =0,l=data.teacherScores.length;i<l;i++){
            var item = data.teacherScores[i];
            ids[item.indicator].teacher = item.score;
            all += item.score;
        }    
    }
    return {
        all : all,
        inds : ids
    };
}

// the middleware function
module.exports = function example(method, role) {
    return function (req, res, next) {
        if (role === 'teacher') {
            next();
        } else {
            var sess = req.session;
            var sid = req.cookies.sid;
            if ((sess.user && sess.user.id) || sid) {
                var termModel = db.getTermModel();
                var nowmonth = new Date().getMonth()+1;

                var eq = new EventProxy();

                var term,student,inds,scores,user;
                var ids2scr = {};

                eq.fail(function(){
                    console.log('fail');
                    res.json({code: CONSTANTS.MSG_PARAM});
                });

                //学生资料返回
                eq.on('getStudent',function(doc){
                    user = doc[0];
                    sess.user = user;
                    termModel.find({status:1},eq.done('getTerm'));
                });

                //学期返回
                eq.on('getTerm',function(doc){
                    term = doc[0];
                    var indModel = db.getIndicatorModel();

                    indModel.find({term:term._id},eq.done('getInd'));
                });

                //指标返回
                eq.on('getInd',function(doc){
                    inds = doc;
                    console.log(sid);
                    var scoreModel = db.getScoreModel();
                    scoreModel.find({student:sid,term:term._id,month:nowmonth},eq.done('getScore'));
                });

                //评分返回
                eq.on('getScore',function(doc){
                    var i2k = inds2Key(inds);
                    var myscore = {};//getScore(i2k,doc[0]);
                    var total = 0;
                    if(doc.length){
                        for(var i in doc[0].scores){
                            var item = doc[0].scores[i];
                            if(item.indicator){
                                myscore[item.indicator] = {
                                    self : item.self || 0,
                                    parent : item.parent || 0,
                                    teacher : item.teacher || 0
                                }
                                total += item.self + item.parent + item.teacher;
                            }
                        }

                    }
                    res.json({
                        code : CONSTANTS.MSG_SUCC,
                        user : sess.user || sess.student,
                        term : term,
                        indicator : inds,
                        score : myscore,
                        total : total,
                        nowmonth : nowmonth
                    });
                })

                //先取学期
                if(sess.user && sess.user.id){
                    termModel.find({status:1},eq.done('getTerm'));
                }else{
                    console.log( 'no session');
                    var studentModel = db.getStudentModel();
                    studentModel.find({_id:sid},eq.done('getStudent'));
                }
                //eq.done(eq.done('getTerm'));
                /*
                termModel.findOne({active: true}, function(err, term){
                    if (err) {
                    }
                    console.log(term);
                    var indicatorModel = db.getIndicatorModel();
                    indicatorModel.find({term: term._id}, function(err, indicators){
                        if (err) {
                        }
                        var scoreModel = db.getScoreModel();
                        scoreModel.find({student: sess.user.id, term: term._id}, function(err, scores){
                            if (err) {
                            }
                            res.json({code: CONSTANTS.MSG_SUCC, user: sess.user, term: term, indicator: indicators, score: scores});
                        });
                    });
                });
                */
            } else {
                console.log('no sid');
                res.json({code: CONSTANTS.MSG_PARAM});
            }
        }
    }
}
