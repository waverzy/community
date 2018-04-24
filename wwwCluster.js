/**
 * Created by waver on 2018/2/6.
 */
var request = require('request');
var fs = require('fs');
var path = require("path");
var access_token = require(path.join(__dirname, '..', 'config', 'access_token.json'));
var jsapi_ticket = require(path.join(__dirname, '..', 'config', 'jsapi_ticket.json'));
var utils = require('./utils');
var log4js = require('./log4jsUtil.js'),
    logger = log4js.getLogger();
var wxUtils = {};
var crypto = require('crypto');
var xml2js = require('xml2js');
var xmlBuilder = new xml2js.Builder({rootName: 'xml'});
var parseString = xml2js.parseString;

wxUtils.getAccessToken = function (callback) {
    var api_url = "";
    if (new Date().getTime() < access_token.expires_in * 1000 + access_token.update_time) {
        logger.info('ready to validate access_token');
        api_url = 'https://api.weixin.qq.com/cgi-bin/getcallbackip?access_token='+access_token.access_token;
        request.get(api_url, function (err, response) {
            if (err) {
                logger.error(err.stack);
                return callback(err);
            } else {
                var result = JSON.parse(response.body);
                if(result.errcode) {
                    logger.info('validate access_token fail, ready to refresh access_token');
                    api_url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='
                        + utils.getAppid() + '&secret=' + utils.getSecret();
                    request.get(api_url, function (error, data) {
                        if (error) {
                            logger.error(error.stack);
                            return callback(error);
                        } else {
                            var token = JSON.parse(data.body);
                            if(token.errcode) {
                                logger.error(token.errmsg);
                                return callback(new Error(token.errmsg));
                            }
                            token.update_time = new Date().getTime();
                            logger.info('access_token:' + token.access_token);
                            logger.info('update_time:' + token.update_time);
                            fs.writeFile('config/access_token.json', JSON.stringify(token), function (error) {
                                if (error) {
                                    logger.error(error.stack);
                                    return callback(error);
                                } else {
                                    return callback(null, token.access_token);
                                }
                            });
                        }
                    });
                } else {
                    callback(null, access_token.access_token);
                }
            }
        });
    } else {
        logger.info('ready to refresh access_token');
        api_url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='
            + utils.getAppid() + '&secret=' + utils.getSecret();
        request.get(api_url, function (err, data) {
            if (err) {
                logger.error(err.stack);
                return callback(err);
            } else {
                var token = JSON.parse(data.body);
                if(token.errcode) {
                    logger.error(token.errmsg);
                    return callback(new Error(token.errmsg));
                }
                token.update_time = new Date().getTime();
                logger.info('access_token:' + token.access_token);
                logger.info('update_time:' + token.update_time);
                fs.writeFile('config/access_token.json', JSON.stringify(token), function (error) {
                    if (error) {
                        logger.error(error.stack);
                        return callback(error);
                    } else {
                        return callback(null, token.access_token);
                    }
                });
            }
        });
    }
};

wxUtils.getOpenid = function(code, callback) {
    var api_url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + utils.getAppid()
                    + '&secret=' + utils.getSecret() + '&code=' + code + '&grant_type=authorization_code';
    request.get(api_url, function (err, data) {
        if (err) {
            logger.error(err.stack);
            return callback(err);
        } else {
            var token = JSON.parse(data.body);
            if(token.errcode) {
                logger.error(token.errmsg);
                return callback(new Error(token.errmsg));
            }
            return callback(null, token.openid);
        }
    });
};

