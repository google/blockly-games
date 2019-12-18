/**
 * @license
 * Copyright 2013 Google LLC
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
 * @fileoverview A single avatar.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Pond.Avatar');

goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.math');
goog.require('BlocklyAce');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('Pond.Battle');


/**
 * Class for a avatar.
 * @param {string} name Avatar's name.
 * @param {string|!Function} code Avatar's code, or generator.
 * @param {Blockly.utils.Coordinate} startLoc The default start location.
 * @param {number=} [opt_startDamage=0] Initial damage to avatar (0-100).
 * @constructor
 */
Pond.Avatar = function(name, code, startLoc, opt_startDamage) {
  this.name = name;
  this.code_ = code;
  this.startLoc_ = startLoc;
  this.startDamage_ = opt_startDamage || 0;
  this.loc = new Blockly.utils.Coordinate();
  Pond.Battle.log(this + ' loaded.');
};

/**
 * Given a name create the default player.
 * @param {string} name The name of the default player.
 * @param {string} divId The id of the div that holds this avatars code.
 * @param {Blockly.utils.Coordinate} startLoc The default start location.
 * @param {number=} [opt_startDamage=0] Initial damage to avatar (0-100).
 */
Pond.Avatar.createDefaultAvatar = function(name, divId, startLoc, opt_startDamage) {
  var name = BlocklyGames.getMsg(name);
  var div = document.getElementById(divId);
  var code = div.textContent;
  return new Pond.Avatar(name, code, startLoc, opt_startDamage);
};

/**
 * Create an avatar based on the current user's duck.
 * @param {string} name The name of the avatar.
 * @param {Blockly.utils.Coordinate} startLoc The default start location.
 * @param {number=} [opt_startDamage=0] Initial damage to avatar (0-100).
 */
Pond.Avatar.createPlayerAvatar = function(name, startLoc, opt_startDamage) {
  // TODO: Look into taking out getMsgWithFallback and replace with getMsg
  return new Pond.Avatar(BlocklyGames.getMsgWithFallback(name, name),
      BlocklyInterface.getJsCode, startLoc, opt_startDamage);
};

/**
 * Has this avatar fully loaded and started playing?
 */
Pond.Avatar.prototype.started = false;

/**
 * Has the avatar been killed?
 */
Pond.Avatar.prototype.dead = false;

/**
 * Damage of this avatar (0 = perfect, 100 = dead).
 */
Pond.Avatar.prototype.damage = 0;

/**
 * Heading the avatar is moving in (0 - 360).
 */
Pond.Avatar.prototype.degree = 0;

/**
 * Direction the avatar's head is facing (0 - 360).
 */
Pond.Avatar.prototype.facing = 0;

/**
 * Speed the avatar is actually moving (0 - 100).
 */
Pond.Avatar.prototype.speed = 0;

/**
 * Speed the avatar is aiming to move at (0 - 100).
 */
Pond.Avatar.prototype.desiredSpeed = 0;

/**
 * X/Y location of the avatar (0 - 100).
 * @type Blockly.utils.Coordinate
 */
Pond.Avatar.prototype.loc = null;

/**
 * Date of last missile.
 */
Pond.Avatar.prototype.lastMissile = 0;

/**
 * A text representation of this avatar for debugging purposes.
 * @return {string} String representation.
 */
Pond.Avatar.prototype.toString = function() {
  return '[' + this.name + ']';
};

/**
 * Reset this avatar to a starting state.
 */
Pond.Avatar.prototype.reset = function() {
  delete this.started;
  delete this.dead;
  delete this.speed;
  delete this.desiredSpeed;
  delete this.lastMissile;

  this.damage = this.startDamage_;
  this.loc.x = this.startLoc_.x;
  this.loc.y = this.startLoc_.y;
  // Face the centre.
  this.degree = Pond.Avatar.pointsToAngle(this.loc.x, this.loc.y, 50, 50);
  this.facing = this.degree;
  this.interpreter = null;
};

/**
 * Create an interpreter for this avatar.
 */
Pond.Avatar.prototype.initInterpreter = function() {
  var code = this.code_;
  if (typeof code == 'function') {
    code = code();
  } else if (typeof code != 'string') {
    throw Error('Duck "' + this.name + '" has invalid code: ' + code);
  }
  try {
    code = BlocklyAce.transpileToEs5(code) || code;
  } catch (e) {
    alert(e);
    throw Error('Duck "' + this.name + '" has error in code:\n' + e);
  }
  this.interpreter = new Interpreter(code, Pond.Battle.initInterpreter);
};

/**
 * Damage the avatar.
 * @param {number} add Amount of damage to add.
 */
Pond.Avatar.prototype.addDamage = function(add) {
  this.damage += add;
  if (this.damage >= 100) {
    this.die();
  }
};

/**
 * Kill this avatar.
 */
Pond.Avatar.prototype.die = function() {
  this.speed = 0;
  this.dead = true;
  this.damage = 100;
  Pond.Battle.RANK.unshift(this);
  Pond.Battle.EVENTS.push({'type': 'DIE', 'avatar': this});
  Pond.Battle.log(this + ' sinks.');
};

// API functions exposed to the user.

/**
 * Scan in a direction for the nearest avatar.
 * @param {number} degree Scan in this direction (wrapped to 0-360).
 * @param {number} opt_resolution Sensing resolution, 1 to 20 degrees.
 *   Defaults to 5.
 * @return {number} Distance (0 - ~141), or Infinity if no avatar detected.
 */
