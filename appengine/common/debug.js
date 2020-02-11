/**
 * @license
 * Copyright 2015 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript Debug page.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

function setDebug(debug) {
  if (debug) {
    sessionStorage.setItem('debug', 1);
    console.info('Uncompressed mode activated.  Happy hacking!');
  } else {
    sessionStorage.removeItem('debug');
    console.info('Compressed mode activated.');
  }
}

(function() {
  var debug = !!sessionStorage.getItem('debug');
  document.getElementById(debug ? 'debug1' : 'debug0').checked = true;
})();
