/**
 * Created by joey on 8/11/14.
 */

var db = require('../middleware/db');
var CONSTANTS = require('../config/constants');

// the middleware function
module.exports = function relationship(method) {
    return function (req, res, next) {
        var relationshipModel = db.getRelationshipModel();
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
			var term = req.param('term');
			var con = {};
			if(term){
				con.term = term;
			}

            relationshipModel.find(con,function (err, scores) {
                if (err) {
                    console.error(err);
                    res.json({ code: CONSTANTS.MSG_ERR });
                } else {
                    res.json({ code: CONSTANTS.MSG_SUCC, teacher: scores });
                }
            });
        }
    }
}
