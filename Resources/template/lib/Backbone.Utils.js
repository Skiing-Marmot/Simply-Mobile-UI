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
Backbone.Collection.prototype.update = function(models, opts) {
    opts = opts || {};

    var idAttr;
    if (this.idAttribute) {
    	idAttr = this.idAttribute;
    } 
    else {
    	idAttr = this.model.prototype.idAttribute;
    }
    var ids = [], currentIds = this.pluck(idAttr), newIds = _(models).pluck(idAttr), missingIds; 

    if (opts.removeMissing) {
        missingIds = _(currentIds).difference(newIds);
        this.remove(missingIds);
    }

    _(models).each(function(model) {
        var existing = this.get(model[idAttr]);
        if (existing) {
            existing.set(model);
        } else {
            this.add(model);
        }
    }, this);
    return this;
};

var nestCollection = function(model, attributeName, nestedCollection, opts) {
    //setup nested references
    for (var i = 0; i < nestedCollection.length; i++) {
        model.attributes[attributeName][i] = nestedCollection.at(i).attributes;
    }
    //create empty arrays if none
    nestedCollection.bind('add', function(initiative) {
        if (!model.get(attributeName)) {
            model.attributes[attributeName] = [];
        }
        model.get(attributeName).push(initiative.attributes);
    });

    nestedCollection.bind('remove', function(initiative) {
        var updateObj = {};
        updateObj[attributeName] = _.without(model.get(attributeName), initiative.attributes);
        model.set(updateObj);
    });

    model.on('change:' + attributeName, function(model, value, options) {
        opts = opts || {};
        var newValue = value;
        var oldValue = model.previousAttributes()[attributeName];

        var idAttr;
	    if (nestedCollection.idAttribute) {
	    	idAttr = nestedCollection.idAttribute;
	    } 
	    else {
	    	idAttr = nestedCollection.model.prototype.idAttribute;
	    }
        var currentIds = _.pluck(oldValue, idAttr), newIds = _.pluck(newValue, idAttr), missingIds;

        if (opts.removeMissing) {
            missingIds = _.difference(currentIds, newIds);
            nestedCollection.remove(missingIds);
            Ti.API.info('nested coll after remove: ' + JSON.stringify(nestedCollection));
        }
        Ti.API.debug('before toUpdate');
        var toUpdate = _.filter(newValue, function(_value) {
            var include = function(obj, target) {
                var found = false;
                if (obj == null) {
                    return found;
                }
                // if (Array.prototype.indexOf && obj.indexOf === Array.prototype.indexOf) {
                // return obj.indexOf(target) != -1;
                // }
                found = _.any(obj, function(value) { {
                        return _.isEqual(value, target);
                    }
                });
                return found;
            };
            return !include(oldValue, _value);
        });
        Ti.API.info('toUpdate: ' + JSON.stringify(toUpdate));
        _.each(toUpdate, function(_model) {
            var existing = nestedCollection.get(_model[idAttr]);
            if (existing) {
                existing.set(_model);
            } else {
                nestedCollection.add(_model);
            }
        });
        Ti.API.info('Updated collection: ' + JSON.stringify(nestedCollection));
    });

    return nestedCollection;
};
