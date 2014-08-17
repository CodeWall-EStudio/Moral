/**
 * Created by joey on 8/11/14.
 */

var db = require('../middleware/db');
var CONSTANTS = require('../config/constants');

// the middleware function
module.exports = function teacher(method) {
    console.log('-------',method,'---------');
    return function (req, res, next) {
        var teacherModel = db.getTeacherModel();
        if (method === 'post') {
            if (req.body.teacher) {
                try {
                    var data = JSON.parse(req.body.teacher);
                    if (data.id) {
                        teacherModel.update({ id: data.id }, data, { upsert: true, multi: true }, function (err, numberAffected, raw) {
                            if (err) return console.error(err);
                            console.log('The number of updated documents was %d', numberAffected);
                            console.log('The raw response from Mongo was ', raw);
                            var id = '';
                            if (raw.ok && !raw.updatedExisting) {
                                id = raw.upserted;
                            }
                            res.json({ code: CONSTANTS.MSG_SUCC, id: id });
                        });
                    } else {
                        res.json({ code: CONSTANTS.MSG_PARAM });
                    }
                } catch(err) {
                    console.error(err);
                    res.json({ code: CONSTANTS.MSG_ERR });
                }
            } else {
                res.json({ code: CONSTANTS.MSG_PARAM });
            }
        } else if (method === 'list') {
            console.log('----- teacher -------');
            teacherModel.find(function (err, teachers) {
                if (err) {
                    //return console.error(err);
                };
                res.json({ code: CONSTANTS.MSG_SUCC, teacher: teachers });
            });
        } else {
            console.log('----- other ----');
            var user = req.session.user;
            if(user.id) {
                var relationshipModel = db.getRelationshipModel();
                relationshipModel.find({id: user.id}, function(err, data){
                    if (err) {

                    }
                    res.json({ code: CONSTANTS.MSG_SUCC, teacher: req.session.user, relationship: data });
                });
            } else {
                res.json({ code: CONSTANTS.MSG_SUCC, teacher: req.session.user });
            }
        }
    }
}

/*
 authority 0 普通人 1 数据管理员 2 系统管理员 3 校领导
 teacher: {"id":"zhouzhichao","name": "周志超", "authority": 0, "classes": [{"grade":1,"class":1}, {"grade":3, "class":2}]}
 */
