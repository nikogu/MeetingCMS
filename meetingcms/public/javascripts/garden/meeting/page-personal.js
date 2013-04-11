/*
** personal.js 
** 包含内容：用户界面主逻辑
**
*/

define(function(require, exports, module) {

    var $ = require('jquery');

    //个人信息修改
    var Modify = require('./modify');

    var person = new Modify($('#user-info'));

    //name select event callback
    person.addWidget('change-password', '.item-password .update', 'click', function(e) {

        var parent = $(e.target).parent(),
            valueNode = parent.find('.value'),
            that = this;

        //保存旧值
        if ( !that.data.oldVal ) {
            that.data.oldVal = valueNode.text();
        }

        //避免重复点击
        if ( that.data.isClick ) {
            $(e.target).html('修改');
            valueNode.html(that.data.oldVal);
            that.data.isClick = false;
            return;     
        }

        //改变按钮，改变标示
        $(e.target).html('取消');
        that.data.isClick = true;

        //添加的内容
        var html = '<div class="update-wrap">';
        html += '<label for="info-oldps">老密码<input id="info-oldps" type="password" name="oldpassword" /></label>';
        html += '<label for="info-newps">新密码<input id="info-newps" type="password" name="newpassword" /></label>';
        html += '<a id="info-submitps" href="#update-ps" class="btn-submit">更新</a>';
        html += '</div>';

        //添加
        valueNode.html(html);

        //传送对象
        var send = {};

        //提交按钮
        var infoSubmit = $('#info-submitps');

        //绑定提交事件
        infoSubmit.on('click', update);

        function update() {

            send.email = $('#user-info .item-email .value').text();
            send.oldpassword = $('#info-oldps').val();
            send.newpassword = $('#info-newps').val();

            $.ajax({
                url: '/userupdateps',
                type: 'post',
                dataType: 'json',
                data: send,
                success: function(data) {
                    //解绑
                    infoSubmit.off('click', update);
                    that.data.isClick = false;

                    if ( data.success ) {

                        $(e.target).html('修改');
                        valueNode.html(that.data.oldVal);
                        var correct = $('<span class="correct icon-checkmark-circle"></span>');
                        parent.append(correct);
                        setTimeout(function(){
                            correct.fadeOut(function(){
                                $(this).remove();
                            });
                        }, 1000);

                    } else {

                        if ( parent.find('error').length > 0 ) {
                            parent.find('error').show();
                        } else {
                            $('<p class="error">'+data.info+'</p>').insertAfter(infoSubmit);
                        }

                    }
                }
            });
        }

    });//end add widget


    //状态机
    var StateMachie = require('./stateMachine');

    //会议修改模型
    var MeetingModify = require('./updateMeeting');

    //用户会议信息状态
    function getInfo() {

        var that = this;    
        that.loading.show();

        //获取信息
        $.ajax({
            url: '/getmeeting',
            type: 'post',
            dataType: 'json',
            data: {id: that.id},
            success: function(data) {

                that.loading.hide();

                if ( data.success ) {
                    console.log(data);

                    if ( data.data ) {

                        $.tmpl( $('#meeting-info-template').html(), data.data).appendTo( that.info );

                        //修改信息模块执行
                        var meetingModify = new MeetingModify( {el: that.info });

                        that.info.show();
                        that.active('hide-info');
                    }

                } else {

                }//end if

            }
        });//end ajax
    }

    function showInfo() {
        this.info.show();
        this.active('hide-info');
    }

    function hideInfo() {
        this.info.hide();
        this.active('show-info');
    }

    //建立用户会议状态机
    $('#meeting-info .flag').each(function(index, item){

        var target = $(item),
            parent = target.parent(),
            info = parent.find('.meeting-info'),
            id = target.attr('data-id'),
            loading = target.find('.loading');

        //用户会议状态模型
        var userMeeting = new StateMachie({
            trigger: target,
            parent: parent,
            info: info,
            id: id,
            loading: loading
        });

        //获得信息状态
        userMeeting.add('get-info', getInfo);

        //显示信息状态
        userMeeting.add('show-info', showInfo);

        //隐藏信息状态
        userMeeting.add('hide-info', hideInfo);

        //设置初始状态
        userMeeting.active('get-info');

        //触发状态
        userMeeting.trigger.on('click', $.proxy(function(){
            this.exec();
        }, userMeeting));

    });



});

