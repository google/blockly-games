/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blocks for Movie game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Movie.Blocks');

goog.require('Blockly');
goog.require('Blockly.Constants.Colour');
goog.require('Blockly.Constants.Lists');
goog.require('Blockly.Constants.Logic');
goog.require('Blockly.Constants.Loops');
goog.require('Blockly.Constants.Math');
goog.require('Blockly.Blocks.procedures');
goog.require('Blockly.Constants.Variables');
goog.require('Blockly.JavaScript');
goog.require('Blockly.JavaScript.colour');
goog.require('Blockly.JavaScript.lists');
goog.require('Blockly.JavaScript.logic');
goog.require('Blockly.JavaScript.loops');
goog.require('Blockly.JavaScript.math');
goog.require('Blockly.JavaScript.procedures');
goog.require('Blockly.JavaScript.variables');
goog.require('Blockly.Msg');
goog.require('BlocklyGames');


/**
 * Common HSV hue for all shape blocks.
 */
Movie.Blocks.SHAPE_HUE = 160;

// Extensions to Blockly's existing blocks and JavaScript generator.

Blockly.Blocks['movie_circle'] = {
  /**
   * Block for drawing a circle.
   * @this {Blockly.Block}
   */
  init: function() {
    this.setColour(Movie.Blocks.SHAPE_HUE);
    this.appendValueInput('X')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Movie.circleDraw', false))
        .appendField(BlocklyGames.getMsg('Movie.x', false));
    this.appendValueInput('Y')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Movie.y', false));
    this.appendValueInput('RADIUS')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Movie.radius', false));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Movie.circleTooltip', false));
  }
};

Blockly.JavaScript['movie_circle'] = function(block) {
  // Generate JavaScript for drawing a circle.
  const x = Blockly.JavaScript.valueToCode(block, 'X',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  const y = Blockly.JavaScript.valueToCode(block, 'Y',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  const radius = Blockly.JavaScript.valueToCode(block, 'RADIUS',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  return `circle(${x}, ${y}, ${radius});\n`;
};

Blockly.Blocks['movie_rect'] = {
  /**
   * Block for drawing a rectangle.
   * @this {Blockly.Block}
   */
  init: function() {
    this.setColour(Movie.Blocks.SHAPE_HUE);
    this.appendValueInput('X')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Movie.rectDraw', false))
        .appendField(BlocklyGames.getMsg('Movie.x', false));
    this.appendValueInput('Y')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Movie.y', false));
    this.appendValueInput('WIDTH')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Movie.width', false));
    this.appendValueInput('HEIGHT')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Movie.height', false));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Movie.rectTooltip', false));
  }
};

Blockly.JavaScript['movie_rect'] = function(block) {
  // Generate JavaScript for drawing a rectangle.
  const x = Blockly.JavaScript.valueToCode(block, 'X',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  const y = Blockly.JavaScript.valueToCode(block, 'Y',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  const width = Blockly.JavaScript.valueToCode(block, 'WIDTH',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  const height = Blockly.JavaScript.valueToCode(block, 'HEIGHT',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  return `rect(${x}, ${y}, ${width}, ${height});\n`;
};

Blockly.Blocks['movie_line'] = {
  /**
   * Block for drawing a line.
   * @this {Blockly.Block}
   */
  init: function() {
    this.setColour(Movie.Blocks.SHAPE_HUE);
    this.appendValueInput('X1')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Movie.lineDraw', false))
        .appendField(BlocklyGames.getMsg('Movie.x1', false));
    this.appendValueInput('Y1')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Movie.y1', false));
    this.appendValueInput('X2')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Movie.x2', false));
    this.appendValueInput('Y2')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Movie.y2', false));
    this.appendValueInput('WIDTH')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Movie.width', false));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Movie.rectTooltip', false));
  }
};

Blockly.JavaScript['movie_line'] = function(block) {
  // Generate JavaScript for drawing a line.
  const x1 = Blockly.JavaScript.valueToCode(block, 'X1',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  const y1 = Blockly.JavaScript.valueToCode(block, 'Y1',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  const x2 = Blockly.JavaScript.valueToCode(block, 'X2',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  const y2 = Blockly.JavaScript.valueToCode(block, 'Y2',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  const width = Blockly.JavaScript.valueToCode(block, 'WIDTH',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  return `line(${x1}, ${y1}, ${x2}, ${y2}, ${width});\n`;
};

Blockly.Blocks['movie_time'] = {
  /**
   * Block for getting the current time value.
   * @this {Blockly.Block}
   */
  init: function() {
    this.setColour(Blockly.Msg['VARIABLES_HUE']);
    this.appendDummyInput()
        .appendField('time (0→100)');
    this.setOutput(true, 'Number');
    this.setTooltip(BlocklyGames.getMsg('Movie.timeTooltip', false));
  }
};

Blockly.JavaScript['movie_time'] = function(block) {
  // Generate JavaScript for getting the current time value.
  const code = 'time()';
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['movie_colour'] = {
  /**
   * Block for setting the colour.
   * @this {Blockly.Block}
   */
  init: function() {
    this.setColour(Blockly.Msg['COLOUR_HUE']);
    this.appendValueInput('COLOUR')
        .setCheck('Colour')
        .appendField(BlocklyGames.getMsg('Movie.setColour', false));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Movie.colourTooltip', false));
  }
};

Blockly.JavaScript['movie_colour'] = function(block) {
  // Generate JavaScript for setting the colour.
  const colour = Blockly.JavaScript.valueToCode(block, 'COLOUR',
      Blockly.JavaScript.ORDER_NONE) || '\'#000000\'';
  return `penColour(${colour});\n`;
};
