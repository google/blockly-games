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
goog.require('Blockly.Msg');
goog.require('BlocklyGames');
goog.require('BlocklyGames.Msg');


/**
 * Common HSV hue for all blocks in this category.
 */
Turtle.Blocks.HUE = 160;

/**
 * Left turn arrow to be appended to messages.
 */
Turtle.Blocks.LEFT_TURN = ' \u21BA';

/**
 * Left turn arrow to be appended to messages.
 */
Turtle.Blocks.RIGHT_TURN = ' \u21BB';

// Extensions to Blockly's existing blocks and JavaScript generator.

Blockly.Blocks['turtle_move'] = {
  /**
   * Block for moving forward or backwards.
   * @this {Blockly.Block}
   */
  init: function() {
    const DIRECTIONS =
        [[BlocklyGames.Msg['Turtle.moveForward'], 'moveForward'],
         [BlocklyGames.Msg['Turtle.moveBackward'], 'moveBackward']];
    this.setColour(Turtle.Blocks.HUE);
    this.appendValueInput('VALUE')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.Msg['Turtle.moveTooltip']);
  }
};

Blockly.JavaScript['turtle_move'] = function(block) {
  // Generate JavaScript for moving forward or backwards.
  const value = Blockly.JavaScript.valueToCode(block, 'VALUE',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  return block.getFieldValue('DIR') +
      '(' + value + ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['turtle_move_internal'] = {
  /**
   * Block for moving forward or backwards.
   * @this {Blockly.Block}
   */
  init: function() {
    const DIRECTIONS =
        [[BlocklyGames.Msg['Turtle.moveForward'], 'moveForward'],
         [BlocklyGames.Msg['Turtle.moveBackward'], 'moveBackward']];
    const VALUES =
        [['20', '20'],
         ['50', '50'],
         ['100', '100'],
         ['150', '150']];
    this.setColour(Turtle.Blocks.HUE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR')
        .appendField(new Blockly.FieldDropdown(VALUES), 'VALUE');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.Msg['Turtle.moveTooltip']);
  }
};

Blockly.JavaScript['turtle_move_internal'] = function(block) {
  // Generate JavaScript for moving forward or backwards.
  const value = Number(block.getFieldValue('VALUE'));
  return block.getFieldValue('DIR') +
      '(' + value + ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['turtle_turn'] = {
  /**
   * Block for turning left or right.
   * @this {Blockly.Block}
   */
  init: function() {
    const DIRECTIONS =
        [[BlocklyGames.Msg['Turtle.turnRight'], 'turnRight'],
         [BlocklyGames.Msg['Turtle.turnLeft'], 'turnLeft']];
    // Append arrows to direction messages.
    DIRECTIONS[0][0] += Turtle.Blocks.RIGHT_TURN;
    DIRECTIONS[1][0] += Turtle.Blocks.LEFT_TURN;
    this.setColour(Turtle.Blocks.HUE);
    this.appendValueInput('VALUE')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.Msg['Turtle.turnTooltip']);
  }
};

Blockly.JavaScript['turtle_turn'] = function(block) {
  // Generate JavaScript for turning left or right.
  const value = Blockly.JavaScript.valueToCode(block, 'VALUE',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  return `${block.getFieldValue('DIR')}(${value}, 'block_id_${block.id}');\n`;
};

Blockly.Blocks['turtle_turn_internal'] = {
  /**
   * Block for turning left or right.
   * @this {Blockly.Block}
   */
  init: function() {
    const DIRECTIONS =
        [[BlocklyGames.Msg['Turtle.turnRight'], 'turnRight'],
         [BlocklyGames.Msg['Turtle.turnLeft'], 'turnLeft']];
    const VALUES =
        [['1°', '1'],
         ['45°', '45'],
         ['72°', '72'],
         ['90°', '90'],
         ['120°', '120'],
         ['144°', '144']];
    // Append arrows to direction messages.
    DIRECTIONS[0][0] += Turtle.Blocks.RIGHT_TURN;
    DIRECTIONS[1][0] += Turtle.Blocks.LEFT_TURN;
    this.setColour(Turtle.Blocks.HUE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR')
        .appendField(new Blockly.FieldDropdown(VALUES), 'VALUE');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.Msg['Turtle.turnTooltip']);
  }
};

Blockly.JavaScript['turtle_turn_internal'] = function(block) {
  // Generate JavaScript for turning left or right.
  const value = Number(block.getFieldValue('VALUE'));
  return `${block.getFieldValue('DIR')}(${value}, 'block_id_${block.id}');\n`;
};

Blockly.Blocks['turtle_width'] = {
  /**
   * Block for setting the width.
   * @this {Blockly.Block}
   */
  init: function() {
    this.setColour(Turtle.Blocks.HUE);
    this.appendValueInput('WIDTH')
        .setCheck('Number')
        .appendField(BlocklyGames.Msg['Turtle.setWidth']);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.Msg['Turtle.widthTooltip']);
  }
};

Blockly.JavaScript['turtle_width'] = function(block) {
  // Generate JavaScript for setting the width.
  const width = Blockly.JavaScript.valueToCode(block, 'WIDTH',
      Blockly.JavaScript.ORDER_COMMA) || '1';
  return `penWidth(${width}, 'block_id_${block.id}');\n`;
};

Blockly.Blocks['turtle_pen'] = {
  /**
   * Block for pen up/down.
   * @this {Blockly.Block}
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "PEN",
          "options": [
            [BlocklyGames.Msg['Turtle.penUp'], "penUp"],
            [BlocklyGames.Msg['Turtle.penDown'], "penDown"],
          ]
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Turtle.Blocks.HUE,
      "tooltip": BlocklyGames.Msg['Turtle.penTooltip'],
    });
  }
};

Blockly.JavaScript['turtle_pen'] = function(block) {
  // Generate JavaScript for pen up/down.
  return `${block.getFieldValue('PEN')}('block_id_${block.id}');\n`;
};

Blockly.Blocks['turtle_colour'] = {
  /**
   * Block for setting the colour.
   * @this {Blockly.Block}
   */
  init: function() {
    this.setColour(Blockly.Msg['COLOUR_HUE']);
    this.appendValueInput('COLOUR')
        .setCheck('Colour')
        .appendField(BlocklyGames.Msg['Turtle.setColour']);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.Msg['Turtle.colourTooltip']);
  }
};

Blockly.JavaScript['turtle_colour'] = function(block) {
  // Generate JavaScript for setting the colour.
  const colour = Blockly.JavaScript.valueToCode(block, 'COLOUR',
      Blockly.JavaScript.ORDER_COMMA) || '\'#000000\'';
  return `penColour(${colour}, 'block_id_${block.id}');\n`;
};

Blockly.Blocks['turtle_colour_internal'] = {
  /**
   * Block for setting the colour.
   * @this {Blockly.Block}
   */
  init: function() {
    this.setColour(Blockly.Msg['COLOUR_HUE']);
    this.appendDummyInput()
        .appendField(BlocklyGames.Msg['Turtle.setColour'])
        .appendField(new Blockly.FieldColour('#ff0000'), 'COLOUR');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.Msg['Turtle.colourTooltip']);
  }
};

