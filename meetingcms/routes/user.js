
/*
 * Routes User 
 */

/* get */
exports.list = function(req, res) {
	var begin = req.query.begin;
	var num = req.query.num;

	var User = require('../models/user');
	var userlist = User.list(begin, num, function(err, list, sum) {
		var data = {
			sum: sum,
			list: list
		}
		res.send(data);
	});	
};

exports.login = function(req, res) {
	res.render('userlogin', { title: 'user'});
};

exports.reg = function(req, res) {
	res.render('userreg', { title: 'user'});
};

exports.logout = function(req, res) {
	res.send("user logout");
};

/* post login */
exports.doLogin = function(req, res) {

}

/* post reg */
exports.doReg = function(req, res) {
	var crypto = require('crypto');
	var User = require('../models/user');

	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');

	var newUser = new User({
		email: req.body.emai,
		name: req.body.username,
		password: password
	});

	User.get(newUser.email, function(err, user) {
		if ( user ) {
			err = 'Email already existes.';
		}
		if ( err ) {
			return res.redirect('/userreg');
		}

		newUser.save(function(err) {
			if ( err ) {
				return res.redirect('/userreg');
			}
			req.session.user = newUser;
		});
	});
};

/* get user */
exports.getUserBy = function(req, res) {
	var User = require('../models/user');

	var data = {},
		key = '',
		value = '';

	if ( req.body.condition || req.body.condition == 'undefined' ) {
		data = JSON.parse(req.body.condition);	
	} else {
		key = req.body.key;
		value = req.body.value;
		data = JSON.parse('{"'+key+'":"1"}');
		data[key] = new RegExp('.*'+value+'.*', 'i');
	}

	User.getBy(data, function(err, users) {
		res.send(users);
	});

}

/* get users */
exports.getUsersBy = function(req, res) {
	var User = require('../models/user');

	var emails = req.body.emails;

	if ( !emails ) {
		return;
	}
	emails = emails.split(',');

	User.getUsersBy(emails, function(err, users) {
		res.send(users);
	});

}


/* add user */
exports.addUser = function(req, res) {
	var crypto = require('crypto');
	var User = require('../models/user');

	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');

	var newUser = new User({
		email: req.body.email,
		name: req.body.username,
		password: password
	});

	User.get(newUser.email, function(err, user) {

		var result = {
			'success': false,
			'info': '',
			'data': {}
		};

		if ( user ) {
			err = '邮箱已存在';
		}

		if ( err ) {
			result.success = false;
			result.info = err;
			res.send(result);
			return;
		}

		newUser.save(function(err, user) {

			if ( err ) {
				result.success = false;
				result.info = err;
			}

			result.success = true;
			result.info = '添加用户成功';
			result.data = user;

			res.send(result);

		});
	});
};

/* post update user */
exports.updateUser = function(req, res) {
	var User = require('../models/user');

	var updateKey = req.body.updatekey || "",
		updateValue = req.body.updatevalue || "",
		updateObj = JSON.parse('{"' + updateKey + '":"' + updateValue + '"}' );
		email = req.body.updateflag || "";

	User.get(email, function(err, user) {

		var result = {
			'success': false,
			'info': '',
			'data': {}
		};		

		if ( !user ) {
			err = '用户不存在';
		} 

		if ( err ) {
			result.success = false;
			result.info = err;
			res.send(result);
			return;
		}

		//如果要更新email（主键）
		if ( updateKey === 'email' ) {

			User.get(updateValue, function(err, user) {

				if ( user ) {
					err = '邮箱已存在';
				} 

				if ( err ) {
					result.success = false;
					result.info = err;
					res.send(result);
					return;
				}

				//更新用户
				User.update(email, updateObj, function(err){
					if ( err ) {
						result.success = false;
						result.info = err;
					}

					result.success = true;
					result.info = '更新用户成功';
					result.data = {"flag" : updateValue};

					res.send(result);
				});

			});//end validate email

		} else {

			//更新用户
			User.update(email, updateObj, function(err){
				if ( err ) {
					result.success = false;
					result.info = err;
				}

				result.success = true;
				result.info = '更新用户成功';
				result.data = {"flag" : updateValue};

				res.send(result);
			});

		}//end if

	});

}

/* post update password */
exports.updatePS = function(req, res) {
	
	var oldPassword = req.body.oldpassword;
	var newPassword = req.body.newpassword;
	var email = req.body.email;

	var crypto = require('crypto');
	var User = require('../models/user');

	var md5 = crypto.createHash('md5');
	var md5_oldPassword = md5.update(oldPassword).digest('base64');
	var md52 = crypto.createHash('md5');
	var md5_newPassword = md52.update(newPassword).digest('base64');

	//检查老密码是否正确
	User.get(email, function(err, user) {

		var result = {
			'success': false,
			'info': '',
			'data': {}
		};

		if ( !user ) {
			err = '用户不存在';
		}

		if ( err ) {
			result.success = false;
			result.info = err;
			res.send(result);
			return;
		}

		var password = user.password;

		if ( password === md5_oldPassword ) {

			var updateObj = {password: md5_newPassword};
			//更新用户
			User.update(email, updateObj, function(err){
				if ( err ) {
					result.success = false;
					result.info = err;
				}

				result.success = true;
				result.info = '更新用户密码成功';
				result.data = {"flag" : md5_newPassword};

				res.send(result);
			});
		} else {
			result.success = false;
			result.info = '老密码不正确';
			res.send(result);
			return;
		}

	});
}

/* post delete user */
exports.deleteUser = function(req, res) {
	var User = require('../models/user');

	var email = req.body.data || "";

	User.get(email, function(err, user) {

		var result = {
			'success': false,
			'info': '',
			'data': {}
		};		

		if ( !user ) {
			err = '用户不存在';
		}

		if ( err ) {
			result.success = false;
			result.info = err;
			res.send(result);
			return;
		}

		//删除用户
		User.delete(email, function(err){
			if ( err ) {
				result.success = false;
				result.info = '删除用户失败';
			} else {
				result.success = true;
				result.info = '删除用户成功';
			}
			res.send(result);
		});

	});
}

/* post delete all users */
exports.deleteAllUsers = function(req, res) {
	var User = require('../models/user');

	var emails = req.body.data || "";

	//删除用户
	User.deleteAll(emails, function(err, user){

		var result = {
			'success': false,
			'info': '',
			'data': {}
		};	

		if ( err ) {
			result.success = false;
			result.info = '删除用户失败';
		} else {
			result.success = true;
			result.info = '删除用户成功';
		}

		res.send(result);

	});
	
}

