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

/**
 * Funtzio hauek JSON objektuetatik blokeen informazioa jasotzen dute eta, beharrezko kasuetan, datuekin eragiketak egiten dituzte.
 * @args JavaScript kode bihurtu behar den blokearen JSON objektua.
 * @returns bloketik lortutako JavaScript kodea, String formatuan.
 * Blockly-ko aldagaiak honako hauek dira:
 *           Blockly.JavaScript.ORDER_COMMA: 'valueToCode' funtzioan erabiltzen da. Funtzioak jasotzen duen aldagaia beste aldagaiekin batera erabili behar denean erabiltzen da.
 *
 *           Blockly.JavaScript.ORDER_ATOMIC: honekin batera bueltatzen den kodea atomikoa denean erabiltzen da. Hau da, kode horren tartean ezin denean kode gehigarririk txertatu (if-else begiztetan ez bezala, adibidez).
 *
 *           Blockly.JavaScript.ORDER_NONE: 'valueToCode' funtzioan erabiltzen da. Funtzioak jasotzen duen aldagaia beste aldagaiekin batera ez denean erabiltzen agertzen da.
 *
 * Gainera, 'Blockly.JavaScript.valueToCode(blokea, aldagaia, Blockly.JavaScript.'balioa')' funtzioa esanguratsua da. Honek, jasotako blokearen JSON objektuan aldagaia bilatzen du, eta emandako
 * Blockly.Javascript.'balioa' moduko aldagaiaren laguntzarekin, aldagaiaren JavaScript kodea sortzen du.
*/

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
