/*
** dialog.js 
** 包含内容：对话框
** 功能：弹出
**
*/

define(function(require, exports, module) {

    var $ = require('jquery');

    $('body').append($('<div id="dialog-wrap"></div>'));
    var wrap = $('#dialog-wrap');

    function set ( trigger, box ) {

        var zIndex = box.css('z-index') || 1;

        trigger.on('click', function() {
            if ( !trigger.data('show') ) {
                wrap.show();
                box.css('z-index', 999);
                box.show();
                trigger.data('show', true);
            }
        });

        box.find('.close').on('click', function() {
            trigger.data('show', false);
            box.css('z-index', zIndex);
            box.hide();
            wrap.hide();
        });
        
    }

    module.exports = {
        set: set
    };

});

