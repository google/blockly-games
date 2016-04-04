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
goog.require('Blockly.JavaScript');
goog.require('Blockly.Blocks.logic');
goog.require('Blockly.JavaScript.logic');
// Don't need Blockly.Blocks.loops.
goog.require('Blockly.JavaScript.loops');
goog.require('Blockly.Blocks.math');
goog.require('Blockly.JavaScript.math');
goog.require('Blockly.Blocks.procedures');
goog.require('Blockly.JavaScript.procedures');
goog.require('Blockly.Blocks.variables');
goog.require('Blockly.JavaScript.variables');
goog.require('BlocklyGames');


// Extensions to Blockly's language and JavaScript generator.

Blockly.Blocks['pond_scan'] = {
  /**
   * Block for scanning the pond.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "scan(%1)",
      "args0": [
        {
          "type": "input_value",
          "name": "DEGREE",
          "check": ["Number", "Angle"]
        }
      ],
      "inputsInline": true,
      "output": "Number",
      "colour": 290,
      "tooltip": BlocklyGames.getMsg('Pond_scanTooltip')
    });
  }
};

Blockly.JavaScript['pond_scan'] = function(block) {
  // Generate JavaScript for scanning the pond.
  var value_degree = Blockly.JavaScript.valueToCode(block, 'DEGREE',
      Blockly.JavaScript.ORDER_COMMA) || 0;
  //var value_resolution = Blockly.JavaScript.valueToCode(block, 'RESOLUTION',
  //    Blockly.JavaScript.ORDER_COMMA);
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
      "message0": "cannon(%1, %2);",
      "args0": [
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
      "colour": 290,
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
      "message0": "swim(%1);",
      "args0": [
        {
          "type": "input_value",
          "name": "DEGREE",
          "check": ["Number", "Angle"]
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": 290,
      "tooltip": BlocklyGames.getMsg('Pond_swimTooltip')
    });
  }
};

Blockly.JavaScript['pond_swim'] = function(block) {
  // Generate JavaScript for swimming.
  var value_degree = Blockly.JavaScript.valueToCode(block, 'DEGREE',
      Blockly.JavaScript.ORDER_COMMA) || 0;
  //var value_speed = Blockly.JavaScript.valueToCode(block, 'SPEED',
  //    Blockly.JavaScript.ORDER_COMMA) || 0;
  return 'swim(' + value_degree + ');\n';
};

Blockly.Blocks['pond_stop'] = {
  /**
   * Block for stopping.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "stop();",
      "previousStatement": null,
      "nextStatement": null,
      "colour": 290,
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
      "message0": "health()",
      "output": "Number",
      "colour": 290,
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
      "message0": "speed()",
      "output": "Number",
      "colour": 290,
      "tooltip": BlocklyGames.getMsg('Pond_speedTooltip')
    });
  }
};

Blockly.JavaScript['pond_speed'] = function(block) {
  // Generate JavaScript for avatar speed.
  return ['speed()', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['pond_loc_x'] = {
  /**
   * Block for X coordinate.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "loc_x()",
      "output": "Number",
      "colour": 290,
      "tooltip": BlocklyGames.getMsg('Pond_locXTooltip')
    });
  }
};

Blockly.JavaScript['pond_loc_x'] = function(block) {
  // Generate JavaScript for X coordinate.
  return ['loc_x()', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['pond_loc_y'] = {
  /**
   * Block for Y coordinate.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "loc_y()",
      "output": "Number",
      "colour": 290,
      "tooltip": BlocklyGames.getMsg('Pond_locYTooltip')
    });
  }
};

Blockly.JavaScript['pond_loc_y'] = function(block) {
  // Generate JavaScript for Y coordinate.
  return ['loc_y()', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['pond_controls_if'] = {
  /**
   * If/elseif/else condition.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.CONTROLS_IF_HELPURL);
    this.setColour(Blockly.Blocks.logic.HUE);
    this.appendValueInput('IF0')
        .setCheck('Boolean')
        .appendField('if (');
    this.appendDummyInput()
        .appendField(') {');
    this.appendStatementInput('DO0');
    this.appendDummyInput('TAIL')
        .appendField('}');
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setMutator(new Blockly.Mutator(['controls_if_elseif',
                                         'controls_if_else']));
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      if (!thisBlock.elseifCount_ && !thisBlock.elseCount_) {
        return Blockly.Msg.CONTROLS_IF_TOOLTIP_1;
      } else if (!thisBlock.elseifCount_ && thisBlock.elseCount_) {
        return Blockly.Msg.CONTROLS_IF_TOOLTIP_2;
      } else if (thisBlock.elseifCount_ && !thisBlock.elseCount_) {
        return Blockly.Msg.CONTROLS_IF_TOOLTIP_3;
      } else if (thisBlock.elseifCount_ && thisBlock.elseCount_) {
        return Blockly.Msg.CONTROLS_IF_TOOLTIP_4;
      }
      return '';
    });
    this.elseifCount_ = 0;
    this.elseCount_ = 0;
  },
  /**
   * Modify this block to have the correct number of inputs.
   * @private
   * @this Blockly.Block
   */
  updateShape_: function() {
    // Delete everything.
    if (this.getInput('ELSE')) {
      this.removeInput('ELSEMSG');
      this.removeInput('ELSE');
    }
    var i = 1;
    while (this.getInput('IF' + i)) {
      this.removeInput('IF' + i);
      this.removeInput('TAIL' + i);
      this.removeInput('DO' + i);
      i++;
    }
    // Rebuild block.
    for (var i = 1; i <= this.elseifCount_; i++) {
      this.appendValueInput('IF' + i)
          .setCheck('Boolean')
          .appendField('} else if (');
      this.appendDummyInput('TAIL' + i)
          .appendField(') {');
      this.appendStatementInput('DO' + i);
    }
    if (this.elseCount_) {
      this.appendDummyInput('ELSEMSG')
          .appendField('} else {');
      this.appendStatementInput('ELSE');
    }
    // Move final '}' to the end.
    this.moveInputBefore('TAIL', null);
  },
  mutationToDom: Blockly.Blocks['controls_if'].mutationToDom,
  domToMutation: Blockly.Blocks['controls_if'].domToMutation,
  decompose: Blockly.Blocks['controls_if'].decompose,
  compose: Blockly.Blocks['controls_if'].compose,
  saveConnections: Blockly.Blocks['controls_if'].saveConnections
};

