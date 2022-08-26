/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blocks for Music game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Music.Blocks');

goog.require('Blockly');
goog.require('Blockly.Constants.Lists');
goog.require('Blockly.Constants.Logic');
goog.require('Blockly.Constants.Loops');
goog.require('Blockly.Constants.Math');
goog.require('Blockly.Blocks.procedures');
goog.require('Blockly.Constants.Variables');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldImage');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.JavaScript');
goog.require('Blockly.JavaScript.lists');
goog.require('Blockly.JavaScript.logic');
goog.require('Blockly.JavaScript.loops');
goog.require('Blockly.JavaScript.math');
goog.require('Blockly.JavaScript.procedures');
goog.require('Blockly.JavaScript.variables');
goog.require('BlocklyGames');
goog.require('BlocklyGames.Msg');
goog.require('CustomFields.FieldPitch');


/**
 * Common HSV hue for all blocks in this category.
 */
Music.Blocks.HUE = 160;

Blockly.Blocks['music_pitch'] = {
  /**
   * Block for pitch.
   * @this {Blockly.Block}
   */
  init: function() {
    this.appendDummyInput()
        .appendField(new CustomFields.FieldPitch('7'), 'PITCH');
    this.setOutput(true, 'Number');
    this.setColour(Blockly.Msg['MATH_HUE']);
    this.setTooltip(BlocklyGames.Msg['Music.pitchTooltip']);
  }
};

Blockly.JavaScript['music_pitch'] = function(block) {
  return [Number(block.getFieldValue('PITCH')),
      Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['music_note'] = {
  /**
   * Block for playing note.
   * @this {Blockly.Block}
   */
  init: function() {
    const options = [
      [{"src": "music/note1.png",
        "width": 9, "height": 19, "alt": "whole"}, "1"],
      [{"src": "music/note0.5.png",
        "width": 9, "height": 19, "alt": "half"}, "0.5"],
      [{"src": "music/note0.25.png",
        "width": 9, "height": 19, "alt": "quarter"}, "0.25"],
      [{"src": "music/note0.125.png",
        "width": 9, "height": 19, "alt": "eighth"}, "0.125"],
      [{"src": "music/note0.0625.png",
        "width": 9, "height": 19, "alt": "sixteenth"}, "0.0625"],
    ];
    // Trim off whole and sixteenth notes for levels 1-9.
    if (BlocklyGames.LEVEL < BlocklyGames.MAX_LEVEL) {
      options.shift();
      options.pop();
    }
    this.jsonInit({
      "message0": BlocklyGames.Msg['Music.playNote'],
      "args0": [
        {
          "type": "field_dropdown",
          "name": "DURATION",
          "options": options,
        },
        {
          "type": "input_value",
          "name": "PITCH",
          "check": "Number",
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Music.Blocks.HUE,
      "tooltip": BlocklyGames.Msg['Music.playNoteTooltip'],
    });
  }
};

Blockly.JavaScript['music_note'] = function(block) {
  const duration = Number(block.getFieldValue('DURATION'));
  const pitch = Blockly.JavaScript.valueToCode(block, 'PITCH',
      Blockly.JavaScript.ORDER_COMMA) || '7';
  return `play(${duration}, ${pitch}, 'block_id_${block.id}');\n`;
};

Blockly.Blocks['music_rest_whole'] = {
  /**
   * Block for waiting a whole note.
   * @this {Blockly.Block}
   */
  init: function() {
    this.jsonInit({
      "message0": BlocklyGames.Msg['Music.rest'],
      "args0": [
        {
          "type": "field_image",
          "src": "music/rest1.png",
          "width": 10,
          "height": 20,
          "alt": "-",
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Music.Blocks.HUE,
      "tooltip": BlocklyGames.Msg['Music.restWholeTooltip'],
   });
  }
};

Blockly.JavaScript['music_rest_whole'] = function(block) {
  return `rest(1, 'block_id_${block.id}');\n`;
};

Blockly.Blocks['music_rest'] = {
  /**
   * Block for waiting.
   * @this {Blockly.Block}
   */
  init: function() {
    this.jsonInit({
      "message0": BlocklyGames.Msg['Music.rest'],
      "args0": [
        {
          "type": "field_dropdown",
          "name": "DURATION",
          "options": [
            [{"src": "music/rest1.png",
              "width": 10, "height": 20, "alt": "whole"}, "1"],
            [{"src": "music/rest0.5.png",
              "width": 10, "height": 20, "alt": "half"}, "0.5"],
            [{"src": "music/rest0.25.png",
              "width": 10, "height": 20, "alt": "quarter"}, "0.25"],
            [{"src": "music/rest0.125.png",
              "width": 10, "height": 20, "alt": "eighth"}, "0.125"],
            [{"src": "music/rest0.0625.png",
              "width": 10, "height": 20, "alt": "sixteenth"}, "0.0625"],
          ]
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Music.Blocks.HUE,
      "tooltip": BlocklyGames.Msg['Music.restTooltip'],
   });
  }
};

Blockly.JavaScript['music_rest'] = function(block) {
  const duration = Number(block.getFieldValue('DURATION'));
  return `rest(${duration}, 'block_id_${block.id}');\n`;
};

Blockly.Blocks['music_instrument'] = {
  /**
   * Block for changing instrument.
   * @this {Blockly.Block}
   */
  init: function() {
    this.jsonInit({
      "message0": BlocklyGames.Msg['Music.setInstrument'],
      "args0": [
        {
          "type": "field_dropdown",
          "name": "INSTRUMENT",
          "options": [
            [BlocklyGames.Msg['Music.piano'], "piano"],
            [BlocklyGames.Msg['Music.trumpet'], "trumpet"],
            [BlocklyGames.Msg['Music.banjo'], "banjo"],
            [BlocklyGames.Msg['Music.violin'], "violin"],
            [BlocklyGames.Msg['Music.guitar'], "guitar"],
            [BlocklyGames.Msg['Music.flute'], "flute"],
            [BlocklyGames.Msg['Music.drum'], "drum"],
            [BlocklyGames.Msg['Music.choir'], "choir"],
          ]
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Music.Blocks.HUE,
      "tooltip": BlocklyGames.Msg['Music.setInstrumentTooltip'],
    });
  }
};

Blockly.JavaScript['music_instrument'] = function(block) {
  const instrument = block.getFieldValue('INSTRUMENT');
  return `setInstrument(${Blockly.JavaScript.quote_(instrument)});\n`;
};

Blockly.Blocks['music_start'] = {
  /**
   * Block for starting an execution thread.
   * @this {Blockly.Block}
   */
  init: function() {
    this.jsonInit({
      "message0": BlocklyGames.Msg['Music.start'],
      "args0": [
        {
          "type": "field_image",
          "src": "music/play.png",
          "width": 17,
          "height": 17,
          "alt": "▶",
        }
      ],
      "message1": "%1",
      "args1": [
        {
          "type": "input_statement",
          "name": "STACK",
        }
      ],
      "colour": 0,
      "tooltip": BlocklyGames.Msg['Music.startTooltip'],
    });
  }
};

Blockly.JavaScript['music_start'] = function(block) {
  Music.startCount++;
  const statements_stack = Blockly.JavaScript.statementToCode(block, 'STACK');
  const code = `function start${Music.startCount}() {\n${statements_stack}}\n`;
  // Add % so as not to collide with helper functions in definitions list.
  Blockly.JavaScript.definitions_['%start' + Music.startCount] = code;
  return null;
};

if (BlocklyGames.LEVEL < 10) {
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
