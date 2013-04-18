/**
*
* @author: niko
* @date: 2013.4.1
* @info: Meeting App Main Module
*
**/

define(function(require) {

	//全局变量存储空间
	window._NIKO = {};

	var $ = require('jquery');
	require('jquery.tmpl');

	/*
    *注册登陆
    */
    require('./page-login');

	/*
	*个人页面
	*/
	require('./page-personal');

	/*
	* 选择页面(入口页面)
	*/
	require('./page-choose');

	/*
	* 广场页面
	*/
	require('./page-square');

});