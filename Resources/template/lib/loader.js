/*
Simply Mobile - Mobile Development Framework
Copyright (c) 2012 Model N, Jérôme Ueberschlag, Clémence Aucagne, Jean-Baptiste Pringuey

See the file license.txt for copying permission.
*/


/*
 * Set the object attribute to the path of the wanted file.
 * @param {String} appDirectory The native path of the module directory
 * @param {String} fileUrl The URL where to download the file from the server
 * @param {Object} object The Titanium object (usually a View) whom we want to set the attribute to the file path
 * @param {String} attribute The name of the attribute that must be set to the path of the downloaded file
 */
SMapp.loadFile = function(appDirectory, fileUrl, object, attribute) {
    // TODO The filename is extracted from the URL so if you have two different files (two different URL) with the same name, they will overwrite each other
	Ti.API.info('fileUrl : ' + fileUrl);
	var filename = fileUrl.split('/');
	filename = filename[filename.length - 1];
    // We create a files directory inside the module directory (or use the existing one)
	var filesDirectory = Ti.Filesystem.getFile(appDirectory, 'files');
	if (!filesDirectory.exists()) {
		filesDirectory.createDirectory();
	}

	var file = Ti.Filesystem.getFile(filesDirectory.nativePath, filename);
	// If the file is already on the device, we do not download it again and just set the attribute
	if (file.exists()) {
		object[attribute] = file.nativePath;
		file = null;
	} else { // Else we download it from the server
		Ti.API.info('get file from server ' + fileUrl);
		// Create the HTTP client to download the asset.
		var xhr = Ti.Network.createHTTPClient({validatesSecureCertificate: true});
		xhr.onload = function() {
			if (xhr.status == 200) {
				// On successful load, take that image file we tried to grab before and
				// save the remote image data to it.
				file.write(xhr.responseData);
				// Assign the local asset path to the image view object.
				object[attribute] = file.nativePath;
				//To release memory
				file = null;
			};
		};
		// Issuing a GET request to the remote URL
		xhr.open('GET', fileUrl);
		// Finally, sending the request out.
		xhr.send();
		Ti.API.info('request sended');
	}
};

/*
 * Download the file at fileUrl and save it in the folder at directoryPath
 * @param {String} directoryPath Path to the directory where we want to save the file
 * @param {String} fileUrl Url where we can download the file from the server
 */
SMapp.loadAndSaveFile = function(directoryPath, fileUrl) {
	var filename = fileUrl.split('/');
	filename = filename[filename.length - 1];
	var file = Ti.Filesystem.getFile(directoryPath, filename);
	var xhr = Ti.Network.createHTTPClient({validatesSecureCertificate: true});
	xhr.onload = function() {
		if (xhr.status == 200) {
			// On successful load, take the file we tried to grab before and
			// save the remote file data to it.
			file.write(xhr.responseData);
			Ti.API.debug('New loaded file path: '+file.nativePath);
			//To release memory
			file = null;
		};
	};
	// Issuing a GET request to the remote URL
	xhr.open('GET', fileUrl);
	// Finally, sending the request out.
	xhr.send();
};