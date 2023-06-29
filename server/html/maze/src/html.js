/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview HTML for Maze game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Maze.html');

goog.require('BlocklyGames');
goog.require('BlocklyGames.html');
goog.require('BlocklyInterface');


/**
 * Web page structure.
 * @param {!Object} ij Injected options.
 * @returns {string} HTML.
 */
Maze.html.start = function(ij) {
  return `
${BlocklyGames.html.headerBar(ij, BlocklyGames.getMsg('Games.maze', true),
    BlocklyInterface.nextLevelParam, true, false,
    '<button id="pegmanButton"><img src="common/1x1.gif"><span id="pegmanButtonArrow"></span></button>')}

<div id="visualization">
  <svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgMaze" width="400px" height="400px">
    <g id="look">
      <path d="M 0,-15 a 15 15 0 0 1 15 15" />
      <path d="M 0,-35 a 35 35 0 0 1 35 35" />
      <path d="M 0,-55 a 55 55 0 0 1 55 55" />
    </g>
  </svg>
  <div id="capacityBubble">
    <div id="capacity"></div>
  </div>
</div>

<table width=400>
  <tr>
    <td style="width: 190px; text-align: center; vertical-align: top;">
    <td>
      <button id="runButton" class="primary" title="${BlocklyGames.getMsg('Maze.runTooltip', true)}">
        <img src="common/1x1.gif" class="run icon21"> ${BlocklyGames.getMsg('Games.runProgram', true)}
      </button>
      <button id="resetButton" class="primary" style="display: none" title="${BlocklyGames.getMsg('Maze.resetTooltip', true)}">
        <img src="common/1x1.gif" class="stop icon21"> ${BlocklyGames.getMsg('Games.resetProgram', true)}
      </button>
    </td>
  </tr>
</table>

${Maze.html.toolbox_(ij.level)}
<div id="blockly"></div>

<div id="pegmanMenu"></div>

${BlocklyGames.html.dialog()}
${BlocklyGames.html.doneDialog()}
${BlocklyGames.html.abortDialog()}
${BlocklyGames.html.storageDialog()}

${Maze.html.helpDialogs_()}
`;
};

/**
 * Toolboxes for each level.
 * @param {number} level Level 1-10.
 * @returns {string} HTML.
 * @private
 */
Maze.html.toolbox_ = function(level) {
  let xml = `
<block type="maze_moveForward"></block>
<block type="maze_turn"><field name="DIR">turnLeft</field></block>
<block type="maze_turn"><field name="DIR">turnRight</field></block>
`;
  if (level > 2) {
    xml += '<block type="maze_forever"></block>\n';
    if (level === 6) {
      xml += '<block type="maze_if"><field name="DIR">isPathLeft</field></block>\n';
    } else if (level > 6) {
      xml += '<block type="maze_if"></block>\n';
      if (level > 8) {
        xml += '<block type="maze_ifElse"></block>\n';
      }
    }
  }
  return `<xml id="toolbox" xmlns="https://developers.google.com/blockly/xml">${xml}</xml>`;
};

/**
 * Help dialogs for each level.
 * @returns {string} HTML.
 * @private
 */
 Maze.html.helpDialogs_ = function() {
   return `
<div id="dialogHelpStack" class="dialogHiddenContent">
  <table><tr><td>
    <img src="common/help.png">
  </td><td>&nbsp;</td><td>
    ${BlocklyGames.getMsg('Maze.helpStack', true)}
  </td><td valign="top">
    <img src="maze/help_stack.png" class="mirrorImg" height=63 width=136>
  </td></tr></table>
</div>
<div id="dialogHelpOneTopBlock" class="dialogHiddenContent">
  <table><tr><td>
    <img src="common/help.png">
  </td><td>&nbsp;</td><td>
    ${BlocklyGames.getMsg('Maze.helpOneTopBlock', true)}
    <div id="sampleOneTopBlock" class="readonly"></div>
  </td></tr></table>
</div>
<div id="dialogHelpRun" class="dialogHiddenContent">
  <table><tr><td>
    ${BlocklyGames.getMsg('Maze.helpRun', true)}
  </td><td rowspan=2>
    <img src="common/help.png">
  </td></tr><tr><td>
    <div><img src="maze/help_run.png" class="mirrorImg" height=27 width=141></div>
  </td></tr></table>
</div>
<div id="dialogHelpReset" class="dialogHiddenContent">
  <table><tr><td>
    ${BlocklyGames.getMsg('Maze.helpReset', true)}
  </td><td rowspan=2>
    <img src="common/help.png">
  </td></tr><tr><td>
    <div><img src="maze/help_run.png" class="mirrorImg" height=27 width=141></div>
  </td></tr></table>
</div>
<div id="dialogHelpRepeat" class="dialogHiddenContent">
  <table><tr><td>
    <img src="maze/help_up.png">
  </td><td>
    ${BlocklyGames.getMsg('Maze.helpRepeat', true)}
  </td><td>
    <img src="common/help.png">
  </td></tr></table>
</div>
<div id="dialogHelpCapacity" class="dialogHiddenContent">
  <table><tr><td>
    <img src="common/help.png">
  </td><td>&nbsp;</td><td>
    ${BlocklyGames.getMsg('Maze.helpCapacity', true)}
  </td></tr></table>
</div>
<div id="dialogHelpRepeatMany" class="dialogHiddenContent">
  <table><tr><td>
    <img src="maze/help_up.png">
  </td><td>
    ${BlocklyGames.getMsg('Maze.helpRepeatMany', true)}
  </td><td>
    <img src="common/help.png">
  </td></tr></table>
</div>
<div id="dialogHelpSkins" class="dialogHiddenContent">
  <table><tr><td>
    <img src="common/help.png">
  </td><td width="95%">
    ${BlocklyGames.getMsg('Maze.helpSkins', true)}
  </td><td>
    <img src="maze/help_up.png">
  </td></tr></table>
</div>
<div id="dialogHelpIf" class="dialogHiddenContent">
  <table><tr><td>
    <img src="maze/help_up.png">
  </td><td>
    ${BlocklyGames.getMsg('Maze.helpIf', true)}
  </td><td>
    <img src="common/help.png">
  </td></tr></table>
</div>
<div id="dialogHelpMenu" class="dialogHiddenContent">
  <table><tr><td>
    <img src="maze/help_up.png">
  </td><td id="helpMenuText">
    ${BlocklyGames.getMsg('Maze.helpMenu', true)}
  </td><td>
    <img src="common/help.png">
  </td></tr></table>
</div>
<div id="dialogHelpIfElse" class="dialogHiddenContent">
  <table><tr><td>
    <img src="maze/help_down.png">
  </td><td>
    ${BlocklyGames.getMsg('Maze.helpIfElse', true)}
  </td><td>
    <img src="common/help.png">
  </td></tr></table>
</div>
<div id="dialogHelpWallFollow" class="dialogHiddenContent">
  <table><tr><td>
    <img src="common/help.png">
  </td><td>&nbsp;</td><td>
    ${BlocklyGames.getMsg('Maze.helpWallFollow', true)}
    ${BlocklyGames.html.ok()}
  </td></tr></table>
</div>
`;
};