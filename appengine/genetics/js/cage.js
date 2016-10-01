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
 * @const
 */
Genetics.Cage.MAX_POPULATION = 50;

/**
 * The number of mice added to the cage for each player at the start of the
 * game. Should be less than MAX_POPULATION / number of players.
 * @type {number}
 * @const
 */
Genetics.Cage.START_MICE_PER_PLAYER = 2;

/**
 * Number of milliseconds between update calls.
 * @type {number}
 * @const
 */
Genetics.Cage.UPDATE_DELAY_MSC = 50;

/**
 * Whether the simulation is running without a visualization.
 * @type {boolean}
 */
Genetics.Cage.HEADLESS = false;

/**
 * Whether the simulation is stopped.
 * @type {boolean}
 * @private
 */
Genetics.Cage.stopped_ = true;

/**
 * Mapping of player ID to object with player name and code.
 * @type {!Array.<number, !Object.<>>}
 */
Genetics.Cage.players = [];

/**
 * List of mice currently alive and queued to run next round.
 * @type {!Array.<!Genetics.Mouse>}
 * @private
 */
Genetics.Cage.nextRoundMice_ = [];

/**
 * List of mice currently alive and queued to run this round.
 * @type {!Array.<!Genetics.Mouse>}
 * @private
 */
Genetics.Cage.currentRoundmice_ = [];

/**
 * Mapping of mouse ID to mouse for quick lookup.
 * @type {!Object.<number, !Genetics.Mouse>}
 * @private
 */
Genetics.Cage.miceMap_ = {};

/**
 * The process ID of the update function for the game logic.
 * @type {number}
 * @private
 */
Genetics.Cage.pid_ = 0;

/**
 * List of events to be visualized.
 * @type {!Array.<!Event>}
 */
Genetics.Cage.Events = [];

/**
 * Whether events in the Event queue will not be cleared.
 * @type {boolean}
 */
Genetics.Cage.keepHistory = false;

/**
 * Mapping of event types to a list of properties of the event.
 * @type {Object.<string, Array.<string>>}
 */
Genetics.Cage.EVENT_PROPERTY_NAMES = {
  'ADD': ['MOUSE'],
  'START_GAME': [],
  'NEXT_ROUND' : [],
  'FIGHT': ['ID', 'RESULT', 'OPT_OPPONENT'],
  'MATE': ['ID', 'RESULT', 'OPT_PARTNER', 'OPT_OFFSPRING'],
  // A mouse dies after using all fight and mate opportunities.
  'RETIRE': ['ID'],
  // The oldest mouse dies when there is no room for it.
  'OVERPOPULATION': ['ID'],
  // A mouse dies if it throws an exception or times out.
  'EXPLODE': ['ID', 'SOURCE', 'CAUSE'],
  'END_GAME': ['IS_SUCCESS', 'OPT_RANKINGS']
};

/**
 * Creates an event.
 * @param {string } type The type of event.
 * @param {...string|number|boolean|!Genetics.Mouse|!Object<string,!Array.<!Array.<number>>>} var_args
 * The properties on the event.
 * @constructor
 */
Genetics.Cage.Event = function(type, var_args) {
  var template = Genetics.Cage.EVENT_PROPERTY_NAMES[type];
  this['TYPE'] = type;
  for (var i = 0; i < template.length; i++) {
    this[template[i]] = arguments[i + 1];
  }
};

/**
 * Adds the event to the queue depending on the mode the game is running as.
 */
Genetics.Cage.Event.prototype.addToQueue = function() {
  // Headless does not need to keep track of events that are not END_GAME.
  if (Genetics.Cage.HEADLESS &&
      this.TYPE != 'END_GAME') {
    return;
  }
  Genetics.Cage.Events.push(this);
};

/**
 * Time limit for end of the game in rounds.
 * @type {number}
 */
Genetics.Cage.MAX_ROUNDS = 10;

/**
 * The current round of the game.
 * @type {number}
 */
Genetics.Cage.roundNumber = 0;

/**
 * Time limit for mouse function execution in number of interpreter steps (100k
 * ticks runs for about 3 minutes).
 * @type {number}
 */
Genetics.Cage.FUNCTION_TIMEOUT_STEPS = 100000;

/**
 * The next available mouse ID.
 * @type {number}
 * @private
 */
Genetics.Cage.nextAvailableMouseId_ = 0;

