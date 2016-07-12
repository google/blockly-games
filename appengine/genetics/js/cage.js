/**
 * Blockly Games: Genetics
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview JavaScript for the game logic for the Genetics game.
 * @author kozbial@google.com (Monica Kozbial)
 */
'use strict';

goog.provide('Genetics.Cage');

goog.require('Genetics');
goog.require('Genetics.Mouse');

/**
 * The maximum population in a cage.
 * @type {number}
 */
Genetics.Cage.MAX_POPULATION = 10;

/**
 * The size that is assigned to a first generation mouse
 * @type {number}
 */
Genetics.Cage.START_SIZE = 10;

/**
 * Number of fights that a first generation mouse will pass on to its
 * children.
 * @type {number}
 */
Genetics.Cage.START_AGGRESSIVENESS = 2;

/**
 * The number of mating attempts that a first generation mouse starts with.
 * @type {number}
 */
Genetics.Cage.START_FERTILITY = 4;

/**
 * The smallest change that a mutation in assigning mouse stats can be.
 * @type {number}
 */
Genetics.Cage.MIN_MUTATION = -2;

/**
 * The greatest change that a mutation in assigning mouse stats can be.
 * @type {number}
 */
Genetics.Cage.MAX_MUTATION = 2;

/**
 * The minimum size of a mouse.
 * @type {number}
 */
Genetics.Cage.MIN_SIZE = 1;

/**
 * The maximum size of a mouse.
 * @type {number}
 */
Genetics.Cage.MAX_SIZE = 10;

// TODO(kozbial) determine if needed and add comment.
Genetics.Cage.TEMPO = 200;

/**
 * Mapping of player id to and array with player name and code.
 * @type {!Object.<number, Array.<string>>}
 */
Genetics.Cage.PLAYERS = {};

/**
 * List of ids of mice currently alive.
 * @type {!Array.<number>}
 * @private
 */
Genetics.Cage.aliveMice_ = [];

/**
 * Mapping of mouse id to mouse for quick lookup.
 * @type {!Object.<number, Genetics.Mouse>}
 * @private
 */
Genetics.Cage.miceMap_ = {};

/**
 * Mapping of mouse id to pid of life simulation for that mouse.
 * @type {!Object.<number, number>}
 * @private
 */
Genetics.Cage.mouseLife_ = {};

/**
 * Whether the simulation is running without a visualization.
 * @type {boolean}
 */
Genetics.Cage.HEADLESS = false;

/**
 * List of events to be visualized.
 * @type {!Array.<!Object>}
 */
Genetics.Cage.EVENTS = [];

/**
 * Template for event properties.
 * @type {Object.<string, Array.<string>>}
 */
Genetics.Cage.EVENT_TEMPLATE = {
  ADD: ['TYPE', 'MOUSE'],
  MATE: ['TYPE', 'ID', 'RESULT', 'OPT_PARTNER'],
  BIRTH: ['TYPE', 'PARENT_IDS', 'MOUSE'],
  FIGHT: ['TYPE', 'ID', 'RESULT', 'OPT_OPPONENT'],
  // A mouse dies after using all fight and mate opportunities.
  RETIRE: ['TYPE', 'ID'],
  // The oldest mouse dies when there is no room for it.
  OVERPOPULATION: ['TYPE', 'ID'],
  // A mouse dies if it throws an exception.
  EXPLOSION: ['TYPE', 'ID'],
  END_GAME: ['TYPE', 'PICK_FIGHT_WINNER', 'CHOOSE_MATE_WINNER',
    'MATE_ANSWER_WINNER']
};

/**
 * Creates an event.
 * @param {string } type The type of event.
 * @param {...string|Array.<number>|Genetics.Mouse} var_args The properties on
 * the event.
 * @constructor
 */
Genetics.Cage.Event = function(type, var_args) {
  var template = Genetics.Cage.EVENT_TEMPLATE[type];
  for(var i = 0; i < template.length; i++) {
    this[template[i]] = arguments[i];
  }
};

/**
 * Adds the event to the queue depending on the mode the game is running as.
 */
Genetics.Cage.Event.prototype.addToQueue = function() {
  // Headless does not need to keep track of events that are not end game.
  if(Genetics.Cage.HEADLESS &&
    this.TYPE != Genetics.Cage.EVENT_TEMPLATE.END_GAME) {
    return;
  }
  Genetics.Cage.EVENTS.push(this);
};

/**
 * PID of executing task.
 * @type {number}
 */
Genetics.Cage.pid = 0;

/**
 * Time to end the battle.
 * @type {number}
 * @private
 */
Genetics.Cage.endTime_ = 0;

/**
 * Time limit of game (in milliseconds).
 * @type {number}
 */
