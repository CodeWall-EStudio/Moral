/**
 * Created by joey on 8/8/14.
 */

// the middleware function
module.exports = function auth(options) {

    return function (req, res, next) {

        var sess = req.session;
        if (sess.views) {
            sess.views++;
        } else {
            sess.views = 1;
        }
        next();
    }

};