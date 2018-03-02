var express = require('express');
var router = express.Router();
var log4js = require('../core/log4jsUtil.js'),
    logger = log4js.getLogger();
var models = require('../models');

router.get('/', function (req, res) {
    if(!req.session.user || req.session.auth !== 'admin') {
        logger.info('user:[' + req.ip + '] request new toys without auth!');
        return res.render('error');
    }
    logger.info('admin:[' + req.session.user + '] open adminToys.html');
    models.Toy.findAll({
        attributes: ['tid', 'name']
    }).then(function (toys) {
        return res.render('adminToys', {'toys': toys});
    }).catch(function (error) {
        logger.error('admin:[' + req.session.user + '] ' + error.stack);
        return res.render('error');
    })
});

router.post('/get', function(req, res) {
    if(!req.session.user || req.session.auth !== 'admin') {
        logger.info('user:[' + req.ip + '] request toy detail without auth!');
        return res.send({'msg': 'logout'});
    }
    var tid = req.body.id || 0;
    if(tid === 0) {
        return res.send({'msg': '传递参数有误！'});
    }
    logger.info('admin:[' + req.session.user + '] begin to get toy detail...');
    var newToy = {};
    newToy.tid = tid;
    models.Toy.findOne({
        where: {
            tid: tid
        }
    }).then(function (toy) {
        if(toy) {
            newToy.shortName = toy.name;
            newToy.pic = toy.pic;
            newToy.desc = toy.description;
            newToy.price = toy.price;
            newToy.state = toy.state;
            return models.Toydetail.findOne({
                where: {
                    tid: tid
                }
            });
        }
        throw new Error('表中未查询到该玩家信息！');
    }).then(function (detail) {
        if(detail) {
            newToy.description = detail.description;
            newToy.name = detail.name;
            newToy.age = detail.age;
            newToy.battery = detail.battery;
            newToy.tip = detail.tip;
            newToy.info = detail.info;
        }
        return models.Toyimage.findAll({
            where: {
                tid: tid
            }
        });
    }).then(function (images) {
        newToy.slide = [];
        newToy.main = [];
        if(images) {
            images.forEach(function (val) {
                if(val.type === 'slide') {
                    newToy.slide.push(val.url);
                }
                if(val.type === 'main') {
                    newToy.main.push(val.url);
                }
            });
        }
        return res.send({'msg': 'success', 'toy': newToy});
    }).catch(function (error) {
        logger.error('user:[' + req.session.user + '] ' + error.stack);
        return res.send({'msg': error.message});
    })
});


module.exports = router;
