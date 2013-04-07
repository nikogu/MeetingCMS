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
					console.log(data);

					if ( data.success ) {

						$(e.target).html('修改');
						valueNode.html(that.data.oldVal);

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



	});


});