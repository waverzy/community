var express = require('express');
var router = express.Router();
var log4js = require('../core/log4jsUtil.js'),
    logger = log4js.getLogger();
var models = require('../models');
var wxUtils = require('../core/wxUtils');

router.get('/', function (req, res) {
    logger.info('user:[' + req.ip + '] open index.html');
    if (!req.query.code) {
        return res.render('error');
    }
    var wxcode = req.query.code;
    logger.info('wxcode:' + wxcode);
    wxUtils.getOpenid(wxcode, function (err, openid) {
        if(err) {
            return res.render('error');
        } else {
            req.session.openid = openid;
            res.render('index');
        }
    });
});

module.exports = router;
