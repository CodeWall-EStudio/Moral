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
var manage = require('./manage');
var upload = require('./upload');
var relat = require('./relationship');

var role = 'teacher';

router.all('*', auth('', role));

/* GET home page. */
router.get('/', teacher('get'));

/* login */
router.get('/login/:action?', auth('in', role));
router.get('/logout', auth('out', role));
router.get('/validate/:action?', auth('validate', role));

/* term */
router.get('/term', term('get'));
router.post('/term', term('post'))
router.post('/term/modify', term('modify'));
router.post('/term/setact', term('setact'));


/* indicator */
router.get('/indicator', indicator('get'));
router.post('/indicator/delete', indicator('delete'));
router.post('/indicator/modify', indicator('modify'));
router.post('/indicator', indicator('post'));

/* teacher */
router.get('/teacher', teacher('list'));
router.get('/list', teacher('teacherlist'));
router.post('/teacher', teacher('post'));

/* relationship*/
router.get('/teacherlist/:term?', relat('list'));

/* student */
router.get('/student/:grade?/:class?', student('list'));
router.post('/student', student('post'));

/* essential */
router.get('/essential', essential('teacher'));

/* score */
router.get('/score/:term?/:student?/:month?', score('get'));
router.get('/scores/:term?/:month?/:grade?/:class?', score('list'));
router.post('/score', score('post'));

/* manage */
router.get('/manage', manage('get'));
router.post('/manage', manage('post'));

/* upload */
router.get('/upload', upload('get'));
router.post('/upload', upload('post'));

module.exports = router;