/**
 * Whether fights are discrete (a bigger mouse will always win and same size
 * ties) or probability based on size.
 * @type {boolean}
 */
Genetics.Cage.discreteFights = false;

/**
 * Stop the game.
 */
Genetics.Cage.stop = function() {
  Genetics.Cage.stopped_ = true;
  clearTimeout(Genetics.Cage.pid_);
};

/**
 * Stop and reset the cage.
 */
Genetics.Cage.reset = function() {
  Genetics.Cage.stop();
  Genetics.Cage.Events.length = 0;
  Genetics.Cage.miceMap_ = {};
  // Cancel all queued life simulations.
  Genetics.Cage.nextRoundMice_.length = 0;
  Genetics.Cage.currentRoundmice_.length = 0;
  Genetics.Cage.roundNumber = 0;
};

/**
 * Adds a player to the game.
 * @param {string} playerName The name of the player to be added.
 * @param {string|!Function} code Player's code, or generator.
 */
Genetics.Cage.addPlayer = function(playerName, code) {
  Genetics.Cage.players.push({name: playerName, code: code});
};

/**
 * Start the Cage simulation. Players should be already added.
 * @param {!Function} checkForEnd Function to call when game ends.
 * that should be skipped in simulateLife.
 */
Genetics.Cage.start = function(checkForEnd) {
  Genetics.Cage.checkForEnd = checkForEnd;
  Genetics.Cage.stopped_ = false;
  Genetics.Cage.nextAvailableMouseId_ = Genetics.Cage.nextRoundMice_.length;
  for (var playerId = 0, player; player = Genetics.Cage.players[playerId];
      playerId++) {
    if (goog.isFunction(player.code)) {
      // Cache code if player code is generator.
      player.cachedCode = Genetics.Cage.players[1].code + '\n' + player.code();
    }
  }
  new Genetics.Cage.Event('START_GAME').addToQueue();

  Genetics.Cage.update();
};

/**
 * Whether the player mouse (mouse id 0) will be the only mouse running logic.
 * @type {boolean}
 */
Genetics.Cage.soloPlayerMouse = false;

/**
 * Whether the player mouse (mouse id 0) will be the only mouse not running
 * logic.
 * @type {boolean}
 */
Genetics.Cage.ignorePlayerMouse = false;

/**
 * Whether pickFight will be skipped.
 * @type {boolean}
 */
Genetics.Cage.skipPickFight = false;

/**
 * Executes the next mouse's action and checks for end game.
 */
Genetics.Cage.update = function() {
  if (Genetics.Cage.HEADLESS || Genetics.Cage.keepHistory ||
      Genetics.Cage.Events.length < 100) {
    // If the events queue is not backed up, then continue computing.
    if (Genetics.Cage.currentRoundmice_.length == 0) {
      if (Genetics.Cage.roundNumber < Genetics.Cage.MAX_ROUNDS) {
        // Cycle to next round.
        Genetics.Cage.currentRoundmice_ = Genetics.Cage.nextRoundMice_.slice(0);
        new Genetics.Cage.Event('NEXT_ROUND').addToQueue();
      }
      Genetics.Cage.roundNumber++;
    }
    if (Genetics.Cage.currentRoundmice_.length) {
      var mouse = Genetics.Cage.currentRoundmice_.shift();
      if ((mouse.id != 0 && !Genetics.Cage.soloPlayerMouse) ||
          (mouse.id == 0 && !Genetics.Cage.ignorePlayerMouse)) {
        Genetics.Cage.simulateLife(mouse);
      }
    }

    // Check for end game.
    if (Genetics.Cage.checkForEnd()) {
      Genetics.Cage.stop();
    }
  }

  if (!Genetics.Cage.stopped_) {
    Genetics.Cage.pid_ = setTimeout(Genetics.Cage.update,
        Genetics.Cage.UPDATE_DELAY_MSC);
  }
};

/**
 * Runs life simulation on mouse.
 * @param {!Genetics.Mouse} mouse The mouse to run the simulation for.
 */
Genetics.Cage.simulateLife = function(mouse) {
  // Age mouse.
  mouse.age++;
  if (!Genetics.Cage.skipPickFight && mouse.aggressiveness > 0) {
    // Mouse has fight attempts left, try to start a fight with another mouse
    Genetics.Cage.instigateFight(mouse);
  } else if (mouse.fertility > 0) {
    // Mouse is still fertile, try to breed with another mouse.
    Genetics.Cage.tryMate(mouse);
  } else {
    // Mouse has completed life cycle and dies.
    new Genetics.Cage.Event('RETIRE', mouse.id).addToQueue();
    Genetics.Cage.die(mouse);
  }
};

