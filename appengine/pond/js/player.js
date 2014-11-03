/**
 * Blockly Games: Pond
 *
 * Copyright 2013 Google Inc.
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
 * @fileoverview A single player.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Pond.Player');

goog.require('goog.math');
goog.require('goog.math.Coordinate');
goog.require('goog.net.XhrIo');


/**
 * Class for a player.
 * @param {string} name Player's name.
 * @param {string|!Function} code Player's code, or generator.
 * @param {!goog.math.Coordinate} startLoc Start location.
 * @param {?number} startDamage Initial damage to player (0-100, default 0).
 * @param {!Pond.Battle} battle The battle featuring the player.
 * @constructor
 */
Pond.Player = function(name, code, startLoc, startDamage, battle) {
  this.name = name;
  this.code_ = code;
  this.startLoc_ = startLoc;
  this.startDamage_ = startDamage || 0;
  this.battle_ = battle;
  this.loc = new goog.math.Coordinate();
  this.reset();
  console.log(this + ' loaded.');
};

/**
 * Has this player fully loaded and started playing?
 */
Pond.Player.prototype.started = false;

/**
 * Has the player been killed?
 */
Pond.Player.prototype.dead = false;

/**
 * Damage of this player (0 = perfect, 100 = dead).
 */
Pond.Player.prototype.damage = 0;

/**
 * Heading the player is moving in (0 - 360).
 */
Pond.Player.prototype.degree = 0;

/**
 * Direction the player's head is facing (0 - 360).
 */
Pond.Player.prototype.facing = 0;

/**
 * Speed the player is actually moving (0 - 100).
 */
Pond.Player.prototype.speed = 0;

/**
 * Speed the player is aiming to move at (0 - 100).
 */
Pond.Player.prototype.desiredSpeed = 0;

/**
 * X/Y location of the player (0 - 100).
 * @type goog.math.Coordinate
 */
Pond.Player.prototype.loc = null;

/**
 * Date of last missile.
 */
Pond.Player.prototype.lastMissile = 0;

/**
 * A text representation of this player for debugging purposes.
 * @return {string} String representation.
 */
Pond.Player.prototype.toString = function() {
  return '[' + this.name + ']';
};

/**
 * Reset this player to a starting state.
 * @param {!goog.math.Coortinate} startXY X-Y coordinate to start at.
 */
Pond.Player.prototype.reset = function() {
  delete this.started;
  delete this.dead;
  delete this.speed;
  delete this.desiredSpeed;
  delete this.lastMissile;

  this.damage = this.startDamage_;
  this.loc.x = this.startLoc_.x;
  this.loc.y = this.startLoc_.y;
  // Face the centre.
  this.degree = goog.math.angle(this.loc.x, this.loc.y, 50, 50);
  this.facing = this.degree;
  var code = this.code_;
  if (goog.isFunction(code)) {
    code = code();
  } else if (!goog.isString(code)) {
    throw 'Player ' + this.name + ' has invalid code: ' + code;
  }
  if ('Interpreter' in window) {
    this.interpreter = new Interpreter(code, this.battle_.initInterpreter);
  } else {
    this.interpreter = null;
  }
};

/**
 * Damage the player.
 * @param {number} add Amount of damage to add.
 */
Pond.Player.prototype.addDamage = function(add) {
  this.damage += add;
  if (this.damage >= 100) {
    this.die();
  }
};

/**
 * Kill this player.
 */
Pond.Player.prototype.die = function() {
  this.speed = 0;
  this.dead = true;
  this.damage = 100;
  this.battle_.RANK.unshift(this);
  this.battle_.EVENTS.push({'type': 'DIE', 'player': this});
  console.log(this + ' dies.');
};

// API functions exposed to the user.

/**
 * Scan in a direction for the nearest player.
 * @param {number} degree Scan in this direction (wrapped to 0-360).
 * @param {number} opt_resolution Sensing resolution, 1 to 20 degrees.
 *   Defaults to 5.
 * @return {number} Distance (0 - ~141), or Infinity if no player detected.
 */
