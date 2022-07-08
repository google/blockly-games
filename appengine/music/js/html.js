/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview HTML for Music game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Music.html');

goog.require('BlocklyGames');
goog.require('BlocklyGames.html');
goog.require('BlocklyGames.Msg');

/**
 * Web page structure.
 * @param {!Object} ij Injected options.
 * @return {string} HTML.
 */
Music.html.start = function(ij) {
  return `
${BlocklyGames.html.headerBar(ij, BlocklyGames.Msg['Games.music'], '', true, true, '')}

<div id="paddingBox"></div>
<div id="staveBox"></div>
<div id="musicBox">
  <div id="musicContainer"></div>
</div>
<table style="padding-top: 1em;">
  <tr>
    <td style="width: 190px; text-align: center; vertical-align: top;">
      <svg
          id="slider"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:svg="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          version="1.1"
          width=150 height=50>
        <!-- Slow icon. -->
        <clipPath id="slowClipPath">
          <rect width=26 height=12 x=5 y=14 />
        </clipPath>
        <image xlink:href="common/icons.png" height=63 width=84 x=-21 y=-10
            clip-path="url(#slowClipPath)" />
        <!-- Fast icon. -->
        <clipPath id="fastClipPath">
          <rect width=26 height=16 x=120 y=10 />
        </clipPath>
        <image xlink:href="common/icons.png" height=63 width=84 x=120 y=-11
            clip-path="url(#fastClipPath)" />
      </svg>
    </td>
    <td style="width: 15px;">
      <img id="spinner" style="visibility: hidden;" src="common/loading.gif" height=15 width=15>
    </td>
    <td style="width: 190px; text-align: center">
      <button id="runButton" class="primary" title="${BlocklyGames.esc(BlocklyGames.Msg['Games.runTooltip'])}">
        <img src="common/1x1.gif" class="run icon21"> ${BlocklyGames.esc(BlocklyGames.Msg['Games.runProgram'])}
      </button>
      <button id="resetButton" class="primary" style="display: none" title="${BlocklyGames.esc(BlocklyGames.Msg['Games.resetTooltip'])}">
        <img src="common/1x1.gif" class="stop icon21"> ${BlocklyGames.esc(BlocklyGames.Msg['Games.resetProgram'])}
      </button>
    </td>
  </tr>
</table>

${(ij.level === 10 && !ij.html) ? Music.html.gallery(ij.lang) : ''}

${Music.html.toolbox(ij.level)}
<div id="blockly"></div>

${BlocklyGames.html.dialog()}
${BlocklyGames.html.doneDialog()}
${BlocklyGames.html.abortDialog()}
${BlocklyGames.html.storageDialog()}

${Music.html.helpDialogs(ij.level, ij.html)}
`;
};

/**
 * Gallery view button and submission form.
 * @param {string} lang ISO language code.
 * @return {string} HTML.
 */
Music.html.gallery = function(lang) {
  return `
<table style="padding-top: 1em; width: 400px;">
  <tr>
    <td style="text-align: center;">
      <form action="/gallery" target="music-gallery">
        <input type="hidden" name="app" value="music">
        <input type="hidden" name="lang" value="{$ij.lang}">
        <button type="submit" title="${BlocklyGames.esc(BlocklyGames.Msg['Music.galleryTooltip'])}">
          <img src="common/1x1.gif" class="gallery icon21"> ${BlocklyGames.esc(BlocklyGames.Msg['Music.galleryMsg'])}
        </button>
      </form>
    </td>
    <td style="text-align: center;">
      <button id="submitButton" title="${BlocklyGames.esc(BlocklyGames.Msg['Music.submitTooltip'])}">
        <img src="common/1x1.gif" class="camera icon21"> ${BlocklyGames.esc(BlocklyGames.Msg['Music.submitMsg'])}
      </button>
    </td>
  </tr>
</table>
<div id="galleryDialog" class="dialogHiddenContent">
    <form id="galleryForm" action="/gallery-api/submit" method="post" onsubmit="return false">
    <header>${BlocklyGames.esc(BlocklyGames.Msg['Music.submitTooltip'])}</header>
    <canvas id="thumbnail" width=200 height=200></canvas>
    <input type="hidden" name="app" value="music">
    <input id="galleryThumb" type="hidden" name="thumb">
    <input id="galleryXml" type="hidden" name="xml">
    <div>
      ${BlocklyGames.esc(BlocklyGames.Msg['Games.submitTitle'])}
      <input id="galleryTitle" type="text" name="title" required>
    </div>

    <div class="farSide">
      <button id="galleryCancel" type="button">${BlocklyGames.esc(Blockly.Msg['DIALOG_CANCEL'])}</button>
      <button id="galleryOk" class="secondary" type="submit">${BlocklyGames.esc(Blockly.Msg['DIALOG_OK'])}</button>
    </div>
  </form>
</div>
`;
};

