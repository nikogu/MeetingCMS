/* 
* 显示信息模块
*/
KISSY.add("modules/module-imessage",function(S,DOM,Event,Node){

	function Mod(){

		//格式化表单格式
		function Ms ( data ) {

			//信息显示框
			var boxAlert = Node.one('#box-alert');

			//信息显示
			if ( data.success ) {
				boxAlert.html('<span class="green-color">'+data.info+'</span>').fadeIn(1, function(){
					boxAlert.fadeOut();	
				});
			} else {
				boxAlert.html('<span class="red-color">'+data.info+'</span>').fadeIn(1, function(){
					boxAlert.fadeOut();	
				});
			}	

		}

		return {
			ms: Ms
		}
	}

   	return Mod;

},{requires:["dom","event","node","sizzle"]});	