wxUtils.sendTemplate = function (params, callback) {
    this.getAccessToken(function (err, token) {
        if(err) {
            callback(err);
        } else {
            var api_url = 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token='+token;
            var msg = {};
            var data = {};
            msg.touser = params.openid;
            var first = {},
                keyword1 = {},
                keyword2 = {},
                remark = {};
            if(params.type === 'upload') {
                msg.template_id = 's3fa0FiaR39OhMih7vjwZncsq2KoQpjUtzVrZ0m052Q';
                first.value = params.first;
                first.color = "#173177";
                keyword1.value = params.keyword1;
                keyword1.color = "#173177";
                keyword2.value = params.keyword2;
                keyword2.color = "#173177";
                remark.value = params.remark;
                remark.color = "#173177";
                data.first = first;
                data.keyword1 = keyword1;
                data.keyword2 = keyword2;
                data.remark = remark;
            } else if(params.type === 'accept') {
                msg.template_id = 'hna_-nhstWkT39sGvSnJhQFKX8aqUvE5mTJm2gXeyTA';
                msg.url = 'http://wx.zhiertech.com/box';
                first.value = params.first;
                first.color = "#173177";
                keyword1.value = params.keyword1;
                keyword1.color = "#173177";
                keyword2.value = params.keyword2;
                keyword2.color = "#173177";
                remark.value = params.remark;
                remark.color = "#173177";
                data.first = first;
                data.keyword1 = keyword1;
                data.keyword2 = keyword2;
                data.remark = remark;
            } else if(params.type === 'reject') {
                msg.template_id = 'mvDbz0RkwubSLo_qhFeOnybiFGWfwjlO23BXSjj-o6s';
                msg.url = 'http://wx.zhiertech.com/box';
                first.value = params.first;
                first.color = "#173177";
                keyword1.value = params.keyword1;
                keyword1.color = "#173177";
                keyword2.value = params.keyword2;
                keyword2.color = "#173177";
                remark.value = params.remark;
                remark.color = "#173177";
                data.first = first;
                data.keyword1 = keyword1;
                data.keyword2 = keyword2;
                data.remark = remark;
            } else if(params.type === 'place_order') {
                msg.template_id = 'Ve8TQ99Mm8W8iYiYzvBalHH2m6EqFXTPgvjvgwvytNo';
                msg.url = 'http://wx.zhiertech.com/records';
                var keyword3 = {},
                    keyword4 = {},
                    keyword5 = {};
                first.value = params.first;
                first.color = "#173177";
                keyword1.value = params.keyword1;
                keyword1.color = "#173177";
                keyword2.value = params.keyword2;
                keyword2.color = "#173177";
                keyword3.value = params.keyword3;
                keyword3.color = "#173177";
                keyword4.value = params.keyword4;
                keyword4.color = "#173177";
                keyword5.value = params.keyword5;
                keyword5.color = "#173177";
                remark.value = params.remark;
                remark.color = "#173177";
                data.first = first;
                data.keyword1 = keyword1;
                data.keyword2 = keyword2;
                data.keyword3 = keyword3;
                data.keyword4 = keyword4;
                data.keyword5 = keyword5;
                data.remark = remark;
            } else if(params.type === 'new_order') {
                msg.template_id = '1DXeV_mDtc5rXCjHSC6RHxwI_r-nr6xM7x42dkehVDs';
                msg.url = 'http://wx.zhiertech.com/adminOrders';
                var tradeDateTime = {},
                    orderType = {},
                    customerInfo = {},
                    orderItemName = {},
                    orderItemData = {};
                first.value = params.first;
                first.color = "#173177";
                tradeDateTime.value = params.tradeDateTime;
                tradeDateTime.color = "#173177";
                orderType.value = params.orderType;
                orderType.color = "#173177";
                customerInfo.value = params.customerInfo;
                customerInfo.color = "#173177";
                orderItemName.value = params.orderItemName;
                orderItemName.color = "#173177";
                orderItemData.value = params.orderItemData;
                orderItemData.color = "#173177";
                remark.value = params.remark;
                remark.color = "#173177";
                data.first = first;
                data.tradeDateTime = tradeDateTime;
                data.orderType = orderType;
                data.customerInfo = customerInfo;
                data.orderItemName = orderItemName;
                data.orderItemData = orderItemData;
                data.remark = remark;
            } else if(params.type === 'system_error') {
                msg.template_id = 'Gsm9CNn0Evqz1cDh6LW6qrr_CL2MpM9A9_TC8N3xzwc';
                msg.touser = 'oP7yu1FHl2CkaqqbqS8RhSFcWWVE';
                var keyword3 = {};
                first.value = '系统报错';
                first.color = "#173177";
                keyword1.value = params.keyword1;
                keyword1.color = "#173177";
                keyword2.value = params.keyword2;
                keyword2.color = "#173177";
                keyword3.value = params.keyword3;
                keyword3.color = "#173177";
                remark.value = '';
                remark.color = "#173177";
                data.first = first;
                data.keyword1 = keyword1;
                data.keyword2 = keyword2;
                data.keyword3 = keyword3;
                data.remark = remark;
            } else {

            }
            msg.data = data;
            var param = JSON.stringify(msg);
            request.post({
                url: api_url,
                form: param
            }, function (error, data) {
                if (error) {
                    callback(error);
                } else {
                    var response = JSON.parse(data.body);
                    callback(null, response);
                }
            });
        }
    })
};

