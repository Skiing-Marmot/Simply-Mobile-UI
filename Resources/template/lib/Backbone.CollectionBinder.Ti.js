/*
Simply Mobile - Mobile Development Framework
Copyright (c) 2012 Model N, Jérôme Ueberschlag, Clémence Aucagne, Jean-Baptiste Pringuey

See the file license.txt for copying permission.
*/

(function() {

    if (!Backbone) {
        throw 'Please include Backbone.js before Backbone.ModelBinder.js';
    }

    if (!Backbone.ModelBinder) {
        throw 'Please include Backbone.ModelBinder.js before Backbone.CollectionBinder.js';
    }

    Backbone.CollectionBinder = function(elManagerFactory) {
        _.bindAll(this);

        this._elManagerFactory = elManagerFactory;
        if (!this._elManagerFactory)
            throw 'elManagerFactory must be defined.';

        // Let the factory just use the trigger function on the view binder
        this._elManagerFactory.trigger = this.trigger;
    };

    Backbone.CollectionBinder.VERSION = '0.1.1';

    _.extend(Backbone.CollectionBinder.prototype, Backbone.Events, {
        bind : function(collection, parentEl) {
            Ti.API.debug('CollectionBinder - bind');
            this.unbind();

            if (!collection)
                throw 'collection must be defined';
            if (!parentEl)
                throw 'parentEl must be defined';

            this._collection = collection;
            this._elManagerFactory.setParentEl(parentEl);

            Ti.API.debug('CollectionBinder - bind - before each');
            if (this._collection.length > 0) {
                this._collection.each(function(model) {
                    this._onCollectionAdd(model);
                }, this);
            }
            Ti.API.debug('CollectionBinder - bind - after each');

            this._collection.on('add', this._onCollectionAdd, this);
            Ti.API.debug('CollectionBinder - bind - after on add');
            this._collection.on('remove', this._onCollectionRemove, this);
            Ti.API.debug('CollectionBinder - bind - after on remove');
            this._collection.on('reset', this._onCollectionReset, this);
            Ti.API.debug('CollectionBinder - bind - after on reset');
        },

        unbind : function() {
            if (this._collection !== undefined) {
                this._collection.off('add', this._onCollectionAdd);
                this._collection.off('remove', this._onCollectionRemove);
                this._collection.off('reset', this._onCollectionReset);
            }

            this._removeAllElManagers();
        },

        getManagerForEl : function(el) {
            var i, elManager, elManagers = _.values(this._elManagers);

            for ( i = 0; i < elManagers.length; i++) {
                elManager = elManagers[i];

                if (elManager.isElContained(el)) {
                    return elManager;
                }
            }

            return undefined;
        },

        getManagerForModel : function(model) {
            var i, elManager, elManagers = _.values(this._elManagers);

            for ( i = 0; i < elManagers.length; i++) {
                elManager = elManagers[i];

                if (elManager.getModel() === model) {
                    return elManager;
                }
            }

            return undefined;
        },

        _onCollectionAdd : function(model) {
            Ti.API.debug('_onCollectionAdd: ' + JSON.stringify(model));
            this._elManagers[model.cid] = this._elManagerFactory.makeElManager(model);
            this._elManagers[model.cid].createEl();
        },

        _onCollectionRemove : function(model, collection, options) {
            this._removeElManager(model, options.index);
        },

        _onCollectionReset : function() {
            this._removeAllElManagers();

            this._collection.each(function(model) {
                this._onCollectionAdd(model);
            }, this);

            this.trigger('elsReset', this._collection);
        },

        _removeAllElManagers : function() {
        	var aliasElManagers = this._elManagers;
            _.each(this._elManagers, function(elManager) {
            	Ti.API.info('removeAllElManager');
                elManager.removeEl();
                delete this._elManagers[elManager._model.cid];
            }, this);
            delete this._elManagers;
            this._elManagers = {};
        },

        _removeElManager : function(model, index) {
            if (this._elManagers[model.cid] !== undefined) {
            	Ti.API.info('removeElManager ' + JSON.stringify(index));
                this._elManagers[model.cid].removeEl(index);
                delete this._elManagers[model.cid];
            }
        }
    });

    // The ElManagerFactory is used for els that are just html templates
    // elHtml - how the model's html will be rendered.  Must have a single root element (div,span).
    // bindings (optional) - either a string which is the binding attribute (name, id, data-name, etc.) or a normal bindings hash
    Backbone.CollectionBinder.ElManagerFactory = function(elHtml, bindings) {
        _.bindAll(this);

        this._elHtml = elHtml;
        this._bindings = bindings;

        if (! _.isString(this._elHtml))
            throw 'elHtml must be a valid html string';
    };

    _.extend(Backbone.CollectionBinder.ElManagerFactory.prototype, {
        setParentEl : function(parentEl) {
            this._parentEl = parentEl;
        },

        makeElManager : function(model) {

            var elManager = {
                _model : model,

                createEl : function() {

                    this._el = $(this._elHtml);
                    $(this._parentEl).append(this._el);

                    if (this._bindings) {
                        if (_.isString(this._bindings)) {
                            this._modelBinder = new Backbone.ModelBinder();
                            this._modelBinder.bind(this._model, this._el, Backbone.ModelBinder.createDefaultBindings(this._el, this._bindings));
                        } else if (_.isObject(this._bindings)) {
                            this._modelBinder = new Backbone.ModelBinder();
                            this._modelBinder.bind(this._model, this._el, this._bindings);
                        } else {
                            throw 'Unsupported bindings type, please use a boolean or a bindings hash';
                        }
                    }

                    this.trigger('elCreated', this._model, this._el);
                },

                removeEl : function() {
                    if (this._modelBinder !== undefined) {
                        this._modelBinder.unbind();
                    }

                    this._el.remove();
                    this.trigger('elRemoved', this._model, this._el);
                },

                isElContained : function(findEl) {
                    return this._el === findEl || $(this._el).has(findEl).length > 0;
                },

                getModel : function() {
                    return this._model;
                },

                getEl : function() {
                    return this._el;
                }
            };

            _.extend(elManager, this);
            return elManager;
        }
    });

    // The ViewManagerFactory is used for els that are created and owned by backbone views.
    // There is no bindings option because the view made by the viewCreator should take care of any binding
    // viewCreator - a callback that will create backbone view instances for a model passed to the callback
    Backbone.CollectionBinder.ViewManagerFactory = function(viewCreator) {
        Ti.API.info('Backbone.CollectionBinder.ViewManagerFactory');

        _.bindAll(this);
        this._viewCreator = viewCreator;

        if (!_.isFunction(this._viewCreator))
            throw 'viewCreator must be a valid function that accepts a model and returns a backbone view';
    };

    _.extend(Backbone.CollectionBinder.ViewManagerFactory.prototype, {
        setParentEl : function(parentEl) {
            this._parentEl = parentEl;
        },

        makeElManager : function(model) {
            var elManager = {

                _model : model,

                createEl : function() {
                    Ti.API.debug('MakeElManager: createEl - ' + JSON.stringify(this._model));
                    this._view = this._viewCreator(model);
                    //   $(this._parentEl).append(this._view.render(this._model).el);
                    if (this._parentEl._type == 'TableView') {
                        this._parentEl.appendRow(this._view.render(this._model).el);
                    } else {
                        this._parentEl.add(this._view.render(this._model).el);
                    }
                    this.trigger('elCreated', this._model, this._view);
                },

                removeEl : function(index) {
                    if (this._parentEl._type == 'TableView') {
	                    Ti.API.info('parentEl' + JSON.stringify(this._parentEl));
                    	if (index) {
	                        this._parentEl.deleteRow(index);
                    	}
                    } else {
                        this._parentEl.remove(this._view.el);
                    }
                    if (this._view.close !== undefined) {
                        this._view.close();
                    }
                    this.trigger('elRemoved', this._model, this._view);
                },

                isElContained : function(findEl) {
                    return this._view.el === findEl || this._view.$el.has(findEl).length > 0;
                },

                getModel : function() {
                    return this._model;
                },

                getEl : function() {
                    return this._view.el;
                }
            };

            _.extend(elManager, this);

            return elManager;
        }
    });

}).call(this);
