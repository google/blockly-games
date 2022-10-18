/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blocks for Turtle game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Turtle.Blocks');

goog.require('Blockly');
goog.require('Blockly.Constants.Colour');
goog.require('Blockly.Constants.Lists');
goog.require('Blockly.Constants.Logic');
goog.require('Blockly.Constants.Loops');
goog.require('Blockly.Constants.Math');
goog.require('Blockly.Blocks.procedures');
goog.require('Blockly.Constants.Text');
goog.require('Blockly.Constants.Variables');
goog.require('Blockly.Extensions');
goog.require('Blockly.FieldColour');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.JavaScript');
goog.require('Blockly.JavaScript.colour');
goog.require('Blockly.JavaScript.lists');
goog.require('Blockly.JavaScript.logic');
goog.require('Blockly.JavaScript.loops');
goog.require('Blockly.JavaScript.math');
goog.require('Blockly.JavaScript.procedures');
goog.require('Blockly.JavaScript.texts');
goog.require('Blockly.JavaScript.variables');
goog.require('BlocklyGames');


/**
 * Construct custom turtle block types.  Called on page load.
 */
Turtle.Blocks.init = function() {
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
    [BlocklyGames.getMsg('Turtle.moveForward', false), 'moveForward'],
    [BlocklyGames.getMsg('Turtle.moveBackward', false), 'moveBackward'],
  ];

  const TURN_OPTIONS = [
    [BlocklyGames.getMsg('Turtle.turnRight', false), 'turnRight'],
    [BlocklyGames.getMsg('Turtle.turnLeft', false), 'turnLeft'],
  ];

  // Add arrows to turn options after prefix/suffix have been separated.
  Blockly.Extensions.register('turtle_turn_arrows',
      function() {
        const options = this.getField('DIR').getOptions();
        options[0][0] += RIGHT_TURN;
        options[1][0] += LEFT_TURN;
      });

  Blockly.defineBlocksWithJsonArray([
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
      "tooltip": BlocklyGames.getMsg('Turtle.moveTooltip', false),
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
      "tooltip": BlocklyGames.getMsg('Turtle.moveTooltip', false),
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
      "tooltip": BlocklyGames.getMsg('Turtle.turnTooltip', false),
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
      "tooltip": BlocklyGames.getMsg('Turtle.turnTooltip', false),
      "extensions": ["turtle_turn_arrows"],
    },

    // Block for setting the width.
    {
      "type": "turtle_width",
      "message0": BlocklyGames.getMsg('Turtle.setWidth', false) + "%1",
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
      "tooltip": BlocklyGames.getMsg('Turtle.widthTooltip', false),
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
            [BlocklyGames.getMsg('Turtle.penUp', false), "penUp"],
            [BlocklyGames.getMsg('Turtle.penDown', false), "penDown"],
          ]
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": HUE,
      "tooltip": BlocklyGames.getMsg('Turtle.penTooltip', false),
    },

    // Block for setting the colour (external colour).
    {
      "type": "turtle_colour",
      "message0": BlocklyGames.getMsg('Turtle.setColour', false) + "%1",
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
      "tooltip": BlocklyGames.getMsg('Turtle.colourTooltip', false),
    },

    // Block for setting the colour (internal colour).
    {
      "type": "turtle_colour_internal",
      "message0": BlocklyGames.getMsg('Turtle.setColour', false) + "%1",
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
      "tooltip": BlocklyGames.getMsg('Turtle.colourTooltip', false),
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
            [BlocklyGames.getMsg('Turtle.hideTurtle', false), "hideTurtle"],
            [BlocklyGames.getMsg('Turtle.showTurtle', false), "showTurtle"],
          ]
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": HUE,
      "tooltip": BlocklyGames.getMsg('Turtle.turtleVisibilityTooltip', false),
    },

    // Block for printing text.
    {
      "type": "turtle_print",
      "message0": BlocklyGames.getMsg('Turtle.print', false) + "%1",
      "args0": [
        {
          "type": "input_value",
          "name": "TEXT",
        },
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": HUE,
      "tooltip": BlocklyGames.getMsg('Turtle.printTooltip', false),
      "helpUrl": BlocklyGames.getMsg('Turtle.printHelpUrl', false),
    },

    // Block for setting the font.
    {
      "type": "turtle_font",
      "message0": `${BlocklyGames.getMsg('Turtle.font', false)}%1%2${BlocklyGames.getMsg('Turtle.fontSize', false)}%3%4%5`,
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
            [BlocklyGames.getMsg('Turtle.fontNormal', false), 'normal'],
            [BlocklyGames.getMsg('Turtle.fontItalic', false), 'italic'],
            [BlocklyGames.getMsg('Turtle.fontBold', false), 'bold'],
          ],
        },
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": HUE,
      "tooltip": BlocklyGames.getMsg('Turtle.fontTooltip', false),
      "helpUrl": BlocklyGames.getMsg('Turtle.fontHelpUrl', false),
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

