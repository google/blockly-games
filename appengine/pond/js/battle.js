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
 * @fileoverview Creates an pond for players to compete in.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Pond.Battle');

goog.require('Pond.Player');
goog.require('goog.math');
goog.require('goog.math.Coordinate');


/**
 * List of players in this battle.
 * @type !Array.<!Pond.Player>
 */
Pond.Battle.PLAYERS = [];

/**
 * Ordered list of player with the best player first.
 * @type !Array.<!Pond.Player>
 */
Pond.Battle.RANK = [];

/**
 * List of events to be visualized.
 * @type !Array.<!Object>
 */
Pond.Battle.EVENTS = [];

/**
 * List of missiles in flight.
 * @type !Array.<!Object>
 */
Pond.Battle.MISSILES = [];

/**
 * Speed of game execution.
 */
Pond.Battle.GAME_FPS = 50;

/**
 * Speed of player execution.
 */
Pond.Battle.STATEMENTS_PER_FRAME = 100;

/**
 * Number of seconds it takes to reload the cannon.
 */
Pond.Battle.RELOAD_TIME = .5;

/**
 * The player currently executing code.
 * @type Pond.Player
 */
Pond.Battle.currentPlayer = null;

/**
 * Speed of player movement.
 */
Pond.Battle.PLAYER_SPEED = 1;

/**
 * Speed of missile movement.
 */
Pond.Battle.MISSILE_SPEED = 3;

/**
 * Rate of acceleration.
 */
Pond.Battle.ACCELERATION = 5;

/**
 * Center to center distance for players to collide.
 */
Pond.Battle.COLLISION_RADIUS = 5;

/**
 * Damage from worst-case collision.
 */
Pond.Battle.COLLISION_DAMAGE = 3;

/**
 * PID of executing task.
 */
Pond.Battle.pid = 0;

/**
 * Time to end the battle.
 * @private
 */
Pond.Battle.endTime_ = 0;

/**
 * Number of ticks used in battle.
 */
Pond.Battle.ticks = 0;

/**
 * Time limit of game (in milliseconds).
 */
Pond.Battle.TIME_LIMIT = 5 * 60 * 1000;

/**
 * Callback function for end of game.
 * @type Function
 */
Pond.Battle.doneCallback_ = null;

/**
 * Starting positions for players.
 */
Pond.Battle.START_XY = [
  new goog.math.Coordinate(10, 90),
  new goog.math.Coordinate(90, 10),
  new goog.math.Coordinate(10, 10),
  new goog.math.Coordinate(90, 90),
  // Only first four positions are currently used.
  new goog.math.Coordinate(50, 99),
  new goog.math.Coordinate(50, 1),
  new goog.math.Coordinate(1, 50),
  new goog.math.Coordinate(99, 50),
  new goog.math.Coordinate(50, 49)
];

/**
 * Stop and reset the battle.
 */
Pond.Battle.reset = function() {
  clearTimeout(Pond.Battle.pid);
  Pond.Battle.EVENTS.length = 0;
  Pond.Battle.MISSILES.length = 0;
  Pond.Battle.RANK.length = 0;
  Pond.Battle.ticks = 0;
  for (var i = 0, player; player = Pond.Battle.PLAYERS[i]; i++) {
    player.reset();
  }
};

/**
 * Create player and add it to the battle.
 * @param {string} name Name of player.
 * @param {string|!Function} code Player's code, or a code generator.
 * @param {goog.math.Coordinate} opt_startLoc Start location.
 * @param {?number} opt_startDamage Initial damage to player (0-100, default 0).
 */
Pond.Battle.addPlayer = function(name, code, opt_startLoc, opt_startDamage) {
  if (!opt_startLoc) {
    var i = Pond.Battle.PLAYERS.length;
    opt_startLoc = Pond.Battle.START_XY[i];
  }
  var player = new Pond.Player(name, code, opt_startLoc, opt_startDamage,
                               Pond.Battle);
  Pond.Battle.PLAYERS.push(player);
};

/**
 * Start the battle executing.  Players should already be added.
 * @param {Function} doneCallback Function to call when game ends.
 */
Pond.Battle.start = function(doneCallback) {
  Pond.Battle.doneCallback_ = doneCallback;
  Pond.Battle.endTime_ = Date.now() + Pond.Battle.TIME_LIMIT;
  console.log('Starting battle with ' + Pond.Battle.PLAYERS.length +
              ' players.');
  Pond.Battle.update();
};

/**
 * Update the players states.
 */
Pond.Battle.update = function() {
  // Execute a few statements.
  Pond.Battle.updateInterpreters_();
  // Update state of all missiles.
  Pond.Battle.updateMissiles_();
  // Update state of all players.
  Pond.Battle.updatePlayers_();
  if (Pond.Battle.PLAYERS.length <= Pond.Battle.RANK.length + 1) {
    // Game over because there are less than two players.
    // Schedule the game to end in a second.
    Pond.Battle.endTime_ = Math.min(Pond.Battle.endTime_, Date.now() + 1000);
  }
  if (Date.now() > Pond.Battle.endTime_) {
    // Timeout reached.  End the game.
    Pond.Battle.stop();
  } else {
    // Do it all again in a moment.
    Pond.Battle.pid =
        setTimeout(Pond.Battle.update, 1000 / Pond.Battle.GAME_FPS);
  }
}

