'use strict';

var _ = require('lodash');

var isName = function(val) {
	if(val === undefined) {
		return true;
	}
	if(!_.isString(val)) {
		return false;
	}
	return (val.length > 0 && val.length <= 40);
};

module.exports = isName;