/**
 * Uses up agression for mouse and simulates a fight between the given mouse
 * and opponent it requests. Any mouse that loses in a fight dies.
 * @param {!Genetics.Mouse} mouse The mouse that initiate fighting.
 */
Genetics.Cage.instigateFight = function(mouse) {
  var result = Genetics.Cage.runMouseFunction(mouse, 'pickFight');
  mouse.aggressiveness--;
  if (!result.success) {
    // Explode mouse if function threw an error or caused a timeout.
    new Genetics.Cage.Event('EXPLODE', mouse.id, 'pickFight', result.cause)
        .addToQueue();
    Genetics.Cage.die(mouse);
    return;
  }
  var chosen = result.value;
  if (chosen === null) {
    // If no mouse was chosen, mouse has elected to never fight again.
    new Genetics.Cage.Event('FIGHT', mouse.id, 'NONE').addToQueue();
    mouse.aggressiveness = 0;
    return;
  }
  if (typeof chosen != 'object' ||
      !Genetics.Cage.miceMap_.hasOwnProperty(chosen.id)) {
    // If return is invalid, mouse explodes.
    new Genetics.Cage.Event('EXPLODE', mouse.id, 'pickFight',
        'Invalid return').addToQueue();
    Genetics.Cage.die(mouse);
    return;
  }
  // Retrieve local copy of mouse to ensure that mouse was not modified.
  var opponent = Genetics.Cage.miceMap_[chosen.id];
  if (mouse.id == opponent.id) {
    // If mouse chooses to fight against itself, it dies.
    new Genetics.Cage.Event('FIGHT', mouse.id, 'SELF').addToQueue();
    Genetics.Cage.die(mouse);
    return;
  }
  // Compute winner using size to weigh probability of winning.
  var fightResult = Genetics.Cage.discreteFights ? opponent.size - mouse.size :
      Math.random() - mouse.size / (mouse.size + opponent.size);
  // Determine the outcome of the fight.
  if (Math.abs(fightResult) < 0.1) {
    new Genetics.Cage.Event('FIGHT', mouse.id, 'TIE', opponent.id).addToQueue();
  } else if (fightResult < 0) {
    new Genetics.Cage.Event('FIGHT', mouse.id, 'WIN', opponent.id).addToQueue();
    Genetics.Cage.die(opponent);
  } else {
    new Genetics.Cage.Event('FIGHT', mouse.id, 'LOSS', opponent.id)
        .addToQueue();
    Genetics.Cage.die(mouse);
  }
};

/**
 * Gets requested mate of mouse, attempts mating and starts life of any
 * resultant child.
 * @param {!Genetics.Mouse} suitor The mouse to initiate mating.
 */
Genetics.Cage.tryMate = function(suitor) {
  var result = Genetics.Cage.runMouseFunction(suitor, 'proposeMate');
  // Check if function threw an error or caused a timeout.
  if (!result.success) {
    // Explode mouse if function threw an error or caused a timeout.
    new Genetics.Cage.Event('EXPLODE', suitor.id, 'proposeMate', result.cause)
        .addToQueue();
    Genetics.Cage.die(suitor);
    return;
  }
  var chosen = result.value;
  if (chosen === null) {
    // If no mouse was chosen, mouse has elected to stop mating.
    new Genetics.Cage.Event('MATE', suitor.id, 'NONE').addToQueue();
    suitor.fertility = 0;
    return;
  }
  if (typeof chosen != 'object' ||
      !Genetics.Cage.miceMap_.hasOwnProperty(chosen.id)) {
    // If return is invalid, mouse explodes.
    new Genetics.Cage.Event('EXPLODE', suitor.id, 'proposeMate',
        'Invalid return').addToQueue();
    Genetics.Cage.die(suitor);
    return;
  }
  // Retrieve local copy of mate to ensure that mouse was not modified.
  var mate = Genetics.Cage.miceMap_[chosen.id];
  if (Genetics.Cage.isMatingSuccessful(suitor, mate)) {
    // Create offspring from the two mice.
    Genetics.Cage.createOffspring(suitor, mate);
    // Account for overpopulation.
    if (Object.keys(Genetics.Cage.miceMap_).length >
        Genetics.Cage.MAX_POPULATION) {
      // Find oldest mouse.
      var oldestMouse = null;
      for (var mouseId in Genetics.Cage.miceMap_) {
        var aliveMouse = Genetics.Cage.miceMap_[mouseId];
        if (!oldestMouse || aliveMouse.age > oldestMouse.age) {
          oldestMouse = aliveMouse;
        }
      }
      // Kill oldest mouse.
      new Genetics.Cage.Event('OVERPOPULATION', oldestMouse.id).addToQueue();
      Genetics.Cage.die(oldestMouse);
    }
  }
  // Use up one mating attempt for mouse.
  suitor.fertility--;
};

