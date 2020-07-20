/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for Pond Documentation.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Pond.Docs');

goog.require('BlocklyGames');
goog.require('Pond.Docs.soy');


/**
 * Print the page.  Called on page load.
 */
Pond.Docs.init = function() {
  var param = window.location.search.match(/[?&]mode=([^&]+)/);
  var level = param ? Number(param[1]) : Infinity;
  var pond = level % 2 ? 'blocks' : 'js';
  document.body.innerHTML = Pond.Docs.soy.start({}, null,
      {level: level,
       pond: pond});

  // Turn all h2 tags into zippies.
  var headers = document.getElementsByTagName('h2');
  for (var i = 0, header; (header = headers[i]); i++) {
    var img = document.createElement('img');
    img.src = '../common/1x1.gif';
    header.insertBefore(img, header.firstChild);
    header.className = 'zippy-header-collapsed';
    var content = document.getElementById(header.id + '-content');
    content.className = 'zippy-content-collapsed';
    BlocklyGames.bindClick(header, Pond.Docs.toggle);
  }
};

/**
 * Toggle one section open or closed.
 * @param {!Event} e The click or touch event.
 */
Pond.Docs.toggle = function(e) {
  var header = e.currentTarget;
  var content = document.getElementById(header.id + '-content');
  var isOpen = content.className == 'zippy-content-expanded';
  header.className =
      'zippy-header-' + (isOpen ? 'collapsed' : 'expanded');
  content.className =
      'zippy-content-' + (isOpen ? 'collapsed' : 'expanded');
  content.style.maxHeight = isOpen ? 0 : (content.scrollHeight + 'px');
};

window.addEventListener('load', Pond.Docs.init);
