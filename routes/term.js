/**
 * Created by joey on 8/11/14.
 */

var db = require('../middleware/db');

// the middleware function
module.exports = function term(method) {
    return function (req, res, next) {
        var termModel = db.getTermModel();
        if (method === 'post') {
            if (req.body.term) {
                try {
                    var data = JSON.parse(req.body.term);
                    if (data.name) {
                        termModel.update({ name: data.name }, data, { upsert: true, multi: true }, function (err, numberAffected, raw) {
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
            termModel.find(function (err, terms) {
                if (err) {
                   //return console.error(err);
                };
                console.log(terms)
                res.json({ term: terms });
            });

        }
    }
}

/*
 term: {"name":"2014-2015学年度 第一学期","active": false, "year": 2014, "day": 15, "months":[{"s":9,"e":10}, {"s":10, "e":11}, {"s":11, "e":12}, {"s":12, "e":1}]}
 */
