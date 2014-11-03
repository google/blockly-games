/**
 * Blockly Games: Puzzle Blocks
 *
 * Copyright 2013 Google Inc.
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
 * @fileoverview Blocks for Blockly's Puzzle application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Puzzle.Blocks');

goog.require('Blockly');
goog.require('BlocklyGames');


Blockly.Blocks['animal'] = {
  /**
   * Block to represent an animal.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(120);
    this.appendDummyInput()
        .appendField('', 'NAME');
    this.appendValueInput('PIC')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Puzzle_picture'));
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Puzzle_legs'))
        .appendField(new Blockly.FieldDropdown(Puzzle.legs), 'LEGS');
    this.appendStatementInput('TRAITS')
        .appendField(BlocklyGames.getMsg('Puzzle_traits'));
  },
  /**
   * Save the animal number.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('animal', this.animal);
    return container;
  },
  /**
   * Restore the animal number.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.populate(parseInt(xmlElement.getAttribute('animal'), 10));
  },
  animal: 0,
  /**
   * Set the animal.
   * @this Blockly.Block
   */
  populate: function(n) {
    this.animal = n;
    this.setFieldValue(BlocklyGames.getMsg('Puzzle_animal' + n), 'NAME');
    this.helpUrl = BlocklyGames.getMsg('Puzzle_animal' + n + 'HelpUrl');
  },
  /**
   * Evaluate the correctness of this block.
   * @this Blockly.Block
   */
  isCorrect: function() {
    return this.getFieldValue('LEGS') == this.animal;
  }
};

Blockly.Blocks['picture'] = {
  /**
   * Block to represent a picture.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(30);
    this.appendDummyInput('PIC');
    this.setOutput(true);
    this.setTooltip('');
  },
  mutationToDom: Blockly.Blocks['animal'].mutationToDom,
  domToMutation: Blockly.Blocks['animal'].domToMutation,
  animal: 0,
  /**
   * Set the animal and picture.
   * @this Blockly.Block
   */
  populate: function(n) {
    this.animal = n;
    var pic = 'puzzle/' + BlocklyGames.getMsg('Puzzle_animal' + n + 'Pic');
    var picHeight = BlocklyGames.getMsg('Puzzle_animal' + n + 'PicHeight');
    var picWidth = BlocklyGames.getMsg('Puzzle_animal' + n + 'PicWidth');
    this.getInput('PIC')
        .appendField(new Blockly.FieldImage(pic, picWidth, picHeight));
  },
  /**
   * Evaluate the correctness of this block.
   * @this Blockly.Block
   */
  isCorrect: function() {
    var parent = this.getParent();
    return parent && (parent.animal == this.animal);
  }
};

Blockly.Blocks['trait'] = {
  /**
   * Block to represent a trait.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(290);
    this.appendDummyInput().appendField('', 'NAME');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  },
  /**
   * Save the animal and trait numbers.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('animal', this.animal);
    container.setAttribute('trait', this.trait);
    return container;
  },
  /**
   * Restore the animal and trait numbers.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.populate(parseInt(xmlElement.getAttribute('animal'), 10),
                  parseInt(xmlElement.getAttribute('trait'), 10));
  },
  animal: 0,
  trait: 0,
  /**
   * Set the animal and trait.
   * @this Blockly.Block
   */
  populate: function(n, m) {
    this.animal = n;
    this.trait = m;
    // Set the trait name.
    this.setFieldValue(BlocklyGames.getMsg(
        'Puzzle_animal' + n + 'Trait' + m), 'NAME');
  },
  /**
   * Evaluate the correctness of this block.
   * @this Blockly.Block
   */
  isCorrect: function() {
    var parent = this.getSurroundParent();
    return parent && (parent.animal == this.animal);
  }
};
