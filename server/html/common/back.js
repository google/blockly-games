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
  var links = document.getElementsByClassName('back');
  for (var i = 0, a; (a = links[i]); i++) {
    a.href += (IS_HTML ? 'index.html' : '') + location.search;
  }
})();