/**
 * Toolboxes for each level.
 * @param {number} level Level 1-10.
 * @return {string} HTML.
 */
Music.html.toolbox = function(level) {
  let xml;
  if (level === 10) {
    xml = `
<category name="${BlocklyGames.esc(BlocklyGames.Msg['Games.music'])}">
  <block type="music_pitch">
    <field name="PITCH">7</field>
  </block>
  <block type="music_note">
    <field name="DURATION">0.25</field>
    <value name="PITCH">
      <shadow type="music_pitch">
        <field name="PITCH">7</field>
      </shadow>
    </value>
  </block>
  <block type="music_rest"></block>
  <block type="music_instrument"></block>
  <block type="music_start" id="music_start"></block>
</category>
<category name="${BlocklyGames.esc(BlocklyGames.Msg['Games.catLogic'])}">
  <block type="controls_if"></block>
  <block type="logic_compare"></block>
  <block type="logic_operation"></block>
  <block type="logic_negate"></block>
  <block type="logic_boolean"></block>
  <block type="logic_ternary"></block>
</category>
<category name="${BlocklyGames.esc(BlocklyGames.Msg['Games.catLoops'])}">
  <block type="controls_repeat_ext">
    <value name="TIMES">
      <shadow type="math_number">
        <field name="NUM">10</field>
      </shadow>
    </value>
  </block>
  <block type="controls_whileUntil"></block>
  <block type="controls_for">
    <value name="FROM">
      <shadow type="math_number">
        <field name="NUM">1</field>
      </shadow>
    </value>
    <value name="TO">
      <shadow type="math_number">
        <field name="NUM">10</field>
      </shadow>
    </value>
    <value name="BY">
      <shadow type="math_number">
        <field name="NUM">1</field>
      </shadow>
    </value>
  </block>
  <block type="controls_forEach"></block>
  <block type="controls_flow_statements"></block>
</category>
<category name="${BlocklyGames.esc(BlocklyGames.Msg['Games.catMath'])}">
  <block type="math_number"></block>
  <block type="math_arithmetic">
    <value name="A">
      <shadow type="math_number">
        <field name="NUM">1</field>
      </shadow>
    </value>
    <value name="B">
      <shadow type="math_number">
        <field name="NUM">1</field>
      </shadow>
    </value>
  </block>
  <block type="math_single">
    <value name="NUM">
      <shadow type="math_number">
        <field name="NUM">9</field>
      </shadow>
    </value>
  </block>
  <block type="math_number_property">
    <value name="NUMBER_TO_CHECK">
      <shadow type="math_number">
        <field name="NUM">0</field>
      </shadow>
    </value>
  </block>
  <block type="math_round">
    <value name="NUM">
      <shadow type="math_number">
        <field name="NUM">3.1</field>
      </shadow>
    </value>
  </block>
  <block type="math_modulo">
    <value name="DIVIDEND">
      <shadow type="math_number">
        <field name="NUM">64</field>
      </shadow>
    </value>
    <value name="DIVISOR">
      <shadow type="math_number">
        <field name="NUM">10</field>
      </shadow>
    </value>
  </block>
  <block type="math_constrain">
    <value name="VALUE">
      <shadow type="math_number">
        <field name="NUM">50</field>
      </shadow>
    </value>
    <value name="LOW">
      <shadow type="math_number">
        <field name="NUM">1</field>
      </shadow>
    </value>
    <value name="HIGH">
      <shadow type="math_number">
        <field name="NUM">100</field>
      </shadow>
    </value>
  </block>
  <block type="math_random_int">
    <value name="FROM">
      <shadow type="math_number">
        <field name="NUM">1</field>
      </shadow>
    </value>
    <value name="TO">
      <shadow type="math_number">
        <field name="NUM">100</field>
      </shadow>
    </value>
  </block>
  <block type="math_random_float"></block>
</category>
<category name="${BlocklyGames.esc(BlocklyGames.Msg['Games.catLists'])}">
  <block type="lists_create_with">
    <mutation items="0"></mutation>
  </block>
  <block type="lists_create_with"></block>
  <block type="lists_repeat">
    <value name="NUM">
      <shadow type="math_number">
        <field name="NUM">5</field>
      </shadow>
    </value>
  </block>
  <block type="lists_length"></block>
  <block type="lists_isEmpty"></block>
  <block type="lists_indexOf">
    <value name="VALUE">
      <block type="variables_get">
        <field name="VAR">list</field>
      </block>
    </value>
  </block>
  <block type="lists_getIndex">
    <value name="VALUE">
      <block type="variables_get">
        <field name="VAR">list</field>
      </block>
    </value>
  </block>
  <block type="lists_setIndex">
    <value name="LIST">
      <block type="variables_get">
        <field name="VAR">list</field>
      </block>
    </value>
  </block>
  <block type="lists_getSublist">
    <value name="LIST">
      <block type="variables_get">
        <field name="VAR">list</field>
      </block>
    </value>
  </block>
  <block type="lists_sort"></block>
  <block type="lists_reverse"></block>
</category>
<sep></sep>
<category name="${BlocklyGames.esc(BlocklyGames.Msg['Games.catVariables'])}" custom="VARIABLE"></category>
<category name="${BlocklyGames.esc(BlocklyGames.Msg['Games.catProcedures'])}" custom="PROCEDURE"></category>
`;
  } else {
    const restBlock = level > 6 ? '<block type="music_rest_whole"></block>' : '';
    const instrumentBlock = level > 5 ? '<block type="music_instrument"></block>' : '';
    const startBlock = level > 6 ? '<block type="music_start" id="music_start"></block>' : '';
    const procedureCat = level > 1 ? `<category name="${BlocklyGames.esc(BlocklyGames.Msg['Games.catProcedures'])}" custom="PROCEDURE"></category>` : '';
    xml = `
<category name="${BlocklyGames.esc(BlocklyGames.Msg['Games.music'])}">
  <block type="music_note">
    <field name="DURATION">0.25</field>
    <value name="PITCH">
      <shadow type="music_pitch">
        <field name="PITCH">7</field>
      </shadow>
    </value>
  </block>
  ${restBlock}
  ${instrumentBlock}
  ${startBlock}
</category>
${procedureCat}
`;
  }
  return `<xml id="toolbox" xmlns="https://developers.google.com/blockly/xml">${xml}</xml>`;
};

