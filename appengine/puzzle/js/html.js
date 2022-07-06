/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview HTML for Puzzle game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Puzzle.html');

goog.require('BlocklyGames.html');
goog.require('BlocklyGames.Msg');


 /**
  * Web page structure.
  * @param {!Object} ij Injected options.
  */
Puzzle.html.start = function(ij) {
  return `
${BlocklyGames.html.headerBar(ij, BlocklyGames.Msg['Games.puzzle'], '', false, true,
    `<button id="checkButton" class="primary">${BlocklyGames.Msg['Puzzle.checkAnswers']}</button>`)}

<div id="blockly"></div>

${BlocklyGames.html.dialog()}
<div id="help" class="dialogHiddenContent">
  <div style="padding-bottom: 0.7ex">${BlocklyGames.Msg['Puzzle.helpText']}</div>
  <div id="sample" class="readonly"></div>
  ${BlocklyGames.html.ok()}
</div>
<div id="answers" class="dialogHiddenContent">
  <div id="answerMessage">
  </div>
  <div id="graph"><div id="graphValue"></div></div>
  ${BlocklyGames.html.ok()}
</div>
  `;
};
