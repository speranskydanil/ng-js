ng.controller('Todo', ['_', 'storage'], function (_, storage) {
  var self = this;

  self.newItem = storage.get('newItem') || '';

  self.items = storage.get('items') || [];

  self.saveNewItemValue = function () {
    storage.set('newItem', self.newItem);
  }

  self.addItem = function () {
    self.items.push({ name: self.newItem });
    storage.set('items', self.items);
  };

  self.removeItem = function (item) {
    self.items = _.without(self.items, item);
    storage.set('items', self.items);
  }
});

ng.service('storage', ['_'], function (_) {
  return {
    get: function (key) {
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch (err) {
        return localStorage.getItem(key);
      }
    },
    set: function (key, value) {
      if (_.isObject(value) || _.isArray(value)) {
        value = JSON.stringify(value);
      }

      localStorage.setItem(key, value);
    }
  }
});

ng.controller('Forms', [], function () {
  this.name    = 'Speransky Danil';
  this.about   = 'Software Engineer';
  this.adult   = true;
  this.gender  = 'male';
  this.country = 'rus';
});

(function () {
  var _ = ng.resolve('_');

  var storage = ng.resolve('storage');

  if (!storage.get('items')) storage.set('items', _.map(_.range(1, 8), function (n) { return { name: 'My to-do item #' + n }; }));

  if (!storage.get('newItem')) storage.set('newItem', 'Yet another to-do item..');
})();

