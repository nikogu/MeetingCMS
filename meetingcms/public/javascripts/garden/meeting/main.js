/**
*
* @author: niko
* @date: 2013.4.1
* @info: Meeting App Main Module
*
**/

define(function(require) {

	var $ = require('jquery');
	require('jquery.tmpl');

	//var tpl = $.tmpl(template, object);
	//append(tpl);

	//对话框
	var Dialog = require('./dialog');

	/*
	*注册登陆
	*/
	var loginAbout = $('#login-about'),
		regContent = $('#reg-content');

	//登陆动画
	//require('./login-animate');

	//表单模块
	var iForm = require('./form');

	//登陆表单
	var loginForm = new iForm({
		form: $('#login-form'),
		sendSuccess: function(data) {
			location.href = '/';
		}
	});

	loginForm.setBtn('login', function(e){
		loginForm.doSubmit();
	});

	loginForm.setBtn('reg', function(){

	});

	//注册弹出的对话框
	Dialog.set(loginForm.getBtn('reg'), regContent);

	//注册表单
	var regForm = new iForm({
		form: $('#reg-form'),
		sendSuccess: function(data) {
			location.href = '/';
		}
	});

	regForm.setBtn('login', function(e){

	});

	regForm.setBtn('reg', function(){
		regForm.doSubmit();
	});

	/*
	*个人页面
	*/
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

	//info list view - backbone
	var InfoListView = require('./updateMeeting');

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
						//var upMeetingCol = new UpMeetingCol( that.info );
						//upMeetingCol.init();
						var infoListView = new InfoListView( {el: that.info });

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

	/*
	* 修改会议信息
	*/
	


	/*
	//更改会议模型
	function UpMeetingMod ( item ) {
		this.wrap = item;
		this.updateBtn = this.wrap.find('.update');
		this.valueNode = this.wrap.find('.value');
		this.oldValue = '';
		this.meetingId = this.wrap.attr('data-id');
		this.updateKey = this.wrap.attr('data-key');
	}
	UpMeetingMod.prototype.toggleState = function() {

		var that = this;

		//显示输入框
		function showInput(e) {

			var $this = this;

			that.oldValue = that.valueNode.text();

			var html = '<div class="update-box">';
			html += '<input class="value-input" type="text" name="value" value="'+that.oldValue+'" >';
			html += '<span class="sure">确认</span>';
			html += '</div>';

			//添加节点
			that.valueNode.html(html);

			that.updateBtn.addClass('cancel').text('取消');

			//异步更新事件
			var input = that.valueNode.find('.value-input');
			var sureBtn = that.valueNode.find('.sure');
			function send() {

				$.ajax({
					url: '/meetingupdate',
					type: 'post',
					data: {updateflag: that.meetingId, updatekey: that.updateKey, updatevalue: input.val()},
					success: function(data) {
						if ( data.success ) {
							that.valueNode.html(data.data.flag);
							that.updateBtn.removeClass('cancel').text('修改');
							
							$this.empty();
							$this.active('show-input');
						} else {
							alert('( ⊙ o ⊙ )啊！出错了!');
						}
					}
				});

				//解绑
				sureBtn.off('click', send);
			}
			sureBtn.on('click', send);

			$this.active('hide-input');

		}//end showInput

		//隐藏输入框
		function hideInput(e) {
			that.valueNode.html(that.oldValue);	
			that.updateBtn.removeClass('cancel').text('修改');
			this.active('show-input');
		}

		//状态机
		var upMeetingState = new StateMachie({
			trigger: that.updateBtn
		});

		//显示输入框
		upMeetingState.add('show-input', showInput);

		//隐藏输入框
		upMeetingState.add('hide-input', hideInput);

		//设置初始状态
		upMeetingState.active('show-input');

		//触发状态
		upMeetingState.trigger.on('click', $.proxy(function(){
			this.exec();
		}, upMeetingState));

	}

	UpMeetingMod.prototype.init = function() {

		this.toggleState();

	}


	//更改会议集合
	function UpMeetingCol ( wrap ) {
		this.item = wrap.find('.info-meta .item');
	}
	UpMeetingCol.prototype.init = function() {
		this.item.each(function(index, item){

			var upMeetingMod = new UpMeetingMod( $(item) );
			upMeetingMod.init();

		});
	}

	*/
});