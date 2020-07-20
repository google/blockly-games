/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Redefining some of Blockly's exiting blocks to look more
 * similar to JavaScript.
 * @author fraser@google.com (Neil Fraser)
 * @author kozbial@google.com (Monica Kozbial)
 */
'use strict';

goog.provide('BlocklyGames.JsBlocks');

goog.require('Blockly');
goog.require('Blockly.Constants.Lists');
goog.require('Blockly.Constants.Logic');
goog.require('Blockly.Constants.Loops');
goog.require('Blockly.Constants.Math');
goog.require('Blockly.Blocks.procedures');
goog.require('Blockly.Constants.Variables');
goog.require('Blockly.JavaScript');
goog.require('Blockly.JavaScript.lists');
goog.require('Blockly.JavaScript.logic');
goog.require('Blockly.JavaScript.loops');
goog.require('Blockly.JavaScript.math');
goog.require('Blockly.JavaScript.procedures');
goog.require('Blockly.JavaScript.variables');
goog.require('BlocklyGames');
goog.require('BlocklyGames.Msg');


// Extensions to Blockly's existing blocks and JavaScript generator.

(function () {
  // Enclose mixin in an immediately executed function to hide the 'prop' var.
  for (var prop in Blockly.Constants.Logic.CONTROLS_IF_MUTATOR_MIXIN) {
    Blockly.Blocks['controls_if'][prop] =
        Blockly.Constants.Logic.CONTROLS_IF_MUTATOR_MIXIN[prop];
  }
})();

/**
 * If/elseif/else condition.
 * @this {Blockly.Block}
 */
Blockly.Blocks['controls_if'].init = function() {
  this.setHelpUrl(Blockly.Msg['CONTROLS_IF_HELPURL']);
  this.setColour(Blockly.Msg['LOGIC_HUE']);
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
  Blockly.Constants.Logic.CONTROLS_IF_TOOLTIP_EXTENSION.apply(this);
};

/**
 * Modify this block to have the correct number of inputs.
 * @private
 * @this {Blockly.Block}
 */
Blockly.Blocks['controls_if'].updateShape_ = function() {
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
};

/**
 * Comparison operator.
 * @this {Blockly.Block}
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
  this.setHelpUrl(Blockly.Msg['LOGIC_COMPARE_HELPURL']);
  this.setColour(Blockly.Msg['LOGIC_HUE']);
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
      'EQ': Blockly.Msg['LOGIC_COMPARE_TOOLTIP_EQ'],
      'NEQ': Blockly.Msg['LOGIC_COMPARE_TOOLTIP_NEQ'],
      'LT': Blockly.Msg['LOGIC_COMPARE_TOOLTIP_LT'],
      'LTE': Blockly.Msg['LOGIC_COMPARE_TOOLTIP_LTE'],
      'GT': Blockly.Msg['LOGIC_COMPARE_TOOLTIP_GT'],
      'GTE': Blockly.Msg['LOGIC_COMPARE_TOOLTIP_GTE']
    };
    return TOOLTIPS[op];
  });
  this.prevBlocks_ = [null, null];
};

Blockly.Msg['LOGIC_OPERATION_AND'] = '&&';
Blockly.Msg['LOGIC_OPERATION_OR'] = '||';

Blockly.Msg['LOGIC_NEGATE_TITLE'] = '! %1';

Blockly.Msg['LOGIC_BOOLEAN_TRUE'] = 'true';
Blockly.Msg['LOGIC_BOOLEAN_FALSE'] = 'false';

/**
 * Block for 'while' loop.
 * @this {Blockly.Block}
 */
Blockly.Blocks['controls_whileUntil'].init = function() {
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
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": Blockly.Msg['LOOPS_HUE'],
    "tooltip": Blockly.Msg['CONTROLS_WHILEUNTIL_TOOLTIP_WHILE'],
    "helpUrl": Blockly.Msg['CONTROLS_WHILEUNTIL_HELPURL']
  });
};

/**
 * Initialization for 'for' loop Block.
 * @this {Blockly.Block}
 */
