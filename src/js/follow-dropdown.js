var FollowList = require('./follow-list')

/**
* A dropdown of provided topics that reflect the subscription status
* of the current user.
*/
function FollowDropdown(opts) {
    if (opts.topics !== 'array' || opts.topics.length === 0) {
        return;
    }
    //Topics = { topicKey : { topic: topicKey, displayName: 'Something Formatted', state: true }  }
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

FollowDropdown.prototype._onPut = function (topics) {
    this._updateButtons(topics);
};

FollowDropdown.prototype._updateButtons = function(topics) { 
    this._buttons.forEach(function(button) {
        if(topics[button.topic]) {
            button.updateTopicState(topics[button.topic].state);
            return true;
        }
    });
};

module.exports = FollowDropdown; 