/**
 * @author Clémence
 */
var componentsCollection = new ComponentsCollection();
var screensCollection = [];
var screenNumber = 0;
var configView = null;
var selected = null;
// Contains the selected element if there is one

$(function() {

    // Make the Window icon draggable
    $(".window-component").draggable({
	appendTo : "#phone-screen",
	helper : function() {// What is shown with the pointer when moved
	    var win = $("<div></div>", {
		class : "window-component",
	    }).css({
		"height" : "75px",
		"width" : "35px",
		"background-color" : "#fff"
	    });
	    return win;
	},
	opacity : 0.75, // opacity of the helper
	snap : "#phone-screen", // Stop the draggable on the limites of the
	// #phone-screen div
	snapMode : "inner", // Stop the draggable only against the inner limites
	// of #phone-screen
	revert : "invalid" // Come back to initial place if not dropped
    });
    // Make other View types icons draggable
    $(".inline-component, .view-component").draggable({
	cancel : null, // All elements are allowed to be dragged (else input
	// elements can't by default)
	helper : "clone", // What is shown with the pointer when moved
	opacity : 0.75, // opacity of the helper
	snap : "#phone-screen, .view-comp, .window-comp", // Stop the
	// draggable against
	// the inner limites
	// of #phone-screen,
	// windows and views
	snapMode : "inner",
	revert : "invalid" // Come back to initial place if not dropped
    });

    // Make the phone screen droppable
    $("#phone-screen").droppable({
	accept : ".window-component, .tabsgroup-component", // Only Windows and
	// Tabs groups can
	// be added as root
	// elements
	activeClass : "ui-active", // class to apply when an acceptable
	// draggable starts to be dragged
	greedy : true, // Prevent event propagation when draggable is dropped
	// on a child
	drop : function(event, ui) {// What to do when a draggable is dropped
	    // Create the Bacbone model for the Window TODO handle tabs group
	    // creation
	    var mod = new ComponentModel({
		type : ComponentTypes.WINDOW
	    });
	    mod.set_cid();
	    // Set the attribute _cid to the auto-generated value of the model
	    // cid (needed to identify it later)
	    componentsCollection.add(mod);
	    // Add the model to the components collection

	    // Get and render the Backbone view for that model
	    var _win = getView(mod, "display");
	    var win = $(_win.render().el);
	    // Append the view to this droppable, i.e. #phone-screen
	    win.appendTo(this);
	    // Bind the click event on that view to the selectComponent() method
	    // win.click(selectComponent);
	    win.width("100%").height("100%");
	    // Configure that view to be droppable and accept other view
	    // components
	    // makeViewDroppable(_win);
	    // Select the new created view
	    win.click();
	}
    });
});

var makeViewDraggable = function(_view) {
    var view = $(_view.el);
    view.draggable({
	cancel : null, // All elements are allowed to be dragged (else input
	// elements can't by default)
	helper : "clone", // What is shown with the pointer when moved
	opacity : 0.75, // opacity of the helper
	snap : "#phone-screen, .view-comp, .window-comp", // Stop the
	// draggable against
	// the inner limites
	// of #phone-screen,
	// windows and views
	snapMode : "inner",
	revert : "invalid", // Come back to initial place if not dropped
	stop : function() {
	    // TODO remove from its parent model
	    var mod = componentsCollection.getByCid(view.attr("cid"));
	    view.remove();
	}
    });
};

// Configure a Backbone view to make it droppable and accepting other views
var makeViewDroppable = function(_view) {
    var view = $(_view.el);
    view.droppable({
	accept : ".inline-component, .view-component", // It accepts only other
	// Views and simple
	// components (no Window
	// or Tabs group)
	activeClass : "ui-active",
	greedy : true,
	drop : function(event, ui) {
	    var comp = $(ui.draggable);
	    var layout = $(this).attr("layout");
	    var mod = null;
	    if (comp.attr("cid")) {
		mod = componentsCollection.getByCid(comp.attr("cid"));
	    } else {
		// Create a new Backbone model for the dragged element
		var mod = new ComponentModel({
		    type : Number(comp.attr("compType"))
		});
		mod.set_cid();
		// Add it also to the global components Collection so it is
		// easily
		// accessible
		componentsCollection.add(mod);
	    }

	    // Add the model as a child of this droppable model
	    _view.model.children.add(mod);

	    // Get and render the Backbone view for that model
	    var _droppedView = getView(mod, "display");
	    var droppedView = $(_droppedView.render().el);

	    // droppedView.appendTo(this);
	    if (layout == "vertical") {
		droppedView.appendTo(this);
	    } else if (layout == "horizontal") {
		droppedView.css("float", "left");
		droppedView.appendTo(this);
	    } else {
		// TODO (composite)
	    }
	    // droppedView.width("100%").height("100%");

	    // Make the view selectionable and droppable (if it is not a simple
	    // view) and select it
	    // droppedView.click(selectComponent);
	    // if (comp.hasClass("view-component"))
	    // makeViewDroppable(_droppedView);
	    droppedView.click();

	    /*
	     * if (comp.hasClass("inline-component")) {
	     * comp.removeClass("inline-component").addClass("inline-comp
	     * ui-selectee").width("80%").css("margin", "5px auto"); } if
	     * (comp.hasClass("view-component")) { var top =
	     * (comp.prev().position()) ? (comp.prev().position().top +
	     * comp.prev().outerHeight(true)) : 0;
	     * comp.removeClass("view-component").addClass("view-comp
	     * ui-selectee").css({ "position" : "absolute", "bottom" : 0, "top" :
	     * top, "height" : "auto" }).width("100%").attr("layout",
	     * "vertical"); makeViewDroppable(comp); }
	     */
	}
    });
};

