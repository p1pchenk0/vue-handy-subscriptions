"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

exports.default = {
    install: function install(Vue, options) {
        Vue.mixin({
            beforeCreate: function beforeCreate() {
                this._uniqID = Math.random().toString(36).substr(2, 9);
                this.shouldFallSilent = true;
            },
            beforeDestroy: function beforeDestroy() {
                if (this.shouldFallSilent) this.$fallSilent();
            }
        });

        Vue.prototype.$idSubs = { _events: {} };
        var events = Vue.prototype.$idSubs._events;
        /* subscribe to event */
        Vue.prototype.$listenTo = function (eventName, cb) {
            var ID = this._uniqID;

            if (Array.isArray(cb)) {
                for (var callbackIndex = 0, len = cb.length; callbackIndex < len; callbackIndex++) {
                    (events[eventName] || (events[eventName] = [])).push({
                        subscriberId: ID,
                        callback: cb[callbackIndex]
                    });
                }
            } else {
                (events[eventName] || (events[eventName] = [])).push({
                    subscriberId: ID,
                    callback: cb
                });
            }
        };

        /* fire event */
        Vue.prototype.$emitEvent = function (eventName, options) {
            var eventsAmount = events[eventName].length;

            if (eventsAmount) {
                for (var listenerIndex = 0; listenerIndex < eventsAmount; listenerIndex++) {
                    events[eventName][listenerIndex].callback(options);
                }
            }
        };

        /* remove event from events object */
        Vue.prototype.$eraseEvent = function (eventName) {
            if (!isEmpty(events)) {
                for (var event in events) {
                    if (event === eventName) {
                        delete events[eventName];
                    }
                }
            }
        };

        /* unsubscribe from subscriptions */
        Vue.prototype.$fallSilent = function (event, cb) {
            var ID = this._uniqID;

            if (!isEmpty(events)) {
                if (event && cb && event in events && events[event].length) {
                    var indexOfSubscriber = events[event].findIndex(function (el) {
                        return el.subscriberId === ID && el.callback === cb;
                    });

                    if (~indexOfSubscriber) {
                        events[event].splice(indexOfSubscriber, 1);
                    }
                } else {
                    for (var _event in events) {
                        for (var listenerIndex = 0; listenerIndex < events[_event].length; listenerIndex++) {
                            if (events[_event][listenerIndex].subscriberId === ID) {
                                events[_event].splice(listenerIndex, 1);
                            }
                        }
                    }
                }
            }
        };
    }
};