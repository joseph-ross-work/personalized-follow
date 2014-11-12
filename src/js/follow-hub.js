
function FollowHub(opts) {
    this._bus = opts.bus || window;
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

    /*if (msg.action === 'put'){ 
        this._updateTopicState(msg.data.state);
    }*/
};

FollowHub.prototype._sendTopicStateUpdate = function (topic, state) {
    var msg = {
        to: 'follow-widget',
        action: 'put',
        data: {
            topic: this.topic,
            state: this.state
        }
    }
    this.bus.postMessage(JSON.stringify(msg),'*');
};

FollowHub.prototype._sendTopicStates = function () {
    var msg = {
        to: 'follow-widget',
        action: 'get',
        data: {
            topics: []
        }
    }
    this.bus.postMessage(JSON.stringify(msg),'*');
};

module.exports = FollowHub;