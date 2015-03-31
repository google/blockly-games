/**
 * Blockly Games: Movie Blocks
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Blocks for Blockly's Movie application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Movie.Blocks');

goog.require('Blockly');
goog.require('Blockly.JavaScript');
goog.require('Blockly.Blocks.colour');
goog.require('Blockly.JavaScript.colour');
goog.require('Blockly.Blocks.lists');
goog.require('Blockly.JavaScript.lists');
goog.require('Blockly.Blocks.logic');
goog.require('Blockly.JavaScript.logic');
goog.require('Blockly.Blocks.loops');
goog.require('Blockly.JavaScript.loops');
goog.require('Blockly.Blocks.math');
goog.require('Blockly.JavaScript.math');
goog.require('Blockly.Blocks.procedures');
goog.require('Blockly.JavaScript.procedures');
goog.require('Blockly.Blocks.texts');
goog.require('Blockly.JavaScript.texts');
goog.require('Blockly.Blocks.variables');
goog.require('Blockly.JavaScript.variables');
goog.require('BlocklyGames');

// Extensions to Blockly's language and JavaScript generator.

Blockly.Blocks['movie_circle'] = {
  /**
   * Block for drawing a circle.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(160);
    this.appendValueInput('X')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Movie_circleDraw'))
        .appendField(BlocklyGames.getMsg('Movie_x'));
    this.appendValueInput('Y')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Movie_y'));
    this.appendValueInput('RADIUS')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Movie_radius'));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Movie_circleTooltip'));
  }
};

Blockly.JavaScript['movie_circle'] = function(block) {
  // Generate JavaScript for drawing a circle.
  var x = Blockly.JavaScript.valueToCode(block, 'X',
      Blockly.JavaScript.ORDER_NONE) || '0';
  var y = Blockly.JavaScript.valueToCode(block, 'Y',
      Blockly.JavaScript.ORDER_NONE) || '0';
  var radius = Blockly.JavaScript.valueToCode(block, 'RADIUS',
      Blockly.JavaScript.ORDER_NONE) || '0';
  return 'circle(' + x + ', ' + y + ', ' + radius + ');\n';
};

Blockly.Blocks['movie_rect'] = {
  /**
   * Block for drawing a rectangle.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(160);
    this.appendValueInput('X')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Movie_rectDraw'))
        .appendField(BlocklyGames.getMsg('Movie_x'));
    this.appendValueInput('Y')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Movie_y'));
    this.appendValueInput('WIDTH')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Movie_width'));
    this.appendValueInput('HEIGHT')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Movie_height'));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Movie_rectTooltip'));
  }
};

Blockly.JavaScript['movie_rect'] = function(block) {
  // Generate JavaScript for drawing a rectangle.
  var x = Blockly.JavaScript.valueToCode(block, 'X',
      Blockly.JavaScript.ORDER_NONE) || '0';
  var y = Blockly.JavaScript.valueToCode(block, 'Y',
      Blockly.JavaScript.ORDER_NONE) || '0';
  var width = Blockly.JavaScript.valueToCode(block, 'WIDTH',
      Blockly.JavaScript.ORDER_NONE) || '0';
  var height = Blockly.JavaScript.valueToCode(block, 'HEIGHT',
      Blockly.JavaScript.ORDER_NONE) || '0';
  return 'rect(' + x + ', ' + y + ', ' + width + ', ' + height + ');\n';
};

Blockly.Blocks['movie_line'] = {
  /**
   * Block for drawing a line.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(160);
    this.appendValueInput('X1')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Movie_lineDraw'))
        .appendField(BlocklyGames.getMsg('Movie_x1'));
    this.appendValueInput('Y1')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Movie_y1'));
    this.appendValueInput('X2')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Movie_x2'));
    this.appendValueInput('Y2')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Movie_y2'));
    this.appendValueInput('WIDTH')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Movie_width'));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Movie_rectTooltip'));
  }
};

Blockly.JavaScript['movie_line'] = function(block) {
  // Generate JavaScript for drawing a line.
  var x1 = Blockly.JavaScript.valueToCode(block, 'X1',
      Blockly.JavaScript.ORDER_NONE) || '0';
  var y1 = Blockly.JavaScript.valueToCode(block, 'Y1',
      Blockly.JavaScript.ORDER_NONE) || '0';
  var x2 = Blockly.JavaScript.valueToCode(block, 'X2',
      Blockly.JavaScript.ORDER_NONE) || '0';
  var y2 = Blockly.JavaScript.valueToCode(block, 'Y2',
      Blockly.JavaScript.ORDER_NONE) || '0';
  var width = Blockly.JavaScript.valueToCode(block, 'WIDTH',
      Blockly.JavaScript.ORDER_NONE) || '0';
  return 'line(' + x1 + ', ' + y1 + ', ' + x2 + ', ' + y2 + ', ' +
      width + ');\n';
};


Blockly.Blocks['movie_time'] = {
  /**
   * Block for getting the current time value.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(330);
    this.appendDummyInput()
        .appendField('time (0\u2192100)');
    this.setOutput(true, 'Number');
    this.setTooltip(BlocklyGames.getMsg('Movie_timeTooltip'));
  }
};

Blockly.JavaScript['movie_time'] = function(block) {
  // Generate JavaScript for getting the current time value.
  var code = 'time()';
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['movie_colour'] = {
  /**
   * Block for setting the colour.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(20);
    this.appendValueInput('COLOUR')
        .setCheck('Colour')
        .appendField(BlocklyGames.getMsg('Movie_setColour'));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Movie_colourTooltip'));
  }
};

Blockly.JavaScript['movie_colour'] = function(block) {
  // Generate JavaScript for setting the colour.
  var colour = Blockly.JavaScript.valueToCode(block, 'COLOUR',
      Blockly.JavaScript.ORDER_NONE) || '\'#000000\'';
  return 'penColour(' + colour + ');\n';
};
