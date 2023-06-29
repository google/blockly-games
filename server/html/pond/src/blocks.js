/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blocks for Pond game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Pond.Blocks');

goog.require('Blockly');
goog.require('Blockly.Constants.Math');
goog.require('Blockly.FieldAngle');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldNumber');
goog.require('Blockly.JavaScript');
goog.require('Blockly.JavaScript.math');
goog.require('BlocklyGames');
goog.require('BlocklyGames.JsBlocks');


/**
 * Construct custom turtle block types.  Called on page load.
 */
Pond.Blocks.init = function() {
  /**
   * Common HSV hue for all pond blocks.
   */
  const POND_HUE = 290;

  Blockly.defineBlocksWithJsonArray([
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
      "tooltip": BlocklyGames.getMsg('Pond.scanTooltip', false),
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
      "tooltip": BlocklyGames.getMsg('Pond.cannonTooltip', false),
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
      "tooltip": BlocklyGames.getMsg('Pond.swimTooltip', false),
    },

    // Block for stopping.
    {
      "type": "pond_stop",
      "message0": "%1(%2);",
      "args0": ["stop", ""],
      "previousStatement": null,
      "nextStatement": null,
      "colour": POND_HUE,
      "tooltip": BlocklyGames.getMsg('Pond.stopTooltip', false),
    },

    // Block for avatar health.
    {
      "type": "pond_health",
      "message0": "%1(%2)",
      "args0": ["health", ""],
      "output": "Number",
      "colour": POND_HUE,
      "tooltip": BlocklyGames.getMsg('Pond.healthTooltip', false),
    },

    // Block for avatar speed.
    {
      "type": "pond_speed",
      "message0": "%1(%2)",
      "args0": ["speed", ""],
      "output": "Number",
      "colour": POND_HUE,
      "tooltip": BlocklyGames.getMsg('Pond.speedTooltip', false),
    },

    // Block for X coordinate.
    {
      "type": "pond_getX",
      "message0": "%1(%2)",
      "args0": ["getX", ""],
      "output": "Number",
      "colour": POND_HUE,
      "tooltip": BlocklyGames.getMsg('Pond.locXTooltip', false),
    },

    // Block for Y coordinate.
    {
      "type": "pond_getY",
      "message0": "%1(%2)",
      "args0": ["getY", ""],
      "output": "Number",
      "colour": POND_HUE,
      "tooltip": BlocklyGames.getMsg('Pond.locYTooltip', false),
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
      "tooltip": BlocklyGames.getMsg('Pond.logTooltip', false),
    },
  ]);
};

Blockly.JavaScript['pond_scan'] = function(block) {
  // Generate JavaScript for scanning the pond.
  const value_degree = Blockly.JavaScript.valueToCode(block, 'DEGREE',
      Blockly.JavaScript.ORDER_NONE) || 0;
  const code = `scan(${value_degree})`;
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['pond_cannon'] = function(block) {
  // Generate JavaScript for shooting the cannon.
  const value_degree = Blockly.JavaScript.valueToCode(block, 'DEGREE',
      Blockly.JavaScript.ORDER_COMMA) || 0;
  const value_range = Blockly.JavaScript.valueToCode(block, 'RANGE',
      Blockly.JavaScript.ORDER_COMMA) || 0;
  return `cannon(${value_degree}, ${value_range});\n`;
};

Blockly.JavaScript['pond_swim'] = function(block) {
  // Generate JavaScript for swimming.
  const value_degree = Blockly.JavaScript.valueToCode(block, 'DEGREE',
      Blockly.JavaScript.ORDER_NONE) || 0;
  return `swim(${value_degree});\n`;
};

Blockly.JavaScript['pond_stop'] = function(block) {
  // Generate JavaScript for stopping.
  return 'stop();\n';
};

Blockly.JavaScript['pond_health'] = function(block) {
  // Generate JavaScript for avatar health.
  return ['health()', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['pond_speed'] = function(block) {
  // Generate JavaScript for avatar speed.
  return ['speed()', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['pond_getX'] = function(block) {
  // Generate JavaScript for X coordinate.
  return ['getX()', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['pond_getY'] = function(block) {
  // Generate JavaScript for Y coordinate.
  return ['getY()', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['pond_log'] = function(block) {
  // Generate JavaScript for logging.
  const value_text = Blockly.JavaScript.valueToCode(block, 'VALUE',
      Blockly.JavaScript.ORDER_NONE) || '\'\'';
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
  mutationToDom: function() {
    const container = document.createElement('mutation');
    const field = this.getField('NUM');
    const isAngle = field.constructor === Blockly.FieldAngle;
    container.setAttribute('angle_field', isAngle);
    return container;
  },
  /**
   * Parse XML to restore the 'NUM' field type.
   * @param {!Element} xmlElement XML storage element.
   * @this {Blockly.Block}
   */
  domToMutation: function(xmlElement) {
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
  updateField_: function(isAngle) {
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

Blockly.JavaScript['pond_math_single'] = function(block) {
  // Advanced math operators with single operand.
  const arg = Blockly.JavaScript.valueToCode(block, 'NUM',
      Blockly.JavaScript.ORDER_NONE) || '0';
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
  return [`Math.${func}(${arg})`, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['pond_math_number'] = Blockly.JavaScript['math_number'];


// Aliases defined to support XML generated before 15 July 2016.
Blockly.Blocks['pond_loc_x'] = Blockly.Blocks['pond_getX'];
Blockly.JavaScript['pond_loc_x'] = Blockly.JavaScript['pond_getX'];
Blockly.Blocks['pond_loc_y'] = Blockly.Blocks['pond_getY'];
Blockly.JavaScript['pond_loc_y'] = Blockly.JavaScript['pond_getY'];

// Pond blocks moved to appengine/src/js-blocks.js and renamed on 6 June 2016.
// Aliases defined to support XML generated before change.
Blockly.Blocks['pond_controls_if'] = Blockly.Blocks['controls_if'];
Blockly.JavaScript['pond_controls_if'] = Blockly.JavaScript['controls_if'];
Blockly.Blocks['pond_loops_while'] = Blockly.Blocks['controls_whileUntil'];
Blockly.JavaScript['pond_loops_while'] = Blockly.JavaScript['controls_whileUntil'];
Blockly.Blocks['pond_math_arithmetic'] = Blockly.Blocks['math_arithmetic'];
Blockly.JavaScript['pond_math_arithmetic'] = Blockly.JavaScript['math_arithmetic'];
Blockly.Blocks['pond_math_change'] = Blockly.Blocks['math_change'];
Blockly.JavaScript['pond_math_change'] = Blockly.JavaScript['math_change'];
