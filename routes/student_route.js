/**
 * Created by joey on 8/9/14.
 */

var express = require('express');
var router = express.Router();
var auth = require('../middleware/auth');
var db = require('../middleware/db');
var essential = require('./essential');

var role = 'student';

router.all('*', auth('', role));

/* GET home page. */
router.get('/', function (req, res) {
    var sess = req.session;
    /*var studentModel = db.getStudentModel();
     studentModel.findOne().exec(function(error, student){
     console.log(student);
     });*/
    /*var studentEntity = new studentModel({
     id: '230126200703240579',
     name: '白益昊',
     number: '0108021141901019',
     grade:  1,
     class: 1,
     pid:   22709,
     sex: 1
     });
     studentEntity.save(function(err){
     if (err) {

     }
     });*/
    console.log(sess.user);
    res.render('index', { title: 'Express', v: sess.views });
});

/* login handle */
router.get('/login', auth('in', role));
router.post('/login', auth('post', role));
router.get('/logout', auth('out', role));

/* essential */
router.get('/essential', essential(role));

module.exports = router;
