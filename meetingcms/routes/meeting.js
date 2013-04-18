
/*
 * Routes Meeting
 */

/* get */
exports.list = function(req, res) {
	var begin = req.query.begin;
	var num = req.query.num;

	var Meeting = require('../models/meeting');
	var meetinglist = Meeting.list(begin, num, function(err, list, sum) {
		var data = {
			sum: sum,
			list: list
		}
		res.send(data);
	});
};

//广场
exports.square = function(req, res) {

	var Meeting = require('../models/meeting');

	var begin = req.query.begin || 0;
	var num = req.query.num || 10;

	var user = req.session.user;

	var Meeting = require('../models/meeting');
	var meetinglist = Meeting.list(begin, num, function(err, list, sum) {
		var data = {
			sum: sum,
			list: list
		}
		res.render('square', { title:"会议通", isLogin: true, meetings: data, user: user});
		//res.send(data);
	});

}

//获取会议详细信息-封装用户信息！
exports.getDep = function(req, res) {

	var Meeting = require('../models/meeting');
	var User = require('../models/user');

	var id = req.body.id;

	Meeting.get(id, function(err, meeting) {
		var result = {
			'success': false,
			'info': '',
			'data': {}
		};

		result.data.meetingid = id;

		result.success = true;
		result.info = '查找会议成功';

		if ( err ) {
			result.success = false;
			result.info = err;
		}

		//搜索leaders
		if ( meeting.leaders && meeting.leaders.length > 0 ) {

			User.getUsersBy(meeting.leaders, function(err, users) {

				meeting.leaders  = users;

				//搜索users
				if ( meeting.users && meeting.users.length > 0 ) {
					User.getUsersBy(meeting.users, function(err, users) {

						meeting.users = users;

						if ( err ) {
							result.success = false;
							result.info = err;
						}

						result.data = meeting;
						result.data.meetingid = id;

						res.send(result);

					});
				} else {
					result.data = meeting;
					result.data.meetingid = id;

					res.send(result);
				}

			});
		} else {
			//搜索users
			if ( meeting.users && meeting.users.length > 0 ) {
				User.getUsersBy(meeting.users, function(err, users) {

					meeting.users = users;

					if ( err ) {
						result.success = false;
						result.info = err;
					}

					result.data = meeting;
					result.data.meetingid = id;

					res.send(result);

				});
			} else {
				result.data = meeting;
				result.data.meetingid = id;

				res.send(result);
			}
		}

	});

}


/* getbyname */
exports.getByName = function(req, res) {
	var name = req.body.name;

	var condition = {};
	condition['name'] = new RegExp('.*'+name+'.*','i');

	var Meeting = require('../models/meeting');

	var meetinglist = Meeting.getBy(condition, function(err, meetings) {
		var result = {
			'success': false,
			'info': '',
			'data': {}
		};

		result.success = true;
		result.info = '查找会议成功';

		if ( err ) {
			result.success = false;
			result.info = err;
		}

		if ( meetings.length < 1 ) {
			result.success = false;
			result.info = '没有查到此会议';
		}

		result.data = meetings;

		res.send(result);
	});	

}

/* gerbyuser */
exports.getByUser = function(req, res) {

	var email = req.body.email;
	var role = req.body.role;

	var condition = '{"'+role+'":"'+email+'"}';
	condition = JSON.parse(condition);

	var Meeting = require('../models/meeting');

	var meetinglist = Meeting.getBy(condition, function(err, meetings) {
		var result = {
			'success': false,
			'info': '',
			'data': {}
		};

		result.success = true;
		result.info = '查找会议成功';

		if ( err ) {
			result.success = false;
			result.info = err;
		}

		if ( meetings.length < 1 ) {
			result.success = false;
			result.info = '没有查到此会议';
		}

		result.data = meetings;

		res.send(result);
	});	
};

/* post add */
exports.add = function(req, res) {
	var Meeting = require('../models/meeting');
	
	var meeting = new Meeting({
		name : req.body.name,
		date_b : req.body.date_b,
		date_e : req.body.date_e,
		address : req.body.address,
		leaders : req.body.leaders || [],
		users : req.body.users || [],
		info : req.body.info
	});

	meeting.save(function(err, meeting) {

		var result = {
			'success': false,
			'info': '',
			'data': {}
		};

		if ( err ) {
			result.success = false;
			result.info = err;
		}

		result.success = true;
		result.info = '添加会议成功';
		result.data = meeting;

		res.send(result);

	});
};

