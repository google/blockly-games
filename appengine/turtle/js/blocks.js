/**
 * Blockly Games: Turtle Blocks
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
 * @fileoverview Blocks for Blockly's Turtle application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Turtle.Blocks');

goog.require('Blockly');
goog.require('Blockly.Blocks.colour');
goog.require('Blockly.Blocks.logic');
goog.require('Blockly.Blocks.loops');
goog.require('Blockly.Blocks.math');
goog.require('Blockly.Blocks.procedures');
goog.require('Blockly.Blocks.texts');
goog.require('Blockly.Blocks.variables');
goog.require('Blockly.JavaScript');
goog.require('Blockly.JavaScript.colour');
goog.require('Blockly.JavaScript.logic');
goog.require('Blockly.JavaScript.loops');
goog.require('Blockly.JavaScript.math');
goog.require('Blockly.JavaScript.procedures');
goog.require('Blockly.JavaScript.texts');
goog.require('Blockly.JavaScript.variables');
goog.require('BlocklyGames');


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

// Extensions to Blockly's language and JavaScript generator.

Blockly.Blocks['turtle_move'] = {
  /**
   * Block for moving forward or backwards.
   * @this Blockly.Block
   */
  init: function() {
    var DIRECTIONS =
        [[BlocklyGames.getMsg('Turtle_moveForward'), 'moveForward'],
         [BlocklyGames.getMsg('Turtle_moveBackward'), 'moveBackward']];
    this.setColour(Turtle.Blocks.HUE);
    this.appendValueInput('VALUE')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Turtle_moveTooltip'));
  }
};

