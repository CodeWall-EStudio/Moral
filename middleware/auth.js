/**
 * Created by joey on 8/8/14.
 */

var casClass = require('./cas');
var CONSTANTS = require('../config/constants');
var db = require('../middleware/db');
var querystring = require('querystring');
var url = require('url');
var https = require('https');
var http = require('http');

// SSO解码
var decode = function (skey, service, callback) {

    var service_info = url.parse(service);
    if (!service_info.hostname) {
        throw new Error('Option `service` must be a valid url like: https://example.com/cas');
    } else {
        service_info.protocol = service_info.protocol;
        service_info.host = service_info.hostname;
        service_info.port = service_info.port || 80;
        service_info.path = service_info.pathname;
    }

    var data = querystring.stringify({
        encodeKey: skey
    });

    var options = {
        method: 'POST',
        host: service_info.hostname,
        port: service_info.port,
        path: service_info.pathname,
        data: data,
        headers: {
            "Content-Type": 'application/x-www-form-urlencoded',
            "Content-Length": data.length
        }

    };

    var reqCb = function (res) {
        // Handle server errors
        res.on('error', function (e) {
            callback(e);
        });

        // Read result
        res.setEncoding('utf8');
        var response = '';
        res.on('data', function (chunk) {
            response += chunk;
        });

        res.on('end', function () {
            try {
                if (!response) {
                    callback('the sso server does not return any thing');
                } else {
                    callback(undefined, JSON.parse(response));
                }
            } catch (e) {
                console.error('getUserInfo Error', response);
                callback('getUserInfo JSON parse error: ' + e.message);
            }
        });
    };

    var req = (service_info.protocol === 'https:' ? https : http).request(options, reqCb);
    req.write(data + "\n");
    req.end();

    req.on('error', function (e) {
        callback(e);
    });
}

// the middleware function
module.exports = function auth(method, role) {

    return function (req, res, next) {

        if (role === 'teacher') {
            var hostUrl = req.protocol + '://' + req.headers.host;
            var valUrl = hostUrl + '/' + role + '/validate';
            if (req.param('action')) {
                valUrl += '/' + req.param('action');
            }
            var cas = new casClass({
                base_url: CONSTANTS.CAS_URI,
                service: valUrl
            });
            if (method === 'in') {
                res.redirect(cas.login());
            } else if (method === 'out') {
                req.session.destroy();
		        res.cookie('role', null, 60000);
                res.redirect(cas.logout());
            } else if (method === 'validate') {
                var ticket = req.param('ticket');
                cas.validate(ticket, function(err, status, response){
                    if (err) {
                        res.render('error', {
                            message: 'SSO服务器登录失败',
                            error: err
                        });
                        return;
                    }
                    if (status) {
                        try {
                            var data = JSON.parse(response);
                            var sess = req.session;
                            sess.user = {};
                            sess.user.id = data.loginName;
                            sess.user.skey = data.encodeKey;
                            sess.user.role = role;
                            res.cookie('skey',data.encodeKey);
                            res.cookie('role',role);
                            console.log(sess);
                            decode(data.encodeKey, CONSTANTS.CAS_USER_INFO_CGI, function(err, response) {
                                if (err) {
                                    console.error(err);
                                    res.redirect(hostUrl + '/' + role);
                                } else {
                                    sess.user.info = response.userInfo;
                                    var teacherModel = db.getTeacherModel();
                                    teacherModel.findOne({id: sess.user.id}, function(err, teacher){
                                        sess.user.authority = 0;
										sess.user.name = response.userInfo.name;
										console.log(err,teacher);
                                        if (err) {
                                        } else {
                                            if(teacher) {
                                                sess.user.authority = teacher.authority;
												res.cookie('role', role, 60000);
												var reUrl = hostUrl + '/' + role;
												if (req.param('action')) {
													reUrl += '/' + req.param('action');
												} else {
													reUrl += '.html';
												}
												res.redirect(reUrl);
                                            }else{
												teacherModel.update({ id: sess.user.id }, sess.user, { upsert: true, multi: true }, function (err, numberAffected, raw) {
													if (err) return console.error(err);
													console.log('The number of updated documents was %d', numberAffected);
													console.log('The raw response from Mongo was ', raw);
													var id = '';
													if (raw.ok && !raw.updatedExisting) {
														id = raw.upserted;
													}
													res.cookie('role', role, 60000);
													var reUrl = hostUrl + '/' + role;
													if (req.param('action')) {
														reUrl += '/' + req.param('action');
													} else {
														reUrl += '.html';
													}
													res.redirect(reUrl);
												});
											}
                                        }

                                    });
                                }
                            });
                        } catch(err) {
                            console.error(err);
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
                /*var termModel = db.getTermModel();
                termModel.find(function(err, terms) {
                    console.log(terms);
                    next();
                });*/
            }
        }  else if (role === 'student') {
            var hostUrl = req.protocol + '://' + req.headers.host;
            var studentModel = db.getStudentModel();
            if (method === 'in') {
                res.render('login', {});
            } else if (method === 'out') {
                req.session.destroy();
                res.cookie['role'] = null;
                res.redirect(hostUrl + '/' + role + '.html');
            } else if (method === 'check') {

            } else if (method === 'post') {
                var sess = req.session;
                //console.log('sess',sess);
                //console.log(req.body);
                studentModel.findOne({name: req.body.name}, function (err, studentEntity) {
                    if (err) {
                        console.error(err);
                    }
                    console.log('student info',studentEntity);
                    if (studentEntity) {
                        if (req.body.number === studentEntity.id) {
                            sess.user = studentEntity;
                            //本地测试用。。。发布的时候可以去掉。。。
                            sess.student = studentEntity;
                            //
                            res.cookie('sid',sess.user._id,60000);
                            //console.log(studentEntity);
                            res.cookie('role', role, 60000);
                            res.redirect(hostUrl + '/' + role+'.html');
                        } else {
                            res.redirect(hostUrl + '/' + role + '.html');
                        }
                    } else {
                        res.redirect(hostUrl + '/student/login#error=1');
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
