/**
 * Blockly Games: Pond Blocks
 *
 * Copyright 2013 Google Inc.
 * https://github.com/google/blockly-games
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Blocks for Blockly's Pond application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Pond.Blocks');

goog.require('Blockly');
goog.require('Blockly.Blocks.math');
goog.require('Blockly.JavaScript');
goog.require('Blockly.JavaScript.math');
goog.require('BlocklyGames');
goog.require('BlocklyGames.JSBlocks');


/**
 * Common HSV hue for all pond blocks.
 */
Pond.Blocks.POND_HUE = 290;

// Extensions to Blockly's language and JavaScript generator.

Blockly.Blocks['pond_scan'] = {
  /**
   * Block for scanning the pond.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1(%2)",
      "args0": [
        "scan",
        {
          "type": "input_value",
          "name": "DEGREE",
          "check": ["Number", "Angle"]
        }
      ],
      "inputsInline": true,
      "output": "Number",
      "colour": Pond.Blocks.POND_HUE,
      "tooltip": BlocklyGames.getMsg('Pond_scanTooltip')
    });
  }
};

Blockly.JavaScript['pond_scan'] = function(block) {
  // Generate JavaScript for scanning the pond.
  var value_degree = Blockly.JavaScript.valueToCode(block, 'DEGREE',
      Blockly.JavaScript.ORDER_NONE) || 0;
  var code = 'scan(' + value_degree + ')';
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['pond_cannon'] = {
  /**
   * Block for shooting.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
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
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Pond.Blocks.POND_HUE,
      "tooltip": BlocklyGames.getMsg('Pond_cannonTooltip')
    });
  }
};

Blockly.JavaScript['pond_cannon'] = function(block) {
  // Generate JavaScript for shooting.
  var value_degree = Blockly.JavaScript.valueToCode(block, 'DEGREE',
      Blockly.JavaScript.ORDER_COMMA) || 0;
  var value_range = Blockly.JavaScript.valueToCode(block, 'RANGE',
      Blockly.JavaScript.ORDER_COMMA) || 0;
  return 'cannon(' + value_degree + ', ' + value_range + ');\n';
};

Blockly.Blocks['pond_swim'] = {
  /**
   * Block for swimming.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1(%2);",
      "args0": [
          "swim",
        {
          "type": "input_value",
          "name": "DEGREE",
          "check": ["Number", "Angle"]
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Pond.Blocks.POND_HUE,
      "tooltip": BlocklyGames.getMsg('Pond_swimTooltip')
    });
  }
};

Blockly.JavaScript['pond_swim'] = function(block) {
  // Generate JavaScript for swimming.
  var value_degree = Blockly.JavaScript.valueToCode(block, 'DEGREE',
      Blockly.JavaScript.ORDER_NONE) || 0;
  return 'swim(' + value_degree + ');\n';
};

Blockly.Blocks['pond_stop'] = {
  /**
   * Block for stopping.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1(%2)",
      "args0": ["stop", ""],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Pond.Blocks.POND_HUE,
      "tooltip": BlocklyGames.getMsg('Pond_stopTooltip')
    });
  }
};

Blockly.JavaScript['pond_stop'] = function(block) {
  // Generate JavaScript for stopping.
  return 'stop();\n';
};

Blockly.Blocks['pond_health'] = {
  /**
   * Block for avatar health.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1(%2)",
      "args0": ["health", ""],
      "output": "Number",
      "colour": Pond.Blocks.POND_HUE,
      "tooltip": BlocklyGames.getMsg('Pond_healthTooltip')
    });
  }
};

Blockly.JavaScript['pond_health'] = function(block) {
  // Generate JavaScript for avatar health.
  return ['health()', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['pond_speed'] = {
  /**
   * Block for avatar speed.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1(%2)",
      "args0": ["speed", ""],
      "output": "Number",
      "colour": Pond.Blocks.POND_HUE,
      "tooltip": BlocklyGames.getMsg('Pond_speedTooltip')
    });
  }
};

Blockly.JavaScript['pond_speed'] = function(block) {
  // Generate JavaScript for avatar speed.
  return ['speed()', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['pond_getX'] = {
  /**
   * Block for X coordinate.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1(%2)",
      "args0": ["getX", ""],
      "output": "Number",
      "colour": Pond.Blocks.POND_HUE,
      "tooltip": BlocklyGames.getMsg('Pond_locXTooltip')
    });
  }
};

Blockly.JavaScript['pond_getX'] = function(block) {
  // Generate JavaScript for X coordinate.
  return ['getX()', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['pond_getY'] = {
  /**
   * Block for Y coordinate.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1(%2)",
      "args0": ["getY", ""],
      "output": "Number",
      "colour": Pond.Blocks.POND_HUE,
      "tooltip": BlocklyGames.getMsg('Pond_locYTooltip')
    });
  }
};

Blockly.JavaScript['pond_getY'] = function(block) {
  // Generate JavaScript for Y coordinate.
  return ['getY()', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['pond_math_number'] = {
  /**
   * Numeric or angle value.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.MATH_NUMBER_HELPURL);
    this.setColour(Blockly.Blocks.math.HUE);
    this.appendDummyInput('DUMMY')
        .appendField(new Blockly.FieldNumber(0), 'NUM');
    this.setOutput(true, 'Number');
    this.setTooltip(Blockly.Msg.MATH_NUMBER_TOOLTIP);
  },
  /**
   * Switch between number or angle fields, depending on what this block
   * is plugged into.
   * @this Blockly.Block
   */
  onchange: function() {
    if (!this.workspace) {
      // Block has been deleted.
      return;
    }
    if (this.outputConnection.targetConnection &&
        this.outputConnection.targetConnection.check_) {
      // Plugged in to parent.
      var input = this.getInput('DUMMY');
      var field = this.getField('NUM');
      var value = field.getValue();
      if (this.outputConnection.targetConnection.check_.indexOf('Angle') !=
          -1) {
        // Parent wants an angle.
        if (field.constructor != Blockly.FieldAngle) {
          Blockly.Events.disable();
          input.removeField('NUM');
          field = new Blockly.FieldAngle('');
          input.appendField(field, 'NUM');
          field.setText(value);
          this.render();
          Blockly.Events.enable();
        }
      } else {
        // Parent wants a number.
        if (field.constructor != Blockly.FieldNumber) {
          Blockly.Events.disable();
          input.removeField('NUM');
          input.appendField(new Blockly.FieldNumber(value), 'NUM');
          Blockly.Events.enable();
        }
      }
    }
  }
};

