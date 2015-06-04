var ng = (function () {
  'use strict';

  var rcache = {};

  var ng = {
    controllers: {},

    controller: function (name, deps, func) {
      ng.controllers[name] = {
        name: name,
        deps: deps,
        func: func,
        init: function (scope) {
          func.apply(scope, ng.resolveAll(deps));
        }
      };
    },

    directives: {},

    directive: function (name, deps, func) {
      var _ = ng.resolve('_');

      ng.directives[name] = {
        name: name,
        deps: deps,
        func: func,
        init: function () {
          var directiveObject = func.apply(this, ng.resolveAll(deps));

          _.defaults(directiveObject, {
            name:     name,
            priority: 0,
            link:     function () {},
            terminal: false,
            scope:    false
          });

          return directiveObject;
        }
      };
    },

    services: {},

    service: function (name, deps, func) {
      ng.services[name] = func;
      func.deps = deps;
    },

    value: function (name, deps, object) {
      ng.service(name, deps, function () { return object; });
    },

    resolve: function (name) {
      var _ = ng.services._();

      var logger = ng.services.logger();

      var service = ng.services[name];

      if (!service) {
        logger.log('error', 'ng.resolve - no service called ' + name);
        return;
      }

      rcache[name] = rcache[name] || service.apply(null, _.map(service.deps, function (d) { return ng.resolve(d); }));

      return rcache[name];
    },

    resolveAll: function (names) {
      var _ = ng.resolve('_');
      return _.map(names, function (d) { return ng.resolve(d); });
    }
  };

  return ng;
})();


// "$" service -- jquery wrapper

(function ($) {
  if ($) ng.value('$', [], $);
})(window.jQuery);


ng.service('logger', [], function () {
  'use strict';

  return {
    level: 'info',

    log: function (level, message) {
      var levels = { debug: 40, info: 30, warn: 20, error: 10 };
      var styles = { warn: 'color: #e82', error: 'color: red' };

      if (levels[this.level] < levels[level]) return;

      console.log('%c' + level + ':', styles[level], message);
    }
  };
});


// "_" service -- underscore.js subset
// each
// map
// reduce
// reduceRight
// find
// filter
// where
// findWhere
// reject
// all
// any
// includes
// invoke
// pluck
// sortBy
// toArray
// flatten
// without
// indexOf
// lastIndexOf
// findIndex
// findLastIndex
// bind
// keys
// allKeys
// values
// create
// extend
// extendOwn
// pick
// omit
// defaults
// clone
// has
// isEqual
// isEmpty
// isArray
// isObject
// isFunction
// isString
// isNumber
// isBoolean
// isNaN
// isNull
// isUndefined

(function () {
  if (window._) {
    ng._ = window._;
    return;
  }

  var _ = ng._ = function () {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push           = ArrayProto.push,
    slice          = ArrayProto.slice,
    toString       = ObjProto.toString,
    hasOwnProperty = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray = Array.isArray,
    nativeKeys    = Object.keys,
    nativeBind    = FuncProto.bind,
    nativeCreate  = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function () {};

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  // Utility Functions
  // -----------------

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  _.property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = _.property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Array Functions
  // ---------------

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };
})();

(function (_) {
  ng.value('_', [], _);
})(ng._);

ng._ = null;


(function () {
  'use strict';

  var _ = ng.resolve('_');

  ng.scope = {
    $children: [],
    $watchers: [],

    $create: function () {
      var scope = _.create(this, { $parent: this, $children: [], $watchers: [] });

      this.$children.push(scope);

      return scope;
    },

    $destroy: function () {
      this.$parent.$children = _.without(this.$parent.$children, this);
    },

    $watch: function (expression, callback) {
      var self = this;

      var watcher = {
        expression: expression,

        callback: callback,

        value: function () {
          return self.$get(this.expression);
        },

        destroy: function () {
          self.$watchers = _.without(self.$watchers, this);
        }
      };

      this.$watchers.push(watcher);

      return watcher;
    },

    $get: function (expression) {
      return ng.parse(this, expression).get();
    },

    $set: function (expression, value) {
      return ng.parse(this, expression).set(value);
    },

    $run: function (expression) {
      return ng.parse(this, expression).run();
    },

    $inspect: function () {
      var self = this;

      var object = _.omit(self, function (v, k) {
        return !self.hasOwnProperty(k) || k.startsWith('$') || (_.isObject(self[k]) && self[k].$run);
      });

      return JSON.stringify(object, null, 2);
    }
  };
})();


