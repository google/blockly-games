goog.provide('Pond.Duck.Datastore');

/**
 * Copy the duck with the given key.
 * @param {string} duckKey The duckKey of the duck to copy.
 * @param {boolean} getUserDucks Whether to return list of user ducks in
 *      response.
 * @param {!Function} onSuccess Function to call after request completes
 *    successfully.
 */
Pond.Duck.Datastore.copyDuck = function(duckKey, getUserDucks, onSuccess) {
    var data = [];
    data.push(Pond.Duck.Datastore.encodeElements('key', duckKey));
    data.push(Pond.Duck.Datastore.encodeElements('getUserDucks', getUserDucks));
    BlocklyStorage['makeRequest']('pond-storage/copy', data.join('&'), onSuccess);
};

/**
 * Create a duck with the given name.
 * @param {string} name The name of the duck.
 * @param {string} js The Javascript code to save.
 * @param {string} xml The xml code to save, empty if user is in javascript
 *      mode.
 * @param {boolean} getUserDucks Whether to return list of user ducks in
 *      response.
 * @param {!Function} onSuccess Function to call after request completes
 *    successfully.
 */
Pond.Duck.Datastore.createDuck = function(name, js, xml, getUserDucks, onSuccess) {
    var data = [];
    data.push(Pond.Duck.Datastore.encodeElements('name', name));
    data.push(Pond.Duck.Datastore.encodeElements('js', js));
    data.push(Pond.Duck.Datastore.encodeElements('xml', xml));
    data.push(Pond.Duck.Datastore.encodeElements('getUserDucks', getUserDucks));
    BlocklyStorage['makeRequest']('pond-storage/create', data.join('&'), onSuccess);
};

/**
 * Delete the duck with the given key.
 * @param {string} duckKey The duckKey of the duck to copy.
 * @param {boolean} getUserDucks Whether to return list of user ducks in
 *      response.
 * @param {!Function} onSuccess Function to call after request completes
 *    successfully.
 */
Pond.Duck.Datastore.deleteDuck = function(duckKey, getUserDucks, onSuccess) {
    var data = [];
    data.push(Pond.Duck.Datastore.encodeElements('key', duckKey));
    data.push(Pond.Duck.Datastore.encodeElements('getUserDucks', getUserDucks));
    BlocklyStorage['makeRequest']('pond-storage/delete', data.join('&'), onSuccess);
};

/**
 * Save updated duck code.
 * @param {string} duckKey The key of the duck to copy.
 * @param {string} js The Javascript code to save.
 * @param {string} xml The xml code to save, empty if user is in javascript
 *      mode.
 * @param {!Function} onSuccess Function to call after request completes
 *    successfully.
 */
Pond.Duck.Datastore.updateDuckCode = function(duckKey, js, xml, onSuccess) {
    var data = [];
    data.push(Pond.Duck.Datastore.encodeElements('key', duckKey));
    data.push(Pond.Duck.Datastore.encodeElements('js', js));
    data.push(Pond.Duck.Datastore.encodeElements('xml', xml));
    BlocklyStorage['makeRequest']('pond-storage/update', data.join('&'), onSuccess);
};

/**
 * Get the specified ducks.
 * @param {string} duckKey The key for the duck.
 * @param {string} doPublish Whether to publish.
 * @param {!Function} onSuccess Function to call after request completes
 *    successfully.
 */
Pond.Duck.Datastore.setPublished = function(duckKey, doPublish, onSuccess) {
    var data = [];
    data.push(Pond.Duck.Datastore.encodeElements('key', duckKey));
    data.push(Pond.Duck.Datastore.encodeElements('publish', doPublish));
    BlocklyStorage['makeRequest']('pond-storage/publish', data.join('&'), onSuccess);
};

/**
 * Get all the ducks for the current user.
 * @param {!Function} onSuccess Function to call after request completes
 *    successfully.
 */
Pond.Duck.Datastore.getAllDucks = function(onSuccess) {
    BlocklyStorage['makeRequest']('pond-storage/get', '', onSuccess, null, 'GET');
};

/**
 * Get the duck with the specified duck id.
 * @param {string} duckKey The key for the duck.
 * @param {!Function} onSuccess Function to call after request completes
 *    successfully.
 */
Pond.Duck.Datastore.getDuck = function(duckKey, onSuccess) {
    var url = 'pond-storage/get?key='+ duckKey;
    BlocklyStorage['makeRequest'](url, '', onSuccess, null, 'GET');
};

/**
 * Callback function for request that redirects to new duck
 */
Pond.Duck.Datastore.redirectToNewDuck = function() {
    var meta = JSON.parse(this.responseText);
    var duckKey = meta['duck_key'];
    var url = window.location.origin
        + '/pond-duck-online?lang='+ BlocklyGames.LANG
        + '&duck=' + duckKey;
    window.location = url;
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
