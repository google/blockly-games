goog.provide('Pond.Duck.Datastore');

/**
 * Copy the duck with the given duckId.
 * @param {string} duckId The duckId of the duck to copy.
 * @param {!Function} onLoadCallback The function to be called when response is received.
 */
Pond.Duck.Datastore.copyDuck = function(duckId, onLoadCallback) {
    var data = [];
    data.push(Pond.Duck.Datastore.encodeElements('key', duckId));
    data.push(Pond.Duck.Datastore.encodeElements('getUserDucks', true));
    Pond.Duck.Datastore.makeRequest_('pond-storage/copy', 'POST', data, onLoadCallback);
};

/**
 * Create a duck with the given name.
 * @param {string} name The name of the duck.
 * @param {!Function} onLoadCallback The function to be called when response is received.
 */
Pond.Duck.Datastore.createDuck = function(name, onLoadCallback) {
    var data = [];
    data.push(Pond.Duck.Datastore.encodeElements('name', name));
    data.push(Pond.Duck.Datastore.encodeElements('getUserDucks', true));
    Pond.Duck.Datastore.makeRequest_('pond-storage/create', 'POST', data, onLoadCallback);
};

/**
 * Delete the duck with the given duckId.
 * @param {string} duckId The duckId of the duck to copy.
 * @param {!Function} onLoadCallback The function to be called when response is received.
 */
Pond.Duck.Datastore.deleteDuck = function(duckId, onLoadCallback) {
    var data = [];
    data.push(Pond.Duck.Datastore.encodeElements('key', duckId));
    data.push(Pond.Duck.Datastore.encodeElements('getUserDucks', true));
    Pond.Duck.Datastore.makeRequest_('pond-storage/delete', 'POST', data, onLoadCallback);
};

/**
 * Save updated duck code.
 * @param {string} duckId The duckId of the duck to copy.
 * @param {string} js The javscript code to save.
 * @param {string} xml The xml code to save, empty if user is in javascript
 *      mode.
 * @param {!Function} onLoadCallback The function to be called when response is received.
 */
Pond.Duck.Datastore.updateDuckCode = function(duckId, js, xml, onLoadCallback) {
    var data = [];
    data.push(Pond.Duck.Datastore.encodeElements('key', duckId));
    data.push(Pond.Duck.Datastore.encodeElements('js', js));
    data.push(Pond.Duck.Datastore.encodeElements('xml', xml));
    Pond.Duck.Datastore.makeRequest_('pond-storage/update', 'POST', data, onLoadCallback);
};

/**
 * Get all the ducks for the current user.
 * @param {string} duckKey The key for the duck.
 * @param {string} doPublish Whether to publish.
 * @param {!Function} onLoadCallback The function to be called when response is received.
 */
Pond.Duck.Datastore.setPublished = function(duckId, doPublish, onLoadCallback) {
    var data = [];
    data.push(Pond.Duck.Datastore.encodeElements('key', duckId));
    data.push(Pond.Duck.Datastore.encodeElements('publish', doPublish));
    Pond.Duck.Datastore.makeRequest_('pond-storage/publish', 'POST', data, onLoadCallback);
};

/**
 * Get all the ducks for the current user.
 * @param {!Function} onLoadCallback The function to be called when response is received.
 */
Pond.Duck.Datastore.getAllDucks = function(onLoadCallback) {
    Pond.Duck.Datastore.makeRequest_('pond-storage/get', 'GET', [], onLoadCallback);
};

/**
 * Get the duck with the specified duck id.
 * @param {string} duckKey The key for the duck.
 * @param {!Function} onLoadCallback The function to be called when response is received.
 */
Pond.Duck.Datastore.getDuck = function(duckKey, onLoadCallback) {
    var url = 'pond-storage/get?key='+ duckKey;
    Pond.Duck.Datastore.makeRequest_(url, 'GET', [], onLoadCallback);
};

/**
 * TODO: Remove. We should instead be using the common make request.
 */
Pond.Duck.Datastore.makeRequest_ = function(url, type, data, onLoadCallback) {
    var xhr = new XMLHttpRequest();
    xhr.open(type, url);
    if (type !== 'GET') {
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    xhr.onload = onLoadCallback;
    console.log(url);
    if (data) {
        console.log(data.join('&'));
        xhr.send(data.join('&'));
    } else {
        xhr.send();
    }
};

/**
 * Callback function for request that displays error on failure.
 */
Pond.Duck.Datastore.messageOnError = function() {
    if (this.status !== 200) {
        var text = BlocklyGames.getMsg('Games_httpRequestError') + '\nStatus: '
            + this.status;
        BlocklyDialogs.storageAlert(null, text);
    }
};

/**
 * Callback function for request that redirects to new duck
 */
Pond.Duck.Datastore.redirectToNewDuck = function() {
    Pond.Duck.Datastore.messageOnError.call(this);
    if (this.status === 200) {
        var meta = JSON.parse(this.responseText);
        var duckKey = meta['duck_key'];
        var url = window.location.origin + '/pond-duck-online?duck=' + duckKey;
        window.location = url;
    }
};

/**
 * Encode form elements in map.
 * @param {HTMLFormElement} form Form to encode elements from.
 * @return {Object.<string, string>} Encoded elements.
 * @private
 */
Pond.Duck.Datastore.encodeElements = function(name, value) {
    return encodeURIComponent(name) + '=' + encodeURIComponent(value);
};

// TODO: Get match info