Genetics.Cage.TIME_LIMIT = 5 * 60 * 1000;

/**
 * The next available player id.
 * @type {number}
 * @private
 */
Genetics.Cage.playerId_ = 0;

/**
 * The next available mouse id.
 * @type {number}
 * @private
 */
Genetics.Cage.mouseId_ = 0;

/**
 * Callback function for end of game.
 * @type {Function}
 * @private
 */
Genetics.Cage.doneCallback_ = null;


/**
 * Stop and reset the cage.
 */
Genetics.Cage.reset = function() {
  clearTimeout(Genetics.Cage.pid);
  Genetics.Cage.EVENTS.length = 0;
  Genetics.Cage.aliveMice_.length = 0;
  // Cancel all queued life simulations.
  for (var mouseId in Genetics.Cage.mouseLife_) {
    clearTimeout(Genetics.Cage.mouseLife_[mouseId]);
  }
  Genetics.Cage.miceMap_ = {};
  Genetics.Cage.mouseLife_ = {};
  Genetics.Cage.mouseId_ = 0;
};

/**
 * Adds a player to the game.
 * @param {string} playerName The name of the player to be added.
 * @param {string|!Function} code Player's code, or generator.
 */
Genetics.Cage.addPlayer = function(playerName, code) {
  // Assign a unique id to the player and add to the game.
  var id = Genetics.Cage.playerId_++;
  Genetics.Cage.PLAYERS[id] = [playerName, code];
};

/**
 * Start the Cage simulation. Players should be already added
 * @param {Function} doneCallback Function to call when game ends.
 */
Genetics.Cage.start = function(doneCallback) {
  Genetics.Cage.doneCallback_ = doneCallback;
  // Create a mouse for each player.
  for (var i = 0, player; player = Genetics.Cage.PLAYERS[i]; i++) {
    var mouseId = Genetics.Cage.mouseId_++;
    var mouse = new Genetics.Mouse(mouseId, null, null, player);
    Genetics.Cage.aliveMice_[mouse.id] = mouse;
    Genetics.Cage.life(mouse); // Queue life simulation for mouse.
    new Genetics.Cage.Event('ADD', mouse).addToQueue();
  }
  Genetics.Cage.endTime_ = Date.now() + Genetics.Cage.TIME_LIMIT;
  console.log('Starting game with ' + Genetics.Cage.PLAYERS +
      ' players.');
};

/**
 * Queues life simulation for mouse.
 */
Genetics.Cage.life = function(mouse) {
  // Queue life simulation for mouse with some variation in timeout to allow for
  // variation in order.
  var lifeID = setTimeout(goog.bind(Genetics.Cage.simulateLife, mouse),
      10 * Math.random());
  Genetics.Cage.mouseLife_[mouse.id] = lifeID;
};

/**
 * Runs life simulation on mouse.
 */
Genetics.Cage.simulateLife = function(mouse) {
  // Remove life from mapping of lives that are queued to run.
  delete Genetics.Cage.mouseLife_[mouse.id];
  // Age mouse.
  mouse.age++;
  // If mouse has fight left in it, start a fight with another mouse.
  if (mouse.aggressiveness > 0) {
    Genetics.Cage.instigateFight(mouse);
    mouse.aggressiveness--;
  }
  // If mouse is still fertile, try to breed with another mice.
  else if (mouse.fertility > 0) {
    Genetics.Cage.tryMate(mouse);
    mouse.fertility--;
  }
  // If mouse has finished fighting and breeding, it dies.
  else {
    new Genetics.Cage.Event('RETIRE', mouse.id).addToQueue();
    Genetics.Cage.death(mouse);
  }
  // Queue life simulation again if mouse is still alive.
  if (Genetics.Cage.isAlive(mouse)) {
    Genetics.Cage.life(mouse);
  }
  // Check for end game.
  Genetics.Cage.checkForEnd();
};

/**
 * Gets requested opponent of mouse, attempts fight and kills losing mouse.
 * @param {Genetics.Mouse} mouse The mouse to initiate fighting.
 */
