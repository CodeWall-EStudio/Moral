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
                } catch(err) {
                    console.error(err);
                    res.json({ code: CONSTANTS.MSG_ERR });
                }
            } else {
                res.json({ code: CONSTANTS.MSG_PARAM });
            }
        } else {
            var conn = {};
            var t = req.param('term');
            var s = req.param('student');
            if (t && s) {
                conn = {id: s, term: t}
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
