/**
 * Created by joey on 8/8/14.
 */

var casClass = require('./cas');
var CONSTANTS = require('../config/constants');
var db = require('../middleware/db');

// the middleware function
module.exports = function auth(method, role) {

    return function (req, res, next) {

        if (role === 'teacher') {
            var hostUrl = req.protocol + '://' + req.host;
            if (CONSTANTS.PORT != 80 || CONSTANTS.PORT != 443) {
                hostUrl += ':' + CONSTANTS.PORT;
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
                cas.validate(ticket, function(err, status, response){
                    if (err) {

                    }
                    if (!status) {

                    }
                    try {
                        var data = JSON.parse(response);
                        var sess = req.session;
                        sess.user = {};
                        sess.user.id = data.loginName;
                        sess.user.skey = data.encodeKey;
                        sess.user.role = role;
                    } catch(err) {
                        console.error(err);
                    }
                    res.redirect(hostUrl + '/' + role);
                });
            } else {
                var sess = req.session;
                if (sess.user) {
                    if (sess.user.skey) {
                        cas.decode(sess.user.skey, function (err, response) {
                            if (err) {
                            }
                            sess.user.info = response.userInfo;
                            next();
                        });
                    } else {
                        next();
                    }
                } else {
                    sess.user = {};
                    next();
                }
            }
        }  else if (role === 'student') {
            var hostUrl = req.protocol + '://' + req.host;
            if (CONSTANTS.PORT != 80 || CONSTANTS.PORT != 443) {
                hostUrl += ':' + CONSTANTS.PORT;
            }
            var studentModel = db.getStudentModel();
            if (method === 'in') {
                res.render('login', {});
            } else if (method === 'out') {

            } else if (method === 'check') {

            } else if (method === 'post') {
                var sess = req.session;
                studentModel.findOne({id: req.body.id}, function (err, studentEntity) {
                    if (err) {
                        console.error(err);
                    }
                    if (studentEntity) {
                        if (req.body.number === studentEntity.number) {
                            sess.user = studentEntity;
                            res.redirect(hostUrl + '/' + role);
                        } else {
                            res.redirect(hostUrl + '/' + role);
                        }
                    } else {
                        res.redirect(hostUrl + '/' + role);
                    }
                });
            } else {
                var sess = req.session;
                if (!sess.user) {
                    sess.user = {};
                }
                next();
            }
        }
    }
};