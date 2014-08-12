/**
 * Created by joey on 8/11/14.
 */

var db = require('../middleware/db');
var CONSTANTS = require('../config/constants');

// the middleware function
module.exports = function manage(method) {
    return function (req, res, next) {
        if (method === 'post') {
        } else {
            var sess = req.session;
            if (!sess.user.id) {
                res.redirect('/teacher/login/manage');
                return;
            }
            res.render('manage', {user: sess.user});
        }
    }
}
