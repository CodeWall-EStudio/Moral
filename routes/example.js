/**
 * Created by joey on 8/11/14.
 */

// the middleware function
module.exports = function example(method, role) {
    return function (req, res, next) {
        if (role) {
            next();
        } else {
            next();
        }
    }
}
