/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview HTML for Puzzle game.
 * @author fraser@google.com (Neil Fraser)
 */
import {headerBar, dialog, ok} from '../../src/html.js';

import {getMsg} from '../../src/lib-games.js';


/**
 * Web page structure.
 * @param {!Object} ij Injected options.
 */
export function start(ij: any) {
  return `
${headerBar(ij, getMsg('Games.puzzle', true), '', false, true,
    `<button id="checkButton" class="primary">${getMsg('Puzzle.checkAnswers', true)}</button>`)}

<div id="blockly"></div>

${dialog()}
<div id="help" class="dialogHiddenContent">
  <div style="padding-bottom: 0.7ex">${getMsg('Puzzle.helpText', true)}</div>
  <div id="sample" class="readonly"></div>
  ${ok()}
</div>
<div id="answers" class="dialogHiddenContent">
  <div id="answerMessage">
  </div>
  <div id="graph"><div id="graphValue"></div></div>
  ${ok()}
</div>
`;
};
