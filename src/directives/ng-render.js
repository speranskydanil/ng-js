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

