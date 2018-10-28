# vue-handy-subscriptions
[![npm](https://img.shields.io/npm/v/vue-handy-subscriptions.svg)](vue-handy-subscriptions) ![npm](https://img.shields.io/npm/dt/vue-handy-subscriptions.svg)

This plugin is for easier Vue event bus subsciptions management.
By using standart event bus approach:
```javascript
    Vue.prototype.$eventBus = new Vue()
    // or
    export const EventBus = new Vue()
```
we create a new `Vue` instance with lots of unused methods and properties. `vue-handy-subscriptions` creates simple object containing events-related functionality. 

## Installation
```javascript
import Vue from 'vue'
import HandySubs from 'vue-handy-subscriptions'

Vue.use(HandySubs)
```

## Events management
Issue with using standart event bus is that you cannot just write `this.$eventBus.off()` inside component in order to unsubscribe only this component from all events it was subscribed to. Instead code above will remove all events from everywhere.

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
Yes. Correct. Nothing. Plugin will handle all of this by itself, unsubscribing current component inside of its `beforeDestroy` hook.

### Methods
Listening to event or events:
```javascript
    created() {
        this.$listenTo('some-event', this.eventCallback)
        this.$listenTo(['second-event', 'third-event'], this.commonCallback)
    }
```
It is possible to fire multiple callbacks (even for multiple events):
```javascript
    created() {
        this.$listenTo('some-event', [this.eventCallbackOne, this.eventCallbackTwo])
        this.$listenTo(['second-event', 'third-event'], [this.eventCallbackOne, this.eventCallbackTwo])
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
            this.$eraseEvent('some-event') // now no component will listen to this event
            this.$eraseEvent(['second-event', 'third-event'])
        }
    }
```

Unsubsribe from all events manually (example):
```javascript
    methods: {
        leaveMeAlone() {
            this.$fallSilent() // nice, but it is also done automatically inside "beforeDestroy" hook
        }
    }
```
Remove specific callback for specific event (example): 
```javascript
    methods: {
        leaveMeWithoutSpecificCallback() {
            this.$fallSilent('some-event', this.specificCallback)
        }
    }
```
Remove array of callbacks for specific event (example):
```javascript
    methods: {
        leaveMeWithoutSpecificCallbacks() {
            this.$fallSilent('some-event', [this.callbackOne, this.callbackTwo])
        }
    }
```
Unsubscribe component from specific event or events (all component's callbacks for these events will be removed):
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


### Customization
If you use some plugins, which have some conflicting function names (or you just don't like default ones), you can rename all of them according to your preferences.
NOTE: use this feature at your own risk as it will warn you only for Vue basic properties:
```
    "$options", "$parent", "$root", "$children", "$refs", "$vnode", "$slots", "$scopedSlots", "$createElement", "$attrs", "$listeners", "$el"
```
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
            this.$fireEvent('some-event')
        },
        unsubscribe() {
            this.$noMore('some-event')
        }
    }
```