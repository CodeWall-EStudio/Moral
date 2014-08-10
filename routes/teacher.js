/**
 * Created by joey on 8/9/14.
 */

var express = require('express');
var router = express.Router();
var auth = require('../middleware/auth');

router.all('*', auth('', 'teacher'));

/* GET home page. */
router.get('/', function (req, res) {
    var sess = req.session;
    //console.log(sess.user);
    res.render('index', { title: 'Express', v: sess.views });
});

/* login handle */
router.get('/login', auth('in', 'teacher'));

/* logout handle */
router.get('/logout', auth('out', 'teacher'));

/* validate handle */
router.get('/validate', auth('check', 'teacher'));

module.exports = router;
