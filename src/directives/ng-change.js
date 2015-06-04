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

