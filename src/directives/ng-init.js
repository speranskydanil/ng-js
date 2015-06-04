ng.directive('ng-init', [], function () {
  return {
    priority: 5,
    link: function (scope, el, attrs) {
      scope.$run(attrs[this.name]);
    }
  };
});

