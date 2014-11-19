var FollowList = require('./follow-list')

function FollowDropdown(opts) {
    if (opts.topics !== 'array' || opts.topics.length === 0) {
        return;
    }
    this._topics = opts.topics;
    opts.destroyOnUnfollow = false;
    FollowList.call(this, opts);
}

FollowDropdown.prototype = Object.create(FollowList.prototype);
FollowDropdown.prototype.constructor = FollowDropdown;
FollowDropdown.prototype.template = require('../templates/follow-dropdown.hb');

FollowDropdown.prototype._initialize = function() {
    this._createButtons(this._topics);
    this._bus.addEventListener('message', this._onPostMessage);
    this._requestTopicStates();
    this.render();
};

FollowDropdown.prototype._onGet = function (topics) {
    this._updateButtons(topics);
};

FollowDropdown.prototype._updateButtons = function(topics) { 
    _buttons.forEach(function(button) {
        if(topics[button.topic]) {
            button.updateTopicState(topics[button.topic].state);
            return true;
        }
    });
};

module.exports = FollowDropdown; 