var FollowButton = require('./follow-button');

function FollowedTopicList(opts) {
    this._buttons = [];
    this._bus = opts.bus;
    this.el = opts.el || document.createElement('div');

    this._initialize();
};

FollowedTopicList.prototype._initialize = function() {
    this._requestTopicStates();
    this.render();
};

FollowedTopicList.prototype._createButtons = function() {
    this._buttons = this._topics.map(function(topic, i, arr){
        return new FollowButton({ topic: topic });
    });
    this.render();
};

FollowedTopicList.prototype._requestTopicStates = function () {
    var msg = {
        to: 'follow-hub',
        action: 'get',
        data: {
            topics: []
        }
    }
    this._bus.postMessage(JSON.stringify(msg),'*');
};


FollowedTopicList.prototype._onPostMessage = function(event){
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
        this._createButtons(msg.data.topics);
    }
};

FollowedTopicList.prototype.render = function () {
    this.el.innerHTML('');
};

FollowedTopicList.prototype.destroy = function () {
    this._buttons.forEach(function(btn, i, arr){
        btn.destroy();
    });
};

module.exports = FollowedTopicList;