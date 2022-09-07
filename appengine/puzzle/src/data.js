/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Data for Puzzle game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Puzzle.data');

goog.require('BlocklyGames');


/**
 * Assemble the Puzzle's data.
 * Can't be run at the top level since the messages haven't loaded yet.
 */
Puzzle.data.getData = function() {
  return [
    {
      name: BlocklyGames.getMsg('Puzzle.animal1', false),
      pic: 'duck.jpg',
      picHeight: 70,
      picWidth: 100,
      legs: 2,
      traits: [
        BlocklyGames.getMsg('Puzzle.animal1Trait1', false),
        BlocklyGames.getMsg('Puzzle.animal1Trait2', false)
      ],
      helpUrl: BlocklyGames.getMsg('Puzzle.animal1HelpUrl', false)
    },
    {
      name: BlocklyGames.getMsg('Puzzle.animal2', false),
      pic: 'cat.jpg',
      picHeight: 70,
      picWidth: 100,
      legs: 4,
      traits: [
        BlocklyGames.getMsg('Puzzle.animal2Trait1', false),
        BlocklyGames.getMsg('Puzzle.animal2Trait2', false)
      ],
      helpUrl: BlocklyGames.getMsg('Puzzle.animal2HelpUrl', false)
    },
    {
      name: BlocklyGames.getMsg('Puzzle.animal3', false),
      pic: 'bee.jpg',
      picHeight: 70,
      picWidth: 100,
      legs: 6,
      traits: [
        BlocklyGames.getMsg('Puzzle.animal3Trait1', false),
        BlocklyGames.getMsg('Puzzle.animal3Trait2', false)
      ],
      helpUrl: BlocklyGames.getMsg('Puzzle.animal3HelpUrl', false)
    },
    {
      name: BlocklyGames.getMsg('Puzzle.animal4', false),
      pic: 'snail.jpg',
      picHeight: 70,
      picWidth: 100,
      legs: 0,
      traits: [
        BlocklyGames.getMsg('Puzzle.animal4Trait1', false),
        BlocklyGames.getMsg('Puzzle.animal4Trait2', false)
      ],
      helpUrl: BlocklyGames.getMsg('Puzzle.animal4HelpUrl', false)
    },
  ];
};
