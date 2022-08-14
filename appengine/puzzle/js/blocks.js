/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blocks for Puzzle game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Puzzle.Blocks');

goog.require('Blockly');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldImage');
goog.require('BlocklyGames');
goog.require('BlocklyGames.Msg');


/**
 * Common HSV hue for all animal blocks.
 */
Puzzle.Blocks.ANIMAL_HUE = 120;

/**
 * Common HSV hue for all picture blocks.
 */
Puzzle.Blocks.PICTURE_HUE = 30;

/**
 * Common HSV hue for all trait blocks.
 */
Puzzle.Blocks.TRAIT_HUE = 290;

Blockly.Blocks['animal'] = {
  /**
   * Block to represent an animal.
   * @this {Blockly.Block}
   */
  init: function() {
    this.setColour(Puzzle.Blocks.ANIMAL_HUE);
    this.appendDummyInput()
        .appendField('', 'NAME');
    this.appendValueInput('PIC')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.Msg['Puzzle.picture']);
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.Msg['Puzzle.legs'])
        .appendField(new Blockly.FieldDropdown(Puzzle.legs), 'LEGS');
    this.appendStatementInput('TRAITS')
        .appendField(BlocklyGames.Msg['Puzzle.traits']);
    this.setInputsInline(false);
  },
  /**
   * Save the animal number.
   * @return {!Element} XML storage element.
   * @this {Blockly.Block}
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('animal', this.animal);
    return container;
  },
  /**
   * Restore the animal number.
   * @param {!Element} xmlElement XML storage element.
   * @this {Blockly.Block}
   */
  domToMutation: function(xmlElement) {
    this.populate(parseInt(xmlElement.getAttribute('animal'), 10));
  },
  animal: 0,
  /**
   * Set the animal.
   * @param {number} n Animal number.
   * @this {Blockly.Block}
   */
  populate: function(n) {
    this.animal = n;
    this.setFieldValue(Puzzle.data[n - 1].name, 'NAME');
    this.helpUrl = Puzzle.data[n - 1].helpUrl;
  },
  /**
   * Evaluate the correctness of this block.
   * @this {Blockly.Block}
   */
  isCorrect: function() {
    return this.getFieldValue('LEGS') === this.animal;
  }
};

Blockly.Blocks['picture'] = {
  /**
   * Block to represent a picture.
   * @this {Blockly.Block}
   */
  init: function() {
    this.setColour(Puzzle.Blocks.PICTURE_HUE);
    this.appendDummyInput('PIC');
    this.setOutput(true);
    this.setTooltip('');
  },
  mutationToDom: Blockly.Blocks['animal'].mutationToDom,
  domToMutation: Blockly.Blocks['animal'].domToMutation,
  animal: 0,
  /**
   * Set the animal and picture.
   * @param {number} n Animal number.
   * @this {Blockly.Block}
   */
  populate: function(n) {
    this.animal = n;
    var pic = 'puzzle/' + Puzzle.data[n - 1].pic;
    var picHeight = Puzzle.data[n - 1].picHeight;
    var picWidth = Puzzle.data[n - 1].picWidth;
    this.getInput('PIC')
        .appendField(new Blockly.FieldImage(pic, picWidth, picHeight));
  },
  /**
   * Evaluate the correctness of this block.
   * @this {Blockly.Block}
   */
  isCorrect: function() {
    var parent = this.getParent();
    return parent && (parent.animal === this.animal);
  }
};

Blockly.Blocks['trait'] = {
  /**
   * Block to represent a trait.
   * @this {Blockly.Block}
   */
  init: function() {
    this.setColour(Puzzle.Blocks.TRAIT_HUE);
    this.appendDummyInput().appendField('', 'NAME');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  },
  /**
   * Save the animal and trait numbers.
   * @return {!Element} XML storage element.
   * @this {Blockly.Block}
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('animal', this.animal);
    container.setAttribute('trait', this.trait);
    return container;
  },
  /**
   * Restore the animal and trait numbers.
   * @param {!Element} xmlElement XML storage element.
   * @this {Blockly.Block}
   */
  domToMutation: function(xmlElement) {
    this.populate(parseInt(xmlElement.getAttribute('animal'), 10),
                  parseInt(xmlElement.getAttribute('trait'), 10));
  },
  animal: 0,
  trait: 0,
  /**
   * Set the animal and trait.
   * @param {number} n Animal number.
   * @param {string} m Trait number.
   * @this {Blockly.Block}
   */
  populate: function(n, m) {
    this.animal = n;
    this.trait = m;
    // Set the trait name.
    this.setFieldValue(Puzzle.data[n - 1].traits[m - 1], 'NAME');
  },
  /**
   * Evaluate the correctness of this block.
   * @this {Blockly.Block}
   */
  isCorrect: function() {
    var parent = this.getSurroundParent();
    return parent && (parent.animal === this.animal);
  }
};
