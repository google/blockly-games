/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview HTML for index page.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Index.html');

goog.require('BlocklyGames');
goog.require('BlocklyGames.Msg');


/**
 * Web page structure.
 * @param {!Object} ij Injected options.
 * @returns {string} HTML.
 */
Index.html.start = function(ij) {
  return `
<div id="header">
  <img id="banner" src="index/title-beta.png" height=51 width=244 alt="Blockly Games">
  <div id="subtitle">${BlocklyGames.esc(BlocklyGames.Msg['Index.subTitle'])}&nbsp;
    <a href="about${ij.html ? '.html' : ''}?lang=${ij.lang}">${BlocklyGames.esc(BlocklyGames.Msg['Index.moreInfo'])}</a>
  </div>
</div>
<svg height="100%" width="100%" version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink">
  <g transform="translate(-150,-60)">
    <svg height="100%" width="100%" version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 100 100" preserveAspectRatio="none"
        x=150 y=60>
      <path id="path" d="M 10,15 C 15,60 35,100 50,70 S 80,20 90,85"
        ${ij.rtl ? 'transform="translate(100) scale(-1, 1)"' : ''}
      />
    </svg>
    ${Index.html.appLink_(ij, 'puzzle', 10, 15, BlocklyGames.Msg['Games.puzzle'])}
    ${Index.html.appLink_(ij, 'maze', 16, 45, BlocklyGames.Msg['Games.maze'])}
    ${Index.html.appLink_(ij, 'bird', 26, 69, BlocklyGames.Msg['Games.bird'])}
    ${Index.html.appLink_(ij, 'turtle', 41, 80, BlocklyGames.Msg['Games.turtle'])}
    ${Index.html.appLink_(ij, 'movie', 55, 61, BlocklyGames.Msg['Games.movie'])}
    ${Index.html.appLink_(ij, 'music', 69, 43, BlocklyGames.Msg['Games.music'])}
    ${Index.html.appLink_(ij, 'pond-tutor', 83, 55, BlocklyGames.Msg['Games.pondTutor'])}
    ${Index.html.appLink_(ij, 'pond-duck', 90, 85, BlocklyGames.Msg['Games.pond'])}
  </g>
</svg>
<select id="languageMenu"></select>
<p id="clearDataPara" style="visibility: hidden">
  ${BlocklyGames.esc(BlocklyGames.Msg['Index.startOver'])}
  <button class="secondary" id="clearData">${BlocklyGames.esc(BlocklyGames.Msg['Index.clearData'])}</button>
</p>
`;
};

/**
 * Create a link to an app.
 * @param {!Object} ij Injected options.
 * @param {string} app Name of application.
 * @param {number} x Horizontal position of link as percentage.
 * @param {number} y Vertical position of link as percentage.
 * @param {string} contentText Text content to place in link (unsafe text).
 * @returns {string} HTML.
 * @private
 */
Index.html.appLink_ = function(ij, app, x, y, contentText) {
  return `
<svg height=150 width=300 version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    x=${ij.rtl ? 100 - x : x}% y=${y}%>
  <path d="M 111.11,98.89 A 55 55 0 1 1 188.89,98.89" class="gaugeBack" id="back-${app}" />
  <g class="icon" id="icon-${app}">
    <circle cx=150 cy=60 r=50 class="iconBack" />
    <image xlink:href="index/${app}.png" height=100 width=100 x=100 y=10 />
    <a xlink:href="${app}${ij.html ? '.html' : ''}?lang=${ij.lang}">
      <circle cx=150 cy=60 r=50 class="iconBorder" />
      <path class="gaugeFront" id="gauge-${app}" />
      <text x=150 y=135>${BlocklyGames.esc(contentText)}</text>
    </a>
  </g>
</svg>
`;
};
