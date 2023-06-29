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

goog.require('BlocklyGames');
goog.require('BlocklyGames.html');


/**
 * Web page structure.
 * @param {!Object} ij Injected options.
 */
Puzzle.html.start = function(ij) {
  return `
${BlocklyGames.html.headerBar(ij, BlocklyGames.getMsg('Games.puzzle', true), '', false, true,
    `<button id="checkButton" class="primary">${BlocklyGames.getMsg('Puzzle.checkAnswers', true)}</button>`)}

<div id="blockly"></div>

${BlocklyGames.html.dialog()}
<div id="help" class="dialogHiddenContent">
  <div style="padding-bottom: 0.7ex">${BlocklyGames.getMsg('Puzzle.helpText', true)}</div>
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
