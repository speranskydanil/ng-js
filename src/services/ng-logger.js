ng.service('logger', [], function () {
  'use strict';

  return {
    level: 'info',

    log: function (level, message) {
      var levels = { debug: 40, info: 30, warn: 20, error: 10 };
      var styles = { warn: 'color: #e82', error: 'color: red' };

      if (levels[this.level] < levels[level]) return;

      console.log('%c' + level + ':', styles[level], message);
    }
  };
});

