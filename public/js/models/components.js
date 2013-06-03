/**
 * @author Clémence
 */
/* Constants */
ComponentTypes = {
    WINDOW : 0,
    VIEW : 1,
    TEXTFIELD : 2,
    LABEL : 3,
    BUTTON : 4
};

ComponentModel = Backbone.DeepModel.extend({
    initialize : function() {
	_.bindAll(this);
	console.log("type: " + this.get("type"));
	this.children = nestCollection(this, 'children', new ComponentsCollection(this.get('children')));
	this.set(getInitialization(this.get("type")));
    },
    set_cid : function() {
	console.log(this.cid);
	this.set("_cid", this.cid);
	this.set("name", this.cid);
    }
});

ComponentsCollection = Backbone.Collection.extend();

function getInitialization(type) {
    switch (type) {
    case ComponentTypes.WINDOW:
	return {
	    constructorType : "Window",
	    params : {
		title : {
		    type : "directValue",
		    valueType : "String",
		    value : "New Window"
		},
		backgroundColor : {
		    type : "directValue",
		    valueType : "String",
		    value : "#ffffff"
		},
		layout : {
		    type : "directValue",
		    valueType : "String",
		    value : "vertical"
		},
		navBarHidden : {
		    type : "directValue",
		    valueType : "Direct",
		    value : false
		},
		width : {
		    type : "directValue",
		    valueType : "String",
		    value : "100%"
		},
		height : {
		    type : "directValue",
		    valueType : "String",
		    value : "100%"
		}
	    }
	};
    case ComponentTypes.VIEW:
	return {
	    constructorType : "View",
	    params : {
		backgroundColor : {
		    type : "directValue",
		    valueType : "String",
		    value : "yellow"
		},
		layout : {
		    type : "directValue",
		    valueType : "String",
		    value : "horizontal"
		},
		width : {
		    type : "directValue",
		    valueType : "String",
		    value : "100%"
		},
		height : {
		    type : "directValue",
		    valueType : "String",
		    value : "50px"
		}
	    }
	};
    case ComponentTypes.TEXTFIELD:
	return {
	    constructorType : "TextField",
	    params : {
		hintText : {
		    type : "directValue",
		    valueType : "String",
		    value : "Hint text"
		},
		backgroundColor : {
		    type : "directValue",
		    valueType : "String",
		    value : "white"
		},
		color : {
		    type : "directValue",
		    valueType : "String",
		    value : "black"
		},
		width : {
		    type : "directValue",
		    valueType : "String",
		    value : "auto"
		},
		height : {
		    type : "directValue",
		    valueType : "String",
		    value : "auto"
		}
	    }
	};
    case ComponentTypes.LABEL:
	return {
	    constructorType : "Label",
	    params : {
		text : {
		    type : "directValue",
		    valueType : "String",
		    value : "Label"
		},
		backgroundColor : {
		    type : "directValue",
		    valueType : "String",
		    value : "transparent"
		},
		color : {
		    type : "directValue",
		    valueType : "String",
		    value : "black"
		},
		width : {
		    type : "directValue",
		    valueType : "String",
		    value : "auto"
		},
		height : {
		    type : "directValue",
		    valueType : "String",
		    value : "auto"
		}
	    /*
	     * , font : { type: "directValue", valueType: "Direct", value:
	     * '{font: "Verdana", fontSize: "1em"}' }
	     */
	    }
	};
    case ComponentTypes.BUTTON:
	return {
	    constructorType : "Button",
	    params : {
		title : {
		    type : "directValue",
		    valueType : "String",
		    value : "Button"
		},
		color : {
		    type : "directValue",
		    valueType : "String",
		    value : "black"
		},
		width : {
		    type : "directValue",
		    valueType : "String",
		    value : "auto"
		},
		height : {
		    type : "directValue",
		    valueType : "String",
		    value : "auto"
		},
		enabled : {
		    type : "directValue",
		    valueType : "Direct",
		    value : "true"
		}
	    },
	    eventListener : [ {
		event : "click",
		action : {
		    actionType : "openWindow",
		    actionValue : "ParamsWindow"
		}
	    } ]
	};
    }
}
