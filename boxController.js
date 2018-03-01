/**
 * Created by waver on 2018/1/10.
 */
define(['main'], function (main) {
    function init() {
        initWidget();
        refreshOldValue();
        refreshNewValue();
    }

    function initWidget() {
        var loadDeliveryTime = false;
        loadCart();//先渲染后绑定
        $('#btn-addOld').on('click', function () {
            window.location.href = '/uploadToy';
        });
        $('input[type="checkbox"][name="old-checkbox"]').on('change', function () {
            refreshOldValue();
        });
        $('input[type="checkbox"][name="new-checkbox"]').on('change', function () {
            refreshNewValue();
        });
        $('#tab-old li').on('taphold', function () {
            var li = $(this);
            main.f7.confirm('删除后无法恢复，须重新上传', '确定删除？',
                function () {
                    removeOld(li);
                }
            );
        });
        $('#btn-removeNew').on('click', function () {
            var checkList = $('input[type="checkbox"][name="new-checkbox"]:checked');
            if (!checkList || checkList.length <= 0) {
                return main.f7.alert('请先选择需要移除的新玩具', '提示');
            }
            main.f7.confirm('确定删除？', '提示',
                function () {
                    var cartToys = getCartToys();
                    var updatedCart = [];
                    for(var i=0; i<cartToys.length; i++) {
                        var exist = false;
                        for(var j=0; j<checkList.length; j++) {
                            if(cartToys[i].tid == checkList[j].value) {
                                exist = true;
                                $('#li'+cartToys[i].tid).remove();
                                break;
                            }

                        }
                        if(!exist) {
                            updatedCart.push(cartToys[i]);
                        }
                    }
                    var storage = window.localStorage;
                    storage.setItem('cart', JSON.stringify(updatedCart));
                    setCookie('cart', JSON.stringify(updatedCart));
                }
            );
        });
        $('.btn-word').on('click', function () {
            var oldList = $('input[type="checkbox"][name="old-checkbox"]:checked');
            if (!oldList || oldList.length <= 0) {
                main.f7.alert('请先选择用以置换的旧玩具！', '提示');
                return;
            }
            var newList = $('input[type="checkbox"][name="new-checkbox"]:checked');
            if (!newList || newList.length <= 0) {
                main.f7.alert('请先选择需要置换的新玩具！', '提示');
                return;
            }
            var oldStr = $('#old-total').text(),
                oldTotal = parseInt(oldStr.substring(6, oldStr.length-4)) || 0;
            var newStr = $('#new-total').text(),
                newTotal = parseInt(newStr.substring(6, newStr.length-4)) || 0;
            if (oldTotal < newTotal || oldTotal <= 0 || newTotal <=0) {
                main.f7.alert('旧玩具值合计低于新玩具值！', '提示');
                return;
            }
            if(!loadDeliveryTime) {
                main.jquery.ajax({
                    type: 'post',
                    url: '/box/deliveryTime',
                    cache: false,
                    data: {},
                    success: function (output) {
                        if (output.msg == 'success') {
                            var periodList = output.deliveryTime;
                            var firstRow = periodList[0];
                            var pickerInline = main.f7.picker({
                                input: '#picker-date',
                                container: '#picker-date-container',
                                toolbar: false,
                                rotateEffect: true,
                                value: [firstRow.date, firstRow.periods[0]],
                                formatValue: function (picker, values) {
                                    return values[0] + ' ' + values[1];
                                },
                                cols: [
                                    // Date
                                    {
                                        values: (function () {
                                            var arr = [];
                                            periodList.forEach(function (val) {
                                                arr.push(val.date);
                                            });
                                            return arr;
                                        })(),
                                        onChange: function (picker, date) {
                                            if(picker.cols[2].replaceValues){
                                                var list = [];
                                                periodList.forEach(function (val) {
                                                    if(val.date == date) {
                                                        list = val.periods;
                                                    }
                                                });
                                                picker.cols[2].replaceValues(list);
                                            }
                                        }
                                    },
                                    // Space divider
                                    {
                                        divider: true,
                                        content: '  '
                                    },
                                    // Period
                                    {
                                        values: firstRow.periods
                                    }
                                ]
                            });
                            loadDeliveryTime = true;
                        } else if(output.msg == 'logout') {
                            window.location.href = '/login';
                        } else {
                            main.f7.alert(output.msg, '提示');
                        }
                    }
                });
            }
            main.mainView.router.load({pageName: 'address'});
        });
        $('.left a').on('click', function () {
            main.mainView.router.load({pageName: 'box', animatePages: false});
        });
        $('#btn-next').on('click', function () {
            var name = $('#ipt-name').val() || "";
            if(name === "" || name.length > 30) {
                return main.f7.alert("请输入30个字以内的联系人姓名", "提示");
            }
            var mobile = $('#ipt-mobile').val() || "";
            if(!checkMobile(mobile)) {
                return main.f7.alert("请输入合法手机号！", "提示");
            }
            var city = $("#sel-city").find("option:selected").text() || "";
            if(city === "") {
                return main.f7.alert("请选择城市", "提示");
            }
            var district = $("#sel-district").find("option:selected").text() || "";
            if(district === "") {
                return main.f7.alert("请选择区县", "提示");
            }
            var address = $('#ipt-address').val() || "";
            if(address === "" || address.length > 200) {
                return main.f7.alert("请输入200个字以内的地址", "提示");
            }
            var loop = $("#sel-loop").find("option:selected").text() || "";
            if(loop === "") {
                return main.f7.alert("请选择区域", "提示");
            }
            var period = $('#picker-date').val() || "";
            if(period === "") {
                return main.f7.alert("请选择配送时间段", "提示");
            }
            var oldCheckList = $('input[type="checkbox"][name="old-checkbox"]:checked') || [];
            if (oldCheckList.length === 0) {
                return main.f7.alert('请先选择用以置换的旧玩具！', '提示');
            }
            var newCheckList = $('input[type="checkbox"][name="new-checkbox"]:checked') || [];
            if (newCheckList.length === 0) {
                return main.f7.alert('请先选择需要置换的新玩具！', '提示');
            }
            var oldList = [],
                newList = [],
                newNum = [];
            oldCheckList.each(function () {
                oldList.push($(this).val());
            });
            newCheckList.each(function () {
                newList.push($(this).val());
                newNum.push($(this).data('num'));
            });
            var params = {};
            params.name = name;
            params.mobile = mobile;
            params.city = city;
            params.district = district;
            params.address = address;
            params.loop = loop;
            params.period = period;
            params.oldList = oldList;
            params.newList = newList;
            params.newNum = newNum;
            main.jquery.ajax({
                type: 'post',
                url: '/box/submit',
                cache: false,
                data: {
                    params: JSON.stringify(params)
                },
                success: function (output) {
                    if (output.msg == 'success') {
                        var buttons = [
                            {
                                text: '运费：' + output.fee + '元',
                                bold: true
                            },
                            {
                                text: '现在支付',
                                color: '#1AAD19',
                                onClick: function () {
                                    main.jquery.ajax({
                                        type: 'post',
                                        url: '/box/pay',
                                        cache: false,
                                        data: {
                                            oid: output.oid
                                        },
                                        success: function (output) {
                                            if (output.msg == 'success') {
                                                WeixinJSBridge.invoke(
                                                    'getBrandWCPayRequest', {
                                                        "appId": output.appId,
                                                        "timeStamp": output.timeStamp,
                                                        "nonceStr": output.nonceStr,
                                                        "package": output.package,
                                                        "signType": output.signType,
                                                        "paySign": output.paySign
                                                    },
                                                    function(res){
                                                        if(res.err_msg == "get_brand_wcpay_request:ok") {
                                                            window.location.href = '/finish';
                                                        } else {
                                                            window.location.href = '/records';
                                                        }
                                                    }
                                                );
                                            } else if(output.msg == 'logout') {
                                                window.location.href = '/login';
                                            } else {
                                                main.f7.alert('output.msg', '提示');
                                            }
                                        }
                                    });

                                }
                            },
                            {
                                text: '稍后支付',
                                color: 'red',
                                onClick: function () {
                                    window.location.href = '/records';
                                }
                            }
                        ];
                        main.f7.actions(buttons);
                    } else if(output.msg == 'logout') {
                        window.location.href = '/login';
                    } else {
                        main.f7.alert(output.msg, '提示');
                    }
                }
            })
        })
    }

    function getCartToys() {
        var storage = window.localStorage;
        var cartToys = storage.getItem('cart') || getCookie('cart');
        if(cartToys) {
            return JSON.parse(cartToys);
        }
        return [];
    }

    function loadCart() {
        var cartToys = getCartToys();
        var htmlStr = "";
        cartToys.forEach(function (cartToy) {
            htmlStr += '<li id="li' + cartToy.tid + '"><label class="label-checkbox item-content">' +
                '<input type="checkbox" name="new-checkbox" data-num="' + cartToy.num + '" checked value="' + cartToy.tid + '">' +
                '<div class="item-media"><i class="icon icon-form-checkbox"></i></div>' +
                '<div class="item-media"><img src="' + cartToy.pic + '" width="60"></div>' +
                '<div class="item-inner"><div class="item-title-row" style="margin-top: 10px;">' +
                '<div class="item-title">' + cartToy.name + '</div></div><div class="item-subtitle"></div>' +
                '<div class="item-text" style="margin-top: 10px;">' + cartToy.price + '置换豆 x ' + cartToy.num + '</div></div></li>';
        });
        if(htmlStr !== "") {
            $('#new-toys').html('<div class="list-block media-list"><ul>'+htmlStr+'</ul></div><div id="btn-removeNew" class="button button-big color-red">移 除</div>');
        }


    }

    function getToyPrice(tid) {
        var cartToys = getCartToys();
        var price = 0;
        for(var i=0; i<cartToys.length; i++) {
            if(cartToys[i].tid === parseInt(tid)) {
                price = parseInt(cartToys[i].price) * parseInt(cartToys[i].num);
                break;
            }
        }
        return price;
    }

    function refreshOldValue() {
        var checkList = $('input[type="checkbox"][name="old-checkbox"]:checked');
        if (!checkList || checkList.length <= 0) {
            return $('#old-total').text('旧玩具合计：0置换豆');
        }
        var oldTotal = 0;
        checkList.each(function () {
            oldTotal += $(this).data('price');
        });
        $('#old-total').text('旧玩具合计：' + oldTotal + '置换豆');
    }

    function refreshNewValue() {
        var checkList = $('input[type="checkbox"][name="new-checkbox"]:checked');
        if (!checkList || checkList.length <= 0) {
            return $('#new-total').text('新玩具合计：0置换豆');
        }
        var newTotal = 0;
        checkList.each(function () {
            newTotal += getToyPrice($(this).val());
        });
        $('#new-total').text('新玩具合计：' + newTotal + '置换豆');
    }

    function removeOld(li) {
        main.jquery.ajax({
            type: 'post',
            url: '/box/removeOld',
            cache: false,
            data: {
                toyid: li.data('oid')
            },
            success: function (output) {
                if (output.msg == 'success') {
                    li.remove();
                } else {
                    main.f7.alert('output.msg', '提示');
                }
            }
        });
    }

    function setCookie(key, value) {
        var expireDate=new Date();
        expireDate.setDate(expireDate.getDate()+30);
        document.cookie = key + "=" + encodeURI(value) + ";expires=" + expireDate.toUTCString();
    }

    function getCookie(key) {
        var idx = document.cookie.indexOf(key + "=");
        if(idx === -1) return "";
        var start = idx + key.length + 1,
            end = document.cookie.indexOf(";", idx);
        if(end === -1) end = document.cookie.length;
        return decodeURI(document.cookie.substr(start,end));
    }

    function checkMobile(numStr) {
        return /^1(3|4|5|7|8)[0-9]\d{8}$/.test(numStr);
    }

    return {
        init: init
    }
});
