'use strict';

module.exports = function (globe) {

    require('./guildRoutes')(globe);

    var groups = require('./config/groups');

    // endpoints
    var apprentice = require('./routes/apprentice');
    var apprentices = require('./routes/apprentices');
    var avatars = require('./routes/avatars');
    var ban = require('./routes/ban');
    var bans = require('./routes/bans');
    var friend = require('./routes/friend');
    var friends = require('./routes/friends');
    var moderator = require('./routes/moderator');
    var moderators = require('./routes/moderators');
    var modLogs = require('./routes/modLogs');
    var tests = require('./routes/tests');

    // middleware
    var checkAdmin = require('./middleware/checkAdmin');
    var checkMod = require('./middleware/checkMod');
    var checkServer = require('./middleware/checkServer');
    var rateLimit = require('./middleware/rateLimit');
    var continueSession = require('./middleware/continueSession');
    var loadUser = require('./middleware/loadUser');
    var loadMyself = require('./middleware/loadMyself');


    // routes
    require('./routes/conversations').init(globe);
    require('./routes/messages').init(globe);
    require('./routes/users').init(globe);
    require('./routes/reports').init(globe);
    require('./routes/notifications').init(globe);
    require('./routes/sessions').init(globe);

    globe.get('/avatars/:filename', avatars.get);

    globe.get('/bans', bans.get);
    globe.get('/bans/:userId', loadUser(), ban.get);
    globe.post('/bans/:userId', continueSession, checkMod, rateLimit('post:bans'), loadUser(), ban.post);
    globe.del('/bans/:userId/:banId', continueSession, checkMod, rateLimit('delete:bans'), loadUser(), ban.del);

    globe.get('/friends', continueSession, loadMyself, friends.get);
    globe.get('/friends/:userId', continueSession, loadMyself, friend.get);
    globe.put('/friends/:userId', continueSession, loadMyself, loadUser(), friend.put);
    globe.del('/friends/:userId', continueSession, loadMyself, friend.del);

    globe.get('/tests', tests.get);

    globe.get('/moderators', moderators.get);
    globe.get('/moderators/:userId', loadUser(groups.MOD), moderator.get);
    globe.put('/moderators/:userId', continueSession, checkAdmin, rateLimit('put:moderator'), loadUser(groups.APPRENTICE), moderator.put);
    globe.del('/moderators/:userId', continueSession, checkAdmin, loadUser(groups.MOD), moderator.del);

    globe.get('/mod-logs', modLogs.getList);
    globe.get('/mod-logs/:modLogId', modLogs.get);

    globe.get('/apprentices', apprentices.get);
    globe.get('/apprentices/:userId', loadUser(groups.APPRENTICE), apprentice.get);
    globe.put('/apprentices/:userId', continueSession, checkMod, rateLimit('put:apprentice'), loadUser(groups.USER), apprentice.put);
    globe.del('/apprentices/:userId', continueSession, checkMod, loadUser(groups.APPRENTICE), apprentice.del);
};