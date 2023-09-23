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


/**
 * Web page structure.
 * @param {!Object} ij Injected options.
 * @param {string} appName A title like 'Turtle : Gallery'.
 * @returns {string} HTML.
 */
Gallery.html.start = function(ij, appName) {
  return `
${BlocklyGames.html.headerBar(ij, appName, '', false, false, '')}
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
 * @param {string} key Unique datastore key for the code (stored separately).
 * @param {string} thumb Base 64-encoded thumbnail.
 * @param {string} title User-provided title.
 * @returns {string} HTML.
 */
Gallery.html.record = function(app, key, thumb, title) {
  return `
<div class="galleryThumb">
  <a href="/${app}?level=10#${key}"><img src="${thumb}"></a>
</div>
<div class="galleryTitle">
  <a href="/${app}?level=10#${key}">${title}</a>
</div>
`;
};