Blockly.JavaScript['turtle_colour_internal'] = function(block) {
  // Generate JavaScript for setting the colour.
  const colour = Blockly.JavaScript.quote_(block.getFieldValue('COLOUR'));
  return `penColour(${colour}, 'block_id_${block.id}');\n`;
};

Blockly.Blocks['turtle_visibility'] = {
  /**
   * Block for changing turtle visiblity.
   * @this {Blockly.Block}
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "VISIBILITY",
          "options": [
            [BlocklyGames.Msg['Turtle.hideTurtle'], "hideTurtle"],
            [BlocklyGames.Msg['Turtle.showTurtle'], "showTurtle"],
          ]
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Turtle.Blocks.HUE,
      "tooltip": BlocklyGames.Msg['Turtle.turtleVisibilityTooltip'],
    });
  }
};

Blockly.JavaScript['turtle_visibility'] = function(block) {
  // Generate JavaScript for changing turtle visibility.
  return `${block.getFieldValue('VISIBILITY')}('block_id_${block.id}');\n`;
};

Blockly.Blocks['turtle_print'] = {
  /**
   * Block for printing text.
   * @this {Blockly.Block}
   */
  init: function() {
    this.setHelpUrl(BlocklyGames.Msg['Turtle.printHelpUrl']);
    this.setColour(Turtle.Blocks.HUE);
    this.appendValueInput('TEXT')
        .appendField(BlocklyGames.Msg['Turtle.print']);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.Msg['Turtle.printTooltip']);
  }
};

