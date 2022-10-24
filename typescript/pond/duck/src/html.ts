/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview HTML for Pond game.
 * @author fraser@google.com (Neil Fraser)
 */
import {headerBar, dialog} from '../../../src/html.js';
import {visualization} from '../../src/html.js';
import {getMsg} from '../../../src/lib-games.js';


/**
 * Web page structure.
 * @param {!Object} ij Injected options.
 * @returns {string} HTML.
 */
export function start(ij: any): string {
  return `
${headerBar(ij, getMsg('Games.pond', true), '', false, false, '')}

${visualization()}

<div id="tabarea">
  <div id="editorBar" class="tab-bar">
    <div><select id="avatar-select"></select></div>
    <div class="tab tab-selected">${getMsg('Games.blocks', true)}</div>
    <div class="tab">JavaScript</div>
  </div>
  <div class="tab-bar-clear"></div>
  <div id="blockly"></div>
  <div id="editor"></div>
</div>

${toolbox_()}

${dialog()}
`;
};


/**
 * Toolbox.
 * @returns {string} HTML.
 * @private
 */
function toolbox_(): string {
  return `
<xml id="toolbox" xmlns="https://developers.google.com/blockly/xml">
  <category name="${getMsg('Games.pond', true)}">
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
    <block type="pond_scan">
      <value name="DEGREE">
        <shadow type="pond_math_number">
          <mutation angle_field="true"></mutation>
          <field name="NUM">0</field>
        </shadow>
      </value>
    </block>
    <block type="pond_swim">
      <value name="DEGREE">
        <shadow type="pond_math_number">
          <mutation angle_field="true"></mutation>
          <field name="NUM">0</field>
        </shadow>
      </value>
    </block>
    <block type="pond_stop"></block>
    <block type="pond_getX"></block>
    <block type="pond_getY"></block>
    <block type="pond_speed"></block>
    <block type="pond_health"></block>
    <block type="pond_log">
      <value name="VALUE">
        <shadow type="pond_math_number">
          <mutation angle_field="false"></mutation>
          <field name="NUM">123</field>
        </shadow>
      </value>
    </block>
  </category>
  <category name="${getMsg('Games.catLogic', true)}">
    <block type="controls_if"></block>
    <block type="logic_compare"></block>
    <block type="logic_operation"></block>
    <block type="logic_boolean"></block>
  </category>
  <category name="${getMsg('Games.catLoops', true)}">
    <block type="controls_whileUntil"></block>
  </category>
  <category name="${getMsg('Games.catMath', true)}">
    <block type="pond_math_number">
      <mutation angle_field="false"></mutation>
    </block>
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
    <block type="pond_math_single">
      <value name="NUM">
        <shadow type="math_number">
          <field name="NUM">9</field>
        </shadow>
      </value>
    </block>
    <block type="math_random_float"></block>
  </category>
  <sep></sep>
  <category name="${getMsg('Games.catVariables', true)}" custom="VARIABLE"></category>
  <category name="${getMsg('Games.catProcedures', true)}" custom="PROCEDURE"></category>
</xml>
`;
}
