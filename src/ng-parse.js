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

