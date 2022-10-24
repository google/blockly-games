/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blocks for Movie game.
 * @author fraser@google.com (Neil Fraser)
 */
import {getMsg} from '../../src/lib-games.js';

import {defineBlocksWithJsonArray} from '../../third-party/blockly/core/blockly.js';
import type {Block} from '../../third-party/blockly/core/block.js';
import type {Generator} from '../../third-party/blockly/core/generator.js';
import {javascriptGenerator} from '../../third-party/blockly/generators/javascript.js';
// Convince TypeScript that Blockly's JS generator is not an ES6 Generator.
const JavaScript = javascriptGenerator as any as Generator;
// TODO: fix type of JavaScript.


/**
 * Construct custom movie block types.  Called on page load.
 */
export function initBlocks() {
  /**
   * Common HSV hue for all shape blocks.
   */
  const SHAPE_HUE = 160;

  /**
   * Create a value input, numeric, right-aligned.
   * @param {string} name Name of input.
   * @returns {!Object} JSON structure for value input.
   */
  function inputFactory(name: string): object {
    return {
      "type": "input_value",
      "name": name,
      "check": "Number",
      "align": "RIGHT",
    };
  }

  defineBlocksWithJsonArray([
    // Block for drawing a circle.
    {
      "type": "movie_circle",
      "message0": `${getMsg('Movie.circleDraw', false)} ${getMsg('Movie.x', false)}%1${getMsg('Movie.y', false)}%2${getMsg('Movie.radius', false)}%3`,
      "args0": [
        inputFactory('X'),
        inputFactory('Y'),
        inputFactory('RADIUS'),
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": SHAPE_HUE,
      "tooltip": getMsg('Movie.circleTooltip', false),
    },

    // Block for drawing a rectangle.
    {
      "type": "movie_rect",
      "message0": `${getMsg('Movie.rectDraw', false)} ${getMsg('Movie.x', false)}%1${getMsg('Movie.y', false)}%2${getMsg('Movie.width', false)}%3${getMsg('Movie.height', false)}%4`,
      "args0": [
        inputFactory('X'),
        inputFactory('Y'),
        inputFactory('WIDTH'),
        inputFactory('HEIGHT'),
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": SHAPE_HUE,
      "tooltip": getMsg('Movie.rectTooltip', false),
    },

    // Block for drawing a line.
    {
      "type": "movie_line",
      "message0": `${getMsg('Movie.lineDraw', false)} ${getMsg('Movie.x1', false)}%1${getMsg('Movie.y1', false)}%2${getMsg('Movie.x2', false)}%3${getMsg('Movie.y2', false)}%4${getMsg('Movie.width', false)}%5`,
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
      "tooltip": getMsg('Movie.lineTooltip', false),
    },

    // Block for getting the current time value.
    {
      "type": "movie_time",
      "message0": "time (0→100)",
      "output": null,
      "colour": "%{BKY_VARIABLES_HUE}",
      "tooltip": getMsg('Movie.timeTooltip', false),
    },

    // Block for setting the colour.
    {
      "type": "movie_colour",
      "message0": getMsg('Movie.setColour', false) + "%1",
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
      "tooltip": getMsg('Movie.colourTooltip', false),
    },
  ]);
};

JavaScript['movie_circle'] = function(block: Block) {
  // Generate JavaScript for drawing a circle.
  const x = JavaScript.valueToCode(block, 'X',
      JavaScript.ORDER_COMMA) || '0';
  const y = JavaScript.valueToCode(block, 'Y',
      JavaScript.ORDER_COMMA) || '0';
  const radius = JavaScript.valueToCode(block, 'RADIUS',
      JavaScript.ORDER_COMMA) || '0';
  return `circle(${x}, ${y}, ${radius});\n`;
};

JavaScript['movie_rect'] = function(block: Block) {
  // Generate JavaScript for drawing a rectangle.
  const x = JavaScript.valueToCode(block, 'X',
      JavaScript.ORDER_COMMA) || '0';
  const y = JavaScript.valueToCode(block, 'Y',
      JavaScript.ORDER_COMMA) || '0';
  const width = JavaScript.valueToCode(block, 'WIDTH',
      JavaScript.ORDER_COMMA) || '0';
  const height = JavaScript.valueToCode(block, 'HEIGHT',
      JavaScript.ORDER_COMMA) || '0';
  return `rect(${x}, ${y}, ${width}, ${height});\n`;
};

JavaScript['movie_line'] = function(block: Block) {
  // Generate JavaScript for drawing a line.
  const x1 = JavaScript.valueToCode(block, 'X1',
      JavaScript.ORDER_COMMA) || '0';
  const y1 = JavaScript.valueToCode(block, 'Y1',
      JavaScript.ORDER_COMMA) || '0';
  const x2 = JavaScript.valueToCode(block, 'X2',
      JavaScript.ORDER_COMMA) || '0';
  const y2 = JavaScript.valueToCode(block, 'Y2',
      JavaScript.ORDER_COMMA) || '0';
  const width = JavaScript.valueToCode(block, 'WIDTH',
      JavaScript.ORDER_COMMA) || '0';
  return `line(${x1}, ${y1}, ${x2}, ${y2}, ${width});\n`;
};

JavaScript['movie_time'] = function(block: Block) {
  // Generate JavaScript for getting the current time value.
  return ['time()', JavaScript.ORDER_ATOMIC];
};

JavaScript['movie_colour'] = function(block: Block) {
  // Generate JavaScript for setting the colour.
  const colour = JavaScript.valueToCode(block, 'COLOUR',
      JavaScript.ORDER_NONE) || '\'#000000\'';
  return `penColour(${colour});\n`;
};