/**
 * Help dialogs for each level.
 * @param {number} level Level 1-10.
 * @param {boolean} isHtml True if served as raw HTML files.
 * @return {string} HTML.
 */
Music.html.helpDialogs = function(level, isHtml) {
  let content = '';
  switch (level) {
    case 1:
      content = BlocklyGames.esc(BlocklyGames.Msg['Music.helpText1']) +
          '<p>C4 - D4 - E4 - C4</p>';
      break;
    case 2:
      content = BlocklyGames.esc(BlocklyGames.Msg['Music.helpText2a']) +
          '<div id="sampleHelp2" class="readonly"></div>' +
          BlocklyGames.esc(BlocklyGames.Msg['Music.helpText2b']);
      break;
    case 3:
      content = BlocklyGames.esc(BlocklyGames.Msg['Music.helpText3']) +
          '<br><img src="music/note0.5.png" class="sampleNote">';
      break;
    case 4:
      content = BlocklyGames.esc(BlocklyGames.Msg['Music.helpText4']) +
          '<br><img src="music/note0.125.png" class="sampleNote">';
      break;
    case 5:
      content = BlocklyGames.esc(BlocklyGames.Msg['Music.helpText5']);
      break;
    case 6:
      content = BlocklyGames.esc(BlocklyGames.Msg['Music.helpText6a']) +
          '<div id="sampleHelp6" class="readonly"></div>' +
          BlocklyGames.esc(BlocklyGames.Msg['Music.helpText6b']);
      break;
    case 7:
      content = BlocklyGames.esc(BlocklyGames.Msg['Music.helpText7a']) +
          '<div id="sampleHelp7" class="readonly"></div>' +
          BlocklyGames.esc(BlocklyGames.Msg['Music.helpText7b']);
      break;
    case 8:
      content = BlocklyGames.esc(BlocklyGames.Msg['Music.helpText8']);
      break;
    case 9:
      content = BlocklyGames.esc(BlocklyGames.Msg['Music.helpText9']);
      break;
    case 10:
      content = BlocklyGames.esc(BlocklyGames.Msg['Music.helpText10']);
      if (!isHtml) {
        content += '<br><br>' +
            BlocklyGames.esc(BlocklyGames.Msg['Music.helpText10Reddit']);
      }
      break;
  }

  return `
<div id="helpUseFunctions" class="dialogHiddenContent">
  <div style="padding-bottom: 0.7ex">
    ${BlocklyGames.esc(BlocklyGames.Msg['Music.helpUseFunctions'])}
  </div>
  ${BlocklyGames.html.ok()}
</div>
<div id="helpUseInstruments" class="dialogHiddenContent">
  <div style="padding-bottom: 0.7ex">
    ${BlocklyGames.esc(BlocklyGames.Msg['Music.helpUseInstruments'])}
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
