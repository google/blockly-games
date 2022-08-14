/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview HTML for shared Pond visualization.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Pond.html');

goog.require('BlocklyGames');
goog.require('BlocklyGames.Msg');

/**
 * Canvas, health bars, and buttons.
 * @return {string} HTML.
 */
Pond.html.visualization = function() {
  return `
<div id="visualization">
  <canvas id="scratch" width=400 height=400 style="display: none"></canvas>
  <canvas id="display" width=400 height=400></canvas>
</div>

<table id="avatarStatTable">
  <tbody>
    <tr id="avatarStatRow1"></tr>
    <tr id="avatarStatRow2"></tr>
  </tbody>
</table>

<table width=400>
  <tr>
    <td style="width: 190px; text-align: center; vertical-align: top;">
      <button id="docsButton" title="${BlocklyGames.esc(BlocklyGames.Msg['Pond.docsTooltip'])}">
        ${BlocklyGames.esc(BlocklyGames.Msg['Pond.documentation'])}
      </button>
    </td>
    <td>
      <button id="runButton" class="primary" title="${BlocklyGames.esc(BlocklyGames.Msg['Games.runTooltip'])}">
        <img src="common/1x1.gif" class="run icon21"> ${BlocklyGames.esc(BlocklyGames.Msg['Games.runProgram'])}
      </button>
      <button id="resetButton" class="primary" style="display: none" title="${BlocklyGames.esc(BlocklyGames.Msg['Games.resetTooltip'])}">
        <img src="common/1x1.gif" class="stop icon21"> ${BlocklyGames.esc(BlocklyGames.Msg['Games.resetProgram'])}
      </button>
    </td>
  </tr>
</table>

<div id="dialogDocs">
  <img src="common/1x1.gif" class="close icon21" id="closeDocs">
  <iframe id="frameDocs"></iframe>
</div>
`;
};
