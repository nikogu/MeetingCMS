/*
** page-choose.js 
** 包含内容：选择页面主逻辑
**
*/

define(function(require, exports, module) {

    var $ = require('jquery');
    require('jquery.ui');
    require('jquery.timepick');

    //对话框
    var Dialog = require('./dialog');

    //表单模块
    var iForm = require('./form');

    //登陆表单
    var loginForm = new iForm({
        form: $('#public-meeting-form'),
        sendSuccess: function(data) {
            if ( data.success ) {
                location.href = '/person';
            } else {
                alert(data.info);
            }
        }
    });

    loginForm.setBtn('login', function(e){
        loginForm.doSubmit();
    });

    $('#public-meeting-dateb').datetimepicker({ dateFormat: "yy-mm-dd" });
    $('#public-meeting-datee').datetimepicker({ dateFormat: "yy-mm-dd" });

    Dialog.set($('#public-mt'), $('#public-meeting-box'));

});

