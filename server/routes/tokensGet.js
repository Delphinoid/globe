(/**
 * Create a session for a user based on their login status with other sites
 * Returns a token that can be used to continue this session for future requests
 * @param futurismServer
 */

function() {
	'use strict';

	var request = require('request');
	var fns = require('../fns/fns');
	var session = require('../fns/mongoSession');
	var async = require('async');
	var User = require('../models/user');
	var groups = require('../fns/groups');


	module.exports = function(req, res) {

		var verifiedData;
		var body = req.body;
		var valid;


		async.series([


			//--- send credentials to GameHub server to verify they are real
			function(callback) {
				body.ip = fns.getIp(req);
				body.game = 'futurism';
				body.pass = process.env.GAMEHUB_KEY;
				body.max_width = 0;
				body.max_height = 0;
				if(body.site === 'g') {
					body.user_id = body.guest_user_id;
					body.user_name = body.guest_user_name;
				}

				var authUrl = 'http://gamehub.jiggmin.com/login.php?' + fns.objToUrlParams(body);
				request(authUrl, function(err, resp, _valid_) {
					valid = _valid_;
					return callback(err);
				});
			},


			//--- parse the incoming data from GameHub
			function(callback) {
				try {
					verifiedData = JSON.parse(valid);
				}
				catch (e){
					return callback(e);
				}

				if(process.env.NODE_ENV === 'staging') {
					if(!verifiedData.beta) {
						return callback('You must be a member of our Beta Testers to access this.');
					}
				}

				return callback(null);
			},


			//--- save the user in the db
			function(callback) {
				var v = verifiedData;
				User.findByIdAndSave({
					_id: v.user_id,
					name: v.user_name,
					group: powerToGroup(v.power),
					site: v.site
				}, callback);
			},


			//--- start the session
			function(callback) {
				var v = verifiedData;
				session.make({userId: v.user_id}, callback);
			}
		],


		//--- tell it to the world
		function(err, results) {
			if(err) {
				return res.apiOut(err, null);
			}

			var user = JSON.parse(JSON.stringify(results[2]));
			user.token = results[3].token;
			return res.apiOut(null, user);
		});


		/**
		 * Convert power (0-3) to group (g,u,m,a)
		 * The gamehub login system assigns a power to users. Higher power = more moderator privileges
		 * Futurism uses groups to do the same thing, so this function turns gamehub powers into futurism groups
		 * @param {number} power
		 * @returns {string}
		 */
		var powerToGroup = function(power) {
			var group = groups.GUEST;
			if(power === 1) {
				group = groups.USER;
			}
			if(power === 2) {
				group = groups.MOD;
			}
			if(power === 3) {
				group = groups.ADMIN;
			}
			return group;
		};
	};


}());