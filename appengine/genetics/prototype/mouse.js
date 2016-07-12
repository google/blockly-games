// TODO dependency declarations

var START_SIZE = 10;
var START_FIGHT = 2;
var START_FERTILITY = 4;
var MIN_MUTATION = -2;
var MAX_MUTATION = 2;

var Sex = {
    Male: 'Male',
    Female: 'Female',
    Hermaphrodite: 'Hermaphrodite'
};

/**
 * Returns a random in between minValue (inclusive) and maxValue (inclusive).
 * @param {number} minValue The min value of number to be returned (inclusive).
 * @param {number} maxValue The max value of number to be returned (inclusive).
 * @return {number} The random number.
 */
function getRandomInt(minValue, maxValue) {
  return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
}

/**
 * Creates a mouse.
 * @param {Cage} cage The cage the mouse is in.
 * @param {Mouse} opt_parentOne One of the parents of the mouse.
 * @param {Mouse} opt_parentTwo TOne of the parents of the mouse.
 * @param {string} opt_player The string identifier of the player owning all the genes (passed if there are no parents).
 */
function Mouse(cage, opt_parentOne, opt_parentTwo, opt_player) {
  if(opt_parentOne && opt_parentTwo) {
    //TODO comment
    var mqParent = getRandomInt(0,1);
    var maParent = getRandomInt(0,1);
    var pfParent = (mqParent == maParent) ? !mqParent : getRandomInt(0,1);
    this.mateQuestionOwner = (mqParent) ? opt_parentOne.mateQuestionOwner : opt_parentTwo.mateQuestionOwner;
    this.mateAnswerOwner = (maParent) ? opt_parentOne.mateAnswerOwner : opt_parentTwo.mateAnswerOwner;
    this.pickFightOwner = (pfParent) ? opt_parentOne.pickFightOwner : opt_parentTwo.pickFightOwner;
    this.size = Math.max(cage.MIN_SIZE, (opt_parentOne.size + opt_parentTwo.size)/2 + getRandomInt(MIN_MUTATION,MAX_MUTATION));
    this.sex = (getRandomInt(0,1)) ? Sex.MALE : Sex.FEMALE;;
    this.fertility = Math.max(0, Math.round((opt_parentOne.startingFertility + opt_parentTwo.startingFertility)/2) + getRandomInt(MIN_MUTATION,MAX_MUTATION));
    this.fight =  Math.max(0, Math.round((opt_parentOne.startingFight + opt_parentTwo.startingFight)/2) + getRandomInt(MIN_MUTATION,MAX_MUTATION));
    this.pacifist = false;
  } else {
    this.mateQuestionOwner = opt_player;
    this.mateAnswerOwner = opt_player;
    this.pickFightOwner = opt_player;
    this.pacifist = true; // TODO change so fight is 0 for starting
  }

  this.startingFertility = this.fertility;
  this.startingFight = this.fight;
  this.age = 0;
  this.id = cage.mouseIDs++;

  this.simpleClone = function() {
    return {
      mateQuestionOwner: this.mateQuestionOwner,
      mateAnswerOwner: this.mateAnswerOwner,
      pickFightOwner: this.pickFightOwner,
      size: this.size,
      sex: this.sex,
      startingFertility: this.startingFertility,
      startingFight: this.startingFight,
      fertility: this.fertility,
      fight: this.fight,
      age: this.age,
      id: this.id
    };
  };

  var geneContext = {
    mateQuestionOwner: this.mateQuestionOwner,
    mateAnswerOwner: this.mateAnswerOwner,
    pickFightOwner: this.pickFightOwner,
    size: this.size,
    sex: this.sex,
    id: this.id,
    startingFertility: this.startingFertility,
    startingFight: this.startingFight,
  };

  var self = this;
  Object.defineProperty(geneContext, 'fertility', {
        get: function () {
          return self.fertility;
        }
    });
  Object.defineProperty(geneContext, 'fight', {
        get: function () {
          return self.fight;
        }
    });
  Object.defineProperty(geneContext, 'age', {
        get: function () {
          return self.age;
        }
    });
  Object.defineProperty(geneContext, 'otherMice', {
        get: function () {
          var mice = [];
          for(var i = 0; i < cage.aliveMice_.length; i++) {
            var mouse = cage.aliveMice_[i];
            if(mouse.id != self.id) {
              mice.push(mouse.simpleClone());
            }
          }
          return mice;
        }
    });

  this.mateQuestion = cage.mateQuestionGenes[this.mateQuestionOwner].bind(geneContext);
  this.mateAnswer = cage.mateAnswerGenes[this.mateAnswerOwner].bind(geneContext);
  this.pickFight = cage.pickFightGenes[this.pickFightOwner].bind(geneContext);
};

// Set defaults for initial mouse.
Mouse.prototype.size = START_SIZE;
Mouse.prototype.sex = Sex.HERMAPHRODITE;
Mouse.prototype.fight = START_FIGHT;
Mouse.prototype.fertility = START_FERTILITY;

