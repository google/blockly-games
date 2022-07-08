/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for Gallery.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Gallery');

goog.require('BlocklyGames');
goog.require('BlocklyGames.Msg');
goog.require('BlocklyStorage');
goog.require('Gallery.html');


BlocklyGames.NAME = 'gallery';

/**
 * Initialize gallery.  Called on page load.
 */
Gallery.init = function() {
  Gallery.app = BlocklyGames.getStringParamFromUrl('app', '');
  var isAdmin = (Gallery.app === 'admin');
  if (!isAdmin && ['turtle', 'movie', 'music'].indexOf(Gallery.app) === -1) {
    throw Error('Unknown app: ' + Gallery.app);
  }
  if (isAdmin) {
    document.body.className = 'admin';
  }
  // Render the HTML.
  var appName = isAdmin ?
      '' : (BlocklyGames.Msg['Games.' + Gallery.app] + ' : ');
  document.body.innerHTML += Gallery.html.start(
      {lang: BlocklyGames.LANG,
       appName: appName,
       html: BlocklyGames.IS_HTML});

  Gallery.loadMore();
  BlocklyGames.init(BlocklyGames.Msg['Gallery']);

  var languageMenu = document.getElementById('languageMenu');
  languageMenu.addEventListener('change', BlocklyGames.changeLanguage, true);
  // Poll for needing more records.
  setInterval(Gallery.needMore, 200);
};

/**
 * Flag for whether the server has more rows of data.
 */
Gallery.hasMore = true;

/**
 * Flag for whether gallery is waiting on loading request.
 */
Gallery.loadRequested_ = false;

/**
 * Opaque key to current data loading cursor.
 */
Gallery.cursor = '';

/**
 * Load more entries.
 */
Gallery.loadMore = function() {
  if (Gallery.loadRequested_ || !Gallery.hasMore) {
    return;
  }

  document.getElementById('loading').style.visibility = 'visible';
  var url = '/gallery-api/view?app=' + encodeURIComponent(Gallery.app);
  if (Gallery.cursor) {
    url += '&cursor=' + encodeURIComponent(Gallery.cursor);
  }
  var onFailure = function() {
    console.warn('Load returned status ' + this.status);
    Gallery.loadRequested_ = false;
    Gallery.hasMore = false;
    if (this.status === 401) {
      // User isn't logged in.  Bounce to the admin page.
      location = '/admin';
    }
  };
  BlocklyStorage.makeRequest(url, '', Gallery.receiveMore, onFailure, 'GET');
  Gallery.loadRequested_ = true;
};

/**
 * Receive entries from the Gallery server.
 */
Gallery.receiveMore = function() {
  Gallery.loadRequested_ = false;
  document.getElementById('loading').style.visibility = 'hidden';
  var meta = JSON.parse(this.responseText);
  if (!meta['more']) {
    Gallery.hasMore = false;
  }
  Gallery.cursor = meta['cursor'];

  for (var i = 0; i < meta['data'].length; i++) {
    Gallery.display(meta['data'][i]);
  }
};

/**
 * Display one more record to the gallery.
 * @param {!Object} record One art record.
 */
Gallery.display = function(record) {
  var block = document.createElement('div');
  block.innerHTML = Gallery.html.record(record['app'], record['uuid'],
      record['thumb'], record['title'], record['public'], record['key']);
  document.getElementById('gallery').appendChild(block);
};

/**
 * Publish or unpublish a record.
 * @param {!Element} element Checkbox element.
 */
Gallery.publish = function(element) {
  var key = element.id.substring(8);
  var publish = Number(element.checked);
  var url = '/gallery-api/admin';
  var data = 'key=' + encodeURIComponent(key) + '&public=' + publish;
  BlocklyStorage.makeRequest(url, data);
};

/**
 * Automatically load more records if the screen is scrolled to the bottom.
 */
Gallery.needMore = function() {
  var rect = document.getElementById('loading').getBoundingClientRect();
  if (rect.top <=
      (window.innerHeight || document.documentElement.clientHeight)) {
    Gallery.loadMore();
  }
};

window.addEventListener('load', Gallery.init);

// Export symbols that would otherwise be renamed by Closure compiler.
if (!window['Gallery']) {
  window['Gallery'] = {};
}
window['Gallery']['publish'] = Gallery.publish;
