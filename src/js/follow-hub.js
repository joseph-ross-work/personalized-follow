var FollowService = require('./follow-service')

function FollowHub(opts) {
    this._bus = opts.bus || window;
    this._service = new FollowService();
}

FollowHub.prototype._onPostMessage = function(event){
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
        this._service.getTopicStates(this._sendTopicStateUpdate);
    }

    if (msg.action === 'put') {
        this._service.updateTopicState({ topics: msg.data.topic, state: msg.data.state});
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

FollowHub.prototype._sendTopicStates = function () {
    var msg = {
        to: 'follow-widget',
        action: 'get',
        data: {
            topics: [ { topic: 'topic', state: 'state'} ]
        }
    }
    this._bus.postMessage(JSON.stringify(msg),'*');
};

FollowHub.prototype.destroy = function () {

};

module.exports = FollowHub;