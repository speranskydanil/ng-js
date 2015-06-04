(function () {
  'use strict';

  var _ = ng.resolve('_');

  var logger = ng.resolve('logger');

  ng.apply = function (scope) {
    if (!scope) scope = ng.scope;

    var dirty = true;
    var attempt = 1;

    while (dirty && attempt <= 5) {
      logger.log('debug', 'ng.apply attempt: ' + attempt);

      dirty = ng.digest(scope);
      attempt += 1;
    }
  };

  ng.digest = function (scope) {
    if (!scope) scope = ng.scope;

    var dirty = !!scope.$watchers.length;

    _.each(scope.$watchers, function (watcher) {
      logger.log('debug', 'ng.digest expression: ' + watcher.expression);

      var value = watcher.value();

      if (_.isEqual(watcher.oldValue, value)) {
        dirty = false;
      } else {
        logger.log('debug', 'ng.digest callback call');
        watcher.callback(value);
      }

      watcher.oldValue = _.clone(value);
    });

    return _.any(_.map(scope.$children, function (cs) { return ng.digest(cs); })) || dirty;
  };
})();

