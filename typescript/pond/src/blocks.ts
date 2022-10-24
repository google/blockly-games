/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blocks for Pond game.
 * @author fraser@google.com (Neil Fraser)
 */
import {getMsg} from '../../src/lib-games.js';

import {defineBlocksWithJsonArray} from '../../third-party/blockly/core/blockly.js';
import type {Block} from '../../third-party/blockly/core/block.js';
import type {Generator} from '../../third-party/blockly/core/generator.js';
import {javascriptGenerator} from '../../third-party/blockly/generators/javascript.js';
// Convince TypeScript that Blockly's JS generator is not an ES6 Generator.
const JavaScript = javascriptGenerator as any as Generator;
// TODO: fix type of JavaScript.


/**
 * Construct custom turtle block types.  Called on page load.
 */
export function initBlocks() {
  /**
   * Common HSV hue for all pond blocks.
   */
  const POND_HUE = 290;

  defineBlocksWithJsonArray([
    // Block for scanning the pond.
    {
      "type": "pond_scan",
      "message0": "%1(%2)",
      "args0": [
        "scan",
        {
          "type": "input_value",
          "name": "DEGREE",
          "check": ["Number", "Angle"],
        }
      ],
      "inputsInline": true,
      "output": "Number",
      "colour": POND_HUE,
      "tooltip": getMsg('Pond.scanTooltip', false),
    },

    // Block for shooting the cannon.
    {
      "type": "pond_cannon",
      "message0": "%1(%2, %3);",
      "args0": [
        "cannon",
        {
          "type": "input_value",
          "name": "DEGREE",
          "check": ["Number", "Angle"]
        },
        {
          "type": "input_value",
          "name": "RANGE",
          "check": "Number",
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": POND_HUE,
      "tooltip": getMsg('Pond.cannonTooltip', false),
    },

    // Block for swimming.
    {
      "type": "pond_swim",
      "message0": "%1(%2);",
      "args0": [
          "swim",
        {
          "type": "input_value",
          "name": "DEGREE",
          "check": ["Number", "Angle"],
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": POND_HUE,
      "tooltip": getMsg('Pond.swimTooltip', false),
    },

    // Block for stopping.
    {
      "type": "pond_stop",
      "message0": "%1(%2);",
      "args0": ["stop", ""],
      "previousStatement": null,
      "nextStatement": null,
      "colour": POND_HUE,
      "tooltip": getMsg('Pond.stopTooltip', false),
    },

    // Block for avatar health.
    {
      "type": "pond_health",
      "message0": "%1(%2)",
      "args0": ["health", ""],
      "output": "Number",
      "colour": POND_HUE,
      "tooltip": getMsg('Pond.healthTooltip', false),
    },

    // Block for avatar speed.
    {
      "type": "pond_speed",
      "message0": "%1(%2)",
      "args0": ["speed", ""],
      "output": "Number",
      "colour": POND_HUE,
      "tooltip": getMsg('Pond.speedTooltip', false),
    },

    // Block for X coordinate.
    {
      "type": "pond_getX",
      "message0": "%1(%2)",
      "args0": ["getX", ""],
      "output": "Number",
      "colour": POND_HUE,
      "tooltip": getMsg('Pond.locXTooltip', false),
    },

    // Block for Y coordinate.
    {
      "type": "pond_getY",
      "message0": "%1(%2)",
      "args0": ["getY", ""],
      "output": "Number",
      "colour": POND_HUE,
      "tooltip": getMsg('Pond.locYTooltip', false),
    },

    // Block for log statement.
    {
      "type": "pond_log",
      "message0": "%1(%2);",
      "args0": [
        "log",
        {
          "type": "input_value",
          "name": "VALUE",
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": POND_HUE,
      "tooltip": getMsg('Pond.logTooltip', false),
    },
  ]);
};

JavaScript['pond_scan'] = function(block: Block) {
  // Generate JavaScript for scanning the pond.
  const value_degree = JavaScript.valueToCode(block, 'DEGREE',
      JavaScript.ORDER_NONE) || 0;
  const code = `scan(${value_degree})`;
  return [code, JavaScript.ORDER_FUNCTION_CALL];
};

JavaScript['pond_cannon'] = function(block: Block) {
  // Generate JavaScript for shooting the cannon.
  const value_degree = JavaScript.valueToCode(block, 'DEGREE',
      JavaScript.ORDER_COMMA) || 0;
  const value_range = JavaScript.valueToCode(block, 'RANGE',
      JavaScript.ORDER_COMMA) || 0;
  return `cannon(${value_degree}, ${value_range});\n`;
};

JavaScript['pond_swim'] = function(block: Block) {
  // Generate JavaScript for swimming.
  const value_degree = JavaScript.valueToCode(block, 'DEGREE',
      JavaScript.ORDER_NONE) || 0;
  return `swim(${value_degree});\n`;
};

JavaScript['pond_stop'] = function(block: Block) {
  // Generate JavaScript for stopping.
  return 'stop();\n';
};

JavaScript['pond_health'] = function(block: Block) {
  // Generate JavaScript for avatar health.
  return ['health()', JavaScript.ORDER_FUNCTION_CALL];
};

JavaScript['pond_speed'] = function(block: Block) {
  // Generate JavaScript for avatar speed.
  return ['speed()', JavaScript.ORDER_FUNCTION_CALL];
};

JavaScript['pond_getX'] = function(block: Block) {
  // Generate JavaScript for X coordinate.
  return ['getX()', JavaScript.ORDER_FUNCTION_CALL];
};

JavaScript['pond_getY'] = function(block: Block) {
  // Generate JavaScript for Y coordinate.
  return ['getY()', JavaScript.ORDER_FUNCTION_CALL];
};

JavaScript['pond_log'] = function(block: Block) {
  // Generate JavaScript for logging.
  const value_text = JavaScript.valueToCode(block, 'VALUE',
      JavaScript.ORDER_NONE) || '\'\'';
  return `log(${value_text});\n`;
};


Blockly.Blocks['pond_math_number'] = {
  /**
   * Numeric or angle value.
   * @this {Blockly.Block}
   */
  init: function() {
    this.jsonInit({
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
      "extensions": ["parent_tooltip_when_inline"]
    });
  },
  /**
   * Create XML to represent whether the 'NUM' field is an angle.
   * @returns {!Element} XML storage element.
   * @this {Blockly.Block}
   */
  mutationToDom: function(): Element {
    const container = document.createElement('mutation');
    const field = this.getField('NUM');
    const isAngle = field.constructor === Blockly.FieldAngle;
    container.setAttribute('angle_field', String(isAngle));
    return container;
  },
  /**
   * Parse XML to restore the 'NUM' field type.
   * @param {!Element} xmlElement XML storage element.
   * @this {Blockly.Block}
   */
  domToMutation: function(xmlElement: Element) {
    const isAngle = (xmlElement.getAttribute('angle_field') === 'true');
    this.updateField_(isAngle);
  },
  /**
   * Switch between number or angle fields, depending on what this block
   * is plugged into.
   * @this {Blockly.Block}
   */
  onchange: function() {
    if (!this.workspace) {
      // Block has been deleted.
      return;
    }
    if (this.outputConnection.targetConnection &&
        this.outputConnection.targetConnection.check_) {
      // Plugged in to parent.
      const field = this.getField('NUM');
      if (this.outputConnection.targetConnection.check_.includes('Angle')) {
        // Parent wants an angle.
        if (field.constructor !== Blockly.FieldAngle) {
          this.updateField_(true);
        }
      } else {
        // Parent wants a number.
        if (field.constructor !== Blockly.FieldNumber) {
          this.updateField_(false);
        }
      }
    }
  },
  /**
   * Convert the 'NUM' field into either an angle or number field.
   * @param {boolean} isAngle True if angle, false if number.
   * @private
   */
  updateField_: function(isAngle: boolean) {
    Blockly.Events.disable();
    // The implicitly-created dummy input.
    const input = this.inputList[0];
    let field = this.getField('NUM');
    const value = field.getValue();
    if (isAngle) {
      input.removeField('NUM');
      field = new Blockly.FieldAngle('');
      input.appendField(field, 'NUM');
      field.setValue(value);
    } else {
      input.removeField('NUM');
      input.appendField(new Blockly.FieldNumber(value), 'NUM');
    }
    if (this.rendered) {
      this.render();
    }
    Blockly.Events.enable();
  },
};

Blockly.Blocks['pond_math_single'] = {
  /**
   * Advanced math operators with single operand.
   * @this {Blockly.Block}
   */
  init: function() {
    this.jsonInit({
      "message0": "%1 (%2)",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "OP",
          "options": [
            ["Math.sqrt", "ROOT"],
            ["Math.abs", "ABS"],
            ["Math.sin_deg", "SIN"],
            ["Math.cos_deg", "COS"],
            ["Math.tan_deg", "TAN"],
            ["Math.asin_deg", "ASIN"],
            ["Math.acos_deg", "ACOS"],
            ["Math.atan_deg", "ATAN"],
          ],
        },
        {
          "type": "input_value",
          "name": "NUM",
          "check": "Number",
        },
      ],
      "inputsInline": true,
      "output": "Number",
      "colour": "%{BKY_MATH_HUE}",
      "helpUrl": "%{BKY_MATH_SINGLE_HELPURL}",
      "extensions": ["math_op_tooltip"],
    });
  }
};

JavaScript['pond_math_single'] = function(block: Block) {
  // Advanced math operators with single operand.
  const arg = JavaScript.valueToCode(block, 'NUM',
      JavaScript.ORDER_NONE) || '0';
  const func = {
    'ROOT': 'sqrt',
    'ABS':  'abs',
    'SIN':  'sin_deg',
    'COS':  'cos_deg',
    'TAN':  'tan_deg',
    'ASIN': 'asin_deg',
    'ACOS': 'acos_deg',
    'ATAN': 'atan_deg',
  }[block.getFieldValue('OP')];
  return [`Math.${func}(${arg})`, JavaScript.ORDER_FUNCTION_CALL];
};

JavaScript['pond_math_number'] = JavaScript['math_number'];


// Aliases defined to support XML generated before 15 July 2016.
Blockly.Blocks['pond_loc_x'] = Blockly.Blocks['pond_getX'];
JavaScript['pond_loc_x'] = JavaScript['pond_getX'];
Blockly.Blocks['pond_loc_y'] = Blockly.Blocks['pond_getY'];
JavaScript['pond_loc_y'] = JavaScript['pond_getY'];

// Pond blocks moved to appengine/src/js-blocks.js and renamed on 6 June 2016.
// Aliases defined to support XML generated before change.
Blockly.Blocks['pond_controls_if'] = Blockly.Blocks['controls_if'];
JavaScript['pond_controls_if'] = JavaScript['controls_if'];
Blockly.Blocks['pond_loops_while'] = Blockly.Blocks['controls_whileUntil'];
JavaScript['pond_loops_while'] = JavaScript['controls_whileUntil'];
Blockly.Blocks['pond_math_arithmetic'] = Blockly.Blocks['math_arithmetic'];
JavaScript['pond_math_arithmetic'] = JavaScript['math_arithmetic'];
Blockly.Blocks['pond_math_change'] = Blockly.Blocks['math_change'];
JavaScript['pond_math_change'] = JavaScript['math_change'];
