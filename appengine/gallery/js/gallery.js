/**
 * Blockly Games: Gallery
 *
 * Copyright 2018 Google Inc.
 * https://github.com/google/blockly-games
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
 * @fileoverview JavaScript for Gallery.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Gallery');

goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('Gallery.soy');


BlocklyGames.NAME = 'gallery';

/**
 * Initialize gallery.  Called on page load.
 */
Gallery.init = function() {
  Gallery.app = BlocklyGames.getStringParamFromUrl('app', '');
  var isAdmin = (Gallery.app == 'admin');
  if (!isAdmin && ['turtle', 'movie', 'music'].indexOf(Gallery.app) == -1) {
    throw 'Unknown app: ' + Gallery.app;
  }
  if (isAdmin) {
    document.body.className = 'admin';
  }
  // Render the Soy template.
  // First, just render the messages.
  document.body.innerHTML = Gallery.soy.messages({}, null, {});
  // Second, look up the app name message.
  var appName = isAdmin ?
      '' : (BlocklyGames.getMsg('Games_' + Gallery.app) + ' : ');
  // Third, render the rest of the page, using the app name.
  document.body.innerHTML += Gallery.soy.start({}, null,
      {lang: BlocklyGames.LANG,
       appName: appName,
       html: BlocklyGames.IS_HTML});

  Gallery.loadMore();
  BlocklyGames.init();

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
 * Opaque key to current data loading cursor.
 */
Gallery.cursor = '';

/**
 * Load more entries.
 */
Gallery.loadMore = function() {
  if (Gallery.xhr_ || !Gallery.hasMore) {
    return;
  }
  document.getElementById('loading').style.visibility = 'visible';
  var xhr = new XMLHttpRequest();
  var url = '/gallery-api/view?app=' + encodeURIComponent(Gallery.app);
  if (Gallery.cursor) {
    url += '&cursor=' + encodeURIComponent(Gallery.cursor);
  }
  xhr.open('GET', url, true);
  xhr.onreadystatechange = Gallery.receiveMore;
  xhr.send();
  Gallery.xhr_ = xhr;
};

/**
 * Receive entries from the Gallery server.
 */
Gallery.receiveMore = function() {
  var xhr = Gallery.xhr_;
  if (xhr.readyState !== 4) {
    return;  // Not ready yet.
  }
  document.getElementById('loading').style.visibility = 'hidden';
  Gallery.xhr_ = null;
  if (xhr.status !== 200) {
    console.warn('Load returned status ' + xhr.status);
    Gallery.hasMore = false;
    if (xhr.status === 401) {
      // User isn't logged in.  Bounce to the admin page.
      location = '/admin';
    }
    return;
  }
  var meta = JSON.parse(xhr.responseText);
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
  // Rebuild the record object since the Closure Compiler renames properties.
  var safeRecord = {
    app: record['app'],
    uuid: record['uuid'],
    thumb: record['thumb'],
    title: record['title'],
    published: record['public'],
    key: record['key']
  };
  var block = document.createElement('div');
  block.innerHTML = Gallery.soy.record(safeRecord);
  document.getElementById('gallery').appendChild(block);
};

/**
 * Publish or unpublish a record.
 * @param {!Element} element Checkbox element.
 */
Gallery.publish = function(element) {
  var key = element.id.substring(8);
  var publish = Number(element.checked);

  var xhr = new XMLHttpRequest();
  var url = '/gallery-api/admin';
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.send('key=' + encodeURIComponent(key) + '&public=' + publish);
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
