var nameDisplayDoc = require('./nameDisplayDoc');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var isNameDisplay = require('../../validators/isNameDisplay');

var ReportSchema = new Schema({
	type: {
		type: String,
		enum: ['message', 'chat', 'card'],
		required: true
	},
	data: {
		type: mongoose.Schema.Types.Mixed,
		required: true
	},
	fromUser: {
		type: nameDisplayDoc,
		validate: isNameDisplay,
		required: true
	},
	created: {
		type: Date,
		expires: 60*60*7,
		default: Date
	},
	seen: {
		type: Boolean,
		default: false
	}
});

module.exports = ReportSchema;