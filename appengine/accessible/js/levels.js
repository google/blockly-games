/**
 * Blockly Demos: Accessible Blockly
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
 * @fileoverview Level sets for the Accessible Blockly music game.
 *
 * @author sll@google.com (Sean Lip)
 */

/**
 * This file is organized as follows:
 * - First, there are a few stock level sets that can be used as levels. You
 *     can create your own level packs, too!
 * - The LEVEL_SETS constant at the bottom collects all the sets that are
 *     actually used in index.html.
 */

 var LEVEL_SETS = {};

 LEVEL_SETS.tutorial = {
  name: 'Music Tutorial',
  levels: [{
    allowedBlockTypes: ['music_play_note'],
    beatsPerMinute: 80,
    expectedLine: [
      [[48], 1]
    ],
    getTargetedFeedback: function() {},
    hint: (
        'Start by going to the toolbox and finding the block called ' +
        '"play note C4". Then, create a new group with this block.'),
    htmlInstructions: ['Play the note C4.']
  }, {
    allowedBlockTypes: ['music_play_note'],
    beatsPerMinute: 80,
    expectedLine: [
      [[55], 1]
    ],
    getTargetedFeedback: function(chords) {
      if (chords.length == 1 && chords[0].midiPitches[0] == 48) {
        return 'Not quite. Did you change C4 to the correct note?';
      }
    },
    htmlInstructions: ['Play the note G4.'],
    hint: (
        'Put a "play note" block in the workspace, then change the value ' +
        'to G4.')
  }, {
    allowedBlockTypes: ['music_play_note'],
    beatsPerMinute: 80,
    expectedLine: [
      [[48], 1],
      [[52], 1],
      [[55], 1]
    ],
    getTargetedFeedback: function(chords) {
      if (chords.length == 3 &&
          (chords[0].midiPitches[0] != 48 ||
           chords[1].midiPitches[0] != 52 ||
           chords[2].midiPitches[0] != 55)) {
        return 'Not quite. Are you playing the right notes?';
      } else if (chords.length != 3) {
        return (
            'Not quite. Are you using the right number of blocks? They need ' +
            'to be connected to each other.');
      }
    },
    hint: (
        'Make sure the blocks are connected to each other. You can connect ' +
        'blocks by copying and pasting them from the workspace, or by ' +
        'marking a spot in the block, and then copying a new block to that ' +
        'marked spot.'),
    htmlInstructions: ['Play C4, then E4, then G4.']
  }, {
    allowedBlockTypes: ['music_play_note_with_duration'],
    beatsPerMinute: 80,
    expectedLine: [
      [[55], 2]
    ],
    getTargetedFeedback: function(chords) {
      if (chords.length == 1 && chords[0].midiPitches[0] == 55 &&
          chords[0].durationInBeats != 2) {
        return 'Remember to change the duration to 2 beats.';
      }
    },
    hint: (
        'You can change the duration by navigating to the input field and ' +
        'pressing Enter. After entering it, press the Escape key.'),
    htmlInstructions: ['Play G4 for two beats.']
  }, {
    allowedBlockTypes: ['music_play_note', 'loops_repeat'],
    beatsPerMinute: 80,
    expectedLine: [
      [[48], 1],
      [[48], 1],
      [[48], 1],
      [[48], 1],
      [[48], 1],
      [[48], 1],
      [[48], 1],
      [[48], 1]
    ],
    getTargetedFeedback: function(chords) {
      if (chords.length != 8) {
        return 'Not quite! Are you playing the right number of notes?';
      }
    },
    hint: 'You can do this with only two blocks, by using a repeat block.',
    htmlInstructions: ['Play C4 eight times.']
  }]
};

