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
        Vue.prototype[emitEventProp] = function (eventName, options) {
            var eventsAmount = events[eventName].length;

            if (eventsAmount) {
                for (var listenerIndex = 0; listenerIndex < eventsAmount; listenerIndex++) {
                    events[eventName][listenerIndex].callback(options);
                }
            }
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
                if (event && typeof event === 'string' && !cb) {
                    for (var listenerIndex = 0; listenerIndex < events[event].length; listenerIndex++) {
                        if (events[event][listenerIndex].subscriberId === ID) {
                            events[event].splice(listenerIndex, 1);
                        }
                    }

                    return;
                }

                if (event && Array.isArray(event) && !cb) {
                    for (var eventIndex = 0, len = event.length; eventIndex < len; eventIndex++) {
                        for (var _listenerIndex = 0; _listenerIndex < events[event[eventIndex]].length; _listenerIndex++) {
                            if (events[event[eventIndex]][_listenerIndex].subscriberId === ID) {
                                events[event[eventIndex]].splice(_listenerIndex, 1);
                            }
                        }
                    }

                    return;
                }

                if (event && cb && Array.isArray(cb) && event in events && events[event].length) {
                    var _loop = function _loop(callbackIndex, _len) {
                        var indexOfSubscriber = events[event].findIndex(function (el) {
                            return el.subscriberId === ID && el.callback === cb[callbackIndex];
                        });

                        if (~indexOfSubscriber) {
                            events[event].splice(indexOfSubscriber, 1);
                        }
                    };

                    for (var callbackIndex = 0, _len = cb.length; callbackIndex < _len; callbackIndex++) {
                        _loop(callbackIndex, _len);
                    }

                    return;
                }

                if (event && cb && event in events && events[event].length) {
                    var _indexOfSubscriber = events[event].findIndex(function (el) {
                        return el.subscriberId === ID && el.callback === cb;
                    });

                    if (~_indexOfSubscriber) {
                        events[event].splice(_indexOfSubscriber, 1);
                    }

                    return;
                }

                for (var _event in events) {
                    for (var _listenerIndex2 = 0; _listenerIndex2 < events[_event].length; _listenerIndex2++) {
                        if (events[_event][_listenerIndex2].subscriberId === ID) {
                            events[_event].splice(_listenerIndex2, 1);
                        }
                    }
                }
            }
        };
    }
};