/* 
* 表单数据格式化 
*/

KISSY.add("modules/module-formatForm",function(S,DOM,Event,Node){

	function Mod(){

		//格式化表单格式
		function format (form) {

			var name = [],
				value = [],
				data = {};

			var input = (new Node(form)).all('input');

			input.each(function(item, index) {

				if ( DOM.hasAttr(item, 'name') ) {
					name.push( DOM.attr(item, 'name') );
					value.push( DOM.val(item) );
				}

			});

			for ( var i=name.length; i--; ) {
				data[name[i]] = value[i];
			}

			return data;
		}

		return {
			format: format
		}			
	}
    return Mod;

},{requires:["dom","event","node","sizzle"]});