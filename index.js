"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var vueReservedProps = ["$options", "$parent", "$root", "$children", "$refs", "$vnode", "$slots", "$scopedSlots", "$createElement", "$attrs", "$listeners", "$el"];

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function isArray(obj) {
    return Array.isArray(obj);
}

function isCorrectCustomName(prop, options) {
    if (vueReservedProps.includes(options[prop])) {
        console.warn('[vue-handy-subscriptions]: ' + options[prop] + ' is used by Vue. Use another name');

        return false;
    }

    return options && typeof options[prop] === 'string' && options[prop];
}

function addListener(_ref) {
    var events = _ref.events,
        eventName = _ref.eventName,
        subscriberId = _ref.subscriberId,
        callback = _ref.callback;

    (events[eventName] || (events[eventName] = [])).push({
        subscriberId: subscriberId,
        callback: callback
    });
}

function runCallbacks(_ref2) {
    var events = _ref2.events,
        eventName = _ref2.eventName,
        options = _ref2.options;

    var eventsAmount = events && events[eventName] && events[eventName].length;

    if (eventsAmount) {
        for (var listenerIndex = 0; listenerIndex < eventsAmount; listenerIndex++) {
            events[eventName][listenerIndex].callback(options);
        }
    }
}

function removeListeners(_ref3) {
    var events = _ref3.events,
        event = _ref3.event,
        subscriberId = _ref3.subscriberId;

    for (var listenerIndex = 0; listenerIndex < events[event].length; listenerIndex++) {
        if (events[event][listenerIndex].subscriberId === subscriberId) {
            events[event].splice(listenerIndex, 1);
        }
    }
}

function removeCallbacks(_ref4) {
    var events = _ref4.events,
        event = _ref4.event,
        subscriberId = _ref4.subscriberId,
        callback = _ref4.callback;

    var indexOfSubscriber = events[event].findIndex(function (el) {
        return el.subscriberId === subscriberId && el.callback === callback;
    });

    if (~indexOfSubscriber) {
        events[event].splice(indexOfSubscriber, 1);
    }
}

function removeGlobalEvent(_ref5) {
    var events = _ref5.events,
        eventName = _ref5.eventName;

    for (var event in events) {
        if (event === eventName) {
            delete events[eventName];
        }
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

            if (isArray(eventName) && isArray(cb)) {
                for (var eventNameIndex = 0, len = eventName.length; eventNameIndex < len; eventNameIndex++) {
                    for (var callbackIndex = 0, _len = cb.length; callbackIndex < _len; callbackIndex++) {
                        addListener({ events: events, eventName: eventName[eventNameIndex], subscriberId: ID, callback: cb[callbackIndex] });
                    }
                }

                return;
            }

            if (isArray(eventName)) {
                for (var _eventNameIndex = 0, _len2 = eventName.length; _eventNameIndex < _len2; _eventNameIndex++) {
                    addListener({ events: events, eventName: eventName[_eventNameIndex], subscriberId: ID, callback: cb });
                }

                return;
            }

            if (isArray(cb)) {
                for (var _callbackIndex = 0, _len3 = cb.length; _callbackIndex < _len3; _callbackIndex++) {
                    addListener({ events: events, eventName: eventName, subscriberId: ID, callback: cb[_callbackIndex] });
                }

                return;
            } else {
                addListener({ events: events, eventName: eventName, subscriberId: ID, callback: cb });

                return;
            }
        };

        /* fire event */
        Vue.prototype[emitEventProp] = function (eventName, options) {
            runCallbacks({ events: events, eventName: eventName, options: options });
        };

        /* remove event from events object */
        Vue.prototype[eraseEventProp] = function (eventName) {
            if (!isEmpty(events)) {
                if (isArray(eventName)) {
                    for (var eventIndex = 0, len = eventName.length; eventIndex < len; eventIndex++) {
                        removeGlobalEvent({ events: events, eventName: eventName[eventIndex] });
                    }
                } else {
                    removeGlobalEvent({ events: events, eventName: eventName });
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

                if (event && isArray(event) && !cb) {
                    for (var eventIndex = 0, len = event.length; eventIndex < len; eventIndex++) {
                        removeListeners({ events: events, event: event[eventIndex], subscriberId: ID });
                    }

                    return;
                }

                if (event && cb && isArray(cb) && event in events && events[event].length) {
                    for (var callbackIndex = 0, _len4 = cb.length; callbackIndex < _len4; callbackIndex++) {
                        removeCallbacks({ events: events, event: event, subscriberId: ID, callback: cb[callbackIndex] });
                    }

                    return;
                }

                if (event && cb && event in events && events[event].length) {
                    removeCallbacks({ events: events, event: event, subscriberId: ID, callback: cb });

                    return;
                }

                if (event && cb && typeof cb !== 'function') {
                    return;
                }

                for (var _event in events) {
                    removeListeners({ events: events, event: _event, subscriberId: ID });
                }
            }
        };
    }
};