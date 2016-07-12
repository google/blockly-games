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
 * @fileoverview Creates a mouse.
 * @author kozbial@google.com (Monica Kozbial)
 */
'use strict';

goog.provide('Genetics.Mouse');

goog.require('Genetics');
goog.require('Genetics.Cage');
goog.require('goog.math');


/**
 * Creates a mouse.
 * @constructor
 * @param {number} id The id to assign the mouse.
 * @param {Genetics.Mouse=} opt_parentOne One of the parents of the mouse.
 * @param {Genetics.Mouse=} opt_parentTwo One of the parents of the mouse.
 * @param {number=} opt_player The identifier of the player owning all
 * the genes (passed if there are no parents).
 */
Genetics.Mouse = function(id, opt_parentOne, opt_parentTwo, opt_player) {
  // Returns a random in between minValue (inclusive) and maxValue (inclusive).
  function getRandomInt(minValue, maxValue) {
    return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
  }
  if (opt_parentOne && opt_parentTwo) {
    // Choose which functions are inherited from parents.
    var mateQuestionParent = getRandomInt(0, 1);
    var mateAnswerParent = getRandomInt(0, 1);
    // Guarantee that at least one function is inherited from each parent.
    var pickFightParent = (mateQuestionParent == mateAnswerParent) ?
        !mateQuestionParent : getRandomInt(0, 1);
    this.chooseMateOwner = mateQuestionParent ?
        opt_parentOne.chooseMateOwner : opt_parentTwo.chooseMateOwner;
    this.mateAnswerOwner = mateAnswerParent ? opt_parentOne.mateAnswerOwner :
        opt_parentTwo.mateAnswerOwner;
    this.pickFightOwner = pickFightParent ? opt_parentOne.pickFightOwner :
        opt_parentTwo.pickFightOwner;
    // Assign stats based on parents with some mutations.
    this.size = goog.clamp((opt_parentOne.size + opt_parentTwo.size) / 2 +
        getRandomInt(Genetics.Cage.MIN_MUTATION, Genetics.Cage.MAX_MUTATION),
        Genetics.Cage.MIN_SIZE, Genetics.Cage.MAX_SIZE);
    this.sex = (getRandomInt(0, 1)) ? Genetics.Mouse.Sex.MALE :
        Genetics.Mouse.Sex.FEMALE;
    this.fertility = Math.max(0, Math.round((opt_parentOne.startingFertility +
        opt_parentTwo.startingFertility) / 2) +
        getRandomInt(Genetics.Cage.MIN_MUTATION, Genetics.Cage.MAX_MUTATION));
    this.aggressiveness = Math.max(0, Math.round((
            opt_parentOne.startingAggressiveness +
        opt_parentTwo.startingAggressiveness) / 2) +
        getRandomInt(Genetics.Cage.MIN_MUTATION, Genetics.Cage.MAX_MUTATION));
  } else {
    // Mouse is a first generation mouse.
    this.chooseMateOwner = opt_player;
    this.mateAnswerOwner = opt_player;
    this.pickFightOwner = opt_player;
    // First generation mice do not fight.
    this.aggressiveness = 0;
  }

  this.startingFertility = this.fertility;
  this.age = 0;
  this.id = id;
};

/**
 * Defines the types of sex of mice.
 * @type {{Male: string, Female: string, Hermaphrodite: string}}
 */
Genetics.Mouse.Sex = {
  MALE: 'Male',
  FEMALE: 'Female',
  HERMAPHRODITE: 'Hermaphrodite'
};

/**
 * The size of a first generation mouse.
 * @type {number}
 */
Genetics.Mouse.prototype.size = Genetics.Cage.START_SIZE;

/**
 * Sex of a first generation mouse.
 * @type {string}
 */
Genetics.Mouse.prototype.sex = Genetics.Mouse.Sex.HERMAPHRODITE;

/**
 * Number of fight opportunities that a first generation mouse will pass on to
 * its children.
 * @type {number}
 */
Genetics.Mouse.prototype.startingAggressiveness =
    Genetics.Cage.START_AGGRESSIVENESS;

/**
 * The number of mating attempts that a first generation mouse starts with.
 * @type {number}
 */
Genetics.Mouse.prototype.startingFertility = Genetics.Cage.START_FERTILITY;
