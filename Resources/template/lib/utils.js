/*
Simply Mobile - Mobile Development Framework
Copyright (c) 2012 Model N, Jérôme Ueberschlag, Clémence Aucagne, Jean-Baptiste Pringuey

See the file license.txt for copying permission.
*/


/*
 * Take a Date as parameter and return a string on the form mm/dd/yyyy
 */
SMapp.utils.getStringDate = function(/*Date*/date) {
    return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
};

/*
 * Take a Date as parameter and return a string on the form mm/dd/yyyy, hh:mm
 */
SMapp.utils.getStringDateAndTime = function(/*Date*/date) {
    var dateText = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear() + ', ' + date.getHours() + ':';
    if (date.getMinutes() < 10) {
        dateText += '0';
    }
    dateText += date.getMinutes();
    return dateText;
};

/*
 * Destroy (set to null) a window (or any view) and all its children
 */
SMapp.utils.destroy = function(/* Object to destroy */view) {
    Ti.API.info('View info ' + view);
    if (view) {
        if (view.children) {
            var l = view.children.length;
            Ti.API.info('In destroy: ' + l);
            var i = 0;
            Ti.API.info('Destroying view children' + view);
            for ( i = 0; i < l; i++) {
                Ti.API.info('Destroying children: ' + i);
                SMapp.utils.destroy(view.children[i]);
            }
        }
        // It seems for Android you access the children with the _children attribute
        if (view._children) {
            var l = view._children.length;
            Ti.API.info('In destroy: ' + l);
            var i = 0;
            Ti.API.info('Destroying view _children' + view);
            for ( i = 0; i < l; i++) {
                Ti.API.info('Destroying children: ' + i);
                SMapp.utils.destroy(view._children[i]);
            }
        }
        view = null;
    }
};

/*
 * Event listener manager.
 * Used before the EventBus creation to store all the event listeners so we can easily remove them all on logout
 */
SMapp.utils.eventListenerManager = {
    eventListeners : []
};
/*
 * Adds an event listener to object, for the event eventName and with the callback function handler
 * It also adds a new object to the eventListeners list of the eventListenerManager
 */
SMapp.utils.eventListenerManager.addEventListener = function(/*Titanium object*/object, /*String*/eventName, /*Function pointer*/handler) {
    Ti.API.info('ADD EVENT LISTENER: ' + eventName);
    object.addEventListener(eventName, handler);
    SMapp.utils.eventListenerManager.eventListeners.push({
        object : object,
        eventName : eventName,
        handler : handler
    });
};
/*
 * Removes all the event listeners that had been added using the addEventListener method above and empties the eventListeners array of the eventListenerManager
 */
SMapp.utils.eventListenerManager.removeAllEventListener = function() {
    Ti.API.info('REMOVE ALL EVENT LISTENER');
    var l = SMapp.utils.eventListenerManager.eventListeners.length;
    for ( i = 0; i < l; i++) {
        SMapp.utils.eventListenerManager.eventListeners[i].object.removeEventListener(SMapp.utils.eventListenerManager.eventListeners[i].eventName, SMapp.utils.eventListenerManager.eventListeners[i].handler);
    }
    SMapp.utils.eventListenerManager.eventListeners.length = 0;
};

/* Cross-platform helper */
var osname = Ti.Platform.osname;
var os = osname;
// The os variable equals the os name or the os name followed by Horizontal if the orientation is horizontal
if (Ti.UI.orientation == Ti.UI.LANDSCAPE_LEFT || Ti.UI.orientation == Ti.UI.LANDSCAPE_RIGHT) {
    Ti.API.info('os: ' + os);
    if (os.indexOf("Horizontal") == -1) {
        os = os.concat('Horizontal');
        Ti.API.info('os after concat: ' + os);
    }
}
Ti.Gesture.addEventListener('orientationchange', function(e) {
    if (e.orientation == Ti.UI.LANDSCAPE_LEFT || e.orientation == Ti.UI.LANDSCAPE_RIGHT) {
        Ti.API.info('Horizontal change ' + os + ' - ' + os.indexOf("Horizontal"));
        if (os.indexOf("Horizontal") == -1) {
            os = os.concat('Horizontal');
            Ti.API.info('os after concat: ' + os);
        }
    } else if (os.indexOf("Horizontal") != -1) {
        os = os.replace('Horizontal', '');
        Ti.API.info('os after replace: ' + os);
    }
});

/*
 * Used when some code or values are different according to the device
 * It takes as a parameter a map with the os name (followed by 'Horizontal' or no) as keys and the value corresponding to that os.
 * The key value can be 'def' to set a default value if the os name is not in the map.
 * If the map contains the os name and not the os name followed by 'Horizontal', the os name value will also be applied when the orientation is horizontal.
 * Map example: {
 *      def: 'green',
 *      androidHorizontal: 'red'
 * }
 * The values can also be functions that will be called only on the specified device.
 * Example: {
 *      iphone: function() {
 *          Ti.API.info('This is the iphone function');
 *      }
 * }
 */
SMapp.utils.os = SMapp.os = function(/*Javascript object with keys and values*/map) {
    var o = os;
    // If the os name followed by 'Horizontal' is not in the map, we will use only the os name
    if (o.indexOf("Horizontal") != -1 && ( typeof map[o] == 'undefined')) {
        o = o.replace('Horizontal', '');
    }
    //default function or value
    var def = map.def || null;
    if ( typeof map[o] != 'undefined') {
        if ( typeof map[o] == 'function') {
            // The function will be called
            return map[o]();
        } else {
            return map[o];
        }
    } else {
        if ( typeof def == 'function') {
            return def();
        } else {
            return def;
        }
    }
};

//Spinner window 
SMapp.spinnerWindow = {
    rotation : 0,
    counter : 0,
    interval : null
};
SMapp.spinnerWindow.window = Titanium.UI.createWindow({
    opacity : 0.5,
    backgroundColor : 'black',
    image : Titanium.UI.createImageView({
        image:'/images/spinner.png',
        backgroundColor:'transparent',
        canScale:false,
        anchorPoint:{x:'50%',y:'50%'},
        center:{x:'50%',y:'50%'},
        height: 72,
        width: 72
    })
});      
SMapp.spinnerWindow.window.add(SMapp.spinnerWindow.window.image);
SMapp.spinnerWindow.show = function () {
    if (SMapp.spinnerWindow.counter == 0) {
        SMapp.spinnerWindow.interval = setInterval(function() {
                var t = Ti.UI.create2DMatrix();
                var spin = Titanium.UI.createAnimation();
                t = t.rotate(SMapp.spinnerWindow.rotation + 10);
                SMapp.spinnerWindow.rotation = SMapp.spinnerWindow.rotation + 10;
                spin.transform = t;
                spin.duration = 5;
                SMapp.spinnerWindow.window.image.animate(spin);
            }
        , 50);
        SMapp.spinnerWindow.window.open();
    }   
    SMapp.spinnerWindow.counter = SMapp.spinnerWindow.counter + 1;
};
SMapp.spinnerWindow.hide = function () {
    if (SMapp.spinnerWindow.counter == 1) {
        SMapp.spinnerWindow.window.close(); 
        if (SMapp.spinnerWindow.interval != null) {
            clearInterval(SMapp.spinnerWindow.interval);
        }
    }
    if (SMapp.spinnerWindow.counter >= 1) {
        SMapp.spinnerWindow.counter = SMapp.spinnerWindow.counter - 1;          
    }
};