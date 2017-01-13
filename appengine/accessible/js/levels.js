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
    toolboxBlockDefns: [{
      type: 'music_play_note'
    }],
    introMessage: (
        'Welcome to Blockly! Here\'s what you need to know. Blockly teaches ' +
        'you how to program using blocks of code you link together. ' +
        'The main section is the workspace, where you can build programs. ' +
        'Next to the workspace, there is a sidebar with useful buttons.'),
    beatsPerMinute: 80,
    expectedLine: [
      [[48], 1]
    ],
    getTargetedFeedback: function() {},
    hint: (
        'Start by tabbing to the sidebar and selecting the button called ' +
        '"Create new block group" to open the list of blocks. Select the ' +
        'block you need in order to create a new "play note C4" block in the ' +
        'workspace. When you\'re ready to try out your program, choose the ' +
        'button in the sidebar called, "Run your program."'),
    instructions: 'Play the note C4.'
  }, {
    toolboxBlockDefns: [{
      type: 'music_play_note_blank'
    }],
    beatsPerMinute: 80,
    expectedLine: [
      [[55], 1]
    ],
    getTargetedFeedback: function(chords) {
      if (chords.length == 1 && chords[0].midiPitches[0] == 48) {
        return 'Not quite. Did you change C4 to the correct note?';
      }
    },
    instructions: 'Play the note G4.',
    hint: (
        'Start by putting a "play note C4" block in the workspace. Then ' +
        'change its value to G4.')
  }, {
    toolboxBlockDefns: [{
      type: 'music_play_note'
    }],
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
            'Not quite. Are you using the right number of blocks?');
      }
    },
    hint: (
        'Make sure the blocks are connected. You can connect blocks by ' +
        'pressing Enter on a block, then selecting "Add link after". Once ' +
        'you have set up the link, select the "Attach new block to link..." ' +
        'button in the sidebar and choose a block to attach.'),
    instructions: 'Play C4, then E4, then G4.'
  }, {
    toolboxBlockDefns: [{
      type: 'music_play_note_with_duration'
    }],
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
        'You can change how long a note plays by choosing a value for the ' +
        'part of the block called "for duration".'),
    instructions: 'Play G4 for two beats.'
  }, {
    toolboxBlockDefns: [{
      type: 'loops_repeat'
    }, {
      type: 'music_play_note'
    }],
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
    introMessage: 'New block unlocked: Repeat block!',
    hint: (
      'To use only two blocks, link a play note block inside a repeat ' +
      'block. In the repeat block, find the "repeat BLANK times" part, ' +
      'press Enter, and type the number of times you want it to repeat. ' +
      'Then, press the Escape key.'),
    instructions: 'Play C4 eight times. Try using only two blocks.'
  }]
};

