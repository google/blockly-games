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
goog.require('BlocklyStorage');
goog.require('Gallery.html');


BlocklyGames.storageName = 'gallery';

/**
 * One of 'turtle', 'movie', 'music'.
 * @type string
 */
let app;

/**
 * Initialize gallery.  Called on page load.
 */
function init() {
  app = BlocklyGames.getStringParamFromUrl('app', '');
  const appName = {
    'turtle': BlocklyGames.getMsg('Games.turtle', true) + ' : ',
    'movie': BlocklyGames.getMsg('Games.movie', true) + ' : ',
    'music': BlocklyGames.getMsg('Games.music', true) + ' : ',
  }[app];
  if (appName === undefined) {
    throw Error('Unknown app: ' + app);
  }
  // Render the HTML.
  document.body.innerHTML += Gallery.html.start(
      {lang: BlocklyGames.LANG, html: BlocklyGames.IS_HTML},
      appName + BlocklyGames.getMsg('Gallery', true));

  loadMore();
  BlocklyGames.init(BlocklyGames.getMsg('Gallery', true));

  const languageMenu = BlocklyGames.getElementById('languageMenu');
  languageMenu.addEventListener('change', BlocklyGames.changeLanguage, true);
  // Poll for needing more records.
  setInterval(needMore, 200);
}

/**
 * Flag for whether gallery is waiting on loading request.
 */
let loadRequested_ = false;

/**
 * Key to last record.
 * Empty string means no records have yet been fetched.
 * Null means there are no more records to fetch.
 */
let cursor = '';

/**
 * Load more entries.
 */
function loadMore() {
  if (loadRequested_ || cursor === null) {
    return;
  }

  BlocklyGames.getElementById('loading').style.visibility = 'visible';
  let url = '/scripts/gallery_view.py?app=' + encodeURIComponent(app);
  if (cursor) {
    url += '&cursor=' + encodeURIComponent(cursor);
  }
  const onFailure = function() {
    console.warn('Load returned status ' + this.status);
    loadRequested_ = false;
  };
  BlocklyStorage.makeRequest(url, '', receiveMore, onFailure, 'GET');
  loadRequested_ = true;
}

/**
 * Receive entries from the Gallery server.
 */
function receiveMore() {
  loadRequested_ = false;
  BlocklyGames.getElementById('loading').style.visibility = 'hidden';
  const data = JSON.parse(this.responseText);
  if (data.length) {
    const lastDatum = data[data.length - 1];
    if (lastDatum['cursor']) {
      // There are more records on the server.
      cursor = lastDatum['cursor'];
      data.pop();
    } else {
      // This was the last page of records.
      cursor = null;
    }
    data.forEach(display);
  } else {
    // No more records.
    cursor = null;
  }
}

/**
 * Display one more record to the gallery.
 * @param {!Object} record One art record.
 */
function display(record) {
  const block = document.createElement('div');
  block.innerHTML = Gallery.html.record(record['app'], record['key'],
      record['thumb'], record['title'], record['public'], record['key']);
  BlocklyGames.getElementById('gallery').appendChild(block);
}

/**
 * Automatically load more records if the screen is scrolled to the bottom.
 */
function needMore() {
  const rect = BlocklyGames.getElementById('loading').getBoundingClientRect();
  if (rect.top <=
      (window.innerHeight || document.documentElement.clientHeight)) {
    loadMore();
  }
}

BlocklyGames.callWhenLoaded(init);
