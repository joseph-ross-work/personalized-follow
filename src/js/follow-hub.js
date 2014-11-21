var base64 = require('base64');
var auth = require('livefyre-auth');
var FollowService = require('./follow-service');

function FollowHub(opts) {
    this._bus = opts.bus || window;
    this._auth = opts.auth || auth;
    this._service = new FollowService(opts);
    this.attachListeners();
    this.initFromUser(auth.get('livefyre'));
}

FollowHub.prototype.attachListeners = function() {
    var self = this;

    this._bus.addEventListener('message', this._onPostMessage.bind(this));
    this._auth.on('login.livefyre', this.initFromUser.bind(this));
    this._auth.on('logout', function() {

        //Send out a kill msg?
    });
};

FollowHub.prototype.initFromUser = function(newUser) {
    if (this._user && this._user.id === newUser.id) {
        return;
    }
    this._user = newUser;
    this._service.setToken(newUser.get('token'));
    this._service.getTopicStates(this._sendTopicStates.bind(this));
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
        this._service.getTopicStates(this._sendTopicStates.bind(this));
    }

    if (msg.action === 'put') {
        this._service.updateTopicState(
            { 
                topics: msg.data.topic, 
                state: msg.data.state, 
                displayName: msg.data.displayName
            }, 
            this._sendTopicStateUpdate.bind(this)
        );
    }
};

FollowHub.prototype._sendTopicStateUpdate = function (topic) {
    var msg = {
        to: 'follow-widget',
        action: 'put',
        data: {
            topic: topic.topic,
            state: topic.state,
            displayName: topic.displayName
        }
    }
    this._bus.postMessage(JSON.stringify(msg),'*');
};

FollowHub.prototype._sendTopicStates = function (topics) {
    console.log(topics)
    var msg = {
        to: 'follow-widget',
        action: 'put',
        data: {
            topics: topics
        }
    }
    this._bus.postMessage(JSON.stringify(msg),'*');
};

FollowHub.prototype.destroy = function () {
    this._bus.removeEventListener('message', this._onPostMessage);
};

module.exports = FollowHub;