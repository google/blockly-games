/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview HTML for Movie game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Movie.html');

goog.require('BlocklyGames');
goog.require('BlocklyGames.html');
goog.require('BlocklyGames.Msg');

/**
 * Web page structure.
 * @param {!Object} ij Injected options.
 * @return {string} HTML.
 */
Movie.html.start = function(ij) {
  return `
${BlocklyGames.html.headerBar(ij, BlocklyGames.Msg['Games.movie'], '', true, true, '')}

<div id="visualization">
  <div id="coordinates">
    <span id="x"></span>
    <span id="y"></span>
  </div>
  <canvas id="scratch" width=400 height=400 style="display: none"></canvas>
  <canvas id="hatching" width=400 height=400 style="display: none"></canvas>
  <canvas id="axies" width=400 height=400 style="display: none" dir="ltr"></canvas>
  <canvas id="display" width=400 height=400 style="vertical-align: bottom"></canvas>
</div>
<svg
    id="scrubber"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:svg="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    version="1.1"
    width="402" height="24">
  <image xlink:href="movie/youtube-bg.png" height=25 width=402 x=0 y=-1 />
</svg>

${(ij.level === 10 && !ij.html) ? Movie.html.gallery(ij.lang) : ''}

${Movie.html.toolbox(ij.level)}
<div id="blockly"></div>

${BlocklyGames.html.dialog()}
${BlocklyGames.html.doneDialog()}
${BlocklyGames.html.abortDialog()}
${BlocklyGames.html.storageDialog()}

${Movie.html.helpDialogs(ij.level, ij.html)}
`;
};

/**
 * Gallery view button and submission form.
 * @param {string} lang ISO language code.
 * @return {string} HTML.
 */
Movie.html.gallery = function(lang) {
  return `
<table style="padding-top: 1em; width: 400px;">
  <tr>
    <td style="text-align: center;">
      <form action="/gallery" target="movie-gallery">
        <input type="hidden" name="app" value="movie">
        <input type="hidden" name="lang" value="{$ij.lang}">
        <button type="submit" title="${BlocklyGames.esc(BlocklyGames.Msg['Movie.galleryTooltip'])}">
          <img src="common/1x1.gif" class="gallery icon21"> ${BlocklyGames.esc(BlocklyGames.Msg['Movie.galleryMsg'])}
        </button>
      </form>
    </td>
    <td style="text-align: center;">
      <button id="submitButton" title="${BlocklyGames.esc(BlocklyGames.Msg['Movie.submitTooltip'])}">
        <img src="common/1x1.gif" class="camera icon21"> ${BlocklyGames.esc(BlocklyGames.Msg['Movie.submitMsg'])}
      </button>
    </td>
  </tr>
</table>
<div id="galleryDialog" class="dialogHiddenContent">
    <form id="galleryForm" action="/gallery-api/submit" method="post" onsubmit="return false">
    <header>${BlocklyGames.esc(BlocklyGames.Msg['Movie.submitTooltip'])}</header>
    <canvas id="thumbnail" width=200 height=200></canvas>
    <input type="hidden" name="app" value="movie">
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
Movie.html.toolbox = function(level) {
  let xml = `
<category name="${BlocklyGames.esc(BlocklyGames.Msg['Games.movie'])}">
  <block type="movie_circle">
    <value name="X">
      <shadow type="math_number">
        <field name="NUM">50</field>
      </shadow>
    </value>
    <value name="Y">
      <shadow type="math_number">
        <field name="NUM">50</field>
      </shadow>
    </value>
    <value name="RADIUS">
      <shadow type="math_number">
        <field name="NUM">10</field>
      </shadow>
    </value>
  </block>
  <block type="movie_rect">
    <value name="X">
      <shadow type="math_number">
        <field name="NUM">50</field>
      </shadow>
    </value>
    <value name="Y">
      <shadow type="math_number">
        <field name="NUM">50</field>
      </shadow>
    </value>
    <value name="WIDTH">
      <shadow type="math_number">
        <field name="NUM">10</field>
      </shadow>
    </value>
    <value name="HEIGHT">
      <shadow type="math_number">
        <field name="NUM">10</field>
      </shadow>
    </value>
  </block>
  <block type="movie_line">
    <value name="X1">
      <shadow type="math_number">
        <field name="NUM">40</field>
      </shadow>
    </value>
    <value name="Y1">
      <shadow type="math_number">
        <field name="NUM">40</field>
      </shadow>
    </value>
    <value name="X2">
      <shadow type="math_number">
        <field name="NUM">60</field>
      </shadow>
    </value>
    <value name="Y2">
      <shadow type="math_number">
        <field name="NUM">60</field>
      </shadow>
    </value>
    <value name="WIDTH">
      <shadow type="math_number">
        <field name="NUM">1</field>
      </shadow>
    </value>
  </block>
`;
  if (level > 1) {
    xml += '<block type="movie_time"></block>';
  }
  xml += `
</category>
<category name="${BlocklyGames.esc(BlocklyGames.Msg['Games.catColour'])}">
  <block type="movie_colour">
    <value name="COLOUR">
      <shadow type="colour_picker"></shadow>
    </value>
  </block>
`;
  if (level === 10) {
    xml += `
  <block type="colour_picker"></block>
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
`;
  }
  xml += '</category>';
  if (level > 6) {
    xml += `
<category name="${BlocklyGames.esc(BlocklyGames.Msg['Games.catLogic'])}">
  <block type="controls_if">
`;
    if (level < 10) {
       xml += '<mutation else="1"></mutation>';
    }
    xml += `
  </block>
  <block type="logic_compare"></block>
`;
    if (level === 10) {
      xml += `
  <block type="logic_operation"></block>
  <block type="logic_negate"></block>
  <block type="logic_boolean"></block>
  <block type="logic_ternary"></block>
`;
    }
    xml += '</category>';
  }
  if (level === 10) {
    xml += `
<category name="${BlocklyGames.esc(BlocklyGames.Msg['Games.catLoops'])}">
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
`;
  }
  if (level > 2) {
    xml += `
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
`;
    if (level === 10) {
      xml += `
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
`;
    }
    xml += '</category>';
  }
  if (level === 10) {
    xml += `
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
  }
  return `<xml id="toolbox" xmlns="https://developers.google.com/blockly/xml">${xml}</xml>`;
};

