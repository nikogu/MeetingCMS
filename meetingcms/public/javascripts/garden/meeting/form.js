/*
** form.js 
** 包含内容：表单模块，负责前台页面的表单逻辑处理
** 功能：注册，登陆，验证等逻辑
**
*/

define(function(require, exports, module) {

    var $ = require('jquery');
    require('jquery.tmpl');
    var Verify = require('./verify');

    function iForm( conf ) {
        var _form = conf.form,
            _btnLogin = conf.btnLogin || _form.find('.btn-login'),
            _btnReg = conf.btnReg || _form.find('.btn-reg'),
            _url = _form.attr("action"),
            _field = _form.find('input[name], textarea[name]'),
            _formData = {},
            that = this,
            _verifyFiled = _form.find('input[data-verify], textarea[data-verify]'),
            _callback = conf.sendSuccess || undefined;


        //验证展示
        function verifyAction(that) {

            var that = that;
            var v = verify( $(that) );
            var parent = $(that).data('_parent');

            if ( v ) {

                buildVerify(that, v.msg);
                $(that).addClass('has-error');

            } else if ( parent ) {

                $(that).removeClass('has-error');
                parent.find('.verify-error').hide();               

            } else {

            }

        }

        //建立验证需要的DOM元素
        function buildVerify( that, msg ) {
            var parent = $(that).data('_parent');
            if ( !parent ) {
                $(that).data('_parent', $(that).parent());
                parent = $(that).data('_parent');
                parent.append('<span class="verify-error icon-notification" title="'+msg+'"></span>');
            }
            parent.find('.verify-error').attr('title', msg).show();
        }

        //失焦验证
        _verifyFiled.on('change', function() {
            verifyAction(this);
        });

        //验证逻辑
        function verify( node ) {
            var type = node.attr('data-verify').split(' ');
            var isOk = undefined;
            var temp = {};

            for ( var i = 0, len = type.length; i < len; i++ ) {
                if ( type[i] == 'twice') {
                    temp = Verify( type[i], node.val(), $(node.attr('data-twice')).val() );
                } else {
                    temp = Verify(type[i], node.val());
                }
                isOk = temp.ok ? undefined : temp; 
            }

            return isOk;

        }

        function verifyAll() {
            _verifyFiled.each(function(index, item) {
                verifyAction(item);
            });
        }

        function getData() {
            _field.each(function(index, item) {
                _formData[$(item).attr('name')] = $(item).val();
            });
        }

        function send(_callback) {

            console.log('send...');
            getData();

            $.ajax({
                url: _url,
                type: 'post',
                data: _formData,
                dataType: 'json',
                success: function(data) {
                    if ( !data.success ) {
                        var target = _form.find('*[name="'+data.data.field+'"]');
                        
                        buildVerify(target, data.info);
                    } else {
                        if ( _callback ) {
                            _callback.call(that, data);
                        }
                    }
                }
            })

        }

        function submit() {
            _form.submit();
        }

        //提交方法
        _form.on('submit', function(){

            verifyAll();

            if ( _form.find('.has-error').length < 1 ) {
                send(_callback);
            }

            return false;

        });

        //按钮提取设置器
        function setBtn (type, callback) {
            switch ( type ) {

                case 'login' :
                    _btnLogin.on('click', function(e){
                        callback.call(that, e);
                    });
                break;

                case 'reg' :
                    _btnReg.on('click', function(e){
                        callback.call(that, e);
                    });
                break;

                default:
                break;
            }
        }

        function getBtn ( type ) {
            switch ( type ) {
                case 'login' :
                    return _btnLogin;
                break;

                case 'reg' :
                    return _btnReg;
                break;

                default:
                break;
            }
        }

        return {
            setBtn: setBtn,
            getBtn: getBtn,
            doSubmit: submit
        }        
    }

    module.exports = iForm;


});

