var ajax = require('reqwest');
var base64 = require('base64');

var MS_IN_DAY = 86400000;

var getTokenData = function(token){
    var parts = token.split('.');
    var dataPart = parts[1];
    var data = JSON.parse(base64.atob(dataPart));
    var network = data.domain;
    var userId = data.user_id;
    var urn = 'urn:livefyre:' + network + ':user=' + userId;

    return {
        network: 'demo.quill.fyre.co',//network,
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
    var data = {};
    response.data.subscriptions.forEach(function(sub) {
        try {
            data[sub.to] = {
                topic: sub.to,
                displayName: sub.to.split('=').pop().replace('_', ' '),
                state: true
            };
        } catch (e) {

        }

    });
    //store.lastUpdate = (new Data()).toISOString();
    return data;
}

function updateDataToPatchData(data) {
    var patchData = {};
    if (data.state) {
        patchData['subscriptions'] = [{'to': data.topic}];
    } else { 
        patchData['delete'] = [{'to': data.topic}];
    }

    //{"subscriptions":[{"to":"urn:livefyre:demo.fyre.co:site=362588:topic=sports"}]}

    return patchData;
}

var tokenData, url, storageId;

function FollowService(opts) {
    this._environment = typeof opts.environment === 'string' ? opts.environment : 'production';
    if (opts.token) {
        this.setToken(opts.token);
    }
};

FollowService.prototype.setToken = function(token) {
    tokenData = getTokenData(token);
    storageId = 'lf-follow-' + tokenData.userId;
    url = userSubscriptionUrl(tokenData.network, tokenData.userUrn, token);
    
    var store = window.localStorage.getItem(storageId);
    if (!store) {
        window.localStorage.setItem(storageId, '{}');
    }
};

FollowService.prototype.getTopicStates = function(callback) {
    var store = JSON.parse(window.localStorage.getItem(storageId));
    store = store ? store : {};
    var isLessThanDayOld = true;

    if (store.lastUpdated) {
        isLessThanDayOld = (new Date() - (new Date(store.lastUpdate)) < MS_IN_DAY)
    }

    if (isLessThanDayOld && Object.keys(store).length > 0 ) {
        //Just return what's in local storage if store is fresh and has content
        callback(store);
    } else { 
        ajax({ 
            url: url, 
            method: 'get',
            contentType: null
        }).then(function(resp){
            var cleanedData = topicsResponseToStoreData(resp, store);
            window.localStorage.setItem(storageId, JSON.stringify(cleanedData));
            callback(cleanedData);
        });
    }

};

FollowService.prototype.updateTopicState = function(data, callback) {
    var store = JSON.parse(window.localStorage.getItem(storageId)) || {};
    var oldVal = store[data.topic] ? store[data.topic] : null;

    if (oldVal) {
        store[data.topic]['state'] = data.state;
    } else {    
        oldVal = {
            topic: data.topic,
            displayName: data.displayName,
            state: !data.state
        };
        store[data.topic] = {
            topic: data.topic,
            displayName: data.displayName,
            state: data.state
        };
    }

    store.lastUpdate = (new Date()).toISOString();
    window.localStorage.setItem(storageId, JSON.stringify(store));
    callback(data);

    var cleanedData = updateDataToPatchData(data);
    ajax({ 
        url: url, 
        method: data.state ? 'post' : 'patch',
        contentType: 'application/json',
        processData: false,
        crossOrigin: true,
        data: JSON.stringify(cleanedData)
    }).fail(function(resp){
        store[data.topic] = oldVal;
        store.lastUpdate = (new Date()).toISOString();
        window.localStorage.setItem(storageId, JSON.stringify(store));
        callback(oldVal);
    });
};

module.exports = FollowService;