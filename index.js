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

            if (!events[eventName]) {
                events[eventName] = [];
            }

            events[eventName].push({
                subscriberId: ID,
                callback: cb
            });
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

        /* unsubscribe from all component's subscriptions */
        Vue.prototype.$fallSilent = function () {
            var ID = this._uniqID;

            if (!isEmpty(events)) {
                for (var event in events) {
                    for (var listenerIndex = 0; listenerIndex < events[event].length; listenerIndex++) {
                        if (events[event][listenerIndex].subscriberId === ID) {
                            events[event].splice(listenerIndex, 1);
                        }
                    }
                }
            }
        };
    }
};