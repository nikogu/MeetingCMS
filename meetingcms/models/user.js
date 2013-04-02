/*
* 用户模型 User Model
*/

var mongodb = require('./db');

function User( user ) {
	this.name = user.name;
	this.password = user.password;
	this.email = user.email,
	this.date = user.date,
	this.power = user.power || 10
}

//保存用户
User.prototype.save = function( callback ) {

	var user = {
		name: this.name,
		password: this.password,
		email: this.email,
		date: (new Date()),
		power: this.power || 10
	}

	mongodb.open(function(err, db) {
		if ( err ) {
			return callback(err);
		}

		//读取 users 集合
		db.collection('users', function(err, collection) {
			if ( err ) {
				mongodb.close();
				return callback(err);
			}

			//为 name 属性添加索引
			collection.ensureIndex({'email': 1}, { uniqure: true });

			//写入 user 文档
			collection.insert(user, {safe: true}, function(err, user) {
				mongodb.close();
				callback(err, user);
			});
		});
	});

}

//更新用户
User.update = function( email, updateObj, callback ) {

	mongodb.open(function(err, db) {
		if ( err ) {
			return callback(err);
		}

		//读取 users 集合
		db.collection('users', function(err, collection) {
			if ( err ) {
				mongodb.close();
				return callback(err);
			}

			collection.update({ email: email }, { "$set": updateObj }, function(err) {

				mongodb.close();
				callback(err);

			});

		});
	});	
}

//添加会议
User.addMeeting = function( email, meeting, callback) {

	mongodb.open(function(err, db) {
		if ( err ) {
			return callback(err);
		}

		//读取 users 集合
		db.collection('users', function(err, collection) {

			if ( err ) {
				mongodb.close();
				return callback(err);
			}

			collection.update({ email: email }, { "$addToSet": {meetings: meeting} }, function(err) {

				mongodb.close();
				callback(err);

			});

		});
	});	

}

//删除会议
User.delMeeting = function( email, meeting, callback) {

	mongodb.open(function(err, db) {
		if ( err ) {
			return callback(err);
		}

		//读取 users 集合
		db.collection('users', function(err, collection) {

			if ( err ) {
				mongodb.close();
				return callback(err);
			}

			collection.update({ email: email }, { "$pull": {"meetings": {"id": meeting['id'], "role": meeting['role']} }}, function(err) {

				mongodb.close();
				callback(err);

			});

		});
	});	

}


//获取用户
User.get = function(email, callback) {
	mongodb.open(function(err, db) {
		if ( err ) {
			return callback(err);
		}

		//读取 users 集合	
		db.collection('users', function(err, collection) {
			if ( err ) {
				mongodb.close();
				return callback(err);
			}

			//查找 name	
			collection.findOne({ email: email }, function(err, doc) {
				mongodb.close();
				if ( doc ) {
					var user = new User(doc);
					callback(err, user);
				} else {
					callback(err, null);
				}
			});
		});
	});
}

//获取用户通过参数
User.getBy = function(condition, callback) {
	mongodb.open(function(err, db) {
		if ( err ) {
			return callback(err);
		}

		//读取 users 集合	
		db.collection('users', function(err, collection) {
			if ( err ) {
				mongodb.close();
				return callback(err);
			}

			//查找 用户	
			collection.find(condition).toArray(function(err, users) {
				mongodb.close();
				callback(err, users);
			});
		});
	});
}

//获取用户通过参数
User.getUsersBy = function(emails, callback) {

	mongodb.open(function(err, db) {
		if ( err ) {
			return callback(err);
		}

		//读取 users 集合	
		db.collection('users', function(err, collection) {
			if ( err ) {
				mongodb.close();
				return callback(err);
			}

			//查找 用户	
			collection.find( {"email": {"$in":emails} } ).toArray(function(err, users) {
				mongodb.close();
				callback(err, users);
			});
		});
	});
}


// show the user of all need to be modified
User.list = function( begin, num, callback ) {

	mongodb.open(function(err, db) {
		if ( err ) {
			return callback(err);
		}
		db.collection('users', function(err, collection) {
			if ( err ) {
				mongodb.close();
				return callback(err);
			}

			//遍历数据
			var data = [];
			var _begin = Number( (begin<15 ? 1 : begin), 10 ) || 1;
			var _num = Number( (num || 15), 10);
			var sum = 0;

			collection.find().count(function(err, count) {

				sum = count;

				//这是初始值的情况，及刚开始
				if ( _begin < _num ) {

					collection.find().sort({"date": -1}).limit(_num).toArray(function(err, users) {
						mongodb.close();
						callback(err, users, sum);
					});//end limit

				} else {

					collection.find().sort({date:-1}).limit(_begin).toArray(function(err, users){
						skipUsers = users;

						collection.find({date : {"$lt": skipUsers[skipUsers.length-1].date} }).sort({"date": -1}).limit(_num).toArray(function(err, users) {
							mongodb.close();
							callback(err, users, sum);
						});//end limit

					});//end sort begin

				}

			});//end count

		});
	});	
}

// delete user
User.delete = function( email, callback ) {
	mongodb.open(function(err, db){
		if ( err ) {
			return callback(err);
		}

		db.collection('users', function(err, collection){
			if ( err ) {
				mongodb.close();
				return callback(err);
			}

			collection.remove({'email': email}, function(err, user) {
				mongodb.close();
				callback(err, user);
			});
		});
	});
}

// delete users
User.deleteAll = function( emails, callback ) {

	mongodb.open(function(err, db){
		if ( err ) {
			return callback(err);
		}

		db.collection('users', function(err, collection) {

			if ( err ) {
				return callback(err);
			}

			collection.remove({'email': {"$in": emails}}, function(err, user) {
				mongodb.close();
				callback(err, user);
			});
		});
	});	
}



module.exports = User;
