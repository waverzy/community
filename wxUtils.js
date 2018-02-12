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
                    logger.info('ready to refresh access_token');
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
            msg.touser = params.openid;
            msg.template_id = params.template_id;
            var first = {},
                keyword1 = {},
                keyword2 = {},
                keyword3 = {},
                keyword4 = {},
                remark = {},
                data = {};
            if(params.type === 'act') {
                first.value = "您有一个活动需要参加";
                first.color = "#173177";
                keyword1.value = params.org;
                keyword1.color = "#173177";
                keyword2.value = params.title;
                keyword2.color = "#173177";
                keyword3.value = params.time;
                keyword3.color = "#173177";
                keyword4.value = params.address;
                keyword4.color = "#173177";
                remark.value = params.note;
                remark.color = "#173177";
            } else if(params.type === 'bill') {
                first.value = "您有费用需要缴纳";
                first.color = "#173177";
                keyword1.value = params.title;
                keyword1.color = "#173177";
                keyword2.value = params.amount;
                keyword2.color = "#173177";
                remark.value = params.note;
                remark.color = "#173177";
            } else if(params.type === 'cAct') {
                first.value = "您好，很抱歉地通知您，下列活动取消";
                first.color = "#173177";
                keyword1.value = params.title;
                keyword1.color = "#173177";
                keyword2.value = params.time;
                keyword2.color = "#173177";
                keyword3.value = params.org;
                keyword3.color = "#173177";
                keyword4.value = params.note;
                keyword4.color = "#173177";
            } else if(params.type === 'cMeeting') {
                first.value = "您好，很抱歉地通知您，下列会议取消";
                first.color = "#173177";
                keyword1.value = params.title;
                keyword1.color = "#173177";
                keyword2.value = params.time;
                keyword2.color = "#173177";
                keyword3.value = params.note;
                keyword3.color = "#173177";
            } else if(params.type === 'dAct') {
                first.value = "您有一条活动变更通知";
                first.color = "#173177";
                keyword1.value = params.org;
                keyword1.color = "#173177";
                keyword2.value = params.title;
                keyword2.color = "#173177";
                keyword3.value = params.time;
                keyword3.color = "#173177";
                keyword4.value = params.address;
                keyword4.color = "#173177";
                remark.value = "请注意变更后的时间地点";
                remark.color = "#173177";
            } else if(params.type === 'dMeeting') {
                first.value = "您有一条会议变更通知";
                first.color = "#173177";
                keyword1.value = params.title;
                keyword1.color = "#173177";
                keyword2.value = params.time;
                keyword2.color = "#173177";
                keyword3.value = params.address;
                keyword3.color = "#173177";
                remark.value = "请注意变更后的时间地点";
                remark.color = "#173177";
            } else if(params.type === 'reject') {
                first.value = "您的绑定被拒绝";
                first.color = "#173177";
                keyword1.value = params.title;
                keyword1.color = "#173177";
                keyword2.value = params.time;
                keyword2.color = "#173177";
                remark.value = "如有疑问，请联系" + params.note + "所在小区物业";
                remark.color = "#173177";
            } else {
                first.value = "您有一个会议需要参加";
                first.color = "#173177";
                keyword1.value = params.title;
                keyword1.color = "#173177";
                keyword2.value = params.time;
                keyword2.color = "#173177";
                keyword3.value = params.address;
                keyword3.color = "#173177";
                keyword4.value = params.intro;
                keyword4.color = "#173177";
                remark.value = params.note;
                remark.color = "#173177";
            }

            data.first = first;
            data.keyword1 = keyword1;
            data.keyword2 = keyword2;
            data.keyword3 = keyword3;
            data.keyword4 = keyword4;
            data.remark = remark;
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

wxUtils.downloadImages = function (serverId, callback) {
    logger.info('ready to download image:' + serverId + ' from wx');
    var api_url = 'http://file.api.weixin.qq.com/cgi-bin/media/get?access_token=' + access_token.access_token + '&media_id=' + serverId;
    var filename = path.join(__dirname, '../public/images', Date.now() + '.jpg');
    download(api_url, filename, callback);
    request(api_url).pipe(fs.createWriteStream(filename)).on('close', callback);
};

var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
        if(err) return callback(err);
        if(res.headers['Content-Type'] === 'image/jpeg') {
            request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
        } else {
            var error = new Error(JSON.stringify(res));
            logger.error(error.message);
            callback(error);
        }
    });
};

module.exports = wxUtils;