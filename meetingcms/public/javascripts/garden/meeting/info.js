/*
** info.js 
** 包含内容：消息系统
**
*/

define(function(require, exports, module) {

    var $ = require('jquery');

    window._email = $('#menu').attr('data-email');

    // 消息系统
    window._iInfo = (function() {

        var box = $('#info-box'),
            html = '<span class="value"></span><a class="btn-ok">查看</a>',
            btnCancel = box.find('.btn-cancel');

        function add (info, callback) {
            var p = $('<p>');
            p.addClass('info-item');
            p.html(html);
            box.append(p);
            p.find('.value').text( (info||'有新消息了') );
            p.find('.btn-ok').click(function(e){
                callback(e);
                p.remove();
                if ( box.find('.info-item').length < 1 ) {
                    hide();
                }
            });
        }

        btnCancel.on('click', function(){
            hide();
        });

        function show () {
            box.css('top', 0);
        }

        function hide() {
            box.css('top', '-445px');
        }

        return {
            add: add,
            show: show
        }
    })();

    //webscocket
    window._iInfo.socket = io.connect('http://127.0.0.1:8080');

    (function(socket, iInfo){

        //邀请参加会议通知 
        socket.on('meetingAddUser', function(data) {
            if ( data.data && data.data.email == window._email ) {
                var str = '加入了新的会议-'+data.data.meeting.name;
                iInfo.add(str, function(data){
                    location.href = '/person';
                });
                iInfo.show();
            }
        });

        //邀请参加会议通知 
        socket.on('meetingDelUser', function(data) {
            if ( data.data && data.data.email == window._email ) {
                var str = '退出了会议-'+data.data.meeting.name;
                iInfo.add(str, function(data){
                    location.href = '/person';
                });
                iInfo.show();
            }
        });

        //更新会议通知
        socket.on('updateMeeting', function (data) {
            var meeting = data.data;
            var isIn = false;
            if ( meeting ) {
                for(var prop in meeting['leaders'] ) {
                    if ( meeting['leaders'][prop] == window._email ) {
                        isIn = true; 
                        break;
                    }
                }
                for(var prop in meeting['users'] ) {
                    if ( meeting['users'][prop] == window._email ) {
                        isIn = true; 
                        break;
                    }
                }
                if ( isIn ) {

                    var str = '会议 '+ meeting.name + ' 有更新';
                    iInfo.add(str, function(meeting){
                        location.href = '/person';
                    });
                    iInfo.show();
                }
            }

        });
        
    })(window._iInfo.socket, window._iInfo);



});

