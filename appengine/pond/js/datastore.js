goog.provide('Pond.Datastore');

/**
 * TODO: Get all ducks
 */
Pond.Datastore.copyDuck = function(duckId, onLoadCallback) {
    var data = [];
    data.push(Pond.Datastore.encodeElements('key', duckId));

    Pond.Datastore.makeRequest_('pond-storage/copy', 'POST', data, onLoadCallback);
};

/**
 * TODO: Create Duck 
 */
Pond.Datastore.createDuck = function(name, userid, onLoadCallback) {
    var data = [];
    data.push(Pond.Datastore.encodeElements('name', name));
    data.push(Pond.Datastore.encodeElements('userid', userid));

    Pond.Datastore.makeRequest_('pond-storage/create', 'POST', data, onLoadCallback);
};

/**
 * Delete duck
 */
Pond.Datastore.deleteDuck = function(duckId, callback) {
    var data = [];
    data.push(Pond.Datastore.encodeElements('key', duckId));
    data.push(Pond.Datastore.encodeElements('userid', 'Abby'));
    Pond.Datastore.makeRequest_('pond-storage/delete', 'POST', data, callback);
};

/**
 * TODO: Get all ducks
 */
Pond.Datastore.getAllDucks = function(onLoadCallback) {
    var url = 'pond-storage/ducks';
    Pond.Datastore.makeRequest_(url, 'GET', [], onLoadCallback);
};

/**
 * 
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
  
// TODO: Get one duck

// TODO: Update a duck

// TODO: Get user info

// TODO: Get match info