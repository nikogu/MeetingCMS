/* 
* 会议数据模型 Meeting Model 
*/

var mongodb = require('./db');
var ObjectID = require('mongodb').ObjectID;

function Meeting( meeting ) {
	this.name = meeting.name;
	this.date_b = meeting.date_b;
	this.date_e = meeting.date_e;
	this.date = meeting.date;
	this.address = meeting.address;
	this.leaders = meeting.leaders;
	this.users = meeting.users;
	this.info = meeting.info;
}

//保存会议
Meeting.prototype.save = function( callback ) {

	var meeting = {
		name : this.name,
		date_b : this.date_b,
		date_e : this.date_e,
		date: (new Date()),
		address : this.address,
		leaders : this.leaders,
		users : this.users,
		info : this.info
	}

	mongodb.open(function(err, db) {
		if ( err ) {
			return callback(err);
		}

		//读取 meetings 集合
		db.collection('meetings', function(err, collection) {
			if ( err ) {
				mongodb.close();
				return callback(err);
			}

			//为 _id 属性添加索引
			collection.ensureIndex({'_id': 1}, { uniqure: true });

			//写入 meeting 文档
			collection.insert(meeting, {safe: true}, function(err, meeting) {
				mongodb.close();
				callback(err, meeting);
			});
		});
	});

}

//更新会议
Meeting.update = function( id, updateObj, callback ) {

	mongodb.open(function(err, db) {
		if ( err ) {
			return callback(err);
		}

		//读取 meetings 集合
		db.collection('meetings', function(err, collection) {
			if ( err ) {
				mongodb.close();
				return callback(err);
			}

			collection.update({ _id: new ObjectID(id) }, { "$set": updateObj }, function(err) {

				mongodb.close();
				callback(err);

			});

		});
	});	
}

//添加会议用户
Meeting.addUsers = function( data, callback ) {

	var id = data.id,
		role = data.role,
		email = data.email;

	mongodb.open(function(err, db) {
		if ( err ) {
			return callback(err);
		}

		db.collection('meetings', function(err, collection) {
			if ( err ) {
				mongodb.close();
				return callback(err);
			}

			var o = JSON.parse('{"'+role+'":"'+email+'"}');

			collection.update({ _id: new ObjectID(id)}, {"$addToSet": o}, function(err) {

				mongodb.close();
				callback(err);

			});

		});

	});	
}

//删除会议用户
Meeting.delUsers = function( data, callback ) {

	var id = data.id,
		role = data.role,
		email = data.email;

	mongodb.open(function(err, db) {
		if ( err ) {
			return callback(err);
		}

		db.collection('meetings', function(err, collection) {
			if ( err ) {
				mongodb.close();
				return callback(err);
			}

			var o = JSON.parse('{"'+role+'":"'+email+'"}');

			collection.update({ _id: new ObjectID(id)}, {"$pull": o}, function(err) {

				mongodb.close();
				callback(err);

			});

		});

	});	
}

//获取会议
Meeting.get = function(id, callback) {
	mongodb.open(function(err, db) {
		if ( err ) {
			return callback(err);
		}

		//读取 meetings 集合	
		db.collection('meetings', function(err, collection) {
			if ( err ) {
				mongodb.close();
				return callback(err);
			}

			//查找 会议
			collection.findOne({ _id: new ObjectID(id) }, function(err, doc) {
				mongodb.close();
				if ( doc ) {
					var meeting = new Meeting(doc);
					callback(err, meeting);
				} else {
					callback(err, null);
				}
			});
		});
	});
}

//获取指定会议
Meeting.getBy = function(condition, callback) {
	mongodb.open(function(err, db) {
		if ( err ) {
			return callback(err);
		}
		db.collection('meetings', function(err, collection) {
			collection.find(condition).toArray(function(err, meetings) {
				mongodb.close();
				callback(err, meetings);
			});
		});

	});
}

//会议列表
Meeting.list = function( begin, num, callback ) {

	mongodb.open(function(err, db) {
		if ( err ) {
			return callback(err);
		}
		db.collection('meetings', function(err, collection) {
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

					collection.find().sort({"date": -1}).limit(_num).toArray(function(err, meetings) {
						mongodb.close();
						callback(err, meetings, sum);
					});//end limit

				} else {

					collection.find().sort({date:-1}).limit(_begin).toArray(function(err, meetings){
						var skipMeetings = meetings;

						collection.find({date : {"$lt": skipMeetings[skipMeetings.length-1].date} }).sort({"date": -1}).limit(_num).toArray(function(err, meetings) {
							mongodb.close();
							callback(err, meetings, sum);
						});//end limit

					});//end sort begin

				}

			});//end count

		});
	});	
}

// 删除会议
Meeting.delete = function( id, callback ) {
	mongodb.open(function(err, db){
		if ( err ) {
			return callback(err);
		}

		db.collection('meetings', function(err, collection){
			if ( err ) {
				mongodb.close();
				return callback(err);
			}

			collection.remove({ _id : new ObjectID(id)}, function(err, meeting) {
				mongodb.close();
				callback(err, meeting);
			});
		});
	});
}

//删除更多会议
Meeting.deleteAll = function( ids, callback ) {
	
	var _ids = [];
	ids.forEach(function(item){
		_ids.push(new ObjectID(item));
	});

	mongodb.open(function(err, db){
		if ( err ) {
			return callback(err);
		}

		db.collection('meetings', function(err, collection) {

			if ( err ) {
				return callback(err);
			}

			collection.remove({_id: {"$in": _ids}}, function(err, meeting) {
				mongodb.close();
				callback(err, meeting);
			});
		});
	});	
}



module.exports = Meeting;
