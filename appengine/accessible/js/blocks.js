/**
 * @license
 * Visual Blocks Editor
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
 * @fileoverview Blocks for the Blockly Games music demo.
 * @author sll@google.com (Sean Lip)
 */
'use strict';

goog.provide('Music.Blocks');

goog.require('Blockly');
goog.require('Blockly.JavaScript');


/**
 * Common HSV hue for all blocks in this category.
 */
Music.Blocks.HUE = 20;

Music.Blocks.NOTE_OPTIONS = [
  ["C4", "48"],
  ["D4", "50"],
  ["E4", "52"],
  ["F4", "53"],
  ["G4", "55"],
  ["A4", "57"],
  ["B4", "59"]
];

var MUSIC_DUMMY_TOOLTIP = 'Dummy tooltip';
var MUSIC_DUMMY_HELPURL = 'Dummy help URL';

// Extensions to Blockly's language and JavaScript generator.

Blockly.Blocks['music_play_random_note'] = {
  /**
   * Block for playing a random music note.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "play random note",
      "previousStatement": null,
      "nextStatement": null,
      "colour": Music.Blocks.HUE,
      "tooltip": MUSIC_DUMMY_TOOLTIP,
      "helpUrl": MUSIC_DUMMY_HELPURL
    });
  }
};

Blockly.JavaScript['music_play_random_note'] = function(block) {
  var LOWEST_PITCH = 36;
  var HIGHEST_PITCH = 60;

  var randomPitch =
      Math.floor(Math.random() * (HIGHEST_PITCH - LOWEST_PITCH) +
      LOWEST_PITCH);
  return 'addChord([' + randomPitch + '], 1);\n';
};

Blockly.Blocks['music_play_note'] = {
  /**
   * Block for playing a music note.
   * @this Blockly.Block
   */
  init: function() {
    this.appendDummyInput().appendField("play note").appendField(
        new Blockly.FieldDropdown(Music.Blocks.NOTE_OPTIONS), "PITCH");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(Music.Blocks.HUE);
    this.setTooltip(MUSIC_DUMMY_TOOLTIP);
    this.setHelpUrl(MUSIC_DUMMY_HELPURL);
  },
  onchange: function(changeEvent) {
    if (changeEvent.blockId == this.id && changeEvent.element == 'field' &&
        changeEvent.name == 'PITCH' && changeEvent.newValue) {
      musicPlayer.playNote_(
          [Number(changeEvent.newValue)], 0.5, (new Date).getTime());
    }
  }
};

Blockly.JavaScript['music_play_note'] = function(block) {
  // Play a single note.
  return 'addChord([' + block.getFieldValue('PITCH') + '], 1);\n';
};

Blockly.Blocks['music_play_note_blank'] = {
  /**
   * Block for playing a music note without any options pre-selected.
   * @this Blockly.Block
   */
  init: function() {
    var noteOptionsWithDummy = [[
      "Choose a note...", ""
    ]].concat(Music.Blocks.NOTE_OPTIONS);

    this.appendDummyInput().appendField("play note").appendField(
        new Blockly.FieldDropdown(noteOptionsWithDummy), "PITCH");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(Music.Blocks.HUE);
    this.setTooltip(MUSIC_DUMMY_TOOLTIP);
    this.setHelpUrl(MUSIC_DUMMY_HELPURL);
  },
  onchange: function(changeEvent) {
    if (changeEvent.blockId == this.id && changeEvent.element == 'field' &&
        changeEvent.name == 'PITCH') {
      musicPlayer.playNote_(
          [Number(changeEvent.newValue)], 0.5, (new Date).getTime());
    }
  }
};

Blockly.JavaScript['music_play_note_blank'] = function(block) {
  // Play a single note.
  if (block.getFieldValue('PITCH')) {
    return 'addChord([' + block.getFieldValue('PITCH') + '], 1);\n';
  } else {
    return '';
  }
};

