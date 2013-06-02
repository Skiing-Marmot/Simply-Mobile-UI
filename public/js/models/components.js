/**
 * @author Clémence
 */
/* Constants */
ComponentTypes = {
	WINDOW : 0,
	VIEW : 1,
	TEXTFIELD : 2,
	LABEL : 3
};

ComponentModel = Backbone.Model.extend({
	initialize : function() {
		_.bindAll(this);
		console.log("type: " + this.get("type"));
		this.children = nestCollection(this, 'children', new ComponentsCollection(this.get('children')));
		this.set(getInitialization(this.get("type")));
	},
	set_cid : function() {
		console.log(this.cid);
		this.set("_cid", this.cid);
	}
});

ComponentsCollection = Backbone.Collection.extend();

function getInitialization(type) {
	switch(type) {
		case ComponentTypes.WINDOW:
			return {
				layout : "vertical",
				title : "New Window",
				backgroundColor : "#fff",
				navBarHidden : false
			};
		case ComponentTypes.VIEW:
			return {
				layout : "horizontal",
				backgroundColor : "yellow",
				width : "100%",
				height : "50px"
			};
		case ComponentTypes.TEXTFIELD:
			return {
				backgroundColor : "white",
				hintText : "Hint text",
				width : "auto",
				height : "auto"
			};
		case ComponentTypes.LABEL:
			return {
				backgroundColor : "transparent",
				text : "Label",
				width : "auto",
				height : "auto"
			};
	}
}
