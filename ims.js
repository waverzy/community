/**
 * Created by waver on 2018/2/6.
 */
var express = require('express');
var router = express.Router();
var log4js = require('../core/log4jsUtil.js'),
    logger = log4js.getLogger();
var models =  require('../models');
var request = require('request');
var wxUtils = require('../core/wxUtils');
var utils = require('../core/utils');
// var Promise = require('bluebird');

router.get('/createWxMenu', function (req, res) {
    logger.info('user:[' + req.ip + '] ready to createWxMenu');
    createNormalMenu(function (err) {
        if(err) {
            logger.error(err.stack);
            return res.send(err.message);
        }
        createAdminMenu(function (error) {
            if(error) {
                logger.error(error.stack);
                return res.send(error.message);
            }
            return res.send('ok');
        });
        /*createNeighborMenu(function (error1) {
            if(error1) {
                logger.error(error1.stack);
                return res.send(error1.message);
            }
            createAdminMenu(function (error) {
                if(error) {
                    logger.error(error.stack);
                    return res.send(error.message);
                }
                return res.send('ok');
            });
        })*/
    });
});

function createNormalMenu(callback) {
    var menu1 = {};
    menu1.type = "view";
    menu1.name = "精彩活动";
    menu1.url = "http://mp.weixin.qq.com/s/fpLNshz_QCSi_QZvQd5BfA";
    var menu2 = {};
    menu2.type = "view";
    menu2.name = "新手指南";
    menu2.url = "http://mp.weixin.qq.com/s/fpLNshz_QCSi_QZvQd5BfA";
    var menu3 = {};
    menu3.type = "view";
    menu3.name = "玩具置换";
    menu3.url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + utils.getAppid() + "&redirect_uri=http://wx.zhiertech.com/index&response_type=code&scope=snsapi_base#wechat_redirect";
    var button = {};
    button.button = [menu1, menu2, menu3];
    var param = JSON.stringify(button);
    wxUtils.getAccessToken(function (err, token) {
        if(err) {
            return callback(err);
        }
        var api_url = 'https://api.weixin.qq.com/cgi-bin/menu/create?access_token='+token;
        request.post({
            url: api_url,
            form: param
        }, function (error, data) {
            if (error) {
                callback(error);
            } else {
                var response = JSON.parse(data.body);
                if(response && response.errcode==0) {
                    return callback(null);
                }
                callback(new Error(response.errcode + response.errmsg));
            }
        });
    })
}

function createAdminMenu(callback) {
    var menu1 = {};
    menu1.type = "view";
    menu1.name = "精彩活动";
    menu1.url = "http://mp.weixin.qq.com/s/fpLNshz_QCSi_QZvQd5BfA";
    var menu2 = {};
    menu2.type = "view";
    menu2.name = "暂未开放";
    menu2.url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + utils.getAppid() + "&redirect_uri=http://wx.zhiertech.com/adminLogin&response_type=code&scope=snsapi_base#wechat_redirect";
    var menu3 = {};
    menu3.type = "view";
    menu3.name = "玩具置换";
    menu3.url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + utils.getAppid() + "&redirect_uri=http://wx.zhiertech.com/index&response_type=code&scope=snsapi_base#wechat_redirect";
    var button = {};
    button.button = [menu1, menu2, menu3];
    var matchrule = {};
    matchrule.tag_id = "110";
    button.matchrule = matchrule;
    var param = JSON.stringify(button);
    wxUtils.getAccessToken(function (err, token) {
        if(err) {
            return callback(err);
        }
        var api_url = 'https://api.weixin.qq.com/cgi-bin/menu/addconditional?access_token='+token;
        request.post({
            url: api_url,
            form: param
        }, function (error, data) {
            if (error) {
                callback(error);
            } else {
                var response = JSON.parse(data.body);
                if(response.menuid) {
                    return callback(null);
                }
                callback(new Error(response.errcode + response.errmsg));
            }
        });
    })
}

/*function createAdminMenu(callback) {
    var menu1 = {};
    menu1.type = "click";
    menu1.name = "惬意生活";
    menu1.key = "M1";
    var menu2 = {};
    menu2.type = "click";
    menu2.name = "精彩活动";
    menu2.key = "M2";
    var subMenu31 = {};
    subMenu31.type = "view";
    subMenu31.name = "绑定";
    subMenu31.url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + utils.getAppid() + "&redirect_uri=http://wx.zhiertech.com/bindResident&response_type=code&scope=snsapi_base#wechat_redirect";
    var subMenu32 = {};
    subMenu32.type = "view";
    subMenu32.name = "发布通知";
    subMenu32.url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + utils.getAppid() + "&redirect_uri=http://wx.zhiertech.com/publishResident&response_type=code&scope=snsapi_base#wechat_redirect";
    var subMenu33 = {};
    subMenu33.type = "view";
    subMenu33.name = "社区管理";
    subMenu33.url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + utils.getAppid() + "&redirect_uri=http://wx.zhiertech.com/manageResident&response_type=code&scope=snsapi_base#wechat_redirect";
    var subMenu34 = {};
    subMenu34.type = "view";
    subMenu34.name = "管理员";
    subMenu34.url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + utils.getAppid() + "&redirect_uri=http://wx.zhiertech.com/adminManage&response_type=code&scope=snsapi_base#wechat_redirect";
    var menu3 = {};
    menu3.name = "个人中心";
    menu3.sub_button = [subMenu31, subMenu32, subMenu33, subMenu34];
    var button = {};
    button.button = [menu1, menu2, menu3];
    var matchrule = {};
    matchrule.tag_id = "110";
    button.matchrule = matchrule;
    var param = JSON.stringify(button);
    wxUtils.getAccessToken(function (err, token) {
        if(err) {
            return callback(err);
        }
        var api_url = 'https://api.weixin.qq.com/cgi-bin/menu/addconditional?access_token='+token;
        request.post({
            url: api_url,
            form: param
        }, function (error, data) {
            if (error) {
                callback(error);
            } else {
                var response = JSON.parse(data.body);
                if(response.menuid) {
                    return callback(null);
                }
                callback(new Error(response.errcode + response.errmsg));
            }
        });
    })
}*/

/*router.get('/createTag', function (req, res) {
    logger.info('user:[' + req.ip + '] ready to createTag');
    var tagList = [];
    var errMsg = '';
    models.Wxtag.findAll({
        where: {
            tagid: null
        }
    }).then(function (tags) {
        if(tags && tags.length>0) {
            tagList = tags;
            return wxUtils.getAccessTokenAsync();
        }
        throw new Error('没有需要创建的新标签！');
    }).then(function (access_token) {
        return Promise.map(tagList, function (tag) {
            var tagObj = {};
            tagObj.tag = {};
            tagObj.tag.name = tag.name;
            return request.postAsync({
                url: 'https://api.weixin.qq.com/cgi-bin/tags/create?access_token=' + access_token,
                form: JSON.stringify(tagObj)
            }).then(function (data) {
                var response = JSON.parse(data.body);
                if(response.tag) {
                    return models.Wxtag.update(
                        {tagid: response.tag.id},
                        {where: {
                            name: response.tag.name
                        }});
                } else {
                    logger.error('[errcode]'+response.errcode+'[errmsg]'+response.errmsg);
                    errMsg += '[errcode]'+response.errcode+'[errmsg]'+response.errmsg;
                }
            });
        });
    }).then(function () {
        if(errMsg !== '') {
            return res.send(errMsg);
        }
        return res.send('ok');
    }).catch(function (err) {
        return res.send(err.message);
    });
});*/

module.exports = router;
