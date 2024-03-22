/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Loading and saving blocks and code using cloud storage.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('BlocklyStorage');

goog.require('BlocklyGames');


/**
 * Function to get the code from Blockly or from the JS editor.
 * @type Function()
 */
BlocklyStorage.getCode = null;

/**
 * Function to set the code to Blockly or to the JS editor.
 * @type Function(string)
 */
BlocklyStorage.setCode = null;

/**
 * If code recorded code changes, delete the URL hash.
 * @type ?string
 */
BlocklyStorage.startCode = null;

/**
 * Save blocks or JavaScript to database and return a link containing the key.
 */
BlocklyStorage.link = function() {
  const code = BlocklyStorage.getCode();
  BlocklyStorage.makeRequest('/scripts/storage.py',
      'app=' + encodeURIComponent(BlocklyGames.storageName) +
      '&data=' + encodeURIComponent(code),
      BlocklyStorage.handleLinkResponse_);
};

/**
 * Retrieve XML/JS text from database using given key.
 * @param {string} app Name of application ('maze', 'turtle', ...).
 * @param {string} key Key to XML, obtained from href.
 */
BlocklyStorage.retrieveXml = function(app, key) {
  BlocklyStorage.makeRequest(`/data/${app}/storage/${key}.blockly`, '',
      BlocklyStorage.handleRetrieveXmlResponse_, null, 'GET');
};

/**
 * Global reference to current AJAX requests.
 * @type Map<string, XMLHttpRequest>
 */
BlocklyStorage.xhrs_ = new Map();

/**
 * Fire a new AJAX request.
 * @param {string} url URL to fetch.
 * @param {string} data Body of data to be sent in request.
 * @param {?Function=} opt_onSuccess Function to call after request completes
 *    successfully.
 * @param {?Function=} opt_onFailure Function to call after request completes
 *    unsuccessfully.  Defaults to BlocklyStorage alert of request status.
 * @param {string=} method The HTTP request method to use.  Default to POST.
 */
BlocklyStorage.makeRequest =
    function(url, data, opt_onSuccess, opt_onFailure, method = 'POST') {
  if (BlocklyStorage.xhrs_.has(url)) {
    // AJAX call is in-flight.
    BlocklyStorage.xhrs_.get(url).abort();
  }
  const xhr = new XMLHttpRequest();
  BlocklyStorage.xhrs_.set(url, xhr);
  xhr.onload = function() {
    if (this.status === 200) {
      opt_onSuccess && opt_onSuccess.call(xhr);
    } else if (opt_onFailure) {
      opt_onFailure.call(xhr);
    } else {
      BlocklyStorage.alert_(BlocklyGames.getMsg('Games.httpRequestError', false) +
          '\nXHR status: ' + xhr.status);
    }
    BlocklyStorage.xhrs_.delete(url);
  };
  if (method === 'POST') {
    xhr.open(method, url);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(data);
  } else {
    if (data) {
      url += '?' + data;
    }
    xhr.open(method, url);
    xhr.send();
  }
};

/**
 * Callback function for link AJAX call.
 * @private
 */
BlocklyStorage.handleLinkResponse_ = function() {
  const data = this.responseText.trim();
  window.location.hash = data;
  BlocklyStorage.alert_(BlocklyGames.getMsg('Games.linkAlert', false).replace('%1',
      window.location.href));
  BlocklyStorage.startCode = BlocklyStorage.getCode();
};

/**
 * Callback function for retrieve XML AJAX call.
 * @private
 * @this {!XMLHttpRequest}
 */
BlocklyStorage.handleRetrieveXmlResponse_ = function() {
  let data = this.responseText.trim();
  if (!data.length) {
    BlocklyStorage.alert_(BlocklyGames.getMsg('Games.hashError', false)
        .replace('%1', window.location.hash));
  } else {
    // Remove poison line to prevent raw content from being served.
    data = data.replace(/^\{\[\(\< UNTRUSTED CONTENT \>\)\]\}\n/, '');
    BlocklyStorage.setCode(data);
  }
  BlocklyStorage.startCode = BlocklyStorage.getCode();
};

/**
 * Present a text message modally to the user.
 * @param {string} message Text to alert.
 * @private
 */
BlocklyStorage.alert_ = function(message) {
  // Try to use a nice dialog.
  // Fall back to browser's alert() if BlocklyDialogs is not part of build.
  if (typeof BlocklyDialogs === 'object') {
    const linkButton = BlocklyGames.getElementById('linkButton');
    BlocklyDialogs.storageAlert(linkButton, message);
  } else {
    alert(message);
  }
};