(function () {
  'use strict';

  var _ = ng.resolve('_');

  var logger = ng.resolve('logger');

  ng.parse = function (scope, expression) {
    return {
      get: function () {
        var toEval = varDefinitions(scope) + 'var ngResult = ' + expression + '; ngResult';
        return evalCodeInContext(toEval, scope, expression);
      },

      set: function (value) {
        if (!_.isNumber(value) && !_.isBoolean(value)) value = '"' + value + '"';

        if (expression.indexOf('.') == -1) expression = 'this.' + expression;

        var toEval = varDefinitions(scope) + expression + '=' + value;
        return evalCodeInContext(toEval, scope, expression);
      },

      run: function () {
        return this.get();
      }
    };
  };

  function varDefinitions (scope) {
    return _.map(_.allKeys(scope).reverse(), function (key) {
      if (_.isFunction(scope[key])) {
        return 'var ' + key + ' = _.bind(this["' + key + '"], this);';
      } else {
        return 'var ' + key + ' = this["' + key + '"];';
      }
    }).join(' ');
  }

  function evalCodeInContext(code, context, expression) {
    try {
      return function () { return eval(code); }.call(context);
    } catch (err) {
      logger.log('error', 'ng-parse - could not evaluate `' + expression + '`');
      logger.log('error', err);
      logger.log('error', { code: code, context: context });
    }
  }
})();


(function () {
  'use strict';

  var _ = ng.resolve('_');
  var $ = ng.resolve('$');

  var logger = ng.resolve('logger');

  ng.compile = function (scope, el) {
    if (!scope) scope = ng.scope;
    if (!el)    el    = $('*[ng-app]');

    if (!el.length) return;

    var terminal = false;

    var directives = _.sortBy(_.invoke(_.values(ng.directives), 'init'), 'priority').reverse();

    _.each(directives, function (directive) {
      if (el.attr(directive.name)) {
        logger.log('debug', 'ng.compile ' + ng.signature(el));

        var attrs = {};
        _.each(el.get(0).attributes, function (attr) {
          if (attr.specified) {
            attrs[attr.name] = attr.value;
          }
        });

        if (directive.terminal) terminal = true;

        if (directive.scope) scope = scope.$create();

        directive.link(scope, el, attrs);
      }
    });

    if (terminal) return;

    el.children().each(function () {
      ng.compile(scope, $(this));
    });
  };
})();


(function () {
  'use strict';

  var _ = ng.resolve('_');

  var logger = ng.resolve('logger');

  ng.apply = function (scope) {
    if (!scope) scope = ng.scope;

    var dirty = true;
    var attempt = 1;

    while (dirty && attempt <= 5) {
      logger.log('debug', 'ng.apply attempt: ' + attempt);

      dirty = ng.digest(scope);
      attempt += 1;
    }
  };

  ng.digest = function (scope) {
    if (!scope) scope = ng.scope;

    var dirty = !!scope.$watchers.length;

    _.each(scope.$watchers, function (watcher) {
      logger.log('debug', 'ng.digest expression: ' + watcher.expression);

      var value = watcher.value();

      if (_.isEqual(watcher.oldValue, value)) {
        dirty = false;
      } else {
        logger.log('debug', 'ng.digest callback call');
        watcher.callback(value);
      }

      watcher.oldValue = _.clone(value);
    });

    return _.any(_.map(scope.$children, function (cs) { return ng.digest(cs); })) || dirty;
  };
})();


ng.directive('ng-bind', [], function () {
  return {
    link: function (scope, el, attrs) {
      var expression = attrs[this.name];

      scope.$watch(expression, function (value) {
        el.html(value);
      });
    }
  };
});


ng.directive('ng-change', [], function () {
  return {
    link: function (scope, el, attrs) {
      var expression = attrs[this.name];

      el.change(function () {
        scope.$run(expression);
        ng.apply();
      });
    }
  };
});


ng.directive('ng-class', ['_'], function (_) {
  return {
    link: function (scope, el, attrs) {
      var expression = attrs[this.name];

      scope.$watch(expression, function (hash) {
        _.each(hash, function (state, name) {
          el.toggleClass(name, state);
        });
      });
    }
  };
});


