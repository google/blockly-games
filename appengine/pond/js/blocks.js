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
goog.require('Blockly.Blocks.logic');
goog.require('Blockly.Blocks.math');
goog.require('Blockly.Blocks.procedures');
goog.require('Blockly.Blocks.variables');
goog.require('Blockly.JavaScript');
goog.require('Blockly.JavaScript.logic');
// Don't need Blockly.Blocks.loops.
goog.require('Blockly.JavaScript.loops');
goog.require('Blockly.JavaScript.math');
goog.require('Blockly.JavaScript.procedures');
goog.require('Blockly.JavaScript.variables');
goog.require('BlocklyGames');
goog.require('BlocklyGames.JSBlocks');


// Extensions to Blockly's language and JavaScript generator.

Blockly.Blocks['pond_scan'] = {
  /**
   * Block for scanning the pond.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      'message0': 'scan(%1)',
      'args0': [
        {
          'type': 'input_value',
          'name': 'DEGREE',
          'check': ['Number', 'Angle']
        }
      ],
      'inputsInline': true,
      'output': 'Number',
      'colour': 290,
      'tooltip': BlocklyGames.getMsg('Pond_scanTooltip')
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
      'message0': 'cannon(%1, %2);',
      'args0': [
        {
          'type': 'input_value',
          'name': 'DEGREE',
          'check': ['Number', 'Angle']
        },
        {
          'type': 'input_value',
          'name': 'RANGE',
          'check': 'Number'
        }
      ],
      'inputsInline': true,
      'previousStatement': null,
      'nextStatement': null,
      'colour': 290,
      'tooltip': BlocklyGames.getMsg('Pond_cannonTooltip')
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
      'message0': 'swim(%1);',
      'args0': [
        {
          'type': 'input_value',
          'name': 'DEGREE',
          'check': ['Number', 'Angle']
        }
      ],
      'inputsInline': true,
      'previousStatement': null,
      'nextStatement': null,
      'colour': 290,
      'tooltip': BlocklyGames.getMsg('Pond_swimTooltip')
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
      'message0': 'stop();',
      'previousStatement': null,
      'nextStatement': null,
      'colour': 290,
      'tooltip': BlocklyGames.getMsg('Pond_stopTooltip')
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
      'message0': 'health()',
      'output': 'Number',
      'colour': 290,
      'tooltip': BlocklyGames.getMsg('Pond_healthTooltip')
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
      'message0': 'speed()',
      'output': 'Number',
      'colour': 290,
      'tooltip': BlocklyGames.getMsg('Pond_speedTooltip')
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
      'message0': 'loc_x()',
      'output': 'Number',
      'colour': 290,
      'tooltip': BlocklyGames.getMsg('Pond_locXTooltip')
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
      'message0': 'loc_y()',
      'output': 'Number',
      'colour': 290,
      'tooltip': BlocklyGames.getMsg('Pond_locYTooltip')
    });
  }
};

Blockly.JavaScript['pond_loc_y'] = function(block) {
  // Generate JavaScript for Y coordinate.
  return ['loc_y()', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};
