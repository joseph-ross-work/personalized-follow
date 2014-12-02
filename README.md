# Personalized Follow 

Components that leverage Livefyre personalized stream features.

## Hub
Hub coordinates the communication between all of the personalized follow widgets on the same page as well as wraps the API communication so that it is all handled in a single place. A hub must be instantiated before any Personalized Follow widgets will work.

### Usage
```
Livefyre.require(['personalized-follow'], function(follow) {
    var hub = new follow.hub({});

    ...

    Whatever personalized-follow widgets you may have on the page
});
```

### Options
####```bus```
By default is window, but can take anything with an interface that matches.
####```auth```
By default uses Livefyre auth on the page, but can take a customer wrapper or other auth interface pending it conforms to the same interface as Livefyre auth.
####```environment```
Be default 'production', mostly a dev aid.


## Follow Button

### Usage
```
Livefyre.require(['personalized-follow'], function(follow) {
    var hub = new follow.hub({});
    var button = new follow.button({
        "topic": "urn:livefyre:demo.fyre.co:site=362588:topic=all",
        "displayName": "all",
        "state": true
    });
});
```

### Options
####```bus```
By default is window, but can take anything with an interface that matches addEventListener / removeEventListener.
####```topic```
Required. Topic is the URN used to identify the topic that this button is linked to within Livefyre.
####```displayName```
Required. Text that appears on the button.
####```state```
Required. Initial state of button. True is for a topic that is already followed, false is for a topic that is not currently followed.


## Topic List
For a logged in user this widget by default shows all topics they have ever followed and whether or not they are currently following that topic. A button is provided to toggle the following status.

### Usage
```
Livefyre.require(['personalized-follow'], function(follow) {
    var hub = new follow.hub({});
    var topicList = new follow.topicList({
        el: document.getElementById('profile'),
        destroyOnUnfollow: false
    });
});
```

### Options
####```bus```
By default is window, but can take anything with an interface that matches.
####```destroyOnUnfollow```
Default false. If true entries in the list will be destroyed if the topic they are associated with is unfollowed.
####```el```
The element you want Topic List to render in. If not provided Topic List will create its own unattached div to render into.



## Follow Dropdown
A widget that allows you to provide a list of topics to follow.

### Usage
```
Livefyre.require(['personalized-follow'], function(follow) {
    var hub = new follow.hub({});
    var dropdown = new follow.dropdown({
        el: document.getElementById('dropdown'),
        topics: {
            "urn:livefyre:demo.fyre.co:site=362588:topic=sports": {
                "topic": "urn:livefyre:demo.fyre.co:site=362588:topic=sports",
                "displayName": "sports",
                "state": false
            },
            "urn:livefyre:demo.fyre.co:site=362588:topic=video": {
                "topic": "urn:livefyre:demo.fyre.co:site=362588:topic=video",
                "displayName": "video",
                "state": true
            },
            "urn:livefyre:demo.fyre.co:site=362588:topic=all": {
                "topic": "urn:livefyre:demo.fyre.co:site=362588:topic=all",
                "displayName": "all",
                "state": true
            }
        }
    });
});
```

### Options
####```bus```
By default is window, but can take anything with an interface that matches.
####```topics```
Required. An object where the keys are the URNs for every selection you want in the dropdown. Each of the objects associated with those keys are an option object for that selection's follow button.
####```el```
The element you want Follow Dropdown to render in. If not provided Follow Dropdown will create its own unattached div to render into.