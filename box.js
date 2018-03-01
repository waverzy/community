var models =  require('../models');
var express = require('express');
var router = express.Router();
var log4js = require('../core/log4jsUtil.js'),
    logger = log4js.getLogger();
var Promise = require('bluebird');
var wxUtils = Promise.promisifyAll(require('../core/wxUtils'));
var utils = require('../core/utils');
var crypto = require('crypto');

/*mock*/
/*router.get('/', function(req, res) {
    var toys = [];
    var toy1 = {};
    toy1.state = "待审核";
    toy1.check = false;
    toy1.oid = 1;
    toy1.name = 'toy1 name';
    toy1.marketprice = 2000;
    toy1.price = 3000;
    toy1.brand = 'LEGO';
    toy1.category = '运动户外';
    toys.push(toy1);
    var toy2 = {};
    toy2.state = "审核通过";
    toy2.check = true;
    toy2.oid = 1;
    toy2.name = 'toy1 name';
    toy2.marketprice = 2000;
    toy2.price = 3000;
    toy2.brand = 'LEGO';
    toy2.category = '运动户外';
    toys.push(toy2);
    return res.render('box', {'oldToys': toys});
});*/

router.get('/', function(req, res) {
    logger.info('user:[' + req.ip + '] open box.html');
    if(req.session.user) {
        models.Oldtoy.findAll({
            attributes: ['oid', 'name', 'marketprice', 'price', 'brand', 'category', 'old', 'damage', 'func', 'state', 'comment'],
            where: {
                user: req.session.user,
                state: ['reviewing', 'accepted', 'rejected']
            },
            order: 'createdAt DESC'
        }).then(function (toys) {
            if(toys && toys.length>0) {
                for(var i=0; i<toys.length; i++) {
                    if(toys[i].state === 'reviewing') {
                        toys[i].state = "待审核";
                        toys[i].check = false;
                    }
                    if(toys[i].state === 'accepted') {
                        toys[i].state = "审核通过";
                        toys[i].check = true;
                    }
                    if(toys[i].state === 'rejected') {
                        toys[i].state = "审核未通过";
                        toys[i].check = false;
                    }
                }
                return res.render('box', {'oldToys': toys});
            }
            throw new Error('END');
        }).catch(function (error) {
            if(error.message === 'END') {
                return res.render('box');
            }
            logger.error('user:[' + req.session.user + '] ' + error.stack);
            return res.render('error');
        })
    } else {
        return res.render('box');
    }
});

router.post('/removeOld', function(req, res) {
    if(!req.session.user) {
        return res.send({'msg': 'logout'});
    }
    logger.info('user:[' + req.session.user + '] begin to remove an old toy');
    var oid = parseInt(req.body.toyid) || 0;
    if(oid === 0) {
        return res.send({'msg': '传入参数有误，请重新打开页面再试！'});
    }
    models.Oldtoy.findOne({
        where: {
            user: req.session.user,
            oid: oid
        }
    }).then(function (toy) {
        if(toy) {
            if(toy.state === 'reviewing' || toy.state === 'accepted' || toy.state === 'rejected') {
                toy.state = 'removed';
                return toy.save();
            } else {
                throw new Error('状态异常，无法删除！');
            }
        }
        logger.info('user:[' + req.session.user + ']名下未查询到就玩具[' + oid + ']');
        throw new Error('END');
    }).then(function () {
        logger.info('user:[' + req.session.user + '] has removed an old toy [oid]' + oid);
        return res.send({'msg': 'success'});
    }).catch(function (error) {
        if(error.message === 'END') {
            return res.send({'msg': '页面出错，请刷新后重试！'});
        }
        logger.error('user:[' + req.ip + '] ' + error.stack);
        return res.send({'msg': '错误:' + error.message});
    })
});

