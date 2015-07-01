(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.rangesliderJs = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = clamp

function clamp(value, min, max) {
  return min < max
    ? (value < min ? min : value > max ? max : value)
    : (value < max ? max : value > min ? min : value)
}

},{}],2:[function(require,module,exports){

var synth = require('synthetic-dom-events');

var on = function(element, name, fn, capture) {
    return element.addEventListener(name, fn, capture || false);
};

var off = function(element, name, fn, capture) {
    return element.removeEventListener(name, fn, capture || false);
};

var once = function (element, name, fn, capture) {
    function tmp (ev) {
        off(element, name, tmp, capture);
        fn(ev);
    }
    on(element, name, tmp, capture);
};

var emit = function(element, name, opt) {
    var ev = synth(name, opt);
    element.dispatchEvent(ev);
};

if (!document.addEventListener) {
    on = function(element, name, fn) {
        return element.attachEvent('on' + name, fn);
    };
}

if (!document.removeEventListener) {
    off = function(element, name, fn) {
        return element.detachEvent('on' + name, fn);
    };
}

if (!document.dispatchEvent) {
    emit = function(element, name, opt) {
        var ev = synth(name, opt);
        return element.fireEvent('on' + ev.type, ev);
    };
}

module.exports = {
    on: on,
    off: off,
    once: once,
    emit: emit
};

},{"synthetic-dom-events":3}],3:[function(require,module,exports){

// for compression
var win = window;
var doc = document || {};
var root = doc.documentElement || {};

// detect if we need to use firefox KeyEvents vs KeyboardEvents
var use_key_event = true;
try {
    doc.createEvent('KeyEvents');
}
catch (err) {
    use_key_event = false;
}

// Workaround for https://bugs.webkit.org/show_bug.cgi?id=16735
function check_kb(ev, opts) {
    if (ev.ctrlKey != (opts.ctrlKey || false) ||
        ev.altKey != (opts.altKey || false) ||
        ev.shiftKey != (opts.shiftKey || false) ||
        ev.metaKey != (opts.metaKey || false) ||
        ev.keyCode != (opts.keyCode || 0) ||
        ev.charCode != (opts.charCode || 0)) {

        ev = document.createEvent('Event');
        ev.initEvent(opts.type, opts.bubbles, opts.cancelable);
        ev.ctrlKey  = opts.ctrlKey || false;
        ev.altKey   = opts.altKey || false;
        ev.shiftKey = opts.shiftKey || false;
        ev.metaKey  = opts.metaKey || false;
        ev.keyCode  = opts.keyCode || 0;
        ev.charCode = opts.charCode || 0;
    }

    return ev;
}

// modern browsers, do a proper dispatchEvent()
var modern = function(type, opts) {
    opts = opts || {};

    // which init fn do we use
    var family = typeOf(type);
    var init_fam = family;
    if (family === 'KeyboardEvent' && use_key_event) {
        family = 'KeyEvents';
        init_fam = 'KeyEvent';
    }

    var ev = doc.createEvent(family);
    var init_fn = 'init' + init_fam;
    var init = typeof ev[init_fn] === 'function' ? init_fn : 'initEvent';

    var sig = initSignatures[init];
    var args = [];
    var used = {};

    opts.type = type;
    for (var i = 0; i < sig.length; ++i) {
        var key = sig[i];
        var val = opts[key];
        // if no user specified value, then use event default
        if (val === undefined) {
            val = ev[key];
        }
        used[key] = true;
        args.push(val);
    }
    ev[init].apply(ev, args);

    // webkit key event issue workaround
    if (family === 'KeyboardEvent') {
        ev = check_kb(ev, opts);
    }

    // attach remaining unused options to the object
    for (var key in opts) {
        if (!used[key]) {
            ev[key] = opts[key];
        }
    }

    return ev;
};

var legacy = function (type, opts) {
    opts = opts || {};
    var ev = doc.createEventObject();

    ev.type = type;
    for (var key in opts) {
        if (opts[key] !== undefined) {
            ev[key] = opts[key];
        }
    }

    return ev;
};

// expose either the modern version of event generation or legacy
// depending on what we support
// avoids if statements in the code later
module.exports = doc.createEvent ? modern : legacy;

var initSignatures = require('./init.json');
var types = require('./types.json');
var typeOf = (function () {
    var typs = {};
    for (var key in types) {
        var ts = types[key];
        for (var i = 0; i < ts.length; i++) {
            typs[ts[i]] = key;
        }
    }

    return function (name) {
        return typs[name] || 'Event';
    };
})();

},{"./init.json":4,"./types.json":5}],4:[function(require,module,exports){
module.exports={
  "initEvent" : [
    "type",
    "bubbles",
    "cancelable"
  ],
  "initUIEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "view",
    "detail"
  ],
  "initMouseEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "view",
    "detail",
    "screenX",
    "screenY",
    "clientX",
    "clientY",
    "ctrlKey",
    "altKey",
    "shiftKey",
    "metaKey",
    "button",
    "relatedTarget"
  ],
  "initMutationEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "relatedNode",
    "prevValue",
    "newValue",
    "attrName",
    "attrChange"
  ],
  "initKeyboardEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "view",
    "ctrlKey",
    "altKey",
    "shiftKey",
    "metaKey",
    "keyCode",
    "charCode"
  ],
  "initKeyEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "view",
    "ctrlKey",
    "altKey",
    "shiftKey",
    "metaKey",
    "keyCode",
    "charCode"
  ]
}

},{}],5:[function(require,module,exports){
module.exports={
  "MouseEvent" : [
    "click",
    "mousedown",
    "mouseup",
    "mouseover",
    "mousemove",
    "mouseout"
  ],
  "KeyboardEvent" : [
    "keydown",
    "keyup",
    "keypress"
  ],
  "MutationEvent" : [
    "DOMSubtreeModified",
    "DOMNodeInserted",
    "DOMNodeRemoved",
    "DOMNodeRemovedFromDocument",
    "DOMNodeInsertedIntoDocument",
    "DOMAttrModified",
    "DOMCharacterDataModified"
  ],
  "HTMLEvents" : [
    "load",
    "unload",
    "abort",
    "error",
    "select",
    "change",
    "submit",
    "reset",
    "focus",
    "blur",
    "resize",
    "scroll"
  ],
  "UIEvent" : [
    "DOMFocusIn",
    "DOMFocusOut",
    "DOMActivate"
  ]
}

},{}],6:[function(require,module,exports){
var getNative = require('../internal/getNative');

/* Native method references for those with the same name as other `lodash` methods. */
var nativeNow = getNative(Date, 'now');

/**
 * Gets the number of milliseconds that have elapsed since the Unix epoch
 * (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @category Date
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => logs the number of milliseconds it took for the deferred function to be invoked
 */
var now = nativeNow || function() {
  return new Date().getTime();
};

module.exports = now;

},{"../internal/getNative":9}],7:[function(require,module,exports){
var isObject = require('../lang/isObject'),
    now = require('../date/now');

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/* Native method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed invocations. Provide an options object to indicate that `func`
 * should be invoked on the leading and/or trailing edge of the `wait` timeout.
 * Subsequent calls to the debounced function return the result of the last
 * `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
 * on the trailing edge of the timeout only if the the debounced function is
 * invoked more than once during the `wait` timeout.
 *
 * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options] The options object.
 * @param {boolean} [options.leading=false] Specify invoking on the leading
 *  edge of the timeout.
 * @param {number} [options.maxWait] The maximum time `func` is allowed to be
 *  delayed before it is invoked.
 * @param {boolean} [options.trailing=true] Specify invoking on the trailing
 *  edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // avoid costly calculations while the window size is in flux
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // invoke `sendMail` when the click event is fired, debouncing subsequent calls
 * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // ensure `batchLog` is invoked once after 1 second of debounced calls
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', _.debounce(batchLog, 250, {
 *   'maxWait': 1000
 * }));
 *
 * // cancel a debounced call
 * var todoChanges = _.debounce(batchLog, 1000);
 * Object.observe(models.todo, todoChanges);
 *
 * Object.observe(models, function(changes) {
 *   if (_.find(changes, { 'user': 'todo', 'type': 'delete'})) {
 *     todoChanges.cancel();
 *   }
 * }, ['delete']);
 *
 * // ...at some point `models.todo` is changed
 * models.todo.completed = true;
 *
 * // ...before 1 second has passed `models.todo` is deleted
 * // which cancels the debounced `todoChanges` call
 * delete models.todo;
 */
function debounce(func, wait, options) {
  var args,
      maxTimeoutId,
      result,
      stamp,
      thisArg,
      timeoutId,
      trailingCall,
      lastCalled = 0,
      maxWait = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = wait < 0 ? 0 : (+wait || 0);
  if (options === true) {
    var leading = true;
    trailing = false;
  } else if (isObject(options)) {
    leading = options.leading;
    maxWait = 'maxWait' in options && nativeMax(+options.maxWait || 0, wait);
    trailing = 'trailing' in options ? options.trailing : trailing;
  }

  function cancel() {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (maxTimeoutId) {
      clearTimeout(maxTimeoutId);
    }
    maxTimeoutId = timeoutId = trailingCall = undefined;
  }

  function delayed() {
    var remaining = wait - (now() - stamp);
    if (remaining <= 0 || remaining > wait) {
      if (maxTimeoutId) {
        clearTimeout(maxTimeoutId);
      }
      var isCalled = trailingCall;
      maxTimeoutId = timeoutId = trailingCall = undefined;
      if (isCalled) {
        lastCalled = now();
        result = func.apply(thisArg, args);
        if (!timeoutId && !maxTimeoutId) {
          args = thisArg = null;
        }
      }
    } else {
      timeoutId = setTimeout(delayed, remaining);
    }
  }

  function maxDelayed() {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    maxTimeoutId = timeoutId = trailingCall = undefined;
    if (trailing || (maxWait !== wait)) {
      lastCalled = now();
      result = func.apply(thisArg, args);
      if (!timeoutId && !maxTimeoutId) {
        args = thisArg = null;
      }
    }
  }

  function debounced() {
    args = arguments;
    stamp = now();
    thisArg = this;
    trailingCall = trailing && (timeoutId || !leading);

    if (maxWait === false) {
      var leadingCall = leading && !timeoutId;
    } else {
      if (!maxTimeoutId && !leading) {
        lastCalled = stamp;
      }
      var remaining = maxWait - (stamp - lastCalled),
          isCalled = remaining <= 0 || remaining > maxWait;

      if (isCalled) {
        if (maxTimeoutId) {
          maxTimeoutId = clearTimeout(maxTimeoutId);
        }
        lastCalled = stamp;
        result = func.apply(thisArg, args);
      }
      else if (!maxTimeoutId) {
        maxTimeoutId = setTimeout(maxDelayed, remaining);
      }
    }
    if (isCalled && timeoutId) {
      timeoutId = clearTimeout(timeoutId);
    }
    else if (!timeoutId && wait !== maxWait) {
      timeoutId = setTimeout(delayed, wait);
    }
    if (leadingCall) {
      isCalled = true;
      result = func.apply(thisArg, args);
    }
    if (isCalled && !timeoutId && !maxTimeoutId) {
      args = thisArg = null;
    }
    return result;
  }
  debounced.cancel = cancel;
  return debounced;
}

module.exports = debounce;

},{"../date/now":6,"../lang/isObject":13}],8:[function(require,module,exports){
/**
 * Converts `value` to a string if it's not one. An empty string is returned
 * for `null` or `undefined` values.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  if (typeof value == 'string') {
    return value;
  }
  return value == null ? '' : (value + '');
}

module.exports = baseToString;

},{}],9:[function(require,module,exports){
var isNative = require('../lang/isNative');

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = object == null ? undefined : object[key];
  return isNative(value) ? value : undefined;
}

module.exports = getNative;

},{"../lang/isNative":11}],10:[function(require,module,exports){
/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

module.exports = isObjectLike;

},{}],11:[function(require,module,exports){
var escapeRegExp = require('../string/escapeRegExp'),
    isObjectLike = require('../internal/isObjectLike');

/** `Object#toString` result references. */
var funcTag = '[object Function]';

/** Used to detect host constructors (Safari > 5). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  escapeRegExp(fnToString.call(hasOwnProperty))
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (objToString.call(value) == funcTag) {
    return reIsNative.test(fnToString.call(value));
  }
  return isObjectLike(value) && reIsHostCtor.test(value);
}

module.exports = isNative;

},{"../internal/isObjectLike":10,"../string/escapeRegExp":14}],12:[function(require,module,exports){
var isObjectLike = require('../internal/isObjectLike');

/** `Object#toString` result references. */
var numberTag = '[object Number]';

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/**
 * Checks if `value` is classified as a `Number` primitive or object.
 *
 * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are classified
 * as numbers, use the `_.isFinite` method.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isNumber(8.4);
 * // => true
 *
 * _.isNumber(NaN);
 * // => true
 *
 * _.isNumber('8.4');
 * // => false
 */
function isNumber(value) {
  return typeof value == 'number' || (isObjectLike(value) && objToString.call(value) == numberTag);
}

module.exports = isNumber;

},{"../internal/isObjectLike":10}],13:[function(require,module,exports){
/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = isObject;

},{}],14:[function(require,module,exports){
var baseToString = require('../internal/baseToString');

/**
 * Used to match `RegExp` [special characters](http://www.regular-expressions.info/characters.html#special).
 * In addition to special characters the forward slash is escaped to allow for
 * easier `eval` use and `Function` compilation.
 */
var reRegExpChars = /[.*+?^${}()|[\]\/\\]/g,
    reHasRegExpChars = RegExp(reRegExpChars.source);

/**
 * Escapes the `RegExp` special characters "\", "/", "^", "$", ".", "|", "?",
 * "*", "+", "(", ")", "[", "]", "{" and "}" in `string`.
 *
 * @static
 * @memberOf _
 * @category String
 * @param {string} [string=''] The string to escape.
 * @returns {string} Returns the escaped string.
 * @example
 *
 * _.escapeRegExp('[lodash](https://lodash.com/)');
 * // => '\[lodash\]\(https:\/\/lodash\.com\/\)'
 */
function escapeRegExp(string) {
  string = baseToString(string);
  return (string && reHasRegExpChars.test(string))
    ? string.replace(reRegExpChars, '\\$&')
    : string;
}

module.exports = escapeRegExp;

},{"../internal/baseToString":8}],15:[function(require,module,exports){
'use strict';

/** @module RangeSlider */

var clamp = require('clamp');
var isNumber = require('lodash/lang/isNumber');
var isObject = require('lodash/lang/isObject');
var debounce = require('lodash/function/debounce');
var eve = require('dom-events');

var MAX_SET_BY_DEFAULT = 100;
var HANDLE_RESIZE_DEBOUNCE = 100;
var RANGE_CLASS = 'rangeslider';
var FILL_CLASS = 'rangeslider__fill';
var FILL_BG_CLASS = 'rangeslider__fill__bg';
var HANDLE_CLASS = 'rangeslider__handle';
var DISABLED_CLASS = 'rangeslider--disabled';
var STEP_SET_BY_DEFAULT = 1;

var pluginName = 'rangeslider-js';
var pluginIdentifier = 0;

/**
 * Check if a `element` is visible in the DOM
 *
 * @param  {Element}  element
 * @return {Boolean}
 */
function isHidden(element) {
    return !!(element.offsetWidth === 0 || element.offsetHeight === 0 || element.open === false);
}

function isString(obj) {
     return obj === '' + obj;
 }

 function isNumberLike(obj) {
     return (obj !== null && obj !== undefined && (isString(obj) && isFinite(parseFloat(obj)) || (isFinite(obj))));
 }

 function getFirsNumberLike() {
     if (!arguments.length) {
         return null;
     }
     for (var i = 0, len = arguments.length; i < len; i++) {
         if (isNumberLike(arguments[i])) {
             return arguments[i];
         }
     }
 }
/**
 * Get hidden parentNodes of an `element`
 *
 * @param  {Element} element
 * @return {Element[]}
 */
function getHiddenParentNodes(element) {

    var parents = [],
        node = element.parentNode;

    while (isHidden(node)) {
        parents.push(node);
        node = node.parentNode;
    }
    return parents;
}

/**
 * Returns dimensions for an element even if it is not visible in the DOM.
 *
 * @param  {Element} element
 * @param  {string}  key     (e.g. offsetWidth …)
 * @return {Number}
 */
function getDimension(element, key) {

    var hiddenParentNodes = getHiddenParentNodes(element),
        hiddenParentNodesLength = hiddenParentNodes.length,
        displayProperty = [],
        dimension = element[key],
        hiddenStyles, i;

    // Used for native `<details>` elements
    function toggleOpenProperty(element) {
        if (typeof element.open !== 'undefined') {
            element.open = !element.open;
        }
    }

    if (hiddenParentNodesLength) {

        for (i = 0; i < hiddenParentNodesLength; i++) {
            hiddenStyles = hiddenParentNodes[i].style;
            // Cache the display property to restore it later.
            displayProperty[i] = hiddenStyles.display;
            hiddenStyles.display = 'block';
            hiddenStyles.height = '0';
            hiddenStyles.overflow = 'hidden';
            hiddenStyles.visibility = 'hidden';

            toggleOpenProperty(hiddenParentNodes[i]);
        }

        dimension = element[key];

        for (i = 0; i < hiddenParentNodesLength; i++) {
            hiddenStyles = hiddenParentNodes[i].style;
            toggleOpenProperty(hiddenParentNodes[i]);
            hiddenStyles.display = displayProperty[i];
            hiddenStyles.height = '';
            hiddenStyles.overflow = '';
            hiddenStyles.visibility = '';
        }
    }
    return dimension;
}

/**
 *
 * @param {HTMLElement} el
 * @param {function} callback
 * @param {boolean} andForElement - apply callback for el
 * @returns {HTMLElement}
 */
function forEachAncestors(el, callback, andForElement) {
    if (andForElement) {
        callback(el);
    }
    while (el.parentNode && !callback(el)) {
        el = el.parentNode;
    }
    return el;
}

/**
 * @param {Object} referenceNode after this
 * @param {Object} newNode insert this
 */
function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

/**
 * RangeSlider
 * @param {HTMLElement} el
 * @param {object} options
 * @property {number} [options.min]
 * @property {number} [options.max]
 * @property {number} [options.value]
 * @property {number} [options.step]
 * @property {function} [options.onInit] - init callback
 * @property {function} [options.onSlideStart] - slide start callback
 * @property {function} [options.onSlide] - slide callback
 * @property {function} [options.onSlideEnd] - slide end callback
 */
function RangeSlider(el, options) {

    options = options || {};

    this.element = el;
    this.options = options;

    this.onSlideEventsCount = -1;
    this.isInteracting = false;
    this.needTriggerEvents = false;

    this.identifier = 'js-' + pluginName + '-' + (pluginIdentifier++);

    this.min = getFirsNumberLike(options.min, parseFloat(el.getAttribute('min')), 0);
    this.max = getFirsNumberLike(options.max, parseFloat(el.getAttribute('max')), MAX_SET_BY_DEFAULT);
    this.value = getFirsNumberLike(options.value, parseFloat(el.value), this.min + (this.max - this.min) / 2);
    this.step = getFirsNumberLike(options.step, el.getAttribute('step'), STEP_SET_BY_DEFAULT);

    this.percent = null;
    this._updatePercentFromValue();
    this.toFixed = this._toFixed(this.step);

    this.fillBg = document.createElement('div');
    this.fillBg.className = FILL_BG_CLASS;

    this.fill = document.createElement('div');
    this.fill.className = FILL_CLASS;

    this.handle = document.createElement('div');
    this.handle.className = HANDLE_CLASS;

    this.range = document.createElement('div');
    this.range.className = RANGE_CLASS;
    this.range.id = this.identifier;

    this.range.appendChild(this.handle);
    this.range.appendChild(this.fillBg);
    this.range.appendChild(this.fill);

    this._setValue(this.value, true);
    el.setAttribute('min', '' + this.min);
    el.setAttribute('max', '' + this.max);
    el.setAttribute('step', '' + this.step);

    insertAfter(el, this.range);

    el.style.position = 'absolute';
    el.style.width = '1px';
    el.style.height = '1px';
    el.style.overflow = 'hidden';
    el.style.opacity = '0';

    // Store context
    //this._handleResize = this._handleResize.bind(this);
    this._handleDown = this._handleDown.bind(this);
    this._handleMove = this._handleMove.bind(this);
    this._handleEnd = this._handleEnd.bind(this);
    this._startEventListener = this._startEventListener.bind(this);
    this._changeEventListener = this._changeEventListener.bind(this);

    this._init();

    //// Attach Events
    window.addEventListener('resize', debounce(this._handleResize.bind(this), HANDLE_RESIZE_DEBOUNCE), false);

    this.range.addEventListener('mousedown', this._startEventListener);
    this.range.addEventListener('touchstart', this._startEventListener);
    this.range.addEventListener('pointerdown', this._startEventListener);


    // Listen to programmatic value changes
    el.addEventListener('change', this._changeEventListener);
}

RangeSlider.prototype.constructor = RangeSlider;

/**
 *
 * @param step
 * @returns {number}
 * @private
 */
RangeSlider.prototype._toFixed = function (step) {
    return (step + '').replace('.', '').length - 1;
};

/**
 *
 * @private
 */
RangeSlider.prototype._init = function () {
    if (this.options.onInit) {
        this.options.onInit();
    }
    this._update();
};

/**
 *
 * @private
 */
RangeSlider.prototype._updatePercentFromValue = function () {
    this.percent = (this.value - this.min) / (this.max - this.min);
};

/**
 * This method check if this.identifier exists in ev.target's ancestors
 * @param ev
 * @param data
 */
RangeSlider.prototype._startEventListener = function (ev, data) {
    var _this = this;
    var el = ev.target;
    var isEventOnSlider = false;

    forEachAncestors(el, function (el) {
        return (isEventOnSlider = el.id === _this.identifier && !el.classList.contains(DISABLED_CLASS));
    }, true);

    if (isEventOnSlider) {
        this._handleDown(ev, data);
    }
};

/**
 *
 * @param ev
 * @param data
 * @private
 */
RangeSlider.prototype._changeEventListener = function (ev, data) {
    if (data && data.origin === this.identifier) {
        return;
    }
    var value = ev.target.value;
    this._setPosition(this._getPositionFromValue(value));
};

/**
 *
 * @private
 */
RangeSlider.prototype._update = function () {

    this.handleWidth = getDimension(this.handle, 'offsetWidth');
    this.rangeWidth = getDimension(this.range, 'offsetWidth');
    this.maxHandleX = this.rangeWidth - this.handleWidth;
    this.grabX = this.handleWidth / 2;
    this.position = this._getPositionFromValue(this.value);

    this.range.classList[this.element.disabled ? 'add' : 'remove'](DISABLED_CLASS);

    this._setPosition(this.position);
    this._updatePercentFromValue();
    eve.emit(this.element, 'change');
};

/**
 *
 */
RangeSlider.prototype._handleResize = function () {
    this._update();
};

/**
 *
 * @param e
 * @private
 */
RangeSlider.prototype._handleDown = function (e) {

    this.isInteracting = true;
    e.preventDefault();
    document.addEventListener('mousemove', this._handleMove);
    document.addEventListener('touchmove', this._handleMove);
    document.addEventListener('pointermove', this._handleMove);

    document.addEventListener('mouseup', this._handleEnd);
    document.addEventListener('touchend', this._handleEnd);
    document.addEventListener('pointerup', this._handleEnd);

    // If we click on the handle don't set the new position
    if (e.target.classList.contains(HANDLE_CLASS)) {
        return;
    }

    var posX = this._getRelativePosition(e),
        rangeX = this.range.getBoundingClientRect().left,
        handleX = this._getPositionFromNode(this.handle) - rangeX;

    this._setPosition(posX - this.grabX);

    if (posX >= handleX && posX < handleX + this.handleWidth) {
        this.grabX = posX - handleX;
    }
    this._updatePercentFromValue();

};

/**
 *
 * @param e
 * @private
 */
RangeSlider.prototype._handleMove = function (e) {
    this.isInteracting = true;
    e.preventDefault();
    var posX = this._getRelativePosition(e);
    this._setPosition(posX - this.grabX);
};

/**
 *
 * @param e
 * @private
 */
RangeSlider.prototype._handleEnd = function (e) {
    e.preventDefault();

    document.removeEventListener('mousemove', this._handleMove);
    document.removeEventListener('touchmove', this._handleMove);
    document.removeEventListener('pointermove', this._handleMove);

    document.removeEventListener('mouseup', this._handleEnd);
    document.removeEventListener('touchend', this._handleEnd);
    document.removeEventListener('pointerup', this._handleEnd);

    eve.emit(this.element, 'change', {origin: this.identifier});

    if ((this.isInteracting || this.needTriggerEvents) && this.options.onSlideEnd) {
        this.options.onSlideEnd(this.value, this.percent, this.position);
    }
    this.onSlideEventsCount = 0;
    this.isInteracting = false;
};

/**
 *
 * @param pos
 * @private
 */
RangeSlider.prototype._setPosition = function (pos) {
    var value = this._getValueFromPosition(clamp(pos, 0, this.maxHandleX)),
        left = this._getPositionFromValue(value);

    // Update ui
    this.fill.style.width = (left + this.grabX) + 'px';
    this.handle.style.left = left + 'px';
    this._setValue(value);

    // Update globals
    this.position = left;
    this.value = value;
    this._updatePercentFromValue();

    if (this.isInteracting || this.needTriggerEventss) {
        if (this.options.onSlideStart && this.onSlideEventsCount === 0) {
            this.options.onSlideStart(this.value, this.percent, this.position);
        }

        if (this.options.onSlide) {
            this.options.onSlide(this.value, this.percent, this.position);
        }
    }

    this.onSlideEventsCount++;
};

// Returns element position relative to the parent
RangeSlider.prototype._getPositionFromNode = function (node) {
    var i = 0;
    while (node !== null) {
        i += node.offsetLeft;
        node = node.offsetParent;
    }
    return i;
};

/**
 *
 * @param {Event} e
 * @returns {number}
 */
RangeSlider.prototype._getRelativePosition = function (e) {
    // Get the offset left relative to the viewport
    var rangeX = this.range.getBoundingClientRect().left,
        orgEv = e.originalEvent,
        pageX = 0;

    if (typeof e.pageX !== 'undefined') {
        pageX = (e.touches && e.touches.length) ? e.touches[0].pageX : e.pageX;
    } else if (typeof orgEv.clientX !== 'undefined') {
        pageX = orgEv.clientX;
    } else if (orgEv.touches && orgEv.touches[0] && typeof orgEv.touches[0].clientX !== 'undefined') {
        pageX = orgEv.touches[0].clientX;
    } else if (e.currentPoint && typeof e.currentPoint.x !== 'undefined') {
        pageX = e.currentPoint.x;
    }

    return pageX - rangeX;
};

/**
 *
 * @param value
 * @returns {number|*}
 * @private
 */
RangeSlider.prototype._getPositionFromValue = function (value) {
    var percentage, pos;
    percentage = (value - this.min) / (this.max - this.min);
    pos = percentage * this.maxHandleX;
    return pos;
};

/**
 *
 * @param pos
 * @returns {number}
 * @private
 */
RangeSlider.prototype._getValueFromPosition = function (pos) {
    var percentage, value;
    percentage = ((pos) / (this.maxHandleX || 1));
    value = this.step * Math.round(percentage * (this.max - this.min) / this.step) + this.min;
    return Number((value).toFixed(this.toFixed));
};

/**
 *
 * @param value
 * @param force
 * @private
 */
RangeSlider.prototype._setValue = function (value, force) {

    if (value === this.value && !force) {
        return;
    }

    // Set the new value and fire the `input` event
    this.element.value = value;
    this.value = value;
    eve.emit(this.element, 'input', {origin: this.identifier});

};


/**
 *
 * @param {Object} obj like {min : Number, max : Number, value : Number, step : Number}
 * @param {Boolean} triggerEvents
 * @returns {RangeSlider}
 */
RangeSlider.prototype.update = function (obj, triggerEvents) {
    if (triggerEvents) {
        this.needTriggerEvents = true;
    }
    if (isObject(obj)) {
        if (isNumber(obj.min)) {
            this.element.setAttribute('min', '' + obj.min);
            this.min = obj.min;
        }

        if (isNumber(obj.max)) {
            this.element.setAttribute('max', '' + obj.max);
            this.max = obj.max;
        }

        if (isNumber(obj.step)) {
            this.element.setAttribute('step', '' + obj.step);
            this.step = obj.step;
            this.toFixed = this._toFixed(obj.step);
        }

        if (isNumber(obj.value)) {
            this._setValue(obj.value);
        }
    }

    this._update();
    this.onSlideEventsCount = 0;
    this.needTriggerEvents = false;
    return this;
};

/**
 *
 */
RangeSlider.prototype.destroy = function () {

    window.removeEventListener('resize', this._handleResize, false);

    this.range.removeEventListener('mousedown', this._startEventListener);
    this.range.removeEventListener('touchstart', this._startEventListener);
    this.range.removeEventListener('pointerdown', this._startEventListener);

    this.element.removeEventListener('change', this._changeEventListener);

    this.element.style.cssText = '';
    delete this.element[pluginName];

    // Remove the generated markup
    this.range.parentNode.removeChild(this.range);
};

/**
 * A lightweight plugin wrapper around the constructor, preventing multiple instantiations
 * @param {Element|NodeList} el
 * @param {object} options
 */
RangeSlider.create = function (el, options) {
    function createInstance(el) {
        el[pluginName] = el[pluginName] || new RangeSlider(el, options);
    }

    if (el.length) {
        Array.prototype.slice.call(el).forEach(function (el) {
            createInstance(el);
        });
    } else {
        createInstance(el);
    }
};

module.exports = RangeSlider;

},{"clamp":1,"dom-events":2,"lodash/function/debounce":7,"lodash/lang/isNumber":12,"lodash/lang/isObject":13}]},{},[15])(15)
});