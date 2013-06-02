/**
 * @author Clémence
 */

function getView(_model, mode) {
	var type = _model.get("type");
	if(mode == "display") return new DisplayView({model: _model, tagName: getTagName(type)});
	if(mode == "config") return new ConfigView({model: _model});
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
		
		if(this.model.get("type") == ComponentTypes.TEXTFIELD) {
			this.$el.attr("type", "text");
			this.$el.attr("readonly", true);
		}
		
		var bindings = getBindingForDisplay(this);
		this._modelBinder.bind(this.model, this.el, bindings);
		return this;
	}
});

function getTagName(type) {
	switch(type) {
		case ComponentTypes.WINDOW:
		case ComponentTypes.VIEW:
			return 'div';
		case ComponentTypes.TEXTFIELD:
			return 'input';
		case ComponentTypes.LABEL:
			return 'p';
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