Blockly.Blocks['music_play_phrase'] = {
  /**
   * Block for playing a music phrase. This requires a mutation to set the
   * phrase options.
   * @this Blockly.Block
   */
  init: function() {
    // Stores the options for the phrases. The default phrases represent "Happy
    // Birthday to You".
    this.options_ = [
        ["1", "55:0.75-55:0.25-57:1-55:1-60:1-59:2"],
        ["2", "55:0.75-55:0.25-57:1-55:1-62:1-60:2"],
        ["3", "55:0.75-55:0.25-67:1-64:1-60:1-59:1-57:2"],
        ["4", "65:0.75-65:0.25-64:1-60:1-62:1-60:2"]
    ];

    this.appendDummyInput('PHRASE').appendField("play phrase").appendField(
        new Blockly.FieldDropdown(this.options_), 'MIDI_VALUES');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(Music.Blocks.HUE);
    this.setTooltip(MUSIC_DUMMY_TOOLTIP);
    this.setHelpUrl(MUSIC_DUMMY_HELPURL);
  },
  onchange: function(changeEvent) {
    if (changeEvent.blockId == this.id && changeEvent.element == 'field' &&
        changeEvent.name == 'MIDI_VALUES') {
      var beatsPerMinute = 150;
      var secsPerBeat = 60.0 / beatsPerMinute;
      musicPlayer.reset();

      var delaySecs = 0;
      var phraseParts = changeEvent.newValue.split('-');
      phraseParts.forEach(function(phrasePart) {
        var noteAndDuration = phrasePart.split(':');
        setTimeout(function() {
          musicPlayer.playNote_(
            [Number(noteAndDuration[0])],
            Number(noteAndDuration[1]) * secsPerBeat,
            (new Date).getTime());
        }, delaySecs * 1000.0);
        delaySecs += Number(noteAndDuration[1]) * secsPerBeat;
      });
    }
  },
  /**
   * Parse XML to restore the values of the phrases.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    var optionsJson = xmlElement.getAttribute('options_json');

    this.options_ = JSON.parse(optionsJson);
    this.removeInput('PHRASE');
    this.appendDummyInput('PHRASE').appendField("play phrase").appendField(
        new Blockly.FieldDropdown(this.options_), 'MIDI_VALUES');
  },
  /**
   * Create XML to represent whether the block is a statement or a value.
   * Also represent whether there is an 'AT' input.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('options_json', JSON.stringify(this.options_));
    return container;
  }
};

Blockly.JavaScript['music_play_phrase'] = function(block) {
  var phraseParts = block.getFieldValue('MIDI_VALUES').split('-');
  var code = '';
  phraseParts.forEach(function(phrasePart) {
    var noteAndDuration = phrasePart.split(':');
    code += 'addChord([' + noteAndDuration[0] + '], ' +
        noteAndDuration[1] + ');\n';
  });
  return code;
};

Blockly.Blocks['music_play_note_with_duration'] = {
  /**
   * Block for playing a note with a specified duration.
   * @this Blockly.Block
   */
  init: function() {
    this.appendDummyInput().appendField("play note").appendField(
        new Blockly.FieldDropdown(Music.Blocks.NOTE_OPTIONS), "PITCH");
    this.appendDummyInput().appendField("for duration").appendField(
        new Blockly.FieldDropdown([
            ["1 beat", "1"],
            ["2 beats", "2"],
            ["3 beats", "3"],
            ["4 beats", "4"],
            ["1/2 beat", "0.5"]
        ]),
        "DURATION");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(Music.Blocks.HUE);
    this.setTooltip(MUSIC_DUMMY_TOOLTIP);
    this.setHelpUrl(MUSIC_DUMMY_HELPURL);
  },
  onchange: function(changeEvent) {
    if (changeEvent.blockId == this.id && changeEvent.element == 'field' &&
        changeEvent.name == 'PITCH') {
      musicPlayer.playNote_(
          [Number(changeEvent.newValue)], 0.5, (new Date).getTime());
    }
  }
};

Blockly.JavaScript['music_play_note_with_duration'] = function(block) {
  // Play a single note, with the given duration.
  var code =
      'addChord([' + block.getFieldValue('PITCH') + '], ' +
      block.getFieldValue('DURATION') + ');\n';
  return code;
};

// We declare a different block here because the one in core Blockly does not
// split up different fields well.
Blockly.Blocks['loops_repeat']= {
  /**
   * Block for repeat n times (internal number).
   */
  init: function() {
    this.appendDummyInput().appendField(
        new Blockly.FieldNumber('10'), 'TIMES'
    ).appendField('times');
    this.appendStatementInput('DO')
        .appendField('repeat');

    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(Blockly.Blocks.loops.HUE);
    this.setTooltip(Blockly.Msg.CONTROLS_REPEAT_TOOLTIP);
    this.setHelpUrl(Blockly.Msg.CONTROLS_REPEAT_HELPURL);
  }
};

Blockly.JavaScript['loops_repeat'] = Blockly.JavaScript['controls_repeat'];
