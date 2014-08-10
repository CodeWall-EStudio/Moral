/**
 * Created by joey on 8/8/14.
 */

var casClass = require('../lib/cas');
var CONSTANTS = require('../config/constants');

// the middleware function
module.exports = function auth(method, role) {

    return function (req, res, next) {

        if (role === 'teacher') {
            var hostUrl = req.protocol + '://' + req.host;
            if (CONSTANTS.port != 80 || CONSTANTS.port != 443) {
                hostUrl += ':' + CONSTANTS.port;
            }
            var valUrl = hostUrl + '/' + role + '/validate';
            var cas = new casClass({
                base_url: CONSTANTS.CAS_URI,
                service: valUrl,
                user_info_url: CONSTANTS.CAS_USER_INFO_CGI
            });
            if (method === 'in') {
                res.redirect(cas.getLoginUrl());
            } else if (method === 'out') {

                res.redirect(hostUrl);
            } else if (method === 'check') {
                var ticket = req.param('ticket');
                //res.json({data:ticket});
                //res.render('index', { title: 'Express', v: 'test'});
                cas.validate(ticket, function(err, status, response){
                    if (err) {

                    }
                    if (!status) {

                    }
                    var data = JSON.parse(response);
                    console.log(data);
                    var sess = req.session;
                    sess.uid = data.loginName;
                    sess.skey = data.encodeKey;
                    res.redirect(hostUrl + '/' + role);
                });
            } else {
                var sess = req.session;
                if (sess.uid) {
                    cas.decode(sess.skey, function(err, response){
                        sess.user = response.userInfo;
                    });
                }
                next();
            }
        }  else if (role === 'student') {
            if (method === 'in') {

            } else if (method === 'out') {

            } else if (method === 'check') {

            } else {

            }
            next();
        }
    }
};