Blockly.JavaScript['turtle_print'] = function(block) {
  // Generate JavaScript for printing text.
  const argument0 = String(Blockly.JavaScript.valueToCode(block, 'TEXT',
      Blockly.JavaScript.ORDER_COMMA) || '\'\'');
  return `print(${argument0}, 'block_id_${block.id}');\n`;
};

Blockly.Blocks['turtle_font'] = {
  /**
   * Block for setting the font.
   * @this {Blockly.Block}
   */
  init: function() {
    const FONTLIST =
        // Common font names (intentionally not localized)
        [['Arial', 'Arial'], ['Courier New', 'Courier New'], ['Georgia', 'Georgia'],
         ['Impact', 'Impact'], ['Times New Roman', 'Times New Roman'],
         ['Trebuchet MS', 'Trebuchet MS'], ['Verdana', 'Verdana']];
    const STYLE =
        [[BlocklyGames.Msg['Turtle.fontNormal'], 'normal'],
         [BlocklyGames.Msg['Turtle.fontItalic'], 'italic'],
         [BlocklyGames.Msg['Turtle.fontBold'], 'bold']];
    this.setHelpUrl(BlocklyGames.Msg['Turtle.fontHelpUrl']);
    this.setColour(Turtle.Blocks.HUE);
    this.appendDummyInput()
        .appendField(BlocklyGames.Msg['Turtle.font'])
        .appendField(new Blockly.FieldDropdown(FONTLIST), 'FONT');
    this.appendDummyInput()
        .appendField(BlocklyGames.Msg['Turtle.fontSize'])
        .appendField(new Blockly.FieldNumber(18, 1, 1000), 'FONTSIZE');
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(STYLE), 'FONTSTYLE');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.Msg['Turtle.fontTooltip']);
  }
};

Blockly.JavaScript['turtle_font'] = function(block) {
  // Generate JavaScript for setting the font.
  const font = Blockly.JavaScript.quote_(block.getFieldValue('FONT'));
  const fontSize = Number(block.getFieldValue('FONTSIZE'));
  const fontStyle = Blockly.JavaScript.quote_(block.getFieldValue('FONTSTYLE'));
  return `font(${font}, ${fontSize}, ${fontStyle}, 'block_id_${block.id}');\n`;
};

Blockly.Blocks['turtle_repeat_internal'] = {
  /**
   * Block for repeat n times (internal number).
   * @this {Blockly.Block}
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg['CONTROLS_REPEAT_TITLE'],
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
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Msg['LOOPS_HUE'],
      "tooltip": Blockly.Msg['CONTROLS_REPEAT_TOOLTIP'],
      "helpUrl": Blockly.Msg['CONTROLS_REPEAT_HELPURL'],
    });
    this.appendStatementInput('DO')
        .appendField(Blockly.Msg['CONTROLS_REPEAT_INPUT_DO']);
  }
};

Blockly.JavaScript['turtle_repeat_internal'] =
    Blockly.JavaScript['controls_repeat'];
