/**
 * @author Clémence
 */

function getView(_model, mode) {
    var type = _model.get("type");
    if (mode == "display")
	return new DisplayView({
	    model : _model,
	    tagName : getTagName(type)
	});
    if (mode == "config")
	return new ConfigView({
	    model : _model
	});
}

DisplayView = Backbone.View.extend({

    _modelBinder : undefined,

    initialize : function() {
	_.bindAll(this);
	this._modelBinder = new Backbone.ModelBinder();
	this.model.bind("destroy", this.close, this);
    },

    close : function() {
	this._modelBinder.unbind();
	this.off();
	this.undelegateEvents();
	this.remove();
    },

    render : function() {
	var that = this;

	if (this.model.get("type") == ComponentTypes.TEXTFIELD) {
	    this.$el.attr("type", "text");
	    this.$el.attr("readonly", true);
	} else if (this.model.get("type") == ComponentTypes.WINDOW) {
	    $("#windowName").html("Window name: " + this.model.get("_cid"));
	}

	this.$el.click(selectComponent);
	if (this.model.get("params.layout.value")) {
	    this.$el.addClass("view-component");
	    makeViewDroppable(this);
	} else {
	    this.$el.addClass("inline-component");
	}
	makeViewDraggable(this);
	
	if (this.model.children.length > 0) {
	    if (this.model.get("params.layout.value") == "vertical") {
		_.each(this.model.children.models, function(element, index, list) {
		    var _droppedView = getView(element, "display");
		    var droppedView = $(_droppedView.render().el);
		    droppedView.appendTo(that.$el);
		});
	    } else if (this.model.get("params.layout.value") == "horizontal") {
		_.each(this.model.children.models, function(element, index, list) {
		    var _droppedView = getView(element, "display");
		    var droppedView = $(_droppedView.render().el);
		    droppedView.css("float", "left");
		    droppedView.appendTo(that.$el);
		});
	    } else {
		// TODO
	    }
	}

	var bindings = getBindingForDisplay(this);
	this._modelBinder.bind(this.model, this.el, bindings);

	return this;
    }
});

function getTagName(type) {
    switch (type) {
    case ComponentTypes.WINDOW:
    case ComponentTypes.VIEW:
	return 'div';
    case ComponentTypes.TEXTFIELD:
	return 'input';
    case ComponentTypes.LABEL:
	return 'p';
    case ComponentTypes.BUTTON:
	return 'button';
    case ComponentTypes.WEBVIEW:
	return 'iframe';
    default:
	console.log("No tag name for that model type.");
	break;
    }
}

ConfigView = Backbone.View.extend({

    _modelBinder : undefined,
    tagName : 'div',

    initialize : function() {
	_.bindAll(this);
	this._modelBinder = new Backbone.ModelBinder();
	this.model.bind("destroy", this.close, this);
    },

    close : function() {
	this._modelBinder.unbind();
	this.off();
	this.undelegateEvents();
	this.remove();
    },

    render : function() {
	this.$el.html(getHtmlForConfig(this));

	var bindings = getBindingsForConfig(this);
	this._modelBinder.bind(this.model, this.el, bindings);
	return this;
    }
});
