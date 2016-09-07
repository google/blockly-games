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
    accompaniment: null,
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
    accompaniment: null,
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
    accompaniment: null,
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
    accompaniment: null,
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
    accompaniment: null,
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
    htmlInstructions: ['Play Mary Had a Little Lamb: E4-D4-C4-D4-E4-E4-E4.'],
    expectedLine: [
      [[52], 1],
      [[50], 1],
      [[48], 1],
      [[50], 1],
      [[52], 1],
      [[52], 1],
      [[52], 1]
    ],
    allowedBlockTypes: ['music_play_note'],
    beatsPerMinute: 120,
    accompaniment: null
  }, {
    htmlInstructions: ['Same thing, but now try to use only 6 blocks.'],
    expectedLine: [
      [[52], 1],
      [[50], 1],
      [[48], 1],
      [[50], 1],
      [[52], 1],
      [[52], 1],
      [[52], 1]
    ],
    allowedBlockTypes: ['music_play_note', 'loops_repeat'],
    beatsPerMinute: 120,
    accompaniment: null
  }, {
    htmlInstructions: ['Add on the rest of the tune!'],
    expectedLine: [
      [[52], 1],
      [[50], 1],
      [[48], 1],
      [[50], 1],
      [[52], 1],
      [[52], 1],
      [[52], 2],
      [[50], 1],
      [[50], 1],
      [[50], 2],
      [[52], 1],
      [[55], 1],
      [[55], 2]
    ],
    allowedBlockTypes: [
      'music_play_note',
      'music_play_note_with_duration',
      'loops_repeat'
    ],
    beatsPerMinute: 120,
    accompaniment: null
  }, {
    htmlInstructions: ['Play the first part of Frere Jacques. Use only 5 blocks.'],
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
    allowedBlockTypes: [
      'music_play_note',
      'music_play_note_with_duration',
      'loops_repeat'
    ],
    beatsPerMinute: 150,
    accompaniment: null
  }, {
    htmlInstructions: ['Add four more blocks for the next part.'],
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
    ],
    allowedBlockTypes: [
      'music_play_note',
      'music_play_note_with_duration',
      'loops_repeat'
    ],
    beatsPerMinute: 150,
    accompaniment: null
  }, {
    htmlInstructions: ['Add the third part.'],
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
    allowedBlockTypes: [
      'music_play_note',
      'music_play_note_with_duration',
      'loops_repeat'
    ],
    beatsPerMinute: 150,
    accompaniment: null
  }, {
    htmlInstructions: ['Add the last part.'],
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
    allowedBlockTypes: [
      'music_play_note',
      'music_play_note_with_duration',
      'loops_repeat'
    ],
    beatsPerMinute: 150,
    accompaniment: null
  }, {
    htmlInstructions: ['Now play the whole thing twice, but include a pick-up at the end of the first one. Can you use the if block to make it easier?'],
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
      [[45], 1],
      [[47], 1],

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
      [[48], 2]
    ],
    allowedBlockTypes: [
      'music_play_note',
      'music_play_note_with_duration',
      'loops_repeat'
    ],
    beatsPerMinute: 150,
    accompaniment: null
  }, {
    htmlInstructions: ['Challenge -- can you play Happy Birthday? G3..G3 A3 G3 C4 B3 - G3..G3 A3 G3 D4 C4 -'],
    expectedLine: [
      [[43], 0.75],
      [[43], 0.25],
      [[45], 1],
      [[43], 1],
      [[48], 1],
      [[47], 2],
      [[43], 0.75],
      [[43], 0.25],
      [[45], 1],
      [[43], 1],
      [[50], 1],
      [[48], 2]
    ],
    allowedBlockTypes: [
      'music_play_note',
      'music_play_note_with_duration',
      'loops_repeat'
    ],
    beatsPerMinute: 100,
    accompaniment: [
      [[], 1],
      [[36], 1],
      [[40, 43], 1],
      [[40, 43], 1],
      [[35], 1],
      [[38, 43], 1],
      [[38, 43], 1],
      [[35], 1],
      [[38, 43], 1],
      [[38, 43], 1],
      [[36], 1],
      [[40, 43], 1]
    ]
  }, {
    htmlInstructions: ['Play anything you like. Experiment!'],
    expectedLine: null,
    allowedBlockTypes: [
      'music_play_note',
      'music_play_note_with_duration',
      'loops_repeat'
    ],
    beatsPerMinute: 120,
    accompaniment: null
  }]
};