// Click handler for the views: select or or unselect a view and show or hide
// its configuration view
var selectComponent = function(event) {
    $(this).toggleClass("selected");
    // If there already was a selected element, unselect it and remove its
    // configuration view
    if (selected != null) {
	selected.removeClass("selected");
	configView.close();
	$('#config').empty();
    }
    // If the clicked element is now selected, set the selected variable to it
    // and show its configuration view
    if ($(this).hasClass("selected")) {
	selected = $(this);
	var cid = $(this).attr("cid");
	// Use the unique cid to get the Backbone model corresponding to the
	// selected element
	var mod = componentsCollection.getByCid(cid);
	// Get and render the Backbone view to configure that model
	configView = getView(mod, "config");
	var configWin = $(configView.render().el);
	// Append it to the #config div
	$("#config").append(configWin);
    } else {
	// If we only have unselected an element, set the selected variable to
	// null
	selected = null;
    }
    // We only select the clicked element and don't propagate the event to its
    // parent node
    event.stopPropagation();
};

var nextScreen = function() {
    screensCollection[screenNumber] = componentsCollection;
    screenNumber++;
    componentsCollection = (screensCollection.length > screenNumber) ? screensCollection[screenNumber] : new ComponentsCollection();

    // Remove current screen
    $('#phone-screen').empty();
    // Remove config screen
    if (selected != null) {
	selected.removeClass("selected");
	configView.close();
	$('#config').empty();
	selected = null;
    }
    // Add new view
    if (componentsCollection.length > 0) {
	var _win = getView(componentsCollection.at(0), "display");
	var win = $(_win.render().el);
	win.appendTo($('#phone-screen'));
    }
};

var prevScreen = function() {
    if(screenNumber > 0) {
	  screensCollection[screenNumber] = componentsCollection;
	    screenNumber--;
	    componentsCollection = (screensCollection.length > screenNumber) ? screensCollection[screenNumber] : new ComponentsCollection();

	    // Remove current screen
	    $('#phone-screen').empty();
	    // Remove config screen
	    if (selected != null) {
		selected.removeClass("selected");
		configView.close();
		$('#config').empty();
		selected = null;
	    }
	    // Add new view
	    if (componentsCollection.length > 0) {
		var _win = getView(componentsCollection.at(0), "display");
		var win = $(_win.render().el);
		// win.click(selectComponent);
		// makeViewDroppable(_win);
		win.appendTo($('#phone-screen'));
	    }
    } else {
	alert("This is the first screen.");
    }
};

// TODO Get the JSON representation of the mobile app and send it to the server
// to obtain the generated Titanium JavaScript files
var makeApp = function() {
    // var xml = document.getElementById("phone-screen");
    // var json = $.xml2json(xml);
    //console.log(JSON.stringify(componentsCollection.at(0)));
    // $.get("/appSrcZip");
    // window.location.href = '/appSrcZip';
    screensCollection[screenNumber] = componentsCollection;
    
    var appName = document.forms["makeAppForm"]["appName"].value;

    var appDesc = {
	applicationNameIcon : appName,
	applicationName : "MyApp",
	target : [ "iphone", "android", "ipad" ],
	manifest : null,
	allowVertical : true,
	allowHorizontal : true,
	baseFile : "ModuleTest"
    };
    
    var views = [];
    _.each(screensCollection, function(element, index) {
	views[index] = element.at(0);
    });
    
    // Remplace the winTitle param of the windows by a title param
    _.each(views, function(element, index) {
	element.set("params.title", element.get("params.winTitle"));
	element.unset("params.winTitle");
	changeValueType(element);
    });

    var appConf = {
	moduleName : "ModuleTest",
	views : views
    };

    document.forms["makeAppForm"]["appDesc"].value = JSON.stringify(appDesc);
    // console.log(JSON.stringify(appDesc));
    // document.forms["makeAppForm"]["appConfig"].value =
    // JSON.stringify(componentsCollection.at(0));
    document.forms["makeAppForm"]["appConf"].value = JSON.stringify(appConf);
    return true;
};

var changeValueType = function(model) {
    if(model.get("params.width.value") == "Titanium.UI.FILL" || model.get("params.width.value") == "Titanium.UI.SIZE") {
	model.set("params.width.valueType", "Direct");
    }
    if(model.get("params.height.value") == "Titanium.UI.FILL" || model.get("params.height.value") == "Titanium.UI.SIZE") {
	model.set("params.height.valueType", "Direct");
    }
    if(model.children.length > 0) {
	_.each(model.children.models, function(element) {
	    changeValueType(element);
	});
    }
};
