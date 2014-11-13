var ajax = require('reqwest');

var MS_IN_DAY = 86400000;

var getTokenData = function(token){
    var parts = token.split('.');
    var dataPart = parts[1];
    var data = JSON.parse(base64.atob(dataPart));
    var network = data.domain === 'livefyre.com' ? data.domain : data.domain.split('.')[0];
    var userId = data.user_id;
    var urn = 'urn:livefyre:' + network + ':user=' + userId;

    return {
        network: network,
        userId: userId,
        userUrn: urn
    }
};

function userSubscriptionUrl(network, urn, token) {
    return 'http://' + network + '/api/v4/' + urn + ':subscriptions/?lftoken=' + token;
} 

function topicsResponseToStoreData(response) {
    //TODO: Turn this into something better
    //{"status": "ok", "code": 200, "data": {"subscriptions": [{"to": "urn:livefyre:demo.fyre.co:site=362588:topic=sports", "type": "personalStream", "by": "urn:livefyre:demo.fyre.co:user=53e177ae1083592090001157", "createdAt": 1407285932}, {"to": "urn:livefyre:demo.fyre.co:site=362588:topic=all", "type": "personalStream", "by": "urn:livefyre:demo.fyre.co:user=53e177ae1083592090001157", "createdAt": 1407389382}, {"to": "urn:livefyre:demo.fyre.co:site=362588:topic=front_page", "type": "personalStream", "by": "urn:livefyre:demo.fyre.co:user=53e177ae1083592090001157", "createdAt": 1407389380}, {"to": "urn:livefyre:demo.fyre.co:site=362588:topic=politics", "type": "personalStream", "by": "urn:livefyre:demo.fyre.co:user=53e177ae1083592090001157", "createdAt": 1415296039}, {"to": "urn:livefyre:demo.fyre.co:site=362588:topic=blog", "type": "personalStream", "by": "urn:livefyre:demo.fyre.co:user=53e177ae1083592090001157", "createdAt": 1415650220}]}}
    
    //store.lastUpdate = (new Data()).toISOString();
    return response.data;
}

function updateDataToPatchData(data) {

}

var tokenData, url, storageId;

function FollowService(opts) {
    this._environment = opts.environment;
    if (opts.token) {
        this.setToken(opts.token);
    }
};

FollowService.prototype.setToken = function(token) {
    tokenData = getTokenData(token);
    storageId = 'lf-follow-' + tokenData.userId;
    url = userSubscriptionUrl(this._tokenData);
    
    var store = window.localStorage.getItem(storageId);
    if (!store) {
        window.localStorage.setItem(storageId, '{}');
    }
};

FollowService.prototype.getTopicStates = function(callback) {
    var store = JSON.parse(window.localStorage.getItem(storageId));
    var isLessThanDayOld = true;

    if (store.lastUpdated) {
        isLessThanDayOld = (new Date() - (new Date(store.lastUpdate)) < MS_IN_DAY)
    }

    if (isLessThanDayOld) {
        callback(store);
    } else { 
        ajax({ 
            url: url, method: 'get' 
        }).then(function(resp){
            var cleanedData = topicsResponseToStoreData(resp);
            window.localStorage.setItem(storageId, JSON.stringify(cleanedData));
            callback(cleanedData);
        });
    }

};

FollowService.prototype.updateTopicState = function(data, callback) {
    var store = JSON.parse(window.localStorage.getItem(storageId))[data.topic];
    var oldVal = store[data.topic]['state'];

    store[data.topic]['state'] = data.state;
    store.lastUpdate = (new Data()).toISOString();
    window.localStorage.setItem(storageId, JSON.stringify(store));
    callback(data);

    var cleanedData = updateDataToPatchData(data);
    ajax({ 
        url: url, method: 'patch', data: cleanedData
    }).fail(function(resp){
        store[data.topic]['state'] = oldVal;
        store.lastUpdate = (new Data()).toISOString();
        window.localStorage.setItem(storageId, JSON.stringify(store));
        callback(store[data.topic]);
    });
};

module.exports = FollowService;