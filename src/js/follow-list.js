var FollowButton = require('./follow-button');

/**
* A list that shows all followed topics for the logged in user.
*/
function FollowList(opts) {
    this._buttons = [];
    this._bus = opts.bus || window;
    this._destroyOnUnfollow = typeof opts.destroyOnUnfollow === 'boolean' ? opts.destroyOnUnfollow : false;
    this.el = opts.el || document.createElement('div');

    this._initialize();
};

FollowList.prototype.template = require('../templates/follow-list.hb');
FollowList.prototype.listSelector = '.lf-follow-list';

FollowList.prototype._initialize = function() {
    this._bus.addEventListener('message', this._onPostMessage.bind(this));
    this._requestTopicStates();
    this.render();
};

FollowList.prototype._createButtons = function(topics) {
    this._buttons = Object.keys(topics).map(function(topicKey, i, arr){
        return new FollowButton({ 
            topic: topics[topicKey].topic,
            displayName: topics[topicKey].displayName,
            state: topics[topicKey].state,
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

FollowList.prototype._onPost = function (topics) {
    this._createButtons(topics);
};

FollowList.prototype._onPut = function(topics) {

};

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

    if (msg.action === 'post' && this._onPost) { 
        this._onPost(msg.data.topics);
    } else if (msg.action === 'put' && this._onPut) {
        this._onPut(msg.data.topics);
    }
};

FollowList.prototype.render = function () {
    var context = {};
    var html = this.template(context);
    this.el.innerHTML = html;

    var list = this.el.querySelector(this.listSelector);
    this._buttons = this._buttons.filter(function(btn, i, arr){
        if (btn.el) {
            list.appendChild(btn.el);
            return true;
        } 
        btn.destroy();
        return false;
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