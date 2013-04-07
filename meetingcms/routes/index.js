
/*
 * GET home page.
 */

exports.index = function(req, res) {
	var User = require('../models/user');


	if ( req.session.user ) {

		var user = req.session.user;
		var email = req.session.user.email;
		var myUser = {};

		if ( !email ) {
			res.render('login', { title: '会议通', layout: 'layout' });
			return;
		}

		User.get(email, function(err, user) {

			myUser = user;

			var data = {
				title: '会议通',
				layout: 'layout',
				user: myUser
			};
			console.log(myUser);

			res.render('person', data);

		});

	} else {
		res.render('login', { title: '会议通', layout: 'layout' });
	}
};