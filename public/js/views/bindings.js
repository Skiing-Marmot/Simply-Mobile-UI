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
	inputPlaceHolder : "Button title",
	bindings : {
	    selector : view.el
	}
    };

    this.winTitle = {
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
	inputOptions : [ {
	    text : "Horizontal",
	    value : "horizontal"
	}, {
	    text : "Vertical",
	    value : "vertical"
	}, {
	    text : "Composite",
	    value : "composite"
	} ],
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
		if (value == "Titanium.UI.SIZE") {
		    value = 'auto';
		} else if (value == "Titanium.UI.FILL") {
		    value = '100%';
		}
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
		if (value == "Titanium.UI.SIZE") {
		    value = 'auto';
		} else if (value == "Titanium.UI.FILL") {
		    value = '100%';
		}
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
	inputType : "textfield",
	inputPlaceHolder : "Hint text",
	bindings : {
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
	inputType : "textfield",
	inputPlaceHolder : "Font",
	bindings : {
	    selector : view.el,
	    converter : function(direction, value) {
		if (direction == 'ModelToView') {
		    value = JSON.parse(JSON.stringify(value));
		    $(view.el).css("font-size", value.fontSize);
		    $(view.el).css("font-family", value.font);
		    // return JSON.stringify(value);
		} else {
		    return JSON.parse(JSON.stringify(value));
		}
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

    this.enabled = {
	inputType : "checkbox",
	bindings : {
	    selector : view.el,
	    converter : function(direction, value) {
		// $(view.el).attr("disabled", !value);
	    }
	}
    };
}

function getAttributesToBindForDisplay(view) {
    var type = view.model.get("type");
    switch (type) {
    case ComponentTypes.WINDOW:
	return [ "_cid", "layout", "backgroundColor" ];
    case ComponentTypes.VIEW:
	return [ "_cid", "layout", "backgroundColor", "width", "height" ];
    case ComponentTypes.TEXTFIELD:
	return [ "_cid", "backgroundColor", "width", "height", "hintText", "color", "font.font", "font.fontSize" ];
    case ComponentTypes.LABEL:
	return [ "_cid", "backgroundColor", "width", "height", "text", "color", "font.font", "font.fontSize" ];
    default:
	console.log("No data for that model type.");
	break;
    }
}

function getBindingForDisplay(view) {
    // var attributesToBind = getAttributesToBindForDisplay(view);
    var attributesToBind = view.model.get("params");
    var ac = new AttributesConfiguration(view);
    var bindings = {
	_cid : ac["_cid"].bindings
    };

    _.each(attributesToBind, function(value, key, list) {
	bindings["params." + key + ".value"] = ac[key].bindings;
    });

    return bindings;
}

function getAttributesToBindForConfig(view) {
    var type = view.model.get("type");
    switch (type) {
    case ComponentTypes.WINDOW:
	return [ "layout", "backgroundColor", "winTitle" ];
    case ComponentTypes.VIEW:
	return [ "layout", "backgroundColor", "width", "height" ];
    case ComponentTypes.TEXTFIELD:
	return [ "backgroundColor", "width", "height", "hintText", "color" ];
    case ComponentTypes.LABEL:
	return [ "backgroundColor", "width", "height", "text", "color" ];
    case ComponentTypes.BUTTON:
	return [ "width", "height", "title", "color", "enabled" ];
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
    _.each(view.model.get("eventListener"), function(element, index, list) {
	bindings["eventListener." + index + ".action.actionValue"] = '[name="event.' + index + '"]';
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
    _.each(view.model.get("eventListener"), function(element, index, list) {
	html += getHtmlForEvent(index);
    });

    html += '</div>';
    return html;
}

function getHtmlForEvent(index) {
    return '<label for="event.' + index + '">Windows to open on click: </label><input type="text" name="event.' + index + '" id="event.'
	    + index + '" placeholder="Window name" />';
}

function getHtmlForElement(element, elementName) {
    var inputType = element.inputType;
    var html = '<label for="' + elementName + '">' + elementName + ': </label> ';

    switch (inputType) {
    case "textfield":
	return html + '<input type="text" name="' + elementName + '" id="' + elementName + '" placeholder="' + element.inputPlaceHolder
		+ '" /><br />';
    case "select":
	var options = element.inputOptions;
	html += '<select name="' + elementName + '" id="' + elementName + '" >';

	_.each(options, function(option, index, list) {
	    html += '<option value="' + option.value + '">' + option.text + '</option>';
	});

	html += '</select><br />';
	return html;
    case "checkbox":
	return html + '<input type="checkbox" name="' + elementName + '" id="' + elementName + '" /><br />';
    }
}

// Converter for the layout property binding
function layoutConverter(view, direction, value) {
    $(view.el).attr("layout", value);

    switch (value) {
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
