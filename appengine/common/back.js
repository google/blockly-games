/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for correctly linking the title link.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

(function() {
  // Change the 'Blockly Games' link when served as raw HTML files.
  // Append the language.
  var IS_HTML = /\.html$/.test(window.location.pathname);
  document.getElementById('back').href =
      (IS_HTML ? 'index.html' : '/') + location.search;
})();
