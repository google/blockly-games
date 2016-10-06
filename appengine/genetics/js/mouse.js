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

goog.require('goog.math');


/**
 * Creates a mouse.
 * @param {number} id The ID to assign the mouse.
 * @param {!Genetics.Mouse.Sex} sex The sex of the mouse.
 * @param {?number} playerId The identifier of the player owning all
 *     the genes (passed if there are no parents).
 * @param {Genetics.Mouse=} opt_parentOne One of the parents of the mouse.
 * @param {Genetics.Mouse=} opt_parentTwo One of the parents of the mouse.
 * @constructor
 * @struct
 */
Genetics.Mouse = function(id, sex, playerId, opt_parentOne, opt_parentTwo) {
  // Returns a random integer between two integers; minValue (inclusive)
  // and maxValue (inclusive).
  function randomInt(minValue, maxValue) {
    return goog.math.randomInt(maxValue - minValue + 1) + minValue;
  }
  if (opt_parentOne && opt_parentTwo) {
    // Choose which functions are inherited from parents.
    var pickFightParent = goog.math.randomInt(2);
    var mateQuestionParent = goog.math.randomInt(2);
    // Guarantee that at least one function is inherited from each parent.
    var acceptMateParent = (pickFightParent === mateQuestionParent) ?
        !mateQuestionParent : goog.math.randomInt(2);
    this.pickFightOwner = pickFightParent ? opt_parentOne.pickFightOwner :
        opt_parentTwo.pickFightOwner;
    this.proposeMateOwner = mateQuestionParent ?
        opt_parentOne.proposeMateOwner : opt_parentTwo.proposeMateOwner;
    this.acceptMateOwner = acceptMateParent ? opt_parentOne.acceptMateOwner :
        opt_parentTwo.acceptMateOwner;
    // Assign stats based on parents with some mutations.
    this.size = goog.math.clamp(
        goog.math.average(opt_parentOne.size + opt_parentTwo.size) +
        randomInt(Genetics.Mouse.MIN_MUTATION, Genetics.Mouse.MAX_MUTATION),
        Genetics.Mouse.MIN_SIZE, Genetics.Mouse.MAX_SIZE);
    this.startAggressiveness = Math.max(0, Math.round(
        goog.math.average(opt_parentOne.startAggressiveness,
                          opt_parentTwo.startAggressiveness)) +
        randomInt(Genetics.Mouse.MIN_MUTATION, Genetics.Mouse.MAX_MUTATION));
    this.aggressiveness = this.startAggressiveness;
    this.startFertility = Math.max(0, Math.round(
        goog.math.average(opt_parentOne.startFertility,
                          opt_parentTwo.startFertility)) +
        randomInt(Genetics.Mouse.MIN_MUTATION, Genetics.Mouse.MAX_MUTATION));
  } else {
    // Mouse is a first generation mouse.
    this.pickFightOwner = playerId;
    this.proposeMateOwner = playerId;
    this.acceptMateOwner = playerId;
    this.size = Genetics.Mouse.SIZE;
    this.startAggressiveness = Genetics.Mouse.START_AGGRESSIVENESS;
    // First generation mice do not fight.
    this.aggressiveness = 0;
    this.startFertility = Genetics.Mouse.START_FERTILITY;
  }

  this.fertility = this.startFertility;
  this.age = 0;
  this.id = id;
  this.sex = sex;
};

/**
 * Defines the types of sex of mice.
 * @enum {string}
 */
Genetics.Mouse.Sex = {
  MALE: 'Male',
  FEMALE: 'Female'
};

/**
 * The smallest change that a mutation in assigning mouse stats can be.
 * @const {number}
 */
Genetics.Mouse.MIN_MUTATION = -1;

/**
 * The greatest change that a mutation in assigning mouse stats can be.
 * @const {number}
 */
Genetics.Mouse.MAX_MUTATION = 1;

/**
 * The minimum size of a mouse.
 * @const {number}
 */
Genetics.Mouse.MIN_SIZE = 1;

/**
 * The maximum size of a mouse.
 * @const {number}
 */
Genetics.Mouse.MAX_SIZE = 10;

/**
 * The size of a first generation mouse.
 * @const {number}
 */
Genetics.Mouse.SIZE = 2;

/**
 * Number of fight opportunities that a first generation mouse will pass on to
 * its children.
 * @const {number}
 */
Genetics.Mouse.START_AGGRESSIVENESS = 2;

/**
 * The number of mating attempts that a first generation mouse starts with.
 * @const {number}
 */
Genetics.Mouse.START_FERTILITY = 4;