Blockly.JavaScript['turtle_move'] = function(block) {
  // Generate JavaScript for moving forward or backwards.
  var value = Blockly.JavaScript.valueToCode(block, 'VALUE',
      Blockly.JavaScript.ORDER_NONE) || '0';
  return block.getFieldValue('DIR') +
      '(' + value + ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['turtle_move_internal'] = {
  /**
   * Block for moving forward or backwards.
   * @this Blockly.Block
   */
  init: function() {
    var DIRECTIONS =
        [[BlocklyGames.getMsg('Turtle_moveForward'), 'moveForward'],
         [BlocklyGames.getMsg('Turtle_moveBackward'), 'moveBackward']];
    var VALUES =
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
    this.setTooltip(BlocklyGames.getMsg('Turtle_moveTooltip'));
  }
};

Blockly.JavaScript['turtle_move_internal'] = function(block) {
  // Generate JavaScript for moving forward or backwards.
  var value = block.getFieldValue('VALUE');
  return block.getFieldValue('DIR') +
      '(' + value + ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['turtle_turn'] = {
  /**
   * Block for turning left or right.
   * @this Blockly.Block
   */
  init: function() {
    var DIRECTIONS =
        [[BlocklyGames.getMsg('Turtle_turnRight'), 'turnRight'],
         [BlocklyGames.getMsg('Turtle_turnLeft'), 'turnLeft']];
    // Append arrows to direction messages.
    DIRECTIONS[0][0] += Turtle.Blocks.RIGHT_TURN;
    DIRECTIONS[1][0] += Turtle.Blocks.LEFT_TURN;
    this.setColour(Turtle.Blocks.HUE);
    this.appendValueInput('VALUE')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Turtle_turnTooltip'));
  }
};

Blockly.JavaScript['turtle_turn'] = function(block) {
  // Generate JavaScript for turning left or right.
  var value = Blockly.JavaScript.valueToCode(block, 'VALUE',
      Blockly.JavaScript.ORDER_NONE) || '0';
  return block.getFieldValue('DIR') +
      '(' + value + ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['turtle_turn_internal'] = {
  /**
   * Block for turning left or right.
   * @this Blockly.Block
   */
  init: function() {
    var DIRECTIONS =
        [[BlocklyGames.getMsg('Turtle_turnRight'), 'turnRight'],
         [BlocklyGames.getMsg('Turtle_turnLeft'), 'turnLeft']];
    var VALUES =
        [['1\u00B0', '1'],
         ['45\u00B0', '45'],
         ['72\u00B0', '72'],
         ['90\u00B0', '90'],
         ['120\u00B0', '120'],
         ['144\u00B0', '144']];
    // Append arrows to direction messages.
    DIRECTIONS[0][0] += Turtle.Blocks.RIGHT_TURN;
    DIRECTIONS[1][0] += Turtle.Blocks.LEFT_TURN;
    this.setColour(Turtle.Blocks.HUE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR')
        .appendField(new Blockly.FieldDropdown(VALUES), 'VALUE');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Turtle_turnTooltip'));
  }
};

Blockly.JavaScript['turtle_turn_internal'] = function(block) {
  // Generate JavaScript for turning left or right.
  var value = block.getFieldValue('VALUE');
  return block.getFieldValue('DIR') +
      '(' + value + ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['turtle_width'] = {
  /**
   * Block for setting the width.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Turtle.Blocks.HUE);
    this.appendValueInput('WIDTH')
        .setCheck('Number')
        .appendField(BlocklyGames.getMsg('Turtle_setWidth'));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Turtle_widthTooltip'));
  }
};

Blockly.JavaScript['turtle_width'] = function(block) {
  // Generate JavaScript for setting the width.
  var width = Blockly.JavaScript.valueToCode(block, 'WIDTH',
      Blockly.JavaScript.ORDER_NONE) || '1';
  return 'penWidth(' + width + ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['turtle_pen'] = {
  /**
   * Block for pen up/down.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "PEN",
          "options": [
            [BlocklyGames.getMsg('Turtle_penUp'), "penUp"],
            [BlocklyGames.getMsg('Turtle_penDown'), "penDown"]
          ]
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Turtle.Blocks.HUE,
      "tooltip": BlocklyGames.getMsg('Turtle_penTooltip')
    });
  }
};

Blockly.JavaScript['turtle_pen'] = function(block) {
  // Generate JavaScript for pen up/down.
  return block.getFieldValue('PEN') +
      '(\'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['turtle_colour'] = {
  /**
   * Block for setting the colour.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Blocks.colour.HUE);
    this.appendValueInput('COLOUR')
        .setCheck('Colour')
        .appendField(BlocklyGames.getMsg('Turtle_setColour'));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Turtle_colourTooltip'));
  }
};

Blockly.JavaScript['turtle_colour'] = function(block) {
  // Generate JavaScript for setting the colour.
  var colour = Blockly.JavaScript.valueToCode(block, 'COLOUR',
      Blockly.JavaScript.ORDER_NONE) || '\'#000000\'';
  return 'penColour(' + colour + ', \'block_id_' +
      block.id + '\');\n';
};

Blockly.Blocks['turtle_colour_internal'] = {
  /**
   * Block for setting the colour.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Blocks.colour.HUE);
    this.appendDummyInput()
        .appendField(BlocklyGames.getMsg('Turtle_setColour'))
        .appendField(new Blockly.FieldColour('#ff0000'), 'COLOUR');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Turtle_colourTooltip'));
  }
};

Blockly.JavaScript['turtle_colour_internal'] = function(block) {
  // Generate JavaScript for setting the colour.
  var colour = '\'' + block.getFieldValue('COLOUR') + '\'';
  return 'penColour(' + colour + ', \'block_id_' +
      block.id + '\');\n';
};

Blockly.Blocks['turtle_visibility'] = {
  /**
   * Block for changing turtle visiblity.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "VISIBILITY",
          "options": [
            [BlocklyGames.getMsg('Turtle_hideTurtle'), "hideTurtle"],
            [BlocklyGames.getMsg('Turtle_showTurtle'), "showTurtle"]
          ]
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Turtle.Blocks.HUE,
      "tooltip": BlocklyGames.getMsg('Turtle_turtleVisibilityTooltip')
    });
  }
};

Blockly.JavaScript['turtle_visibility'] = function(block) {
  // Generate JavaScript for changing turtle visibility.
  return block.getFieldValue('VISIBILITY') +
      '(\'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['turtle_print'] = {
  /**
   * Block for printing text.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(BlocklyGames.getMsg('Turtle_printHelpUrl'));
    this.setColour(Turtle.Blocks.HUE);
    this.appendValueInput('TEXT')
        .appendField(BlocklyGames.getMsg('Turtle_print'));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Turtle_printTooltip'));
  }
};

Blockly.JavaScript['turtle_print'] = function(block) {
  // Generate JavaScript for printing text.
  var argument0 = String(Blockly.JavaScript.valueToCode(block, 'TEXT',
      Blockly.JavaScript.ORDER_NONE) || '\'\'');
  return 'print(' + argument0 + ', \'block_id_' +
      block.id + '\');\n';
};

Blockly.Blocks['turtle_font'] = {
  /**
   * Block for setting the font.
   * @this Blockly.Block
   */
  init: function() {
    var FONTLIST =
        // Common font names (intentionally not localized)
        [['Arial', 'Arial'], ['Courier New', 'Courier New'], ['Georgia', 'Georgia'],
         ['Impact', 'Impact'], ['Times New Roman', 'Times New Roman'],
         ['Trebuchet MS', 'Trebuchet MS'], ['Verdana', 'Verdana']];
    var STYLE =
        [[BlocklyGames.getMsg('Turtle_fontNormal'), 'normal'],
         [BlocklyGames.getMsg('Turtle_fontItalic'), 'italic'],
         [BlocklyGames.getMsg('Turtle_fontBold'), 'bold']];
    this.setHelpUrl(BlocklyGames.getMsg('Turtle_fontHelpUrl'));
    this.setColour(Turtle.Blocks.HUE);
    this.appendDummyInput()
        .appendField(BlocklyGames.getMsg('Turtle_font'))
        .appendField(new Blockly.FieldDropdown(FONTLIST), 'FONT');
    this.appendDummyInput()
        .appendField(BlocklyGames.getMsg('Turtle_fontSize'))
        .appendField(new Blockly.FieldNumber(18, 1, 1000), 'FONTSIZE');
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(STYLE), 'FONTSTYLE');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Turtle_fontTooltip'));
  }
};

Blockly.JavaScript['turtle_font'] = function(block) {
  // Generate JavaScript for setting the font.
  return 'font(\'' + block.getFieldValue('FONT') + '\',' +
      Number(block.getFieldValue('FONTSIZE')) + ',\'' +
      block.getFieldValue('FONTSTYLE') + '\', \'block_id_' +
      block.id + '\');\n';
};

Blockly.Blocks['turtle_repeat_internal'] = {
  /**
   * Block for repeat n times (internal number).
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.CONTROLS_REPEAT_TITLE,
      "args0": [
        {
          "type": "field_dropdown",
          "name": "TIMES",
          "options": [
            ["3", "3"],
            ["4", "4"],
            ["5", "5"],
            ["360", "360"]
          ]
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Blocks.loops.HUE,
      "tooltip": Blockly.Msg.CONTROLS_REPEAT_TOOLTIP,
      "helpUrl": Blockly.Msg.CONTROLS_REPEAT_HELPURL
    });
    this.appendStatementInput('DO')
        .appendField(Blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
  }
};

Blockly.JavaScript['turtle_repeat_internal'] =
    Blockly.JavaScript['controls_repeat'];
