/**
 * Created by waver on 2018/3/1.
 */
define(['main'], function (main) {
    function init() {
        initWidget();
    }

    function initWidget() {
        $('#btn-edit').on('click', function () {
            var checkList = $('input[type="checkbox"][name="toys-checkbox"]:checked');
            if (!checkList || checkList.length !== 1) {
                return main.f7.alert('请选择一条需要编辑的内容', '提示');
            }
            main.jquery.ajax({
                type: 'post',
                url: '/adminToys/get',
                cache: false,
                data: {
                    id: checkList[0].value
                },
                success: function (output) {
                    if (output.msg == 'success') {
                        $('#ipt-shortName').val(output.toy.shortName);
                        $('#ipt-pic').val(output.toy.pic);
                        $('#ipt-desc').val(output.toy.desc);
                        $('#ipt-price').val(output.toy.price);
                        $('#sel-state').val(output.toy.state==true ? '1' : '0');
                        $('#ipt-name').val(output.toy.name);
                        $('#ipt-age').val(output.toy.age);
                        $('#ipt-battery').val(output.toy.battery);
                        $('#ipt-description').val(output.toy.description);
                        $('#ipt-info').val(output.toy.info);
                        $('#ipt-tip').val(output.toy.tip);
                        var slideImages = output.toy.slide,
                            mainImages = output.toy.main;
                        $('.swipeout').remove();
                        slideImages.forEach(function (val) {
                            var htmlStr = '<li class="swipeout"><div class="swipeout-content item-content">'
                                        + '<div class="item-inner"><div class="item-title label">轮播图</div>'
                                        + '<div class="item-input"><input type="text" value="' + val + '" </div></div></div>'
                                        + '<div class="swipeout-actions-right"><a class="btn-slide">删除</a></div></li>';
                            $('.popup ul').append(htmlStr);
                        });
                        mainImages.forEach(function (val) {
                            var htmlStr = '<li class="swipeout"><div class="swipeout-content item-content">'
                                + '<div class="item-inner"><div class="item-title label">主图</div>'
                                + '<div class="item-input"><input type="text"' + val + '></div></div></div>'
                                + '<div class="swipeout-actions-right"><a class="btn-slide">删除</a></div></li>';
                            $('.popup ul').append(htmlStr);
                        });
                        $('.btn-slide').on('click', function () {
                            var slide = $(this);
                            main.f7.confirm('提示', '确定删除？',
                                function () {
                                    slide.parents('li').remove();
                                }
                            );
                        });
                        main.f7.popup('.popup');
                    } else if(output.msg == 'logout') {
                        window.location.href = '/adminLogin';
                    } else {
                        main.f7.alert(output.msg, '提示');
                    }
                }
            });
        });
        $('#btn-cancel').on('click', function () {
            
        })
    }

    return {
        init: init
    }
});
