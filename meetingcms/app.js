
/**
 * app入口
 */

    var express   = require('express'),
        partials  = require('express-partials'),
        routes    = require('./routes'),
        user      = require('./routes/user'),
        meeting   = require('./routes/meeting'),
        admin     = require('./routes/admin'),
        http      = require('http'),
        path      = require('path'),
        util      = require('util');


var MongoStore = require('connect-mongo')(express);
var settings   = require('./settings');

//express实例
var app = express();

//配置
app.configure(function(){

    //端口号
    app.set('port', process.env.PORT || 3000);

    //视图路径
    app.set('views', __dirname + '/views');

    //视图引擎
    app.set('view engine', 'ejs');

    //视图片段
    app.use(partials());

    //
    app.use(express.favicon());

    //日志记录器
    app.use(express.logger('dev'));

    //解析客户端请求中间件，主要用于post
    app.use(express.bodyParser());

    //支持定制的HTTP方法中间件
    app.use(express.methodOverride());

    //cookie-将解析和存储 cookie 数据于 req.cookies
    app.use(express.cookieParser());

    //sesstion
    app.use(express.session({
        secret: settings.cookieSecret,
        store: new MongoStore({
            db: settings.db 
        })
    }));

    //路由控制器
    app.use(app.router);

    //静态文件支持
    app.use(express.static(path.join(__dirname, 'public')));
});

//开发模式
app.configure('development', function(){

    //错误控制器
    app.use(express.errorHandler());
});

/* 
* 路由状态转换 后台
*/
app.get('/admin', admin.index);

//用户
app.get('/userlist', user.list);
app.post('/useradd', user.addUser);
app.post('/userdelete', user.deleteUser);
app.post('/userdeleteall', user.deleteAllUsers);
app.post('/userupdate', user.updateUser);
app.post('/userupdateps', user.updatePS);
app.post('/usergetby', user.getUserBy);
app.post('/usersgetby', user.getUsersBy);

//会议
app.get('/meetinglist', meeting.list);
app.post('/meetingadd', meeting.add);
app.post('/meetingdelete', meeting.deleteMeeting);
app.post('/meetingdeleteall', meeting.deleteAllMeetings);
app.post('/meetingupdate', meeting.updateMeeting);
app.post('/meetingaddusers', meeting.addMeetingUsers);
app.post('/meetingdelusers', meeting.delMeetingUsers);


/* 
* 路由状态转换 前台 
*/
app.get('/', routes.index);
app.get('/list', require('./routes/list').index);
app.post('/userlogin', user.doLogin);
app.get('/userlogout', user.logout);
app.get('/userreg', user.reg);
app.post('/userreg', user.doReg);

//启动服务
http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});
