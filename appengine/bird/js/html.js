/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview HTML for Bird game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Bird.html');

goog.require('BlocklyGames');
goog.require('BlocklyGames.html');
goog.require('BlocklyGames.Msg');


/**
 * Web page structure.
 * @param {!Object} ij Injected options.
 * @return {string} HTML.
 */
Bird.html.start = function(ij) {
  return `
${BlocklyGames.html.headerBar(ij, BlocklyGames.Msg['Games.bird'], '', true, false, '')}

<div id="visualization">
  <svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgBird" width="400px" height="400px">
  </svg>
</div>

<table width=400>
  <tr>
    <td style="width: 190px;">
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

${Bird.html.toolbox(ij.level)}
<div id="blockly"></div>

${BlocklyGames.html.dialog()}
${BlocklyGames.html.doneDialog()}
${BlocklyGames.html.abortDialog()}
${BlocklyGames.html.storageDialog()}

${Bird.html.helpDialogs()}
`;
};

/**
 * Toolboxes for each level.
 * @param {number} level Level 1-10.
 * @return {string} HTML.
 */
Bird.html.toolbox = function(level) {
  let xml = '<block type="bird_heading"></block>\n';
  if (level >= 2) {
    xml += `<block type="bird_noWorm" disabled="${level === 4 || level === 5}"></block>\n`;
  }
  if (level >= 4) {
    xml += `
<block type="bird_compare">
  <field name="OP">LT</field>
  <value name="A">
    <block type="bird_position" movable="false">
      <field name="XY">X</field>
    </block>
  </value>
  <value name="B">
    <block type="math_number" movable="false">
      <field name="NUM">50</field>
    </block>
  </value>
</block>
`;
  }
  if (level >= 5) {
    xml += `
<block type="bird_compare">
  <field name="OP">LT</field>
  <value name="A">
    <block type="bird_position" movable="false">
      <field name="XY">Y</field>
    </block>
  </value>
  <value name="B">
    <block type="math_number" movable="false">
      <field name="NUM">50</field>
    </block>
  </value>
</block>
`;
  }
  if (level >= 8) {
    xml += '<block type="bird_and"></block>\n';
  }
  return `<xml id="toolbox" xmlns="https://developers.google.com/blockly/xml">${xml}</xml>`;
};

/**
 * Help dialogs for each level.
 * @return {string} HTML.
 */
Bird.html.helpDialogs = function() {
    return `
<div id="dialogHelp1" class="dialogHiddenContent">
  <table><tr><td rowspan=2>
    <img src="common/help.png">
  </td><td>
    <div class="farSide"><img src="bird/help_heading.png" class="mirrorImg" height=27 width=141></div>
  </td></tr><tr><td>
    ${BlocklyGames.esc(BlocklyGames.Msg['Bird.helpHeading'])}
  </td></tr></table>
</div>
<div id="dialogHelp2" class="dialogHiddenContent">
  <table><tr><td>
    <img src="common/help.png">
  </td><td>
    ${BlocklyGames.esc(BlocklyGames.Msg['Bird.helpHasWorm'])}
  </td><td>
    <img src="bird/help_up.png">
  </td></tr></table>
</div>
<div id="dialogHelp4" class="dialogHiddenContent">
  <table><tr><td>
    <img src="common/help.png">
  </td><td>
    ${BlocklyGames.esc(BlocklyGames.Msg['Bird.helpX'])}
  </td><td>
    <img src="bird/help_up.png">
  </td></tr></table>
</div>
<div id="dialogHelp5" class="dialogHiddenContent">
  <table><tr><td>
    <img src="bird/help_up.png">
  </td><td>
    ${BlocklyGames.esc(BlocklyGames.Msg['Bird.helpElse'])}
  </td><td>
    <img src="common/help.png">
  </td></tr></table>
</div>
<div id="dialogHelp6" class="dialogHiddenContent">
  <table><tr><td>
    <img src="bird/help_up.png">
  </td><td>
    ${BlocklyGames.esc(BlocklyGames.Msg['Bird.helpElseIf'])}
  </td><td>
    <img src="common/help.png">
  </td></tr></table>
</div>
<div id="dialogHelp8" class="dialogHiddenContent">
  <table><tr><td>
    <img src="bird/help_up.png">
  </td><td>
    ${BlocklyGames.esc(BlocklyGames.Msg['Bird.helpAnd'])}
  </td><td>
    <img src="common/help.png">
  </td></tr></table>
</div>
<div id="dialogMutatorHelp" class="dialogHiddenContent">
  <table><tr><td>
    <img src="bird/help_mutator.png" class="mirrorImg" height=58 width=107>
  </td><td>
    ${BlocklyGames.esc(BlocklyGames.Msg['Bird.helpMutator'])}
  </td></tr></table>
</div>
`;
};
