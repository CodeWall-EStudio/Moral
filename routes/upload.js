/**
 * Created by joey on 8/11/14.
 */

var db = require('../middleware/db');
var CONSTANTS = require('../config/constants');
var fs = require('fs');
var csv = require('csv');

// the middleware function
module.exports = function upload(method) {
    return function (req, res, next) {
        if (method === 'post') {
            fs.readFile('./' + req.files.thumbnail.path, 'utf-8', function(err, data){
                if(err) {
                    res.render('error', {message: '读取上传文件出错', error: err});
                } else {
                    csv.parse(data, function(err, data){
                        if (err) {
                            res.render('error', {message: '解析文件出错', error: err});
                            console.error(err);
                        } else {
                            if (req.body.type === 'student') {
                                var studentModel = db.getStudentModel();
                                studentModel.remove({}, function(err) {
                                    if (err) {
                                        console.error(err);
                                    }
                                    var students = new Array();
                                    for (var i = 0; i<data.length; i++) {
                                        if (i > 1) {
                                            students.push({
                                                id: data[i][5],
                                                name: data[i][3],
                                                number: data[i][6],
                                                grade: data[i][0],
                                                class: data[i][1],
                                                pid: data[i][2],
                                                sex: data[i][4] == '男' ? 1 : 0});
                                        }
                                    }
                                    studentModel.create(students, function(err) {
                                        if (err) {
                                            console.error(err);
                                        }
                                        res.redirect('/teacher/login/manage');
                                    });
                                });

                            } else if (req.body.type === 'teacher') {

                            } else if (req.body.type === 'term') {

                            } else if (req.body.type === 'indicator') {

                            } else {

                            }
                        }
                    });
                    // res.json({body: req.body});
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
