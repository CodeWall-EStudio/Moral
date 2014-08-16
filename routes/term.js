/**
 * Created by joey on 8/11/14.
 */

var db = require('../middleware/db');
var CONSTANTS = require('../config/constants');

// the middleware function
module.exports = function term(method) {
    return function (req, res, next) {
        var termModel = db.getTermModel();
        console.log(method);
        if (method === 'post') {
            if (req.body.term) {
                try {
                    var data = JSON.parse(req.body.term);
                    var id = data._id;
                    delete data._id;
                    if (id) {
                        termModel.update({ _id: id }, data, { upsert: true, multi: true }, function (err, numberAffected, raw) {
                            if (err) return console.error(err);
                            console.log('The number of updated documents was %d', numberAffected);
                            console.log('The raw response from Mongo was ', raw);
                            var id = '';
                            if (raw.ok && !raw.updatedExisting) {
                                id = raw.upserted;
                            }
                            res.json({ code: CONSTANTS.MSG_SUCC, id: id });
                        });
                    } else {
                        res.json({ code: CONSTANTS.MSG_PARAM });
                    }
                } catch(err) {
                    console.error(err);
                    res.json({ code: CONSTANTS.MSG_ERR });
                }
            } else {
                res.json({ code: CONSTANTS.MSG_PARAM });
            }
        } else if( method ==='setact'){
            try{
                var id = req.body.id;
                var active = req.body.active;

                if(active){
                    console.log('is active');
                    termModel.update({},{$set:{active:false}},function(err,raw){

                        if(err){
                            res.json({ code: CONSTANTS.MSG_PARAM });
                            return;
                        }

                        termModel.update({_id:id},{$set:{active:true}},function(err,raw){
                            if (err) return console.error(err);
                            console.log('update suc!');
                            res.json({ code: CONSTANTS.MSG_SUCC});
                        });
                    });

                }else{
                    termModel.update({_id:id},{$set:{active:false}},function(err,raw){
                        console.log(raw);
                        if (err) return console.error(err);
                        res.json({ code: CONSTANTS.MSG_SUCC});
                    });
                }
            }catch(err){
                console.log('error',err);
                res.json({ code: CONSTANTS.MSG_PARAM });
            }
            //res.json({ code: CONSTANTS.MSG_PARAM });
        } else {
            termModel.find(function (err, terms) {
                if (err) {
                   //return console.error(err);
                };
                res.json({ code: CONSTANTS.MSG_SUCC, term: terms });
            });

        }
    }
}

/*
 term: {"name":"2014-2015学年度 第一学期","active": false, "year": 2014, "day": 15, "months":[{"s":9,"e":10}, {"s":10, "e":11}, {"s":11, "e":12}, {"s":12, "e":1}]}
 */