Genetics.Cage.instigateFight = function(mouse) {
  try {
    var opponentID = null; // TODO run pickFight in interpreter
    var opponent = Genetics.Cage.miceMap_[opponentID];
    // Check if opponent doesn't exist.
    if (!opponent) {
      new Genetics.Cage.Event('FIGHT', mouse.id, 'NONE').addToQueue();
      mouse.aggressiveness = 0;
      return;
    }
  } catch (err) {
    new Genetics.Cage.Event('EXPLOSION', mouse.id, 'PICK_FIGHT').addToQueue();
    return;
  }
  // Check if opponent is itself.
  if (mouse.id == opponent.id) {
    new Genetics.Cage.Event('FIGHT', mouse.id, 'SELF').addToQueue();
    Genetics.Cage.death(mouse);
    return;
  }

  // Compute winner proportional to the size;
  var result = Math.random() - mouse.size / (mouse.size + opponent.size);
  if (result < 0) { // If fight proposer won.
    new Genetics.Cage.Event('FIGHT', mouse.id, 'WIN', opponent.id).addToQueue();
    Genetics.Cage.death(opponent);
  }
  else if (result == 0) { // If it was a tie.
    new Genetics.Cage.Event('FIGHT', mouse.id, 'TIE', opponent.id).addToQueue();
  } else { // If opponent won.
    new Genetics.Cage.Event('FIGHT', mouse.id, 'LOSE', opponent.id).addToQueue();
    Genetics.Cage.death(mouse);
  }
};

/**
 * Gets requested mate of mouse, attempts mating and starts life of any
 * resultant child.
 * @param {Genetics.Mouse} mouse The mouse to initiate mating.
 */
Genetics.Cage.tryMate = function(mouse) {
  try {
    var targetMateID = null;  // TODO run mateQuestion in interpreter
    var targetMate = Genetics.Cage.miceMap_[targetMateID];
    // Check if mate is null or undefined.
    if (!targetMate) {
      new Genetics.Cage.Event('MATE', mouse.id, 'NONE').addToQueue();
      mouse.fertility = 0;
      return;
    }
  } catch (err) {
    new Genetics.Cage.Event('EXPLOSION', mouse.id, 'CHOOSE_MATE').addToQueue();
    return;
  }
  if (Genetics.Cage.willMateSucceed(mouse, targetMate)) {
    targetMate.fertility--;
    // Create offspring with these mice.
    var mouseId = Genetics.Cage.mouseId_++;
    var child = new Genetics.Mouse(mouseId, mouse, targetMate);
    Genetics.Cage.born(child, mouse.id, targetMate.id);
    // Accounts for overpopulation.
    while (Genetics.Cage.aliveMice_.length > Genetics.Cage.MAX_POPULATION) {
      // Find oldest mouse.
      var oldestMouse = Genetics.Cage.miceMap_[Genetics.Cage.aliveMice_[0]];
      for (var i = 1; i < Genetics.Cage.aliveMice_.length; i++) {
        var aliveMouse = Genetics.Cage.miceMap_[Genetics.Cage.aliveMice_[i]];
        if(!oldestMouse || aliveMouse.age > oldestMouse.age) {
          oldestMouse = aliveMouse;
        }
      }
      // Kill oldest mouse.
      new Genetics.Cage.Event('OVERPOPULATION', oldestMouse.id).addToQueue();
      Genetics.Cage.death(oldestMouse);
    }
  }
};

/**
 * Checks whether a mate between the two mice will succeed.
 * @param {Genetics.Mouse} proposingMouse The mouse that is proposing to mate.
 * @param {Genetics.Mouse} askedMouse The mouse that is being asked to mate.
 * @return {boolean} Whether the mate succeeds.
 */
Genetics.Cage.willMateSucceed = function(proposingMouse, askedMouse) {
  // Check if mice are the same.
  if (proposingMouse.id == askedMouse.id) {
    new Genetics.Cage.Event('MATE', proposingMouse.id, 'SELF').addToQueue();
    return false;
  }
  // Check if mice are not of compatible sex.
  if (proposingMouse.sex != Genetics.Mouse.Sex.HERMAPHRODITE &&
      proposingMouse.sex == askedMouse.sex) {
    new Genetics.Cage.Event('MATE', proposingMouse.id, 'INCOMPATIBLE',
        askedMouse.id).addToQueue();
    return false;
  }
  // Check if other mouse is infertile.
  if (askedMouse.fertility < 1) {
    new Genetics.Cage.Event('MATE', proposingMouse.id, 'INFERTILE',
        askedMouse.id).addToQueue();
    return false;
  }
  // Ask second mouse whether it will mate with the proposing mouse.
  try {
    // TODO run askedMouse.mateAnswer(proposingMouse) in interpreter
    var success = null;
    if (!success) {
      new Genetics.Cage.Event('MATE', proposingMouse.id, 'REJECTION',
          askedMouse.id).addToQueue();
      return false;
    }
  } catch (err) {
    new Genetics.Cage.Event('EXPLOSION', askedMouse.id, 'MATE_ANSWER')
        .addToQueue();
    Genetics.Cage.death(askedMouse);
    return false;
  }
  return true;
};

/**
 * Adds the mouse to the cage.
 * @param {Genetics.Mouse} mouse The mouse to add to the cage.
 * @param {number} parentOneId The ID of the parent of the mouse.
 * @param {number} parentTwoId The ID of the parent of the mouse.
 */