Blockly.Blocks['controls_for'].init = function() {
  this.jsonInit({
    "message0": "for (var %1 = %2;  %3 < %4;  %5 += 1) { %6 %7 }",
    "args0": [
      {
        "type": "field_variable",
        "name": "VAR",
        "variable": null
      },
      {
        "type": "input_value",
        "name": "FROM",
        "check": "Number",
        "align": "RIGHT"
      },
      {
        "type": "field_label",
        "name": "VAR1",
        "text": '?'
      },
      {
        "type": "input_value",
        "name": "TO",
        "check": "Number",
        "align": "RIGHT"
      },
      {
        "type": "field_label",
        "name": "VAR2",
        "text": "?"
      },
      {
        "type": "input_dummy"
      },
      {
        "type": "input_statement",
        "name": "DO"
      }

    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": Blockly.Msg['LOOPS_HUE'],
    "helpUrl": Blockly.Msg['CONTROLS_FOR_HELPURL']
  });
  // Assign 'this' to a variable for use in the tooltip closure below.
  var thisBlock = this;
  // TODO(kozbial) Fix tooltip text.
  this.setTooltip(function() {
    return Blockly.Msg['CONTROLS_FOR_TOOLTIP'].replace('%1',
        thisBlock.getFieldValue('VAR'));
  });
};

/**
 * E for 'for' loop.
 * @this {Blockly.Block}
 */
Blockly.Blocks['controls_for'].onchange = function(e) {
  var varName = this.getField('VAR').getText();
  this.setFieldValue(varName, 'VAR1');
  this.setFieldValue(varName, 'VAR2');
};

Blockly.JavaScript['controls_for'] = function(block) {
  // For loop.
  var variable = Blockly.JavaScript.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var from = Blockly.JavaScript.valueToCode(block, 'FROM',
      Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
  var to = Blockly.JavaScript.valueToCode(block, 'TO',
      Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
  var branch = Blockly.JavaScript.statementToCode(block, 'DO');

  branch = Blockly.JavaScript.addLoopTrap(branch, block.id);
  var code = 'for (var ' + variable + ' = ' + from + '; ' +
      variable + ' < ' + to + '; ' +
      variable + ' += 1) {\n' +
      branch + '}\n';
  return code;
};

Blockly.Msg['CONTROLS_FLOW_STATEMENTS_OPERATOR_BREAK'] = 'break ;';
Blockly.Msg['CONTROLS_FLOW_STATEMENTS_OPERATOR_CONTINUE'] = 'continue ;';

/**
 * Block for basic arithmetic operator.
 * @this {Blockly.Block}
 */
Blockly.Blocks['math_arithmetic'].init = function() {
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
          ["+", "ADD"],
          ["-", "MINUS"],
          ["*", "MULTIPLY"],
          ["/", "DIVIDE"]
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
    "colour": Blockly.Msg['MATH_HUE'],
    "helpUrl": Blockly.Msg['MATH_ARITHMETIC_HELPURL']
  });
  // Assign 'this' to a variable for use in the tooltip closure below.
  var thisBlock = this;
  this.setTooltip(function() {
    var mode = thisBlock.getFieldValue('OP');
    var TOOLTIPS = {
      'ADD': Blockly.Msg['MATH_ARITHMETIC_TOOLTIP_ADD'],
      'MINUS': Blockly.Msg['MATH_ARITHMETIC_TOOLTIP_MINUS'],
      'MULTIPLY': Blockly.Msg['MATH_ARITHMETIC_TOOLTIP_MULTIPLY'],
      'DIVIDE': Blockly.Msg['MATH_ARITHMETIC_TOOLTIP_DIVIDE']
    };
    return TOOLTIPS[mode];
  });
};

/**
 * Add to a variable in place.
 * @this {Blockly.Block}
 */
Blockly.Blocks['math_change'].init = function() {
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
    "colour": Blockly.Msg['VARIABLES_HUE'],
    "helpUrl": Blockly.Msg['MATH_CHANGE_HELPURL']
  });
  // Assign 'this' to a variable for use in the tooltip closure below.
  var thisBlock = this;
  this.setTooltip(function() {
    return Blockly.Msg['MATH_CHANGE_TOOLTIP'].replace('%1',
        thisBlock.getField('VAR').getVariable().name);
  });
};

/**
 * Defines the JavaScript generation for the change block, without checks as to
 * whether the variable is a number because users of games that use JsBlocks
 * are advanced and this reduces complexity in generated code.
 * @param {Blockly.Block} block
 * @return {string}
 */
Blockly.JavaScript['math_change'] = function(block) {
  // Add to a variable in place.
  var delta = Blockly.JavaScript.valueToCode(block, 'DELTA',
      Blockly.JavaScript.ORDER_ADDITION) || '0';
  var varName = Blockly.JavaScript.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  return varName + ' += ' + delta + ';\n';
};

/**
 * Block for random integer between [X] and [Y].
 * @this {Blockly.Block}
 */
Blockly.Blocks['math_random_int'].init = function() {
  this.jsonInit({
    "message0": "%1(%2,%3)",
    "args0": [
      "Math.randomInt",
      {
        "type": "input_value",
        "name": "FROM",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "TO",
        "check": "Number"
      }
    ],
    "inputsInline": true,
    "output": "Number",
    "colour": Blockly.Msg['MATH_HUE'],
    "tooltip": Blockly.Msg['MATH_RANDOM_INT_TOOLTIP'],
    "helpUrl": Blockly.Msg['MATH_RANDOM_INT_HELPURL']
  });
};

