/**
 * @author Clémence
 */

function AttributesConfiguration(view) {

	this._cid = {
		bindings : {
			selector : view.el,
			elAttribute : 'cid'
		}
	};

	this.title = {
		inputType : "textfield",
		inputPlaceHolder : "Window title",
		bindings : {
			selector : view.el,
			elAttribute : 'title'
		}
	};

	this.backgroundColor = {
		inputType : "textfield",
		inputPlaceHolder : "Background Color",
		bindings : {
			selector : view.el,
			converter : function(direction, value) {
				$(view.el).css("backgroundColor", value);
			}
		}
	};

	this.layout = {
		inputType : "select",
		inputOptions : [{
			text : "Horizontal",
			value : "horizontal"
		}, {
			text : "Vertical",
			value : "vertical"
		}, {
			text : "Composite",
			value : "composite"
		}],
		bindings : {
			selector : view.el,
			converter : function(direction, value) {
				layoutConverter(view, direction, value);
			}
		}
	};

	this.height = {
		inputType : "textfield",
		inputPlaceHolder : "Height",
		bindings : {
			selector : view.el,
			converter : function(direction, value) {
				$(view.el).css("height", value);
			}
		}
	};

	this.width = {
		inputType : "textfield",
		inputPlaceHolder : "Width",
		bindings : {
			selector : view.el,
			converter : function(direction, value) {
				$(view.el).css("width", value);
			}
		}
	};

	this.text = {
		inputType : "textfield",
		inputPlaceHolder : "Text",
		bindings : {
			selector : view.el
		}
	};
	
	this.hintText = {
		inputType: "textfield",
		inputPlaceHolder: "Hint text",
		bindings: {
			selector : view.el,
			elAttribute : "placeholder"
		}
	};

	this.color = {
		inputType : "textfield",
		inputPlaceHolder : "Color",
		bindings : {
			selector : view.el,
			converter : function(direction, value) {
				$(view.el).css("color", value);
			}
		}
	};

	this["font.font"] = {
		inputType : "textfield",
		inputPlaceHolder : "Font family",
		bindings : {
			selector : view.el,
			converter : function(direction, value) {
				$(view.el).css("font-family", value);
			}
		}
	};

	this["font.fontSize"] = {
		inputType : "textfield",
		inputPlaceHolder : "Font size",
		bindings : {
			selector : view.el,
			converter : function(direction, value) {
				$(view.el).css("font-size", value);
			}
		}
	};
	
	this.font = {
			inputType: "textfield",
			inputPlaceHolder: "Font",
			bindings: {
				selector : view.el,
				converter : function(direction, value) {
					$(view.el).css("font-size", value.fontSize);
					$(view.el).css("font-family", value.font);
				}
			}
	}
	
	this.navBarHidden = {
			inputType : "checkbox",
			bindings : {
				selector : view.el,
				elAttribute : 'navBarHidden'
			}
	};
}

function getAttributesToBindForDisplay(view) {
	var type = view.model.get("type");
	switch(type) {
		case ComponentTypes.WINDOW:
			return ["_cid", "layout", "backgroundColor"];
		case ComponentTypes.VIEW:
			return ["_cid", "layout", "backgroundColor", "width", "height"];
		case ComponentTypes.TEXTFIELD:
			return ["_cid", "backgroundColor", "width", "height", "hintText", "color", "font.font", "font.fontSize"];
		case ComponentTypes.LABEL:
			return ["_cid", "backgroundColor", "width", "height", "text", "color", "font.font", "font.fontSize"];
		default:
			console.log("No data for that model type.");
			break;
	}
}

function getBindingForDisplay(view) {
	//var attributesToBind = getAttributesToBindForDisplay(view);
	var attributesToBind = view.model.get("params");
	var ac = new AttributesConfiguration(view);
	var bindings = {_cid: ac["_cid"].bindings};

	_.each(attributesToBind, function(value, key, list) {
		bindings["params." + key + ".value"] = ac[key].bindings;
	});

	return bindings;
}

function getAttributesToBindForConfig(view) {
	var type = view.model.get("type");
	switch(type) {
		case ComponentTypes.WINDOW:
			return ["layout", "title", "backgroundColor"];
		case ComponentTypes.VIEW:
			return ["layout", "backgroundColor", "width", "height"];
		case ComponentTypes.TEXTFIELD:
			return ["backgroundColor", "width", "height", "hintText", "color", "font"];
		case ComponentTypes.LABEL:
			return ["backgroundColor", "width", "height", "text", "color", "font"];
		default:
			console.log("No data for that model type.");
			break;
	}
}

function getBindingsForConfig(view) {
	var bindings = {};
	var attributesToBind = getAttributesToBindForConfig(view);

	_.each(attributesToBind, function(element, index, list) {
		bindings["params." + element + ".value"] = '[name="' + element + '"]';
	});

	return bindings;
}

function getHtmlForConfig(view) {
	var html = '<div>';
	var attributesToBind = getAttributesToBindForConfig(view);
	var ac = new AttributesConfiguration(view);

	_.each(attributesToBind, function(element, index, list) {
		html += getHtmlForElement(ac[element], element);
	});

	html += '</div>';
	return html;
}

function getHtmlForElement(element, elementName) {
	var inputType = element.inputType;

	switch(inputType) {
		case "textfield":
			return '<input type="text" name="' + elementName + '" placeholder="' + element.inputPlaceHolder + '" />';
		case "select":
			var options = element.inputOptions;
			var html = '<select name="' + elementName + '">';

			_.each(options, function(option, index, list) {
				html += '<option value="' + option.value + '">' + option.text + '</option>';
			});

			html += '</select>';
			return html;
	}
}

// Converter for the layout property binding
function layoutConverter(view, direction, value) {
	$(view.el).attr("layout", value);

	switch(value) {
		case "horizontal":
			$(view.el).children().css("float", "left");
			break;
		case "vertical":
			$(view.el).children().css("float", "none");
			break;
		case "composite":
			// TODO
			break;
	}
}