Blockly.Blocks['pond_math_single'] = {
  /**
   * Advanced math operators with single operand.
   * @this Blockly.Block
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
            ["Math.atan_deg", "ATAN"]
          ]
        },
        {
          "type": "input_value",
          "name": "NUM",
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "output": "Number",
      "colour": Blockly.Blocks.math.HUE,
      "helpUrl": Blockly.Msg.MATH_SINGLE_HELPURL
    });
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var mode = thisBlock.getFieldValue('OP');
      var TOOLTIPS = {
        'ROOT': Blockly.Msg.MATH_SINGLE_TOOLTIP_ROOT,
        'ABS': Blockly.Msg.MATH_SINGLE_TOOLTIP_ABS,
        'SIN': Blockly.Msg.MATH_TRIG_TOOLTIP_SIN,
        'COS': Blockly.Msg.MATH_TRIG_TOOLTIP_COS,
        'TAN': Blockly.Msg.MATH_TRIG_TOOLTIP_TAN,
        'ASIN': Blockly.Msg.MATH_TRIG_TOOLTIP_ASIN,
        'ACOS': Blockly.Msg.MATH_TRIG_TOOLTIP_ACOS,
        'ATAN': Blockly.Msg.MATH_TRIG_TOOLTIP_ATAN
      };
      return TOOLTIPS[mode];
    });
  }
};

Blockly.JavaScript['pond_math_single'] = function(block) {
  // Advanced math operators with single operand.
  var operator = block.getFieldValue('OP');
  var code;
  var arg = Blockly.JavaScript.valueToCode(block, 'NUM',
          Blockly.JavaScript.ORDER_NONE) || '0';
  // First, handle cases which generate values that don't need parentheses
  // wrapping the code.
  switch (operator) {
    case 'ABS':
      code = 'Math.abs(' + arg + ')';
      break;
    case 'ROOT':
      code = 'Math.sqrt(' + arg + ')';
      break;
    case 'SIN':
      code = 'Math.sin_deg(' + arg + ')';
      break;
    case 'COS':
      code = 'Math.cos_deg(' + arg + ')';
      break;
    case 'TAN':
      code = 'Math.tan_deg(' + arg + ')';
      break;
    case 'ASIN':
      code = 'Math.asin_deg(' + arg + ')';
      break;
    case 'ACOS':
      code = 'Math.acos_deg(' + arg + ')';
      break;
    case 'ATAN':
      code = 'Math.atan_deg(' + arg + ')';
      break;
    default:
      throw 'Unknown math operator: ' + operator;
  }
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['pond_math_number'] = Blockly.JavaScript['math_number'];


// Aliases defined to support XML generated before 15 July 2016.
Blockly.Blocks['pond_loc_x'] = Blockly.Blocks['pond_getX'];
Blockly.JavaScript['pond_loc_x'] = Blockly.JavaScript['pond_getX'];
Blockly.Blocks['pond_loc_y'] = Blockly.Blocks['pond_getY'];
Blockly.JavaScript['pond_loc_y'] = Blockly.JavaScript['pond_getY'];

// Pond blocks moved to appengine/js/blocks.js and renamed on 6 June 2016.
// Aliases defined to support XML generated before change.
Blockly.Blocks['pond_controls_if'] = Blockly.Blocks['controls_if'];
Blockly.JavaScript['pond_controls_if'] = Blockly.JavaScript['controls_if'];
Blockly.Blocks['pond_loops_while'] = Blockly.Blocks['controls_whileUntil'];
Blockly.JavaScript['pond_loops_while'] = Blockly.JavaScript['controls_whileUntil'];
Blockly.Blocks['pond_math_arithmetic'] = Blockly.Blocks['math_arithmetic'];
Blockly.JavaScript['pond_math_arithmetic'] = Blockly.JavaScript['math_arithmetic'];
Blockly.Blocks['pond_math_change'] = Blockly.Blocks['math_change'];
Blockly.JavaScript['pond_math_change'] = Blockly.JavaScript['math_change'];
