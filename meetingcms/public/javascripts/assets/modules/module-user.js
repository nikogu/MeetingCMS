/* 
* 用户模型
*/
KISSY.add("modules/module-user", function(S,DOM,Event,Node,IO){

	function User ( name, password, email ) {
		this.name = name;
		this.password = password;
		this.email = email;
	}

	//获取用户列表
	User.list = function ( begin, num, callback ) {
		IO.get('/userlist', {"begin": begin, "num": num}, function(data) {
			callback( data );
		});
	}

   	return User;

},{requires:["dom","event","node","ajax","sizzle"]});	