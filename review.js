var express = require('express');
var router = express.Router();
var log4js = require('../core/log4jsUtil.js'),
    logger = log4js.getLogger();
var models = require('../models');

router.get('/', function (req, res) {
    logger.info('user:[' + req.ip + '] open index.html');
    res.render('review');
});

router.post('/reviewing', function(req, res) {
    /*if(!req.session.user || req.session.auth !== 'admin') {
        logger.info('user:[' + req.ip + '] request reviewing list without auth!');
        return res.send({'msg': '无权限！'});
    }*/
    models.Oldtoy.findAll({
        attributes: ['oid', 'user', 'name', 'marketprice', 'price', 'brand', 'category', 'old', 'damage', 'func', 'pic', 'pic1', 'pic2', 'state', 'comment', 'createdAt'],
        where: {
            state: 'reviewing'
        },
        order: 'createdAt ASC'
    }).then(function (toys) {
        if(toys && toys.length>0) {
            for(var i=0; i<toys.length; i++) {
                toys[i].dataValues.submitTime = formatDate(new Date(toys[i].createdAt));//须放在dataValues，否则前台收不到
            }
            return res.send({'msg': "success", 'result': toys});
        }
        return res.send({'msg': "success", 'result': []});
    }).catch(function (error) {
        logger.error('user:[' + req.session.user + '] ' + error.stack);
        return res.send({'msg': error.message});
    })
});

router.post('/accepted', function(req, res) {
    /*if(!req.session.user || req.session.auth !== 'admin') {
     logger.info('user:[' + req.ip + '] request reviewing list without auth!');
     return res.send({'msg': '无权限！'});
     }*/
    models.Oldtoy.findAll({
        attributes: ['user', 'name', 'marketprice', 'assessprice', 'price', 'brand', 'category', 'old', 'damage', 'func', 'comment', 'createdAt', 'updatedAt'],
        where: {
            state: 'accepted'
        },
        order: 'updatedAt DESC'
    }).then(function (toys) {
        if(toys && toys.length>0) {
            for(var i=0; i<toys.length; i++) {
                toys[i].dataValues.submitTime = formatDate(new Date(toys[i].createdAt));//须放在dataValues，否则前台收不到
                toys[i].dataValues.auditTime = formatDate(new Date(toys[i].updatedAt));//须放在dataValues，否则前台收不到
            }
            return res.send({'msg': "success", 'result': toys});
        }
        return res.send({'msg': "success", 'result': []});
    }).catch(function (error) {
        logger.error('user:[' + req.session.user + '] ' + error.stack);
        return res.send({'msg': error.message});
    })
});

router.post('/rejected', function(req, res) {
    /*if(!req.session.user || req.session.auth !== 'admin') {
     logger.info('user:[' + req.ip + '] request reviewing list without auth!');
     return res.send({'msg': '无权限！'});
     }*/
    models.Oldtoy.findAll({
        attributes: ['user', 'name', 'marketprice', 'assessprice', 'price', 'brand', 'category', 'old', 'damage', 'func', 'comment', 'createdAt', 'updatedAt'],
        where: {
            state: 'rejected'
        },
        order: 'updatedAt DESC'
    }).then(function (toys) {
        if(toys && toys.length>0) {
            for(var i=0; i<toys.length; i++) {
                toys[i].dataValues.submitTime = formatDate(new Date(toys[i].createdAt));//须放在dataValues，否则前台收不到
                toys[i].dataValues.auditTime = formatDate(new Date(toys[i].updatedAt));//须放在dataValues，否则前台收不到
            }
            return res.send({'msg': "success", 'result': toys});
        }
        return res.send({'msg': "success", 'result': []});
    }).catch(function (error) {
        logger.error('user:[' + req.session.user + '] ' + error.stack);
        return res.send({'msg': error.message});
    })
});

router.post('/used', function(req, res) {
    /*if(!req.session.user || req.session.auth !== 'admin') {
     logger.info('user:[' + req.ip + '] request reviewing list without auth!');
     return res.send({'msg': '无权限！'});
     }*/
    models.Oldtoy.findAll({
        attributes: ['user', 'name', 'marketprice', 'assessprice', 'price', 'brand', 'category', 'old', 'damage', 'func', 'comment', 'createdAt', 'updatedAt'],
        where: {
            state: 'used'
        },
        order: 'updatedAt DESC'
    }).then(function (toys) {
        if(toys && toys.length>0) {
            for(var i=0; i<toys.length; i++) {
                toys[i].dataValues.submitTime = formatDate(new Date(toys[i].createdAt));//须放在dataValues，否则前台收不到
                toys[i].dataValues.auditTime = formatDate(new Date(toys[i].updatedAt));//须放在dataValues，否则前台收不到
            }
            return res.send({'msg': "success", 'result': toys});
        }
        return res.send({'msg': "success", 'result': []});
    }).catch(function (error) {
        logger.error('user:[' + req.session.user + '] ' + error.stack);
        return res.send({'msg': error.message});
    })
});

