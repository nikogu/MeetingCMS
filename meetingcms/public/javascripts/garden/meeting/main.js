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

	//表单模块
	var iForm = require('./form');

	//登陆表单
	var loginForm = new iForm({
		form: $('#login-form')
	});

	loginForm.setBtn('login', function(e){
		loginForm.doSubmit();
	});

	loginForm.setBtn('reg', function(){

	});

	Dialog.set(loginForm.getBtn('reg'), regContent);

	//注册表单
	var regForm = new iForm({
		form: $('#reg-form')
	});

	regForm.setBtn('login', function(e){

	});

	regForm.setBtn('reg', function(){
		regForm.doSubmit();
	});


});