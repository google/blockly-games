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

/**
 * Turn all h2 tags into zippies.  Called on page load.
 */
function init() {
  var headers = document.getElementsByTagName('h2');
  for (var i = 0, header; (header = headers[i]); i++) {
    var img = document.createElement('img');
    img.src = '../common/1x1.gif';
    header.insertBefore(img, header.firstChild);
    header.classList.add('zippy-header-collapsed');
    var content = document.getElementById(header.id + '-content');
    content.classList.add('zippy-content-collapsed');
    bindClick(header, toggle);
  }
}

/**
 * Bind a function to a button's click event.
 * On touch-enabled browsers, ontouchend is treated as equivalent to onclick.
 * @param {Element} el Button element.
 * @param {!Function} func Event handler to bind.
 */
function bindClick(el, func) {
  el.addEventListener('click', func, true);
  function touchFunc(e) {
    // Prevent code from being executed twice on touchscreens.
    e.preventDefault();
    func(e);
  }
  el.addEventListener('touchend', touchFunc, true);
}

/**
 * Toggle one section open or closed.
 * @param {!Event} e The click or touch event.
 */
function toggle(e) {
  var header = e.currentTarget;
  var content = document.getElementById(header.id + '-content');
  var isOpen = content.classList.contains('zippy-content-expanded');
  header.classList.add(
      'zippy-header-' + (isOpen ? 'collapsed' : 'expanded'));
  content.classList.add(
      'zippy-content-' + (isOpen ? 'collapsed' : 'expanded'));
  header.classList.remove(
      'zippy-header-' + (isOpen ? 'expanded' : 'collapsed'));
  content.classList.remove(
      'zippy-content-' + (isOpen ? 'expanded' : 'collapsed'));
  content.style.maxHeight = isOpen ? 0 : (content.scrollHeight + 'px');
}

(function() {
  window.addEventListener('load', init);
  var param = window.location.search.match(/[?&]mode=([^&]+)/);
  var level = param ? Number(param[1]) : 11;
  var hide = level % 2 ? 'hideJs' : 'hideBlocks';
  var classes = [hide];
  for (var i = level + 1; i <= 11; i++) {
    classes.push('hideLevel' + i);
  }
  document.body.className = classes.join(' ');
})();
