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
  const headers = document.getElementsByTagName('h2');
  for (let i = 0, header; (header = headers[i]); i++) {
    const img = document.createElement('img');
    img.src = '../common/1x1.gif';
    header.insertBefore(img, header.firstChild);
    header.className = 'zippy-header-collapsed';
    const content = document.getElementById(header.id + '-content');
    content.className = 'zippy-content-collapsed';
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
  const header = e.currentTarget;
  const content = document.getElementById(header.id + '-content');
  const isOpen = content.className === 'zippy-content-expanded';
  header.className =
      'zippy-header-' + (isOpen ? 'collapsed' : 'expanded');
  content.className =
      'zippy-content-' + (isOpen ? 'collapsed' : 'expanded');
  content.style.maxHeight = isOpen ? 0 : (content.scrollHeight + 'px');
}

(function() {
  window.addEventListener('load', init);
  const param = window.location.search.match(/[?&]mode=([^&]+)/);
  const level = param ? Number(param[1]) : 11;
  const hide = level % 2 ? 'hideJs' : 'hideBlocks';
  const classes = [hide];
  for (let i = level + 1; i <= 11; i++) {
    classes.push('hideLevel' + i);
  }
  document.body.className = classes.join(' ');
})();
