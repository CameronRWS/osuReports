var config = require('../config');
var Twit = require('twit');

var T = new Twit(config);

module.exports = T;