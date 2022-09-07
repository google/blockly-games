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

goog.require('BlocklyGames.Msg');


/**
 * Assemble the Puzzle's data.
 * Can't be run at the top level since the messages haven't loaded yet.
 */
Puzzle.data.getData = function() {
  return [
    {
      name: BlocklyGames.Msg['Puzzle.animal1'],
      pic: 'duck.jpg',
      picHeight: 70,
      picWidth: 100,
      legs: 2,
      traits: [
        BlocklyGames.Msg['Puzzle.animal1Trait1'],
        BlocklyGames.Msg['Puzzle.animal1Trait2']
      ],
      helpUrl: BlocklyGames.Msg['Puzzle.animal1HelpUrl']
    },
    {
      name: BlocklyGames.Msg['Puzzle.animal2'],
      pic: 'cat.jpg',
      picHeight: 70,
      picWidth: 100,
      legs: 4,
      traits: [
        BlocklyGames.Msg['Puzzle.animal2Trait1'],
        BlocklyGames.Msg['Puzzle.animal2Trait2']
      ],
      helpUrl: BlocklyGames.Msg['Puzzle.animal2HelpUrl']
    },
    {
      name: BlocklyGames.Msg['Puzzle.animal3'],
      pic: 'bee.jpg',
      picHeight: 70,
      picWidth: 100,
      legs: 6,
      traits: [
        BlocklyGames.Msg['Puzzle.animal3Trait1'],
        BlocklyGames.Msg['Puzzle.animal3Trait2']
      ],
      helpUrl: BlocklyGames.Msg['Puzzle.animal3HelpUrl']
    },
    {
      name: BlocklyGames.Msg['Puzzle.animal4'],
      pic: 'snail.jpg',
      picHeight: 70,
      picWidth: 100,
      legs: 0,
      traits: [
        BlocklyGames.Msg['Puzzle.animal4Trait1'],
        BlocklyGames.Msg['Puzzle.animal4Trait2']
      ],
      helpUrl: BlocklyGames.Msg['Puzzle.animal4HelpUrl']
    },
  ];
};