Pond.Avatar.prototype.scan = function(degree, opt_resolution) {
  var resolution;
  if (opt_resolution === undefined || opt_resolution === null) {
    resolution = 5;
  } else {
    resolution = opt_resolution;
  }
  if ((typeof degree != 'number') || isNaN(degree) ||
      (typeof resolution != 'number') || isNaN(resolution)) {
    throw TypeError();
  }
  degree = BlocklyGames.normalizeAngle(degree);
  resolution = Blockly.utils.math.clamp(resolution, 0, 20);

  Pond.Battle.EVENTS.push({'type': 'SCAN', 'avatar': this,
                            'degree': degree, 'resolution': resolution});

  // Compute both edges of the scan.
  var scan1 = BlocklyGames.normalizeAngle(degree - resolution / 2);
  var scan2 = BlocklyGames.normalizeAngle(degree + resolution / 2);
  if (scan1 > scan2) {
    scan2 += 360;
  }
  var locX = this.loc.x;
  var locY = this.loc.y;
  // Check every enemy for existence in the scan beam.
  var closest = Infinity;
  for (var i = 0, enemy; (enemy = Pond.Battle.AVATARS[i]); i++) {
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
    // Compute angle between avatar and enemy's centre.
    var angle = Math.atan2(ey - locY, ex - locX);
    angle = BlocklyGames.normalizeAngle(Blockly.utils.math.toDegrees(angle));
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
 * Commands the avatar to move in the specified heading at the specified speed.
 * @param {number} degree Heading (0-360).
 * @param {number} opt_speed Desired speed (0-100).  Defaults to 50.
 */
Pond.Avatar.prototype.drive = function(degree, opt_speed) {
  var speed;
  if (opt_speed === undefined || opt_speed === null) {
    speed = 50;
  } else {
    speed = opt_speed;
  }
  if ((typeof degree != 'number') || isNaN(degree) ||
      (typeof speed != 'number') || isNaN(speed)) {
    throw TypeError;
  }
  var desiredDegree = BlocklyGames.normalizeAngle(degree);
  if (this.degree != desiredDegree) {
    if (this.speed <= 50) {
      // Changes in direction can be negotiated at speeds of less than 50%.
      this.degree = BlocklyGames.normalizeAngle(degree);
      this.facing = this.degree;
    } else {
      // Stop the avatar if an over-speed turn was commanded.
      speed = 0;
    }
  }
  if (this.speed == 0 && speed > 0) {
    // If starting, bump the speed immediately so that avatars can see a change.
    this.speed = 0.1;
  }
  this.desiredSpeed = Blockly.utils.math.clamp(speed, 0, 100);
};

/**
 * Commands the avatar to stop.
 */
Pond.Avatar.prototype.stop = function() {
  this.desiredSpeed = 0;
};

/**
 * Commands the avatar to shoot in the specified heading at the specified range.
 * @param {number} degree Heading (0-360).
 * @param {number} range Distance to impact (0-70).
 * @return {boolean} True if cannon fired, false if still reloading from a
 *     previous shot.
 */
Pond.Avatar.prototype.cannon = function(degree, range) {
  if ((typeof degree != 'number') || isNaN(degree) ||
      (typeof range != 'number') || isNaN(range)) {
    throw TypeError;
  }
  var now = Date.now();
  if (this.lastMissile + Pond.Battle.RELOAD_TIME * 1000 > now) {
    return false;
  }
  this.lastMissile = now;
  var startLoc = new Blockly.utils.Coordinate(this.loc.x, this.loc.y);
  degree = BlocklyGames.normalizeAngle(degree);
  this.facing = degree;
  range = Blockly.utils.math.clamp(range, 0, 70);
  var endLoc = new Blockly.utils.Coordinate(
      startLoc.x + Pond.Avatar.angleDx(degree, range),
      startLoc.y + Pond.Avatar.angleDy(degree, range));
  var missile = {
    avatar: this,
    startLoc: startLoc,
    degree: degree,
    range: range,
    endLoc: endLoc,
    progress: 0
  };
  Pond.Battle.MISSILES.push(missile);
  Pond.Battle.EVENTS.push({'type': 'BANG', 'avatar': this,
      'degree': missile.degree});
  return true;
};


/**
 * For a given angle and radius, finds the X portion of the offset.
 * Copied from Closure's goog.math.angleDx.
 * @param {number} degrees Angle in degrees (zero points in +X direction).
 * @param {number} radius Radius.
 * @return {number} The x-distance for the angle and radius.
 */
Pond.Avatar.angleDx = function(degrees, radius) {
  return radius * Math.cos(Blockly.utils.math.toRadians(degrees));
};

/**
 * For a given angle and radius, finds the Y portion of the offset.
 * Copied from Closure's goog.math.angleDy.
 * @param {number} degrees Angle in degrees (zero points in +X direction).
 * @param {number} radius Radius.
 * @return {number} The y-distance for the angle and radius.
 */
Pond.Avatar.angleDy = function(degrees, radius) {
  return radius * Math.sin(Blockly.utils.math.toRadians(degrees));
};

/**
 * Computes the angle between two points (x1,y1) and (x2,y2).
 * Angle zero points in the +X direction, 90 degrees points in the +Y
 * direction (down) and from there we grow clockwise towards 360 degrees.
 * Copied from Closure's goog.math.angle.
 * @param {number} x1 x of first point.
 * @param {number} y1 y of first point.
 * @param {number} x2 x of second point.
 * @param {number} y2 y of second point.
 * @return {number} Standardized angle in degrees of the vector from
 *     x1,y1 to x2,y2.
 */
Pond.Avatar.pointsToAngle = function(x1, y1, x2, y2) {
  var angle = Blockly.utils.math.toDegrees(Math.atan2(y2 - y1, x2 - x1));
  return BlocklyGames.normalizeAngle(angle);
};
