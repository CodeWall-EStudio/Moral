/**
 * Created by joey on 8/11/14.
 */

var db = require('../middleware/db');

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
            indicatorModel.find(function (err, indicators) {
                if (err) {
                    //return console.error(err);
                };
                console.log(indicators)
                res.json({ indicator: indicators });
            });
        }
    }
}


/*
 term: "53e87c5a9cced0e709a2f247", indicator: {"name": "道德水准", "order": 1, "score": 5, "desc": "就是看你有没有道德"}
 */
