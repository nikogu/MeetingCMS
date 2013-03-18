/* 
* 数据模型
*
* add : 添加数据，两个参数e(事件),callback(回调)
* 
*
*/
KISSY.add("modules/module-data", function(S,DOM,Event,Node,IO,xForm){

	var Data = {

		add: function( e, callback ) {

			//trigger - form
			var optionAdd = e.target,
				dataForm = DOM.attr(optionAdd, 'data-form'),
				form = Node.one('#'+dataForm),
				tpl = DOM.attr(optionAdd, 'data-tpl');

			//if not form 
			if ( form[0] === undefined ) {



			} else {

				//监听submit事件
				form.on('submit', function(e) {

					var data = (new xForm()).format(this),
						url = DOM.attr(e.target, 'action');

					//避免重复请求
					if ( (new Node(optionAdd)).hasClass(e.target, 'disabled') ) {
						return false;	
					}

					//是否有请求的标示
					DOM.addClass(optionAdd, 'disabled');

					//ajax提交
					IO.post(url, data, function(data){

						//取消标记
						DOM.removeClass(optionAdd, 'disabled');

						data.tpl = tpl;

						//扩展操作 回调
						callback(data);


					});	

					//解绑事件
					form.detach('submit');

					//阻止表单提交，ajax提交
					return false;
				});

				//触发事件
				Event.fire(form, 'submit');

			}//end if

			

		},
		update: function(e, callback, originalVal) {

			var target = e.target;

			if ( target.nodeName.toLowerCase() === 'form') {

				//如果是表单的话
				//直接获取它的data，以及action作为url
				(function( form, callback ) {

					var	data = (new xForm()).format(form),
					url = DOM.attr(form, 'action'),
					btn = Node.one('#change-ps-sure');

					new IO({
						url: url,
						type: 'post',
						data: data,
						success: function(data) {

							DOM.removeClass(btn, 'disabled');
							callback(data);

						}
					});

				})( target, callback );

			} else {

				//需要在dom上设置标示来指定更新的数据以及路径等
				var send = {},
					updateWrap = new Node(DOM.parent(target, '.value')),
					updateKey = DOM.attr(updateWrap, 'data-updateKey'),
					updateFlag = DOM.attr(updateWrap, 'data-flag'),
					url = DOM.attr(updateWrap, 'data-url');

				//获取最新值
				var updateValue = target.value || originalVal;

				//恢复文本
				updateWrap.html(updateValue);

				send['updateflag'] = updateFlag;
				send['updatekey'] = updateKey;
				send['updatevalue'] = updateValue;

				new IO({
					url: url,
					type: 'post',
					data: send,
					success: function(data) {

						callback(data, updateWrap);

					}
				});

			}//end if
			
		},
		get: function() {

		},
		getList: function(e, callback) {

			var target = e.target,
				parent = DOM.parent(target, 'li'),
				begin = DOM.attr(target, 'data-begin'),
				num = DOM.attr(target, 'data-num'),
				url = DOM.attr(target, 'href'),
				tpl = DOM.attr(target, 'data-tpl');

			//获取数据
			IO.get(url, {"begin": begin, "num": num}, function(data) {

				data.tpl = tpl;

				callback(data);

			});
		},
		remove: function(e, callback) {

			var target = e.target,
				dataValue = DOM.attr(target, 'data-flag') || '',
				url = DOM.attr(target, 'data-url') || target.href ;

			if ( DOM.hasClass(target, 'disabled') ) {
				return;	
			}

			DOM.addClass(target, 'disabled');

			//post
			new IO({
				url: url,	
				type: "post",
				data: {'data': dataValue},
				success: function(data) {

					DOM.removeClass(target, 'disabled');

					callback(data, target);

				}
			})

		},
		removeAll: function(e, callback) {

			//获取数据
			var target = e.target,
				url = DOM.attr(target, 'data-url'),
				itemClass = DOM.attr(target, 'data-deleteItem'),
				itemNode = Node.all('.'+itemClass),
				result = [],
				resultNode = [];

			if ( DOM.hasClass(target, 'disabled') ) {
				return;
			} 

			DOM.addClass(target, 'disabled');

			//获得每个节点
			itemNode.each(function(item, index){

				if ( item[0].checked ) {
					resultNode.push(item[0]);
					result.push(DOM.attr(item[0], 'data-flag'));
				}

			});

			if ( result.length > 0 ) {
				new IO({
					url: url,
					type: 'post',
					data: {'data': result},
					success: function(data) {

						//取消标记
						DOM.removeClass(target, 'disabled');

						callback(data, resultNode);

					}
				})
			} else {
				//取消标记
				DOM.removeClass(target, 'disabled');
			}

		}

	}

   	return Data;

},{requires:["dom","event","node","ajax","./module-formatForm","sizzle"]});	