var express = require("express");

var fs = require('fs');
var Buffer = require('buffer').Buffer;
var nativeZip = require("node-native-zip");
var ejs = require('ejs');

var app = express();
app.use(express.logger());

app.get('/', function(request, response) {
  response.send('Hello World!');
});

app.get('/appSrcZip', function(request, response) {
	
	// TODO appFile and confFile -> get JSON from client
	
    //Read / parse all conf files
    var appFile = fs.readFileSync('apps/RSSReader/app.json');
    var jsonAppParse = JSON.parse(appFile);
    var confFile = fs.readFileSync('apps/RSSReader/conf.json');
    var jsonConfParse = JSON.parse(confFile);

    // Read all template files
    var tiappTemplate = fs.readFileSync('Resources/template/tiappTemplate.ejs', 'utf8');
    var baseTemplate = fs.readFileSync('Resources/template/baseTemplate.ejs', 'utf8');
    var appTemplate = fs.readFileSync('Resources/template/appTemplate.ejs', 'utf8');

    // Create all the template results
    var tiappResult = ejs.render(tiappTemplate, {app : jsonAppParse, ejs : ejs, fs : fs}); 
    var baseResult = ejs.render(baseTemplate, {module : jsonConfParse, ejs : ejs, fs : fs}); 
    var appResult = ejs.render(appTemplate, {app : jsonAppParse, ejs : ejs, fs : fs}); 

    // Read all lib files
    var backboneCollectionBinder = fs.readFileSync('Resources/template/lib/Backbone.CollectionBinder.Ti.js', 'utf8');
    var backboneCollectionUpdate = fs.readFileSync('Resources/template/lib/Backbone.CollectionUpdate.js', 'utf8');
    var backboneDeepModel = fs.readFileSync('Resources/template/lib/Backbone.DeepModel.js', 'utf8');
    var backboneModelBinder = fs.readFileSync('Resources/template/lib/Backbone.ModelBinder.Ti.js', 'utf8');
    var backboneSync = fs.readFileSync('Resources/template/lib/Backbone.Sync.Ti.js', 'utf8');
    var backboneFile = fs.readFileSync('Resources/template/lib/backbone.js', 'utf8');
    var backboneSubset = fs.readFileSync('Resources/template/lib/backbone.subset.js', 'utf8');
    var backboneUtils = fs.readFileSync('Resources/template/lib/Backbone.Utils.js', 'utf8');
    var sjclFile = fs.readFileSync('Resources/template/lib/sjcl.js', 'utf8');
    var underscoreFile = fs.readFileSync('Resources/template/lib/underscore.js', 'utf8');
    var utilsFile = fs.readFileSync('Resources/template/lib/utils.js', 'utf8');
    var dataManagementFile = fs.readFileSync('Resources/template/lib/dataManagement.js', 'utf8');
    var loaderFile = fs.readFileSync('Resources/template/lib/loader.js', 'utf8');
    //Images
    var spinnerImage = fs.readFileSync('Resources/template/images/spinner.png');
    if (jsonAppParse.icon) {
        var appIcon = fs.readFileSync('apps/' + jsonConfParse.moduleName + '/images/' + jsonAppParse.icon);
    }
    if (jsonAppParse.splashScreen) {
        var splashScreen = fs.readFileSync('apps/' + jsonConfParse.moduleName + '/images/' + jsonAppParse.splashScreen);
    }

    var downloadZip = new nativeZip();
    downloadZip.add("tiapp.xml", new Buffer(tiappResult));
    downloadZip.add("Resources/app.js", new Buffer(appResult));
    //controller files
    downloadZip.add("Resources/controller/dataManagement.js" , new Buffer(dataManagementFile));
    downloadZip.add("Resources/controller/loader.js" , new Buffer(loaderFile));

    if (jsonAppParse.icon) {
        downloadZip.add("Resources/android/" + jsonAppParse.icon, new Buffer(appIcon));
        downloadZip.add("Resources/iphone/" + jsonAppParse.icon, new Buffer(appIcon));
    }
    if (jsonAppParse.splashScreen) {
        downloadZip.add("Resources/android/default.png", new Buffer(splashScreen));
        downloadZip.add("Resources/iphone/Default.png", new Buffer(splashScreen));
    }
    //lib files
    downloadZip.add("Resources/lib/Backbone.CollectionBinder.Ti.js" , new Buffer(backboneCollectionBinder));
    downloadZip.add("Resources/lib/Backbone.CollectionUpdate.js" , new Buffer(backboneCollectionUpdate));
    downloadZip.add("Resources/lib/Backbone.DeepModel.js" , new Buffer(backboneDeepModel));
    downloadZip.add("Resources/lib/Backbone.Utils.js" , new Buffer(backboneUtils));
    downloadZip.add("Resources/lib/Backbone.ModelBinder.Ti.js" , new Buffer(backboneModelBinder));
    downloadZip.add("Resources/lib/Backbone.Sync.Ti.js" , new Buffer(backboneSync));
    downloadZip.add("Resources/lib/backbone.js" , new Buffer(backboneFile));
    downloadZip.add("Resources/lib/backbone.subset.js" , new Buffer(backboneSubset));
    downloadZip.add("Resources/lib/sjcl.js" , new Buffer(sjclFile));
    downloadZip.add("Resources/lib/underscore.js" , new Buffer(underscoreFile));
    downloadZip.add("Resources/utils.js" , new Buffer(utilsFile));
    //ui files
    downloadZip.add("Resources/ui/" + jsonConfParse.moduleName + '.js', new Buffer(baseResult));
    //images folder
    downloadZip.add("Resources/images/spinner.png", new Buffer(spinnerImage));

    response.send(downloadZip.toBuffer());
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});