Blockly.Msg['MATH_RANDOM_FLOAT_TITLE_RANDOM'] = 'Math.random  (  )';

Blockly.Msg['LISTS_CREATE_EMPTY_TITLE'] = '[ ]';
Blockly.Msg['LISTS_CREATE_WITH_INPUT_WITH'] = '[';

/**
 * Modify create list with elements block to have the correct number of inputs.
 * @private
 * @this {Blockly.Block}
 */
Blockly.Blocks['lists_create_with'].updateShape_ = function() {
  if (this.getInput('TAIL')) {
    this.removeInput('TAIL');
  }
  if (this.itemCount_ && this.getInput('EMPTY')) {
    this.removeInput('EMPTY');
  } else if (!this.itemCount_ && !this.getInput('EMPTY')) {
    this.appendDummyInput('EMPTY')
        .appendField(Blockly.Msg['LISTS_CREATE_EMPTY_TITLE']);
  }
  // Add new inputs.
  for (var i = 0; i < this.itemCount_; i++) {
    if (!this.getInput('ADD' + i)) {
      var input = this.appendValueInput('ADD' + i);
      if (i == 0) {
        input.appendField(Blockly.Msg['LISTS_CREATE_WITH_INPUT_WITH']);
      } else {
        input.appendField(',');
      }
    }
  }
  // Remove deleted inputs.
  while (this.getInput('ADD' + i)) {
    this.removeInput('ADD' + i);
    i++;
  }
  if (this.itemCount_) {
    this.appendDummyInput('TAIL')
        .appendField(']');
  }
};