Blockly.JavaScript['pond_controls_if'] =
    Blockly.JavaScript['controls_if'];

/**
 * Comparison operator.
 * @this Blockly.Block
 */
Blockly.Blocks['logic_compare'].init = function() {
  var OPERATORS = [
    ['==', 'EQ'],
    ['!=', 'NEQ'],
    ['<', 'LT'],
    ['<=', 'LTE'],
    ['>', 'GT'],
    ['>=', 'GTE']
  ];
  this.setHelpUrl(Blockly.Msg.LOGIC_COMPARE_HELPURL);
  this.setColour(Blockly.Blocks.logic.HUE);
  this.setOutput(true, 'Boolean');
  this.appendValueInput('A');
  this.appendValueInput('B')
      .appendField(new Blockly.FieldDropdown(OPERATORS), 'OP');
  this.setInputsInline(true);
  // Assign 'this' to a variable for use in the tooltip closure below.
  var thisBlock = this;
  this.setTooltip(function() {
    var op = thisBlock.getFieldValue('OP');
    var TOOLTIPS = {
      EQ: Blockly.Msg.LOGIC_COMPARE_TOOLTIP_EQ,
      NEQ: Blockly.Msg.LOGIC_COMPARE_TOOLTIP_NEQ,
      LT: Blockly.Msg.LOGIC_COMPARE_TOOLTIP_LT,
      LTE: Blockly.Msg.LOGIC_COMPARE_TOOLTIP_LTE,
      GT: Blockly.Msg.LOGIC_COMPARE_TOOLTIP_GT,
      GTE: Blockly.Msg.LOGIC_COMPARE_TOOLTIP_GTE
    };
    return TOOLTIPS[op];
  });
  this.prevBlocks_ = [null, null];
};

Blockly.Msg.LOGIC_OPERATION_AND = '&&';
Blockly.Msg.LOGIC_OPERATION_OR = '||'

Blockly.Msg.LOGIC_BOOLEAN_TRUE = 'true';
Blockly.Msg.LOGIC_BOOLEAN_FALSE = 'false';