/**
 * Creates a child mouse from two mice and adds offspring to the cage.
 * @param {!Genetics.Mouse} parent1 One of the parents of the new mouse.
 * @param {!Genetics.Mouse} parent2 One of the parents of the new mouse.
 */
Genetics.Cage.createOffspring = function(parent1, parent2) {
  // Allocate a new ID for the mouse.
  var mouseId = Genetics.Cage.nextAvailableMouseId_++;
  // Determine sex of child based on the current population.
  var populationFertility = 0;
  var femaleFertility = 0;
  for (var i = 0, aliveMouse; aliveMouse = Genetics.Cage.nextRoundMice_[i];
      i++) {
    populationFertility += aliveMouse.fertility;
    if (aliveMouse.sex == Genetics.Mouse.Sex.FEMALE) {
      femaleFertility += aliveMouse.fertility;
    }
  }
  var childSex = (Math.random() < femaleFertility / populationFertility) ?
      Genetics.Mouse.Sex.MALE : Genetics.Mouse.Sex.FEMALE;
  var child = new Genetics.Mouse(mouseId, childSex, parent1, parent2);
  Genetics.Cage.addMouse(child);
  new Genetics.Cage.Event('MATE', parent1.id, 'SUCCESS', parent2.id,
      child).addToQueue();
};

/**
 * Checks whether a mate between the two mice will succeed.
 * @param {!Genetics.Mouse} proposingMouse The mouse that is proposing to mate.
 * @param {!Genetics.Mouse} askedMouse The mouse that is being asked to mate.
 * @return {boolean} Whether the mate succeeds.
 */
Genetics.Cage.isMatingSuccessful = function(proposingMouse, askedMouse) {
  if (proposingMouse.id == askedMouse.id) {
    // If mouse tries to mate with itself, it does not succeed.
    new Genetics.Cage.Event('MATE', proposingMouse.id, 'SELF').addToQueue();
    return false;
  }
  // Ask second mouse whether it will mate with the proposing mouse.
  var result = Genetics.Cage.runMouseFunction(askedMouse, 'acceptMate',
      proposingMouse);
  if (!result.success) {
    // Explode mouse if function threw an error or caused a timeout.
    new Genetics.Cage.Event('MATE', proposingMouse.id, 'MATE_EXPLODED',
        askedMouse.id)
        .addToQueue();
    new Genetics.Cage.Event('EXPLODE', askedMouse.id, 'acceptMate',
        result.cause)
        .addToQueue();
    Genetics.Cage.die(askedMouse);
    return false;
  }
  if (!result.value) {
    // If mouse's response is negative.
    new Genetics.Cage.Event('MATE', proposingMouse.id, 'REJECTION',
        askedMouse.id).addToQueue();
    return false;
  }
  // Asked mouse accepted the mating request.
  // Use up one mating attempt for asked Mouse.
  askedMouse.fertility--;
  if (proposingMouse.sex == askedMouse.sex) {
    // If mice are not of different sex, mate does not succeed.
    new Genetics.Cage.Event('MATE', proposingMouse.id, 'INCOMPATIBLE',
        askedMouse.id).addToQueue();
    return false;
  }
  if (askedMouse.fertility < 0) {
    // If other mouse is infertile, mate does not succeed.
    new Genetics.Cage.Event('MATE', proposingMouse.id, 'INFERTILE',
        askedMouse.id).addToQueue();
    return false;
  }
  return true;
};

/**
 * Adds the mouse to the cage and queues simulation for mouse.
 * @param {!Genetics.Mouse} mouse The mouse to add to the cage.
 */
Genetics.Cage.addMouse = function(mouse) {
  // Adds child to population and queue life simulation.
  Genetics.Cage.miceMap_[mouse.id] = mouse;
  Genetics.Cage.nextRoundMice_.unshift(mouse);
};

