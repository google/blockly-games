/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Creates an pond for avatars to compete in.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Pond.Battle');

goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.math');
goog.require('Pond.Avatar');


/**
 * List of avatars in this battle.
 * @type !Array<!Pond.Avatar>
 */
Pond.Battle.AVATARS = [];

/**
 * Ordered list of avatar with the best avatar first.
 * @type !Array<!Pond.Avatar>
 */
Pond.Battle.RANK = [];

/**
 * List of events to be visualized.
 * @type !Array<!Object>
 */
Pond.Battle.EVENTS = [];

/**
 * List of missiles in flight.
 * @type !Array<!Object>
 */
Pond.Battle.MISSILES = [];

/**
 * Speed of game execution.
 */
Pond.Battle.GAME_FPS = 50;

/**
 * Speed of avatar execution.
 */
Pond.Battle.STATEMENTS_PER_FRAME = 100;

/**
 * Number of seconds it takes to reload the cannon.
 */
Pond.Battle.RELOAD_TIME = .5;

/**
 * The avatar currently executing code.
 * @type Pond.Avatar
 */
Pond.Battle.currentAvatar = null;

/**
 * Speed of avatar movement.
 */
Pond.Battle.AVATAR_SPEED = 1;

/**
 * Speed of missile movement.
 */
Pond.Battle.MISSILE_SPEED = 3;

/**
 * Rate of acceleration.
 */
Pond.Battle.ACCELERATION = 5;

/**
 * Center to center distance for avatars to collide.
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
 * Stop and reset the battle.
 */
Pond.Battle.reset = function() {
  clearTimeout(Pond.Battle.pid);
  Pond.Battle.EVENTS.length = 0;
  Pond.Battle.MISSILES.length = 0;
  Pond.Battle.RANK.length = 0;
  Pond.Battle.ticks = 0;
  for (const avatar of Pond.Battle.AVATARS) {
    avatar.reset();
  }
};

/**
 * Start the battle executing.  Avatars should already be added.
 * @param {Function} doneCallback Function to call when game ends.
 */
Pond.Battle.start = function(doneCallback) {
  Pond.Battle.doneCallback_ = doneCallback;
  Pond.Battle.endTime_ = Date.now() + Pond.Battle.TIME_LIMIT;
  console.log('Starting battle with ' + Pond.Battle.AVATARS.length +
              ' avatars.');
  for (const avatar of Pond.Battle.AVATARS) {
    try {
      avatar.initInterpreter();
    } catch (e) {
      console.log(avatar + ' fails to load: ' + e);
      avatar.die();
    }
  }
  Pond.Battle.update();
};

/**
 * Update the avatars states.
 */
