goog.provide('Pond.Datastore');

/**
 * Copy the duck with the given duckId.
 * @param {string} duckId The duckId of the duck to copy.
 * @param {!Function} onLoadCallback The function to be called when response is received.
 */
Pond.Datastore.copyDuck = function(duckId, onLoadCallback) {
    var data = [];
    data.push(Pond.Datastore.encodeElements('key', duckId));
    data.push(Pond.Datastore.encodeElements('getUserDucks', true));
    Pond.Datastore.makeRequest_('pond-storage/copy', 'POST', data, onLoadCallback);
};

/**
 * Create a duck with the given name.
 * @param {string} name The name of the duck.
 * @param {!Function} onLoadCallback The function to be called when response is received.
 */
Pond.Datastore.createDuck = function(name, onLoadCallback) {
    var data = [];
    data.push(Pond.Datastore.encodeElements('name', name));
    data.push(Pond.Datastore.encodeElements('getUserDucks', true));
    Pond.Datastore.makeRequest_('pond-storage/create', 'POST', data, onLoadCallback);
};

/**
 * Delete the duck with the given duckId.
 * @param {string} duckId The duckId of the duck to copy.
 * @param {!Function} onLoadCallback The function to be called when response is received.
 */
Pond.Datastore.deleteDuck = function(duckId, onLoadCallback) {
    var data = [];
    data.push(Pond.Datastore.encodeElements('key', duckId));
    data.push(Pond.Datastore.encodeElements('getUserDucks', true));
    Pond.Datastore.makeRequest_('pond-storage/delete', 'POST', data, onLoadCallback);
};

/**
 * Get all the ducks for the current user.
 * @param {!Function} onLoadCallback The function to be called when response is received.
 */
Pond.Datastore.getAllDucks = function(onLoadCallback) {
    var url = 'pond-storage/ducks';
    Pond.Datastore.makeRequest_(url, 'GET', [], onLoadCallback);
};

/**
 * TODO: Remove. We should instead be using the commone make request.
 */
Pond.Datastore.makeRequest_ = function(url, type, data, onLoadCallback) {
    var xhr = new XMLHttpRequest();
    xhr.open(type, url);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onload = onLoadCallback;
    if (data) {
        console.log(data.join('&'));
        xhr.send(data.join('&'));
    } else {
        xhr.send();
    }
};
  
  
/**
 * Encode form elements in map.
 * @param {HTMLFormElement} form Form to encode elements from.
 * @return {Object.<string, string>} Encoded elements.
 * @private
 */
Pond.Datastore.encodeElements = function(name, value) {
    return encodeURIComponent(name) + '=' + encodeURIComponent(value);
};
  
// TODO: Get a single duck

// TODO: Update a duck

// TODO: Get user info

// TODO: Get match info