Blockly.Blocks['lists_getIndex'] = {
  /**
   * Block for getting element at index.
   * @this {Blockly.Block}
   */
  init: function() {
    this.jsonInit({
      "message0": "%1[%2]",
      "args0": [
        {
          "type": "input_value",
          "name": "VALUE",
          "check": "Array"
        },
        {
          "type": "input_value",
          "name": "AT",
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "output": null,
      "colour": Blockly.Msg['LISTS_HUE'],
      "tooltip": Blockly.Msg['LISTS_GET_INDEX_TOOLTIP_GET_FROM'] +
          Blockly.Msg['LISTS_INDEX_FROM_START_TOOLTIP'].replace('%1', '#0'),
      "helpUrl": Blockly.Msg['LISTS_GET_INDEX_HELPURL']
    });
  }
};

Blockly.Blocks['lists_setIndex'] = {
  /**
   * Block for setting element at index.
   * @this {Blockly.Block}
   */
  init: function() {
    this.jsonInit({
      "message0": "%1[%2] = %3;",
      "args0": [
        {
          "type": "input_value",
          "name": "LIST",
          "check": "Array"
        },
        {
          "type": "input_value",
          "name": "AT",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "TO"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Msg['LISTS_HUE'],
      "tooltip": Blockly.Msg['LISTS_SET_INDEX_TOOLTIP_SET_FROM'] +
          Blockly.Msg['LISTS_INDEX_FROM_START_TOOLTIP'].replace('%1', '#0'),
      "helpUrl": Blockly.Msg['LISTS_SET_INDEX_HELPURL']
    });
  }
};

Blockly.Msg['LISTS_LENGTH_TITLE'] = '%1 . length';

/**
 * Variable getter.
 * @this {Blockly.Block}
 */
Blockly.Blocks['variables_get'].init = function() {
  this.setHelpUrl(Blockly.Msg['VARIABLES_GET_HELPURL']);
  this.setColour(Blockly.Msg['VARIABLES_HUE']);
  this.appendDummyInput()
      .appendField(new Blockly.FieldVariable('name'), 'VAR');
  this.setOutput(true);
  this.setTooltip(Blockly.Msg['VARIABLES_GET_TOOLTIP']);
  this.contextMenuMsg_ = Blockly.Msg['VARIABLES_GET_CREATE_SET'];
  this.contextMenuType_ = 'variables_set';
};

/**
 * Variable setter.
 * @this {Blockly.Block}
 */
Blockly.Blocks['variables_set'].init = function() {
  this.setHelpUrl(Blockly.Msg['VARIABLES_SET_HELPURL']);
  this.setColour(Blockly.Msg['VARIABLES_HUE']);
  this.appendValueInput('VALUE')
      .appendField('var')
      .appendField(new Blockly.FieldVariable('name'), 'VAR')
      .appendField('=');
  this.appendDummyInput()
      .appendField(';');
  this.setInputsInline(true);
  this.setPreviousStatement(true);
  this.setNextStatement(true);
  this.setTooltip(Blockly.Msg['VARIABLES_SET_TOOLTIP']);
  this.contextMenuMsg_ = Blockly.Msg['VARIABLES_SET_CREATE_GET'];
  this.contextMenuType_ = 'variables_get';
};

/**
 * Define a procedure with no return value.
 * @this {Blockly.Block}
 */
Blockly.Blocks['procedures_defnoreturn'].init = function() {
  var nameField = new Blockly.FieldTextInput('',
      Blockly.Procedures.rename);
  this.appendDummyInput()
      .appendField('function')
      .appendField(nameField, 'NAME')
      .appendField('(')
      .appendField('', 'PARAMS')
      .appendField(') {');
  // Append statement block to the function definition here.
  this.setStatements_(true);
  this.appendDummyInput()
      .appendField('}');
  this.setMutator(new Blockly.Mutator(['procedures_mutatorarg']));
  if (Blockly.Msg['PROCEDURES_DEFNORETURN_COMMENT']) {
    this.setCommentText(Blockly.Msg['PROCEDURES_DEFNORETURN_COMMENT']);
  }
  this.setColour(Blockly.Msg['PROCEDURES_HUE']);
  this.setTooltip(Blockly.Msg['PROCEDURES_DEFNORETURN_TOOLTIP']);
  this.setHelpUrl(Blockly.Msg['PROCEDURES_DEFNORETURN_HELPURL']);
  this.arguments_ = [];
  this.argumentVarModels_ = [];
  this.setStatements_(true);
  this.statementConnection_ = null;
};

/**
 * Define a procedure with a return value.
 * @this {Blockly.Block}
 */
Blockly.Blocks['procedures_defreturn'].init = function() {
  var nameField = new Blockly.FieldTextInput('',
      Blockly.Procedures.rename);
  this.appendDummyInput()
      .appendField('function')
      .appendField(nameField, 'NAME')
      .appendField('(')
      .appendField('', 'PARAMS')
      .appendField(') {');
  this.appendValueInput('RETURN')
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('return');
  this.appendDummyInput()
      .appendField('}');
  this.setMutator(new Blockly.Mutator(['procedures_mutatorarg']));
  if (Blockly.Msg['PROCEDURES_DEFRETURN_COMMENT']) {
    this.setCommentText(Blockly.Msg['PROCEDURES_DEFRETURN_COMMENT']);
  }
  this.setColour(Blockly.Msg['PROCEDURES_HUE']);
  this.setTooltip(Blockly.Msg['PROCEDURES_DEFRETURN_TOOLTIP']);
  this.setHelpUrl(Blockly.Msg['PROCEDURES_DEFRETURN_HELPURL']);
  this.arguments_ = [];
  this.argumentVarModels_ = [];
  this.setStatements_(true);
  this.statementConnection_ = null;
};

Blockly.Msg['PROCEDURES_BEFORE_PARAMS'] = '';

/**
 * Call a procedure with no return value.
 * @this {Blockly.Block}
 */
Blockly.Blocks['procedures_callnoreturn'].init = function() {
  this.setHelpUrl(Blockly.Msg['PROCEDURES_CALLNORETURN_HELPURL']);
  this.setColour(Blockly.Msg['PROCEDURES_HUE']);
  this.appendDummyInput()
      .appendField('', 'NAME')
      .appendField('(');
  this.appendDummyInput('TAIL')
      .appendField(');');
  this.setInputsInline(true);
  this.setPreviousStatement(true);
  this.setNextStatement(true);
  this.setTooltip(Blockly.Msg['PROCEDURES_CALLNORETURN_TOOLTIP']);
  this.arguments_ = [];
  this.quarkConnections_ = {};
  this.quarkArguments_ = null;
};

/**
 * Modify this block to have the correct number of arguments.
 * @private
 * @this {Blockly.Block}
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
 * @this {Blockly.Block}
 */
Blockly.Blocks['procedures_callreturn'].init = function() {
  this.setHelpUrl(Blockly.Msg['PROCEDURES_CALLRETURN_HELPURL']);
  this.setColour(Blockly.Msg['PROCEDURES_HUE']);
  this.appendDummyInput()
      .appendField('', 'NAME')
      .appendField('(');
  this.appendDummyInput('TAIL')
      .appendField(')');
  this.setInputsInline(true);
  this.setOutput(true);
  this.setTooltip(Blockly.Msg['PROCEDURES_CALLRETURN_TOOLTIP']);
  this.arguments_ = [];
  this.quarkConnections_ = {};
  this.quarkArguments_ = null;
};

Blockly.Blocks['procedures_callreturn'].updateShape_ =
    Blockly.Blocks['procedures_callnoreturn'].updateShape_;

// Don't show the "if/return" block.
delete Blockly.Blocks['procedures_ifreturn'];
