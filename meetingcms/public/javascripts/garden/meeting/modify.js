/*
** person.js 
** 包含内容：用户信息修改模型
** 功能：修改用户信息
**
*/

define(function(require, exports, module) {

    var $ = require('jquery');

    function Modify( wrap ) {
        this.el = wrap;
        this.widgets = [];
    }
    Modify.prototype.addWidget = function(name, select, e, callback) {
        var trigger = this.el.find(select); 
        var that = this;
        var widget = {
            name: name,
            trigger: trigger,
            e: e,
            callback: callback,
            data: {}
        }
        trigger.on(e, function(e) {
            callback.call(widget, e);
        });
        this.widgets.push(widget);
    }

    module.exports = Modify;
});

