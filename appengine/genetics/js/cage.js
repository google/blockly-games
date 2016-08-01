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

goog.require('Genetics.Mouse');

/**
 * The maximum population in a cage.
 * @type {number}
 */
Genetics.Cage.MAX_POPULATION = 10;

/**
 * The number of mice added to the cage for each player at the start of the
 * game. Should be less than MAX_POPULATION / number of players.
 * @type {number}
 */
Genetics.Cage.START_MICE_PER_PLAYER = 2;

/**
 * Whether the simulation is running without a visualization.
 * @type {boolean}
 */
Genetics.Cage.HEADLESS = false;

/**
 * Mapping of player ID to array with player name and code.
 * @type {!Object.<number, Array.<string>>}
 */
Genetics.Cage.players = {};

/**
 * List of mice currently alive.
 * @type {!Array.<!Genetics.Mouse>}
 * @private
 */
Genetics.Cage.aliveMice_ = [];

/**
 * Mapping of mouse ID to mouse for quick lookup.
 * @type {!Object.<number, !Genetics.Mouse>}
 * @private
 */
Genetics.Cage.miceMap_ = {};

/**
 * Mapping of mouse ID to PID of life simulation for that mouse.
 * @type {!Object.<number, number>}
 * @private
 */
Genetics.Cage.lifePidsMap_ = {};

/**
 * List of events to be visualized.
 * @type {!Array.<!Event>}
 */
Genetics.Cage.EVENTS = [];

/**
 * Mapping of event types to a list of properties of the event.
 * @type {Object.<string, Array.<string>>}
 */
Genetics.Cage.EVENT_PROPERTY_NAMES = {
  'ADD': ['TYPE', 'MOUSE', 'PLAYER_NAME'],
  'START_GAME': [],
  'FIGHT': ['TYPE', 'ID', 'RESULT', 'OPT_OPPONENT'],
  'MATE': ['TYPE', 'ID', 'RESULT', 'OPT_PARTNER', 'OPT_OFFSPRING'],
  // A mouse dies after using all fight and mate opportunities.
  'RETIRE': ['TYPE', 'ID'],
  // The oldest mouse dies when there is no room for it.
  'OVERPOPULATION': ['TYPE', 'ID'],
  // A mouse dies if it throws an exception.
  'EXPLODE': ['TYPE', 'ID', 'SOURCE', 'OPT_CAUSE'],
  // A mouse dies if it does not complete execution.
  'SPIN': ['TYPE', 'ID'],
  'END_GAME': ['TYPE', 'CAUSE', 'PICK_FIGHT_WINNER', 'PROPOSE_MATE_WINNER',
    'ACCEPT_MATE_WINNER']
};

/**
 * Creates an event.
 * @param {string } type The type of event.
 * @param {...string|number|Genetics.Mouse} var_args The properties on
 * the event.
 * @constructor
 */
Genetics.Cage.Event = function(type, var_args) {
  var template = Genetics.Cage.EVENT_PROPERTY_NAMES[type];
  for (var i = 0; i < template.length; i++) {
    this[template[i]] = arguments[i];
  }
};

/**
 * Adds the event to the queue depending on the mode the game is running as.
 */
Genetics.Cage.Event.prototype.addToQueue = function() {
  // Headless does not need to keep track of events that are not END_GAME.
  if (Genetics.Cage.HEADLESS &&
      this.TYPE != Genetics.Cage.EVENT_PROPERTY_NAMES.END_GAME) {
    return;
  }
  Genetics.Cage.EVENTS.push(this);
};

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
Genetics.Cage.GAME_TIME_LIMIT_MSC = 5 * 60 * 1000;

/**
 * Time limit for mouse function execution in number of interpreter steps (100k
 * ticks runs for about 3 minutes).
 * @type {number}
 */
Genetics.Cage.FUNCTION_TIMEOUT_STEPS = 100000;

/**
 * The next available player ID.
 * @type {number}
 * @private
 */
