/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview HTML for Pond tutor.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Pond.Tutor.html');

goog.require('BlocklyGames');
goog.require('BlocklyGames.html');
goog.require('Pond.html');


/**
 * Web page structure.
 * @param {!Object} ij Injected options.
 * @returns {string} HTML.
 */
Pond.Tutor.html.start = function(ij) {
  return `
${BlocklyGames.html.headerBar(ij, BlocklyGames.getMsg('Games.pondTutor', true), '', true, true, '')}

${Pond.html.visualization()}

${Pond.Tutor.html.toolbox_(ij.level)}
<div id="${ij.level % 2 ? 'blockly' : 'editor'}"></div>

${Pond.Tutor.html.playerTarget_()}
${Pond.Tutor.html.playerPendulum_()}
${Pond.Tutor.html.playerScared_()}

${BlocklyGames.html.dialog()}
${BlocklyGames.html.doneDialog()}
${BlocklyGames.html.storageDialog()}

${Pond.Tutor.html.helpDialogs_(ij.level)}
`;
};

/**
 * Toolbox.
 * @param {number} level Level 1-10.
 * @returns {string} HTML.
 * @private
 */
Pond.Tutor.html.toolbox_ = function(level) {
  let xml;
  const scanBlock = level >= 5 ? `
  <block type="pond_scan">
    <value name="DEGREE">
      <shadow type="pond_math_number">
        <mutation angle_field="true"></mutation>
        <field name="NUM">0</field>
      </shadow>
    </value>
  </block>
` : '';
  const swimBlock = level >= 7 ? `
  <block type="pond_swim">
    <value name="DEGREE">
      <shadow type="pond_math_number">
        <mutation angle_field="true"></mutation>
        <field name="NUM">0</field>
      </shadow>
    </value>
  </block>
` : '';
  const stopBlock = level >= 9 ? '<block type="pond_stop"></block>' : '';
  const getXYBlocks = level >= 9 ? '<block type="pond_getX"></block><block type="pond_getY"></block>' : '';
  xml = `
<category name="${BlocklyGames.getMsg('Games.pond', true)}">
  <block type="pond_cannon">
    <value name="DEGREE">
      <shadow type="pond_math_number">
        <mutation angle_field="true"></mutation>
        <field name="NUM">0</field>
      </shadow>
    </value>
    <value name="RANGE">
      <shadow type="pond_math_number">
        <mutation angle_field="false"></mutation>
        <field name="NUM">70</field>
      </shadow>
    </value>
  </block>
  ${scanBlock}
  ${swimBlock}
  ${stopBlock}
  ${getXYBlocks}
</category>
`;
  if (level >= 3) {
    const ifBlock = level >= 9 ? '<block type="controls_if"></block>' : '';
    const compareBlock = level >= 9 ? '<block type="logic_compare"></block>' : '';
    xml += `
<category name="${BlocklyGames.getMsg('Games.catLogic', true)}">
  ${ifBlock}
  ${compareBlock}
  <block type="logic_boolean"></block>
</category>
<category name="${BlocklyGames.getMsg('Games.catLoops', true)}">
  <block type="controls_whileUntil"></block>
</category>
`;
  }
  xml += `
<category name="${BlocklyGames.getMsg('Games.catMath', true)}">
  <block type="pond_math_number">
    <mutation angle_field="false"></mutation>
  </block>
</category>
`;
  return `<xml id="toolbox" xmlns="https://developers.google.com/blockly/xml">${xml}</xml>`;
};

/**
 * Help dialogs for each level.
 * @param {number} level Level 1-10.
 * @returns {string} HTML.
 * @private
 */
