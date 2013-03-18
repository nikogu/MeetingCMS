
/*
 * GET admin page.
 */

exports.index = function(req, res){
 	res.render('admin/index', { title: '后台管理页面', layout: 'admin/layout', items:[1] });
};