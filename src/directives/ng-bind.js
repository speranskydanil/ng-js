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

