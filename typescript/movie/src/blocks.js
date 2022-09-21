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
goog.require('BlocklyGames');


/**
 * Construct custom movie block types.  Called on page load.
 */
Movie.Blocks.init = function() {
  /**
   * Common HSV hue for all shape blocks.
   */
  const SHAPE_HUE = 160;

  /**
   * Create a value input, numeric, right-aligned.
   * @param {string} name Name of input.
   * @returns {!Object} JSON structure for value input.
   */
  function inputFactory(name) {
    return {
      "type": "input_value",
      "name": name,
      "check": "Number",
      "align": "RIGHT",
    };
  }

  Blockly.defineBlocksWithJsonArray([
    // Block for drawing a circle.
    {
      "type": "movie_circle",
      "message0": `${BlocklyGames.getMsg('Movie.circleDraw', false)} ${BlocklyGames.getMsg('Movie.x', false)}%1${BlocklyGames.getMsg('Movie.y', false)}%2${BlocklyGames.getMsg('Movie.radius', false)}%3`,
      "args0": [
        inputFactory('X'),
        inputFactory('Y'),
        inputFactory('RADIUS'),
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": SHAPE_HUE,
      "tooltip": BlocklyGames.getMsg('Movie.circleTooltip', false),
    },

    // Block for drawing a rectangle.
    {
      "type": "movie_rect",
      "message0": `${BlocklyGames.getMsg('Movie.rectDraw', false)} ${BlocklyGames.getMsg('Movie.x', false)}%1${BlocklyGames.getMsg('Movie.y', false)}%2${BlocklyGames.getMsg('Movie.width', false)}%3${BlocklyGames.getMsg('Movie.height', false)}%4`,
      "args0": [
        inputFactory('X'),
        inputFactory('Y'),
        inputFactory('WIDTH'),
        inputFactory('HEIGHT'),
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": SHAPE_HUE,
      "tooltip": BlocklyGames.getMsg('Movie.rectTooltip', false),
    },

    // Block for drawing a line.
    {
      "type": "movie_line",
      "message0": `${BlocklyGames.getMsg('Movie.lineDraw', false)} ${BlocklyGames.getMsg('Movie.x1', false)}%1${BlocklyGames.getMsg('Movie.y1', false)}%2${BlocklyGames.getMsg('Movie.x2', false)}%3${BlocklyGames.getMsg('Movie.y2', false)}%4${BlocklyGames.getMsg('Movie.width', false)}%5`,
      "args0": [
        inputFactory('X1'),
        inputFactory('Y1'),
        inputFactory('X2'),
        inputFactory('Y2'),
        inputFactory('WIDTH'),
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": SHAPE_HUE,
      "tooltip": BlocklyGames.getMsg('Movie.lineTooltip', false),
    },

    // Block for getting the current time value.
    {
      "type": "movie_time",
      "message0": "time (0→100)",
      "output": null,
      "colour": "%{BKY_VARIABLES_HUE}",
      "tooltip": BlocklyGames.getMsg('Movie.timeTooltip', false),
    },

    // Block for setting the colour.
    {
      "type": "movie_colour",
      "message0": BlocklyGames.getMsg('Movie.setColour', false) + "%1",
      "args0": [
        {
          "type": "input_value",
          "name": "COLOUR",
          "check": "Colour"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "%{BKY_COLOUR_HUE}",
      "tooltip": BlocklyGames.getMsg('Movie.colourTooltip', false),
    },
  ]);
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

Blockly.JavaScript['movie_time'] = function(block) {
  // Generate JavaScript for getting the current time value.
  return ['time()', Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['movie_colour'] = function(block) {
  // Generate JavaScript for setting the colour.
  const colour = Blockly.JavaScript.valueToCode(block, 'COLOUR',
      Blockly.JavaScript.ORDER_NONE) || '\'#000000\'';
  return `penColour(${colour});\n`;
};
