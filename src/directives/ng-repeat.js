ng.directive('ng-repeat', ['_', '$'], function (_, $) {
  return {
    terminal: true,
    link: function (scope, el, attrs) {
      var tokens = attrs[this.name].split(' ');

      var objectExp     = tokens[0];
      var collectionExp = tokens[2];

      var childScopes = [];
      var childMarkup = el.html();

      scope.$watch(collectionExp, update);

      function update (collection) {
        _.invoke(childScopes, '$destroy');

        el.html('');

        _.each(collection, function (object) {
          var childScope = scope.$create();
          childScope[objectExp] = object;

          childScopes.push(childScope);

          var childEls = $(childMarkup).appendTo(el);

          childEls.each(function () {
            ng.compile(childScope, $(this));
          });
        });
      }
    }
  };
});

