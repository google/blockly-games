/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Defines AJAX request calls for Pond Online.
 * @author kozbial@google.com (Monica Kozbial)
 */
'use strict';
goog.provide('Pond.Duck.Datastore');

goog.require('BlocklyGames');
goog.require('BlocklyStorage');

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
    BlocklyStorage.makeRequest('pond-storage/copy', data.join('&'), onSuccess);
};

/**
 * Create a duck with the given name.
 * @param {string} name The name of the duck.
 * @param {!Function} onSuccess Function to call after request completes
 *    successfully.
 */
Pond.Duck.Datastore.createDuck = function(name, onSuccess) {
    var data = [];
    data.push(Pond.Duck.Datastore.encodeElements('name', name));
    BlocklyStorage.makeRequest('pond-storage/create', data.join('&'), onSuccess);
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
    BlocklyStorage.makeRequest('pond-storage/delete', data.join('&'), onSuccess);
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
    BlocklyStorage.makeRequest('pond-storage/update', data.join('&'), onSuccess);
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
    BlocklyStorage.makeRequest('pond-storage/publish', data.join('&'), onSuccess);
};

/**
 * Get all the ducks for the current user.
 * @param {!Function} onSuccess Function to call after request completes
 *    successfully.
 */
Pond.Duck.Datastore.getAllDucks = function(onSuccess) {
    BlocklyStorage.makeRequest('pond-storage/get', '', onSuccess, null, 'GET');
};

/**
 * Get the duck with the specified duck id.
 * @param {string} duckKey The key for the duck.
 * @param {!Function} onSuccess Function to call after request completes
 *    successfully.
 * @param {?Function=} opt_onFailure Function to call after request completes
 *    unsuccessfully. Defaults to BlocklyStorage alert of request status.
 */
Pond.Duck.Datastore.getDuck = function(duckKey, onSuccess, opt_onFailure) {
    var url = 'pond-storage/get?key='+ duckKey;
    BlocklyStorage.makeRequest(url, '', onSuccess, opt_onFailure, 'GET');
};

/**
 * Get a background match request for computing ranking.
 * @param {!Function} onSuccess Function to call after request completes
 *    successfully.
 */
Pond.Duck.Datastore.getMatchRequest = function(onSuccess) {
    BlocklyStorage.makeRequest('pond-storage/rank', '', onSuccess);
};

/**
 * Get the top ten ducks with the best ranking.
 * @param {string} duckKey The key for the duck. This is needed to tell what
 *     leaderboard we should get the top ten ducks from.
 * @param {!Function} onSuccess Function to call after request completes
 *    successfully.
 */
Pond.Duck.Datastore.getTopTenDucks = function(duckKey, onSuccess) {
    var url = 'pond-storage/get?key='+ duckKey + '&type=topducks';
    BlocklyStorage.makeRequest(url, '', onSuccess, null, 'GET');
};

/**
 * Get a background match request for computing ranking.
 * @param {Array.<string>} matchKey The key for the match request corresponding to
 *      this result.
 * @param {Array.<string>} entryKeys An ordered list of leaderboard entry keys
 *      representing a ranking match result.
 * @param {Function=} opt_onSuccess Function to call after request completes
 *    successfully.
 */
Pond.Duck.Datastore.sendMatchResult = function(matchKey, entryKeys, opt_onSuccess) {
    var data = [];
    data.push(Pond.Duck.Datastore.encodeElements('matchKey', matchKey));
    data.push(Pond.Duck.Datastore.encodeElements('entryKeys', entryKeys));
    BlocklyStorage.makeRequest('pond-storage/rank', data.join('&'), opt_onSuccess);
};

/**
 * Get three opponents for the duck with the given duckKey.
 * @param {string} duckKey The key for the duck.
 * @param {!Function} onSuccess Function to call after request completes
 *    successfully.
 */
Pond.Duck.Datastore.getOpponents = function(duckKey, onSuccess) {
    var url = 'pond-storage/opponents?key='+ duckKey;
    BlocklyStorage.makeRequest(url, '', onSuccess, null, 'GET');
};

/**
 * Callback function for request that redirects to new duck.
 */
Pond.Duck.Datastore.redirectToNewDuck = function() {
    var meta = JSON.parse(this.responseText);
    var duckKey = meta['duck_key'];

    var url = top.window.location.origin
        + '/pond-duck-online?lang='+ BlocklyGames.LANG
        + '&duck=' + duckKey;
    top.window.location = url;
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
