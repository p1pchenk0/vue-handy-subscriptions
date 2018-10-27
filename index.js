'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function isCorrectCustomName(prop, options) {
    return options && typeof options[prop] === 'string' && options[prop];
}

function addListener(params) {
    (params.events[params.eventName] || (params.events[params.eventName] = [])).push({
        subscriberId: params.subscriberId,
        callback: params.callback
    });
}

function runCallbacks(params) {
    var eventsAmount = params.events && params.events[params.eventName] && params.events[params.eventName].length;

    if (eventsAmount) {
        for (var listenerIndex = 0; listenerIndex < eventsAmount; listenerIndex++) {
            params.events[params.eventName][listenerIndex].callback(params.options);
        }
    }
}

function removeListeners(params) {
    for (var listenerIndex = 0; listenerIndex < params.events[params.event].length; listenerIndex++) {
        if (params.events[params.event][listenerIndex].subscriberId === params.subscriberId) {
            params.events[params.event].splice(listenerIndex, 1);
        }
    }
}

function removeCallbacks(params) {
    var indexOfSubscriber = params.events[params.event].findIndex(function (el) {
        return el.subscriberId === params.subscriberId && el.callback === params.callback;
    });

    if (~indexOfSubscriber) {
        params.events[params.event].splice(indexOfSubscriber, 1);
    }
}

exports.default = {
    install: function install(Vue, options) {
        var idSubsProp = isCorrectCustomName('idSubs', options) || '$idSubs';
        var listenToProp = isCorrectCustomName('listenTo', options) || '$listenTo';
        var emitEventProp = isCorrectCustomName('emitEvent', options) || '$emitEvent';
        var eraseEventProp = isCorrectCustomName('eraseEvent', options) || '$eraseEvent';
        var fallSilentProp = isCorrectCustomName('fallSilent', options) || '$fallSilent';

        Vue.mixin({
            beforeCreate: function beforeCreate() {
                this._uniqID = Math.random().toString(36).substr(2, 9);
                this.shouldFallSilent = true;
            },
            beforeDestroy: function beforeDestroy() {
                if (this.shouldFallSilent) this.$fallSilent();
            }
        });

        Vue.prototype[idSubsProp] = { _events: {} };
        var events = Vue.prototype[idSubsProp]._events;
        /* subscribe to event */
        Vue.prototype[listenToProp] = function (eventName, cb) {
            var ID = this._uniqID;

            if (Array.isArray(cb)) {
                for (var callbackIndex = 0, len = cb.length; callbackIndex < len; callbackIndex++) {
                    addListener({ events: events, eventName: eventName, subscriberId: ID, callback: cb[callbackIndex] });
                }
            } else {
                addListener({ events: events, eventName: eventName, subscriberId: ID, callback: cb });
            }
        };

        /* fire event */
        Vue.prototype[emitEventProp] = function (eventName, options) {
            runCallbacks({ events: events, eventName: eventName, options: options });
        };

        /* remove event from events object */
        Vue.prototype[eraseEventProp] = function (eventName) {
            if (!isEmpty(events)) {
                for (var event in events) {
                    if (event === eventName) {
                        delete events[eventName];
                    }
                }
            }
        };

        /* unsubscribe from subscriptions */
        Vue.prototype[fallSilentProp] = function (event, cb) {
            var ID = this._uniqID;

            if (!isEmpty(events)) {
                if (event && event in events && typeof event === 'string' && !cb) {
                    removeListeners({ events: events, event: event, subscriberId: ID });

                    return;
                }

                if (event && Array.isArray(event) && !cb) {
                    for (var eventIndex = 0, len = event.length; eventIndex < len; eventIndex++) {
                        removeListeners({ events: events, event: event[eventIndex], subscriberId: ID });
                    }

                    return;
                }

                if (event && cb && Array.isArray(cb) && event in events && events[event].length) {
                    for (var callbackIndex = 0, _len = cb.length; callbackIndex < _len; callbackIndex++) {
                        removeCallbacks({ events: events, event: event, subscriberId: ID, callback: cb[callbackIndex] });
                    }

                    return;
                }

                if (event && cb && event in events && events[event].length) {
                    removeCallbacks({ events: events, event: event, subscriberId: ID, callback: cb });

                    return;
                }

                for (var _event in events) {
                    removeListeners({ events: events, event: _event, subscriberId: ID });
                }
            }
        };
    }
};