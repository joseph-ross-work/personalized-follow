var FollowButton = require('./follow-button');

function FollowList(opts) {
    this._buttons = [];
    this._bus = opts.bus;
    this._destroyOnUnfollow = typeof opts.destroyOnUnfollow === 'boolean' ? opts.destroyOnUnfollow : false;
    this.el = opts.el || document.createElement('div');

    this._initialize();
};

FollowList.prototype.template = require('../templates/follow-list.hb');

FollowList.prototype._initialize = function() {
    this._bus.addEventListener('message', this._onPostMessage);
    this._requestTopicStates();
    this.render();
};

FollowList.prototype._createButtons = function(topics) {
    this._buttons = topics.map(function(topic, i, arr){
        return new FollowButton({ 
            topic: topic,
            destroyOnUnfollow: this._destroyOnUnfollow
        });
    });
    this.render();
};

FollowList.prototype._requestTopicStates = function () {
    var msg = {
        to: 'follow-hub',
        action: 'get',
        data: {}
    }
    this._bus.postMessage(JSON.stringify(msg),'*');
};

FollowList.prototype._onGet = function (topics) {
    this._createButtons(topics);
}

FollowList.prototype._onPostMessage = function(event){
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
        this._onGet(msg.data.topics)
    }
};

FollowList.prototype.render = function () {
    var context = {};
    var html = this.template(context);
    this.el.innerHTML = html;
    
    var ul = this.el.querySelector('ul');
    this._buttons.each(function(btn){
        btn.render();
        ul.append(btn.el);
    });
    return this.el.outerHTML;
};

FollowList.prototype.destroy = function () {
    this._buttons.forEach(function(btn, i, arr){
        btn.destroy();
    });
    this._bus.removeEventListener('message', this._onPostMessage);
    this.el.parent.removeChild(this.el);
};

module.exports = FollowList;