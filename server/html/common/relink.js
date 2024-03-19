/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for correctly linking the title link(s).
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

(function() {
  // Change the 'Blockly Games' link when served as raw HTML files.
  // Append the language.
  var IS_HTML = /\.html$/.test(window.location.pathname);
  var links = document.getElementsByClassName('htmlLink')
  for (var i = 0, link; (link = links[i]); i++) {
    link.href = (IS_HTML ? link.dataset.href : link.href) + location.search;
  }
})();
