/**
 * Created by waver on 2018/1/12.
 */
var models = require('../models');
var express = require('express');
var router = express.Router();
var log4js = require('../core/log4jsUtil.js'),
    logger = log4js.getLogger();
var multer = require('multer');
var FILE_PATH = 'images/';
var storage = multer.diskStorage({
    destination: 'public/' + FILE_PATH,
    filename: function (req, file, cb) {
        var fileFormat = (file.originalname).split(".");
        cb(null, Date.now() + "." + fileFormat[fileFormat.length - 1]);
    }
});
var Promise = require('bluebird');
var wxUtils = Promise.promisifyAll(require('../core/wxUtils'));

var COEFFICIENT = 125;

router.get('/', function (req, res) {
    if (!req.session.user) {
        return res.redirect('login');
    }
    logger.info('user:[' + req.session.user + '] open uploadToy.html');
    models.Item.findAll({
        attributes: ['id', 'name'],
        where: {
            type: 'brand'
        },
        order: 'name ASC'
    }).then(function (brands) {
        if (brands && brands.length > 0) {
            return res.render('uploadToy', {'brands': brands});
        }
        throw new Error('未查询到品牌列表！')
    }).catch(function (error) {
        logger.error('user:[' + req.ip + '] ' + error.stack);
        return res.render('error');
    });
});

router.post('/upload', function (req, res) {
    logger.info('user:[' + req.session.user + '] begin to upload photo');
    var upload = multer({
        storage: storage,
        limits: {
            files: 1,
            fileSize: 10 * 1024 * 1024
        }
    }).single('file');
    upload(req, res, function (err) {
        if (err) {
            logger.error(err.stack);
            return res.send({'msg': err.message});
        }
        logger.info('user:[' + req.session.user + ']upload[' + req.file.filename + '] finished');
        req.session.filename = req.file.filename;
        return res.send({'msg': 'success'});
    });
});

router.post('/toy', function (req, res) {
    if(!req.session.user) {
        return res.send({'msg': 'logout'});
    }
    logger.info('user:[' + req.ip + '] begin to submit toy');
    var params = JSON.parse(req.body.params) || {};
    var name = params.name || '',
        marketPrice = parseInt(params.price) || 0,
        brand = parseInt(params.brand) || 0,
        category = parseInt(params.category) || 0,
        old = parseInt(params.old) || 0,
        damage = parseInt(params.damage) || 0,
        func = parseInt(params.func) || 0,
        fitting = parseInt(params.fitting) || 0,
        serverIds = params.serverIds || [];
    if (name === '' || marketPrice <= 0 || brand <= 0 || category <= 0 || old <= 0 || damage <= 0 || func <= 0 || fitting <= 0) {
        return res.send({'msg': '提交内容有误，请关闭页面后重新打开！'});
    }
    if (serverIds.length === 0 && !req.session.filename) {
        return res.send({'msg': '未上传图片，请重试！'});
    }
    var assessPrice = -1;
    if (serverIds.length > 0) {
        var imageList = [];
        Promise.all(serverIds.map(function (serverId) {
            return wxUtils.getAccessTokenAsync().then(function (token) {
                return wxUtils.downloadImagesAsync(token, serverId);
            }).then(function (image) {
                logger.info('image:' + image + ' downloaded');
                imageList.push(image);
            }).catch(function (err) {
                throw err;
            });
        })).then(function () {
            return models.Item.findAll({
                attributes: ['id', 'name', 'rate'],
                where: {
                    id: [brand, category, old, damage, func, fitting]
                },
                order: 'id ASC'
            });
        }).then(function (items) {
            if (items && items.length === 6) {
                assessPrice = parseInt(COEFFICIENT * marketPrice * items[0].rate * items[1].rate * items[2].rate * items[3].rate * items[4].rate * items[5].rate);
                if (assessPrice < 0) {
                    throw new Error('提交内容有误，无法进行评估，请重新打开页面再试！');
                }
                return models.Oldtoy.build({
                    user: req.session.user,
                    name: name,
                    marketprice: params.price,
                    assessprice: assessPrice,
                    price: assessPrice,
                    brand: items[0].name,
                    category: items[1].name,
                    old: items[2].name,
                    damage: items[3].name,
                    func: items[4].name,
                    fitting: items[5].name,
                    pic: imageList[0] || '',
                    pic1: imageList[1] || '',
                    pic2: imageList[2] || '',
                    state: 'reviewing'
                }).save()
            }
            throw new Error('部分参数在表中不存在！')
        }).then(function (toy) {
            logger.info('Old toy[' + toy.tid + '] has been submitted and ready to send weixin template message');
            if(!req.session.openid) {
                throw new Error('END');
            }
            var params = {};
            params.type = 'upload';
            params.openid = req.session.openid;
            params.first = '玩具信息已上传';
            params.keyword1 = toy.user;
            params.keyword2 = toy.name + '/' + toy.old + '/' + toy.damage + '/' + toy.func;
            params.remark = '请耐心等待，将在1个工作日内完成审核';
            return wxUtils.sendTemplateAsync(params);
        }).then(function (response) {
            logger.info('Send weixin template message:' + JSON.stringify(response));
            return res.send({'msg': 'success'});
        }).catch(function (error) {
            if(error.message === 'END') {
                return res.send({'msg': 'success'});
            }
            logger.error('user:[' + req.session.user + '] ' + error.stack);
            return res.send({'msg': error.message});
        })
    } else {
        models.Item.findAll({
            attributes: ['id', 'name', 'rate'],
            where: {
                id: [brand, category, old, damage, func, fitting]
            },
            order: 'id ASC'
        }).then(function (items) {
            if (items && items.length === 6) {
                assessPrice = parseInt(COEFFICIENT * marketPrice * items[0].rate * items[1].rate * items[2].rate * items[3].rate * items[4].rate * items[5].rate);
                if (assessPrice < 0) {
                    throw new Error('提交内容有误，无法进行评估，请重新打开页面再试！');
                }
                return models.Oldtoy.build({
                    user: req.session.user,
                    name: name,
                    marketprice: params.price,
                    assessprice: assessPrice,
                    price: assessPrice,
                    brand: items[0].name,
                    category: items[1].name,
                    old: items[2].name,
                    damage: items[3].name,
                    func: items[4].name,
                    fitting: items[5].name,
                    pic: 'images/' + req.session.filename,
                    state: 'reviewing'
                }).save()
            }
            throw new Error('部分参数在表中不存在！')
        }).then(function () {
            return res.send({'msg': 'success'});
        }).catch(function (error) {
            logger.error('user:[' + req.session.user + '] ' + error.stack);
            return res.send({'msg': error.message});
        })
    }

});

function assess(price, brand, category, old, damage, func, fitting) {
    models.Item.findAll({
        attributes: ['id', 'rate'],
        where: {
            id: [brand, category, old, damage, func, fitting]
        },
        order: 'id ASC'
    }).then(function (items) {
        if (items && items.length === 6) {
            return parseInt(COEFFICIENT * price * items[0].rate * items[1].rate * items[2].rate * items[3].rate * items[4].rate * items[5].rate);
        }
        throw new Error('部分参数在表中不存在！')
    }).catch(function (error) {
        logger.error('assess error:' + error.stack);
        return -1;
    })
}

module.exports = router;
