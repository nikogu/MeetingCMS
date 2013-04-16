/*
** personal.js 
** 包含内容：用户界面主逻辑
**
*/

define(function(require, exports, module) {

    var $ = require('jquery');

    //个人信息修改
    var Modify = require('./modify');
    var Dialog = require('./dialog');

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

    //添加新会议
    (function(){
        var wrap = $('#add-meeting'),
            inputWrap = wrap.find('.input-wrap'),
            input = wrap.find('#add-meeting-input'),
            cancelBtn = wrap.find('.btn-cancel'),
            addBtn = wrap.find('.btn-add'),
            email = addBtn.attr('data-email'),
            tplTo = $('#meeting-info .meeting-leader .list');

        var tpl = '<li class="item" data-id="${_id}" data-role="leaders" data-name="${name}">';
        tpl += '<p class="flag" data-id="${_id}"><span class="icon-flag"></span>${name}<b class="loading"></b></p>';
        tpl += '<div class="meeting-info"></div>';
        tpl += '</li>';

        var addStream = new StateMachie({
            inputWrap: inputWrap,
            trigger: addBtn,
            input: input,
            email: email,
            tplTo: tplTo 
        });

        function send() {
            var send = {
                email: this.email,
                name: this.input.val()
            }
            $.ajax({
                url: '/addnewmeeting',
                type: 'post',
                data: send,
                dataType: 'json',
                success: $.proxy(function(data) {

                    if ( data.success && data.data[0]) {

                        var wrap = tplTo.prepend($.tmpl(tpl, data.data[0]));

                        //新建状态机
                        var target = wrap.find('.flag').eq(0),
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


                    } else {
                        alert(data.info);
                    }

                    this.goto('hide-input');

                }, this)
            })

        }

        function showInput() {
            this.inputWrap.css('display','inline-block');
            this.trigger.text('确定');
            addStream.active('send');
        }

        function hideInput() {
            this.inputWrap.hide();
            this.trigger.text('申请新会议');
            addStream.active('show-input');
        }

        addStream.add('send', send);
        addStream.add('show-input', showInput);
        addStream.add('hide-input', hideInput);

        addStream.active('show-input');

        addStream.trigger.on('click', $.proxy(function() {
            addStream.exec();
        }, this) );

        cancelBtn.on('click', function(){
            addStream.goto('hide-input');
        });

        input.on('keypress', function(e){
            if ( e.keyCode === 13 ) {
                addStream.goto('send');
            }
        });

    })();


});

