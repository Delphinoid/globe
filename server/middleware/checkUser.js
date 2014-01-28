'use strict';

var Groups = require('../config/groups');

module.exports = function(req, res, next) {
	if (req.session && req.session.group !== Groups.GUEST) {
		return next();
	}
	else {
		return res.apiOut({code: 401, message: 'You are not authorized to view this page'}, null);
	}
};