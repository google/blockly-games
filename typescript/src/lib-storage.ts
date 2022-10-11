/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Loading and saving blocks and code using cloud storage.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
import {getMsg, getElementById} from './lib-games.js';


/**
 * Function to get the code from Blockly or from the JS editor.
 * @type Function()
 */
let getCodeFunction_: Function = null;

/**
 * Function to set the code to Blockly or to the JS editor.
 */
export function setGetCodeFunction(func: () => string) {
  getCodeFunction_ = func;
}

/**
 * Function to set the code to Blockly or to the JS editor.
 * @type Function(string)
 */
let setCodeFunction_: Function = null;

/**
 * Function to set the code to Blockly or to the JS editor.
 */
export function setSetCodeFunction(func: (message: string) => void) {
  setCodeFunction_ = func;
}

/**
 * If code recorded code changes, delete the URL hash.
 * @type ?string
 */
export let startCode: (string | null) = null;

/**
 * Setter for `startCode`.
 * @param {string} newCode New code string.
 */
export function setStartCode(newCode: string) {
  startCode = newCode;
}

/**
 * Save blocks or JavaScript to database and return a link containing the key.
 */
export function link() {
  const code = getCodeFunction_();
  makeRequest('/storage', 'xml=' + encodeURIComponent(code), handleLinkResponse_);
}

/**
 * Retrieve XML text from database using given key.
 * @param {string} key Key to XML, obtained from href.
 */
export function retrieveXml(key: string) {
  makeRequest('/storage', 'key=' + encodeURIComponent(key), handleRetrieveXmlResponse_);
}

/**
 * Global reference to current AJAX requests.
 * @type Map<string, XMLHttpRequest>
 * @private
 */
let xhrs_: Map<string, XMLHttpRequest> = new Map();

/**
 * Fire a new AJAX request.
 * @param {string} url URL to fetch.
 * @param {string} data Body of data to be sent in request.
 * @param {?Function=} onSuccess Function to call after request completes
 *    successfully.
 * @param {?Function=} onFailure Function to call after request completes
 *    unsuccessfully. Defaults to BlocklyStorage alert of request status.
 * @param {string=} method The HTTP request method to use.  Default to POST.
 */
export function makeRequest(url: string, data: string,
    onSuccess: Function | undefined = null,
    onFailure: Function | undefined = null,
    method: string | undefined = 'POST') {
  if (xhrs_.has(url)) {
    // AJAX call is in-flight.
    xhrs_.get(url).abort();
  }
  const xhr = new XMLHttpRequest();
  xhrs_.set(url, xhr);
  xhr.onload = function() {
    if (this.status === 200) {
      onSuccess && onSuccess.call(xhr);
    } else if (onFailure) {
      onFailure.call(xhr);
    } else {
      alert_(getMsg('Games.httpRequestError', false) +
          '\nXHR status: ' + xhr.status);
    }
    xhrs_.delete(url);
  };
  xhr.open(method, url);
  if (method === 'POST') {
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  }
  xhr.send(data);
}

/**
 * Callback function for link AJAX call.
 * @private
 */
function handleLinkResponse_() {
  const data = this.responseText.trim();
  window.location.hash = data;
  alert_(getMsg('Games.linkAlert', false).replace('%1', window.location.href));
  startCode = getCodeFunction_();
}

/**
 * Callback function for retrieve XML AJAX call.
 * @private
 */
function handleRetrieveXmlResponse_() {
  const data = this.responseText.trim();
  if (!data.length) {
    alert_(getMsg('Games.hashError', false).replace('%1', window.location.hash));
  } else {
    setCodeFunction_(data);
  }
  startCode = getCodeFunction_();
}

/**
 * Present a text message modally to the user.
 * Default is a simple alert, but can be replaced by a call to BlocklyDialogs.
 * @param {string} message Text to alert.
 * @private
 */
let alert_ = function(message: string) {
  alert(message);
}

/**
 * Function to set the code to Blockly or to the JS editor.
 */
export function setAlertFuncion(func: (message: string) => void) {
  alert_ = func;
}
