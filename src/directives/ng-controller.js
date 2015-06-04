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