LEVEL_SETS.game1 = {
  name: 'Music Game',
  levels: [{
    allowedBlockTypes: ['music_play_phrase'],
    beatsPerMinute: 120,
    expectedLine: [
      [[55], 0.75],
      [[55], 0.25],
      [[57], 1],
      [[55], 1],
      [[60], 1],
      [[59], 2],

      [[55], 0.75],
      [[55], 0.25],
      [[57], 1],
      [[55], 1],
      [[62], 1],
      [[60], 2],

      [[55], 0.75],
      [[55], 0.25],
      [[67], 1],
      [[64], 1],
      [[60], 1],
      [[59], 1],
      [[57], 2],

      [[65], 0.75],
      [[64], 0.25],
      [[63], 1],
      [[60], 1],
      [[62], 1],
      [[60], 2]
    ],
    htmlInstructions: ['Use four blocks to play the familiar "Happy Birthday" tune.']
  }, {
    allowedBlockTypes: ['music_play_phrase'],
    beatsPerMinute: 120,
    expectedLine: [
      [[52], 1],
      [[50], 1],
      [[48], 1],
      [[50], 1],
      [[52], 1],
      [[52], 1],
      [[52], 1]
    ],
    htmlInstructions: ['Play Mary Had a Little Lamb: E4-D4-C4-D4-E4-E4-E4.']
  }, {
    allowedBlockTypes: ['music_play_note'],
    beatsPerMinute: 120,
    expectedLine: [
      [[48], 1],
      [[50], 1],
      [[52], 1],
      [[48], 1],
    ],
    htmlInstructions: ['Play the first bar of Frere Jacques: C-D-E-C.']
  }, {
    allowedBlockTypes: ['music_play_note', 'loops_repeat'],
    beatsPerMinute: 150,
    expectedLine: [
      [[48], 1],
      [[50], 1],
      [[52], 1],
      [[48], 1],
      [[48], 1],
      [[50], 1],
      [[52], 1],
      [[48], 1]
    ],
    htmlInstructions: ['Play the first part of Frere Jacques, twice.']
  }, {
    allowedBlockTypes: ['music_play_note', 'loops_repeat'],
    beatsPerMinute: 150,
    expectedLine: [
      [[48], 1],
      [[50], 1],
      [[52], 1],
      [[48], 1],
      [[48], 1],
      [[50], 1],
      [[52], 1],
      [[48], 1]
    ],
    htmlInstructions: [
        'Play the first part of Frere Jacques twice as before, but now, use ' +
        'only 5 blocks.']
  }, {
    allowedBlockTypes: [
      'music_play_note',
      'music_play_note_with_duration',
      'loops_repeat'
    ],
    beatsPerMinute: 150,
    expectedLine: [
      [[48], 1],
      [[50], 1],
      [[52], 1],
      [[48], 1],
      [[48], 1],
      [[50], 1],
      [[52], 1],
      [[48], 1],

      [[52], 1],
      [[53], 1],
      [[55], 2]
    ],
    htmlInstructions: ['Add on the part after that: E-F-G']
  }, {
    allowedBlockTypes: [
      'music_play_note',
      'music_play_note_with_duration',
      'loops_repeat'
    ],
    beatsPerMinute: 150,
    expectedLine: [
      [[48], 1],
      [[50], 1],
      [[52], 1],
      [[48], 1],
      [[48], 1],
      [[50], 1],
      [[52], 1],
      [[48], 1],

      [[52], 1],
      [[53], 1],
      [[55], 2],
      [[52], 1],
      [[53], 1],
      [[55], 2]
    ],
    htmlInstructions: ['Add on an additional E-F-G']
  }, {
    allowedBlockTypes: [
      'music_play_note',
      'music_play_note_with_duration',
      'loops_repeat'
    ],
    beatsPerMinute: 150,
    expectedLine: [
      [[48], 1],
      [[50], 1],
      [[52], 1],
      [[48], 1],
      [[48], 1],
      [[50], 1],
      [[52], 1],
      [[48], 1],

      [[52], 1],
      [[53], 1],
      [[55], 2],
      [[52], 1],
      [[53], 1],
      [[55], 2],

      [[55], 0.5],
      [[57], 0.5],
      [[55], 0.5],
      [[53], 0.5],
      [[52], 1],
      [[48], 1],
      [[55], 0.5],
      [[57], 0.5],
      [[55], 0.5],
      [[53], 0.5],
      [[52], 1],
      [[48], 1]
    ],
    htmlInstructions: ['Add the third part, twice.'],
  }, {
    allowedBlockTypes: [
      'music_play_note',
      'music_play_note_with_duration',
      'loops_repeat'
    ],
    beatsPerMinute: 150,
    expectedLine: [
      [[48], 1],
      [[50], 1],
      [[52], 1],
      [[48], 1],
      [[48], 1],
      [[50], 1],
      [[52], 1],
      [[48], 1],

      [[52], 1],
      [[53], 1],
      [[55], 2],
      [[52], 1],
      [[53], 1],
      [[55], 2],

      [[55], 0.5],
      [[57], 0.5],
      [[55], 0.5],
      [[53], 0.5],
      [[52], 1],
      [[48], 1],
      [[55], 0.5],
      [[57], 0.5],
      [[55], 0.5],
      [[53], 0.5],
      [[52], 1],
      [[48], 1],

      [[48], 1],
      [[43], 1],
      [[48], 2],
      [[48], 1],
      [[43], 1],
      [[48], 2],
    ],
    htmlInstructions: ['Add the last part, twice.']
  }, {
    allowedBlockTypes: [
      'music_play_note',
      'music_play_note_with_duration',
      'loops_repeat'
    ],
    beatsPerMinute: 120,
    expectedLine: null,
    htmlInstructions: ['Play anything you like. Experiment!']
  }]
};
