/**
 * Created by waver on 2018/1/24.
 */
define(['main'], function(main) {
    function init() {
        getReviewList();
        initWidget();
    }

    function initWidget() {
        $('#btn-reviewing').on('click', function () {
            $('.buttons-row a').removeClass("active");
            $(this).addClass("active");
            getReviewList();
        });
        $('#btn-accepted').on('click', function () {
            $('.buttons-row a').removeClass("active");
            $(this).addClass("active");
            main.jquery.ajax({
                type: 'post',
                url: '/review/accepted',
                cache: false,
                data: {},
                success: function (output) {
                    if (output.msg == 'success') {
                        var oldToys = output.result;
                        var htmlStr = '';
                        for(var i=0; i<oldToys.length; i++) {
                            htmlStr += '<li class="accordion-item"><a class="item-content item-link">'
                                + '<div class="item-inner"><div class="item-title">' + oldToys[i].user + '</div>'
                                + '<div class="item-after">' + oldToys[i].submitTime + '</div></div></a>'
                                + '<div class="accordion-item-content"><div class="content-block">'
                                + '<p>名称：' + oldToys[i].name + '</p><p>品牌：' + oldToys[i].brand + '</p>'
                                + '<p>分类：' + oldToys[i].category + '</p><p>市场价：' + oldToys[i].marketprice + '</p>'
                                + '<p>预估价：' + oldToys[i].assessprice + '</p><p>新旧：' + oldToys[i].old + '</p>'
                                + '<p>缺损：' + oldToys[i].damage + '</p><p>功能：' + oldToys[i].func + '</p>'
                                + '<p>核定价：' + oldToys[i].price + '</p><p>审核意见：' + oldToys[i].comment
                                + '</p><p>审核时间：' + oldToys[i].auditTime + '</p></div></div></li>';
                        }
                        $('#review-list').html(htmlStr);
                        bindAfterRender();
                    } else {
                        main.f7.alert(output.msg, '提示');
                    }
                }
            });
        });
        $('#btn-rejected').on('click', function () {
            $('.buttons-row a').removeClass("active");
            $(this).addClass("active");
            main.jquery.ajax({
                type: 'post',
                url: '/review/rejected',
                cache: false,
                data: {},
                success: function (output) {
                    if (output.msg == 'success') {
                        var oldToys = output.result;
                        var htmlStr = '';
                        for(var i=0; i<oldToys.length; i++) {
                            htmlStr += '<li class="accordion-item"><a class="item-content item-link">'
                                + '<div class="item-inner"><div class="item-title">' + oldToys[i].user + '</div>'
                                + '<div class="item-after">' + oldToys[i].submitTime + '</div></div></a>'
                                + '<div class="accordion-item-content"><div class="content-block">'
                                + '<p>名称：' + oldToys[i].name + '</p><p>品牌：' + oldToys[i].brand + '</p>'
                                + '<p>分类：' + oldToys[i].category + '</p><p>市场价：' + oldToys[i].marketprice + '</p>'
                                + '<p>预估价：' + oldToys[i].assessprice + '</p><p>新旧：' + oldToys[i].old + '</p>'
                                + '<p>缺损：' + oldToys[i].damage + '</p><p>功能：' + oldToys[i].func + '</p>'
                                + '<p>核定价：' + oldToys[i].price + '</p><p>审核意见：' + oldToys[i].comment
                                + '</p><p>审核时间：' + oldToys[i].auditTime + '</p></div></div></li>';
                        }
                        $('#review-list').html(htmlStr);
                        bindAfterRender();
                    } else {
                        main.f7.alert(output.msg, '提示');
                    }
                }
            });
        });
        $('#btn-used').on('click', function () {
            $('.buttons-row a').removeClass("active");
            $(this).addClass("active");
            main.jquery.ajax({
                type: 'post',
                url: '/review/used',
                cache: false,
                data: {},
                success: function (output) {
                    if (output.msg == 'success') {
                        var oldToys = output.result;
                        var htmlStr = '';
                        for(var i=0; i<oldToys.length; i++) {
                            htmlStr += '<li class="accordion-item"><a class="item-content item-link">'
                                + '<div class="item-inner"><div class="item-title">' + oldToys[i].user + '</div>'
                                + '<div class="item-after">' + oldToys[i].submitTime + '</div></div></a>'
                                + '<div class="accordion-item-content"><div class="content-block">'
                                + '<p>名称：' + oldToys[i].name + '</p><p>品牌：' + oldToys[i].brand + '</p>'
                                + '<p>分类：' + oldToys[i].category + '</p><p>市场价：' + oldToys[i].marketprice + '</p>'
                                + '<p>预估价：' + oldToys[i].assessprice + '</p><p>新旧：' + oldToys[i].old + '</p>'
                                + '<p>缺损：' + oldToys[i].damage + '</p><p>功能：' + oldToys[i].func + '</p>'
                                + '<p>核定价：' + oldToys[i].price + '</p><p>审核意见：' + oldToys[i].comment
                                + '</p><p>兑换时间：' + oldToys[i].auditTime + '</p></div></div></li>';
                        }
                        $('#review-list').html(htmlStr);
                        bindAfterRender();
                    } else {
                        main.f7.alert(output.msg, '提示');
                    }
                }
            });
        });
        $('#btn-removed').on('click', function () {
            $('.buttons-row a').removeClass("active");
            $(this).addClass("active");
            main.jquery.ajax({
                type: 'post',
                url: '/review/removed',
                cache: false,
                data: {},
                success: function (output) {
                    if (output.msg == 'success') {
                        var oldToys = output.result;
                        var htmlStr = '';
                        for(var i=0; i<oldToys.length; i++) {
                            htmlStr += '<li class="accordion-item"><a class="item-content item-link">'
                                + '<div class="item-inner"><div class="item-title">' + oldToys[i].user + '</div>'
                                + '<div class="item-after">' + oldToys[i].submitTime + '</div></div></a>'
                                + '<div class="accordion-item-content"><div class="content-block">'
                                + '<p>名称：' + oldToys[i].name + '</p><p>品牌：' + oldToys[i].brand + '</p>'
                                + '<p>分类：' + oldToys[i].category + '</p><p>市场价：' + oldToys[i].marketprice + '</p>'
                                + '<p>预估价：' + oldToys[i].assessprice + '</p><p>新旧：' + oldToys[i].old + '</p>'
                                + '<p>缺损：' + oldToys[i].damage + '</p><p>功能：' + oldToys[i].func + '</p>'
                                + '<p>核定价：' + oldToys[i].price + '</p><p>审核意见：' + oldToys[i].comment
                                + '</p><p>移除时间：' + oldToys[i].auditTime + '</p></div></div></li>';
                        }
                        $('#review-list').html(htmlStr);
                        bindAfterRender();
                    } else {
                        main.f7.alert(output.msg, '提示');
                    }
                }
            });
        });
    }
    
    function bindAfterRender() {
        $('.btn-audit').on('click', function () {
            var oid = $(this).data('oid');
            var modal = main.f7.modal({
                title: '审核',
                /*text: '<div class="list-block inset"><ul><li><div class="item-content">'
                + '<div class="item-media"><i class="icon icon-form-name"></i></div>'
                + '<div class="item-inner"><div class="item-title label">定价</div>'
                + '<div class="item-input"><input type="text"></div></div></div></li>'
                + '<li class="align-top"><div class="item-content"><div class="item-media">'
                + '<i class="icon icon-form-comment"></i></div><div class="item-inner">'
                + '<div class="item-title label">意见</div><div class="item-input">'
                + '<textarea></textarea></div></div></div></li></ul></div>',*/
                text: '<div id="form' + oid + '" class="list-block" style="margin: 10px 0"><ul><li><div class="item-content">'
                + '<input type="number" placeholder="定价"></div></li><hr style="height: 1px; border: none; background-color: #cdcdcd; margin: 0"/>'
                + '<li class="align-top"><div class="item-content">'
                + '<textarea placeholder="意见"></textarea></div></li></ul></div>',
                buttons: [
                    {
                        text: '确定',
                        bold: true,
                        onClick: function () {
                            var price = $('#form'+ oid + ' input').val(),
                                comment = $('#form'+oid + ' textarea').val();
                            if(price === '') {
                                main.f7.alert('请输入价格', '提示');
                            } else {
                                main.f7.alert('确认提交？', '提示',  function () {
                                    auditSubmit('/review/accept', oid, price, comment);
                                })
                            }
                        }
                    },
                    {
                        text: '驳回',
                        onClick: function () {
                            var price = $('#form'+ oid + ' input').val(),
                                comment = $('#form'+oid + ' textarea').val();
                            if(price === '') {
                                main.f7.alert('请输入审核意见', '提示');
                            } else {
                                main.f7.alert('确认提交？', '提示',  function () {
                                    auditSubmit('/review/reject', oid, price, comment);
                                })
                            }
                        }
                    },
                    {
                        text: '取消'
                    }
                ]
            })
        });
        $('.btn-photo').on('click', function () {
            var myPhotoBrowser = main.f7.photoBrowser({
                zoom: 400,
                photos: [$(this).data('src'), $(this).data('src1'), $(this).data('src2')]
            });
            myPhotoBrowser.open();
        })
    }

    function getReviewList() {
        main.jquery.ajax({
            type: 'post',
            url: '/review/reviewing',
            cache: false,
            data: {},
            success: function (output) {
                if (output.msg == 'success') {
                    var oldToys = output.result;
                    var htmlStr = '';
                    for(var i=0; i<oldToys.length; i++) {
                        htmlStr += '<li class="accordion-item"><a id="item' + oldToys[i].oid +'" class="item-content item-link">'
                                + '<div class="item-inner"><div class="item-title">' + oldToys[i].user + '</div>'
                                + '<div class="item-after">' + oldToys[i].submitTime + '</div></div></a>'
                                + '<div class="accordion-item-content"><div class="content-block">'
                                + '<p>名称：' + oldToys[i].name + '</p><p>品牌：' + oldToys[i].brand + '</p>'
                                + '<p>分类：' + oldToys[i].category + '</p><p>市场价：' + oldToys[i].marketprice + '</p>'
                                + '<p>预估价：' + oldToys[i].assessprice + '</p><p>新旧：' + oldToys[i].old + '</p>'
                                + '<p>缺损：' + oldToys[i].damage + '</p><p>功能：' + oldToys[i].func + '</p>'
                                + '<p><a data-src="' + oldToys[i].pic + '" data-src1="' + oldToys[i].pic1 + '" data-src2="' + oldToys[i].pic2 + '" class="button btn-photo">查看照片</a></p>'
                                + '<p><a data-oid="' + oldToys[i].oid + '" class="button btn-audit">审 核</a></p></div></div></li>';
                    }
                    $('#review-list').html(htmlStr);
                    bindAfterRender();
                } else {
                    main.f7.alert(output.msg, '提示');
                }
            }
        });
    }

    function auditSubmit(requestUrl, oid, price, comment) {
        main.jquery.ajax({
            type: 'post',
            url: requestUrl,
            cache: false,
            data: {
                oid: oid,
                price: price,
                comment: comment
            },
            success: function (output) {
                if (output.msg == 'success') {
                    $('#item'+oid).css('background-color', '#cdcdcd');
                } else {
                    main.f7.alert(output.msg, '提示');
                }
            }
        });
    }

    return {
        init: init
    }
});