/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blocks for Maze game.
 * @author fraser@google.com (Neil Fraser)
 */
import {getMsg} from '../../src/lib-games.js';

import type {Block} from '../../third-party/blockly/core/block.js';
import type {Generator} from '../../third-party/blockly/core/generator.js';
import {javascriptGenerator} from '../../third-party/blockly/generators/javascript.js';
// Convince TypeScript that Blockly's JS generator is not an ES6 Generator.
const JavaScript = javascriptGenerator as any as Generator;


/**
 * Construct custom maze block types.  Called on page load.
 */
export function initBlocks() {
  /**
   * Common HSV hue for all movement blocks.
   */
  const MOVEMENT_HUE = 290;

  /**
   * HSV hue for loop block.
   */
  const LOOPS_HUE = 120;

  /**
   * Common HSV hue for all logic blocks.
   */
  const LOGIC_HUE = 210;

  /**
   * Counterclockwise arrow to be appended to left turn option.
   */
  const LEFT_TURN = ' ↺';

  /**
   * Clockwise arrow to be appended to right turn option.
   */
  const RIGHT_TURN = ' ↻';

  const TURN_DIRECTIONS = [
    [getMsg('Maze.turnLeft', false), 'turnLeft'],
    [getMsg('Maze.turnRight', false), 'turnRight'],
  ];

  const PATH_DIRECTIONS = [
    [getMsg('Maze.pathAhead', false), 'isPathForward'],
    [getMsg('Maze.pathLeft', false), 'isPathLeft'],
    [getMsg('Maze.pathRight', false), 'isPathRight'],
  ];

  // Add arrows to turn options after prefix/suffix have been separated.
  Blockly.Extensions.register('maze_turn_arrows',
      function() {
        const options = this.getField('DIR').getOptions();
        options[options.length - 2][0] += LEFT_TURN;
        options[options.length - 1][0] += RIGHT_TURN;
      });

  Blockly.defineBlocksWithJsonArray([
    // Block for moving forward.
    {
      "type": "maze_moveForward",
      "message0": getMsg('Maze.moveForward', false),
      "previousStatement": null,
      "nextStatement": null,
      "colour": MOVEMENT_HUE,
      "tooltip": getMsg('Maze.moveForwardTooltip', false),
    },

    // Block for turning left or right.
    {
      "type": "maze_turn",
      "message0": "%1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "DIR",
          "options": TURN_DIRECTIONS,
        },
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": MOVEMENT_HUE,
      "tooltip": getMsg('Maze.turnTooltip', false),
      "extensions": ["maze_turn_arrows"],
    },

    // Block for conditional "if there is a path".
    {
      "type": "maze_if",
      "message0": `%1%2${getMsg('Maze.doCode', false)}%3`,
      "args0": [
        {
          "type": "field_dropdown",
          "name": "DIR",
          "options": PATH_DIRECTIONS,
        },
        {
          "type": "input_dummy",
        },
        {
          "type": "input_statement",
          "name": "DO",
        },
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": LOGIC_HUE,
      "tooltip": getMsg('Maze.ifTooltip', false),
      "extensions": ["maze_turn_arrows"],
    },

    // Block for conditional "if there is a path, else".
    {
      "type": "maze_ifElse",
      "message0": `%1%2${getMsg('Maze.doCode', false)}%3${getMsg('Maze.elseCode', false)}%4`,
      "args0": [
        {
          "type": "field_dropdown",
          "name": "DIR",
          "options": PATH_DIRECTIONS,
        },
        {
          "type": "input_dummy",
        },
        {
          "type": "input_statement",
          "name": "DO",
        },
        {
          "type": "input_statement",
          "name": "ELSE",
        },
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": LOGIC_HUE,
      "tooltip": getMsg('Maze.ifelseTooltip', false),
      "extensions": ["maze_turn_arrows"],
    },

    // Block for repeat loop.
    {
      "type": "maze_forever",
      "message0": `${getMsg('Maze.repeatUntil', false)}%1%2${getMsg('Maze.doCode', false)}%3`,
      "args0": [
        {
          "type": "field_image",
          "src": "maze/marker.png",
          "width": 12,
          "height": 16,
        },
        {
          "type": "input_dummy",
        },
        {
          "type": "input_statement",
          "name": "DO",
        }
      ],
      "previousStatement": null,
      "colour": LOOPS_HUE,
      "tooltip": getMsg('Maze.whileTooltip', false),
    },
  ]);
}


JavaScript['maze_moveForward'] = function(block: Block) {
  // Generate JavaScript for moving forward.
  return `moveForward('block_id_${block.id}');\n`;
};

JavaScript['maze_turn'] = function(block: Block) {
  // Generate JavaScript for turning left or right.
  return `${block.getFieldValue('DIR')}('block_id_${block.id}');\n`;
};

JavaScript['maze_if'] = function(block: Block) {
  // Generate JavaScript for conditional "if there is a path".
  const argument = `${block.getFieldValue('DIR')}('block_id_${block.id}')`;
  const branch = JavaScript.statementToCode(block, 'DO');
  return `if (${argument}) {\n${branch}}\n`;
};

JavaScript['maze_ifElse'] = function(block: Block) {
  // Generate JavaScript for conditional "if there is a path, else".
  const argument = `${block.getFieldValue('DIR')}('block_id_${block.id}')`;
  const branch0 = JavaScript.statementToCode(block, 'DO');
  const branch1 = JavaScript.statementToCode(block, 'ELSE');
  return `if (${argument}) {\n${branch0}} else {\n${branch1}}\n`;
};

JavaScript['maze_forever'] = function(block: Block) {
  // Generate JavaScript for repeat loop.
  let branch = JavaScript.statementToCode(block, 'DO');
  if (JavaScript.INFINITE_LOOP_TRAP) {
    branch = JavaScript.INFINITE_LOOP_TRAP.replace(/%1/g,
        `'block_id_${block.id}'`) + branch;
  }
  return `while (notDone()) {\n${branch}}\n`;
};
