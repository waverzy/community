/**
 * Created by waver on 2018/1/24.
 */
var models =  require('../models');
var express = require('express');
var router = express.Router();
var log4js = require('../core/log4jsUtil.js'),
    logger = log4js.getLogger();

/*var Promise = require('bluebird');
var wxUtils = Promise.promisifyAll(require('../core/wxUtils'));*/

router.get('/', function(req, res) {
    if(req.session.user) {
        return res.redirect('review');
    }
    logger.info('user:[' + req.ip + '] open adminLogin.html');
    res.render('adminLogin');
});

router.post('/', function (req, res) {
    logger.info('user:[' + req.ip + '] begin to login as an administrator');
    var name = req.body.name || '',
        password = req.body.password || '';
    if(name === '' || password === '') {
        return res.send({'msg': '请输入合法的用户名和密码！'});
    }
    models.Admin.findOne({
        where: {
            name: name,
            password: password
        }
    }).then(function (admin) {
        if(!admin) {
            throw new Error('END');
        }
        req.session.user = admin.name;
        req.session.auth = admin.auth;
        logger.info('user:[' + req.session.user + '] login as an administrator success');
        return res.send({'msg': 'success'});
    }).catch(function (error) {
        if (error.message === 'END') {
            logger.info('user:[' + req.ip + '] 登录管理员账号失败！');
            return res.send({'msg': '用户名或密码不正确！'});
        }
        logger.error('user:[' + req.ip + '] ' + error.stack);
        return res.send({'msg': '错误:' + error.message});
        /*var params = {};
        params.type = 'system_error';
        params.keyword1 = 'adminLogin:post';
        params.keyword2 = new Date().toLocaleString();
        params.keyword3 = error.message;
        wxUtils.sendTemplateAsync(params).then(function (response) {
            logger.error('Has noticed with weixin template message:' + JSON.stringify(response));
        })*/
    })
});

module.exports = router;
