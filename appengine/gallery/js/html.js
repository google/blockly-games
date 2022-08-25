/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview HTML for Gallery.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Gallery.html');

goog.require('BlocklyGames');
goog.require('BlocklyGames.html');
goog.require('BlocklyGames.Msg');

/**
 * Web page structure.
 * @param {!Object} ij Injected options.
 * @returns {string} HTML.
 */
Gallery.html.start = function(ij) {
  return `
${BlocklyGames.html.headerBar(ij, BlocklyGames.Msg['Gallery'], '', false, false, '')}
<div id="gallery">
</div>
<div id="loading">
  <img src="common/loading.gif">
</div>
`;
};

/**
 * One record.
 * @param {string} app Application this record belongs to (turtle/movie/music)
 * @param {string} uuid Unique datastore key for the code (stored separately).
 * @param {string} thumb Base 64-encoded thumbnail.
 * @param {string} title User-provided title.
 * @param {boolean} published Is the record published?
 * @param {string} key Unique datastore key for this record.
 * @returns {string} HTML.
 */
Gallery.html.record = function(app, uuid, thumb, title, published, key) {
  const checkbox = key ?
      `<input type="checkbox" id="publish-${key}" ${published ? ' checked ' : ''} onchange="Gallery.publish(this)"></input>` :
      ''
  return `
<div class="galleryThumb">
  ${checkbox}
  <a href="/${app}?level=10#${uuid}"><img src="${thumb}"></a>
</div>
<div class="galleryTitle">
  <a href="/${app}?level=10#${uuid}">${title}</a>
</div>
`;
};