router.post('/deliveryTime', function(req, res) {
    if(!req.session.user) {
        return res.send({'msg': 'logout'});
    }
    logger.info('user:[' + req.session.user + '] begin to query delivery time');
    var today = getToday(new Date());
    var periods = [[], [], [], [], [], [], []];
    var deliveryTime = [];
    models.Deliverytime.findAll({
        attributes: ['weekday', 'period'],
        where: {
            type: 'time'
        },
        order: ['weekday', 'period']
    }).then(function (results) {
        for(var i=0; i<results.length; i++) {
            var result = results[i];
            periods[result.weekday].push(result.period);
        }
        return models.Deliverytime.findAll({
            attributes: ['datestring'],
            where: {
                datestring: {
                    $gt: today
                },
                type: 'holiday'
            },
            order: 'datestring ASC'
        });
    }).then(function (results) {
        var curDate = today;
        if(!results || results.length < 1) {
            for(var n=0; n<7; n++) {
                var nObj = {};
                var theDate = addDays(curDate, 1);
                nObj.date = theDate;
                nObj.periods = periods[new Date(theDate).getDay()] || periods[1];//无法判断则按星期一时间段
                deliveryTime.push(nObj);
                curDate = theDate;
            }
            return res.send({'msg': 'success', 'deliveryTime': deliveryTime});
        }
        for(var i=0; i<results.length; i++) {
            if(deliveryTime.length >= 7) {
                break;
            }
            var holiday = results[i].datestring || '2018-01-01';
            if(holiday > addDays(curDate, 7-deliveryTime.length)) {
                for(var j=0; j<7-deliveryTime.length; j++) {
                    var obj = {};
                    var thisDate = addDays(curDate, 1);
                    obj.date = thisDate;
                    obj.periods = periods[new Date(thisDate).getDay()] || periods[1];//无法判断则按星期一时间段
                    deliveryTime.push(obj);
                    curDate = thisDate;
                }
                break;
            } else {
                var days = new Date(holiday) - new Date(curDate);
                for(var k=0; k<days-1; k++) {
                    var object = {};
                    var thatDate = addDays(curDate, 1);
                    object.date = thatDate;
                    object.periods = periods[new Date(thatDate).getDay()] || periods[1];//无法判断则按星期一时间段
                    deliveryTime.push(object);
                    curDate = thatDate;
                }
                if(days === 1) {
                    curDate = addDays(curDate, 1);
                }
            }
        }
        return res.send({'msg': 'success', 'deliveryTime': deliveryTime});
    }).catch(function (error) {
        logger.error('user:[' + req.ip + '] ' + error.stack);
        return res.send({'msg': '错误:' + error.message});
    })
});

router.post('/submit', function (req, res) {
    if(!req.session.user) {
        return res.send({'msg': 'logout'});
    }
    logger.info('user:[' + req.session.user + '] begin to submit an order');
    var params = JSON.parse(req.body.params);
    var name = params.name || '',
        mobile = params.mobile || '',
        city = params.city || '',
        district = params.district || '',
        address = params.address || '',
        loop = params.loop || '',
        period = params.period || '',
        oldList = params.oldList || [],
        newList = params.newList || [],
        newNum = params.newNum || [];
    if (name === '' || mobile === '' || city === '' || district === '' || address === '' || loop === '' || period === '' || oldList.length === 0 || newList.length === 0 || newNum.length !== newList.length) {
        return res.send({'msg': '传递参数有误，请刷新页面后重试！'});
    }
    var oldTotal = 0,
        newTotal = 0,
        oldToys = [],
        newToys = [],
        newOrder = [];
    var innerFee = -1,
        outerFee = -1;
    return models.sequelize.transaction(function (t) {
        return models.Item.findAll({
            where: {
                type: 'fee',
                name: ['inner', 'outer']
            }
        }).then(function (items) {
            if(items.length === 2) {
                items.forEach(function (val) {
                    if(val.name === 'inner') {
                        innerFee = val.rate;
                    }
                    if(val.name === 'outer') {
                        outerFee = val.rate;
                    }
                });
                if(innerFee < 0 || outerFee < 0) {
                    throw new Error('费用异常，不应小于0');
                } else {
                    return models.Oldtoy.findAll({
                        attributes: ['oid', 'name', 'price'],
                        where: {
                            oid: oldList,
                            state: 'accepted'
                        }
                    });
                }
            } else {
                throw new Error('数据库表中运费未正确配置');
            }

        }).then(function (oToys) {
            if(oToys.length === oldList.length) {
                oToys.forEach(function (val) {
                    oldTotal += val.price;
                    var oToy = {};
                    oToy.tid = val.oid;
                    oToy.name = val.name;
                    oToy.price = val.price;
                    oToy.type = 'old';
                    oldToys.push(oToy);
                });
                return models.Oldtoy.update(
                    {state: 'using'},
                    {
                        where: {
                            oid: oldList
                        },
                        transaction: t
                    }
                );
            } else {
                throw new Error('所用的旧玩具在系统中未查询到或已使用过！');
            }
        }).then(function () {
            return models.Toy.findAll({
                attributes: ['tid', 'name', 'pic', 'price'],
                where: {
                    tid: newList,
                    state: true
                }
            });
        }).then(function (nToys) {
            if(nToys.length === newList.length) {
                nToys.forEach(function (val, index) {
                    newTotal += val.price;
                    var nToy = {};
                    nToy.tid = val.tid;
                    nToy.name = val.name;
                    nToy.price = val.price;
                    nToy.pic = val.pic;
                    nToy.num = newNum[index] || 1;
                    nToy.type = 'new';
                    newToys.push(nToy);
                });
                if(oldTotal >= newTotal) {
                    return models.Order.create({
                        user: req.session.user,
                        oldprice: oldTotal,
                        newprice: newTotal,
                        logifee: loop==='外环外' ? outerFee : innerFee,//配送费用
                        address: city+district+address+'('+loop+')',
                        custname: name,
                        mobile: mobile,
                        logitime: period,//配送时间
                        state: 'unpaid'
                    }, {transaction: t});
                } else {
                    throw new Error('旧玩具值低于新玩具值，无法置换！');
                }

            } else {
                throw new Error('所选的新玩具已下架，请刷新页面后重新选择！');
            }
        }).then(function (order) {
            logger.info('order[' + order.oid + '] inserted');
            oldToys.forEach(function (val) {
                val.oid = order.oid;
            });
            newToys.forEach(function (val) {
                val.oid = order.oid;
                oldToys.push(val);
            });
            newOrder = order;
            return models.Record.bulkCreate(oldToys,
                { transaction: t });
        })
    }).then(function () {
        logger.info('records inserted');
        return res.send({'msg': 'success', 'oid': newOrder.oid, 'fee': newOrder.logifee});
    }).catch(function (error) {
        logger.error('user:[' + req.ip + '] ' + error.stack);
        return res.send({'msg': '错误:' + error.message});
    })
});

