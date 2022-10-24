/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blocks for Turtle game.
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
 * Construct custom turtle block types.  Called on page load.
 */
export function initBlocks() {
  /**
   * Common HSV hue for all blocks in this category.
   */
  const HUE = 160;

  /**
   * Counterclockwise arrow to be appended to left turn option.
   */
  const LEFT_TURN = ' ↺';

  /**
   * Clockwise arrow to be appended to right turn option.
   */
  const RIGHT_TURN = ' ↻';

  const MOVE_OPTIONS = [
    [getMsg('Turtle.moveForward', false), 'moveForward'],
    [getMsg('Turtle.moveBackward', false), 'moveBackward'],
  ];

  const TURN_OPTIONS = [
    [getMsg('Turtle.turnRight', false), 'turnRight'],
    [getMsg('Turtle.turnLeft', false), 'turnLeft'],
  ];

  // Add arrows to turn options after prefix/suffix have been separated.
  Blockly.Extensions.register('turtle_turn_arrows',
      function() {
        const options = this.getField('DIR').getOptions();
        options[0][0] += RIGHT_TURN;
        options[1][0] += LEFT_TURN;
      });

  defineBlocksWithJsonArray([
    // Block for moving forward or backwards (external distance).
    {
      "type": "turtle_move",
      "message0": "%1%2",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "DIR",
          "options": MOVE_OPTIONS,
        },
        {
          "type": "input_value",
          "name": "VALUE",
          "check": "Number",
        },
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": HUE,
      "tooltip": getMsg('Turtle.moveTooltip', false),
    },

    // Block for moving forward or backwards (internal distance).
    {
      "type": "turtle_move_internal",
      "message0": "%1%2",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "DIR",
          "options": MOVE_OPTIONS,
        },
        {
          "type": "field_dropdown",
          "name": "VALUE",
          "options": [
            ['20', '20'],
            ['50', '50'],
            ['100', '100'],
            ['150', '150'],
          ],
        },
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": HUE,
      "tooltip": getMsg('Turtle.moveTooltip', false),
    },

    // Block for turning left or right (external angle).
    {
      "type": "turtle_turn",
      "message0": "%1%2",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "DIR",
          "options": TURN_OPTIONS,
        },
        {
          "type": "input_value",
          "name": "VALUE",
          "check": "Number",
        },
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": HUE,
      "tooltip": getMsg('Turtle.turnTooltip', false),
      "extensions": ["turtle_turn_arrows"],
    },

    // Block for turning left or right (internal angle).
    {
      "type": "turtle_turn_internal",
      "message0": "%1%2",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "DIR",
          "options": TURN_OPTIONS,
        },
        {
          "type": "field_dropdown",
          "name": "VALUE",
          "options": [
            ['1°', '1'],
            ['45°', '45'],
            ['72°', '72'],
            ['90°', '90'],
            ['120°', '120'],
            ['144°', '144'],
          ],
        },
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": HUE,
      "tooltip": getMsg('Turtle.turnTooltip', false),
      "extensions": ["turtle_turn_arrows"],
    },

    // Block for setting the width.
    {
      "type": "turtle_width",
      "message0": getMsg('Turtle.setWidth', false) + "%1",
      "args0": [
        {
          "type": "input_value",
          "name": "WIDTH",
          "check": "Number",
        },
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": HUE,
      "tooltip": getMsg('Turtle.widthTooltip', false),
    },

    // Block for pen up/down.
    {
      "type": "turtle_pen",
      "message0": "%1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "PEN",
          "options": [
            [getMsg('Turtle.penUp', false), "penUp"],
            [getMsg('Turtle.penDown', false), "penDown"],
          ]
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": HUE,
      "tooltip": getMsg('Turtle.penTooltip', false),
    },

    // Block for setting the colour (external colour).
    {
      "type": "turtle_colour",
      "message0": getMsg('Turtle.setColour', false) + "%1",
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
      "tooltip": getMsg('Turtle.colourTooltip', false),
    },

    // Block for setting the colour (internal colour).
    {
      "type": "turtle_colour_internal",
      "message0": getMsg('Turtle.setColour', false) + "%1",
      "args0": [
        {
          "type": "field_colour",
          "name": "COLOUR",
          "colour": "#ff0000",
        },
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "%{BKY_COLOUR_HUE}",
      "tooltip": getMsg('Turtle.colourTooltip', false),
    },

    // Block for changing turtle visiblity.
    {
      "type": "turtle_visibility",
      "message0": "%1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "VISIBILITY",
          "options": [
            [getMsg('Turtle.hideTurtle', false), "hideTurtle"],
            [getMsg('Turtle.showTurtle', false), "showTurtle"],
          ]
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": HUE,
      "tooltip": getMsg('Turtle.turtleVisibilityTooltip', false),
    },

    // Block for printing text.
    {
      "type": "turtle_print",
      "message0": getMsg('Turtle.print', false) + "%1",
      "args0": [
        {
          "type": "input_value",
          "name": "TEXT",
        },
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": HUE,
      "tooltip": getMsg('Turtle.printTooltip', false),
      "helpUrl": getMsg('Turtle.printHelpUrl', false),
    },

    // Block for setting the font.
    {
      "type": "turtle_font",
      "message0": `${getMsg('Turtle.font', false)}%1%2${getMsg('Turtle.fontSize', false)}%3%4%5`,
      "args0": [
        {
          "type": "field_dropdown",
          "name": "FONT",
          "options": [
            ['Arial', 'Arial'],
            ['Courier New', 'Courier New'],
            ['Georgia', 'Georgia'],
            ['Impact', 'Impact'],
            ['Times New Roman', 'Times New Roman'],
            ['Trebuchet MS', 'Trebuchet MS'],
            ['Verdana', 'Verdana'],
          ]
        },
        {
          "type": "input_dummy",
        },
        {
          "type": "field_number",
          "name": "FONTSIZE",
          "value": 18,
          "min": 1,
          "max": 1000,
        },
        {
          "type": "input_dummy",
        },
        {
          "type": "field_dropdown",
          "name": "FONTSTYLE",
          "options": [
            [getMsg('Turtle.fontNormal', false), 'normal'],
            [getMsg('Turtle.fontItalic', false), 'italic'],
            [getMsg('Turtle.fontBold', false), 'bold'],
          ],
        },
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": HUE,
      "tooltip": getMsg('Turtle.fontTooltip', false),
      "helpUrl": getMsg('Turtle.fontHelpUrl', false),
    },

    // Block for repeat n times (internal number).
    {
      "type": "turtle_repeat_internal",
      "message0": `%{BKY_CONTROLS_REPEAT_TITLE}%2%{BKY_CONTROLS_REPEAT_INPUT_DO}%3`,
      "args0": [
        {
          "type": "field_dropdown",
          "name": "TIMES",
          "options": [
            ["3", "3"],
            ["4", "4"],
            ["5", "5"],
            ["360", "360"],
          ]
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
      "colour": "%{BKY_LOOPS_HUE}",
      "tooltip": "%{BKY_CONTROLS_REPEAT_TOOLTIP}",
      "helpUrl": "%{BKY_CONTROLS_REPEAT_HELPURL}",
    },
  ]);
};

JavaScript['turtle_move'] = function(block: Block) {
  // Generate JavaScript for moving forward or backwards (external distance).
  const value = JavaScript.valueToCode(block, 'VALUE',
      JavaScript.ORDER_COMMA) || '0';
  return `${block.getFieldValue('DIR')}(${value}, 'block_id_${block.id}');\n`;
};

JavaScript['turtle_move_internal'] = function(block: Block) {
  // Generate JavaScript for moving forward or backwards (internal distance).
  const value = Number(block.getFieldValue('VALUE'));
  return `${block.getFieldValue('DIR')}(${value}, 'block_id_${block.id}');\n`;
};

JavaScript['turtle_turn'] = function(block: Block) {
  // Generate JavaScript for turning left or right (external angle).
  const value = JavaScript.valueToCode(block, 'VALUE',
      JavaScript.ORDER_COMMA) || '0';
  return `${block.getFieldValue('DIR')}(${value}, 'block_id_${block.id}');\n`;
};

JavaScript['turtle_turn_internal'] = function(block: Block) {
  // Generate JavaScript for turning left or right (internal angle).
  const value = Number(block.getFieldValue('VALUE'));
  return `${block.getFieldValue('DIR')}(${value}, 'block_id_${block.id}');\n`;
};

JavaScript['turtle_width'] = function(block: Block) {
  // Generate JavaScript for setting the width.
  const width = JavaScript.valueToCode(block, 'WIDTH',
      JavaScript.ORDER_COMMA) || '1';
  return `penWidth(${width}, 'block_id_${block.id}');\n`;
};

JavaScript['turtle_pen'] = function(block: Block) {
  // Generate JavaScript for pen up/down.
  return `${block.getFieldValue('PEN')}('block_id_${block.id}');\n`;
};

JavaScript['turtle_colour'] = function(block: Block) {
  // Generate JavaScript for setting the colour (external colour).
  const colour = JavaScript.valueToCode(block, 'COLOUR',
      JavaScript.ORDER_COMMA) || '\'#000000\'';
  return `penColour(${colour}, 'block_id_${block.id}');\n`;
};

JavaScript['turtle_colour_internal'] = function(block: Block) {
  // Generate JavaScript for setting the colour (internal colour).
  const colour = JSON.stringify(block.getFieldValue('COLOUR'));
  return `penColour(${colour}, 'block_id_${block.id}');\n`;
};

JavaScript['turtle_visibility'] = function(block: Block) {
  // Generate JavaScript for changing turtle visibility.
  return `${block.getFieldValue('VISIBILITY')}('block_id_${block.id}');\n`;
};

JavaScript['turtle_print'] = function(block: Block) {
  // Generate JavaScript for printing text.
  const text = String(JavaScript.valueToCode(block, 'TEXT',
      JavaScript.ORDER_COMMA) || '\'\'');
  return `print(${text}, 'block_id_${block.id}');\n`;
};

JavaScript['turtle_font'] = function(block: Block) {
  // Generate JavaScript for setting the font.
  const font = JSON.stringify(block.getFieldValue('FONT'));
  const fontSize = Number(block.getFieldValue('FONTSIZE'));
  const fontStyle = JSON.stringify(block.getFieldValue('FONTSTYLE'));
  return `font(${font}, ${fontSize}, ${fontStyle}, 'block_id_${block.id}');\n`;
};

JavaScript['turtle_repeat_internal'] =
    JavaScript['controls_repeat'];
