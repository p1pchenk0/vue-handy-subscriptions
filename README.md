# vue-handy-subscriptions
This plugin is for easier Vue event bus subsciptions management.
By using standart event bus approach with `new Vue()` we create a `Vue` object with lots of unused methods and properties. `vue-handy-subscriptions` creates simple object containing events-related functionality. 

## Installation
```javascript
import Vue from 'vue'
import HandySubs from 'vue-handy-subscriptions'

Vue.use(HandySubs)
```

## Events management
This package is responsible for automatic event bus unsubscription when component is being destroyed. No more need to write something like:
```javascript
    beforeDestroy() {
        this.$eventBus.off('event-one', this.methodOne)
        this.$eventBus.off('event-two', this.methodTwo)
        this.$eventBus.off('event-three', this.methodThree)
        this.$eventBus.off('event-four', this.methodFour)
        // ... and so on
    }
```
Instead of above you should write:
```javascript
```
Yes. Correct. Nothing. Plugin will handle all of this by itself.

### Methods
Listening to event (example):
```javascript
    created() {
        this.$listenTo('some-event', this.eventCallback)
    }
```
It is possible to fire multiple callbacks:
```javascript
    created() {
        this.$listenTo('some-event', [
            this.eventCallbackOne,
            this.eventCallbackTwo
        ])
    }
```

Emitting event (example):
```javascript
    methods: {
        fireEvent() {
            this.$emitEvent('some-event', { test: 'one' })
        }
    }
```

Removing event from events object for all listeners (example):
```javascript
    methods: {
        dontWannaListenAnymore() {
            this.$eraseEvent('some-event')
        }
    }
```

Unsubsribe from all events manually (example):
```javascript
    methods: {
        leaveMeAlone() {
            this.$fallSilent() // it is also done automatically
        }
    }
```
Remove specific listener (example): 
```javascript
    methods: {
        leaveMeWithoutSpecificCallback() {
            this.$fallSilent('some-event', this.specificCallback)
        }
    }
```
Remove array of listeners (example):
```javascript
    methods: {
        leaveMeWithoutSpecificCallbacks() {
            this.$fallSilent('some-event', [this.callbackOne, this.callbackTwo])
        }
    }
```
Unsubscribe from specific event or events (all component's listeners):
```javascript
    methods: {
        notListenToOne() {
            this.$fallSilent('some-event')
        },
        notListenToMany() {
            this.$fallSilent(['some-event', 'another-event'])
        }
    }
```
You can forbid automatic unsubscribing from all events component is currently listening to:
```javascript
    data() {
        return {
            shouldFallSilent: false
        }
    }
```


### Customization
If you use some plugins, which have some conflicting function names (or you just don't like default ones), you can rename all of them according to your preferences:
```javascript
    import Vue from 'vue'
    import HandySubs from 'vue-handy-subscriptions'

    Vue.use(HandySubs, {
        listenTo: '$hear',
        emitEvent: '$fireEvent',
        eraseEvent: '$deleteEvent',
        fallSilent: '$noMore'
    })

    // later in component...
    created() {
        this.$hear('some-event', this.callbackMethod)
    },
    methods: {
        doSmth() {
            this.$fireEvent('attack!')
        },
        unsubscribe() {
            this.$noMore('some-event')
        }
    }
```