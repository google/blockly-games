/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview HTML for Turtle game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Turtle.html');

goog.require('BlocklyGames');
goog.require('BlocklyGames.html');
goog.require('BlocklyGames.Msg');

/**
 * Web page structure.
 * @param {!Object} ij Injected options.
 * @return {string} HTML.
 */
Turtle.html.start = function(ij) {
  return `
${BlocklyGames.html.headerBar(ij, BlocklyGames.Msg['Games.turtle'], '', true, true, '')}

<div id="visualization">
  <canvas id="scratch" width=400 height=400 style="display: none"></canvas>
  <canvas id="answer" width=400 height=400 style="display: none"></canvas>
  <canvas id="display" width=400 height=400></canvas>
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
          width=150
          height=50>
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

${(ij.level === 10 && !ij.html) ? Turtle.html.gallery(ij.lang) : ''}

${Turtle.html.toolbox(ij.level)}
<div id="blockly"></div>

${BlocklyGames.html.dialog()}
${BlocklyGames.html.doneDialog()}
${BlocklyGames.html.abortDialog()}
${BlocklyGames.html.storageDialog()}

${Turtle.html.helpDialogs(ij.level, ij.html)}
`;
};

/**
 * Gallery view button and submission form.
 * @param {string} lang ISO language code.
 * @return {string} HTML.
 */
