function FollowButton(opts) {
    if (!opts.topic) {
        return;
    }
    this.topic = opts.topic;
    this._bus = opts.bus || window;
    this._destroyOnUnfollow = Boolean(opts._destroyOnUnfollow);
    this._state = opts.state === false ?  false : true;
    this.el = opts.el || document.createElement('div');

    this._bus.addEventListener('message', this._onPostMessage.bind(this));
    this.render();
}

FollowButton.prototype.template = require('../templates/follow-button.hb');

FollowButton.prototype._onPostMessage = function(event){
    console.log('On Post in Button')
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

    if (msg.to !== 'follow-widget' || !msg.data || !msg.action || msg.data.topic !== this.topic) {
        return;
    } 

    if (msg.action === 'put'){ 
        this.updateTopicState(msg.data.state);
    }      
};

FollowButton.prototype.updateTopicState = function(state) {
    if (this._destroyOnUnfollow && !state) {
        this.destroy();
    } else { 
        this._state = state;
        this.render();
    } 
};

FollowButton.prototype._onButtonClick = function (event) {
    event.stopPropagation();
    event.preventDefault();

    this._sendTopicStateUpdate(!this._state);
    this.updateTopicState(!this._state);
};

FollowButton.prototype._sendTopicStateUpdate = function () {
    var msg = {
        to: 'follow-hub',
        action: 'put',
        data: {
            topic: this.topic,
            state: this._state
        }
    }
    this._bus.postMessage(JSON.stringify(msg),'*');
};

FollowButton.prototype.render = function () {
    var context = { 
        title: this.topic.displayName,
        text: !this._state ? 'Follow' : 'Unfollow'
    };
    var html = this.template(context);
    this.el.innerHTML = html;
    return this.el.outerHTML;
};

FollowButton.prototype.destroy = function () {
    this._bus.removeEventListener('message', this._onPostMessage);
    this.el.parent.removeChild(this.el);
};

module.exports = FollowButton;