Pond.Battle.stop = function() {
  // Add the survivors to the ranks based on their damage.
  var survivors = [];
  for (var i = 0, player; player = Pond.Battle.PLAYERS[i]; i++) {
    if (!player.dead) {
      survivors.push(player);
    }
  }
  var survivorCount = survivors.length;
  survivors.sort(function(a, b) {return a.damage - b.damage;});
  while (survivors.length) {
    Pond.Battle.RANK.unshift(survivors.pop());
  }
  // Fire any callback.
  Pond.Battle.doneCallback_ && Pond.Battle.doneCallback_(survivorCount);
};

/**
 * Update state of all missiles.
 * @private
 */
Pond.Battle.updateMissiles_ = function() {
  for (var i = Pond.Battle.MISSILES.length - 1; i >= 0; i--) {
    var missile = Pond.Battle.MISSILES[i]
    missile.progress += Pond.Battle.MISSILE_SPEED;
    var maxDamage = 0;
    if (missile.range - missile.progress < Pond.Battle.MISSILE_SPEED / 2) {
      // Boom.
      Pond.Battle.MISSILES.splice(i, 1);
      // Damage any player in range.
      for (var j = 0, player; player = Pond.Battle.PLAYERS[j]; j++) {
        if (player.dead) {
          continue;
        }
        var range = goog.math.Coordinate.distance(player.loc, missile.endLoc);
        var damage = (1 - range / 4) * 10;
        if (damage > 0) {
          player.addDamage(damage);
          maxDamage = Math.max(maxDamage, damage);
        }
      }
      Pond.Battle.EVENTS.push({'type': 'BOOM', 'damage': maxDamage,
          'x': missile.endLoc.x, 'y': missile.endLoc.y});
    }
  }
};

/**
 * Update state of all players.
 * @private
 */
Pond.Battle.updatePlayers_ = function() {
  for (var i = 0, player; player = Pond.Battle.PLAYERS[i]; i++) {
    if (player.dead) {
      continue;
    }
    // Accelerate or decelerate.
    if (player.speed < player.desiredSpeed) {
      player.speed = Math.min(player.speed + Pond.Battle.ACCELERATION,
                              player.desiredSpeed);
    } else if (player.speed > player.desiredSpeed) {
      player.speed = Math.max(player.speed - Pond.Battle.ACCELERATION,
                              player.desiredSpeed);
    }
    // Move.
    if (player.speed > 0) {
      var tuple = Pond.Battle.closestNeighbour(player);
      var closestBefore = tuple[1];
      var angleRadians = goog.math.toRadians(player.degree);
      var speed = player.speed / 100 * Pond.Battle.PLAYER_SPEED;
      var dx = Math.cos(angleRadians) * speed;
      var dy = Math.sin(angleRadians) * speed;
      player.loc.x += dx;
      player.loc.y += dy;
      if (player.loc.x < 0 || player.loc.x > 100 ||
          player.loc.y < 0 || player.loc.y > 100) {
        // Collision with wall.
        player.loc.x = goog.math.clamp(player.loc.x, 0, 100);
        player.loc.y = goog.math.clamp(player.loc.y, 0, 100);
        var damage = player.speed / 100 * Pond.Battle.COLLISION_DAMAGE;
        player.addDamage(damage);
        player.speed = 0;
        player.desiredSpeed = 0;
        Pond.Battle.EVENTS.push(
            {'type': 'CRASH', 'player': player, 'damage': damage});
      } else {
        var tuple = Pond.Battle.closestNeighbour(player);
        var neighbour = tuple[0];
        var closestAfter = tuple[1];
        if (closestAfter < Pond.Battle.COLLISION_RADIUS &&
             closestBefore > closestAfter) {
          // Collision with another player.
          player.loc.x -= dx;
          player.loc.y -= dy;
          var damage = Math.max(player.speed, neighbour.speed) / 100 *
              Pond.Battle.COLLISION_DAMAGE;
          player.addDamage(damage);
          player.speed = 0;
          player.desiredSpeed = 0;
          neighbour.addDamage(damage);
          neighbour.speed = 0;
          neighbour.desiredSpeed = 0;
          Pond.Battle.EVENTS.push(
              {'type': 'CRASH', 'player': player, 'damage': damage});
          Pond.Battle.EVENTS.push(
              {'type': 'CRASH', 'player': neighbour, 'damage': damage});
        }
      }
    }
  }
};

/**
 * Let the players think.
 * @private
 */
