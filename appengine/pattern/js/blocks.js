/**
 * Blockly Games: Bird Blocks
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
 * @fileoverview Blocks for Blockly's Bird application.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Pattern.Blocks');

goog.require('BlocklyGames');
goog.require('Blockly.JavaScript');
goog.require('Blockly.Blocks.logic');
goog.require('Blockly.JavaScript.logic');
goog.require('Blockly.Blocks.math');
goog.require('Blockly.JavaScript.math');

// Extensions to Blockly's language and JavaScript generator.

Blockly.Blocks['regex_dot'] = {
  /**
   * Block for a '.' token.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(210);
    this.appendValueInput('regex_input_pattern')
        .appendField(BlocklyGames.getMsg('Regex_dot'));
    this.setOutput(true, 'String');
    this.setTooltip(BlocklyGames.getMsg('Regex_dotTooltip'));
  }
};

Blockly.JavaScript['regex_dot'] = function(block) {
  var argument0 = Blockly.JavaScript.valueToCode(block,
    'regex_input_pattern', Blockly.JavaScript.ORDER_ATOMIC);
  var regexString = '.' + argument0;
  // TODO: Change ORDER_NONE to the correct strength.
  return [regexString, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['regex_literal'] = {
  init: function() {
    var defaultLiteralValue = Pattern.defaultLiteralValue ?
      Pattern.defaultLiteralValue : 'A';
    this.setColour(210);
    // This block is editable only for testing.
    //this.setEditable(false);
    this.appendValueInput('regex_input_pattern')
        .appendField(BlocklyGames.getMsg('Regex_literal'))
        .appendField(new Blockly.FieldTextInput(defaultLiteralValue),
          're_literal');
    this.setOutput(true, 'String');
    this.setTooltip(BlocklyGames.getMsg('Regex_literalTooltip'));
  }
};

Blockly.JavaScript['regex_literal'] = function(block) {
  var argument0 = Blockly.JavaScript.valueToCode(block,
    'regex_input_pattern', Blockly.JavaScript.ORDER_ATOMIC);
  var regexString = block.getFieldValue('re_literal') + argument0;
  return [regexString, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['regex_matchoneormore'] = {
  init: function() {
    this.setColour(210);
    this.appendValueInput('regex_input_pattern')
        .appendField('+');
    this.setOutput(true, 'String');
    this.setTooltip('TODO');
  }
};

Blockly.JavaScript['regex_matchoneormore'] = function(block) {
  var argument0 = Blockly.JavaScript.valueToCode(block,
    'regex_input_pattern', Blockly.JavaScript.ORDER_ATOMIC);
  var regexString = '+' + argument0;
  return [regexString, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['regex_constructor'] = {
  /**
   * Block for creating a regex.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(290);
    this.setDeletable(false);
    this.setMovable(false);
    this.appendValueInput('regex_input_pattern')
        .setCheck('String')
        .appendField(BlocklyGames.getMsg('Regex_constructor'));
    this.setTooltip('Regex_constructorTooltip');
  }
};

/**
 * Returns a new regex object created from all of the input blocks.
 */
Blockly.JavaScript['regex_constructor'] = function(block) {
  var value_regex_input_pattern = Blockly.JavaScript.valueToCode(block,
    'regex_input_pattern', Blockly.JavaScript.ORDER_ATOMIC);
  var code = ' ';
  if (value_regex_input_pattern) {
    code = value_regex_input_pattern;
  }
  return code;
};
