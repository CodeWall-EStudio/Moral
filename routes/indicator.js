/**
 * Created by joey on 8/11/14.
 */

var db = require('../middleware/db');
var CONSTANTS = require('../config/constants');

// the middleware function
module.exports = function indicator(method) {
    return function (req, res, next) {
        var indicatorModel = db.getIndicatorModel();
        if (method === 'post') {
            if (req.body.indicator) {
                try {
                    var data = JSON.parse(req.body.indicator);
                    if (data.name && req.body.term) {
                        data.term = req.body.term;
                        indicatorModel.update({ name: data.name, term: data.term }, data, { upsert: true, multi: true }, function (err, numberAffected, raw) {
                            if (err) {
                                console.error(err);
                                res.json({ code: CONSTANTS.MSG_ERR });
                            } else {
                                console.log('The number of updated documents was %d', numberAffected);
                                console.log('The raw response from Mongo was ', raw);
                                var id = '';
                                if (raw.ok && !raw.updatedExisting) {
                                    id = raw.upserted[0]._id;
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
            indicatorModel.find(function (err, indicators) {
                if (err) {
                    console.error(err);
                    res.json({ code: CONSTANTS.MSG_ERR });
                } else {
                    res.json({ code: CONSTANTS.MSG_SUCC, indicator: indicators });
                }
            });
        }
    }
}


/*
 term: "53e87c5a9cced0e709a2f247", indicator: {"name": "道德水准", "order": 1, "score": 5, "desc": "就是看你有没有道德"}
 */