Pond.Tutor.html.helpDialogs_ = function(level) {
  let content = '';
  switch (level) {
    case 1:
      content = `
${BlocklyGames.getMsg('Pond.helpText1', true)}
<br><br>
<svg height=41 width=250 class="geras-renderer classic-theme">
  <g>
    <path transform="translate(1,1)" fill="#7a4984" d="m 0,8 A 8,8 0 0,1 8,0 H 15 l 6,4 3,0 6,-4 H 40 H 222.36 v 36 H 29.5 l -6,4 -3,0 -6,-4 H 8 a 8,8 0 0,1 -8,-8 z M 125.01,5 h -36.02 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 7 h 36.02 z M 193.4,5 h -38.31 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 7 h 38.31 z"></path>
    <path fill="#995ba5" d="m 0,8 A 8,8 0 0,1 8,0 H 15 l 6,4 3,0 6,-4 H 40 H 222.36 v 36 H 29.5 l -6,4 -3,0 -6,-4 H 8 a 8,8 0 0,1 -8,-8 z M 125.01,5 h -36.02 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 7 h 36.02 z M 193.4,5 h -38.31 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 7 h 38.31 z"></path>
    <path class="blocklyPathLight" stroke="#b88cc0" d="m 0.5,7.5 A 7.5,7.5 0 0,1 8,0.5 H 15 l 6,4 3,0 6,-4 H 39.5 M 39.5,0.5 H 221.86 M 2.69,33.3 A 7.5,7.5 0 0,1 0.5,28 V 8 M 125.51,5.5 v 27 h -36.02 M 83.89,24.3 l 3.68,-2.1 M 193.9,5.5 v 27 h -38.31 M 149.99,24.3 l 3.68,-2.1"></path>
    <g transform="translate(89.99,6)">
      <path transform="translate(1,1)" fill="#bdc2db" d="m 0,0 H 34.02 v 25 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z"></path>
      <path fill="#bdc2db" d="m 0,0 H 34.02 v 25 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z"></path>
      <path class="blocklyPathLight" stroke="#8c95c0" style="display: none;" d="m 0.5,0.5 H 33.52 M 33.52,0.5 M 0.5,24.5 V 18.5 m -7.36,-0.5 q -1.52,-5.5 0,-11 m 7.36,1 V 0.5 H 1"></path>
      <g class="blocklyEditableText" transform="translate(10,5)" style="cursor: text;">
        <rect rx="4" ry="4" x="-5" y="0" height="16" width="24.02"></rect>
        <text class="blocklyText" y="12.5">0
        <tspan>°</tspan></text>
      </g>
    </g>
    <g transform="translate(156.09,6)">
      <path transform="translate(1,1)" fill="#bdc2db" d="m 0,0 H 36.31 v 25 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z"></path>
      <path fill="#bdc2db" d="m 0,0 H 36.31 v 25 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z"></path>
      <path class="blocklyPathLight" stroke="#8c95c0" style="display: none;" d="m 0.5,0.5 H 35.81 M 35.81,0.5 M 0.5,24.5 V 18.5 m -7.36,-0.5 q -1.52,-5.5 0,-11 m 7.36,1 V 0.5 H 1"></path>
      <g class="blocklyEditableText" transform="translate(10,5)" style="cursor: text;">
        <rect rx="4" ry="4" x="-5" y="0" height="16" width="26.31"></rect>
        <text class="blocklyText" y="12.5">70</text>
      </g>
    </g>
    <text class="blocklyText" y="12.5" transform="translate(10,10)">cannon</text>
    <text class="blocklyText" y="12.5" transform="translate(68.11,10)">(</text>
    <text class="blocklyText" y="12.5" transform="translate(135.01,10)">,</text>
    <text class="blocklyText" y="12.5" transform="translate(203.4,10)">);</text>
  </g>
</svg>
`;
      break;
    case 2:
      content = `
${BlocklyGames.getMsg('Pond.helpText1', true)}
<pre>cannon(0, 70);</pre>
`;
      break;
    case 3:
      content = `
${BlocklyGames.getMsg('Pond.helpText2', true)}
<br><br>
<svg height=92 width=250 class="geras-renderer classic-theme">
  <g>
    <path transform="translate(1,1)" fill="#498449" d="m 0,8 A 8,8 0 0,1 8,0 H 15 l 6,4 3,0 6,-4 H 50 H 162.94 v 36 H 50 l -6,4 -3,0 -6,-4 h -7 a 8,8 0 0,0 -8,8 v 9 a 8,8 0 0,0 8,8 H 50 H 50 v 25 H 29.5 l -6,4 -3,0 -6,-4 H 8 a 8,8 0 0,1 -8,-8 z M 129.08,5 h -60.71 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 7 h 60.71 z"></path>
    <path fill="#5ba55b" d="m 0,8 A 8,8 0 0,1 8,0 H 15 l 6,4 3,0 6,-4 H 50 H 162.94 v 36 H 50 l -6,4 -3,0 -6,-4 h -7 a 8,8 0 0,0 -8,8 v 9 a 8,8 0 0,0 8,8 H 50 H 50 v 25 H 29.5 l -6,4 -3,0 -6,-4 H 8 a 8,8 0 0,1 -8,-8 z M 129.08,5 h -60.71 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 7 h 60.71 z"></path>
    <path class="blocklyPathLight" stroke="#8cc08c" d="m 0.5,7.5 A 7.5,7.5 0 0,1 8,0.5 H 15 l 6,4 3,0 6,-4 H 49.5 M 49.5,0.5 H 162.44 M 49.5,36.5 M 21.98,59.01 a 8.5,8.5 0 0,0 6.01,2.48 H 49.5 M 49.5,61.5 H 49.5 M 2.69,83.3 A 7.5,7.5 0 0,1 0.5,78 V 8 M 129.58,5.5 v 27 h -60.71 M 63.27,24.3 l 3.68,-2.1"></path>
    <text class="blocklyText" y="12.5" transform="translate(10,10)">while&#160;(</text>
    <text class="blocklyText" y="12.5" transform="translate(139.08,10)">)&#160;{</text>
    <text class="blocklyText" y="12.5" transform="translate(10,66)">}</text>
    <g transform="translate(69.37,6)">
      <path transform="translate(1,1)" fill="#496684" d="m 0,0 H 58.71 v 25 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z"></path>
      <path fill="#5b80a5" d="m 0,0 H 58.71 v 25 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z"></path>
      <path class="blocklyPathLight" stroke="#8ca6c0" d="m 0.5,0.5 H 58.21 M 58.21,0.5 M 0.5,24.5 V 18.5 m -7.36,-0.5 q -1.52,-5.5 0,-11 m 7.36,1 V 0.5 H 1"></path>
      <g class="blocklyEditableText" transform="translate(10,5)" style="cursor: default;">
        <rect rx="4" ry="4" x="-5" y="0" height="16" width="48.71"></rect>
        <text class="blocklyText" y="12.5" text-anchor="start" x="0">true
        <tspan style="fill: rgb(91, 128, 165);"> ▾</tspan></text>
      </g>
    </g>
  </g>
</svg>
`;
      break;
    case 4:
      content = `
${BlocklyGames.getMsg('Pond.helpText2', true)}
<pre>while (true) {
&nbsp;&nbsp;...
}</pre>
`;
      break;
    case 5:
      content = `
${BlocklyGames.getMsg('Pond.helpText3a', true)}
<br><br>
<svg height=37 width=250 class="geras-renderer classic-theme">
  <g transform="translate(8,0)">
    <path transform="translate(1,1)" fill="#7a4984" d="m 0,0 H 20 H 132.76 v 36 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z M 107.88,5 h -36.02 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 7 h 36.02 z"></path>
    <path fill="#995ba5" d="m 0,0 H 20 H 132.76 v 36 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z M 107.88,5 h -36.02 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 7 h 36.02 z"></path>
    <path class="blocklyPathLight" stroke="#b88cc0" d="m 0.5,0.5 H 19.5 M 19.5,0.5 H 132.26 M 0.5,35.5 V 18.5 m -7.36,-0.5 q -1.52,-5.5 0,-11 m 7.36,1 V 0.5 H 1 M 108.38,5.5 v 27 h -36.02 M 66.76,24.3 l 3.68,-2.1"></path>
    <g transform="translate(72.86,6)">
      <path transform="translate(1,1)" fill="#bdc2db" d="m 0,0 H 34.02 v 25 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z"></path>
      <path fill="#bdc2db" d="m 0,0 H 34.02 v 25 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z"></path>
      <path class="blocklyPathLight" stroke="#8c95c0" style="display: none;" d="m 0.5,0.5 H 33.52 M 33.52,0.5 M 0.5,24.5 V 18.5 m -7.36,-0.5 q -1.52,-5.5 0,-11 m 7.36,1 V 0.5 H 1"></path>
      <g class="blocklyEditableText" transform="translate(10,5)" style="cursor: text;">
        <rect rx="4" ry="4" x="-5" y="0" height="16" width="24.02"></rect>
        <text class="blocklyText" y="12.5">0
        <tspan>°</tspan></text>
      </g>
    </g>
    <text class="blocklyText" y="12.5" transform="translate(10,10)">scan</text>
    <text class="blocklyText" y="12.5" transform="translate(50.97,10)">(</text>
    <text class="blocklyText" y="12.5" transform="translate(117.88,10)">)</text>
  </g>
</svg>
<br><br>
${BlocklyGames.getMsg('Pond.helpText3b', true)}
`;
      break;
    case 6:
      content = `
${BlocklyGames.getMsg('Pond.helpText3a', true)}
<pre>scan(0)</pre>
${BlocklyGames.getMsg('Pond.helpText3b', true)}
`;
      break;
    case 7:
      content = `
${BlocklyGames.getMsg('Pond.helpText4', true)}
<br><br>
<svg height=41 width=250 class="geras-renderer classic-theme">
  <g>
    <path transform="translate(1,1)" fill="#7a4984" d="m 0,8 A 8,8 0 0,1 8,0 H 15 l 6,4 3,0 6,-4 H 40 H 139.25 v 36 H 29.5 l -6,4 -3,0 -6,-4 H 8 a 8,8 0 0,1 -8,-8 z M 110.3,5 h -36.02 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 7 h 36.02 z"></path>
    <path fill="#995ba5" d="m 0,8 A 8,8 0 0,1 8,0 H 15 l 6,4 3,0 6,-4 H 40 H 139.25 v 36 H 29.5 l -6,4 -3,0 -6,-4 H 8 a 8,8 0 0,1 -8,-8 z M 110.3,5 h -36.02 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 7 h 36.02 z"></path>
    <path class="blocklyPathLight" stroke="#b88cc0" d="m 0.5,7.5 A 7.5,7.5 0 0,1 8,0.5 H 15 l 6,4 3,0 6,-4 H 39.5 M 39.5,0.5 H 138.75 M 2.69,33.3 A 7.5,7.5 0 0,1 0.5,28 V 8 M 110.8,5.5 v 27 h -36.02 M 69.18,24.3 l 3.68,-2.1"></path>
    <g transform="translate(75.28,6)">
      <path transform="translate(1,1)" fill="#bdc2db" d="m 0,0 H 34.02 v 25 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z"></path>
      <path fill="#bdc2db" d="m 0,0 H 34.02 v 25 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z"></path>
      <path class="blocklyPathLight" stroke="#8c95c0" style="display: none;" d="m 0.5,0.5 H 33.52 M 33.52,0.5 M 0.5,24.5 V 18.5 m -7.36,-0.5 q -1.52,-5.5 0,-11 m 7.36,1 V 0.5 H 1"></path>
      <g class="blocklyEditableText" transform="translate(10,5)" style="cursor: text;">
        <rect rx="4" ry="4" x="-5" y="0" height="16" width="24.02"></rect>
        <text class="blocklyText" y="12.5">0
        <tspan>°</tspan></text>
      </g>
    </g>
    <text class="blocklyText" y="12.5" transform="translate(10,10)">swim</text>
    <text class="blocklyText" y="12.5" transform="translate(53.39,10)">(</text>
    <text class="blocklyText" y="12.5" transform="translate(120.3,10)">);</text>
  </g>
</svg>
`;
      break;
    case 8:
      content = `
${BlocklyGames.getMsg('Pond.helpText4', true)}
<pre>swim(0);</pre>
`;
      break;
    case 9:
      content = `
${BlocklyGames.getMsg('Pond.helpText5', true)}
<br><br>
<svg height=37 width=250 class="geras-renderer classic-theme">
  <g transform="translate(8,0)">
    <path transform="translate(1,1)" fill="#496684" d="m 0,0 H 20 H 194.25 v 36 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z M 97.93,5 h -81.93 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 6 h 81.93 z M 184.25,5 h -38.31 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 7 h 38.31 z"></path>
    <path fill="#5b80a5" d="m 0,0 H 20 H 194.25 v 36 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z M 97.93,5 h -81.93 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 6 h 81.93 z M 184.25,5 h -38.31 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 7 h 38.31 z"></path>
    <path class="blocklyPathLight" stroke="#8ca6c0" d="m 0.5,0.5 H 19.5 M 19.5,0.5 H 193.75 M 0.5,35.5 V 18.5 m -7.36,-0.5 q -1.52,-5.5 0,-11 m 7.36,1 V 0.5 H 1 M 98.43,5.5 v 26 h -81.93 M 10.9,24.3 l 3.68,-2.1 M 184.75,5.5 v 27 h -38.31 M 140.83,24.3 l 3.68,-2.1"></path>
    <g class="blocklyEditableText" transform="translate(107.93,10)" style="cursor: default;">
      <rect rx="4" ry="4" x="-5" y="0" height="16" width="32.0"></rect>
      <text class="blocklyText" y="12.5" text-anchor="start" x="0">&lt;
      <tspan style="fill: rgb(91, 128, 165);"> ▾</tspan></text>
    </g>
    <g transform="translate(146.93,6)">
      <path transform="translate(1,1)" fill="#495284" d="m 0,0 H 36.31 v 25 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z"></path>
      <path fill="#5b67a5" d="m 0,0 H 36.31 v 25 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z"></path>
      <path class="blocklyPathLight" stroke="#8c95c0" d="m 0.5,0.5 H 35.81 M 35.81,0.5 M 0.5,24.5 V 18.5 m -7.36,-0.5 q -1.52,-5.5 0,-11 m 7.36,1 V 0.5 H 1"></path>
      <g class="blocklyEditableText" transform="translate(10,5)" style="cursor: text;">
        <rect rx="4" ry="4" x="-5" y="0" height="16" width="26.31"></rect>
        <text class="blocklyText" y="12.5">50</text>
      </g>
    </g>
    <g transform="translate(17,6)">
      <path transform="translate(1,1)" fill="#7a4984" d="m 0,0 H 79.93 v 24 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z"></path>
      <path fill="#995ba5" d="m 0,0 H 79.93 v 24 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z"></path>
      <path class="blocklyPathLight" stroke="#b88cc0" d="m 0.5,0.5 H 79.43 M 79.43,0.5 M 0.5,23.5 V 18.5 m -7.36,-0.5 q -1.52,-5.5 0,-11 m 7.36,1 V 0.5 H 1"></path>
      <text class="blocklyText" y="12.5" transform="translate(10,5)">getX</text>
      <text class="blocklyText" y="12.5" transform="translate(50.16,5)">(</text>
      <text class="blocklyText" y="12.5" transform="translate(65.05,5)">)</text>
    </g>
  </g>
</svg>
<br><br>
<svg height=31 width=250 class="geras-renderer classic-theme">
  <g>
    <path transform="translate(1,1)" fill="#7a4984" d="m 0,8 A 8,8 0 0,1 8,0 H 15 l 6,4 3,0 6,-4 H 81.56 v 24 H 29.5 l -6,4 -3,0 -6,-4 H 8 a 8,8 0 0,1 -8,-8 z"></path>
    <path fill="#995ba5" d="m 0,8 A 8,8 0 0,1 8,0 H 15 l 6,4 3,0 6,-4 H 81.56 v 24 H 29.5 l -6,4 -3,0 -6,-4 H 8 a 8,8 0 0,1 -8,-8 z"></path>
    <path class="blocklyPathLight" stroke="#b88cc0" d="m 0.5,7.5 A 7.5,7.5 0 0,1 8,0.5 H 15 l 6,4 3,0 6,-4 H 81.06 M 81.06,0.5 M 2.69,21.3 A 7.5,7.5 0 0,1 0.5,16 V 8"></path>
    <text class="blocklyText" y="12.5" transform="translate(10,5)">stop</text>
    <text class="blocklyText" y="12.5" transform="translate(47.71,5)">(</text>
    <text class="blocklyText" y="12.5" transform="translate(62.6,5)">);</text>
  </g>
</svg>
`;
      break;
    case 10:
      content = `
${BlocklyGames.getMsg('Pond.helpText6', true)}
<pre>getX() &lt; 50</pre>
<pre>stop();</pre>
`;
      break;
  }
  return `
<!-- Help dialog for idiotic level 5+6 solution. -->
<div id="helpUseScan" class="dialogHiddenContent">
  <div style="padding-bottom: 0.7ex">
    ${BlocklyGames.getMsg('Pond.helpUseScan', true)}
  </div>
  ${BlocklyGames.html.ok()}
</div>
<div id="help" class="dialogHiddenContent">
  <div style="padding-bottom: 0.7ex">
  ${content}
  </div>
  ${BlocklyGames.html.ok()}
</div>
`;
};

/**
 * Target.
 * @returns {string} HTML.
 * @private
 */
Pond.Tutor.html.playerTarget_ = function() {
  return `
<div id="playerTarget" style="display: none">
</div>
`;
};

/**
 * Pendulum.
 * @returns {string} HTML.
 * @private
 */
Pond.Tutor.html.playerPendulum_ = function() {
  return `
<div id="playerPendulum" style="display: none">
/* Slowly moves east and west.  Does not fire. */
var west = false;
while (true) {
  if (west) {
    if (getX() > 25) {
      swim(180, 25);
    } else {
      west = false;
      swim(0, 0);
    }
  } else {
    if (getX() < 75) {
      swim(0, 25);
    } else {
      west = true;
      swim(0, 0);
    }
  }
}
</div>
`;
};

/**
 * Scared.
 * @returns {string} HTML.
 * @private
 */
Pond.Tutor.html.playerScared_ = function() {
  return `
<div id="playerScared" style="display: none">
/* Moves south-west when hit.  Does not fire. */
var d = damage();
while (true) {
  if (d != damage()) {
    swim(45, 100);
    var t = 0;
    for (var t = 0; t < 100; t++) {}
    d = damage();
    stop();
  }
}
</div>
`;
};
