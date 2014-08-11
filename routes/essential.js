/**
 * Created by joey on 8/11/14.
 */

var db = require('../middleware/db');

// the middleware function
module.exports = function example(method, role) {
    return function (req, res, next) {
        if (role === 'teacher') {
            next();
        } else {
            var sess = req.session;
            if (sess.user && sess.user.id) {
                var termModel = db.getTermModel();
                termModel.findOne({active: true}, function(err, term){
                    if (err) {
                    }
                    var indicatorModel = db.getIndicatorModel();
                    indicatorModel.find({term: term._id}, function(err, indicators){
                        if (err) {
                        }
                        var scoreModel = db.getScoreModel();
                        scoreModel.find({student: sess.user.id, term: term._id}, function(err, scores){
                            if (err) {
                            }
                            res.json({student: sess.user, term: term, indicator: indicators, score: scores});
                        });
                    });
                });
            } else {
                res.json({});
            }
        }
    }
}
