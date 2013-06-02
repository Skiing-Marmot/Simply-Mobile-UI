/*
Simply Mobile - Mobile Development Framework
Copyright (c) 2012 Model N, Jérôme Ueberschlag, Clémence Aucagne, Jean-Baptiste Pringuey

See the file license.txt for copying permission.
*/


var sendDataHandler = function(e) {
    // Add the data to the list of data to send and call the hasDataToSend() method to process the list
    SMapp.dataToSendList.push(e);
    hasDataToSend();
};
Ti.App.addEventListener('send_data', sendDataHandler);
var loginHandler = function(e) {
    SMapp.sendLogin(e.username, e.password);
};
Ti.App.addEventListener('login', loginHandler);

/*
 * Send the login data to the server
 * If the server replies, fires a login_result event with the login, password and server response
 * Else, fires a 'no_network_for_login' event
 * @param {String} username The username (email address) to send to the server
 * @param {String} password The password to send to the server (since we use https, it should not be visible)
 */
SMapp.sendLogin = function(username, password) {

    var postUrl = SMapp.serverUrl + 'modeln/login';

    var xhr = Ti.Network.createHTTPClient({
        validatesSecureCertificate : true,
        onload : function() {
            // fireEvent so the LoginWindow knows if the login was successful or not
            Ti.App.fireEvent('login_result', {
                result : this.responseText,
                login : username,
                pwd : password
            });
        },
        onerror : function() {
            // fireEvent so the LoginWindow knows it has to check in the saved file if the login/password are correct
            Ti.App.fireEvent('no_network_for_login');
            Ti.API.info('Login Data was not sent');
        },
        timeout : 1000
    });
    xhr.open('POST', postUrl);
    xhr.send({
        username : username,
        password : password
    });
}
/*
 * Sends data to the server and if the server response has an 'event' attribute, fires the corresponding event with the received response
 * If the data could not be sent, the e object is put again at the first position of the SMapp.toSendList
 * @param {Object} e Javascript object with an url, an action (that will be added to the end of the url) and data to send to the server
 */
function sendData(e) {

    if (Ti.Network.online) {
        var url = e.url;
        var action = e.action;
        if (url[url.length - 1] != '/') {
            url = url.concat('/' + action);
        } else {
            url = url.concat(action);
        }
        var xhr = Ti.Network.createHTTPClient({
            validatesSecureCertificate : true,
            onload : function() {
                Ti.API.info('--------- Server response -------------- ' + this.responseText);
                //	If the response is an object we parse it
                if (this.responseText[0] == '{' || this.responseText[0] == '[') {
                    var response = JSON.parse(this.responseText);
                    // If the response has an attribute event, the corresponding event will be fired with the received data
                    // The response must also have an 'appId' and a 'data' attributes
                    if (response.hasOwnProperty('event')) {
                        Ti.App.fireEvent(response.appId + response.event, {
                            data : response.data
                        });
                    }
                }
            },
            onerror : function() {
                // We put again the data in the list
                SMapp.toSendList.unshift(e);
                Ti.API.info('Data was not sent');
            },
            timeout : 100000
        });
        xhr.open('POST', url);
        
        var data = e.data;
        var newData = JSON.stringify(data);
        // We would not need to send the login anymore if we used cookies
        var toSend = {
            login : SMapp.user.login,
            data : newData
        };
        Ti.API.debug('toSend: ' + JSON.stringify(toSend));
        xhr.send(toSend);
    } else {
        // If we are not online, we cannot send the data and we put e at the first position of the list so it will still be the next to be sent 
        SMapp.toSendList.unshift(e);
        Ti.API.info('Not online, waiting data: ' + SMapp.dataToSendList.length);
    }
};

/*
 * Called each time there is new data to send and periodically to send data that could not be sent previously
 * While SMapp.user.login is null (ie. we could not send the login to the server yet), we try to send the authentication request to the server
 * If there are data in the SMapp.dataToSendList, we add them to the SMapp.toSendList so the data stay in the correct order
 * When ther is network, we try to send the first data in the SMapp.toSendList
 */
function hasDataToSend() {
    var l = SMapp.dataToSendList.length;
    if (l > 0) {
        for ( i = 0; i < l; i++) {
            SMapp.toSendList.push(SMapp.dataToSendList.shift());
        }
    }
    if (SMapp.user.login != null) {
        // Check if there is data to send and if network is available
        while (SMapp.toSendList.length > 0 && Ti.Network.online) {
            sendData(SMapp.toSendList.shift());
        }
    } else {
        //TODO : remove all info from the sendList or ask for login again
    }
}
// Looks periodically if there is network and if there is waiting data to send to server
setInterval(hasDataToSend, 10000);