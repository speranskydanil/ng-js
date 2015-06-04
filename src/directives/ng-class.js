ng.directive('ng-class', ['_'], function (_) {
  return {
    link: function (scope, el, attrs) {
      var expression = attrs[this.name];

      scope.$watch(expression, function (hash) {
        _.each(hash, function (state, name) {
          el.toggleClass(name, state);
        });
      });
    }
  };
});