Genetics.Cage.born = function(mouse, parentOneId, parentTwoId) {
  // Adds child to population.
  Genetics.Cage.aliveMice_.push(mouse);
  Genetics.Cage.miceMap_[mouse.id] = mouse;
  new Genetics.Cage.Event('BIRTH', [parentOneId, parentTwoId], mouse)
      .addToQueue();
  Genetics.Cage.life(mouse);
};

/**
 * Kills the mouse.
 * @param {Genetics.Mouse} mouse The mouse to kill.
 */
Genetics.Cage.death = function(mouse) {
  var index = Genetics.Cage.aliveMice_.indexOf(mouse);
  if (index > -1) {
    Genetics.Cage.aliveMice_.splice(index, 1);
  }
  delete Genetics.Cage.miceMap_[mouse.id];
  clearTimeout(Genetics.Cage.mouseLife_[mouse.id]);
  delete Genetics.Cage.mouseLife_[mouse.id];
};

/**
 * Checks if mouse is alive.
 * @return {boolean} True if mouse is alive, false otherwise.
 */
Genetics.Cage.isAlive = function(mouse) {
  return (Genetics.Cage.aliveMice_.indexOf(mouse) > -1);
};

/**
 * Stops the game if end condition is met.
 */
Genetics.Cage.checkForEnd = function() {
  // Check if there are no mice left.
  if (Genetics.Cage.aliveMice_.length == 0) {
    Genetics.Cage.end();
    return;
  }
  // Check if there is one mouse left.
  else if (Genetics.Cage.aliveMice_.length == 1) {
    var aliveMouse = Genetics.Cage.aliveMice_[0];
    Genetics.Cage.end(aliveMouse.pickFightOwner, aliveMouse.chooseMateOwner,
        aliveMouse.mateAnswerOwner);
    return;
  }
  // Check if there's no possible mate pairings left.
  var potentialMate = null;
  var matesExist = false;
  for (var i = 0; i < Genetics.Cage.aliveMice_.length; i++) {
    var mouse = Genetics.Cage.aliveMice_[i];
    if (mouse.fertility > 0) {
      if (!potentialMate) {
        potentialMate = mouse;
      }
      else if (potentialMate.sex == Genetics.Mouse.Sex.HERMAPHRODITE ||
          potentialMate.sex != mouse.sex) {
        matesExist = true;
        break;
      }
    }
  }
  // Check which genes have won.
  var pickFightWinner = Genetics.Cage.aliveMice_[0].pickFightOwner;
  var mateQuestionWinner = Genetics.Cage.aliveMice_[0].chooseMateOwner;
  var mateAnswerWinner = Genetics.Cage.aliveMice_[0].mateAnswerOwner;
  for (var i = 1; i < Genetics.Cage.aliveMice_.length; i++) {
    var mouse = Genetics.Cage.aliveMice_[i];
    if (pickFightWinner && pickFightWinner != mouse.pickFightOwner) {
      pickFightWinner = null;
    }
    if (mateQuestionWinner && mateQuestionWinner != mouse.chooseMateOwner) {
      mateQuestionWinner = null;
    }
    if (mateAnswerWinner && mateAnswerWinner != mouse.mateAnswerOwner) {
      mateAnswerWinner = null;
    }
    if (!pickFightWinner && !mateQuestionWinner && !mateAnswerWinner) {
      break;
    }
  }
  // If the game is stalemated because there are no mate pairings left or if
  // there is a winner for all functions.
  if (!matesExist ||
      (pickFightWinner && mateQuestionWinner && mateAnswerWinner)) {
    Genetics.Cage.end(pickFightWinner, mateQuestionWinner, mateAnswerWinner);
  }
};

/**
 * Clears queued events for end of simulation.
 * @param {string=} opt_pickFightWinner The owner of all the pickFight functions in alive mice.
 * @param {string=} opt_chooseMateWinner The owner of all the chooseMate functions in alive mice.
 * @param {string=} opt_mateAnswerWinner The owner of all the mateAnswer functions in alive mice.
 */
Genetics.Cage.end = function(opt_pickFightWinner, opt_chooseMateWinner, opt_mateAnswerWinner) {
  // Cancel all queued life simulations.
  for (var mouseId in Genetics.Cage.mouseLife_) {
    clearTimeout(Genetics.Cage.mouseLife_[mouseId]);
  }
  var pickFightWinner = opt_pickFightWinner || 'NONE';
  var chooseMateWinner = opt_chooseMateWinner || 'NONE';
  var mateAnswerWinner = opt_mateAnswerWinner || 'NONE';
  new Genetics.Cage.Event('END_GAME', pickFightWinner, chooseMateWinner,
      mateAnswerWinner).addToQueue();
};

