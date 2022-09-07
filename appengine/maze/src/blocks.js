/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blocks for Maze game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Maze.Blocks');

goog.require('Blockly');
goog.require('Blockly.JavaScript');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldImage');
goog.require('BlocklyGames');


/**
 * Common HSV hue for all movement blocks.
 */
Maze.Blocks.MOVEMENT_HUE = 290;

/**
 * HSV hue for loop block.
 */
Maze.Blocks.LOOPS_HUE = 120;

/**
 * Common HSV hue for all logic blocks.
 */
Maze.Blocks.LOGIC_HUE = 210;

/**
 * Left turn arrow to be appended to messages.
 */
Maze.Blocks.LEFT_TURN = ' \u21BA';

/**
 * Left turn arrow to be appended to messages.
 */
Maze.Blocks.RIGHT_TURN = ' \u21BB';

// Extensions to Blockly's existing blocks and JavaScript generator.

Blockly.Blocks['maze_moveForward'] = {
  /**
   * Block for moving forward.
   * @this {Blockly.Block}
   */
  init: function() {
    this.jsonInit({
      "message0": BlocklyGames.getMsg('Maze.moveForward', false),
      "previousStatement": null,
      "nextStatement": null,
      "colour": Maze.Blocks.MOVEMENT_HUE,
      "tooltip": BlocklyGames.getMsg('Maze.moveForwardTooltip', false)
    });
  }
};

Blockly.JavaScript['maze_moveForward'] = function(block) {
  // Generate JavaScript for moving forward.
  return `moveForward('block_id_${block.id}');\n`;
};

Blockly.Blocks['maze_turn'] = {
  /**
   * Block for turning left or right.
   * @this {Blockly.Block}
   */
  init: function() {
    const DIRECTIONS =
        [[BlocklyGames.getMsg('Maze.turnLeft', false), 'turnLeft'],
         [BlocklyGames.getMsg('Maze.turnRight', false), 'turnRight']];
    // Append arrows to direction messages.
    DIRECTIONS[0][0] += Maze.Blocks.LEFT_TURN;
    DIRECTIONS[1][0] += Maze.Blocks.RIGHT_TURN;
    this.setColour(Maze.Blocks.MOVEMENT_HUE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Maze.turnTooltip', false));
  }
};

Blockly.JavaScript['maze_turn'] = function(block) {
  // Generate JavaScript for turning left or right.
  return `${block.getFieldValue('DIR')}('block_id_${block.id}');\n`;
};

Blockly.Blocks['maze_if'] = {
  /**
   * Block for conditional "if there is a path".
   * @this {Blockly.Block}
   */
  init: function() {
    const DIRECTIONS =
        [[BlocklyGames.getMsg('Maze.pathAhead', false), 'isPathForward'],
         [BlocklyGames.getMsg('Maze.pathLeft', false), 'isPathLeft'],
         [BlocklyGames.getMsg('Maze.pathRight', false), 'isPathRight']];
    // Append arrows to direction messages.
    DIRECTIONS[1][0] += Maze.Blocks.LEFT_TURN;
    DIRECTIONS[2][0] += Maze.Blocks.RIGHT_TURN;
    this.setColour(Maze.Blocks.LOGIC_HUE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
    this.appendStatementInput('DO')
        .appendField(BlocklyGames.getMsg('Maze.doCode', false));
    this.setTooltip(BlocklyGames.getMsg('Maze.ifTooltip', false));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['maze_if'] = function(block) {
  // Generate JavaScript for conditional "if there is a path".
  const argument = `${block.getFieldValue('DIR')}('block_id_${block.id}')`;
  const branch = Blockly.JavaScript.statementToCode(block, 'DO');
  return `if (${argument}) {\n${branch}}\n`;
};

Blockly.Blocks['maze_ifElse'] = {
  /**
   * Block for 'if/else' conditional if there is a path.
   * @this {Blockly.Block}
   */
  init: function() {
    const DIRECTIONS =
        [[BlocklyGames.getMsg('Maze.pathAhead', false), 'isPathForward'],
         [BlocklyGames.getMsg('Maze.pathLeft', false), 'isPathLeft'],
         [BlocklyGames.getMsg('Maze.pathRight', false), 'isPathRight']];
    // Append arrows to direction messages.
    DIRECTIONS[1][0] += Maze.Blocks.LEFT_TURN;
    DIRECTIONS[2][0] += Maze.Blocks.RIGHT_TURN;
    this.setColour(Maze.Blocks.LOGIC_HUE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
    this.appendStatementInput('DO')
        .appendField(BlocklyGames.getMsg('Maze.doCode', false));
    this.appendStatementInput('ELSE')
        .appendField(BlocklyGames.getMsg('Maze.elseCode', false));
    this.setTooltip(BlocklyGames.getMsg('Maze.ifelseTooltip', false));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['maze_ifElse'] = function(block) {
  // Generate JavaScript for conditional "if there is a path, else".
  const argument = `${block.getFieldValue('DIR')}('block_id_${block.id}')`;
  const branch0 = Blockly.JavaScript.statementToCode(block, 'DO');
  const branch1 = Blockly.JavaScript.statementToCode(block, 'ELSE');
  return `if (${argument}) {\n${branch0}} else {\n${branch1}}\n`;
};

Blockly.Blocks['maze_forever'] = {
  /**
   * Block for repeat loop.
   * @this {Blockly.Block}
   */
  init: function() {
    this.setColour(Maze.Blocks.LOOPS_HUE);
    this.appendDummyInput()
        .appendField(BlocklyGames.getMsg('Maze.repeatUntil', false))
        .appendField(new Blockly.FieldImage('maze/marker.png', 12, 16));
    this.appendStatementInput('DO')
        .appendField(BlocklyGames.getMsg('Maze.doCode', false));
    this.setPreviousStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Maze.whileTooltip', false));
  }
};

Blockly.JavaScript['maze_forever'] = function(block) {
  // Generate JavaScript for repeat loop.
  let branch = Blockly.JavaScript.statementToCode(block, 'DO');
  if (Blockly.JavaScript.INFINITE_LOOP_TRAP) {
    branch = Blockly.JavaScript.INFINITE_LOOP_TRAP.replace(/%1/g,
        `'block_id_${block.id}'`) + branch;
  }
  return `while (notDone()) {\n${branch}}\n`;
};
