/*
** page-login.js 
** 包含内容：登陆页面主逻辑
**
*/

define(function(require, exports, module) {

    var $ = require('jquery');

    //对话框
    var Dialog = require('./dialog');

    var loginAbout = $('#login-about'),
        regContent = $('#reg-content');

    //表单模块
    var iForm = require('./form');

    //登陆表单
    var loginForm = new iForm({
        form: $('#login-form'),
        sendSuccess: function(data) {
            location.href = '/';
        }
    });

    loginForm.setBtn('login', function(e){
        loginForm.doSubmit();
    });

    loginForm.setBtn('reg', function(){

    });

    //注册弹出的对话框
    Dialog.set(loginForm.getBtn('reg'), regContent);

    //注册表单
    var regForm = new iForm({
        form: $('#reg-form'),
        sendSuccess: function(data) {
            location.href = '/';
        }
    });

    regForm.setBtn('login', function(e){

    });

    regForm.setBtn('reg', function(){
        regForm.doSubmit();
    });


});

