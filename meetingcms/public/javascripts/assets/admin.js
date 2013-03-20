/* 
* admin js 
* 会议CMS后台管理入口函数
*/

/* 模块配置 */
KISSY.config({
    packages:[
        {
            name:"modules",
            path:"../javascripts/assets/",
            debug: true 
        }
    ]
});


/* 入口 */
KISSY.ready(function(S) {


	/*
	* 删除数据命令
	*/
	var CommandDel = (function() {

		//存放命令的栈
		var stack = [];

		//添加一个命令
		function push() {

			//clear
			stack = [];

			if ( arguments.length < 1 ) {
				throw new Error('CommandDel push arguments must have one.');
			} 

			//保存这个命令的函数和参数
			var fn = arguments[0],
				args = Array.prototype.splice.call(arguments, 1);

			stack.push( {fn:fn, args: args} );
		}

		//调用这个命令
		function exec( callback ) {

			var o = {};

			//触发命令
			if ( stack.length > 0 ) {
				o = stack.pop();
				o['fn'].apply(null, o['args']);
			}

			//有回调的话执行回调
			if ( callback ) {
				callback();
			}

		}

		return {
			push: push,
			exec: exec
		}

	})();
	window._CommandDel = CommandDel;


	/*
	* 确认删除
	*/
	KISSY.use('dom,event,node,ajax,xtemplate',function(S,DOM,Event,Node,IO,XTemplate){

		var trigger = Node.one('#affirm-del-modal').one('.btn-primary'),
			close = Node.one('#affirm-del-modal').one('.close');

		trigger.on('click', function() {

			//寻找command里面的的事件
			window._CommandDel.exec(function(){
				Event.fire(close, 'click');
			});

		});

	});


	/*
	* 模板渲染
	*/
	KISSY.use('dom,event,node,ajax,xtemplate,calendar,modules/module-itool',function(S,DOM,Event,Node,IO,XTemplate,Calendar,iTool){

		var link = Node.one('.top-nav').all('a');

		function init() {

			//选择日历
			if ( Node.one('#wrap-date-begin') ) {
				var calendarBegin = new Calendar('#wrap-date-begin'),
					inputBegin = Node.one('#input-date-begin'),
					calendarEnd = new Calendar('#wrap-date-end'),
					inputEnd = Node.one('#input-date-end');

				calendarBegin.show();
				calendarEnd.show();

				calendarBegin.on('select', function(e){
					inputBegin.val(iTool.showDate(e.date));
				});
				calendarEnd.on('select', function(e){
					inputEnd.val(iTool.showDate(e.date));
				});
			}

		}

		function dataListRender( href, tpl, callback ) {

			//渲染模板
			var tplTo = Node.one('#data-content');

			//增加模板函数
			XTemplate.addCommand('toDate', function (scopes, option) {
				var date = new Date(option.params[0]);
            	return date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
        	});

			//获取数据渲染模板
			IO.get(href, function(data) {

				var sum = data.sum;
				var pageObj = [];
				var num = 15;

				//每页15个
				var pageNum = Math.ceil(sum/num);

				//构建对象
				for ( var i = 0; i < pageNum; i++ ) {

					var obj = {
						begin: i*num,
						index: i,
						num: 15
					}

					pageObj.push(obj);
				}

				data.max = pageNum - 1;
				data.last = sum < num ? sum : Math.floor(sum/num)*num;
				data.sum = pageObj;

				var render = (new XTemplate(tpl)).render( {'data': data} );

				tplTo.html(render);

				callback();

			});

		}

		//侧边栏点击
		link.on('click', function(e) {

			//阻止默认事件			
			e.preventDefault();

			if ( DOM.hasClass('disabled') ) {
				return;
			}

			//取到目标模板 & 数据连接
			var target = e.target,
				tpl = DOM.attr(target, "data-tpl"),
				href = target.href || '';

			DOM.addClass(target, 'disabled');

			if ( tpl === undefined ) {
				return;
			}

			//渲染模板
			dataListRender( href, Node.one('#'+tpl).html(), function() {

				try {
					init();
				} catch (e) {
					console.log(e);
				}

				DOM.removeClass(target, 'disabled');
			});

		});//end click

	});//end


	/*
	* 全选 & 选择加亮
	*/
	KISSY.use('dom,event,node',function(S,DOM,Event,Node){

		Event.delegate(document, 'change', '.option-chooseAll', function(e) {

			var target = e.target,
				itemClass = DOM.attr(target, 'data-chooseItem'),
				itemNode = Node.all('.'+itemClass),
				isChecked = target.checked;

			itemNode.each(function(item, index){
				item[0].checked = isChecked ? true : false;
				if ( item[0].checked ) {
					DOM.addClass(DOM.parent(item[0], 'tr'), 'active');
				} else {
					DOM.removeClass(DOM.parent(item[0], 'tr'), 'active');
				}
			});

		});

		Event.delegate(document, 'change', '.item-choose', function(e) {

			var target = e.target,
				parent = DOM.parent(target, 'tr');

			if ( target.checked ) {
				DOM.addClass(parent, 'active');
			} else {
				DOM.removeClass(parent, 'active');
			}

		});		

	});	

	/*
	* 添加信息
	*/
	KISSY.use('dom,event,node,ajax,xtemplate,modules/module-formatForm,modules/module-imessage,modules/module-data',function(S,DOM,Event,Node,IO,XTemplate,xForm,imessage,xData){

		//增加模板函数
		XTemplate.addCommand('toDate', function (scopes, option) {
			var date = new Date(option.params[0]);
           	return date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
       	});

       	//添加数据回调
       	function addData(e) {
       		//添加数据
			xData.add(e, function(data) {

				//提示信息
				(new imessage()).ms(data);

				if ( data.success ) {

					//显示新加的用户信息
					var tpl = Node.one('#'+data.tpl).html();
					var tplTo = Node.one('#data-list').one('tbody');
					var render = (new XTemplate(tpl)).render( data.data[0] );
					tplTo.prepend(render);

				}//end if

			});
       	}

		//添加数据
		Event.delegate(document, 'click', '.option-add', function(e) {

			e.preventDefault();

			//添加数据
			addData(e);

		});

	});//end

	/* 
	* 删除数据 
	*/
	KISSY.use('dom,event,node,ajax,xtemplate,json,modules/module-imessage,modules/module-data',function(S,DOM,Event,Node,IO,XTemplate,JSON,imessage,xData){

		//删除方法
		function dataRemove(e) {

			xData.remove(e, function(data, target) {

				(new imessage()).ms(data);

				( new Node(DOM.parent(target, 'tr')) ).hide();
					
			});

		}

		//点击option-delete触发删除
		Event.delegate(document, 'click', '.option-delete', function(e) {

			//阻止默认事件
			e.preventDefault();

			window._CommandDel.push(dataRemove, e);
		});

	});

	/* 
	* 删除所有数据 
	*/
	KISSY.use('dom,event,node,ajax,xtemplate,json,modules/module-imessage,modules/module-data',function(S,DOM,Event,Node,IO,XTemplate,JSON,imessage,xData){

		function dataRemoveAll(e) {

			xData.removeAll(e, function(data, result) {

				//提示信息
				(new imessage()).ms(data);

				//删除节点
				(new Node(result)).each(function(item, index) {
					(new Node(DOM.parent(item, 'tr'))).remove();
				});

			});

		}

		//添加数据
		Event.delegate(document, 'click', '.option-deleteAll', function(e) {

			//阻止默认事件
			e.preventDefault();

			window._CommandDel.push(dataRemoveAll, e);

		});

	});

	/*
	* 更新数据
	*/
	KISSY.use('dom,event,node,ajax,xtemplate,json,modules/module-imessage,modules/module-data',function(S,DOM,Event,Node,IO,XTemplate,JSON,imessage,xData){

		//更新数据
		function dataUpdata (e) {

			var target = e.target,
				parent = DOM.parent(target, 'td'),
				updateWrap = (new Node(parent)).one('.value'),
				updateKey = DOM.attr(updateWrap, 'data-updateKey'),
				updateValue = DOM.text(updateWrap),
				updateInput = {},
				updateFlag = DOM.attr(updateWrap, 'data-flag'),
				str = '<input class="update-input" type="text" value="' + updateValue + '" >',
				url = DOM.attr(updateWrap, 'data-url'),
				isFlag = DOM.attr(updateWrap, 'data-isflag') ? true : false;

			//如果已经在修改了
			if ( DOM.hasClass(updateWrap, 'isUpdating') ) {
				Event.fire(updateInput, 'focus');
				return;
			}

			//添加连续阻碍
			DOM.addClass(updateWrap, 'isUpdating');

			//替换成input便于输入数据
			updateWrap.html(str);
			updateInput = (new Node(parent)).one('.update-input')
			Event.fire(updateInput, 'focus');

			//触发
			Event.on(updateInput, 'blur', function(e) {

				xData.update(e, function(data, target) {

					DOM.removeClass(updateWrap, 'isUpdating');

					//如果更新的是flag则需要更新全部有关数据
					if ( isFlag ) {
						var tr = DOM.parent(target, 'tr');
						var items = (new Node(tr)).all('.value');

						//更新标示
						items.each(function(item, index) {
							DOM.attr(item, {'data-flag': data.data.flag || updateFlag});
						});
					}

					//提示信息
					(new imessage()).ms(data);

				});	

			}, updateValue);

		}


		//更新
		Event.delegate(document, 'click', '.option-update', function(e) {

			dataUpdata(e);

		});

	});


	/*
	* 更新密码 
	*/
	KISSY.use('dom,event,node,ajax,xtemplate,modules/module-imessage,json,modules/module-formatForm,modules/module-data,sizzle',function(S,DOM,Event,Node,IO,XTemplate,imessage,JSON,xForm,xData){


		//打开修改框
		function openBOX ( e ) {
			var form = Node.one('#change-ps-form'),
				target = e.target,
				parent = DOM.parent(target, 'td'),
				wrapNode = (new Node(parent)).one('.value'),
				flag = DOM.attr(wrapNode, 'data-flag'),
				btn = Node.one('#change-ps-sure'),
				title = Node.one('#change-ps-title span');

			//修改弹出框的标示，确认当前修改的用户
			form[0]._td = parent;
			title.html(flag);
			Node.one('#change-ps-flag').val(flag);
		}

		//触发修改密码
		function changePS ( e ) {

			var form = Node.one('#change-ps-form'),
				target  = e.target;

			if ( DOM.hasClass(target, 'disabled') ) {
				return;	
			}

			DOM.addClass(target, 'disabled');
			form.fire('submit');

		}

		//修改密码
		function changeSub ( e ) {

			var form = e.target,
				nodeWrap = (new Node(form._td)).one('.value');

			xData.update(e, function(data) {

				//提示信息
				(new imessage()).ms(data);

				if ( data.success ) {
					nodeWrap.html(data.data.flag);
				}

			});
		}

		Event.delegate(document, 'click', '.option-changeps', function(e) {

			openBOX(e);

		});

		Event.delegate(document, 'click', '#change-ps-sure', function(e) {

			changePS(e);

		});


		Event.delegate(document, 'submit', '#change-ps-form', function(e) {

			changeSub(e);

			return false;

		});

	});

	/*
	* 分页
	*/
	KISSY.use('dom,event,node,ajax,xtemplate,json,modules/module-imessage,modules/module-data,sizzle',function(S,DOM,Event,Node,IO,XTemplate,JSON,imessage,xData) {

		//数据分页
		function pagination ( e ) {

			var target = e.target,
				index = DOM.attr(target, 'data-index'),
				current = index;

			//改变类别-状态
			DOM.removeClass(Node.all('.data-pagenav .disabled'), 'disabled');	
			DOM.addClass( Node.all('.data-pagenav li[data-index="'+index+'"]'), 'disabled');

			xData.getList(e, function(data) {

				//渲染模板
				var tpl = Node.one('#'+data.tpl).html(),
					tplTo = Node.one('#data-list').one('tbody'),
					render = {},
					html = '';

				data.list.forEach(function(item, index) {
					render = (new XTemplate(tpl)).render( item );
					html += render;
				});

				tplTo.html(html);

			});

		}

		//分页点击
		Event.delegate(document, 'click', '.data-pagenav .item', function(e) {

			e.preventDefault();

			pagination(e);

		});

	});

	/*
	* 会议管理-添加用户
	*/
	KISSY.use('dom,event,node,ajax,xtemplate,json,sizzle',function(S,DOM,Event,Node,IO,XTemplate,JSON) {

		//读取用户
		function getUsers( emails, callback ) {

			var url = '/usersgetby';

			new IO({
				url: url,
				type: 'post',
				data: {emails: emails}, 
				success: function(data) {
					callback(data);
				}

			});

		}

		//打开添加窗口，设置标示
		Event.delegate(document, 'click', '.update-users', function(e) {
			var target = e.target,
				role = DOM.attr(target, 'data-role') || '',
				flag = DOM.attr(target, 'data-flag') || '',
				users = DOM.attr(target, 'data-users') || undefined;

			//保存相关节点
			Node.one('#edit-meeting-users')[0]._usernode = target;

			//设置标示属性
			DOM.attr( Node.one('#edit-meeting-users'), {'data-edit-role': role, 'data-edit-flag': flag} );

			//显示已有用户
			if ( users ) {

				getUsers(users, function(data) {

					var tplTo = Node.one('#edit-meeting-users').one('.users-list'),
						tpl = Node.one('#user-list-tpl').html(),
						render = '';

					if ( !data ) {
						tplTo.html('<li class="item no-users"><p>没有用户</p></li>');
						return;
					}

					for ( var i=0,len=data.length; i<len; i++ ) {

						render += (new XTemplate(tpl)).render( data[i] );
					}

					tplTo.html(render);

				});
			} else {

				var tplTo = Node.one('#edit-meeting-users').one('.users-list');
				tplTo.html('<li><p class="item no-users">没有用户</p></li>');

			}

		});

		//搜索用户
		function searchUsers( o, condition, callback ) {

			var condition = condition,
				url = '/usergetby';

			new IO({
				url: url,
				type: 'post',
				data: {
					condition: condition,
					key: o.key,
					value: o.value
				},
				success: function(data) {

					callback(data);

				}
			});

		}

		//提交搜索转换
		Event.delegate(document, 'submit', '#search-user-form', function(e) {

			var target = e.target,
				value = Node.one('#search-user').val();

			var o = {};
			o.key = 'name';
			o.value = value;

			searchUsers( o, undefined, function(data) {

				var _data = {};
				_data.data = data;
				
				var tplTo = Node.one('#edit-meeting-users').one('.search-list');

				if ( _data.data ) {

					var tpl = Node.one('#search-user-list-tpl').html(),
						render = (new XTemplate(tpl)).render( _data );

					tplTo.html(render);	

				} else {

					tplTo.html('<li><p>没有找到你需要的结果</p></li>');

				}

			});

			return false;
		});

		//data : id=xxx;email=xxx;role=xxx;name=xxxx;
		//添加用户到会议
		function addUserToMeeting( data, callback ) {

			var url = '/meetingaddusers';

			new IO({
				url: url,
				type: 'post',
				data: data,
				success: function(data) {
					callback(data);
				}
			});

		}

		Event.delegate(document, 'click', '.operate-add-user', function(e) {

			var wrap = Node.one('#edit-meeting-users');

			var target = e.target,
				email = DOM.attr(target, 'data-flag'),
				name = DOM.attr(target, 'data-userName'),
				id = DOM.attr(wrap, 'data-edit-flag'),
				role = DOM.attr(wrap, 'data-edit-role'),
				data = {'id': id, 'email': email, 'role': role, 'name': name};

			addUserToMeeting( data, function(data) {

				if ( data.data ) {

					//更新email
					if ( data.data.email ) {
						var old = DOM.attr(wrap[0]._usernode, 'data-users');
						old += ','+data.data.email;
						DOM.attr(wrap[0]._usernode, {'data-users': old});
					}

					//删除提示
					DOM.remove('#edit-meeting-users .no-users');

					//渲染模板
					var tplTo = Node.one('#edit-meeting-users').one('.users-list'),
						tpl = Node.one('#user-list-tpl').html(),
						render = (new XTemplate(tpl)).render( data.data );

					tplTo.prepend(render);
				}

			});

		});//end add users


		//delete user from meeting
		function delUserForMeeting( data, callback ) {
			var url = '/meetingdelusers';

			new IO({
				url: url,
				type: 'post',
				data: data,
				success: function(data) {
					callback(data);
				}
			});

		}

		Event.delegate(document, 'click', '.operate-del-user', function(e) {

			var wrap = Node.one('#edit-meeting-users');

			var target = e.target,
				parent = DOM.parent(target, '.item'),
				email = DOM.attr(target, 'data-flag'),
				name = DOM.attr(target, 'data-userName'),
				id = DOM.attr(wrap, 'data-edit-flag'),
				role = DOM.attr(wrap, 'data-edit-role'),
				data = {'id': id, 'email': email, 'role': role, 'name': name};

			delUserForMeeting(data, function(data){


				if ( data.data ) {

					//删除该节点
					DOM.remove(parent);

					//更新email
					if ( data.data.email ) {
						var old = DOM.attr(wrap[0]._usernode, 'data-users');

						old = old.split(',');
						old = old.filter(function(item){
							return item !== data.data.email;
						});
						old = old.join(',');

						DOM.attr(wrap[0]._usernode, {'data-users': old});
					}

				}

			});

		});

	});

	/*
	* 会议管理-更新日期
	*/
	KISSY.use('dom,event,node,ajax,xtemplate,json,calendar,modules/module-itool,sizzle',function(S,DOM,Event,Node,IO,XTemplate,JSON,Calendar,iTool) {

		var iCalendar;

		(function(){

			var single;

			iCalendar = function iCalendar( select ) {

				if ( single ) {
					return single;
				}
				
				this.wrap = '';
				this.select = select;
				this.calendar = '';
				this.parentOffset = '';
				this.changeTo = '';

				this.buildCalendar = function( callback ) {
					this.calendar = new Calendar(this.select);
					this.selectCalendar();
					callback(this);
				};

				this.selectCalendar = function() {
					var that = this;
					this.calendar.on('select', function(e){

						that.updateo.updatevalue = iTool.showDate(e.date);

						//ajax 修改
						updateDate(that.updateo, function(){
							(new Node(that.changeTo)).html(iTool.showDate(e.date));
						});
					});
					this.selectCalendar = function(){};
				};

				this.render = function( callback ) {
					if (this.calendar) {
						callback(this);
					} else {
						this.buildCalendar(callback);
					}
				};

				single = this;

			}

		})();

		function updateDate ( o, callback ) {

			var url = '/meetingupdate';

			console.log(o);

			new IO({
				url: url,
				type: 'post',
				data: o,
				success: function( data ){
					callback(data);
				}
			})
		}

		Event.delegate(document, 'click', '.update-date', function(e) {

			var icalendar = new iCalendar("#update-date-calendar");

			if ( !icalendar.wrap ) {
				icalendar.wrap = Node.one('#update-date-calendar-wrap');
				icalendar.parentOffset = DOM.offset('#content');
			}

			var target = e.target,
				parent = DOM.parent(target,'td'),
				changeNode = (new Node(parent)).one('.value'),
				offset = DOM.offset(target),
				top = offset.top - icalendar.parentOffset.top,
				left = offset.left - icalendar.parentOffset.left-100,
				flag = DOM.attr(target, 'data-flag'),
				key = DOM.attr(target, 'data-updateKey'),
				o = {
					updatekey: key,
					updatevalue: '',
					updateflag: flag
				};


			icalendar.changeTo = changeNode;		
			icalendar.updateo = o;

			icalendar.render(function(that){
				DOM.css(that.wrap, {'top': top, 'left': left});
				DOM.show(that.wrap);
			});

		});

		Event.delegate(document, 'click', '.operate-close', function(e) {
			var target = e.target;

			//cache
			if ( !target._closeTg ) {
				target._closeTg = Node.all(DOM.attr(target, 'data-target'));
			}

			DOM.hide(target._closeTg);

		});

	});


});//end ready
