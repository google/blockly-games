// TODO dependency declarations
// Depends on mouse.js

var debug = false;
var logExceptions = true;
var story = true;

function logException(description) {
  console.log('%c' + description + '%c', 'color: #FF0000', 'background-image: ur;("http://rs516.pbsrc.com/albums/u327/sans_pertinence/sparkle.gif~c200");');
}

/**
 * Credit: http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
 */
function romanize (value) {
  var roman = ["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"]; 
  var decimal = [1000,900,500,400,100,90,50,40,10,9,5,4,1]; 
  if (value <= 0 || value >= 4000) return value; 
  var romanNumeral = ""; 
  for (var i=0; i<roman.length; i++) {
    while (value >= decimal[i]) {
      value -= decimal[i];
      romanNumeral += roman[i];
    }
  }
  return romanNumeral;
}

var FEMININE_NAMES = ['Leia', 'Danielle', 'Zena', 'Brianna', 'Katie', 'Lacy', 'Leela', 'Suzy', 'Saphira', 'Missie', 'Flo', 'Lisa'];
var MASCULINE_NAMES = ['Aaron', 'Chris', 'Charlie', 'Camden', 'Rick', 'Dean', 'Xavier', 'Zeke', 'Han', 'Samuel', 'Wade', 'Patrick'];

/**
 * Returns a string representation of the mouse.
 * @param {Mouse} mouse The mouse to represent as a string.
 * @param {boolean} opt_showGenes Whether to add the gene owners to the string representation.
 * @return {string} The string representation of the mouse.
 */
function getMouseName(mouse, opt_showGenes) {
  var genes = '(' + mouse.sex + ' ' + mouse.mateQuestionOwner + '/' + mouse.mateAnswerOwner + '/' + mouse.pickFightOwner + ')';
  var mouseStats = '[id:' + mouse.id + '/size:' + mouse.size + '/fertility:' + mouse.fertility + '/fight:' + mouse.fight + ']';

  var names = (mouse.sex == Sex.Female || (mouse.sex == Sex.Hermaphrodite && 2 % mouse.id == 0)) ? FEMININE_NAMES : MASCULINE_NAMES;
  var name = names[mouse.id % names.length || 0]
  var ordinal = Math.floor(mouse.id/names.length) + 1;
  if(ordinal > 1) {
    name += ' ' + romanize(ordinal);
  }

  if(opt_showGenes) {
    name += ' ' + genes;
  }
  return name + ' ' + mouseStats;
}

/**
 * Creates a cage.
 * {Visualization} visualization The visualization object that can have functions called upon when updates to population are made.
 */
function Cage(visualization) {
  this.MIN_SIZE = 1;
  this.MAX_POPULATION = 10;
  this.TEMPO = 45; // TODO ehhhhhh...

  this.visualization = visualization;

  this.players = [];
  // Mapping of player owner to function.
  this.mateQuestionGenes = {};
  this.mateAnswerGenes = {};
  this.pickFightGenes = {};

  this.currentGen = 0;
  this.aliveMice = [];
  this.miceMap = {};
  this.mouseLife = {};
  this.end = false;
};

/**
 * Log state of cage to console
 */
Cage.prototype.logStateOfCage = function() {
  console.log('Alive mice: ');
  console.log('==================================');
  for(var id in this.aliveMice) {
    var mouse = this.aliveMice[id];
    console.log(getMouseName(mouse) + ':');
    console.log(mouse);
  }
};

/**
 * Gets the statistics on the distribution of gene owners in alive mice.
 * @return {array} A list that contains a mapping of each sex and 3 mappings of player owners to counts for mateQuestion, mateAnswer, and pickFight respectively.
 */