Blockly.Blocks['pond_loops_while'] = {
  /**
   * Do while/until loop.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "while ( %1 ) { %2 %3 }",
      "args0": [
        {
          "type": "input_value",
          "name": "BOOL",
          "check": "Boolean"
        },
        {
          "type": "input_dummy"
        },
        {
          "type": "input_statement",
          "name": "DO"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 120,
      "tooltip": Blockly.Msg.CONTROLS_WHILEUNTIL_TOOLTIP_WHILE,
      "helpUrl": Blockly.Msg.CONTROLS_WHILEUNTIL_HELPURL
    });
  }
};

Blockly.JavaScript['pond_loops_while'] =
    Blockly.JavaScript['controls_whileUntil'];

Blockly.Blocks['pond_math_number'] = {
  /**
   * Numeric or angle value.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.MATH_NUMBER_HELPURL);
    this.setColour(Blockly.Blocks.math.HUE);
    this.appendDummyInput('DUMMY')
        .appendField(new Blockly.FieldTextInput('0',
        Blockly.FieldTextInput.numberValidator), 'NUM');
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
        if (field.constructor != Blockly.FieldTextInput) {
          Blockly.Events.disable();
          input.removeField('NUM');
          input.appendField(new Blockly.FieldTextInput(value,
              Blockly.FieldTextInput.numberValidator), 'NUM');
          Blockly.Events.enable();
        }
      }
    }
  }
};

Blockly.JavaScript['pond_math_number'] = Blockly.JavaScript['math_number'];

Blockly.Blocks['pond_math_arithmetic'] = {
  /**
   * Block for basic arithmetic operator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1 %2 %3",
      "args0": [
        {
          "type": "input_value",
          "name": "A",
          "check": "Number"
        },
        {
          "type": "field_dropdown",
          "name": "OP",
          "options": [
            ['+', 'ADD'],
            ['-', 'MINUS'],
            ['*', 'MULTIPLY'],
            ['/', 'DIVIDE']
          ]
        },
        {
          "type": "input_value",
          "name": "B",
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "output": "Number",
      "colour": Blockly.Blocks.math.HUE,
      "helpUrl": Blockly.Msg.MATH_ARITHMETIC_HELPURL
    });
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var mode = thisBlock.getFieldValue('OP');
      var TOOLTIPS = {
        'ADD': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_ADD,
        'MINUS': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_MINUS,
        'MULTIPLY': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_MULTIPLY,
        'DIVIDE': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_DIVIDE
      };
      return TOOLTIPS[mode];
    });
  }
};

Blockly.JavaScript['pond_math_arithmetic'] =
    Blockly.JavaScript['math_arithmetic'];

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
            ['Math.sqrt', 'ROOT'],
            ['Math.abs', 'ABS'],
            ['Math.sin_deg', 'SIN'],
            ['Math.cos_deg', 'COS'],
            ['Math.tan_deg', 'TAN'],
            ['Math.asin_deg', 'ASIN'],
            ['Math.acos_deg', 'ACOS'],
            ['Math.atan_deg', 'ATAN']
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

Blockly.Blocks['pond_math_change'] = {
  /**
   * Add to a variable in place.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1 += %2;",
      "args0": [
        {
          "type": "field_variable",
          "name": "VAR",
          "variable": "name"
        },
        {
          "type": "input_value",
          "name": "DELTA",
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Blocks.math.HUE,
      "helpUrl": Blockly.Msg.MATH_CHANGE_HELPURL
    });
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return Blockly.Msg.MATH_CHANGE_TOOLTIP.replace('%1',
          thisBlock.getFieldValue('VAR'));
    });
  }
};

Blockly.JavaScript['pond_math_change'] = Blockly.JavaScript['math_change'];

Blockly.Msg.MATH_RANDOM_FLOAT_TITLE_RANDOM = 'Math.random()';

/**
 * Variable getter.
 * @this Blockly.Block
 */
Blockly.Blocks['variables_get'].init = function() {
  this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
  this.setColour(Blockly.Blocks.variables.HUE);
  this.appendDummyInput()
      .appendField(new Blockly.FieldVariable('name'), 'VAR');
  this.setOutput(true);
  this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
  this.contextMenuMsg_ = Blockly.Msg.VARIABLES_GET_CREATE_SET;
  this.contextMenuType_ = 'variables_set';
};

/**
 * Variable setter.
 * @this Blockly.Block
 */
Blockly.Blocks['variables_set'].init = function() {
  this.setHelpUrl(Blockly.Msg.VARIABLES_SET_HELPURL);
  this.setColour(Blockly.Blocks.variables.HUE);
  this.appendValueInput('VALUE')
      .appendField('var')
      .appendField(new Blockly.FieldVariable('name'), 'VAR')
      .appendField('=');
  this.appendDummyInput()
      .appendField(';');
  this.setInputsInline(true);
  this.setPreviousStatement(true);
  this.setNextStatement(true);
  this.setTooltip(Blockly.Msg.VARIABLES_SET_TOOLTIP);
  this.contextMenuMsg_ = Blockly.Msg.VARIABLES_SET_CREATE_GET;
  this.contextMenuType_ = 'variables_get';
};

/**
 * Define a procedure with no return value.
 * @this Blockly.Block
 */
Blockly.Blocks['procedures_defnoreturn'].init = function() {
  this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL);
  this.setColour(Blockly.Blocks.procedures.HUE);
  var name = Blockly.Procedures.findLegalName(
      Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE, this);
  this.appendDummyInput()
      .appendField('function')
      .appendField(new Blockly.FieldTextInput(name,
      Blockly.Procedures.rename), 'NAME')
      .appendField('(')
      .appendField('', 'PARAMS')
      .appendField(') {');
  this.setStatements_(true);
  this.appendDummyInput()
      .appendField('}');
  this.setMutator(new Blockly.Mutator(['procedures_mutatorarg']));
  this.setTooltip(Blockly.Msg.PROCEDURES_DEFNORETURN_TOOLTIP);
  this.arguments_ = [];
  this.statementConnection_ = null;
};

