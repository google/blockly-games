/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blocks for Music game.
 * @author fraser@google.com (Neil Fraser)
 */
import {getMsg} from '../../src/lib-games.js';

import {LEVEL, MAX_LEVEL} from '../../src/lib-games.js';

import {defineBlocksWithJsonArray} from '../../third-party/blockly/core/blockly.js';
import type {Block} from '../../third-party/blockly/core/block.js';
import type {Generator} from '../../third-party/blockly/core/generator.js';
import {javascriptGenerator} from '../../third-party/blockly/generators/javascript.js';
// Convince TypeScript that Blockly's JS generator is not an ES6 Generator.
const JavaScript = javascriptGenerator as any as Generator;
// TODO: fix type of JavaScript.


/**
 * Construct custom music block types.  Called on page load.
 */
export function initBlocks() {
  /**
   * Common HSV hue for all blocks in this category.
   */
  const HUE = 160;

  /**
   * Create a dropdown option for a note.
   * @param {number} denominator Inverse duration of note.
   * @returns {!Object} Dropdown option.
   */
  function noteFactory(denominator: number): object {
    return [
      {
        "src": `music/note${1 / denominator}.png`,
        "width": 9,
        "height": 19,
        "alt": "1/" + denominator,
      },
      String(1 / denominator),
    ];
  }

  /**
   * Create a dropdown option for a rest.
   * @param {number} denominator Inverse duration of rest.
   * @returns {!Object} Dropdown option.
   */
  function restFactory(denominator: number): object {
    return [
      {
        "src": `music/rest${1 / denominator}.png`,
        "width": 10,
        "height": 20,
        "alt": "1/" + denominator,
      },
      String(1 / denominator),
    ];
  }

  const notes = [];
  const rests = [];
  for (let denominator = 1; denominator <= 16; denominator *= 2) {
    notes.push(noteFactory(denominator));
    rests.push(restFactory(denominator));
  }
  // Trim off whole and sixteenth notes for levels 1-9.
  if (LEVEL < MAX_LEVEL) {
    notes.shift();
    notes.pop();
  }

  defineBlocksWithJsonArray([
    // Block for pitch.
    {
      "type": "music_pitch",
      "message0": "%1",
      "args0": [
        {
          "type": "field_pitch",
          "name": "PITCH",
          "text": "7",
        }
      ],
      "output": "Number",
      "colour": "%{BKY_MATH_HUE}",
      "tooltip": getMsg('Music.pitchTooltip', false),
    },

    // Block for playing note.
    {
      "type": "music_note",
      "message0": getMsg('Music.playNote', false),
      "args0": [
        {
          "type": "field_dropdown",
          "name": "DURATION",
          "options": notes,
        },
        {
          "type": "input_value",
          "name": "PITCH",
          "check": "Number",
        },
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": HUE,
      "tooltip": getMsg('Music.playNoteTooltip', false),
    },

    // Block for waiting a whole note.
    {
      "type": "music_rest_whole",
      "message0": getMsg('Music.rest', false),
      "args0": [
        {
          "type": "field_image",
          "src": "music/rest1.png",
          "width": 10,
          "height": 20,
          "alt": "1/1",
        },
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": HUE,
      "tooltip": getMsg('Music.restWholeTooltip', false),
    },

    // Block for waiting.
    {
      "type": "music_rest",
      "message0": getMsg('Music.rest', false),
      "args0": [
        {
          "type": "field_dropdown",
          "name": "DURATION",
          "options": [
            restFactory(1),
            restFactory(2),
            restFactory(4),
            restFactory(8),
            restFactory(16),
          ],
        },
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": HUE,
      "tooltip": getMsg('Music.restTooltip', false),
    },

    // Block for changing instrument.
    {
      "type": "music_instrument",
      "message0": getMsg('Music.setInstrument', false),
      "args0": [
        {
          "type": "field_dropdown",
          "name": "INSTRUMENT",
          "options": [
            [getMsg('Music.piano', false), "piano"],
            [getMsg('Music.trumpet', false), "trumpet"],
            [getMsg('Music.banjo', false), "banjo"],
            [getMsg('Music.violin', false), "violin"],
            [getMsg('Music.guitar', false), "guitar"],
            [getMsg('Music.flute', false), "flute"],
            [getMsg('Music.drum', false), "drum"],
            [getMsg('Music.choir', false), "choir"],
          ],
        },
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": HUE,
      "tooltip": getMsg('Music.setInstrumentTooltip', false),
    },

    // Block for starting an execution thread.
    {
      "type": "music_start",
      "message0": getMsg('Music.start', false),
      "args0": [
        {
          "type": "field_image",
          "src": "music/play.png",
          "width": 17,
          "height": 17,
          "alt": "▶",
        },
      ],
      "message1": "%1",
      "args1": [
        {
          "type": "input_statement",
          "name": "STACK",
        },
      ],
      "colour": 0,
      "tooltip": getMsg('Music.startTooltip', false),
    }
  ]);
};

JavaScript['music_pitch'] = function(block: Block) {
  return [Number(block.getFieldValue('PITCH')),
      JavaScript.ORDER_ATOMIC];
};

JavaScript['music_note'] = function(block: Block) {
  const duration = Number(block.getFieldValue('DURATION'));
  const pitch = JavaScript.valueToCode(block, 'PITCH',
      JavaScript.ORDER_COMMA) || '7';
  return `play(${duration}, ${pitch}, 'block_id_${block.id}');\n`;
};

JavaScript['music_rest_whole'] = function(block: Block) {
  return `rest(1, 'block_id_${block.id}');\n`;
};

JavaScript['music_rest'] = function(block: Block) {
  const duration = Number(block.getFieldValue('DURATION'));
  return `rest(${duration}, 'block_id_${block.id}');\n`;
};

JavaScript['music_instrument'] = function(block: Block) {
  const instrument = block.getFieldValue('INSTRUMENT');
  return `setInstrument(${JSON.stringify(instrument)});\n`;
};

JavaScript['music_start'] = function(block: Block) {
  const startCount = Music.startCount.get() + 1;
  Music.startCount.set(startCount);
  const statements_stack = JavaScript.statementToCode(block, 'STACK');
  const code = `function start${startCount}() {\n${statements_stack}}\n`;
  // Add % so as not to collide with helper functions in definitions list.
  // TODO: fix this private method.
  JavaScript.definitions_['%start' + startCount] = code;
  return null;
};

if (LEVEL < 10) {
  /**
   * Block for defining a procedure with no return value.
   * Remove comment and mutator.
   * @this {Blockly.Block}
   */
  Blockly.Blocks['procedures_defnoreturn'].init = function() {
    const nameField = new Blockly.FieldTextInput('', Blockly.Procedures.rename);
    nameField.setSpellcheck(false);
    this.appendDummyInput()
        .appendField(Blockly.Msg['PROCEDURES_DEFNORETURN_TITLE'])
        .appendField(nameField, 'NAME')
        .appendField('', 'PARAMS');
    this.setColour(Blockly.Msg['PROCEDURES_HUE']);
    this.setTooltip(Blockly.Msg['PROCEDURES_DEFNORETURN_TOOLTIP']);
    this.setHelpUrl(Blockly.Msg['PROCEDURES_DEFNORETURN_HELPURL']);
    this.arguments_ = [];
    this.argumentVarModels_ = [];
    this.setStatements_(true);
    this.statementConnection_ = null;
  };

  delete Blockly.Blocks['procedures_defreturn'];
  delete Blockly.Blocks['procedures_ifreturn'];
}
