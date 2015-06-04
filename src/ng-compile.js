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

