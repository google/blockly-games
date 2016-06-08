/**
 * Blockly Games: Genetics Blocks
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview Blocks for Blockly's Genetics application.
 * @author kozbial@google.com (Monica Kozbial)
 */
'use strict';

goog.provide('Genetics.Blocks');

goog.require('Blockly');
goog.require('Blockly.Blocks.lists');
goog.require('Blockly.Blocks.loops');
goog.require('Blockly.JavaScript');
goog.require('Blockly.JavaScript.lists');
goog.require('Blockly.JavaScript.loops');
goog.require('BlocklyGames');
goog.require('BlocklyGames.JSBlocks');

/**
 * Common HSV hue for all pond blocks.
 */
Genetics.Blocks.GENETICS_HUE = 360; // TODO update toolbox and choose color here

// Extensions to Blockly's language and JavaScript generator.

Blockly.JavaScript['genetics_mouseFunction_'] = function(funcName, args, block) {
  // Define a procedure with a return value.
  var branch = Blockly.JavaScript.statementToCode(block, 'STACK');
  if (Blockly.JavaScript.STATEMENT_PREFIX) {
    branch = Blockly.JavaScript.prefixLines(
            Blockly.JavaScript.STATEMENT_PREFIX.replace(/%1/g,
                '\'' + block.id + '\''), Blockly.JavaScript.INDENT) + branch;
  }
  if (Blockly.JavaScript.INFINITE_LOOP_TRAP) {
    branch = Blockly.JavaScript.INFINITE_LOOP_TRAP.replace(/%1/g,
            '\'' + block.id + '\'') + branch;
  }
  var returnValue = Blockly.JavaScript.valueToCode(block, 'RETURN',
          Blockly.JavaScript.ORDER_NONE) || '';
  if (returnValue) {
    returnValue = '  return ' + returnValue + ';\n';
  }
  var code = 'function ' + funcName + '(' + args + ') {\n' +
      branch + returnValue + '}';
  code = Blockly.JavaScript.scrub_(block, code);
  Blockly.JavaScript.definitions_[funcName] = code;
  return null;
};

Blockly.Blocks['genetics_mouseFunctionInit_'] = function(funcName, args) {
  /**
   * Block for mouse function definition.
   * @this Blockly.Block
   */
  this.jsonInit({
    "message0": "function %1( " + args + " ) { %2 %3 return %4 }",
    "args0": [
      {
        "type": "field_label",
        "name": "NAME",
        "text": funcName
      },
      {
        "type": "input_dummy"
      },
      {
        "type": "input_statement",
        "name": "STACK"
      },
      {
        "type": "input_value",
        "align": "right",
        "name": "RETURN"
      }
    ],
    "inputsInline": true,
    "colour": Genetics.Blocks.GENETICS_HUE,
    "tooltip": BlocklyGames.getMsg('Genetics_' + funcName + 'Tooltip'),
  });
};

Blockly.Blocks['genetics_pickFight'] = {
  init: goog.partial(Blockly.Blocks['genetics_mouseFunctionInit_'],
                     'pickFight', '')
};
Blockly.JavaScript['genetics_pickFight'] =
    goog.partial(Blockly.JavaScript['genetics_mouseFunction_'],
                 'pickFight', '');

Blockly.Blocks['genetics_chooseMate'] = {
  init: goog.partial(Blockly.Blocks['genetics_mouseFunctionInit_'],
                     'chooseMate', '')
};
Blockly.JavaScript['genetics_chooseMate'] =
    goog.partial(Blockly.JavaScript['genetics_mouseFunction_'],
                 'chooseMate', '');

Blockly.Blocks['genetics_mateAnswer'] = {
  init: goog.partial(Blockly.Blocks['genetics_mouseFunctionInit_'],
                     'mateAnswer', 'suitor'),
  getVars: function() {
    return ['suitor'];
  }
};
Blockly.JavaScript['genetics_mateAnswer'] =
    goog.partial(Blockly.JavaScript['genetics_mouseFunction_'],
                 'mateAnswer', 'suitor');
