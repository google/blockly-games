/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Run a Pond battle headlessly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';


// Stub for Closure's base.
var goog = goog || {};
goog.provide = goog.provide || function(name) {
  var obj = window;
  var parts = name.split('.');
  for (var i = 0; i < parts.length; i++) {
    var part = parts[i];
    obj[part] = obj[part] || {};
    obj = obj[part];
  }
};
goog.require = goog.require || function() {};


// Stub for BlocklyGames library.
var BlocklyGames = BlocklyGames || {};
/**
 * Normalizes an angle to be in range [0-360]. Angles outside this range will
 * be normalized to be the equivalent angle with that range.
 * @param {number} angle Angle in degrees.
 * @return {number} Standardized angle.
 */
BlocklyGames.normalizeAngle = function(angle) {
  angle %= 360;
  if (angle < 0) {
    angle += 360;
  }
  return angle;
};


function load() {
  Pond.Battle.GAME_FPS = 1000;

  var coordinates = [
    new Blockly.utils.Coordinate(20, 80),
    new Blockly.utils.Coordinate(80, 80),
    new Blockly.utils.Coordinate(20, 20),
    new Blockly.utils.Coordinate(80, 20)
  ];

  Pond.Battle.reset();
  for (var duck, i = 0; (duck = DUCKS[i]); i++) {
    var start = coordinates.splice(Math.floor(Math.random() * coordinates.length), 1);
    start = start[0] || new Blockly.utils.Coordinate(50, 50);
    var avatar = new Pond.Avatar(duck.id, start, 0, false, Pond.Battle);
    avatar.setCode(undefined, duck.compiled, duck.compiled);
  }
  Pond.Battle.start(done);
}

function done() {
  console.log('Done!');
}

window.addEventListener('load', load);
