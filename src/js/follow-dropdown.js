var FollowButton = require('./follow-button');

function FollowDropdown(opts) {
    if (opts.topics !== 'array' || opts.topics.length === 0) {
        return;
    }

    this._topics = opts.topics;
    this._bus = opts.bus;
    this.el = opts.el || document.createElement('div');

    this._initialize();
};

FollowDropdown.prototype._initialize = function() {
    this._createButtons();
    this._bus.addEventListener('message', this._onPostMessage);
    this._requestTopicStates();
    this.render();
};

FollowDropdown.prototype._createButtons = function() {
    this._buttons = this._topics.map(function(topic, i, arr){
        return new FollowButton({ 
            topic: topic,
            destroyOnUnfollow: false
        });
    });
};

FollowDropdown.prototype._updateButtons = function(topics) { 
    _buttons.forEach(function(button) {
        if(topics[button.topic]) {
            button.updateTopicState(topics[button.topic].state);
            return true;
        }
    });
};

FollowDropdown.prototype._requestTopicStates = function () {
    var msg = {
        to: 'follow-hub',
        action: 'get',
        data: {
            topics: []
        }
    }
    this._bus.postMessage(JSON.stringify(msg),'*');
};


FollowDropdown.prototype._onPostMessage = function(event){
    var msg = null; 
    if (typeof event.data === 'object') {
        msg = event.data;
    }
    else {
        try{ 
            msg = JSON.parse(event.data);
        } catch(e){ 
            return; 
        }       
    }

    if (msg.to !== 'follow-widget' || !msg.data || !msg.action) {
        return;
    } 

    if (msg.action === 'get'){ 
        this._updateButtons(msg.data.topics);
    }
};

FollowDropdown.prototype.render = function () {
    this.el.innerHTML('');
};

FollowDropdown.prototype.destroy = function () {
    this._buttons.forEach(function(btn, i, arr){
        btn.destroy();
    });
    this._bus.removeEventListener('message', this._onPostMessage);
};

module.exports = FollowDropdown;