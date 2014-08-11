/**
 * Created by joey on 8/9/14.
 */

var express = require('express');
var router = express.Router();
var auth = require('../middleware/auth');
var indicator = require('./indicator');
var term = require('./term');
var student = require('./student');
var teacher = require('./teacher');
var score = require('./score');
var essential = require('./essential');

var role = 'teacher';

router.all('*', auth('', role));

/* GET home page. */
router.get('/', function (req, res) {
    var sess = req.session;
    console.log(sess.user);
    res.render('index', { title: 'Express', v: sess.views });
});

/* login */
router.get('/login', auth('in', role));
router.get('/logout', auth('out', role));
router.get('/validate', auth('check', role));

/* term */
router.get('/term', term('get'));
router.post('/term', term('post'));

/* indicator */
router.get('/indicator', indicator('get'));
router.post('/indicator', indicator('post'));

/* teacher */
router.get('/teacher', teacher('get'));
router.post('/teacher', teacher('post'));

/* student */
router.get('/student', student('get'));
router.post('/student', student('post'));

/* essential */
router.get('/essential', essential('teacher'));

/* score */
router.get('/score', score('get'));
router.post('/score', score('post'));

module.exports = router;
