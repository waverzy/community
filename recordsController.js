/**
 * Created by waver on 2018/1/19.
 */
define(['main'], function (main) {
    function init() {
        initWidget();
    }

    function initWidget() {
        $('.col-33 img').on('click', function () {
            window.location.href = '/toyDetail?id=' + $(this).data('tid');
        });
        $('.btn-cancel').on('click', function () {
            var id = $(this).data('id');
            main.f7.confirm('确定取消？', '提示',
                function () {
                    main.jquery.ajax({
                        type: 'post',
                        url: '/records/cancel',
                        cache: false,
                        data: {
                            id: id
                        },
                        success: function (output) {
                            if (output.msg == 'success') {
                                window.location.href = '/records';
                            } else {
                                main.f7.alert(output.msg, '提示');
                            }
                        }
                    });
                }
            );
        });
        $('.left a').on('click', function () {
            window.location.href = '/mine';
        });
    }

    return {
        init: init
    }
});