Cage.prototype.getCageStats = function() {
  var sexCounts = {};
  var mateQuestionCounts = {};
  var mateAnswerCounts = {};
  var pickFightCounts = {};
  var cageStats = [ sexCounts, mateQuestionCounts, mateAnswerCounts, pickFightCounts];

  sexCounts[Sex.Male] = 0;
  sexCounts[Sex.Female] = 0;
  sexCounts[Sex.Hermaphrodite] = 0;

  for(var i = 0; i < this.players.length; i++) {
    mateQuestionCounts[this.players[i]] = 0;
    mateAnswerCounts[this.players[i]] = 0;
    pickFightCounts[this.players[i]] = 0;
  }

  for(var i = 0; i < this.aliveMice.length; i++) {
    var mouse = this.aliveMice[i];
    mateQuestionCounts[mouse.mateQuestionOwner]++;
    mateAnswerCounts[mouse.mateAnswerOwner]++;
    pickFightCounts[mouse.pickFightOwner]++;
    sexCounts[mouse.sex]++;
  }

  return cageStats;
}

/**
 *
 * @param {string} player The identifier for the player to be added.
 * @param {function} mateQuestion A function that returns another mate in the cage to mate with.
 * @param {function} mateAnswer A function that returns whether the mouse will mate with the proposing mouse.
 * @param {function} pickFight A function that returns another mouse in the cage to fight with.
 * @return {boolean} Whether the player was sucessfully added.
 */
Cage.prototype.addPlayer = function(player, mateQuestion, mateAnswer, pickFight) {
  // Check that player id doesn't already exist.
  if(this.players.indexOf(player) >= 0) {
    if(debug) { console.log('Error adding player (' + player + '). Already exists.'); }
    return false; 
  }
  // Add genes to gene pool.
  this.players.push(player);
  if(debug) { console.log(player + ' added to game.'); }
  this.mateQuestionGenes[player] = mateQuestion;
  this.mateAnswerGenes[player] = mateAnswer;
  this.pickFightGenes[player] = pickFight;

  return true;
}

/**
 * Checks whether a mate between the two mice will succeed.
 * @param {Mouse} proposingMouse The mouse that is proposing to mate.
 * @param {Mouse} askedMouse The mouse that is being asked to mate.
 * @return {boolean} Whether the mate succeeds.
 */
Cage.prototype.willMateSucceed = function(proposingMouse, askedMouse) {
  // Check if mice are the same.
  if(proposingMouse.id == askedMouse.id) {
    if(story) { console.log(getMouseName(proposingMouse) + ' is caught trying to mate with itself.'); }
    return false; 
   }
  // Check if mice are not of compatible sex.
  if(proposingMouse.sex != Sex.Hermaphrodite && proposingMouse.sex == askedMouse.sex) {
    if(story) { console.log('Ooops! ' + getMouseName(proposingMouse) + ' tried to mate with another ' + proposingMouse.sex + ' (' + getMouseName(askedMouse) + ')'); }
    return false; 
   }
  // Check if other mouse is infertile.
  if(askedMouse.fertility < 1) {
    if(story) { console.log(getMouseName(proposingMouse) + ' and ' + getMouseName(askedMouse) + ' mating failed because ' + getMouseName(askedMouse) + ' is sterile.'); }
    return false; 
   }
  // Ask second mouse whether it will mate with the proposing mouse.
  try {
    isMatingSuccessful = askedMouse.mateAnswer(proposingMouse.simpleClone());
    if(!isMatingSuccessful) {
      if(story) { console.log(getMouseName(proposingMouse) + ' asked ' + getMouseName(askedMouse) + ' to mate. The answer is NO!'); }
      return false;
    }
  } catch(err) {
    if(logExceptions) { logException(askedMouse.id + ' threw exception when asked by ' + proposingMouse + ': ' + err); }
    if(story) { console.log(getMouseName(proposingMouse) + ' asked ' + getMouseName(askedMouse) + ' to mate. The answer is NO!'); }
    return false;
  }
  if(story) { console.log(getMouseName(proposingMouse) + ' asked ' + getMouseName(askedMouse) + ' to mate. The answer is YES!'); }
  return true;
};

