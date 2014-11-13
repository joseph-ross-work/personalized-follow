var base64 = require('base64')
var auth = require('auth')
var FollowService = require('./follow-service')

function FollowHub(opts) {
    this._bus = opts.bus || window;
    this._auth = opts.auth || auth;
    this._user = auth.get('livefyre');
    this._service = new FollowService(opts);

    this.attachListeners();
    if (this._user) {
        this.initFromUser(this._user);
    }
}

FollowHub.prototype.attachListeners = function() {
    var self = this;

    this._bus.addEventListener('message', this._onPostMessage);

    this._auth.on('login.livefyre', this.initFromUser.bind(this));

    this._auth.on('logout', function() {
        //Send out a kill msg?
    });
};

FollowHub.prototype.initFromUser = function(user) {
    this._user = newUser;
    self._service.setToken(newUser);
    self._service.getTopicStates(self._sendTopicStates);
};

FollowHub.prototype._onPostMessage = function(event) {
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

    if (msg.to !== 'follow-hub' || !msg.data || !msg.action) {
        return;
    } 

    if (msg.action === 'get') { 
        this._service.getTopicStates(this._sendTopicStates);
    }

    if (msg.action === 'put') {
        this._service.updateTopicState(
            { 
                topics: msg.data.topic, 
                state: msg.data.state, 
                displayName: msg.data.displayName
            }, 
            this._sendTopicStateUpdate
        );
    }
};

FollowHub.prototype._sendTopicStateUpdate = function (opts) {
    var msg = {
        to: 'follow-widget',
        action: 'put',
        data: {
            topic: opts.topic,
            state: opts.state
        }
    }
    this._bus.postMessage(JSON.stringify(msg),'*');
};

FollowHub.prototype._sendTopicStates = function (topic) {
    var msg = {
        to: 'follow-widget',
        action: clear ? 'post' : 'put',
        data: {
            //TODO: Remove placeholder when ready to test
            topics: { 'someTopic' : { state: true, displayName: 'Some Topic'} }
        }
    }
    this._bus.postMessage(JSON.stringify(msg),'*');
};

FollowHub.prototype.destroy = function () {
    this._bus.removeEventListener('message', this._onPostMessage);
};

module.exports = FollowHub;