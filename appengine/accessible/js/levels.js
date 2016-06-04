/**
 * Blockly Demos: Accessible Blockly
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
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

 var LEVELS = {
  TUTORIAL: [{
    htmlInstructions: 'Play a single note, C3.',
    expectedLine: [
      [[36], 1]
    ],
    blocks: ['music_play_note'],
    beatsPerMinute: 80,
    accompaniment: null
  }, {
    htmlInstructions: 'Modify the note to become E3 instead.',
    expectedLine: [
      [[40], 1]
    ],
    blocks: ['music_play_note'],
    beatsPerMinute: 80,
    accompaniment: null
  }, {
    htmlInstructions: 'Play the sequence G3-A3-F3 in order.',
    expectedLine: [
      [[43], 1],
      [[45], 1],
      [[41], 1]
    ],
    blocks: ['music_play_note'],
    beatsPerMinute: 80,
    accompaniment: null
  }, {
    htmlInstructions: 'Play the note D3 for two beats.',
    expectedLine: [
      [[38], 2]
    ],
    blocks: ['music_play_note_with_duration'],
    beatsPerMinute: 80,
    accompaniment: null
  }, {
    htmlInstructions: 'Play the sequence C4-G3-E3-C3. Hold the last note for two beats.',
    expectedLine: [
      [[48], 1],
      [[43], 1],
      [[40], 1],
      [[36], 2]
    ],
    blocks: ['music_play_note', 'music_play_note_with_duration'],
    beatsPerMinute: 80,
    accompaniment: null
  }],

  BEGINNER: [{
    htmlInstructions: 'Play Mary Had a Little Lamb: E4-D4-C4-D4-E4-E4-E4.',
    expectedLine: [
      [[52], 1],
      [[50], 1],
      [[48], 1],
      [[50], 1],
      [[52], 1],
      [[52], 1],
      [[52], 1]
    ],
    blocks: ['music_play_note'],
    beatsPerMinute: 120,
    accompaniment: null
  }, {
    htmlInstructions: 'Same thing, but now try to use only 6 blocks.',
    expectedLine: [
      [[52], 1],
      [[50], 1],
      [[48], 1],
      [[50], 1],
      [[52], 1],
      [[52], 1],
      [[52], 1]
    ],
    blocks: ['music_play_note', 'controls_repeat'],
    beatsPerMinute: 120,
    accompaniment: null
  }, {
    htmlInstructions: 'Add on the rest of the tune!',
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
    blocks: [
      'music_play_note',
      'music_play_note_with_duration',
      'controls_repeat'
    ],
    beatsPerMinute: 120,
    accompaniment: null
  }, {
    htmlInstructions: 'Play the first part of Frere Jacques. Use only 5 blocks.',
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
    blocks: [
      'music_play_note',
      'music_play_note_with_duration',
      'controls_repeat'
    ],
    beatsPerMinute: 150,
    accompaniment: null
  }, {
    htmlInstructions: 'Add four more blocks for the next part.',
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
    blocks: [
      'music_play_note',
      'music_play_note_with_duration',
      'controls_repeat'
    ],
    beatsPerMinute: 150,
    accompaniment: null
  }, {
    htmlInstructions: 'Add the third part.',
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
    blocks: [
      'music_play_note',
      'music_play_note_with_duration',
      'controls_repeat'
    ],
    beatsPerMinute: 150,
    accompaniment: null
  }, {
    htmlInstructions: 'Add the last part.',
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
    blocks: [
      'music_play_note',
      'music_play_note_with_duration',
      'controls_repeat'
    ],
    beatsPerMinute: 150,
    accompaniment: null
  }, {
    htmlInstructions: 'Now play the whole thing twice, but include a pick-up at the end of the first one. Can you use the if block to make it easier?',
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
    blocks: [
      'music_play_note',
      'music_play_note_with_duration',
      'controls_repeat'
    ],
    beatsPerMinute: 150,
    accompaniment: null
  }, {
    htmlInstructions: 'Challenge -- can you play Happy Birthday? G3..G3 A3 G3 C4 B3 - G3..G3 A3 G3 D4 C4 -',
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
    blocks: [
      'music_play_note',
      'music_play_note_with_duration',
      'controls_repeat'
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
    htmlInstructions: 'Play anything you like. Experiment!',
    expectedLine: null,
    blocks: [
      'music_play_note',
      'music_play_note_with_duration',
      'controls_repeat'
    ],
    beatsPerMinute: 120,
    accompaniment: null
  }]
};

var LEVEL_SETS = [{
  name: 'Tutorial',
  levels: LEVELS.TUTORIAL
}, {
  name: 'Beginner',
  levels: LEVELS.BEGINNER
}];
