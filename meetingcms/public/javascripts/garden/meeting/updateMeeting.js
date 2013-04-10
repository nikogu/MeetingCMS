/*
** updateMeeting.js 
** 包含内容：更新会议代码
** 功能：更新会议
**
*/

define(function(require, exports, module) {

    var $ = require('jquery');

    var Backbone = require('backbone');

    var io = require('socket.io');

	//模型	
	var Info = Backbone.Model.extend({
		isUpdate: false,
		isSend: false
	});

	//控制视图
	var InfoView = Backbone.View.extend({
		events: {
      		"click .update" : "toggleChange",
      		"click .sure" : "send"
    	},
    	initialize: function() {

			this.updateBtn = this.$el.find('.update');
			this.valueNode = this.$el.find('.value');
			this.oldValue = '';
			this.meetingId = this.$el.attr('data-id');
			this.updateKey = this.$el.attr('data-key');

    	},
    	reset: function( val ) {
    		this.valueNode.html(val);
			this.updateBtn.removeClass('cancel').text('修改');
			this.model.isUpdate = false;
    	},
    	send: function() {

    		if ( this.model.isSend ) {
    			return;
    		}

    		this.modelisSend = true;
    		var input = this.valueNode.find('.value-input');

    		$.ajax({
				url: '/meetingupdate',
				type: 'post',
				data: {updateflag: this.meetingId, updatekey: this.updateKey, updatevalue: input.val()},
				success: $.proxy(function(data) {

					var socket = io.connect('http://localhost:8080');
    				socket.on('updateMeeting', function (data) {
    					console.log(data);
  					});

					this.model.isSend = false;
					if ( data.success ) {
						this.reset( data.data.flag );
					} else {
						alert('( ⊙ o ⊙ )啊！出错了!');
					}
				}, this)
			});

    	},
    	toggleChange: function() {

    		if ( !this.model.isUpdate ) {

    			this.model.isUpdate = true;
	    		this.oldValue = this.valueNode.text();

	    		var html = '<div class="update-box">';
				html += '<input class="value-input" type="text" name="value" value="'+this.oldValue+'" >';
				html += '<span class="sure">确认</span>';
				html += '</div>';

				//添加节点
				this.valueNode.html(html);
				this.updateBtn.addClass('cancel').text('取消');

				//异步更新事件
				var input = this.valueNode.find('.value-input');
				var sureBtn = this.valueNode.find('.sure');

    		} else {

    			this.reset( this.oldValue );

    		}
    	}
	});

	//控制集合视图
	var InfoListView = Backbone.View.extend({
    	initialize: function() {
    		this.$el.find('.info-meta .item').each(function(index, item) {
    			var infoView = new InfoView( {model: new Info, el: $(item)} );
    		});
    	}
	});

	module.exports = InfoListView;


});
	
