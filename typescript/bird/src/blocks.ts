/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blocks for Bird game.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
import {getMsg} from '../../src/lib-games.js';

import {defineBlocksWithJsonArray} from '../../third-party/blockly/core/blockly.js';
import type {Block} from '../../third-party/blockly/core/block.js';
import type {Generator} from '../../third-party/blockly/core/generator.js';
import {register, buildTooltipForDropdown} from '../../third-party/blockly/core/extensions.js';
import {javascriptGenerator} from '../../third-party/blockly/generators/javascript.js';
// Convince TypeScript that Blockly's JS generator is not an ES6 Generator.
const JavaScript = javascriptGenerator as any as Generator;
// TODO: fix type of JavaScript.

/**
 * Construct custom bird block types.  Called on page load.
 */
export function initBlocks() {
  /**
   * Common HSV hue for all variable blocks.
   */
  const VARIABLES_HUE = 330;

  /**
   * HSV hue for movement block.
   */
  const MOVEMENT_HUE = 290;

  defineBlocksWithJsonArray([
    // Block for no worm condition.
    {
      "type": "bird_noWorm",
      "message0": getMsg('Bird.noWorm', false),
      "output": "Boolean",
      "colour": VARIABLES_HUE,
      "tooltip": getMsg('Bird.noWormTooltip', false),
    },

    // Block for moving bird in a direction.
    {
      "type": "bird_heading",
      "message0": getMsg('Bird.heading', false) + "%1",
      "args0": [
        {
          "type": "field_angle",
          "name": "ANGLE",
          "angle": 90,
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": MOVEMENT_HUE,
      "tooltip": getMsg('Bird.headingTooltip', false),
    },

    // Block for getting bird's x or y position.
    {
      "type": "bird_position",
      "message0": "%1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "XY",
          "options": [["x", "X"], ["y", "Y"]],
        }
      ],
      "output": "Number",
      "colour": VARIABLES_HUE,
      "tooltip": getMsg('Bird.positionTooltip', false),
    },

    // Block for comparing bird's x or y position with a number.
    {
      "type": "bird_compare",
      "message0": `%1%2%3`,
      "args0": [
        {
          "type": "input_value",
          "name": "A",
          "check": "Number",
        },
        {
          "type": "field_dropdown",
          "name": "OP",
          "options": [['\u200F<', 'LT'], ['\u200F>', 'GT']],
        },
        {
          "type": "input_value",
          "name": "B",
          "check": "Number",
        },
      ],
      "inputsInline": true,
      "output": "Boolean",
      "colour": "%{BKY_LOGIC_HUE}",
      "helpUrl": "%{BKY_LOGIC_COMPARE_HELPURL}",
      "extensions": ["bird_compare_tooltip"],
    },

    // Block for logical operator 'and'.
    {
      "type": "bird_and",
      "message0": "%1%{BKY_LOGIC_OPERATION_AND}%2",
      "args0": [
        {
          "type": "input_value",
          "name": "A",
          "check": "Boolean",
        },
        {
          "type": "input_value",
          "name": "B",
          "check": "Boolean",
        },
      ],
      "inputsInline": true,
      "output": "Boolean",
      "colour": "%{BKY_LOGIC_HUE}",
      "tooltip": "%{BKY_LOGIC_OPERATION_TOOLTIP_AND}",
      "helpUrl": "%{BKY_LOGIC_OPERATION_HELPURL}",
    },

    // Block for 'if/else'.
    {
      "type": "bird_ifElse",
      "message0": "%{BKY_CONTROLS_IF_MSG_IF}%1%{BKY_CONTROLS_IF_MSG_THEN}%2%{BKY_CONTROLS_IF_MSG_ELSE}%3",
      "args0": [
        {
          "type": "input_value",
          "name": "CONDITION",
          "check": "Boolean",
        },
        {
          "type": "input_statement",
          "name": "DO",
        },
        {
          "type": "input_statement",
          "name": "ELSE",
        },
      ],
      "colour": "%{BKY_LOGIC_HUE}",
      "tooltip": "%{BKY_CONTROLS_IF_TOOLTIP_2}",
      "helpUrl": "%{BKY_CONTROLS_IF_HELPURL}",
    },

    // Block for numeric value.
    {
      "type": "math_number",
      "message0": "%1",
      "args0": [{
        "type": "field_number",
        "name": "NUM",
        "value": 0,
      }],
      "output": "Number",
      "helpUrl": "%{BKY_MATH_NUMBER_HELPURL}",
      "colour": "%{BKY_MATH_HUE}",
      "tooltip": "%{BKY_MATH_NUMBER_TOOLTIP}",
      "extensions": ["parent_tooltip_when_inline"],
    },
  ]);

  register('bird_compare_tooltip', buildTooltipForDropdown('OP',
          {
            'LT': '%{BKY_LOGIC_COMPARE_TOOLTIP_LT}',
            'GT': '%{BKY_LOGIC_COMPARE_TOOLTIP_GT}',
          }));
}