Blockly.JavaScript['turtle_move'] = function(block) {
  // Generate JavaScript for moving forward or backwards (external distance).
  const value = Blockly.JavaScript.valueToCode(block, 'VALUE',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  return `${block.getFieldValue('DIR')}(${value}, 'block_id_${block.id}');\n`;
};

Blockly.JavaScript['turtle_move_internal'] = function(block) {
  // Generate JavaScript for moving forward or backwards (internal distance).
  const value = Number(block.getFieldValue('VALUE'));
  return `${block.getFieldValue('DIR')}(${value}, 'block_id_${block.id}');\n`;
};

Blockly.JavaScript['turtle_turn'] = function(block) {
  // Generate JavaScript for turning left or right (external angle).
  const value = Blockly.JavaScript.valueToCode(block, 'VALUE',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  return `${block.getFieldValue('DIR')}(${value}, 'block_id_${block.id}');\n`;
};

Blockly.JavaScript['turtle_turn_internal'] = function(block) {
  // Generate JavaScript for turning left or right (internal angle).
  const value = Number(block.getFieldValue('VALUE'));
  return `${block.getFieldValue('DIR')}(${value}, 'block_id_${block.id}');\n`;
};

Blockly.JavaScript['turtle_width'] = function(block) {
  // Generate JavaScript for setting the width.
  const width = Blockly.JavaScript.valueToCode(block, 'WIDTH',
      Blockly.JavaScript.ORDER_COMMA) || '1';
  return `penWidth(${width}, 'block_id_${block.id}');\n`;
};

Blockly.JavaScript['turtle_pen'] = function(block) {
  // Generate JavaScript for pen up/down.
  return `${block.getFieldValue('PEN')}('block_id_${block.id}');\n`;
};

Blockly.JavaScript['turtle_colour'] = function(block) {
  // Generate JavaScript for setting the colour (external colour).
  const colour = Blockly.JavaScript.valueToCode(block, 'COLOUR',
      Blockly.JavaScript.ORDER_COMMA) || '\'#000000\'';
  return `penColour(${colour}, 'block_id_${block.id}');\n`;
};

Blockly.JavaScript['turtle_colour_internal'] = function(block) {
  // Generate JavaScript for setting the colour (internal colour).
  const colour = Blockly.JavaScript.quote_(block.getFieldValue('COLOUR'));
  return `penColour(${colour}, 'block_id_${block.id}');\n`;
};

Blockly.JavaScript['turtle_visibility'] = function(block) {
  // Generate JavaScript for changing turtle visibility.
  return `${block.getFieldValue('VISIBILITY')}('block_id_${block.id}');\n`;
};

Blockly.JavaScript['turtle_print'] = function(block) {
  // Generate JavaScript for printing text.
  const text = String(Blockly.JavaScript.valueToCode(block, 'TEXT',
      Blockly.JavaScript.ORDER_COMMA) || '\'\'');
  return `print(${text}, 'block_id_${block.id}');\n`;
};

Blockly.JavaScript['turtle_font'] = function(block) {
  // Generate JavaScript for setting the font.
  const font = Blockly.JavaScript.quote_(block.getFieldValue('FONT'));
  const fontSize = Number(block.getFieldValue('FONTSIZE'));
  const fontStyle = Blockly.JavaScript.quote_(block.getFieldValue('FONTSTYLE'));
  return `font(${font}, ${fontSize}, ${fontStyle}, 'block_id_${block.id}');\n`;
};

Blockly.JavaScript['turtle_repeat_internal'] =
    Blockly.JavaScript['controls_repeat'];