Genetics.Cage.nextAvailablePlayerId_ = 0;

/**
 * The next available mouse ID.
 * @type {number}
 * @private
 */
Genetics.Cage.nextAvailableMouseId_ = 0;

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
  Genetics.Cage.miceMap_ = {};
  // Cancel all queued life simulations.
  for (var mouseId in Genetics.Cage.lifePidsMap_) {
    clearTimeout(Genetics.Cage.lifePidsMap_[mouseId]);
  }
  Genetics.Cage.lifePidsMap_ = {};
  Genetics.Cage.nextAvailableMouseId_ = 0;
};

/**
 * Adds a player to the game.
 * @param {string} playerName The name of the player to be added.
 * @param {string|!Function} code Player's code, or generator.
 */
Genetics.Cage.addPlayer = function(playerName, code) {
  // Assign a unique ID to the player and add to the game.
  var id = Genetics.Cage.nextAvailablePlayerId_++;
  Genetics.Cage.players[id] = [playerName, code];
};

/**
 * Start the Cage simulation. Players should be already added.
 * @param {Function} doneCallback Function to call when game ends.
 */
Genetics.Cage.start = function(doneCallback) {
  Genetics.Cage.doneCallback_ = doneCallback;
  // Create mice for each player.
  for (var playerId in Genetics.Cage.players) {
    for (var i = 0; i < Genetics.Cage.START_MICE_PER_PLAYER; i++) {
      var mouseSex = i % 2 == 0 ? Genetics.Mouse.Sex.MALE :
          Genetics.Mouse.Sex.FEMALE;
      var mouseId = Genetics.Cage.nextAvailableMouseId_++;
      var mouse = new Genetics.Mouse(mouseId, mouseSex, null, null, playerId);
      Genetics.Cage.born(mouse);
      new Genetics.Cage.Event('ADD', goog.object.clone(mouse),
          Genetics.Cage.players[playerId][0]).addToQueue();
    }
  }
  Genetics.Cage.endTime_ = Date.now() + Genetics.Cage.GAME_TIME_LIMIT_MSC;
  new Genetics.Cage.Event('START_GAME').addToQueue();
};

/**
 * Queues life simulation for mouse.
 * @param {Genetics.Mouse} mouse The mouse to queue the simulation for.
 */
Genetics.Cage.life = function(mouse) {
  // Queue life simulation for mouse with some variation in timeout to allow for
  // variation in order.
  Genetics.Cage.lifePidsMap_[mouse.id] =
      setTimeout(goog.partial(Genetics.Cage.simulateLife, mouse),
          10 * Math.random());
};

/**
 * Runs life simulation on mouse.
 * @param {Genetics.Mouse} mouse The mouse to run the simulation for.
 */
