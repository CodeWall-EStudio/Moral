/**
 * Created by joey on 8/11/14.
 */

var db = require('../middleware/db');

// the middleware function
module.exports = function student(method) {

    return function (req, res, next) {
        var studentModel = db.getStudentModel();
        if (method === 'post') {
            if (req.body.student) {
                try {
                    var data = JSON.parse(req.body.student);
                    if (data.id) {
                        studentModel.update({ id: data.id }, data, { upsert: true, multi: true }, function (err, numberAffected, raw) {
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
            studentModel.find(function (err, students) {
                if (err) {
                    //return console.error(err);
                };
                console.log(students)
                res.json({ student: students });
            });

        }
    }
}

/*
 student: {"id":"230126200703240579","name":"白益昊","number":"0108021141901019","grade":1,"class":1,"pid":22709,"sex":1}
 */
