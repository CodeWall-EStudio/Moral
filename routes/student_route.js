/**
 * Created by joey on 8/9/14.
 */

var express = require('express');
var router = express.Router();
var auth = require('../middleware/auth');
var db = require('../middleware/db');
var essential = require('./essential');
var student = require('./student');

var role = 'student';

router.all('*', auth('', role));

/* GET home page. */
router.get('/', student('get'));

/* login handle */
router.get('/login', auth('in', role));
router.post('/login', auth('post', role));
router.get('/logout', auth('out', role));

/* essential */
router.get('/essential', essential(role));

module.exports = router;