Turtle.html.gallery = function(lang) {
  return `
<table style="padding-top: 1em; width: 400px;">
  <tr>
    <td style="text-align: center;">
      <form action="/gallery" target="turtle-gallery">
        <input type="hidden" name="app" value="turtle">
        <input type="hidden" name="lang" value="${lang}">
        <button type="submit" title="${BlocklyGames.esc(BlocklyGames.Msg['Turtle.galleryTooltip'])}">
          <img src="common/1x1.gif" class="gallery icon21"> ${BlocklyGames.esc(BlocklyGames.Msg['Turtle.galleryMsg'])}
        </button>
      </form>
    </td>
    <td style="text-align: center;">
      <button id="submitButton" title="${BlocklyGames.esc(BlocklyGames.Msg['Turtle.submitTooltip'])}">
        <img src="common/1x1.gif" class="camera icon21"> ${BlocklyGames.esc(BlocklyGames.Msg['Turtle.submitMsg'])}
      </button>
    </td>
  </tr>
</table>
<div id="galleryDialog" class="dialogHiddenContent">
    <form id="galleryForm" action="/gallery-api/submit" method="post" onsubmit="return false">
    <header>${BlocklyGames.esc(BlocklyGames.Msg['Turtle.submitTooltip'])}</header>
    <canvas id="thumbnail" width=200 height=200></canvas>
    <input type="hidden" name="app" value="turtle">
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
Turtle.html.toolbox = function(level) {
  let xml;
  if (level === 10) {
    xml = `
<category name="${BlocklyGames.esc(BlocklyGames.Msg['Games.turtle'])}">
  <block type="turtle_move">
    <value name="VALUE">
      <shadow type="math_number">
        <field name="NUM">10</field>
      </shadow>
    </value>
  </block>
  <block type="turtle_turn">
    <value name="VALUE">
      <shadow type="math_number">
        <field name="NUM">90</field>
      </shadow>
    </value>
  </block>
  <block type="turtle_width">
    <value name="WIDTH">
      <shadow type="math_number">
        <field name="NUM">1</field>
      </shadow>
    </value>
  </block>
  <block type="turtle_pen"></block>
  <block type="turtle_visibility"></block>
  <block type="turtle_print">
    <value name="TEXT">
      <shadow type="text"></shadow>
    </value>
  </block>
  <block type="turtle_font"></block>
</category>
<category name="${BlocklyGames.esc(BlocklyGames.Msg['Games.catColour'])}">
  <block type="turtle_colour">
    <value name="COLOUR">
      <shadow type="colour_picker"></shadow>
    </value>
  </block>
  <block type="colour_picker"></block>
  <block type="colour_random"></block>
  <block type="colour_rgb">
    <value name="RED">
      <shadow type="math_number">
        <field name="NUM">100</field>
      </shadow>
    </value>
    <value name="GREEN">
      <shadow type="math_number">
        <field name="NUM">50</field>
      </shadow>
    </value>
    <value name="BLUE">
      <shadow type="math_number">
        <field name="NUM">0</field>
      </shadow>
    </value>
  </block>
  <block type="colour_blend">
    <value name="COLOUR1">
      <shadow type="colour_picker">
        <field name="COLOUR">#ff0000</field>
      </shadow>
    </value>
    <value name="COLOUR2">
      <shadow type="colour_picker">
        <field name="COLOUR">#3333ff</field>
      </shadow>
    </value>
    <value name="RATIO">
      <shadow type="math_number">
        <field name="NUM">0.5</field>
      </shadow>
    </value>
  </block>
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
  <block type="math_trig">
    <value name="NUM">
      <shadow type="math_number">
        <field name="NUM">45</field>
      </shadow>
    </value>
  </block>
  <block type="math_constant"></block>
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
    const penBlock = level > 3 ? '<block type="turtle_pen"></block>' : '';
    const colourCat = level > 2 ? `
<category name="${BlocklyGames.esc(BlocklyGames.Msg['Games.catColour'])}">
  <block type="turtle_colour_internal"></block>
</category>
` : '';
    xml = `
<category name="${BlocklyGames.esc(BlocklyGames.Msg['Games.turtle'])}">
  <block type="turtle_move_internal">
    <field name="VALUE">100</field>
  </block>
  <block type="turtle_turn_internal">
    <field name="VALUE">90</field>
  </block>
  ${penBlock}
</category>
${colourCat}
<category name="${BlocklyGames.esc(BlocklyGames.Msg['Games.catLoops'])}">
  <block type="turtle_repeat_internal">
    <field name="TIMES">4</field>
  </block>
</category>
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
Turtle.html.helpDialogs = function(level, isHtml) {
  let content = '';
  switch (level) {
    case 1:
      content = BlocklyGames.esc(BlocklyGames.Msg['Turtle.helpText1']) +
          '<br><img src="turtle/square.gif" height=146 width=146 style="margin-bottom: -50px">';
      break;
    case 2:
      content = BlocklyGames.esc(BlocklyGames.Msg['Turtle.helpText2']);
      break;
    case 3:
      content = BlocklyGames.esc(BlocklyGames.Msg['Turtle.helpText3a']) +
      '<div id="sampleHelp3" class="readonly"></div>' +
      BlocklyGames.esc(BlocklyGames.Msg['Turtle.helpText3a']);
      break;
    case 4:
      content = BlocklyGames.esc(BlocklyGames.Msg['Turtle.helpText4a']) +
          '<div id="sampleHelp4" class="readonly"></div>' +
      BlocklyGames.esc(BlocklyGames.Msg['Turtle.helpText4a']);
      break;
    case 5:
      content = BlocklyGames.esc(BlocklyGames.Msg['Turtle.helpText5']);
      break;
    case 6:
      content = BlocklyGames.esc(BlocklyGames.Msg['Turtle.helpText6']);
      break;
    case 7:
      content = BlocklyGames.esc(BlocklyGames.Msg['Turtle.helpText7']);
      break;
    case 8:
      content = BlocklyGames.esc(BlocklyGames.Msg['Turtle.helpText8']);
      break;
    case 9:
      content = BlocklyGames.esc(BlocklyGames.Msg['Turtle.helpText9']);
      break;
    case 10:
      content = BlocklyGames.esc(BlocklyGames.Msg['Turtle.helpText10']);
      if (!isHtml) {
        content += '<br><br>' +
            BlocklyGames.esc(BlocklyGames.Msg['Turtle.helpText10Reddit']);
      }
      break;
  }

  let unsafeLoopMsg = '';
  if (level < 3) {
    unsafeLoopMsg = BlocklyGames.Msg['Turtle.helpUseLoop3'];
  } else if (level < 4) {
    unsafeLoopMsg = BlocklyGames.Msg['Turtle.helpUseLoop4'];
  }
  return `
<div id="help" class="dialogHiddenContent">
  <div style="padding-bottom: 0.7ex">
    ${content}
  </div>
  ${BlocklyGames.html.ok()}
</div>

<div id="helpToolbox" class="dialogHiddenContent">
  <div><img src="turtle/help_left.png" class="mirrorImg" height=23 width=64></div>
  ${BlocklyGames.esc(BlocklyGames.Msg['Turtle.helpToolbox'])}
</div>

<div id="helpUseLoop" class="dialogHiddenContent">
  <div style="padding-bottom: 0.7ex">
    ${BlocklyGames.esc(BlocklyGames.Msg['Turtle.helpUseLoop'])}
    ${BlocklyGames.esc(unsafeLoopMsg)}
  </div>
  ${BlocklyGames.html.ok()}
</div>
`;
};
