
/*
 * GET admin page.
 */

exports.index = function(req, res){

	if ( !req.session.user ) {
		res.redirect('/adminlogin');
	} else {
	 	res.render('admin/index', { title: '后台管理页面', layout: 'admin/layout', items:[1], admin:req.session.user });
	}
};

exports.login = function(req, res) {
	res.render('admin/login', {title: '后台登陆系统', layout: 'admin/layout'});
}

exports.loginout = function(req, res) {
	req.session.user = null;	
	res.redirect('/adminlogin');
}

exports.doLogin = function(req, res) {

	var crypto = require('crypto');
	var User = require('../models/user');

	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');

	var newUser = new User({
		email: req.body.email,
		password: password
	});

	User.get(newUser.email, function(err, user) {

		var result = {
			'success': false,
			'info': '',
			'data': {}
		};

		if ( err ) {
			result.success = false;
			result.info = err;
		}

		if ( !user ) {

			result.success = false;
			result.info = '没有此用户';

		} else if ( user.power != 0 ) {

			result.success = false;
			result.info = '用户权限不足';

		} else if ( newUser.password !== user.password ) {

			result.success = false;
			result.info = '密码错误';
			
		} else {

			result.success = true;
			result.info = '登入成功';
			result.data = user;
			req.session.user = user;

		}

		res.send(result);

	});

}