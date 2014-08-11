/**
 * Created by joey on 8/11/14.
 */

var db = require('../middleware/db');

// the middleware function
module.exports = function teacher(method) {
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
                            res.json({ error: 'ok' });
                        });
                    } else {
                        res.json({ error: null });
                    }
                } catch(err) {
                    console.error(err);
                    res.json({ error: err });
                }
            } else {
                res.json({ error: null });
            }
        } else {
            teacherModel.find(function (err, teachers) {
                if (err) {
                    //return console.error(err);
                };
                console.log(teachers)
                res.json({ teacher: teachers });
            });

        }
    }
}

/*
 authority 0 普通人 1 数据管理员 2 系统管理员 3 校领导
 teacher: {"id":"zhouzhichao","name": "周志超", "authority": 0, "classes": [{"grade":1,"class":1}, {"grade":3, "class":2}]}
 */