/* post update meeting */
exports.updateMeeting = function(req, res, io) {
	var Meeting = require('../models/meeting');

	var updateKey = req.body.updatekey || "",
		updateValue = req.body.updatevalue || "",
		updateObj = JSON.parse('{"' + updateKey + '":"' + updateValue + '"}' );
		id = req.body.updateflag || "";

	Meeting.get(id, function(err, meeting) {

		var result = {
			'success': false,
			'info': '',
			'data': {}
		};		

		if ( !meeting ) {
			err = '会议信息不存在';
		} 

		if ( err ) {
			result.success = false;
			result.info = err;
			res.send(result);
			return;
		}

		//更新会议
		Meeting.update(id, updateObj, function(err){
			if ( err ) {
				result.success = false;
				result.info = err;
			}

			result.success = true;
			result.info = '更新会议成功';
			result.data = { "flag" : updateValue };

			/*
			io.sockets.on('connection', function (socket) {
  				socket.emit('updateMeeting', { data: {msg: '会议有更新'} });
			});
			*/

			res.send(result);
		});


	});

}

/* post add meeting's users */
exports.addMeetingUsers = function(req, res) {
	var Meeting = require('../models/meeting');
	var User = require('../models/user');

	var id = req.body.id,
		email = req.body.email,
		role = req.body.role,
		name = req.body.name,
		username = req.body.username;

	var data = {};
	data.id = id;
	data.email = email;
	data.role = role;

	Meeting.addUsers(data, function(err) {

		var meeting = {};
		meeting['role'] = role;
		meeting['id'] = id;
		meeting['name'] = name;
		meeting['email'] = email;

		User.addMeeting(email, meeting, function(err) {

			var result = {
				'success': false,
				'info': '',
				'data': {}
			};	
			
			if ( err ) {
				result.success = false;
				result.info = err;
			}

			result.success = true;
			result.info = '添加人员成功';
			result.data = {"name" : username, "email": email, "id": id, "role": role, 'meeting': name};

			res.send(result);

		}); 

	});

}

/* post delete meeting's users */
exports.delMeetingUsers = function(req, res) {
	var Meeting = require('../models/meeting');
	var User = require('../models/user');

	var id = req.body.id,
		email = req.body.email,
		role = req.body.role,
		name = req.body.name;

	var data = {};
	data.id = id;
	data.email = email;
	data.role = role;

	Meeting.delUsers(data, function(err) {

		var meeting = {};
		meeting['role'] = role;
		meeting['id'] = id;
		meeting['email'] = email;

		User.delMeeting(email, meeting, function(err) {

			var result = {
				'success': false,
				'info': '',
				'data': {}
			};	
			
			if ( err ) {
				result.success = false;
				result.info = err;
			}

			result.success = true;
			result.info = '删除会议成功';
			result.data = {"name" : name, "email": email, "id": id, "role": role};

			res.send(result);

		}); 

	});

}

/* post delete meetings */
exports.deleteMeeting = function(req, res) {
	var Meeting = require('../models/meeting');

	var id = req.body.data || "";

	Meeting.get(id, function(err, meeting) {

		var result = {
			'success': false,
			'info': '',
			'data': {}
		};		

		if ( !meeting ) {
			err = '会议信息不存在';
		}

		if ( err ) {
			result.success = false;
			result.info = err;
			res.send(result);
			return;
		}

		//删除会议
		Meeting.delete(id, function(err){
			if ( err ) {
				result.success = false;
				result.info = '删除会议失败';
			} else {
				result.success = true;
				result.info = '删除会议成功';
			}
			res.send(result);
		});

	});
}

/* post delete all meetings */
exports.deleteAllMeetings = function(req, res) {
	var Meeting = require('../models/meeting');

	var ids = req.body.data || "";

	//删除会议
	Meeting.deleteAll(ids, function(err, meeting){

		var result = {
			'success': false,
			'info': '',
			'data': {}
		};	

		if ( err ) {
			result.success = false;
			result.info = '删除会议失败';
		} else {
			result.success = true;
			result.info = '删除会议成功';
		}

		res.send(result);

	});
	
}