JavaScript['bird_noWorm'] = function(block: Block) {
  // Generate JavaScript for no worm condition.
  return ['noWorm()', JavaScript.ORDER_FUNCTION_CALL];
};

JavaScript['bird_heading'] = function(block: Block) {
  // Generate JavaScript for moving bird in a direction.
  const dir = Number(block.getFieldValue('ANGLE'));
  return `heading(${dir}, 'block_id_${block.id}');\n`;
};

JavaScript['bird_position'] = function(block: Block) {
  // Generate JavaScript for getting bird's x or y position.
  const code = `get${block.getFieldValue('XY').charAt(0)}()`;
  return [code, JavaScript.ORDER_FUNCTION_CALL];
};

JavaScript['bird_compare'] = function(block: Block) {
  // Generate JavaScript for comparing bird's x or y position with a number.
  const operator = (block.getFieldValue('OP') === 'LT') ? '<' : '>';
  const order = JavaScript.ORDER_RELATIONAL;
  const argument0 = JavaScript.valueToCode(block, 'A', order) || '0';
  const argument1 = JavaScript.valueToCode(block, 'B', order) || '0';
  const code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

JavaScript['bird_and'] = function(block: Block) {
  // Generate JavaScript for logical operator 'and'.
  const order = JavaScript.ORDER_LOGICAL_AND;
  let argument0 = JavaScript.valueToCode(block, 'A', order);
  let argument1 = JavaScript.valueToCode(block, 'B', order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = 'false';
    argument1 = 'false';
  } else {
    // Single missing arguments have no effect on the return value.
    if (!argument0) {
      argument0 = 'true';
    }
    if (!argument1) {
      argument1 = 'true';
    }
  }
  const code = argument0 + ' && ' + argument1;
  return [code, order];
};

JavaScript['bird_ifElse'] = function(block: Block) {
  // Generate JavaScript for 'if/else' conditional.
  const argument = JavaScript.valueToCode(block, 'CONDITION',
                   JavaScript.ORDER_NONE) || 'false';
  const branch0 = JavaScript.statementToCode(block, 'DO');
  const branch1 = JavaScript.statementToCode(block, 'ELSE');
  return `if (${argument}) {\n${branch0}} else {\n${branch1}}\n`;
};

// Backup the initialization function on the stock 'if' block.
Blockly.Blocks['controls_if'].oldInit = Blockly.Blocks['controls_if'].init;

  /**
   * Modify the stock 'if' block to be a singleton.
   * @this {Blockly.Block}
   */
Blockly.Blocks['controls_if'].init = function() {
  this.oldInit();
  this.setPreviousStatement(false);
  this.setNextStatement(false);
};

JavaScript['math_number'] = function(block: Block) {
  // Numeric value.
  const code = Number(block.getFieldValue('NUM'));
  const order = code >= 0 ? JavaScript.ORDER_ATOMIC :
      JavaScript.ORDER_UNARY_NEGATION;
  return [code, order];
};
