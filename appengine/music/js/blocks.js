/**
 * Blockly Games: Music Graphics Blocks
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Blocks for Blockly's Music Graphics application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Music.Blocks');

goog.require('Blockly');
goog.require('Blockly.Blocks.lists');
goog.require('Blockly.Blocks.logic');
goog.require('Blockly.Blocks.loops');
goog.require('Blockly.Blocks.math');
goog.require('Blockly.Blocks.procedures');
goog.require('Blockly.Blocks.variables');
goog.require('Blockly.JavaScript');
goog.require('Blockly.JavaScript.lists');
goog.require('Blockly.JavaScript.logic');
goog.require('Blockly.JavaScript.loops');
goog.require('Blockly.JavaScript.math');
goog.require('Blockly.JavaScript.procedures');
goog.require('Blockly.JavaScript.variables');
goog.require('BlocklyGames');


/**
 * Common HSV hue for all blocks in this category.
 */
Music.Blocks.HUE = 160;

Blockly.Blocks['music_pitch'] = {
  /**
   * Block for pitch.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "type": "music_note",
      "message0": "%1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "PITCH",
          "options": [
            ["A+", "69"],
            //["G#", "68"],
            ["G", "67"],
            //["F#", "66"],
            ["F", "65"],
            ["E", "64"],
            //["Eb", "63"],
            ["D", "62"],
            //["C#", "61"],
            ["middle C", "60"],
            ["B", "59"],
            //["Bb", "58"],
            ["A", "57"],
            //["G#-", "56"],
            ["G-", "55"]
          ]
        }
      ],
      "output": "Number",
      "colour": 160,
      "tooltip": "",
      "helpUrl": "http://www.example.com/"
    });
  }
};

Blockly.JavaScript['music_pitch'] = function(block) {
  return [block.getFieldValue('PITCH'), Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['music_note'] = {
  /**
   * Block for playing note.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "type": "music_note",
      "message0": "play %1 note %2",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "DURATION",
          "options": [
            ["whole", "1"],
            ["half", "0.5"],
            ["quarter", "0.25"],
            ["eighth", "0.125"],
            ["sixteenth", "0.0625"]
          ]
        },
        {
          "type": "input_value",
          "name": "PITCH",
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": 315,
      "tooltip": "",
      "helpUrl": "http://www.example.com/"
    });
  }
};

Blockly.JavaScript['music_note'] = function(block) {
  var pitch = Blockly.JavaScript.valueToCode(block, 'PITCH',
      Blockly.JavaScript.ORDER_COMMA) || '60';
  return 'play(' + block.getFieldValue('DURATION') + ', ' + pitch +
          ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['music_rest'] = {
  /**
   * Block for playing note.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "type": "rest",
      "message0": "rest %1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "DURATION",
          "options": [
            ["whole", "1"],
            ["half", "0.5"],
            ["quarter", "0.25"],
            ["eighth", "0.125"],
            ["sixteenth", "0.0625"]
          ]
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": 20,
      "tooltip": "",
      "helpUrl": "http://www.example.com/"

   });
  }
}
Blockly.JavaScript['music_rest'] = function(block) {
  return 'rest(' + block.getFieldValue('DURATION') +
      ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['music_instrument'] = {
  /**
   * Block for playing note.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "type": "set_instrument",
      "message0": "set instrument to %1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "INSTRUMENT",
          "options": [
            ["piano", "piano"],
            ["trumpet", "trumpet"],
            ["banjo", "banjo"],
            ["violin", "violin"],
            ["guitar", "guitar"],
            ["flute", "flute"],
            ["drum", "drum"],
            ["choir", "choir"]
          ]
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": 65,
      "tooltip": "",
      "helpUrl": "http://www.example.com/"
    });
  }
};

Blockly.JavaScript['music_instrument'] = function(block) {
  return 'setInstrument(' + block.getFieldValue('INSTRUMENT') + ');\n';
};

Blockly.Blocks['music_start'] = {
  /**
   * Block for playing note.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "type": "music_start",
      "message0": "when %1 clicked %2 %3",
      "args0": [
        {
          "type": "field_image",
          "src": "https://www.gstatic.com/codesite/ph/images/star_on.gif",
          "width": 15,
          "height": 15,
          "alt": "*"
        },
        {
          "type": "input_dummy"
        },
        {
          "type": "input_statement",
          "name": "STACK"
        }
      ],
      "colour": 160,
      "tooltip": "",
      "helpUrl": "http://www.example.com/"
    });
  }
};

Blockly.JavaScript['music_start'] = function(block) {
  Music.startCount++;
  var statements_stack = Blockly.JavaScript.statementToCode(block, 'STACK');
  return 'function start' + Music.startCount + '() {\n' +
      statements_stack + '}\n';
};

if (BlocklyGames.LEVEL < 10) {
  delete Blockly.Blocks['procedures_defreturn'];
  delete Blockly.Blocks['procedures_ifreturn'];
};
