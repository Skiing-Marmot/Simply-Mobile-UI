/*
Simply Mobile - Mobile Development Framework
Copyright (c) 2012 Model N, Jérôme Ueberschlag, Clémence Aucagne, Jean-Baptiste Pringuey

See the file license.txt for copying permission.
*/

// Helper function to get a value from a Backbone object as a property
// or as a function.
var getValue = function(object, prop) {
    if (!(object && object[prop]))
        return null;
    return _.isFunction(object[prop]) ? object[prop]() : object[prop];
};

// Throw an error when a URL is needed, and none is supplied.
var urlError = function() {
    throw new Error('A "url" property or function must be specified');
};

var BackboneWaitingSyncList = []; // TODO save list in a file when closing the app and re-fill the list with file content when re-launching the app
setInterval(function() {
    var length = BackboneWaitingSyncList.length, i = 0;
    if (length > 0 && Ti.Network.online) {
        for ( i = 0; i < length; i++) {
            var parameters = BackboneWaitingSyncList.shift();
            Backbone.sync(parameters.method, parameters.model, parameters.options);
        }
    }
}, 60000);

Backbone.sync = function(method, model, options, directory, encryption) {
    //console.log('sync' + method + ' - ' + JSON.stringify(model));
    var resp;
    var savedParameters = {
        method : method,
        model : model,
        options : options
    };

    function getUrl(object) {
        if (!(object && object.url)) {
            return null;
        }
        return _.isFunction(object.url) ? object.url() : object.url;
    }

    function sendXhr(successCallback, errorCallback) {

        // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
        var methodMap = {
            'create' : 'POST',
            'update' : 'PUT',
            'delete' : 'DELETE',
            'read' : 'GET'
        };

        var xhr = Ti.Network.createHTTPClient({
            timeout : 35000
        });

        var type = methodMap[method];

        // Default options, unless specified.
        options || ( options = {});

        // Default JSON-request options.
        var params = {
            type : type,
            dataType : 'json'
        };

        // Ensure that we have a URL.
        if (!options.url) {
            params.url = getValue(model, 'url') || urlError();
        }

        // Ensure that we have the appropriate request data.
        if (!options.data && model && (method == 'create' || method == 'update')) {
            params.contentType = 'application/json';
            params.data = JSON.stringify(model.toJSON());
        }

        // For older servers, emulate JSON by encoding the request into an HTML-form.
        if (Backbone.emulateJSON) {
            params.contentType = 'application/x-www-form-urlencoded';
            params.processData = true;
            params.data = params.data ? {
                model : params.data
            } : {};
        }

        // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
        // And an `X-HTTP-Method-Override` header.
        if (Backbone.emulateHTTP) {
            if (type === 'PUT' || type === 'DELETE') {
                if (Backbone.emulateJSON)
                    params.data._method = type;
                params.type = 'POST';
                params.beforeSend = function(xhr) {
                    xhr.setRequestHeader('X-HTTP-Method-Override', type);
                };
            }
        }

        // Don't process data on a non-GET request.
        if (params.type !== 'GET' && !Backbone.emulateJSON) {
            params.processData = false;
        }

        //Handle success
        xhr.onload = function() {
            //Ti.API.info('xhr success ' + this.responseText);

            var cookies = this.getResponseHeader('Set-Cookie');
            if (cookies != null && Ti.Android) {
                Ti.App.Properties.setString('cookies', cookies);
            }

            successCallback(this.responseText);
        };

        //Handle error
        xhr.onerror = function(error) {
            //Ti.API.info('xhr error ' + error);
            options.error("Record not found");
            if (errorCallback) {
                errorCallback();
            }
            BackboneWaitingSyncList.push(savedParameters);
        };

        //Prepare the request
        xhr.open(type, params.url);

        //Add request headers etc.
        if (params.contentType) {
            xhr.setRequestHeader('Content-Type', params.contentType);
        }
        xhr.setRequestHeader('Accept', 'application/json');
        if (params.beforeSend) {
            params.beforeSend(xhr);
        }

        if (Ti.Android && Ti.App.Properties.getString('cookies')) {
            xhr.setRequestHeader('Cookie', Ti.App.Properties.getString('cookies'));
        }

        //Make the request
        xhr.send(params.data);
    }

    function writeObject(fileName, object) {
        //Ti.API.info('writeObject ' + fileName + ' - ' + JSON.stringify(object));
        var filePath = Ti.Filesystem.applicationDataDirectory;
        if (directory) {
            filePath = directory;
        }
        var file = Ti.Filesystem.getFile(filePath, fileName);
        //Ti.API.info('path: ' + file.nativePath);
        var collection = {};
        if (file.exists()) {
            var content = file.read();
            //TODO : decrypt if necessary
            if (content && content.text && content.text.length > 0) {
                var toParse = content.text;
                if (encryption && encryption.key) {
                    toParse = sjcl.decrypt(encryption.key, content.text);
                }
                collection = JSON.parse(toParse);
            }
        }
        
        //if we pass the all collection or just a model
        if (object.length >= 0) {
            object.forEach(function(model){
                collection[model.id] = model;
            });        
        }
        else {
            collection[object.id] = object;
        }
       
        //Ti.API.info('collection: ' + JSON.stringify(collection))
        //TODO : encrypt if necessary
        var toWrite = JSON.stringify(collection);
        if (encryption && encryption.key) {
            toWrite = sjcl.encrypt(encryption.key, toWrite);
        }
        file.write(toWrite);
    }

    function save(obj) {
        Ti.API.info('Backbone.Sync.Ti -- save');
        // Sending to server
        sendXhr(function(response) {
            var object = JSON.parse(response);
            // Saving in a file
            options.success(object);
            //Ti.API.info('obj: ' + JSON.stringify(obj));
            writeObject(obj.storeName, obj);
        }, function() {
            if (method == 'update') {
                writeObject(obj.storeName, obj);
            }
        });
    }

    function get(obj) {
        Ti.API.info('Backbone.Sync.Ti -- get');
        var object = obj;
        // If online, getting object from the server
        if (Ti.Network.online) {
            // Get the object
            sendXhr(function(response) {
                object = JSON.parse(response);
                options.success(object);
                // Write it to the file
                writeObject(obj.storeName, obj);
            });
        }
        // Else, reading it from the file
        else {
            var filePath = Ti.Filesystem.applicationDataDirectory;
            if (directory) {
                filePath = directory;
            }
            var file = Ti.Filesystem.getFile(filePath, obj.storeName);
            if (file.exists()) {
                var content = file.read();
                //TODO : decrypt if necessary
                if (content && content.text && content.text.length > 0) {
                    var toParse = content.text;
                    if (encryption && encryption.key) {
                        toParse = sjcl.decrypt(encryption.key, content.text);
                    }
                    var collection = JSON.parse(toParse);
                    object = collection[obj.id];
                }
            }
            options.success(object);
        }
    }

    function remove(obj) {
        Ti.API.info('Backbone.Sync.Ti -- remove');
        // Remove from the file
        var filePath = Ti.Filesystem.applicationDataDirectory;
        if (directory) {
            filePath = directory;
        }
        var file = Ti.Filesystem.getFile(filePath, obj.storeName);
        var collection = {};
        if (file.exists()) {
            var content = file.read();
            //TODO : decrypt if necessary
            if (content && content.text && content.text.length > 0) {
                var toParse = content.text;
                if (encryption && encryption.key) {
                    toParse = sjcl.decrypt(encryption.key, content.text);
                }
                collection = JSON.parse(toParse);
            }
        }
        if (obj.id in collection) {
            delete collection[obj.id];
        }
        //TODO : encrypt if necessary
        var toWrite = JSON.stringify(collection);
        if (encryption && encryption.key) {
            toWrite = sjcl.encrypt(encryption.key, toWrite);
        }
        file.write(toWrite);

        // Remove from the server
        sendXhr(function(response) {
            options.success(obj);
        });
    }

    function all(_collection) {
        Ti.API.info('Backbone.Sync.Ti -- all');
        // If online, get objects from the server
        if (Ti.Network.online) {
            sendXhr(function(response) {
                //Ti.API.info('all - response: ' + response);
                options.success(JSON.parse(response));
                // We save it in the file
                writeObject(_collection.storeName, _collection);

            }, function(response) {
                options.error();                
            });
        }
        // Else, get the objects from the file
        else {
            Ti.API.info('Backbone.Sync.Ti -- all - Not online');
            var coll = [];
            var filePath = Ti.Filesystem.applicationDataDirectory;
            if (directory) {
                filePath = directory;
            }
            var file = Ti.Filesystem.getFile(filePath, _collection.storeName);
            if (file.exists()) {
                var content = file.read();
                //TODO : decrypt if necessary
                if (content && content.text && content.text.length > 0) {
                    var toParse = content.text;
                    if (encryption && encryption.key) {
                        toParse = sjcl.decrypt(encryption.key, content.text);
                    }
                    var collection = JSON.parse(toParse);
                    for (id in collection) {
                        coll.push(collection[id]);
                    }
                }
            }
            options.success(coll);
        }
    }


    //Ti.API.info('options: ' + JSON.stringify(options));

    switch (method) {
        case "read":
            model.id ? get(model) : all(model);
            break;
        case "create":
            save(model);
            break;
        case "update":
            save(model);
            break;
        case "delete":
            remove(model);
            break;
    }
};