Pond.Battle.updateInterpreters_ = function() {
  for (var j = 0; j < Pond.Battle.STATEMENTS_PER_FRAME; j++) {
    Pond.Battle.ticks++;
    for (var i = 0, player; player = Pond.Battle.PLAYERS[i]; i++) {
      if (player.dead) {
        continue;
      }
      Pond.Battle.currentPlayer = player;
      try {
        player.interpreter.step();
      } catch (e) {
        console.log(player + ' throws an error: ' + e);
        console.dir(player.interpreter.stateStack);
        player.die();
      }
      Pond.Battle.currentPlayer = null;
    }
  }
};

/**
 * Inject the Pond API into a JavaScript interpreter.
 * @param {!Object} scope Global scope.
 * @param {!Interpreter} interpreter The JS interpreter.
 */
Pond.Battle.initInterpreter = function(interpreter, scope) {
  // API
  var wrapper;
  wrapper = function(degree, resolution) {
    return interpreter.createPrimitive(
        Pond.Battle.currentPlayer.scan(degree && degree.valueOf(),
            resolution && resolution.valueOf()));
  };
  interpreter.setProperty(scope, 'scan',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(degree, range) {
    return interpreter.createPrimitive(
        Pond.Battle.currentPlayer.cannon(degree && degree.valueOf(),
            range && range.valueOf()));
  };
  interpreter.setProperty(scope, 'cannon',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(degree, speed) {
    Pond.Battle.currentPlayer.drive(degree && degree.valueOf(),
        speed && speed.valueOf());
  };
  interpreter.setProperty(scope, 'drive',
      interpreter.createNativeFunction(wrapper));
  interpreter.setProperty(scope, 'swim',
      interpreter.createNativeFunction(wrapper));

  wrapper = function() {
    Pond.Battle.currentPlayer.stop();
  };
  interpreter.setProperty(scope, 'stop',
      interpreter.createNativeFunction(wrapper));

  wrapper = function() {
    return interpreter.createPrimitive(Pond.Battle.currentPlayer.damage);
  };
  interpreter.setProperty(scope, 'damage',
      interpreter.createNativeFunction(wrapper));

  wrapper = function() {
    return interpreter.createPrimitive(100 - Pond.Battle.currentPlayer.damage);
  };
  interpreter.setProperty(scope, 'health',
      interpreter.createNativeFunction(wrapper));

  wrapper = function() {
    return interpreter.createPrimitive(Pond.Battle.currentPlayer.speed);
  };
  interpreter.setProperty(scope, 'speed',
      interpreter.createNativeFunction(wrapper));

  wrapper = function() {
    return interpreter.createPrimitive(Pond.Battle.currentPlayer.loc.x);
  };
  interpreter.setProperty(scope, 'loc_x',
      interpreter.createNativeFunction(wrapper));

  wrapper = function() {
    return interpreter.createPrimitive(Pond.Battle.currentPlayer.loc.y);
  };
  interpreter.setProperty(scope, 'loc_y',
      interpreter.createNativeFunction(wrapper));

  var myMath = interpreter.getProperty(scope, 'Math');
  if (myMath != interpreter.UNDEFINED) {
    wrapper = function(number) {
      return interpreter.createPrimitive(
          Math.sin((number && number.valueOf()) / 180 * Math.PI));
    };
    interpreter.setProperty(myMath, 'sin_deg',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(number) {
      return interpreter.createPrimitive(
          Math.cos((number && number.valueOf()) / 180 * Math.PI));
    };
    interpreter.setProperty(myMath, 'cos_deg',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(number) {
      return interpreter.createPrimitive(
          Math.tan((number && number.valueOf()) / 180 * Math.PI));
    };
    interpreter.setProperty(myMath, 'tan_deg',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(number) {
      return interpreter.createPrimitive(
          Math.asin(number && number.valueOf()) / Math.PI * 180);
    };
    interpreter.setProperty(myMath, 'asin_deg',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(number) {
      return interpreter.createPrimitive(
          Math.acos(number && number.valueOf()) / Math.PI * 180);
    };
    interpreter.setProperty(myMath, 'acos_deg',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(number) {
      return interpreter.createPrimitive(
          Math.atan(number && number.valueOf()) / Math.PI * 180);
    };
    interpreter.setProperty(myMath, 'atan_deg',
        interpreter.createNativeFunction(wrapper));
  }
};

/**
 * Finds the distance between the given player and its nearest neighbour.
 * @param {!Pond.Player} player The player to find distances from.
 * @return {!Array} Tuple of closest player and distance to that player.
 */
Pond.Battle.closestNeighbour = function(player) {
  var closest = null;
  var distance = Infinity;
  for (var i = 0, neighbour; neighbour = Pond.Battle.PLAYERS[i]; i++) {
    if (!neighbour.dead && player != neighbour) {
      var thisDistance = Math.min(distance,
          goog.math.Coordinate.distance(player.loc, neighbour.loc));
      if (thisDistance < distance) {
        distance = thisDistance;
        closest = neighbour;
      }
    }
  }
  return [closest, distance];
};
