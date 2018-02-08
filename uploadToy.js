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

router.get('/', function (req, res, next) {
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
    logger.info('user:[' + req.ip + '] begin to submit toy');
    var params = JSON.parse(req.body.params) || {};
    var name = params.name || '',
        marketPrice = parseInt(params.price) || 0,
        brand = parseInt(params.brand) || 0,
        category = parseInt(params.category) || 0,
        old = parseInt(params.old) || 0,
        damage = parseInt(params.damage) || 0,
        func = parseInt(params.func) || 0,
        serverIds = params.serverIds || [];
    if (name === '' || marketPrice <= 0 || brand <= 0 || category <= 0 || old <= 0 || damage <= 0 || func <= 0) {
        return res.send({'msg': '提交内容有误，请关闭页面后重新打开！'});
    }
    if (serverIds.length === 0 && !req.session.filename) {
        return res.send({'msg': '未上传图片，请重试！'});
    }
    var assessPrice = -1;
    if (serverIds.length > 0) {
        var imageList = [];
        Promise.all(serverIds.map(function (serverId) {
            return wxUtils.downloadImages(serverId).then(function (image) {
                imageList.push(image);
            });
        })).then(function () {
            return models.Item.findAll({
                attributes: ['id', 'name', 'rate'],
                where: {
                    id: [brand, category, old, damage, func]
                },
                order: 'id ASC'
            });
        }).then(function (items) {
            if (items && items.length === 5) {
                assessPrice = parseInt(1250 * marketPrice * items[0].rate * items[1].rate * items[2].rate * items[3].rate * items[4].rate);
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
                    pic: imageList[0] || '',
                    pic1: imageList[1] || '',
                    pic2: imageList[2] || '',
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
    } else {
        models.Item.findAll({
            attributes: ['id', 'name', 'rate'],
            where: {
                id: [brand, category, old, damage, func]
            },
            order: 'id ASC'
        }).then(function (items) {
            if (items && items.length === 5) {
                assessPrice = parseInt(1250 * marketPrice * items[0].rate * items[1].rate * items[2].rate * items[3].rate * items[4].rate);
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

function assess(price, brand, category, old, damage, func) {
    models.Item.findAll({
        attributes: ['id', 'rate'],
        where: {
            id: [brand, category, old, damage, func]
        },
        order: 'id ASC'
    }).then(function (items) {
        if (items && items.length === 5) {
            return parseInt(1250 * price * items[0].rate * items[1].rate * items[2].rate * items[3].rate * items[4].rate);
        }
        throw new Error('部分参数在表中不存在！')
    }).catch(function (error) {
        logger.error('assess error:' + error.stack);
        return -1;
    })
}

module.exports = router;
