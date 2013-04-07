
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
	req.session.user = null;	
	res.redirect('/');
};

/* post login */
exports.doLogin = function(req, res) {

	var crypto = require('crypto');
	var User = require('../models/user');
	var verify = require('../models/verify');

	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');

	var newUser = new User({
		email: req.body.email,
		password: password
	});
	var result = {
		'success': false,
		'info': '',
		'data': {}
	};

	//验证
	if ( !verify('email', req.body.email) ) {
		result.success = false;
		result.info = '邮箱不正确';
		result.data.field = 'email';
		res.send(result);
		return;
	}

	if ( !verify('length', req.body.password) ) {
		result.success = false;
		result.info = '密码不正确';
		result.data.field = 'password';
		res.send(result);
		return;
	}

	User.get(newUser.email, function(err, user) {


		if ( err ) {
			result.success = false;
			result.info = err;
		}

		if ( !user ) {

			result.success = false;
			result.info = '没有此用户';
			result.data.field = 'email';

		} else if ( newUser.password !== user.password ) {

			result.success = false;
			result.info = '密码错误';
			result.data.field = 'password';

		} else {

			result.success = true;
			result.info = '登入成功';
			result.data = user;
			req.session.user = user;

		}

		res.send(result);

	});

}

/* do Reg */
exports.doReg = function(req, res) {
	var crypto = require('crypto');
	var User = require('../models/user');
	var verify = require('../models/verify');

	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');

	var newUser = new User({
		email: req.body.email,
		name: req.body.username,
		password: password
	});

	var result = {
		'success': false,
		'info': '',
		'data': {}
	};

	//验证
	if ( !verify('email', req.body.email) ) {
		result.success = false;
		result.info = '邮箱不正确';
		result.data.field = 'email';
		res.send(result);
		return;
	}

	if ( !verify('length', req.body.password) ) {
		result.success = false;
		result.info = '密码不正确';
		result.data.field = 'password';
		res.send(result);
		return;
	}

	if ( !verify('null', req.body.username) ) {
		result.success = false;
		result.info = '用户名不正确';
		result.data.field = 'username';
		res.send(result);
		return;
	}

	User.get(newUser.email, function(err, user) {

		if ( user ) {
			err = '邮箱已存在';
		}

		if ( err ) {
			result.success = false;
			result.info = err;
			result.data.field = 'email';
			res.send(result);
			return;
		}

		newUser.save(function(err, user) {

			if ( err ) {
				result.success = false;
				result.info = err;
			}

			result.success = true;
			result.info = '注册用户成功';
			result.data = user;
			req.session.user = user[0];

			res.send(result);

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
	var verify = require('../models/verify');

	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');

	var newUser = new User({
		email: req.body.email,
		name: req.body.username,
		password: password
	});

	var result = {
		'success': false,
		'info': '',
		'data': {}
	};

	//验证
	if ( !verify('email', req.body.email) ) {
		result.success = false;
		result.info = '邮箱不正确';
		result.data.field = 'email';
		res.send(result);
		return;
	}

	if ( !verify('length', req.body.password) ) {
		result.success = false;
		result.info = '密码不正确';
		result.data.field = 'password';
		res.send(result);
		return;
	}

	if ( !verify('null', req.body.username) ) {
		result.success = false;
		result.info = '用户名不正确';
		result.data.field = 'username';
		res.send(result);
		return;
	}

	User.get(newUser.email, function(err, user) {

		if ( user ) {
			err = '邮箱已存在';
		}

		if ( err ) {
			result.success = false;
			result.info = err;
			result.data.field = 'email';
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

/* add meeting */
exports.addMeeting = function(req, res) {
	var User = require('../models/user');
	var Meeting = require('../models/meeting');

	var email = req.body.email,
		id = req.body.meetingid,
		name = req.body.meetingname,
		role = req.body.meetingrole;

	var meeting = {};
	meeting['role'] = role;
	meeting['id'] = id;
	meeting['name'] = name;
	meeting['email'] = email;

	User.addMeeting(email, meeting, function(err) {

		var data = {};
		data.id = id;
		data.email = email;
		data.role = role;

		Meeting.addUsers(data, function(err) {

			var result = {
				'success': true,
				'info': '',
				'data': {}
			};		

			if ( err ) {
				result.success = false;
				result.info = err;
			} else {
				result.info = '添加会议成功';
				meeting.email = email;
				result.data = meeting;
			}

			res.send(result);
			
		});

	}); 
}

/* post del meeting */
exports.delMeeting = function(req, res) {
	var User = require('../models/user');
	var Meeting = require('../models/meeting');

	var email = req.body.email,
		id = req.body.id,
		role = req.body.role;

	var meeting = {};
	meeting['role'] = role;
	meeting['id'] = id;
	meeting['email'] = email;

	User.delMeeting(email, meeting, function(err) {

		var data = {};
		data.id = id;
		data.email = email;
		data.role = role;

		Meeting.delUsers(data, function(err) {

			var result = {
				'success': true,
				'info': '',
				'data': {}
			};		

			if ( err ) {
				result.success = false;
				result.info = err;
			} else {
				result.info = '删除会议成功';
				meeting.email = email;
				result.data = meeting;
			}

			res.send(result);

		});

	}); 

}

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

