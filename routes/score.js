/**
 * Created by joey on 8/11/14.
 */

// the middleware function
module.exports = function score(method, role) {
    return function (req, res, next) {
        if (role) {
            next();
        } else {
            next();
        }
    }
}
