# vue-handy-subscriptions
This plugin is for easier Vue event subsciptions management.
By using standart event bus approach with `new Vue()` we create a `Vue` object with lots of unused methods and properties. `vue-handy-subscriptions` creates simple object containing events-related functionality. 

## Installation
```javascript
import HandySubs from 'vue-handy-subscriptions'

Vue.use(HandySubs)
```

## Events management
This package is responsible for automatic events unsubscription when component is being destroyed. No more need to write something like:
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
            this.eventCallBackTwo
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

You can forbid automatic unsubscribing from all events component is currently listening to:
```javascript
    data() {
        return {
            shouldFallSilent: false
        }
    }
```


