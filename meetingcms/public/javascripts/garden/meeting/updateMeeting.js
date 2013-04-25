/*
** updateMeeting.js 
** 包含内容：更新会议代码
** 功能：更新会议
**
*/

define(function(require, exports, module) {

    var $ = require('jquery');
    require('jquery.tmpl');
    require('jquery.ui');
    require('jquery.timepick');

    var Backbone = require('backbone');

    var io = require('socket.io');

	/*
	* 会议信息修改模型	
	*/
	var Info = Backbone.Model.extend({
		isUpdate: false,
		isSend: false
	});

	/* 
	* 会议信息修改控制视图
	*/
	var InfoView = Backbone.View.extend({
		events: {
      		"click .update" : "toggleChange",
      		"click .sure" : "send",
            "click .update-date" : "updateDate"
    	},
    	initialize: function() {

			this.updateBtn = this.$el.find('.update, .update-date');
			this.valueNode = this.$el.find('.value');
			this.oldValue = '';
			this.meetingId = this.$el.attr('data-id');
			this.updateKey = this.$el.attr('data-key');

    	},
    	reset: function( val ) {
    		this.valueNode.html(val);
			this.updateBtn.removeClass('cancel').text('修改');
			this.model.isUpdate = false;
    	},
    	send: function() {

    		if ( this.model.isSend ) {
    			return;
    		}

    		this.modelisSend = true;
    		var input = this.valueNode.find('.value-input');

    		$.ajax({
				url: '/meetingupdate',
				type: 'post',
				data: {updateflag: this.meetingId, updatekey: this.updateKey, updatevalue: input.val()},
				success: $.proxy(function(data) {

					var socket = io.connect('http://localhost:8080');
    				socket.on('updateMeeting', function (data) {
    					console.log(data);
  					});

					this.model.isSend = false;
					if ( data.success ) {
						this.reset( data.data.flag );
					} else {
						alert('( ⊙ o ⊙ )啊！出错了!');
					}
				}, this)
			});

    	},
    	toggleChange: function() {

    		if ( !this.model.isUpdate ) {

    			this.model.isUpdate = true;
	    		this.oldValue = this.valueNode.text();

	    		var html = '<div class="update-box">';
				html += '<input class="value-input" type="text" name="value" value="'+this.oldValue+'" >';
				html += '<span class="sure">确认</span>';
				html += '</div>';

				//添加节点
				this.valueNode.html(html);
				this.updateBtn.addClass('cancel').text('取消');

    		} else {

    			this.reset( this.oldValue );

    		}
    	},
        updateDate: function() {

            if ( !this.model.isUpdate ) {

                this.model.isUpdate = true;
                this.oldValue = this.valueNode.text();

                var html = '<div class="update-box">';
                html += '<input class="value-input date-input" type="text" name="value" value="'+this.oldValue+'" >';
                html += '<span class="sure">确认</span>';
                html += '</div>';

                //添加节点
                this.valueNode.html(html);
                this.updateBtn.addClass('cancel').text('取消');

                $('.date-input').datetimepicker({ dateFormat: "yy-mm-dd" });

            } else {

                $( ".date-input" ).datepicker( "destroy" );
                this.reset( this.oldValue );

            }

        }
	});

	//对话框
	var Dialog = require('./dialog');

	/*
	* 添加用户对话框
	*/
	var UserBox = Backbone.Model.extend({
		role : '',
		meetingid : '',
		name: ''
	});

	var AddUserBox = Backbone.View.extend({
		events: {
			"click .search" : "search",
			"click .add" : "addUser"
    	},
    	initialize: function() {
    		this.input = this.$el.find('.search-input');
    		this.searchBtn = this.$el.find('.search');
    		this.listWrap = this.$el.find('.box-content');
    	},
    	search: function() {
    		$.ajax({
    			url: '/usergetby',
    			type: 'post',
    			data: {key: 'name', value: this.input.val()},
    			dataType: 'json',
    			success: $.proxy(function(data) {
    				if ( data.success ) {
    					if ( data.data ) {
    						this.listWrap.html( $.tmpl( $('#add-user-item-template').html(), data ) );
    					} else {
    						this.listWrap.html('<p class="no-item">没有找到你需要的东西...</p>');
    					}
    				} else {
    					alert(data.info);
    				}
    			}, this)
    		});
    	},
    	addUser: function(e) {

    		var target = $(e.target);

    		var send = {};
    		send.id = this.model.meetingid;
			send.email = target.attr('data-email');
			send.role = this.model.role;
			send.name = this.model.name;
			send.username = target.attr('data-username');

    		$.ajax({
    			url: '/meetingaddusers',
    			type: 'post',
    			data: send,
    			dataType: 'json',
    			success: $.proxy(function(data) {
    				if ( data.success ) {
    					target.closest('.item').remove();

                        var listWrap = $(this.model.userView.el);

                        var tpl = '<li class="item">';
                        tpl += '<p class="value"><span class="icon-user-4"></span>${name}</p>';
                        tpl += '<p class="value"><span class="icon-mail"></span>${email}</p>';
                        tpl += '<span data-email="${email}" class="remove icon-cancel-circle" title="删除用户"></span>';
                        tpl += '</li>';
                         
                        listWrap.find('.no-item').remove();
                        listWrap.find('.user-list').append($.tmpl(tpl, data.data));

    				} else {
    					alert(data.info);
    				}
    			}, this)
    		})
    	}
	});

	/*
	* 会议用户编辑修改模型
	*/
	var User = Backbone.Model.extend({
		initialize: function( addUserBox ) {
			this.set({addUserBox: addUserBox});
		}
	});

	/*
	* 会议用户编辑修改视图
	*/
	var UserView = Backbone.View.extend({
		events: {
			"click .add" : "addUser",
            "click .remove" : "removeUser"
    	},
    	initialize: function() {
    		this.addBtn = this.$el.find('.add');
    		this.meetingid = this.addBtn.attr('data-id');
    		this.role = this.addBtn.attr('data-role');
    		this.name = this.addBtn.attr('data-name');
    		this.addUserBox = this.model.get('addUserBox');
    		Dialog.set(this.addBtn, $(this.addUserBox.el));
    	},
    	addUser: function(e) {	
    		//赋值给添加user box
    		this.addUserBox.model.role = this.role;
    		this.addUserBox.model.meetingid = this.meetingid;
    		this.addUserBox.model.name = this.name;
            this.addUserBox.model.userView = this;
    	},
        removeUser: function(e) {
            var target = $(e.target);

            var send = {};
            send.id = this.meetingid;
            send.role = this.role;
            send.name = this.name;
            send.email = target.attr('data-email');

            $.ajax({
                url: '/meetingdelusers',
                type: 'post',
                dataType: 'json',
                data: send, 
                success: $.proxy(function(data) {
                    if ( data.success ) {
                        target.closest('.item').remove();
                    } else {
                        alert(data.info);
                    }
                }, this)
            })
         
        }
	});

	/* 
	* 会议修改模型
	*/
	var MeetingModify = Backbone.View.extend({
        events: {
            "click .exit-meeting" : "exitMeeting"
        },
    	initialize: function() {
            //会议属性
            this.wrap = this.$el.closest('.item');
            this.meetingId = this.wrap.attr('data-id');
            this.role = this.wrap.attr('data-role');
            this.name = this.wrap.attr('data-name');
            this.email = $('#user-info').find('.item-email').find('.value').text();

    		//添加用户box
    		var addUserBox = $('#add-user-box');

    		if ( !window._NIKO._addUserBox ) {
				$.tmpl( $('#add-user-template').html() ).appendTo( $('body') );
	    		window._NIKO._addUserBox = new AddUserBox({model: new UserBox, el: $('#add-user-box') });
    		}
    		var user = new User(window._NIKO._addUserBox);

    		//会议基本信息修改
    		this.$el.find('.info-meta .item').each(function(index, item) {
    			var infoView = new InfoView( {model: new Info, el: $(item)} );
    		});

    		//会议用户信息修改
    		this.$el.find('.list-wrap').each(function(index, item) {
    			var userView = new UserView( {model: user, el: $(item)} );
    		}); 
    		
    	},
        exitMeeting: function(e) {
            console.log(1);

            var send = {};
            send.id = this.meetingId;
            send.role = this.role;
            send.name = this.name;
            send.email = this.email;

            $.ajax({
                url: '/meetingdelusers',
                type: 'post',
                dataType: 'json',
                data: send, 
                success: $.proxy(function(data) {
                    if ( data.success ) {
                        this.wrap.remove();
                    } else {
                        alert(data.info);
                    }
                }, this)
            })
        },

	});

	module.exports = MeetingModify;


});
	
