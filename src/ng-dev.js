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