router.post('/removed', function(req, res) {
    /*if(!req.session.user || req.session.auth !== 'admin') {
     logger.info('user:[' + req.ip + '] request reviewing list without auth!');
     return res.send({'msg': '无权限！'});
     }*/
    models.Oldtoy.findAll({
        attributes: ['user', 'name', 'marketprice', 'assessprice', 'price', 'brand', 'category', 'old', 'damage', 'func', 'comment', 'createdAt', 'updatedAt'],
        where: {
            state: 'removed'
        },
        order: 'updatedAt DESC'
    }).then(function (toys) {
        if(toys && toys.length>0) {
            for(var i=0; i<toys.length; i++) {
                toys[i].dataValues.submitTime = formatDate(new Date(toys[i].createdAt));//须放在dataValues，否则前台收不到
                toys[i].dataValues.auditTime = formatDate(new Date(toys[i].updatedAt));//须放在dataValues，否则前台收不到
            }
            return res.send({'msg': "success", 'result': toys});
        }
        return res.send({'msg': "success", 'result': []});
    }).catch(function (error) {
        logger.error('user:[' + req.session.user + '] ' + error.stack);
        return res.send({'msg': error.message});
    })
});

router.post('/accept', function(req, res) {
    /*if(!req.session.user || req.session.auth !== 'admin') {
     logger.info('user:[' + req.ip + '] request reviewing list without auth!');
     return res.send({'msg': '无权限！'});
     }*/
    var oid = parseInt(req.body.oid) || 0,
        price = parseInt(req.body.price) || 0,
        comment = req.body.comment || '';
    if(oid === 0 || price === 0) {
        return res.send({'msg': '传入参数有误！'});
    }
    models.Oldtoy.findOne({
        where: {
            oid: oid
        }
    }).then(function (toy) {
        if(toy) {
            if(toy.state !== 'reviewing') {
                throw new Error('待更新记录状态为' + toy.state + '，无法审核！');
            }
            toy.price = price;
            toy.comment = comment;
            toy.state = 'accepted';
            return toy.save();
        }
        throw new Error('待更新记录不存在！')
    }).then(function () {
        logger.info('user:[' + req.session.user + '] has accepted an old toy.');
        return res.send({'msg': 'success'});
    }).catch(function (error) {
        logger.error('user:[' + req.session.user + '] ' + error.stack);
        return res.send({'msg': error.message});
    })
});

router.post('/reject', function(req, res) {
    /*if(!req.session.user || req.session.auth !== 'admin') {
     logger.info('user:[' + req.ip + '] request reviewing list without auth!');
     return res.send({'msg': '无权限！'});
     }*/
    var oid = parseInt(req.body.oid) || 0,
        price = parseInt(req.body.price) || 0,
        comment = req.body.comment || '';
    if(oid === 0 || comment === '') {
        return res.send({'msg': '传入参数有误！'});
    }
    models.Oldtoy.findOne({
        where: {
            oid: oid
        }
    }).then(function (toy) {
        if(toy) {
            if(toy.state !== 'reviewing') {
                throw new Error('待更新记录状态为' + toy.state + '，无法审核！');
            }
            toy.price = price;
            toy.comment = comment;
            toy.state = 'rejected';
            return toy.save();
        }
        throw new Error('待更新记录不存在！')
    }).then(function () {
        logger.info('user:[' + req.session.user + '] has rejected an old toy.');
        return res.send({'msg': 'success'});
    }).catch(function (error) {
        logger.error('user:[' + req.session.user + '] ' + error.stack);
        return res.send({'msg': error.message});
    })
});

function formatDate(date) {
    var yyyy = date.getFullYear(),
        M = date.getMonth() + 1,
        d = date.getDate(),
        h = date.getHours(),
        m = date.getMinutes(),
        s = date.getSeconds();
    var MM = M<10 ? '0'+M : M,
        dd = d<10 ? '0'+d : d,
        hh = h<10 ? '0'+h : h,
        mm = m<10 ? '0'+m : m,
        ss = s<10 ? '0'+s : s;
    return yyyy + '-' + MM + '-' + dd + ' ' + hh  + ':' + mm + ':' + ss;
}

module.exports = router;
