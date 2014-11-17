var FollowButton = require('./follow-button');
var template = require('../templates/follow-topic-list.hb');

function FollowedTopicList(opts) {
    this._buttons = [];
    this._bus = opts.bus;
    this.el = opts.el || document.createElement('div');

    this._initialize();
};

FollowedTopicList.prototype._initialize = function() {
    this._bus.addEventListener('message', this._onPostMessage);
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
        data: {}
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
    var buttons = this._buttons.map(function(btn){
        return btn.render();
    });
    var context = {
        buttons: buttons
    };
    var html = template(context);
    this.el.innerHTML = html;
    return this.el.outerHTML;
};

FollowedTopicList.prototype.destroy = function () {
    this._buttons.forEach(function(btn, i, arr){
        btn.destroy();
    });
    this._bus.removeEventListener('message', this._onPostMessage);
    this.el.parent.removeChild(this.el);
};

module.exports = FollowedTopicList;