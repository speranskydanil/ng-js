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

