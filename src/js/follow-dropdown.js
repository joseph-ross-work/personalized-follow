var FollowList = require('./follow-list')

/**
* A dropdown of provided topics that reflect the subscription status
* of the current user.
*/
function FollowDropdown(opts) {
    console.log('FOLLOW DROPDOWN ', opts)
    if (typeof opts.topics !== 'object') {
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
FollowDropdown.prototype.listSelector = '.lf-follow-dropdown-popover';

FollowDropdown.prototype._initialize = function() {
    console.log('INITIALIZE DROPDOWN')
    this._createButtons(this._topics);
    this._bus.addEventListener('message', this._onPostMessage);
    this._requestTopicStates();
    this.render();

    var btn = this.el.querySelector('.lf-follow-dropdown-btn');
    var body = document.querySelector('body');

    btn.addEventListener('click', this._togglePopover.bind(this));
    body.addEventListener('click', this._hidePopover.bind(this));
};

FollowDropdown.prototype._onPut = function(topics) {
    this._updateButtons(topics);
};

FollowDropdown.prototype._togglePopover = function (e) {
    e.preventDefault();
    e.stopPropagation();

    var list = this.el.querySelector(this.listSelector);
    var className = list.className;
    if (className.indexOf('hide') >= 0) {
        list.className = className.replace('hide', '');
    } else { 
        list.className = className + ' hide';
    }
};

FollowDropdown.prototype._hidePopover = function(e) {
    var list = this.el.querySelector(this.listSelector);
    var className = list.className;
    if (className.indexOf('hide') >= 0) {
        return
    } else { 
        list.className = className + ' hide';
    }
};

FollowDropdown.prototype._updateButtons = function(topics) { 
    this._buttons.forEach(function(button) {
        if(topics[button.topic]) {
            button.updateTopicState(topics[button.topic].state);
            return true;
        }
    });
};

FollowDropdown.prototype.destroy = function() {
    var btn = this.el.querySelector('.lf-follow-dropdown-btn');
    var body = document.querySelector('body');

    btn.removeEventListener('click', this._togglePopover.bind(this));
    body.removeEventListener('click', this._hidePopover.bind(this));

    FollowList.prototype.destroy.call(this);
};

module.exports = FollowDropdown; 