/**
 * Help dialogs for each level.
 * @param {number} level Level 1-10.
 * @param {boolean} isHtml True if served as raw HTML files.
 * @return {string} HTML.
 */
Movie.html.helpDialogs = function(level, isHtml) {
  let content = '';
  switch (level) {
    case 1:
      content = BlocklyGames.esc(BlocklyGames.Msg['Movie.helpText1']);
      break;
    case 2:
      content = BlocklyGames.esc(BlocklyGames.Msg['Movie.helpText2a']) +
          '<div id="sampleHelp2" class="readonly"></div>' +
          BlocklyGames.esc(BlocklyGames.Msg['Movie.helpText2b']);
      break;
    case 3:
      content = BlocklyGames.esc(BlocklyGames.Msg['Movie.helpText3']);
      break;
    case 4:
      content = BlocklyGames.esc(BlocklyGames.Msg['Movie.helpText4']);
      break;
    case 5:
      content = BlocklyGames.esc(BlocklyGames.Msg['Movie.helpText5']) +
`<br><br>
<code class="ltr">y = ((time - 50) &divide; 5) ^ 2</code>
<code class="rtl">&lrm;2 ^ (5 &divide; (50 - time)) = y&lrm;</code>`;
      break;
    case 6:
      content = BlocklyGames.esc(BlocklyGames.Msg['Movie.helpText6']);
      break;
    case 7:
      content = BlocklyGames.esc(BlocklyGames.Msg['Movie.helpText7']);
      break;
    case 8:
      content = BlocklyGames.esc(BlocklyGames.Msg['Movie.helpText8']);
      break;
    case 9:
      content = BlocklyGames.esc(BlocklyGames.Msg['Movie.helpText9']);
      break;
    case 10:
      content = BlocklyGames.esc(BlocklyGames.Msg['Movie.helpText10']);
      if (!isHtml) {
        content += '<br><br>' +
            BlocklyGames.esc(BlocklyGames.Msg['Turtle.helpText10Reddit']);
      }
      break;
  }
  return `
<div id="helpLayer" class="dialogHiddenContent">
  <div style="padding-bottom: 0.7ex">
    ${BlocklyGames.esc(BlocklyGames.Msg['Movie.helpLayer'])}
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