ng.directive('ng-click', [], function () {
  return {
    link: function (scope, el, attrs) {
      var expression = attrs[this.name];

      el.click(function (e) {
        e.preventDefault();

        scope.$run(expression);
        ng.apply();
      });
    }
  };
});


ng.directive('ng-controller', ['$'], function ($) {
  return {
    priority: 10,
    terminal: true,
    scope: true,
    link: function (scope, el, attrs) {
      var tokens = attrs[this.name].split(' ');

      var controllerName = tokens[0];
      var scopeReference = tokens[2];

      if (scopeReference) scope[scopeReference] = scope;

      var controller = ng.controllers[controllerName];
      if (controller) controller.init(scope);

      scope.$controller = controllerName;

      el.children().each(function () {
        ng.compile(scope, $(this));
      });
    }
  };
});


ng.directive('ng-hide', [], function () {
  return {
    link: function (scope, el, attrs) {
      var expression = attrs[this.name];

      scope.$watch(expression, function (value) {
        el.toggle(!value);
      });
    }
  };
});


ng.directive('ng-init', [], function () {
  return {
    priority: 5,
    link: function (scope, el, attrs) {
      scope.$run(attrs[this.name]);
    }
  };
});


ng.directive('ng-model', ['_'], function (_) {
  return {
    link: function (scope, el, attrs) {
      var typeProperty = _.includes(['checkbox', 'radio'], el.prop('type')) ? 'type' : 'tagName';
      var type = el.prop(typeProperty).toLowerCase();

      var expression = attrs[this.name];

      scope.$watch(expression, function (value) {
        if (type == 'input' || type == 'select') el.val(value);
        if (type == 'textarea')                  el.html(value);
        if (type == 'checkbox')                  el.prop('checked', value);
        if (type == 'radio')                     el.prop('checked', el.val() == value);
      });

      el.on('change click keyup keypress', function () {
        var value = type == 'checkbox' ? el.prop('checked') : el.val();

        value = { bool: !!value, int: parseInt(value), float: parseFloat(value) }[attrs['ng-type']] || value;

        scope.$set(expression, value);
        ng.apply();
      });
    }
  };
});


ng.directive('ng-render', [], function () {
  return {
    link: function (scope, el, attrs) {
      var expression = attrs[this.name];

      scope.$watch(expression, function (value) {
        el.html(value);
        this.destroy();
      });
    }
  };
});


ng.directive('ng-repeat', ['_', '$'], function (_, $) {
  return {
    terminal: true,
    link: function (scope, el, attrs) {
      var tokens = attrs[this.name].split(' ');

      var objectExp     = tokens[0];
      var collectionExp = tokens[2];

      var childScopes = [];
      var childMarkup = el.html();

      scope.$watch(collectionExp, update);

      function update (collection) {
        _.invoke(childScopes, '$destroy');

        el.html('');

        _.each(collection, function (object) {
          var childScope = scope.$create();
          childScope[objectExp] = object;

          childScopes.push(childScope);

          var childEls = $(childMarkup).appendTo(el);

          childEls.each(function () {
            ng.compile(childScope, $(this));
          });
        });
      }
    }
  };
});


ng.directive('ng-show', [], function () {
  return {
    link: function (scope, el, attrs) {
      var expression = attrs[this.name];

      scope.$watch(expression, function (value) {
        el.toggle(value);
      });
    }
  };
});


(function () {
  'use strict';

  var _ = ng.resolve('_');
  var $ = ng.resolve('$');

  ng.controllerScopes = function (name, scope) {
    scope = scope || ng.scope;

    var scopes = _.flatten(_.map(scope.$children, function (s) { return ng.controllerScopes(name, s); }));

    if (_.has(scope, '$controller') && scope.$controller == name) scopes.push(scope);

    return scopes;
  };

  ng.scopeWatchers = function (scope) {
    scope = scope || ng.scope;
    return scope.$watchers.concat(_.flatten(_.map(scope.$children, function (s) { return ng.scopeWatchers(s); })));
  };

  ng.signature = function (el) {
    var div = $('<div>').append(el.clone().html(''));
    var signature = div.html();
    div.remove();
    return signature;
  };
})();


(function () {
  'use strict';

  var $ = ng.resolve('$');

  $(function () {
    ng.compile();
    ng.apply();
  });
})();

