/**
 * Created by joey on 8/11/14.
 */

var db = require('../middleware/db');
var CONSTANTS = require('../config/constants');

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
                            if (err) {
                                console.error(err);
                                res.json({ code: CONSTANTS.MSG_ERR });
                            } else {
                                console.log('The number of updated documents was %d', numberAffected);
                                console.log('The raw response from Mongo was ', raw);
                                var id = '';
                                if (raw.ok && !raw.updatedExisting) {
                                    console.log(raw);
                                    id = raw.upserted;
                                    console.log(id);

                                }
                                res.json({ code: CONSTANTS.MSG_SUCC, id: id });
                            }
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
        } else {
            studentModel.find(function (err, students) {
                if (err) {
                    console.error(err);
                    res.json({ code: CONSTANTS.MSG_ERR });
                } else {
                    console.log(students)
                    res.json({ code: CONSTANTS.MSG_SUCC, student: students });
                }
            });

        }
    }
}

/*
 student: {"id":"230126200703240579","name":"白益昊","number":"0108021141901019","grade":1,"class":1,"pid":22709,"sex":1}
 */