Pond.Battle.update = function() {
  // Execute a few statements.
  Pond.Battle.updateInterpreters_();
  // Update state of all missiles.
  Pond.Battle.updateMissiles_();
  // Update state of all avatars.
  Pond.Battle.updateAvatars_();
  if (Pond.Battle.AVATARS.length <= Pond.Battle.RANK.length + 1) {
    // Game over because there are less than two avatars.
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
};

Pond.Battle.stop = function() {
  // Add the survivors to the ranks based on their damage.
  const survivors = [];
  for (const avatar of Pond.Battle.AVATARS) {
    if (!avatar.dead) {
      survivors.push(avatar);
    }
  }
  const survivorCount = survivors.length;
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
  for (let i = Pond.Battle.MISSILES.length - 1; i >= 0; i--) {
    const missile = Pond.Battle.MISSILES[i];
    missile.progress += Pond.Battle.MISSILE_SPEED;
    let maxDamage = 0;
    if (missile.range - missile.progress < Pond.Battle.MISSILE_SPEED / 2) {
      // Boom.
      Pond.Battle.MISSILES.splice(i, 1);
      // Damage any avatar in range.
      for (const avatar of Pond.Battle.AVATARS) {
        if (avatar.dead) {
          continue;
        }
        const range = Blockly.utils.Coordinate.distance(avatar.loc, missile.endLoc);
        const damage = (1 - range / 4) * 10;
        if (damage > 0) {
          avatar.addDamage(damage);
          maxDamage = Math.max(maxDamage, damage);
        }
      }
      Pond.Battle.EVENTS.push({'type': 'BOOM', 'damage': maxDamage,
          'x': missile.endLoc.x, 'y': missile.endLoc.y});
    }
  }
};

/**
 * Update state of all avatars.
 * @private
 */
Pond.Battle.updateAvatars_ = function() {
  for (const avatar of Pond.Battle.AVATARS) {
    if (avatar.dead) {
      continue;
    }
    // Accelerate or decelerate.
    if (avatar.speed < avatar.desiredSpeed) {
      avatar.speed = Math.min(avatar.speed + Pond.Battle.ACCELERATION,
                              avatar.desiredSpeed);
    } else if (avatar.speed > avatar.desiredSpeed) {
      avatar.speed = Math.max(avatar.speed - Pond.Battle.ACCELERATION,
                              avatar.desiredSpeed);
    }
    // Move.
    if (avatar.speed > 0) {
      const tuple = Pond.Battle.closestNeighbour(avatar);
      const closestBefore = tuple[1];
      const angleRadians = Blockly.utils.math.toRadians(avatar.degree);
      const speed = avatar.speed / 100 * Pond.Battle.AVATAR_SPEED;
      const dx = Math.cos(angleRadians) * speed;
      const dy = Math.sin(angleRadians) * speed;
      avatar.loc.x += dx;
      avatar.loc.y += dy;
      if (avatar.loc.x < 0 || avatar.loc.x > 100 ||
          avatar.loc.y < 0 || avatar.loc.y > 100) {
        // Collision with wall.
        avatar.loc.x = Blockly.utils.math.clamp(avatar.loc.x, 0, 100);
        avatar.loc.y = Blockly.utils.math.clamp(avatar.loc.y, 0, 100);
        const damage = avatar.speed / 100 * Pond.Battle.COLLISION_DAMAGE;
        avatar.addDamage(damage);
        avatar.speed = 0;
        avatar.desiredSpeed = 0;
        Pond.Battle.EVENTS.push(
            {'type': 'CRASH', 'avatar': avatar, 'damage': damage});
      } else {
        const tuple = Pond.Battle.closestNeighbour(avatar);
        const [neighbour, closestAfter] = tuple;
        if (closestAfter < Pond.Battle.COLLISION_RADIUS &&
             closestBefore > closestAfter) {
          // Collision with another avatar.
          avatar.loc.x -= dx;
          avatar.loc.y -= dy;
          const damage = Math.max(avatar.speed, neighbour.speed) / 100 *
              Pond.Battle.COLLISION_DAMAGE;
          avatar.addDamage(damage);
          avatar.speed = 0;
          avatar.desiredSpeed = 0;
          neighbour.addDamage(damage);
          neighbour.speed = 0;
          neighbour.desiredSpeed = 0;
          Pond.Battle.EVENTS.push(
              {'type': 'CRASH', 'avatar': avatar, 'damage': damage},
              {'type': 'CRASH', 'avatar': neighbour, 'damage': damage});
        }
      }
    }
  }
};

/**
 * Let the avatars think.
 * @private
 */
Pond.Battle.updateInterpreters_ = function() {
  for (let i = 0; i < Pond.Battle.STATEMENTS_PER_FRAME; i++) {
    Pond.Battle.ticks++;
    for (const avatar of Pond.Battle.AVATARS) {
      if (avatar.dead) {
        continue;
      }
      Pond.Battle.currentAvatar = avatar;
      try {
        avatar.interpreter.step();
      } catch (e) {
        console.log(avatar + ' throws an error: ' + e);
        avatar.die();
      }
      Pond.Battle.currentAvatar = null;
    }
  }
};

/**
 * Inject the Pond API into a JavaScript interpreter.
 * @param {!Interpreter} interpreter The JS-Interpreter.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Pond.Battle.initInterpreter = function(interpreter, globalObject) {
  // API
  let wrapper;
  wrapper = function(value) {
    // Restrict logging to just numbers so that the console doesn't fill up
    // with 'problematic' messages when running 3rd party ducks.
    console.log(Pond.Battle.currentAvatar.name + ' logs: ' + Number(value));
  };
  wrap('log');

  wrapper = function(degree, resolution) {
    return Pond.Battle.currentAvatar.scan(degree, resolution);
  };
  wrap('scan');

  wrapper = function(degree, range) {
    return Pond.Battle.currentAvatar.cannon(degree, range);
  };
  wrap('cannon');

  wrapper = function(degree, speed) {
    Pond.Battle.currentAvatar.drive(degree, speed);
  };
  wrap('drive');
  wrap('swim');

  wrapper = function() {
    Pond.Battle.currentAvatar.stop();
  };
  wrap('stop');

  wrapper = function() {
    return Pond.Battle.currentAvatar.damage;
  };
  wrap('damage');

  wrapper = function() {
    return 100 - Pond.Battle.currentAvatar.damage;
  };
  wrap('health');

  wrapper = function() {
    return Pond.Battle.currentAvatar.speed;
  };
  wrap('speed');

  wrapper = function() {
    return Pond.Battle.currentAvatar.loc.x;
  };
  wrap('loc_x');
  wrap('getX');

  wrapper = function() {
    return Pond.Battle.currentAvatar.loc.y;
  };
  wrap('loc_y');
  wrap('getY');

  function wrap(name) {
    interpreter.setProperty(globalObject, name,
        interpreter.createNativeFunction(wrapper, false));
  }

  const myMath = interpreter.getProperty(globalObject, 'Math');
  if (myMath) {
    wrapper = function(number) {
      return Math.sin(Blockly.utils.math.toRadians(number));
    };
    wrapMath('sin_deg');

    wrapper = function(number) {
      return Math.cos(Blockly.utils.math.toRadians(number));
    };
    wrapMath('cos_deg');

    wrapper = function(number) {
      return Math.tan(Blockly.utils.math.toRadians(number));
    };
    wrapMath('tan_deg');

    wrapper = function(number) {
      return Blockly.utils.math.toDegrees(Math.asin(number));
    };
    wrapMath('asin_deg');

    wrapper = function(number) {
      return Blockly.utils.math.toDegrees(Math.acos(number));
    };
    wrapMath('acos_deg');

    wrapper = function(number) {
      return Blockly.utils.math.toDegrees(Math.atan(number));
    };
    wrapMath('atan_deg');

    function wrapMath(name) {
      interpreter.setProperty(myMath, name,
          interpreter.createNativeFunction(wrapper, false));
    }
  }
};

/**
 * Finds the distance between the given avatar and its nearest neighbour.
 * @param {!Pond.Avatar} avatar The avatar to find distances from.
 * @returns {!Array} Tuple of closest avatar and distance to that avatar.
 */
Pond.Battle.closestNeighbour = function(avatar) {
  let closest = null;
  let distance = Infinity;
  for (const neighbour of Pond.Battle.AVATARS) {
    if (!neighbour.dead && avatar !== neighbour) {
      const thisDistance = Math.min(distance,
          Blockly.utils.Coordinate.distance(avatar.loc, neighbour.loc));
      if (thisDistance < distance) {
        distance = thisDistance;
        closest = neighbour;
      }
    }
  }
  return [closest, distance];
};
