/*
** stateMachine.js 
** 包含内容：状态机
** 功能：状态转换
**
*/

define(function(require, exports, module) {

    var $ = require('jquery');

    function StateMachine( conf ) {

        //init
        for ( var prop in conf ) {
            this[prop] = conf[prop];
        }

        //store event queue
        this._controller = {};
        //exec queue
        this._exec = [];

    }
    //add state
    StateMachine.prototype.add = function(name, callback) {
        this._controller[name] = callback;
    }
    //active state
    StateMachine.prototype.active = function(name) {
        if ( !( name in this._controller ) ) {
            throw new Error('Controller does not has this state');
        }

        var handler = this._controller[name];
        this._exec.push(handler);
    }
    //exec exec queue
    StateMachine.prototype.exec = function() {
        if ( this._exec.length > 0 ) {
            this._exec.shift().call(this, arguments);
        }
    }
    //empty exec queue
    StateMachine.prototype.empty = function() {
        this._exec.length = 0;
        this._exec = [];
    }

    module.exports = StateMachine;

});