/**
 * Gets requested mate of mouse, attempts mating and starts life of any resultant child.
 * @param {Mouse} mouse The mouse to initiate mating.
 */
Cage.prototype.tryMating = function(mouse) {
  try {
    var targetMateID = mouse.mateQuestion();
    var targetMate = this.miceMap[targetMateID];
    // Check if mate is null or undefined.
    if(!targetMate) {
      if(story) { console.log(getMouseName(mouse) + ' decides not to mate ever again.'); }
      mouse.fertility = 0;
      return;
    }
  } catch(err) {
    if(logExceptions) { logException(mouse.id + ' threw exception in mateQuestion : ' + err); }
    this.death(mouse, getMouseName(mouse) + ' exploded when asked whom to mate with.');
    return;
  }
  if(this.willMateSucceed(mouse, targetMate)) {
    targetMate.fertility--;
    // Create offspring with these mice.
    if(debug) { console.log(mouse.id + " mating with " + targetMate.id); }
    var child = new Mouse(this, mouse, targetMate);
    this.born(child, mouse, targetMate);
    // Accounts for overpopulation.
    while(this.aliveMice.length > this.MAX_POPULATION) {
      // Find oldest mouse.
      var oldestIndex = 0;
      for(var i = 1; i < this.aliveMice.lenth; i++) {
        if(this.aliveMice[i].age > this.aliveMice[oldestIndex].age) {
          oldestIndex = i;
        }
      }
      // Kill oldest mouse.
      var oldestMouse = this.aliveMice[oldestIndex];
      this.death(oldestMouse, 'Maximum population (' + this.MAX_POPULATION + ') has been reached; '+ getMouseName(oldestMouse) + ' dies of old age');
    }
  }
};

/**
 * Gets requested opponent of mouse, attempts fight and kills losing mouse.
 * @param {Mouse} mouse The mouse to initiate fighting.
 */
Cage.prototype.tryFighting = function(mouse) {
  // First check that the mouse is alive.
  if(!this.isAlive(mouse)) {
    if(debug) { console.log('!!!! ' + mouse.id + ' can\'t fight because it is dead.'); }
    return; 
  }
  try {
    var opponentID = mouse.pickFight();
    var opponent = this.miceMap[opponentID];
    // Check if opponent doesn't exist.
    if(!opponent) {
      if(story) { console.log(getMouseName(mouse) + ' decides not to fight ever again.'); }
      mouse.fight = 0;
      return;
    }
  } catch(err) {
    if(logExceptions) { logException(mouse.id + ' threw exception in pickFight : ' + err); }
    this.death(mouse, getMouseName(mouse) + ' exploded when asked whom to fight with.');
    return;
  }
  if(debug) { console.log(mouse.id + ' attempting fight with ' + opponent.id); }
  // Check if opponent is itself.
  if(mouse.id == opponent.id) {
    this.death(mouse, getMouseName(mouse) + ' returned itself when asked whom to fight with.\n' + getMouseName(mouse) + ' is being executed to put it out of its misery.');
    return;
  }

  // Compute winner proportional to the size;
  var result = Math.random() - mouse.size/(mouse.size + opponent.size);
  if(result < 0) { // If fight proposer won.
    this.death(opponent, getMouseName(mouse) + ' fights and kills ' + getMouseName(opponent));
  } 
  else if(result == 0) { // If it was a tie.
    if(story) { console.log(getMouseName(mouse) + ' fights ' + getMouseName(opponent) + ' to a draw.'); }
  } else { // If opponent won.
    this.death(mouse, getMouseName(mouse) + ' fights and is killed by ' + getMouseName(opponent));
  }
};

/**
 * Runs life simulation on mouse.
 */