LEVEL_SETS.game1 = {
  name: 'Music Game',
  levels: [{
    toolboxBlockDefns: [{
      type: 'music_play_phrase',
      optionsJson: (
          '[["A","55:0.75-55:0.25-57:1-55:1-60:1-59:2"],' +
          '["B","55:0.75-55:0.25-57:1-55:1-62:1-60:2"],' +
          '["C","55:0.75-55:0.25-67:1-64:1-60:1-59:1-57:2"],' +
          '["D","65:0.75-65:0.25-64:1-60:1-62:1-60:2"]]')
    }],
    beatsPerMinute: 160,
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
      [[65], 0.25],
      [[64], 1],
      [[60], 1],
      [[62], 1],
      [[60], 2]
    ],
    instructions:
        'Play the tune to "Happy Birthday". The phrases go like this: A, B, C, D.'
  }, {
    toolboxBlockDefns: [{
      type: 'music_play_phrase',
      optionsJson: (
          '[["A","52:1-50:1"],' +
          '["B", "48:1-50:1"],' +
          '["C", "52:1"]]')
    }],
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
    instructions:
        'Play the tune to "Mary Had a Little Lamb". The phrases go like ' +
        'this: A, B, C, C, C.'
  }, {
    toolboxBlockDefns: [{
      type: 'music_play_note'
    }],
    beatsPerMinute: 120,
    expectedLine: [
      [[48], 1],
      [[50], 1],
      [[52], 1],
      [[48], 1],
    ],
    instructions: (
        'Play the first part of "Frere Jacques" using the notes C4, D4, E4 ' +
        'and C4.'),
  }, {
    toolboxBlockDefns: [{
      type: 'music_play_note'
    }],
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
    instructions: (
        'Now, repeat the first part of "Frere Jacques". The part you just ' +
        'made is already in the workspace. Remember, the notes are C4, D4, ' +
        'E4, and C4.'),
    continueFromPreviousLevel: true
  }, {
    toolboxBlockDefns: [{
      type: 'music_play_note'
    }, {
      type: 'loops_repeat'
    }],
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
    getTargetedFeedback: function(chords) {
      var numBlocks = blocklyApp.workspace.getAllBlocks().length;
      if (numBlocks > 5) {
        return (
            'You\'re currently using ' + numBlocks + ' blocks. Can you ' +
            'do it with just 5 blocks?');
      }
    },
    hint: 'Use a repeat block. The notes are C4, D4, E4, and C4.',
    instructions: (
        'Repeat the first part of "Frere Jacques" again, but this time, ' +
        'only use 5 blocks.'),
  }, {
    toolboxBlockDefns: [{
      type: 'music_play_note'
    }, {
      type: 'music_play_note_with_duration'
    }, {
      type: 'loops_repeat'
    }],
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
    hint: (
        'Altogether, the song now goes like this: C4, D4, E4, C4. Repeat. ' +
        'Then, E4, F4, and G4 for two beats.'),
    instructions: (
        'Now, add notes E4, F4, and G4. The last note, G4, should play for ' +
        'two beats.'),
    continueFromPreviousLevel: true
  }, {
    toolboxBlockDefns: [{
      type: 'music_play_note'
    }, {
      type: 'music_play_note_with_duration'
    }, {
      type: 'loops_repeat'
    }],
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
    hint: (
        'Altogether, the song now goes like this: C4, D4, E4, C4. Repeat. ' +
        'Then, E4, F4, and G4 for two beats. Repeat.'),
    instructions: (
        'Now, add E4, F4, and G4 again. The last note, G4, should play for ' +
        'two beats.'),
    continueFromPreviousLevel: true
  }, {
    toolboxBlockDefns: [{
      type: 'music_play_note'
    }, {
      type: 'music_play_note_with_duration'
    }, {
      type: 'loops_repeat'
    }],
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
    hint: (
        'Altogether, the song now goes like this: C4, D4, E4, C4. Repeat. ' +
        'Then, E4, F4, and G4 for two beats. Repeat. Then G4, A4, G4, F4, ' +
        'E4, C4. Repeat.'),
    instructions: (
        'Now, add the third part. It goes G4, A4, G4, F4, E4, and C4. ' +
        'Listen to the desired tune to hear what it should sound like. ' +
        'Some notes need to be played for only half a beat.'),
    continueFromPreviousLevel: true
  }, {
    toolboxBlockDefns: [{
      type: 'music_play_note'
    }, {
      type: 'music_play_note_with_duration'
    }, {
      type: 'loops_repeat'
    }],
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
      [[48], 1],
      [[48], 2],
      [[48], 1],
      [[48], 1],
      [[48], 2],
    ],
    hint: (
        'Altogether, the song now goes like this: C4, D4, E4, C4. Repeat. ' +
        'Then, E4, F4, and G4 for two beats. Repeat. Then G4, A4, G4, F4, ' +
        'E4, C4. Repeat. Then C4, C4, and C4 for two beats. Repeat.'),
    instructions: (
        'Finally, add the very last part, which is C4, C4, C4, played ' +
        'twice. For each phrase, the last note, C4, should be played for ' +
        'two beats.'),
    continueFromPreviousLevel: true
  }, {
    toolboxBlockDefns: [{
      type: 'music_play_note'
    }, {
      type: 'music_play_note_with_duration'
    }, {
      type: 'loops_repeat'
    }],
    beatsPerMinute: 120,
    expectedLine: null,
    instructions: 'Play anything you like. Experiment!'
  }]
};
