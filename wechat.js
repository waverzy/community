/**
 * Created by waver on 2018/2/6.
 */
var express = require('express');
var router = express.Router();
var log4js = require('../core/log4jsUtil.js'),
    logger = log4js.getLogger();
var models =  require('../models');
var parseString = require('xml2js').parseString;
var crypto = require('crypto');
var utils = require('../core/utils');
var wxUtils = require('../core/wxUtils');

router.post('/', function (req, res) {
   var xml = '';
   req.setEncoding('utf8');
   req.on('data', function (chunk) {
       xml += chunk;
   });
   req.on('end', function() {
       parseString(xml, {explicitArray : false}, function(err, jsonStr) {
           if(err) {
               logger.error('Parse weixin event string error:' + err.message);
               return;
           }
           var msgType = jsonStr.xml.MsgType,
               openid = jsonStr.xml.FromUserName,
               wxName = jsonStr.xml.ToUserName;
           if(msgType === 'event') {
               var event = jsonStr.xml.Event;
               switch(event) {
                   case "subscribe":
                       var createTime = new Date().getTime();
                       var content = '您好，欢迎来到“换”彩童年。\n\n孩子玩具太多？家里放不下？快来置换大牌新品，把风靡全球的STEAM玩具带回家......\n\n<a href="http://mp.weixin.qq.com/s/fpLNshz_QCSi_QZvQd5BfA">现在置换更有风靡全球的爆款玩具相送</a>';
                       return res.send('<xml><ToUserName><![CDATA[' + openid + ']]></ToUserName><FromUserName><![CDATA[' + wxName + ']]></FromUserName><CreateTime><![CDATA[' + createTime + ']]></CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[' + content + ']]></Content></xml>');
                       break;
                   default:
                       logger.info('Weixin Event:' + jsonStr);
               }
           } else {
               logger.info('Weixin Event:' + jsonStr);
           }
       });
   });
});

router.get('/', function (req, res) {
    var signature = req.query.signature || '',
        timestamp = req.query.timestamp || '',
        nonce = req.query.nonce || '',
        echostr = req.query.echostr || '';
    console.log('signature:'+signature);
    console.log('timestamp:'+timestamp);
    console.log('nonce:'+nonce);
    console.log('echostr:'+echostr);
    if(signature==='' || timestamp==='' || nonce==='' || echostr==='') {
        return res.send('Invalid Request!');
    }
    var sortArr = [timestamp, nonce, utils.getToken()].sort();
    var sha1 = crypto.createHash('sha1');
    sha1.update(sortArr[0]+sortArr[1]+sortArr[2]);
    var signstr = sha1.digest('hex');
    console.log('signstr:'+signstr);
    if(signature == signstr) {
        return res.send(echostr);
    } else {
        return res.send('Invalid Request!');
    }

});

router.get('/jsapi', function (req, res) {
    var url = req.query.url || '';
    var nonceStr = Math.random().toString(36).substr(2, 15),
        timestamp = parseInt(new Date().getTime() / 1000) + '';
    wxUtils.getJsTicket(function (err, data) {
        if(err) {
            return res.send(err.message);
        }
        var ret = {
            jsapi_ticket: data,
            noncestr: nonceStr,
            timestamp: timestamp,
            url: url
        };
        var rawStr = wxUtils.raw(ret);
        var sha1 = crypto.createHash('sha1');
        sha1.update(rawStr);
        var signature = sha1.digest('hex');
        return res.send({'msg': 'success', 'nonceStr': nonceStr, 'timestamp': timestamp, 'signature': signature, 'appId': utils.getAppid()});
    });
});

router.post('/payresult', function (req, res) {
    var xml = '';
    req.setEncoding('utf8');
    req.on('data', function (chunk) {
        xml += chunk;
    });
    req.on('end', function() {
        parseString(xml, {explicitArray : false}, function(err, jsonStr) {
            var return_code = jsonStr.xml.return_code;
            if(return_code === 'SUCCESS') {
                var result_code = jsonStr.xml.result_code;
                if(result_code === 'FAIL') {
                    logger.error('weixin pay notify result fail:' + jsonStr.xml.err_code + jsonStr.xml.err_code_des);
                    return res.send('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[NOTOK]]></return_msg></xml>');
                }
                var curOrder = {};
                var payResult = {};
                payResult.appid = jsonStr.xml.appid;
                payResult.mch_id = jsonStr.xml.mch_id;
                payResult.nonce_str = jsonStr.xml.nonce_str;
                payResult.sign = jsonStr.xml.sign;
                payResult.openid = jsonStr.xml.openid;
                payResult.trade_type = jsonStr.xml.trade_type;
                payResult.bank_type = jsonStr.xml.bank_type;
                payResult.total_fee = parseInt(jsonStr.xml.total_fee) || -1;
                payResult.cash_fee = parseInt(jsonStr.xml.cash_fee) || -1;
                payResult.transaction_id = jsonStr.xml.transaction_id;
                payResult.out_trade_no = jsonStr.xml.out_trade_no;
                payResult.time_end = jsonStr.xml.time_end;
                models.Order.findOne({
                    where: {
                        oid: payResult.out_trade_no
                    }
                }).then(function (order) {
                    if(order && order.state === 'unpaid' && parseInt(order.logifee*100) === parseInt(payResult.total_fee)) {
                        curOrder = order;
                        order.state = 'paid';
                        order.save();
                    } else {
                        throw new Error('与后台订单信息不符！');
                    }
                }).then(function () {
                    models.Payresult.create(payResult);
                }).then(function () {
                    logger.info('weixin pay notify success handled and ready to send weixin template message');
                    return models.Record.findAll({
                        where: {
                            oid: curOrder.oid,
                            type: 'new'
                        }
                    });
                }).then(function (records) {
                    if(records && records.length > 0) {
                        var params = {};
                        params.type = 'place_order';
                        params.openid = jsonStr.xml.openid;
                        params.first = '您的订单已支付成功';
                        params.keyword1 = '待配送';
                        params.keyword2 = records[0].name + (records.length>1 ? ('等' + records.length + '件玩具') : '');
                        params.keyword3 = formatDate(new Date(curOrder.createdAt));
                        params.keyword4 = curOrder.mobile;
                        params.keyword5 = curOrder.address;
                        params.remark = '请于'+ curOrder.logitime + '将用于置换的旧玩具准备好，等待工作人员上门收取，谢谢。';
                        return wxUtils.sendTemplateAsync(params);
                    } else {
                        throw new Error('订单异常，未查询到新玩具记录！')
                    }
                }).then(function () {
                    return res.send('<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>');
                }).catch(function (error) {
                    logger.error(error.stack);
                    return res.send('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[NOTOK]]></return_msg></xml>');
                })
            } else {
                logger.error('weixin pay notify return fail:' + jsonStr.xml.return_msg);
                return res.send('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[NOTOK]]></return_msg></xml>');
            }
        });
    });
});

function formatDate(date) {
    var yyyy = date.getFullYear(),
        M = date.getMonth() + 1,
        d = date.getDate(),
        h = date.getHours(),
        m = date.getMinutes(),
        s = date.getSeconds();
    var MM = M < 10 ? '0' + M : M,
        dd = d < 10 ? '0' + d : d,
        hh = h < 10 ? '0' + h : h,
        mm = m < 10 ? '0' + m : m,
        ss = s < 10 ? '0' + s : s;
    return yyyy + '-' + MM + '-' + dd + ' ' + hh + ':' + mm + ':' + ss;
}

module.exports = router;
