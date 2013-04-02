/*
** verify.js 
** 包含内容：验证模块
** 功能：验证
**
*/

define(function(require, exports, module) {

    var $ = require('jquery');


    function verify(type, value, value2) {
        switch ( type ) {
            case 'email':
                return {
                    ok: !!/[\w\d_\-\.]+@[\w\d_\-\.]+\.[\w]+/ig.test(value),
                    msg: '邮箱貌似不对' 
                };
            break;

            case 'null':
                return {
                    ok: !!value.replace(/\s*/ig, '').length > 0,
                    msg: '不能为空'
                }

            break;

            case 'twice':
                return {
                    ok: !!value == value2,
                    msg: '两次输入不相等'
                }
            break;

            case 'length':
                return {
                    ok: value.length >= 6,
                    msg: '长度需要大于6'
                }      
            break;

            default:
            break;
        }
    }

    module.exports = verify


});

