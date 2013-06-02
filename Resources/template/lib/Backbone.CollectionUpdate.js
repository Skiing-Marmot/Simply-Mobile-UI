/*
Simply Mobile - Mobile Development Framework
Copyright (c) 2012 Model N, Jérôme Ueberschlag, Clémence Aucagne, Jean-Baptiste Pringuey

See the file license.txt for copying permission.
*/

// rather than reset a collection, update iterates
// through each model.  if a model by the same idAttribute
// exists already, it is updated. if not, it is added. pass
// { removeMissing: true } if you'd like to remove existing
// models that are not found in the new data
Backbone.Collection.prototype.update = function(models, opts){
  opts = opts || {};

  var ids = [],
      idAttr = this.model.prototype.idAttribute,
      currentIds = this.pluck(idAttr),
      newIds     = _(models).pluck(idAttr),
      missingIds;

  if (opts.removeMissing) {
    missingIds = _(currentIds).difference(newIds);
    this.remove(missingIds);
  }

  _(models).each(function(model){
    var existing = this.get(model[idAttr]);
    if (existing) existing.set(model);
    else this.add(model);
    Ti.API.info('model : ' + JSON.stringify(model));
    Ti.API.info('existing : ' + JSON.stringify(existing));
  }, this);
  return this;
};