/*
** page-square.js 
** 包含内容：广场页面主逻辑
**
*/

define(function(require, exports, module) {

    var $ = require('jquery');

    var Backbone = require('backbone');

    var StateMachine = require('./stateMachine');

    //显示会议类别
    $('.show-all').on('click', function() {
        $('.op-active').removeClass('op-active');
        $(this).addClass('op-active');

        $('.meetings-item').show();
    });
    $('.show-joined').on('click', function() {
        $('.op-active').removeClass('op-active');
        $(this).addClass('op-active');

        $('.meetings-item').hide();
        $('.join-meeting').closest('.meetings-item').show();
    });
    $('.show-unjoin').on('click', function() {
        $('.op-active').removeClass('op-active');
        $(this).addClass('op-active');

        $('.meetings-item').hide();
        $('.in-meeting').closest('.meetings-item').show();
    });
    $('.show-unexpire').on('click', function() {
        $('.op-active').removeClass('op-active');
        $(this).addClass('op-active');

        $('.meetings-item').show();
        $('.expire-meeting').closest('.meetings-item').hide();
    });

    //会议元素模型
    var MeetingItem = Backbone.Model.extend({
    });

    //会议元素视图
    var MeetingView = Backbone.View.extend({
        events: {
            "click .join-meeting" : "addMeeting",
            "click .show-user" : "controllUser"
        },
        initialize: function() {
            this.model.id = this.$el.attr('data-id');
            this.model.name = this.$el.attr('data-name');
            this.model.role = this.$el.attr('data-role');
            this.model.tpl = $('#meeting-user-tpl');

            //判断是否过期
            var dateEnd = this.$el.find('.meta-date-end').find('.value').text();
            if ( (new Date(dateEnd)).getTime() - (new Date()).getTime() <= 0) {
                this.$el.addClass('expire');
                this.$el.find('.join-meeting, .in-meeting').addClass('expire-meeting').removeClass('join-meeting').text('已过期');

            }

            //用户控制状态机
            this.model.userState = new StateMachine({
                id: this.model.id,
                view: this,
                trigger: this.$el.find('.show-user')
            });
            (function(s, that){
                s.add('get-user', that.getUser);
                s.add('show-user', that.showUser);
                s.add('hide-user', that.hideUser);
                s.active('get-user');
            })(this.model.userState, this);

        },
        addMeeting: function(e) {

            var send = {};
            send.meetingid = this.model.id;
            send.meetingname = this.model.name;
            send.meetingrole = 'users';

            var target = $(e.target);

            $.ajax({
                url: '/useraddmeeting',
                type: 'post',
                data: send,
                dataType: 'json',
                success: $.proxy(function(data) {
                    console.log(data);

                    //更新状态机
                    this.model.userState.goto('get-user');

                    if ( data.success ) {
                        target.text('已参加').addClass('in-meeting').removeClass('join-meeting');
                    } else {
                        alert(data.info);
                    }
                }, this)
            });
        },
        controllUser: function() {
            this.model.userState.exec();
        },
        getUser: function() {
            $.ajax({
                url: '/getmeeting',
                type: 'post',
                data: {id: this.id},
                dataType: 'json',
                success: $.proxy(function(data) {

                    if ( data.success ) {
                        var tpl = this.view.model.tpl;
                        this.view.$el.append($.tmpl(tpl, data.data));

                    } else {
                        alert(data.info);
                    }

                    this.goto('show-user');

                }, this)
            });
        },
        showUser: function() {
            this.trigger.text('收起');
            this.view.$el.find('.meeting-user').addClass('show-meeting-user'); 
            this.active('hide-user');
        },
        hideUser: function() {
            this.trigger.text('看看谁参加了');
            this.view.$el.find('.meeting-user').removeClass('show-meeting-user'); 
            this.active('show-user');
        }
    });

    var MeetingListView = Backbone.View.extend({
        el: $('#page-square .meetings-list'),
        initialize: function() {
            this.$el.find('.meetings-item').each(function(index, item) {
                var item = new MeetingView({el: item, model: new MeetingItem()});
            });
        },
        addNew: function( data ) {

            var view = $.tmpl($('#meeting-item-tpl').html(), data);

            var item = new MeetingView({el: view, model: new MeetingItem()});
            this.$el.prepend(item.el);
            item.$el.addClass('new-meeting');

        }
    });

    var meetingListView = new MeetingListView();

    //webscocket
    window._iInfo.socket.on('addNewMeeting', function (data) {
        console.log('add-new-meeting-client');

        window._iInfo.add('有新会议哦', function(){
            if ( /square/ig.test(location.href) ) {
                meetingListView.addNew(data.data[0]);
            } else {
                location.href = '/square';
            }
        });
        window._iInfo.show();

    });


});


