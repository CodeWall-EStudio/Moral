/**
 * Created by joey on 8/11/14.
 */

var db = require('../middleware/db');
var CONSTANTS = require('../config/constants');
var XLS = require('xlsjs');

// the middleware function
module.exports = function upload(method) {
    return function (req, res, next) {
        if (method === 'post') {
            var workbook = XLS.readFile('./' + req.files.thumbnail.path);
            var sheet_name_list = workbook.SheetNames;
            var data = XLS.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            var termModel = db.getTermModel();
            termModel.findOne({'status': 0}, function(err, term) {
                if (err && !term) {
                    console.error(err);
                    res.render('error', {message: '获取学期出错', error: err});
                } else {
                    var termid = term._id;
                    if (req.body.type === 'student') {
                        var studentModel = db.getStudentModel();
                        studentModel.remove({term: termid}, function(err) {
                            if (err) {
                                console.error(err);
                            }
                            var students = new Array();
                            for (var i = 0; i<data.length; i++) {
                                if (i > 0) {
                                    students.push({
                                        term: termid,
                                        id: data[i]['s_baseinfo_cardid'],
                                        name: data[i]['s_baseinfo_name'],
                                        number: data[i]['s_beadroll_studentno'],
                                        grade: data[i]['e_grade_gradenum'],
                                        class: data[i]['e_class_serial'],
                                        pid: data[i]['p_id'],
                                        sex: data[i]['s_baseinfo_sex'] == '男' ? 1 : 0,
                                        eid: data[i]['s_educationid_edu_id']
                                    });
                                }
                            }
                            studentModel.create(students, function(err) {
                                if (err) {
                                    console.error(err);
                                }
                                res.redirect(req.protocol + '://' + req.headers.host + '/manage.html');
                            });
                        });

                    } else if (req.body.type === 'teacher') {
                        var relationshipModel = db.getRelationshipModel();
                        relationshipModel.remove({term: termid}, function(err) {
                            if (err) {
                                console.error(err);
                            }
                            var relationships = new Array();
                            for (var i = 0; i<data.length; i++) {
                                if (i > 0) {
                                    relationships.push({
                                        term: termid,
                                        id: data[i]['t_baseinfo_id'],
                                        name: data[i]['t_baseinfo_name'],
                                        grade: data[i]['e_grade_gradenum'],
                                        class: data[i]['e_class_serial']
                                    });
                                }
                            }
                            relationshipModel.create(relationships, function(err) {
                                if (err) {
                                    console.error(err);
                                }
                                res.redirect(req.protocol + '://' + req.headers.host + '/manage.html');
                            });
                        });
                    } else if (req.body.type === 'indicator') {
                        var indicatorModel = db.getIndicatorModel();
                        indicatorModel.remove({term: termid}, function(err) {
                            if (err) {
                                console.error(err);
                            }
                            var indicators = new Array();
                            for (var i = 0; i<data.length; i++) {
                                if (i > 0) {
                                    indicators.push({
                                        term: termid,
                                        name: data[i]['i_baseinfo_name'],
                                        desc: data[i]['i_baseinfo_desc'],
                                        order: data[i]['i_baseinfo_order'],
                                        score: data[i]['i_baseinfo_score']
                                    });
                                }
                            }
                            indicatorModel.create(indicators, function(err) {
                                if (err) {
                                    console.error(err);
                                }
                                res.redirect(req.protocol + '://' + req.headers.host + '/manage.html');
                            });
                        });
                    } else {

                    }
                }
            });
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
