
/*
 * GET home page.
 */

exports.index = function(req, res) {
	if ( req.session.user ) {
		res.render('index', { title: '会议通', layout: 'layout' });
	} else {
		res.render('login', { title: '会议通', layout: 'layout' });
	}
};