router.post('/pay', function (req, res) {
    if(!req.session.user) {
        return res.send({'msg': 'logout'});
    }
    if(!req.session.openid) {
        return res.send({'msg': '状态异常，请通过公众号重新进入页面！'});
    }
    logger.info('user:[' + req.session.user + '] begin to pay logifee');
    var oid = parseInt(req.body.oid) || 0;
    if(oid === 0) {
        return res.send({'msg': '传入订单号有误，可刷新后重试。'});
    }
    var prepay_id = '';
    models.Order.findOne({
        where: {
            oid: oid
        }
    }).then(function (order) {
        if(!order) {
            throw new Error('订单不存在！');
        } else {
            if(order.state === 'unpaid') {
                if(order.prepayid) {
                    if(new Date(order.paytime).getTime()+3600000 >= new Date().getTime()) {
                        throw new Error('END');
                    } else {
                        return wxUtils.orderNewAsync(true, oid, '执尔科技-运费', order.logifee, req.ip, req.session.openid);
                    }
                } else {
                    return wxUtils.orderNewAsync(false, oid, '执尔科技-运费', order.logifee, req.ip, req.session.openid);
                }
            } else {
                switch(order.state) {
                    case 'finished':
                        throw new Error('订单已完成！');
                        break;
                    case 'paid':
                        throw new Error('订单已支付！');
                        break;
                    case 'canceled':
                        throw new Error('订单已取消！');
                        break;
                    default:
                        throw new Error('订单状态异常！');
                }
            }
        }
    }).then(function (response) {
        if(response.return_code === 'SUCCESS' && response.result_code === 'SUCCESS') {
            prepay_id = response.prepay_id;
            return models.Order.update({
                prepayid: prepay_id,
                paytime: new Date()
            }, {
                where: {
                    oid: oid
                }
            });
        } else {
            if(response.return_code === 'FAIL') {
                throw new Error(response.return_msg);
            } else {
                throw new Error(response.err_code + ' ' + response.err_code_des);
            }
        }
    }).then(function () {
        logger.info('return prepay_id:' + prepay_id);
        var appId = utils.getAppid(),
            timeStamp = Math.floor(new Date().getTime() / 1000).toString(),
            nonceStr = timeStamp + 'zhier',
            package = 'prepay_id=' + prepay_id,
            signType = 'MD5';
        var stringA = 'appId=' + appId + '&nonceStr=' + nonceStr + '&package=' + package
            + '&signType=' + signType + '&timeStamp=' + timeStamp;
        var stringSignTemp = stringA + '&key=' + utils.getKey();
        var md5 = crypto.createHash('md5');
        md5.update(stringSignTemp);
        var paySign = md5.digest('hex').toUpperCase();
        return res.send({'msg': 'success', 'appId': appId, 'timeStamp': timeStamp, 'nonceStr': nonceStr, 'package': package, 'signType': signType, 'paySign': paySign});
    }).catch(function (error) {
        logger.error('user:[' + req.ip + '] ' + error.stack);
        return res.send({'msg': '错误:' + error.message});
    })
});

function getToday(date) {
    var yyyy = date.getFullYear(),
        M = date.getMonth() + 1,
        d = date.getDate();
    var MM = M<10 ? '0'+M : M,
        dd = d<10 ? '0'+d : d;
    return yyyy + '-' + MM + '-' + dd;
}

function addDays(dateStr, num) {
    var date = new Date(dateStr) || new Date('2018-01-01');
    date.setDate(date.getDate() + num);
    return getToday(date);
}

module.exports = router;
