
/*
 * GET list page.
 */

exports.index = function(req, res){
 	res.render('list', { title: 'Express', items:[] });
};