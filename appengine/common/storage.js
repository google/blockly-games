/**
 * @license
 * Copyright 2012 Google LLC
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
 * @fileoverview Loading and saving blocks with localStorage and cloud storage.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

// Create a namespace.
var BlocklyStorage = {};

/**
 * Backup code blocks or JavaScript to localStorage.
 * @private
 */
BlocklyStorage.backupBlocks_ = function() {
  if ('localStorage' in window) {
    var code = BlocklyInterface.getCode();
    // Gets the current URL, not including the hash.
    var url = window.location.href.split('#')[0];
    window.localStorage.setItem(url, code);
  }
};

/**
 * Bind the localStorage backup function to the unload event.
 */
BlocklyStorage.backupOnUnload = function() {
  window.addEventListener('unload', BlocklyStorage.backupBlocks_, false);
};

/**
 * Restore code blocks or JavaScript from localStorage.
 */
BlocklyStorage.restoreBlocks = function() {
  var url = window.location.href.split('#')[0];
  if ('localStorage' in window && window.localStorage[url]) {
    var code = window.localStorage[url];
    BlocklyInterface.setCode(code);
  }
};

/**
 * Save blocks or JavaScript to database and return a link containing the key.
 */
BlocklyStorage.link = function() {
  var code = BlocklyInterface.getCode();
  BlocklyStorage.makeRequest('/storage', 'xml=' + encodeURIComponent(code),
      BlocklyStorage.handleLinkResponse_);
};

/**
 * Retrieve XML text from database using given key.
 * @param {string} key Key to XML, obtained from href.
 */
BlocklyStorage.retrieveXml = function(key) {
  BlocklyStorage.makeRequest('/storage', 'key=' + encodeURIComponent(key),
      BlocklyStorage.handleRetrieveXmlResponse_);
};

/**
 * Global reference to current AJAX requests.
 * @type Object.<string, XMLHttpRequest>
 */
BlocklyStorage.xhrs_ = {};

/**
 * Fire a new AJAX request.
 * @param {string} url URL to fetch.
 * @param {string} data Body of data to be sent in request.
 * @param {?Function=} opt_onSuccess Function to call after request completes
 *    successfully.
 * @param {?Function=} opt_onFailure Function to call after request completes
 *    unsuccessfully. Defaults to BlocklyStorage alert of request status.
 * @param {string=} [opt_method='POST'] The HTTP request method to use.
 */
BlocklyStorage.makeRequest =
    function(url, data, opt_onSuccess, opt_onFailure, opt_method) {
  if (BlocklyStorage.xhrs_[url]) {
    // AJAX call is in-flight.
    BlocklyStorage.xhrs_[url].abort();
  }
  BlocklyStorage.xhrs_[url] = new XMLHttpRequest();
  BlocklyStorage.xhrs_[url].onload = function() {
    if (this.status === 200) {
      opt_onSuccess && opt_onSuccess.call(this);
    } else if (opt_onFailure) {
      opt_onFailure.call(this);
    } else {
      BlocklyStorage.alert(BlocklyStorage.HTTPREQUEST_ERROR + '\n' +
          'xhr_.status: ' + this.status);
    }
    BlocklyStorage.xhrs_[url] = null;
  };
  var method = opt_method || 'POST';
  BlocklyStorage.xhrs_[url].open(method, url);
  if (method === 'POST') {
    BlocklyStorage.xhrs_[url].setRequestHeader('Content-Type',
        'application/x-www-form-urlencoded');
  }
  BlocklyStorage.xhrs_[url].send(data);
};

/**
 * Callback function for link AJAX call.
 * @param {string} responseText Response to request.
 * @private
 */
BlocklyStorage.handleLinkResponse_ = function() {
  var data = this.responseText.trim();
  window.location.hash = data;
  BlocklyStorage.alert(BlocklyStorage.LINK_ALERT.replace('%1',
      window.location.href));
  BlocklyStorage.monitorChanges_();
};

/**
 * Callback function for retrieve xml AJAX call.
 * @param {string} responseText Response to request.
 * @private
 */
BlocklyStorage.handleRetrieveXmlResponse_ = function() {
  var data = this.responseText.trim();
  if (!data.length) {
    BlocklyStorage.alert(BlocklyStorage.HASH_ERROR.replace('%1',
        window.location.hash));
  } else {
    BlocklyInterface.setCode(data);
  }
  BlocklyStorage.monitorChanges_();
};

/**
 * Start monitoring the workspace.  If a change is made that changes the XML,
 * clear the key from the URL.  Stop monitoring the workspace once such a
 * change is detected.
 * @private
 */
BlocklyStorage.monitorChanges_ = function() {
  var startCode = BlocklyInterface.getCode();
  function change() {
    if (startCode != BlocklyInterface.getCode()) {
      window.location.hash = '';
      BlocklyInterface.getWorkspace().removeChangeListener(bindData);
    }
  }
  var bindData = BlocklyInterface.getWorkspace().addChangeListener(change);
};

/**
 * Present a text message to the user.
 * Designed to be overridden if an app has custom dialogs, or a butter bar.
 * @param {string} message Text to alert.
 */
BlocklyStorage.alert = function(message) {
  window.alert(message);
};
