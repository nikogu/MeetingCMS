/*
** execModule.js 
** 包含内容：通用模型
** 功能：???
**
*/

define(function(require, exports, module) {

    var $ = require('jquery');
	
    function ExecModule( conf ) {

        //init
        for ( var prop in conf ) {
            this[prop] = conf[prop];
        }

    }
    //add state
    ExecModule.prototype.addEvent = function(name, type, callback) {
    	this[name].on(type, $.proxy(callback, this));
    }

    module.exports = ExecModule;


});

