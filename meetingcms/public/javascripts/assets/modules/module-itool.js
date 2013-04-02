/* 
* 工具类
*/

KISSY.add("modules/module-itool",function(S,DOM,Event,Node){

	var Mod = (function(){

		function showDate( o ) {

			var objProto = Object.prototype,
				date = {},
				result = '';

			if ( objProto.toString.call(o) === '[object Date]' ) {

				date = o;

			} else if( objProto.toString.call(o) === '[object String]' ) {

				var date = new Date(o);

			} else {

				throw new Error('can not be a date');

			}

			return date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() + ' ' + date.getHours() + ':' +date.getMinutes();

		}

		return {
			showDate: showDate
		}			
	})();
    return Mod;

},{requires:["dom","event","node","sizzle"]});