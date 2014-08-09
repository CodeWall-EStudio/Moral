/**
 * Created by joey on 8/9/14.
 */

var express = require('express');
var router = express.Router();
var auth = require('../middleware/auth');
var login = require('../middleware/login');
var logout = require('../middleware/logout');


router.all('*', auth());

/* GET home page. */
router.get('/', function (req, res) {
    var sess = req.session;
    res.render('index', { title: 'Express', v: sess.views });
});

/* login handle */
router.get('/login', login);

/* logout handle */
router.get('/logout', logout);

module.exports = router;