wxUtils.getJsTicket = function (callback) {
    if (new Date().getTime() < jsapi_ticket.expires_in * 1000 + jsapi_ticket.update_time) {
        return callback(null, jsapi_ticket.ticket);
    }
    this.getAccessToken(function (err, token) {
        if(err) {
            callback(err);
        } else {
            var api_url = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+token+'&type=jsapi';
            request.get(api_url, function (err, data) {
                if (err) {
                    logger.error(err.stack);
                    return callback(err);
                } else {
                    var ticket = JSON.parse(data.body);
                    if(ticket.errcode !== 0) {
                        logger.error(ticket.errmsg);
                        return callback(new Error(ticket.errmsg));
                    }
                    ticket.update_time = new Date().getTime();
                    logger.info('ticket:' + ticket.ticket);
                    logger.info('update_time:' + ticket.update_time);
                    fs.writeFile('config/jsapi_ticket.json', JSON.stringify(ticket), function (error) {
                        if (error) {
                            logger.error(error.stack);
                            return callback(error);
                        } else {
                            return callback(null, ticket.ticket);
                        }
                    });
                }
            });
        }
    });
};

wxUtils.raw = function (args) {
    var keys = Object.keys(args);
    keys = keys.sort();
    var newArgs = {};
    keys.forEach(function (key) {
        newArgs[key.toLowerCase()] = args[key];
    });

    var string = '';
    for (var k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
};

wxUtils.trimCDATA = function (valStr) {
    if(valStr && valStr.length>9) {
        return valStr.substring(8, valStr.length-2)
    }
    return null;
};

wxUtils.downloadImages = function (token, serverId, callback) {
    logger.info('ready to download image:' + serverId + ' from wx');
    var api_url = 'http://file.api.weixin.qq.com/cgi-bin/media/get?access_token=' + token + '&media_id=' + serverId;
    var timestamp = Date.now();
    download(api_url, timestamp, callback);
};

var download = function(uri, timestamp, callback){
    var filename = path.join(__dirname, '../public/images', timestamp + '.jpg');
    request(uri, function (err, res, body) {
        if(err) {
            // logger.error(err.stack);
            return callback(err);
        }
        if(res.headers['Content-Type'] !== 'image/jpeg') {
            var error = new Error(JSON.stringify(res));
            callback(error);
        }
    }).pipe(fs.createWriteStream(filename)).on('close', callback(null, 'images/'+timestamp+'.jpg'));
    /*request.head(uri, function(err, res, body){
        if(err) {
            logger.error(err.stack);
            return callback(err);
        }
        if(res.headers['Content-Type'] === 'image/jpeg') {
            request(uri).pipe(fs.createWriteStream(filename)).on('close', callback(null, filename));
        } else {
            var error = new Error(JSON.stringify(res));
            logger.error(error.message);
            callback(error);
        }
    });*/
};

wxUtils.unifiedOrder = function (body, fee, ip, openid, orderId, callback) {
    logger.info('ready to unifiedOrder[oid:' + orderId + ']');
    var total_fee = parseFloat(fee) || -1;
    if(total_fee < 0) {
        return callback(new Error('未传递订单金额'));
    }
    var oid = orderId || '';
    if(oid === '') {
        return callback(new Error('未传递订单号'));
    }
    var api_url = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
    var params = {};
    var timestamp = Date.now().toString();
    params.appid = utils.getAppid();
    params.mch_id = utils.getMchid();
    params.nonce_str = timestamp;
    params.body = body || '执尔科技-运费';
    params.out_trade_no = oid;
    params.total_fee = fee*100;//单位：分
    params.spbill_create_ip = ip || '139.196.96.140';
    params.notify_url = 'http://wx.zhiertech.com/wechat/payresult';
    params.trade_type = 'JSAPI';
    params.limit_pay = 'no_credit';
    params.openid = openid;
    //签名算法https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=4_3
    var stringA = 'appid=' + params.appid + '&body=' + params.body + '&limit_pay=' + params.limit_pay + '&mch_id=' + params.mch_id
                + '&nonce_str=' + params.nonce_str + '&notify_url=' + params.notify_url + '&openid=' + params.openid + '&out_trade_no=' + params.out_trade_no
                + '&spbill_create_ip=' + params.spbill_create_ip + '&total_fee=' + params.total_fee
                + '&trade_type=' + params.trade_type;
    var stringSignTemp = stringA + '&key=' + utils.getKey();
    var md5 = crypto.createHash('md5');
    md5.update(stringSignTemp);
    params.sign = md5.digest('hex').toUpperCase();
    var param = xmlBuilder.buildObject(params);
    request.post({
        url: api_url,
        form: param
    }, function (error, data) {
        if (error) {
            callback(error);
        } else {
            parseString(data.body, {explicitArray : false}, function (err, jsonStr) {
                logger.info('unifiedorder return msg:' + JSON.stringify(jsonStr));
                if(err) {
                    callback(err);
                } else {
                    callback(null, jsonStr.xml);
                }
            });
        }
    });
};

wxUtils.closeOrder = function (orderId, callback) {
    var oid = orderId || '';
    if(oid === '') {
        return callback(new Error('未传递订单号'));
    }
    var api_url = 'https://api.mch.weixin.qq.com/pay/closeorder';
    var params = {};
    var timestamp = Date.now().toString();
    params.appid = utils.getAppid();
    params.mch_id = utils.getMchid();
    params.out_trade_no = oid;
    params.nonce_str = timestamp;
    var stringA = 'appid=' + params.appid + '&mch_id=' + params.mch_id
        + '&nonce_str=' + params.nonce_str + '&out_trade_no=' + params.out_trade_no;
    var stringSignTemp = stringA + '&key=' + utils.getKey();
    var md5 = crypto.createHash('md5');
    md5.update(stringSignTemp);
    params.sign = md5.digest('hex').toUpperCase();
    var param = xmlBuilder.buildObject(params);
    request.post({
        url: api_url,
        form: param
    }, function (error, data) {
        if (error) {
            callback(error);
        } else {
            parseString(data.body, {explicitArray : false}, function (err, jsonStr) {
                if(err) {
                    callback(err);
                } else {
                    callback(null, jsonStr.xml);
                }
            });
        }
    });
};

wxUtils.orderNew = function (close, orderId, body, fee, ip, openid, callback) {
    var oid = orderId || '';
    if(oid === '') {
        return callback(new Error('未传递订单号'));
    }
    if(close) {
        logger.info('ready to close pay order[oid:' + orderId + ']');
        var api_url = 'https://api.mch.weixin.qq.com/pay/closeorder';
        var params = {};
        var timestamp = Date.now().toString();
        params.appid = utils.getAppid();
        params.mch_id = utils.getMchid();
        params.out_trade_no = oid;
        params.nonce_str = timestamp;
        var stringA = 'appid=' + params.appid + '&mch_id=' + params.mch_id
            + '&nonce_str=' + params.nonce_str + '&out_trade_no=' + params.out_trade_no;
        var stringSignTemp = stringA + '&key=' + utils.getKey();
        var md5 = crypto.createHash('md5');
        md5.update(stringSignTemp);
        params.sign = md5.digest('hex').toUpperCase();
        var param = xmlBuilder.buildObject(params);
        request.post({
            url: api_url,
            form: param
        }, function (error, data) {
            if (error) {
                callback(error);
            } else {
                parseString(data.body, {explicitArray : false}, function (err, jsonStr) {
                    logger.info('closeorder return msg:' + JSON.stringify(jsonStr));
                    if(err) {
                        callback(err);
                    } else {
                        if(jsonStr.xml.return_code === 'SUCCESS' && jsonStr.xml.result_code === 'SUCCESS') {
                            logger.info('Pay order[' + orderId + '] has been closed.');
                            wxUtils.unifiedOrder(body, fee, ip, openid, orderId, callback);
                        } else {
                            callback(null, jsonStr.xml);
                        }
                    }
                });
            }
        });
    } else {
        this.unifiedOrder(body, fee, ip, openid, orderId, callback);
    }
};

wxUtils.orderQuery = function (orderId, callback) {
    var oid = orderId || '';
    if(oid === '') {
        return callback(new Error('未传递订单号'));
    }
    var api_url = 'https://api.mch.weixin.qq.com/pay/orderquery';
    var params = {};
    var timestamp = Date.now().toString();
    params.appid = utils.getAppid();
    params.mch_id = utils.getMchid();
    params.out_trade_no = oid;
    params.nonce_str = timestamp;
    var stringA = 'appid=' + params.appid + '&mch_id=' + params.mch_id
        + '&nonce_str=' + params.nonce_str + '&out_trade_no=' + params.out_trade_no;
    var stringSignTemp = stringA + '&key=' + utils.getKey();
    var md5 = crypto.createHash('md5');
    md5.update(stringSignTemp);
    params.sign = md5.digest('hex').toUpperCase();
    var param = xmlBuilder.buildObject(params);
    request.post({
        url: api_url,
        form: param
    }, function (error, data) {
        if (error) {
            callback(error);
        } else {
            parseString(data.body, {explicitArray : false}, function (err, jsonStr) {
                if(err) {
                    callback(err);
                } else {
                    callback(null, jsonStr.xml);
                }
            });
        }
    });
};

module.exports = wxUtils;
