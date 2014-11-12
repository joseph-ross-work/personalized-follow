function FollowButton(opts) {
    if (!opts.topic) {
        return;
    }
    this._topic = opts.topic;
    this._bus = opts.bus || window;
    this._destroyOnUnfollow = Boolean(opts._destroyOnUnfollow);
    this._state = opts.state === false ?  false : true;
    this.el = opts.el || document.createElement('div');

    this.render(true;)
}

FollowButton.prototype._onPostMessage = function(event){
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

    if (msg.to !== 'follow-widget' || !msg.data || !msg.action || msg.data.topic !== this._topic) {
        return;
    } 

    if (msg.action === 'put'){ 
        this._updateTopicState(msg.data.state);
    }      
};

FollowButton.prototype._updateTopicState = function(state) {
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
    this._updateTopicState(!this._state);
};

FollowButton.prototype._sendTopicStateUpdate = function () {
    var msg = {
        to: 'follow-hub',
        action: 'put',
        data: {
            topic: this._topic,
            state: this._state
        }
    }
    this.bus.postMessage(JSON.stringify(msg),'*');
};

FollowButton.prototype.render = function (state) {
    this.el.innerHTML('');
};

FollowButton.prototype.destroy = function () {

};

module.exports = FollowHub;