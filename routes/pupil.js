/**
 * Created by joey on 8/11/14.
 */

// the middleware function
module.exports = function pupil(method, role) {
    return function (req, res, next) {
        if (role) {
            next();
        } else {
            next();
        }
    }
}