Cage.prototype.simulateLife = function(mouse) {
  // Age mouse.
  mouse.age++;
  // If mouse has fight left in it and it is not a pacifist (first generation are pacifists, born in a simpler time).
  if(mouse.fight > 0 && !mouse.pacifist) { // TODO change from fight to aggressiveness
    mouse.fight--;
    this.tryFighting(mouse); //TODO change from try
  }
  // If mouse is still fertile, breed with other mice.
  else if(mouse.fertility > 0){
    mouse.fertility--;
    this.tryMating(mouse);
  }
  // If mouse has finished fighting and breeding, it dies.
  else {
    this.death(mouse, getMouseName(mouse) + ' dies after a productive life.');
  }

// TODO change this
  this.checkForEnd();

  // Remove life from mapping of lives that are queued to run.
  delete this.mouseLife[mouse.id];

  // Queue life simulation again as long as mouse is still alive.
  if(this.isAlive(mouse) && !this.end) {
    this.life(mouse)
  }
}

/**
 * Adds mouse to cage.
 */
Cage.prototype.born = function(mouse, parentOne, parentTwo) {
  // Adds child to population.
  this.aliveMice.push(mouse);
  this.miceMap[mouse.id] = mouse;
  if(story) { console.log(getMouseName(mouse, true) + ' has been born to ' + getMouseName(parentOne) + ' + ' + getMouseName(parentTwo)); }

  // Notify of population change.
  var cageStats = this.getCageStats();
  this.visualization.populationUpdate(cageStats);

  this.life(mouse);
}

/**
 * Queues life simulation for mouse.
 */
Cage.prototype.life = function(mouse) {
  var self = this;
  var lifeID = setTimeout(function() { self.simulateLife(mouse); }, this.TEMPO);
  this.mouseLife[mouse.id] = lifeID;
}

/**
 * Checks if mouse is alive.
 * @return {boolean} True if mouse is alive, false otherwise.
 */
Cage.prototype.isAlive = function(mouse) {
  return (this.aliveMice.indexOf(mouse) > -1);
}

/**
 * Kills the mouse.
 */
Cage.prototype.death = function(mouse, reason) {
  if(story) { console.log(reason); }
  var index = this.aliveMice.indexOf(mouse);
  if(index > -1) {
    this.aliveMice.splice(index, 1);
  }
  delete this.miceMap[mouse.id];
  clearTimeout(this.mouseLife[mouse.id]);
  delete this.mouseLife[mouse.id];

  // Notify of population change.
  var cageStats = this.getCageStats();
  this.visualization.populationUpdate(cageStats);
};

/**
 * Check for end game.
 */