Genetics.Cage.simulateLife = function(mouse) {
  // Remove life from mapping of lives that are queued to run.
  delete Genetics.Cage.lifePidsMap_[mouse.id];
  // Age mouse.
  mouse.age++;
  if (mouse.aggressiveness > 0) {
    // Mouse has fight attempts left, try to start a fight with another mouse
    Genetics.Cage.instigateFight(mouse);
  } else if (mouse.fertility > 0) {
    // Mouse is still fertile, try to breed with another mouse.
    Genetics.Cage.tryMate(mouse);
  } else {
    // Mouse has completed life cycle and dies.
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
 * Uses up up agression for mouse and simulates a fight between the given mouse
 * and opponent it requests. Any mouse that loses in a fight dies.
 * @param {Genetics.Mouse} mouse The mouse to initiate fighting.
 */
Genetics.Cage.instigateFight = function(mouse) {
  var result = Genetics.Cage.runMouseFunction(mouse, 'pickFight');
  // Check if function threw an error or caused a timeout.
  if (result[0] == 'FAILURE') {
    return;
  }
  var chosen = result[1];
  // Check if no mouse was chosen.
  if (chosen === null) {
    new Genetics.Cage.Event('FIGHT', mouse.id, 'NONE').addToQueue();
    mouse.aggressiveness = 0;
    return;
  }
  // Check if return value is invalid.
  if (typeof chosen != 'object' ||
      Genetics.Cage.miceMap_[chosen.id] == undefined) {
    new Genetics.Cage.Event('FIGHT', mouse.id, 'INVALID').addToQueue();
    mouse.aggressiveness = 0;
    return;
  }
  // Retrieve local copy of mouse to ensure that mouse was not modified.
  var opponent = Genetics.Cage.miceMap_[chosen.id];
  // Check if opponent is itself.
  if (mouse.id == opponent.id) {
    new Genetics.Cage.Event('FIGHT', mouse.id, 'SELF').addToQueue();
    Genetics.Cage.death(mouse);
    return;
  }
  // Compute winner using size to weigh probability of winning.
  var fightResult = Math.random() - mouse.size / (mouse.size + opponent.size);
  if (fightResult < 0) {  // If fight proposer won.
    new Genetics.Cage.Event('FIGHT', mouse.id, 'WIN', opponent.id).addToQueue();
    Genetics.Cage.death(opponent);
  }
  else if (fightResult == 0) {  // If it was a tie.
    new Genetics.Cage.Event('FIGHT', mouse.id, 'TIE', opponent.id).addToQueue();
  } else {  // If opponent won.
    new Genetics.Cage.Event('FIGHT', mouse.id, 'LOSS', opponent.id)
        .addToQueue();
    Genetics.Cage.death(mouse);
  }
};

/**
 * Gets requested mate of mouse, attempts mating and starts life of any
 * resultant child.
 * @param {Genetics.Mouse} mouse The mouse to initiate mating.
 */
Genetics.Cage.tryMate = function(mouse) {
  var result = Genetics.Cage.runMouseFunction(mouse, 'proposeMate');
  // Check if function threw an error or caused a timeout.
  if (result[0] == 'FAILURE') {
    return;
  }
  var chosen = result[1];
  // Check if no mouse was chosen.
  if (chosen === null) {
    new Genetics.Cage.Event('MATE', mouse.id, 'NONE').addToQueue();
    mouse.fertility = 0;
    return;
  }
  // Check if return value is invalid
  if (typeof chosen != 'object' ||
      Genetics.Cage.miceMap_[chosen.id] == undefined) {
    new Genetics.Cage.Event('MATE', mouse.id, 'INVALID').addToQueue();
    mouse.fertility = 0;
    return;
  }
  // Retrieve local copy of mate to ensure that mouse was not modified.
  var mate = Genetics.Cage.miceMap_[chosen.id];
  if (Genetics.Cage.isMatingSuccessful(mouse, mate)) {
    // Create offspring from the two mice.
    Genetics.Cage.createOffspring(mouse, mate);
    // Account for overpopulation.
    if (Genetics.Cage.aliveMice_.length > Genetics.Cage.MAX_POPULATION) {
      // Find oldest mouse.
      var oldestMouse = Genetics.Cage.aliveMice_[0];
      for (var i = 1; i < Genetics.Cage.aliveMice_.length; i++) {
        var aliveMouse = Genetics.Cage.aliveMice_[i];
        if (!oldestMouse || aliveMouse.age > oldestMouse.age) {
          oldestMouse = aliveMouse;
        }
      }
      // Kill oldest mouse.
      new Genetics.Cage.Event('OVERPOPULATION', oldestMouse.id).addToQueue();
      Genetics.Cage.death(oldestMouse);
    }
  } else {
    // Use up one mating attempt for mouse.
    mouse.fertility--;
  }
};

/**
 * Creates a child mouse from two mice and adds offspring to the cage.
 * @param {!Genetics.Mouse} parent1 One of the parents of the new mouse.
 * @param {!Genetics.Mouse} parent2 One of the parents of the new mouse.
 */
Genetics.Cage.createOffspring = function(parent1, parent2) {
  // Use up one mating attempt for each of the parents.
  parent1.fertility--;
  parent2.fertility--;
  // Allocate a new ID for the mouse.
  var mouseId = Genetics.Cage.nextAvailableMouseId_++;
  // Determine sex of child based on the current population.
  var populationFertility = 0;
  var femaleFertility = 0;
  for (var i = 0; i < Genetics.Cage.aliveMice_.length; i++) {
    var aliveMouse = Genetics.Cage.aliveMice_[i];
    populationFertility += aliveMouse.fertility;
    if (aliveMouse.sex == Genetics.Mouse.Sex.FEMALE) {
      femaleFertility += aliveMouse.fertility;
    }
  }
  var childSex = ( Math.random() < femaleFertility / populationFertility) ?
      Genetics.Mouse.Sex.MALE : Genetics.Mouse.Sex.FEMALE;
  var child = new Genetics.Mouse(mouseId, childSex, parent1, parent2);
  Genetics.Cage.born(child);
  new Genetics.Cage.Event('MATE', parent1.id, 'SUCCESS', parent2.id,
      goog.object.clone(child)).addToQueue();
};

/**
 * Checks whether a mate between the two mice will succeed.
 * @param {Genetics.Mouse} proposingMouse The mouse that is proposing to mate.
 * @param {Genetics.Mouse} askedMouse The mouse that is being asked to mate.
 * @return {boolean} Whether the mate succeeds.
 */
Genetics.Cage.isMatingSuccessful = function(proposingMouse, askedMouse) {
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
  var result = Genetics.Cage.runMouseFunction(askedMouse, 'acceptMate',
      proposingMouse);
  // Check if function threw an error or caused a timeout.
  if (result[0] == 'FAILURE') {
    new Genetics.Cage.Event('MATE', proposingMouse.id, 'MATE_EXPLODED')
        .addToQueue();
    return false;
  }
  var response = result[1];
  // Check if response is positive.
  if (!response) {
    new Genetics.Cage.Event('MATE', proposingMouse.id, 'REJECTION',
        askedMouse.id).addToQueue();
    return false;
  }
  return true;
};

/**
 * Adds the mouse to the cage.
 * @param {Genetics.Mouse} mouse The mouse to add to the cage.
 */
Genetics.Cage.born = function(mouse) {
  // Adds child to population.
  Genetics.Cage.aliveMice_.push(mouse);
  Genetics.Cage.miceMap_[mouse.id] = mouse;
  Genetics.Cage.life(mouse); // Queue life simulation for mouse.
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
  clearTimeout(Genetics.Cage.lifePidsMap_[mouse.id]);
  delete Genetics.Cage.lifePidsMap_[mouse.id];
};

/**
 * Checks if mouse is alive.
 * @param {Genetics.Mouse} mouse The mouse to check whether it is alive.
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
    Genetics.Cage.end('NONE_LEFT');
    return;
  }
  // Check which genes have won.
  var pickFightWinner = Genetics.Cage.aliveMice_[0].pickFightOwner;
  var mateQuestionWinner = Genetics.Cage.aliveMice_[0].proposeMateOwner;
  var acceptMateWinner = Genetics.Cage.aliveMice_[0].acceptMateOwner;
  for (var i = 1; i < Genetics.Cage.aliveMice_.length; i++) {
    var mouse = Genetics.Cage.aliveMice_[i];
    if (pickFightWinner && pickFightWinner != mouse.pickFightOwner) {
      pickFightWinner = null;
    }
    if (mateQuestionWinner && mateQuestionWinner != mouse.proposeMateOwner) {
      mateQuestionWinner = null;
    }
    if (acceptMateWinner && acceptMateWinner != mouse.acceptMateOwner) {
      acceptMateWinner = null;
    }
    if (!pickFightWinner && !mateQuestionWinner && !acceptMateWinner) {
      break;
    }
  }
  // End the game if there is a winner for all functions.
  if (pickFightWinner && mateQuestionWinner && acceptMateWinner) {
    Genetics.Cage.end('DOMINATION', pickFightWinner, mateQuestionWinner,
        acceptMateWinner);
  }
  // Check if game has gone on too long.
  if (Date.now() > Genetics.Cage.endTime_) {
    Genetics.Cage.end('TIMEOUT', pickFightWinner, mateQuestionWinner,
        acceptMateWinner);
  }
};

/**
 * Clears queued events for end of simulation.
 * @param {string} cause The cause of game end.
 * @param {string=} opt_pickFightWinner The owner of all the pickFight functions
 * in alive mice.
 * @param {string=} opt_proposeMateWinner The owner of all the proposeMate
 * functions in alive mice.
 * @param {string=} opt_acceptMateWinner The owner of all the acceptMate
 * functions in alive mice.
 */
Genetics.Cage.end = function(cause, opt_pickFightWinner, opt_proposeMateWinner,
    opt_acceptMateWinner) {
  // Cancel all queued life simulations.
  for (var mouseId in Genetics.Cage.lifePidsMap_) {
    clearTimeout(Genetics.Cage.lifePidsMap_[mouseId]);
  }
  var pickFightWinner = opt_pickFightWinner || 'NONE';
  var proposeMateWinner = opt_proposeMateWinner || 'NONE';
  var acceptMateWinner = opt_acceptMateWinner || 'NONE';
  new Genetics.Cage.Event('END_GAME', cause, pickFightWinner, proposeMateWinner,
      acceptMateWinner).addToQueue();
};

/**
 * Starts up a new interpreter and gets the return value of the function.
 * @param {!Genetics.Mouse} mouse The mouse to get the code from.
 * @param {string} mouseFunction The function call to evaluate.
 * @param {Genetics.Mouse=} opt_param The mouse passed as a parameter to the
 * function.
 * @return {Array.<*>}
 */
Genetics.Cage.runMouseFunction = function(mouse, mouseFunction, opt_param) {
  // Get a new interpreter to run the player code.
  var interpreter = Genetics.Cage.getInterpreter(mouse, mouseFunction,
      opt_param);
  // Try running the player code.
  try {
    var ticks = Genetics.Cage.FUNCTION_TIMEOUT_STEPS;
    while (interpreter.step()) {
      if (ticks-- == 0) {
        throw Infinity;
      }
    }
    return ['SUCCESS', interpreter.pseudoToNative(interpreter.value)];
  } catch (e) {
    if (e === Infinity) {
      new Genetics.Cage.Event('SPIN', mouse.id, mouseFunction)
          .addToQueue();
    } else {
      new Genetics.Cage.Event('EXPLODE', mouse.id, mouseFunction, e)
          .addToQueue();
    }
  }
  // Failed to retrieve a return value.
  Genetics.Cage.death(mouse);
  return ['FAILURE'];
};

/**
 * Returns an interpreter with player code from the mouse for the given
 * mouseFunction with a call appended.
 * @param {!Genetics.Mouse} mouse The mouse to get the code from.
 * @param {string} mouseFunction The function call to append to the code in the
 * interpreter.
 * @param {Genetics.Mouse=} opt_suitor The mouse passed as a parameter to the
 * function (for acceptMate function call).
 * @return {!Interpreter} Interpreter set up for executing mouse function call.
 */
Genetics.Cage.getInterpreter = function(mouse, mouseFunction, opt_suitor) {
  var playerId;
  switch (mouseFunction) {
    case 'pickFight':
      playerId = mouse.pickFightOwner;
      break;
    case 'proposeMate':
      playerId = mouse.proposeMateOwner;
      break;
    case 'acceptMate':
      playerId = mouse.acceptMateOwner;
      break;
  }
  var code = Genetics.Cage.players[playerId][1];
  if (goog.isFunction(code)) {
    code = code();
  } else if (!goog.isString(code)) {
    var player = Genetics.Cage.players[playerId][0];
    throw 'Player ' + player + ' has invalid code: ' + code;
  }
  var interpreter = new Interpreter(code,
      goog.partial(Genetics.Cage.initInterpreter, mouse, opt_suitor));
  // Overwrite other function calls and call function we need return value of.
  switch (mouseFunction) {
    case 'pickFight':
      interpreter.appendCode('proposeMate = null;');
      interpreter.appendCode('acceptMate = null;');
      interpreter.appendCode('pickFight();');
      break;
    case 'proposeMate':
      interpreter.appendCode('pickFight = null;');
      interpreter.appendCode('acceptMate = null;');
      interpreter.appendCode('proposeMate();');
      break;
    case 'acceptMate':
      interpreter.appendCode('pickFight = null;');
      interpreter.appendCode('proposeMate = null;');
      interpreter.appendCode('acceptMate(getSuitor());');
      break;
  }
  return interpreter;
};

/**
 * Inject the Genetics API into a JavaScript interpreter.
 * @param {!Genetics.Mouse} mouse The mouse that is running the function.
 * @param {!Genetics.Mouse|undefined} suitor The mouse passed as a parameter to
 * the function (for acceptMate function call).
 * @param {!Interpreter} interpreter The JS interpreter.
 * @param {!Object} scope Global scope.
 */
Genetics.Cage.initInterpreter = function(mouse, suitor, interpreter,
    scope) {
  var pseudoMe = interpreter.UNDEFINED;
  var pseudoSuitor = interpreter.ARRAY;
  var pseudoAliveMice = interpreter.createObject(interpreter.ARRAY);
  var aliveMice = Genetics.Cage.aliveMice_;
  for (var i = 0; i < aliveMice.length; i++) {
    var aliveMouse = aliveMice[i];
    // Create a clone of alive mouse with string keys so that keys wont be
    // renamed when compressed.
    var clonedMouse = {
      'pickFightOwner': aliveMice.pickFightOwner,
      'proposeMateOwner': aliveMice.proposeMateOwner,
      'acceptMateOwner': aliveMice.acceptMateOwner,
      'sex': aliveMouse.sex,
      'size': aliveMouse.size,
      'startAggressiveness': aliveMouse.startAggressiveness,
      'aggressiveness': aliveMouse.aggressiveness,
      'startFertility': aliveMouse.startFertility,
      'fertility': aliveMouse.fertility,
      'age': aliveMouse.age,
      'id': aliveMouse.id
    };
    var pseudoMouse = interpreter.nativeToPseudo(clonedMouse);
    interpreter.setProperty(pseudoAliveMice, i, pseudoMouse);
    // Check if the mouse running the interpreter has been created.
    if (aliveMouse.id == mouse.id) {
      pseudoMe = pseudoMouse;
    }
    // Check if the suitor parameter, if defined, has been created.
    else if (suitor && aliveMouse.id == suitor.id) {
      pseudoSuitor = pseudoMouse;
    }
  }
  var wrapper;
  wrapper = function() {
    return pseudoMe;
  };
  interpreter.setProperty(scope, 'getSelf',
      interpreter.createNativeFunction(wrapper));
  wrapper = function() {
    return pseudoAliveMice;
  };
  interpreter.setProperty(scope, 'getMice',
      interpreter.createNativeFunction(wrapper));
  if (pseudoSuitor != interpreter.UNDEFINED) {
    wrapper = function() {
      return pseudoSuitor;
    };
    var x = interpreter.createNativeFunction(wrapper);
    interpreter.setProperty(scope, 'getSuitor', x);
  }

  var sex = interpreter.nativeToPseudo(Genetics.Mouse.Sex);
  interpreter.setProperty(scope, 'Sex', sex);

  var myMath = interpreter.getProperty(scope, 'Math');
  if (myMath != interpreter.UNDEFINED) {
    wrapper = function(minValue, maxValue) {
      return interpreter.createPrimitive(
          Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue);
    };
    interpreter.setProperty(myMath, 'randomInt',
        interpreter.createNativeFunction(wrapper));
  }
};