/**
 * Kills the mouse.
 * @param {!Genetics.Mouse} mouse The mouse to kill.
 */
Genetics.Cage.die = function(mouse) {
  var index = Genetics.Cage.nextRoundMice_.indexOf(mouse);
  if (index > -1) {
    Genetics.Cage.nextRoundMice_.splice(index, 1);
  }
  index = Genetics.Cage.currentRoundmice_.indexOf(mouse);
  if (index > -1) {
    Genetics.Cage.currentRoundmice_.splice(index, 1);
  }
  delete Genetics.Cage.miceMap_[mouse.id];
};

/**
 * Starts up a new interpreter and gets the return value of the function.
 * @param {!Genetics.Mouse} mouse The mouse to get the code from.
 * @param {string} mouseFunction The function call to evaluate.
 * @param {Genetics.Mouse=} opt_param The mouse passed as a parameter to the
 * function.
 * @return {!Object<string, *>}
 */
Genetics.Cage.runMouseFunction = function(mouse, mouseFunction, opt_param) {
  // Get a new interpreter to run the player code.
  var interpreter = Genetics.Cage.getInterpreter(mouse, mouseFunction,
      opt_param);
  var result = {};
  // Try running the player code.
  try {
    var ticks = Genetics.Cage.FUNCTION_TIMEOUT_STEPS;
    while (interpreter.step()) {
      if (ticks-- <= 0) {
        throw Infinity;
      }
    }
    result.success = true;
    result.value = interpreter.pseudoToNative(interpreter.value);
  } catch (e) {
    if (e == Infinity) {
      result.cause = 'Timeout';
    } else {
      result.cause = e;
    }
    // Failed to retrieve a return value.
    result.success = false;
  }
  return result;
};

/**
 * Returns an interpreter with player code from the mouse for the given
 * mouseFunction with a call appended.
 * @param {!Genetics.Mouse} mouse The mouse to get the code from.
 * @param {string} mouseFunctionName The name of the function to append a call
 * to in the interpreter.
 * @param {Genetics.Mouse=} opt_suitor The mouse passed as a parameter to the
 * function (for acceptMate function call).
 * @return {!Interpreter} Interpreter set up for executing mouse function call.
 */
Genetics.Cage.getInterpreter = function(mouse, mouseFunctionName, opt_suitor) {
  var playerId;
  switch (mouseFunctionName) {
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
  var code = Genetics.Cage.players[playerId].code;
  if (goog.isFunction(code)) {
    code = Genetics.Cage.players[playerId].cachedCode;
  } else if (!goog.isString(code)) {
    var player = Genetics.Cage.players[playerId].name;
    throw 'Player ' + player + ' has invalid code: ' + code;
  }

  var interpreter;
  try {
    // Catch any syntax errors in the given code.
    interpreter = new Interpreter(code,
        goog.partial(Genetics.Cage.initInterpreter, mouse, opt_suitor));
    // Overwrite other function calls and call function we need return value of.
    switch (mouseFunctionName) {
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
  } catch (e) {
    code = 'throw SyntaxError(\'' + mouseFunctionName + '\')';
    interpreter = new Interpreter(code,
        goog.partial(Genetics.Cage.initInterpreter, mouse, opt_suitor));
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
  var aliveMiceIndex = 0;
  for (var i = 0, aliveMouse; aliveMouse = Genetics.Cage.nextRoundMice_[i];
      i++) {
    // Create a clone of alive mouse with string keys so that keys won't be
    // renamed when compressed.
    var clonedMouse = {
      'pickFightOwner': aliveMouse.pickFightOwner,
      'proposeMateOwner': aliveMouse.proposeMateOwner,
      'acceptMateOwner': aliveMouse.acceptMateOwner,
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
    if (aliveMouse.id == mouse.id) {
      // If the mouse running the interpreter has been created, save it.
      pseudoMe = pseudoMouse;
    } else {
      // If the mouse is not the mouse running the interpreter, add to list.
      interpreter.setProperty(pseudoAliveMice, aliveMiceIndex++, pseudoMouse);
      if (suitor && aliveMouse.id == suitor.id) {
        // If the suitor parameter was define and has been created, save it.
        pseudoSuitor = pseudoMouse;
      }
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
    interpreter.setProperty(scope, 'getSuitor',
        interpreter.createNativeFunction(wrapper));
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