Pond.Player.prototype.scan = function(degree, opt_resolution) {
  var resolution;
  if (opt_resolution === undefined || opt_resolution === null) {
    resolution = 5;
  } else {
    resolution = opt_resolution;
  }
  if (!goog.isNumber(degree) || isNaN(degree) ||
      !goog.isNumber(resolution) || isNaN(resolution)) {
    throw TypeError;
  }
  degree = goog.math.standardAngle(degree);
  resolution = goog.math.clamp(resolution, 0, 20);

  this.battle_.EVENTS.push({'type': 'SCAN', 'player': this,
                            'degree': degree, 'resolution': resolution});

  // Compute both edges of the scan.
  var scan1 = goog.math.standardAngle(degree - resolution / 2);
  var scan2 = goog.math.standardAngle(degree + resolution / 2);
  if (scan1 > scan2) {
    scan2 += 360;
  }
  var locX = this.loc.x;
  var locY = this.loc.y;
  // Check every enemy for existance in the scan beam.
  var closest = Infinity;
  for (var i = 0, enemy; enemy = this.battle_.PLAYERS[i]; i++) {
    if (enemy == this || enemy.dead) {
      continue;
    }
    var ex = enemy.loc.x;
    var ey = enemy.loc.y;
    // Pythagorean theorem to find range to enemy's centre.
    var range = Math.sqrt((ey - locY) * (ey - locY) +
                          (ex - locX) * (ex - locX));
    if (range >= closest) {
      continue;
    }
    // Compute angle between player and enemy's centre.
    var angle = Math.atan2(ey - locY, ex - locX);
    angle = goog.math.standardAngle(goog.math.toDegrees(angle));
    // Raise angle by 360 if needed (handles wrapping).
    if (angle < scan1) {
      angle += 360;
    }
    // Check if enemy is within scan edges.
    if (scan1 <= angle && angle <= scan2) {
      closest = range;
    }
  }
  return closest;
};

/**
 * Commands the player to move in the specified heading at the specified speed.
 * @param {number} degree Heading (0-360).
 * @param {number} opt_speed Desired speed (0-100).  Defaults to 50.
 */
Pond.Player.prototype.drive = function(degree, opt_speed) {
  var speed;
  if (opt_speed === undefined || opt_speed === null) {
    speed = 50;
  } else {
    speed = opt_speed;
  }
  if (!goog.isNumber(degree) || isNaN(degree) ||
      !goog.isNumber(speed) || isNaN(speed)) {
    throw TypeError;
  }
  var desiredDegree = goog.math.standardAngle(degree);
  if (this.degree != desiredDegree) {
    if (this.speed <= 50) {
      // Changes in direction can be negotiated at speeds of less than 50%.
      this.degree = goog.math.standardAngle(degree);
      this.facing = this.degree;
    } else {
      // Stop the player if an over-speed turn was commanded.
      speed = 0;
    }
  }
  if (this.speed == 0 && speed > 0) {
    // If starting, bump the speed immediately so that players can see a change.
    this.speed = 0.1;
  }
  this.desiredSpeed = goog.math.clamp(speed, 0, 100);
};

/**
 * Commands the player to stop.
 */
Pond.Player.prototype.stop = function() {
  this.desiredSpeed = 0;
};

/**
 * Commands the player to shoot in the specified heading at the specified range.
 * @param {number} degree Heading (0-360).
 * @param {number} range Distance to impact (0-70).
 * @return {boolean} True if cannon fired, false if still reloading from a
 *     previous shot.
 */
Pond.Player.prototype.cannon = function(degree, range) {
  if (!goog.isNumber(degree) || isNaN(degree) ||
      !goog.isNumber(range) || isNaN(range)) {
    throw TypeError;
  }
  var now = Date.now();
  if (this.lastMissile + this.battle_.RELOAD_TIME * 1000 > now) {
    return false;
  }
  this.lastMissile = now;
  var startLoc = this.loc.clone();
  degree = goog.math.standardAngle(degree);
  this.facing = degree;
  range = goog.math.clamp(range, 0, 70);
  var endLoc = new goog.math.Coordinate(
      startLoc.x + goog.math.angleDx(degree, range),
      startLoc.y + goog.math.angleDy(degree, range));
  var missile = {
    player: this,
    startLoc: startLoc,
    degree: degree,
    range: range,
    endLoc: endLoc,
    progress: 0
  };
  this.battle_.MISSILES.push(missile);
  this.battle_.EVENTS.push({'type': 'BANG', 'player': this,
      'degree': missile.degree});
  return true;
};
