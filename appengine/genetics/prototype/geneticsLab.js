//TODO dependency declarations.
// Depends on cage.js
// Depends on visualization.js

// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages':['corechart']});

// Set a callback to run when API is loaded.
google.charts.setOnLoadCallback(startSimulation);

function startSimulation() {
  var visualization = new Visualization();
  // Create a new cage.
  var cage = new Cage(visualization);
  // Make a few players.
  createFakePlayers(cage, 0, 1, 0, 3);
  // Initialize cage.
  cage.restartSimulation();
};

function createVariantPlayer(cage, num) {
  var mateQuestion = function() {
     // Choose the mate with the highest fertility gene.
    var mate;
    for(var i = 0; i < this.otherMice.length; i++) {
      var mouse = this.otherMice[i];
      // Check that potential mate is valid.
      if((mouse.sex == Sex.Hermaphrodite || mouse.sex != this.sex) && mouse.fertility > 0) {
        // Change mate choice if new mate would pass on higher fertility.
        if(!mate || mouse.startingFertility > mate.startingFertility) {
          mate = mouse;
        }
      }
    }
    if(!mate) return null;
    return mate.id;
  };
  var mateAnswer = function(other) {
    // Survey for how many mice own target gene.
    var bestGeneOwner = this.mateAnswerOwner;
    // Check if mate owns the right gene.
    if(other.mateQuestionOwner == bestGeneOwner || other.mateAnswerOwner == bestGeneOwner || other.pickFightOwner == bestGeneOwner) {
      return true;
    }
    var okayMice = 0; // Count of how many mice own 1 if the 'best' gene.
    var greatMice = 0; // Count of how many mice have 2 of the 'best' genes.
    var bestMice = 0; // Count of how many mice have all the 'best' genes.
    var fertileMice = 0;
    for(var i = 0; i < this.otherMice.length; i++) {
      var mouse = this.otherMice[i];
      if(mouse.fertility) {
        fertileMice++;
        // Count how many of the 'right' genes the mouse has.
        var rightGeneCount = 0;
        if(mouse.mateQuestionOwner == bestGeneOwner) { rightGeneCount++; }
        if(mouse.mateAnswerOwner == bestGeneOwner) { rightGeneCount++; }
        if(mouse.pickFightOwner == bestGeneOwner) { rightGeneCount++; }
        switch(rightGeneCount) {
          case 1: 
                  okayMice++;
                  break;
          case 2: 
                  greatMice++;
                  break;
          case 3: 
                  okayMice++;
                  break;
        }
      }
    }

    var rightGeneCount = 0;
    if(mouse.mateQuestionOwner == bestGeneOwner) { rightGeneCount++; }
    if(mouse.mateAnswerOwner == bestGeneOwner) { rightGeneCount++; }
    if(mouse.pickFightOwner == bestGeneOwner) { rightGeneCount++; }
    // Be very selective if there are a lot of best choices.
    if(bestMice/fertileMice > 0.5) {
      return rightGeneCount > 2;
    }
    // Otherwise be less selective if there are still a lot of great choices
    if((greatMice + bestMice)/fertileMice > 0.5) {
      return rightGeneCount > 1;
    }
    // Otherwise be somewhat selective if there are some okay choices
    if((okayMice + greatMice + bestMice)/fertileMice > 0.5) {
      return rightGeneCount > 2;
    }
    // Otherwise take what you can get
    return true;
  };
  var pickFight = function() {
    // Never fight
    return null;
  };
  var name = 'VariantPlayer';
  if(num && num > 1) { name += ' ' + num; }
  cage.addPlayer(name, mateQuestion, mateAnswer, pickFight);
}

function createHighBreedingPlayer(cage, num) {
  var mateQuestion = function() {
    // Choose the mate with the highest fertility gene.
    var mate;
    for(var i = 0; i < this.otherMice.length; i++) {
      var mouse = this.otherMice[i];
      // Check that potential mate is valid.
      if((mouse.sex == Sex.Hermaphrodite || mouse.sex != this.sex) && mouse.fertility > 0) {
        // Change mate choice if new mate would pass on higher fertility.
        if(!mate || mouse.startingFertility > mate.startingFertility) {
          mate = mouse;
        }
      }
    }
    if(!mate) return null;
    return mate.id;
  };
  var mateAnswer = function(other) {
    return true;//other.startingFertility >= this.startingFertility;
  };
  var pickFight = function() {
    // Allways choose not to fight.
    return null;
  };
  var name = 'HighBreedingPlayer';
  if(num && num > 1) { name += ' ' + num; }
  cage.addPlayer(name, mateQuestion, mateAnswer, pickFight);
}

function createAggressivePlayer(cage, num) {
  var mateQuestion = function() {
    // Choose the biggest valid mate.
    var mate;
    for(var i = 0; i < this.otherMice.length; i++) {
      var mouse = this.otherMice[i];
      // Check that potential mate is valid.
      if(mouse.sex == Sex.Hermaphrodite || mouse.sex != this.sex) {
        // Change mate choice if new mate is bigger.
        if(!mate || mouse.size > mate.size) {
          mate = mouse;
        }
      }
    }
    if(!mate) return null;
    return mate.id;
  };
  var mateAnswer = function(other) {
    return other.size >= this.size;
  };
  var pickFight = function() {
    // Chose the smallest opponent.
    var opponent;
    for(var i = 0; i < this.otherMice.length; i++) {
      var mouse = this.otherMice[i];
      if(!opponent || mouse.size < opponent.size) {
        opponent = mouse;
      }
    }
    if(!opponent || opponent.size >= this.size) return null;
    return opponent.id;
  };
  var name = 'AggressivePlayer';
  if(num && num > 1) { name += ' ' + num; }
  cage.addPlayer(name, mateQuestion, mateAnswer, pickFight);
}

function createSimplePlayer(cage, num) { //TODO change to random
  var mateQuestion = function() { var mate = this.otherMice[getRandomInt(0,this.otherMice.length-1)]; return mate.id; };
  var mateAnswer = function(other) { return true; };
  var pickFight = function() { var opponent = this.otherMice[getRandomInt(0,this.otherMice.length-1)]; return opponent.id; };
  var name = 'Simple';
  if(num && num > 1) { name += ' ' + num; }
  cage.addPlayer(name, mateQuestion, mateAnswer, pickFight);
}

/**
 * Creates fake players and adds them to the game (cage).
 * @param {Cage} cage The cage to add the fake players to.
 * @param {number} numVariant The number of players to add with the varient AI.
 * @param {number} numHighBreeding The number of players to add with the high breeding AI.
 * @param {number} numAggressive The number of players to add with the aggressive AI.
 * @param {number} numSimple The number of players to add with the simple AI.
 */
function createFakePlayers(cage, numVariant, numHighBreeding, numAggressive, numSimple) {
  // Create varient players.
  for(var i = 1; i <= numVariant; i++) {
    createVariantPlayer(cage, i);
  }
  // Create high breeding players.
  for(var i = 1; i <= numHighBreeding; i++) {
    createHighBreedingPlayer(cage, i);
  }
  // Create aggressive players.
  for(var i = 1; i <= numAggressive; i++) {
    createAggressivePlayer(cage, i);
  }
  // Create dumb players.
  for(var i = 1; i <= numSimple; i++) {
    createSimplePlayer(cage, i);
  }
};
