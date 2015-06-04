ng.directive('ng-click', [], function () {
  return {
    link: function (scope, el, attrs) {
      var expression = attrs[this.name];

      el.click(function (e) {
        e.preventDefault();

        scope.$run(expression);
        ng.apply();
      });
    }
  };
});

