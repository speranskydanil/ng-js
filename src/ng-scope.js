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

