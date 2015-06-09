ng.directive('ng-model', ['_'], function (_) {
  return {
    link: function (scope, el, attrs) {
      var typeProperty = _.includes(['checkbox', 'radio'], el.prop('type')) ? 'type' : 'tagName';
      var type = el.prop(typeProperty).toLowerCase();

      var expression = attrs[this.name];

      scope.$watch(expression, function (value) {
        if ((type == 'input' || type == 'select') && value != el.val()) el.val(value);

        if (type == 'textarea') el.html(value);
        if (type == 'checkbox') el.prop('checked', value);
        if (type == 'radio')    el.prop('checked', el.val() == value);
      });

      el.on('change click keyup keypress', function () {
        var value = type == 'checkbox' ? el.prop('checked') : el.val();

        value = { bool: !!value, int: parseInt(value), float: parseFloat(value) }[attrs['ng-type']] || value;

        scope.$set(expression, value);
        ng.apply();
      });
    }
  };
});

