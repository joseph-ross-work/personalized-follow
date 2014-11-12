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
    topics.forEach(function(topicObj) {
        _buttons.some(function(button) {
            if(button.topic === topic) {
                button.updateTopicState(topic.state);
                return true;
            }
        });
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
};

module.exports = FollowDropdown;