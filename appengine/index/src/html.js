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


/**
 * Web page structure.
 * @param {!Object} ij Injected options.
 * @returns {string} HTML.
 */
Index.html.start = function(ij) {
  return `
<div id="header">
  <img id="banner" src="index/title.svg" height=40 width=244 alt="Blockly Games">
  <div id="subtitle">${BlocklyGames.getMsg('Index.subTitle', true)}&nbsp;
    <a href="about${ij.html ? '.html' : ''}?lang=${ij.lang}">${BlocklyGames.getMsg('Index.moreInfo', true)}</a>
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
    ${Index.html.appLink_(ij, 'puzzle', 10, 15, 'Games.puzzle')}
    ${Index.html.appLink_(ij, 'maze', 16, 45, 'Games.maze')}
    ${Index.html.appLink_(ij, 'bird', 26, 69, 'Games.bird')}
    ${Index.html.appLink_(ij, 'turtle', 41, 80, 'Games.turtle')}
    ${Index.html.appLink_(ij, 'movie', 55, 61, 'Games.movie')}
    ${Index.html.appLink_(ij, 'music', 69, 43, 'Games.music')}
    ${Index.html.appLink_(ij, 'pond-tutor', 83, 55, 'Games.pondTutor')}
    ${Index.html.appLink_(ij, 'pond-duck', 90, 85, 'Games.pond')}
  </g>
</svg>
<select id="languageMenu"></select>
<p id="clearDataPara" style="visibility: hidden">
  ${BlocklyGames.getMsg('Index.startOver', true)}
  <button class="secondary" id="clearData">${BlocklyGames.getMsg('Index.clearData', true)}</button>
</p>
`;
};

/**
 * Create a link to an app.
 * @param {!Object} ij Injected options.
 * @param {string} app Name of application.
 * @param {number} x Horizontal position of link as percentage.
 * @param {number} y Vertical position of link as percentage.
 * @param {string} msgName Name of text content to place in link.
 * @returns {string} HTML.
 * @private
 */
Index.html.appLink_ = function(ij, app, x, y, msgName) {
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
      <text x=150 y=135>${BlocklyGames.getMsg(msgName, true)}</text>
    </a>
  </g>
</svg>
`;
};
