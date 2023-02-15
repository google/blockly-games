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
goog.require('Blockly.Extensions');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldImage');
goog.require('BlocklyGames');


/**
 * Construct custom maze block types.  Called on page load.
 */
Maze.Blocks.init = function() {
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
    [BlocklyGames.getMsg('Maze.turnLeft', false), 'turnLeft'],
    [BlocklyGames.getMsg('Maze.turnRight', false), 'turnRight'],
  ];

  const PATH_DIRECTIONS = [
    [BlocklyGames.getMsg('Maze.pathAhead', false), 'isPathForward'],
    [BlocklyGames.getMsg('Maze.pathLeft', false), 'isPathLeft'],
    [BlocklyGames.getMsg('Maze.pathRight', false), 'isPathRight'],
  ];

  // Add arrows to turn options after prefix/suffix have been separated.
  Blockly.Extensions.register('maze_turn_arrows',
      function() {
        const options = this.getField('DIR').getOptions();
        options[options.length - 2][0] += LEFT_TURN;
        options[options.length - 1][0] += RIGHT_TURN;
      });

  /**
   * Atal honetan, JSON objektuez osatutako lista bat sortzen da. Objektu hauetako bakoitzean bloke bat osatzeko beharrezko datuak biltzen dira, hainbat
   * aldagai erabiliz. Aldagaien esanahiak hauek dira:
   * type: blokearen identifikatzailea.
   * message0: blokean idatzita agertuko den textua.
   * args0: blokeak aldagaiak jasotzen dituenean soilik erabiltzen da. Jasotako aldagaien datuak biltzen dituzten JSON objektuen lista da. Objektuen egitura hau da:
   *         type: aldagaiaren identifikatzailea.
   *         name: aldagaiaren izena.
   *         angle: hautazkoa da. Aldagaiak adierazten duen angelua adierazten du.
   *         value: hautazkoa da. Aldagaiaren balioa adierazten du.
   *         options: hautazkoa da. Erabiltzaileari eskeintzen zaizkion aukera desberdinak. Bikotetan adierazten dira, lehenengoa blokean idatzita agertzen den ikurra eta bigarrena ikurrari lotutako balioa izanik.
   *         check: hautazkoa da. Jasotako balioari ezartzen zaion baldintza. Adibidez 'check:number' kasuetan, erabiltzaileak sartutako balioa zenbaki bat dela ziurtatu behar dela esan nahi du.
   * inputsInLine: args0 existitzen denean soilik erabiltzen den hautazko atala. 'true' balioa ezartzen zaio jaso behar diren aldagai guztiak marra bakarrean adierazteko, bestela aldagai bakoitza marra bakarrean agertzen da. 
   * output: blokeak balioren bat itzuli behar badu soilik erabiltzen da. Bueltatzen duen balio mota adierazten du.
   * previousStatement: blokearen aurretik beste blokeak ahal direnean konektatu erabiltzen da. Hasieran 'null' balio du, ez duelako aurretik blokerik konektatuta.
   * nextStatement: blokearen atzetik beste blokeak ahal direnean konektatu erabiltzen da. Hasieran 'null' balio du, ez duelako atzetik blokerik konektatuta.
   * colour: blokearen kolorearen HSV balioa.
   * tooltip: erabiltzaileari blokearen funtzionamendua azaltzeko erabiltzen den textu lagungarria.
   * helpURL: blokearen funtzionamenduaren inguruko informazio gehigarria duen esteka. Jokoan blokearen gainean arratoiaren eskuineko botoia sakatuta agertzen da.
   * extensions: blokeari balio gehigarri bat duen beste bloke bat ahal zaionean konektatu erabiltzen da. Atal honen balioak onartzen diren balio gehigarriak adierazten ditu.
   *
   */
  
  Blockly.defineBlocksWithJsonArray([
    // Block for moving forward.
    {
      "type": "maze_moveForward",
      "message0": BlocklyGames.getMsg('Maze.moveForward', false),
      "previousStatement": null,
      "nextStatement": null,
      "colour": MOVEMENT_HUE,
      "tooltip": BlocklyGames.getMsg('Maze.moveForwardTooltip', false),
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
      "tooltip": BlocklyGames.getMsg('Maze.turnTooltip', false),
      "extensions": ["maze_turn_arrows"],
    },

    // Block for conditional "if there is a path".
    {
      "type": "maze_if",
      "message0": `%1%2${BlocklyGames.getMsg('Maze.doCode', false)}%3`,
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
      "tooltip": BlocklyGames.getMsg('Maze.ifTooltip', false),
      "extensions": ["maze_turn_arrows"],
    },

    // Block for conditional "if there is a path, else".
    {
      "type": "maze_ifElse",
      "message0": `%1%2${BlocklyGames.getMsg('Maze.doCode', false)}%3${BlocklyGames.getMsg('Maze.elseCode', false)}%4`,
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
      "tooltip": BlocklyGames.getMsg('Maze.ifelseTooltip', false),
      "extensions": ["maze_turn_arrows"],
    },

    // Block for repeat loop.
    {
      "type": "maze_forever",
      "message0": `${BlocklyGames.getMsg('Maze.repeatUntil', false)}%1%2${BlocklyGames.getMsg('Maze.doCode', false)}%3`,
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
      "tooltip": BlocklyGames.getMsg('Maze.whileTooltip', false),
    },
  ]);
};


Blockly.JavaScript['maze_moveForward'] = function(block) {
  // Generate JavaScript for moving forward.
  return `moveForward('block_id_${block.id}');\n`;
};

Blockly.JavaScript['maze_turn'] = function(block) {
  // Generate JavaScript for turning left or right.
  return `${block.getFieldValue('DIR')}('block_id_${block.id}');\n`;
};

Blockly.JavaScript['maze_if'] = function(block) {
  // Generate JavaScript for conditional "if there is a path".
  const argument = `${block.getFieldValue('DIR')}('block_id_${block.id}')`;
  const branch = Blockly.JavaScript.statementToCode(block, 'DO');
  return `if (${argument}) {\n${branch}}\n`;
};

Blockly.JavaScript['maze_ifElse'] = function(block) {
  // Generate JavaScript for conditional "if there is a path, else".
  const argument = `${block.getFieldValue('DIR')}('block_id_${block.id}')`;
  const branch0 = Blockly.JavaScript.statementToCode(block, 'DO');
  const branch1 = Blockly.JavaScript.statementToCode(block, 'ELSE');
  return `if (${argument}) {\n${branch0}} else {\n${branch1}}\n`;
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
