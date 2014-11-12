require('../less/personalized-follow.less');

var hub = require('./follow-hub');
var btn = require('./follow-button');
var dropdown = require('./follow-dropdown');
var ftl = require('./follow-topic-list');

module.exports = {
    hub: hub,
    button: btn,
    dropdown: dropdown,
    topicList: ftl
};
