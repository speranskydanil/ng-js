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