Cage.prototype.checkForEnd = function() {

  // Check if there are no mice left.
  if(this.aliveMice.length == 0) {
    this.endSimulation('all mice are dead.');
    return;
  }
  // Check if there is one mouse left.
  else if(this.aliveMice.length == 1) {
    var aliveMouse = this.aliveMice[0];
    this.endSimulation('there is only one mouse left.', aliveMouse.mateQuestionOwner, aliveMouse.mateAnswerOwner, aliveMouse.pickFightOwner);
    return;
  }
  // Check if there is only one sex left and thus the game is stalemated.
  var allSameSex = true;
  var cageSex =  this.aliveMice[0];
  for(var i = 1; i < this.aliveMice.length; i++) {
    var mouse = this.aliveMice[i]
    if(mouse.sex != cageSex) {
      allSameSex = false;
      break;
    }
  }
  if(allSameSex && cageSex != Sex.Hermaphrodite) {
    // Check what genes have won.
    var mateQuestionWinner = this.aliveMice[0].mateQuestionOwner;
    var mateAnswerWinner = this.aliveMice[0].mateAnswerOwner;
    var pickFightWinner = this.aliveMice[0].pickFightOwner;
    for(var i = 1; i < this.aliveMice.length; i++) {
      var mouse = this.aliveMice[i];
      if(mateQuestionWinner) {
        if(mateQuestionWinner != mouse.mateQuestionOwner) {
          mateQuestionWinner = null;
        }
      }
      if(mateAnswerWinner) {
        if(mateAnswerWinner != mouse.mateAnswerOwner) {
          mateAnswerWinner = null;
        }
      }
      if(pickFightWinner) {
        if(pickFightWinner != mouse.pickFightOwner) {
          pickFightWinner = null;
        }
      }
    }
    this.endSimulation('all mice are ' + cageSex + '.', mateQuestionWinner, mateAnswerWinner, pickFightWinner);
    return;
  }
  // Check if there is no diversity left.
  var noDiversity = true;
  var mateQuestionWinner = this.aliveMice[0].mateQuestionOwner;
  var mateAnswerWinner = this.aliveMice[0].mateAnswerOwner;
  var pickFightWinner = this.aliveMice[0].pickFightOwner;
  for(var i = 1; i < this.aliveMice.length; i++) {
    var mouse = this.aliveMice[i];
    if(mateQuestionWinner != mouse.mateQuestionOwner || mateAnswerWinner != mouse.mateAnswerOwner || pickFightWinner != mouse.pickFightOwner) {
      noDiversity = false;
    }
  }
  if(noDiversity) {
    this.endSimulation('there is is no diversity left.', mateQuestionWinner, mateAnswerWinner, pickFightWinner);
    return;
  }
  // Check if there's no possible mate pairings left.
  var potentialMate = null;
  var matesExist = false;
  for(var i = 0; i < this.aliveMice.length; i++) {
    var mouse = this.aliveMice[i];
    if(mouse.fertility > 0) {
      if(!potentialMate) {
        potentialMate = mouse;
      }
      else if(potentialMate.sex == Sex.Hermaphrodite || potentialMate.sex != mouse.sex) {
        matesExist = true;
        break;
      }
    }
  }
  if(!matesExist) {
    this.endSimulation('No possible mate pairings left');
  }
}

/**
 * Ends the simulation.
 */
Cage.prototype.endSimulation = function(reason, opt_mateQuestionWinner, opt_mateAnswerWinner, opt_pickFightWinner) {
  // Cancel all queued life simulations.
  for(id in this.mouseLife) {
    clearTimeout(this.mouseLife[id]);
  }
  console.log('\nGame ended because ' + reason)
  if(opt_mateQuestionWinner || opt_mateAnswerWinner || opt_pickFightWinner) {
    console.log('Gene winners:');
    if(opt_mateQuestionWinner) {
      console.log('mateQuestion: ' + opt_mateQuestionWinner);
    }
    if(opt_mateAnswerWinner) {
      console.log('mateAnswer: ' + opt_mateAnswerWinner);
    }
    if(opt_pickFightWinner) {
      console.log('pickFight: ' + opt_pickFightWinner);
    }
  }
  else {
    console.log('No gene winners.');
  }
  this.logStateOfCage();
  this.end = true;
};

/**
 * Start the simulation.
 */
Cage.prototype.restartSimulation = function() {
  // Inialize cage.
  this.mouseIDs = 0;
  this.currentGen = 0;
  this.aliveMice = [];
  this.miceMap = {};
  this.mouseLife = {};
  this.end = false;

  var startingMice = []
  // Create a mouse for each player.
  for(var i = 0; i < this.players.length; i++) {
    var mouse = new Mouse(this, null, null, this.players[i]);
    this.miceMap[mouse.id] = mouse;
    this.aliveMice.push(mouse);
    startingMice.push(mouse);
    if(debug) { console.log('Mouse' + mouse.id + ' added to cage.'); }
    if(story) { console.log(getMouseName(mouse, true) + ' dropped into the cage.'); }
  }

  // Notify of population initialization.
  this.visualization.populationInit(this.getCageStats());

  // Start life simulation for all mice.
  // All are guarenteed to be alive because first generation mice do not fight.
  for(var i = 0; i < this.aliveMice.length; i++) {
    var mouse = this.aliveMice[i];
    this.life(mouse);
  }
};

