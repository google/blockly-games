/**
 * @license
 * Copyright 2014 Google LLC
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
 * @fileoverview Creates all information around default players.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

goog.provide('Pond.Player');

goog.require('Blockly.utils.Coordinate');

/**
 * @constructor
 */
Pond.Player = function(name, code, startCoord) {
    this.damage = 0;
    this.name = name;
    this.code = code;
    this.start = startCoord;
};

/**
 * Four start coordinates for the ducks.
 * @type {Array.<Blockly.utils.Coordinate>}
 */
Pond.Player.Coordinates = [
    new Blockly.utils.Coordinate(20, 80),
    new Blockly.utils.Coordinate(80, 80),
    new Blockly.utils.Coordinate(20, 20),
    new Blockly.utils.Coordinate(80, 20)
];

/**
 * Given a name create the default player.
 */
Pond.Player.createDefaultPlayer = function(name) {
  if (name == 'Pond_rookName') {
    var div = document.getElementById('playerRook');
    var code = div.textContent;
    var startCoord = Pond.Player.Coordinates[1];
  } else if (name == 'Pond_counterName') {
    var div = document.getElementById('playerCounter');
    var code = div.textContent;
    var startCoord = Pond.Player.Coordinates[2];
  } else if (name == 'Pond_sniperName') {
    var div = document.getElementById('playerSniper');
    var code = div.textContent;
    var startCoord = Pond.Player.Coordinates[3];
  }
  return new Pond.Player(name, code, startCoord);
};

/**
 * 
 */
Pond.Player.createCurrentPlayer = function(name) {
    var startCoord = Pond.Player.Coordinates[0];
    return new Pond.Player(name, BlocklyInterface.getJsCode, startCoord);
};

Pond.Player.createPlayerFromDuck = function(duck, startCoordIdx) {
    var startCoord = Pond.Player.Coordinates[startCoordIdx];
    return new Pond.Player(duck.name, duck.code.js, startCoord);
};