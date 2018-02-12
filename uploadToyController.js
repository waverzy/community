/**
 * Created by waver on 2018/1/12.
 */
define(['main'], function (main) {
    function init() {
        initWidget();
        wxConfig();
    }

    var serverIds = [];

    function wxConfig() {
        main.jquery.ajax({
            type: 'get',
            url: '/wechat/jsapi?url=' + encodeURIComponent(location.href.split('#')[0]),
            cache: false,
            success: function (output) {
                if (output.msg === 'success') {
                    main.wx.config({
                        debug: false,
                        appId: output.appId,
                        timestamp: output.timestamp,
                        nonceStr: output.nonceStr,
                        signature: output.signature,
                        jsApiList: ['chooseImage', 'uploadImage', 'getLocalImgData']
                    });
                    main.wx.ready(function () {
                        main.wx.checkJsApi({
                            jsApiList: [
                                'chooseImage',
                                'uploadImage',
                                'getLocalImgData'
                            ],
                            success: function (res) {
                                if(res.checkResult.chooseImage == true && res.checkResult.uploadImage == true) {
                                    $('.img-upload').html('<div id="btn-upload" class="button button-big">上传照片（请确保玩具细节清晰）</div>');
                                    $('#btn-upload').on('click', function () {
                                        main.wx.chooseImage({
                                            count: 3,
                                            sizeType: ['original', 'compressed'],
                                            sourceType: ['album', 'camera'],
                                            success: function (res) {
                                                var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
                                                var htmlStr = '<div class="list-block" style="margin: 10px 0"><div class="row"></div></div>';
                                                $('.img-preview').html(htmlStr);
                                                syncUpload(localIds);
                                            }
                                        });
                                    });
                                } else {
                                    inputUpload();
                                }
                            }
                        });
                    });
                } else {
                    inputUpload();
                }
            },
            fail: inputUpload()
        });
    }

    function inputUpload() {
        $('.img-upload').html('<div class="button button-big">上传照片（请确保玩具细节清晰）</div><input id="uploadImg" type="file" name="image" accept="image/*">');
        $('#uploadImg').on('change', function () {
            const file = event.target.files[0];
            const imgMaxSize = 1024 * 1024 * 10;
            if(['jpeg', 'png', 'gif', 'jpg'].indexOf(file.type.split("/")[1]) < 0){
                main.f7.alert("文件类型仅支持 jpeg/png/gif！", "提示");
                return;
            }
            if(file.size > imgMaxSize ) {
                main.f7.alert("文件大小不能超过10MB！", "提示");
                return;
            }
            $('.mask').show();
            // $('#uploadImg').prop("disabled", true);
            uploaded = false;
            $('.loading div').html('0%');
            // main.f7.setProgressbar($('.progressbar'), 0);
            if(!!window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)){
                transformFileToFormData(file);
                return;
            }
            transformFileToDataUrl(file);
        });
    }
    
    function syncUpload(localIds) {
        var localId = localIds.pop();
        main.wx.uploadImage({
            localId: localId,
            isShowProgressTips: 1,
            success: function (res) {
                if(window.wxjs_is_wkwebview) {
                    main.wx.getLocalImgData({
                        localId: localId,
                        success: function (res) {
                            var localData = res.localData;
                            localData = localData.replace('jgp', 'jpeg');
                            $('.row').append('<div class="col-33"><img src="' + localData + '"></div>');
                        },
                        fail: function (err) {
                            main.f7.alert(JSON.stringify(err));
                        }
                    });
                } else {
                    $('.row').append('<div class="col-33"><img src="' + localId + '"></div>');
                }
                serverIds.push(res.serverId);
                if(localIds.length > 0){
                    syncUpload(localIds);
                }
            },
            fail: function (error) {
                main.f7.alert(JSON.stringify(error));
            }
        });
    }

    const imgFile = {};

    var uploaded = false;

    function initWidget() {
        /*$('#uploadImg').on('change', function () {
            const file = event.target.files[0];
            const imgMaxSize = 1024 * 1024 * 10;
            if(['jpeg', 'png', 'gif', 'jpg'].indexOf(file.type.split("/")[1]) < 0){
                main.f7.alert("文件类型仅支持 jpeg/png/gif！", "提示");
                return;
            }
            if(file.size > imgMaxSize ) {
                main.f7.alert("文件大小不能超过10MB！", "提示");
                return;
            }
            $('.mask').show();
            // $('#uploadImg').prop("disabled", true);
            uploaded = false;
            $('.loading div').html('0%');
            // main.f7.setProgressbar($('.progressbar'), 0);
            if(!!window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)){
                transformFileToFormData(file);
                return;
            }
            transformFileToDataUrl(file);
        });*/

        $('.btn-word').on('click', function () {
            var name = $('#ipt-name').val() || '';
            if(name.length <=0) {
                main.f7.alert("请输入玩具名称", "提示");
                return;
            }
            if(name.length > 50) {
                main.f7.alert("玩具名称大于50个字", "提示");
                return;
            }
            if($('#ipt-price').val() !== parseInt($('#ipt-price').val()).toString() || parseInt($('#ipt-price').val()) <= 0) {
                main.f7.alert("请输入合理的整数价格！", "提示");
                return;
            }
            if(!uploaded && serverIds.length === 0) {
                main.f7.alert("请上传玩具照片", "提示");
                return;
            }
            $('.loading div').html('提交中...');
            $('.mask').show();
            var brand = $('select[name="brand"] option:selected').val(),
                category = $('select[name="category"] option:selected').val(),
                old = $('select[name="old"] option:selected').val(),
                damage = $('select[name="damage"] option:selected').val(),
                func = $('select[name="func"] option:selected').val();
            var params = {};
            params.name = name;
            params.price = $('#ipt-price').val();
            params.brand = brand;
            params.category = category;
            params.old = old;
            params.damage = damage;
            params.func = func;
            params.serverIds = serverIds;
            main.jquery.ajax({
                type: 'post',
                url: '/uploadToy/toy',
                cache: false,
                data: {
                    params: JSON.stringify(params)
                },
                success: function (output) {
                    if (output.msg == 'success') {
                        window.location.href = '/box';
                    } else if (output.msg == 'logout') {
                        window.location.reload();
                    } else {
                        $('.mask').hide();
                        main.f7.alert(output.msg);
                    }
                }
            });
        });
    }

    function transformFileToFormData (file) {
        var fileReader = new FileReader();
        fileReader.onload = function(e) {
            $('.img-preview img').attr("src", e.target.result);
        };
        const formData = new FormData();
        formData.append('type', file.type);
        formData.append('size', file.size || "image/jpeg");
        formData.append('name', file.name);
        formData.append('lastModifiedDate', file.lastModifiedDate);
        formData.append('file', file);
        uploadImg(formData);
    }

    function transformFileToDataUrl (file) {
        const imgCompassMaxSize = 200 * 1024; // 超过 200k 就压缩
        imgFile.type = file.type || 'image/jpeg'; // 部分安卓出现获取不到type的情况
        imgFile.size = file.size;
        imgFile.name = file.name;
        imgFile.lastModifiedDate = file.lastModifiedDate;
        const reader = new FileReader();
        reader.onload = function(e) {
            const result = e.target.result;
            $('.img-preview img').attr("src", result);
            if(result.length < imgCompassMaxSize) {
                compress(result, processData, false );
            } else {
                compress(result, processData, true);
            }
        };
        reader.readAsDataURL(file);
    }

    function compress(dataURL, callback, shouldCompress) {
        const img = new window.Image();
        img.src = dataURL;
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            var compressedDataUrl = '';
            if(shouldCompress){
                compressedDataUrl = canvas.toDataURL(imgFile.type, 0.2);
            } else {
                compressedDataUrl = canvas.toDataURL(imgFile.type, 1);
            }
            callback(compressedDataUrl);
        }
    }

    function processData (dataUrl) {
        // 这里使用二进制方式处理dataUrl
        const binaryString = window.atob(dataUrl.split(',')[1]);
        const arrayBuffer = new ArrayBuffer(binaryString.length);
        const intArray = new Uint8Array(arrayBuffer);
        for (var i = 0; i < binaryString.length; i++) {
            intArray[i] = binaryString.charCodeAt(i);
        }
        const data = [intArray];
        var blob = {};
        try {
            blob = new Blob(data, { type: imgFile.type });
        } catch (error) {
            window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
            if (error.name === 'TypeError' && window.BlobBuilder){
                const builder = new BlobBuilder();
                builder.append(arrayBuffer);
                blob = builder.getBlob(imgFile.type);
            } else {
                main.f7.alert("版本过低，不支持上传图片", "提示");
            }
        }

        const fileOfBlob = new File([blob], imgFile.name);
        const formData = new FormData();
        formData.append('type', imgFile.type);
        formData.append('size', fileOfBlob.size);
        formData.append('name', imgFile.name);
        formData.append('lastModifiedDate', imgFile.lastModifiedDate);
        formData.append('file', fileOfBlob);
        uploadImg(formData);
    }

    function uploadImg (formData) {
        const xhr = new XMLHttpRequest();
        // 进度监听
        xhr.upload.addEventListener('progress', function(e) {
            console.log(e.loaded);
            var percent = parseInt(e.loaded*100 / e.total);
            $('.loading div').html(percent + '%');
            // main.f7.setProgressbar($('.progressbar'), e.loaded*100 / e.total);
            // $('.img-preview').css("opacity", e.loaded*100 / e.total);
        }, false);
        xhr.addEventListener('load', function() {
            // console.log('load');
            var result = JSON.parse(xhr.responseText);
            if(xhr.status === 200){
                if(result.msg !== "success") {
                    main.f7.alert(result.msg, "提示");
                    $('.img-preview img').attr("src", null);
                } else {
                    // console.log('load success');
                    $('.loading div').html('100%');
                    uploaded = true;
                }
                $('.mask').hide();
                // $('#uploadImg').prop("disabled", false);
            } else {
                main.f7.alert("系统异常，请稍后再试！", "提示");
                $('.mask').hide();
                // $('#uploadImg').prop("disabled", false);
                $('.img-preview img').attr("src", null);
            }
        }, false);
        xhr.addEventListener('error', function() {
            main.f7.alert("网络异常，请稍后再试！", "提示");
            $('.mask').hide();
            // $('#uploadImg').prop("disabled", false);
            $('.img-preview img').attr("src", null);
        }, false);
        xhr.open('POST', '/uploadToy/upload' , true);
        xhr.send(formData);
    }

    return {
        init: init
    }
});