/**
 * Define a procedure with a return value.
 * @this Blockly.Block
 */
Blockly.Blocks['procedures_defreturn'].init = function() {
  this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFRETURN_HELPURL);
  this.setColour(Blockly.Blocks.procedures.HUE);
  var name = Blockly.Procedures.findLegalName(
      Blockly.Msg.PROCEDURES_DEFRETURN_PROCEDURE, this);
  this.appendDummyInput()
      .appendField('function')
      .appendField(new Blockly.FieldTextInput(name,
      Blockly.Procedures.rename), 'NAME')
      .appendField('(')
      .appendField('', 'PARAMS')
      .appendField(') {');
  this.appendValueInput('RETURN')
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('return');
  this.appendDummyInput()
      .appendField('}');
  this.setMutator(new Blockly.Mutator(['procedures_mutatorarg']));
  this.setTooltip(Blockly.Msg.PROCEDURES_DEFRETURN_TOOLTIP);
  this.arguments_ = [];
  this.setStatements_(true);
  this.statementConnection_ = null;
};

Blockly.Msg.PROCEDURES_BEFORE_PARAMS = '';

/**
 * Call a procedure with no return value.
 * @this Blockly.Block
 */
Blockly.Blocks['procedures_callnoreturn'].init = function() {
  this.setHelpUrl(Blockly.Msg.PROCEDURES_CALLNORETURN_HELPURL);
  this.setColour(Blockly.Blocks.procedures.HUE);
  this.appendDummyInput()
      .appendField('', 'NAME')
      .appendField('(');
  this.appendDummyInput('TAIL')
      .appendField(');');
  this.setInputsInline(true);
  this.setPreviousStatement(true);
  this.setNextStatement(true);
  this.setTooltip(Blockly.Msg.PROCEDURES_CALLNORETURN_TOOLTIP);
  this.arguments_ = [];
  this.quarkConnections_ = {};
  this.quarkArguments_ = null;
};

/**
 * Modify this block to have the correct number of arguments.
 * @private
 * @this Blockly.Block
 */
Blockly.Blocks['procedures_callnoreturn'].updateShape_ = function() {
  for (var i = 0; i < this.arguments_.length; i++) {
    if (!this.getInput('ARG' + i)) {
      // Add new input.
      var field = new Blockly.FieldLabel(this.arguments_[i]);
      var input = this.appendValueInput('ARG' + i);
      if (i > 0) {
        input.appendField(',');
      }
      input.init();
    }
  }
  // Remove deleted inputs.
  while (this.getInput('ARG' + i)) {
    this.removeInput('ARG' + i);
    i++;
  }
  this.moveInputBefore('TAIL', null);
};

/**
 * Call a procedure with a return value.
 * @this Blockly.Block
 */
Blockly.Blocks['procedures_callreturn'].init = function() {
  this.setHelpUrl(Blockly.Msg.PROCEDURES_CALLRETURN_HELPURL);
  this.setColour(Blockly.Blocks.procedures.HUE);
  this.appendDummyInput()
      .appendField('', 'NAME')
      .appendField('(');
  this.appendDummyInput('TAIL')
      .appendField(')');
  this.setInputsInline(true);
  this.setOutput(true);
  this.setTooltip(Blockly.Msg.PROCEDURES_CALLRETURN_TOOLTIP);
  this.arguments_ = [];
  this.quarkConnections_ = {};
  this.quarkArguments_ = null;
};

Blockly.Blocks['procedures_callreturn'].updateShape_ =
    Blockly.Blocks['procedures_callnoreturn'].updateShape_;

// Don't show the "if/return" block.
delete Blockly.Blocks['procedures_ifreturn']
