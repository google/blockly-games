/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blocks for Puzzle game.
 * @author fraser@google.com (Neil Fraser)
 */
import {getData} from './data.js';

import {getMsg} from '../../src/lib-games.js';

import {ALIGN_RIGHT} from '../../third-party/blockly/core/blockly.js';
import {Blocks} from '../../third-party/blockly/core/blocks.js';
import {FieldDropdown} from '../../third-party/blockly/core/field_dropdown.js';
import {FieldImage} from '../../third-party/blockly/core/field_image.js';


/**
 * Common HSV hue for all animal blocks.
 */
const ANIMAL_HUE = 120;

/**
 * Common HSV hue for all picture blocks.
 */
const PICTURE_HUE = 30;

/**
 * Common HSV hue for all trait blocks.
 */
const TRAIT_HUE = 290;

/**
 * Return a list of all legs.
 * @returns {!Array<!Array<string>>} Array of human-readable and
 *   language-neutral tuples.
 */
function legs_(): Array<Array<string>> {
  const data = getData();
  const padding = '\xa0\xa0';
  const list = [[getMsg('Puzzle.legsChoose', false), '0']];
  for (let i = 0; i < data.length; i++) {
    list[i + 1] = [padding + data[i].legs + padding, String(i + 1)];
  }
  // Sort numerically.
  list.sort(function(a, b) {return Number(a[0]) - Number(b[0]);});
  return list;
};

Blocks['animal'] = {
  /**
   * Block to represent an animal.
   * @this {Blockly.Block}
   */
  init: function() {
    this.setColour(ANIMAL_HUE);
    this.appendDummyInput()
        .appendField('', 'NAME');
    this.appendValueInput('PIC')
        .setAlign(ALIGN_RIGHT)
        .appendField(getMsg('Puzzle.picture', false));
    this.appendDummyInput()
        .setAlign(ALIGN_RIGHT)
        .appendField(getMsg('Puzzle.legs', false))
        .appendField(new FieldDropdown(legs_), 'LEGS');
    this.appendStatementInput('TRAITS')
        .appendField(getMsg('Puzzle.traits', false));
    this.setInputsInline(false);
  },
  /**
   * Save the animal number.
   * @returns {!Element} XML storage element.
   * @this {Blockly.Block}
   */
  mutationToDom: function(): Element {
    const container = document.createElement('mutation');
    container.setAttribute('animal', this.animal);
    return container;
  },
  /**
   * Restore the animal number.
   * @param {!Element} xmlElement XML storage element.
   * @this {Blockly.Block}
   */
  domToMutation: function(xmlElement: Element) {
    this.populate(parseInt(xmlElement.getAttribute('animal')));
  },
  animal: 0,
  /**
   * Set the animal.
   * @param {number} n Animal number.
   * @this {Blockly.Block}
   */
  populate: function(n: number) {
    const data = getData();
    this.animal = n;
    this.setFieldValue(data[n - 1].name, 'NAME');
    this.helpUrl = data[n - 1].helpUrl;
  },
  /**
   * Evaluate the correctness of this block.
   * @this {Blockly.Block}
   */
  isCorrect: function() {
    return Number(this.getFieldValue('LEGS')) === this.animal;
  }
};

Blocks['picture'] = {
  /**
   * Block to represent a picture.
   * @this {Blockly.Block}
   */
  init: function() {
    this.setColour(PICTURE_HUE);
    this.appendDummyInput('PIC');
    this.setOutput(true);
    this.setTooltip('');
  },
  mutationToDom: Blocks['animal'].mutationToDom,
  domToMutation: Blocks['animal'].domToMutation,
  animal: 0,
  /**
   * Set the animal and picture.
   * @param {number} n Animal number.
   * @this {Blockly.Block}
   */
  populate: function(n: number) {
    this.animal = n;
    const data = getData();
    const pic = 'puzzle/' + data[n - 1].pic;
    const picHeight = data[n - 1].picHeight;
    const picWidth = data[n - 1].picWidth;
    this.getInput('PIC')
        .appendField(new FieldImage(pic, picWidth, picHeight));
  },
  /**
   * Evaluate the correctness of this block.
   * @this {Blockly.Block}
   */
  isCorrect: function() {
    const parent = this.getParent();
    return parent && (parent.animal === this.animal);
  }
};

Blocks['trait'] = {
  /**
   * Block to represent a trait.
   * @this {Blockly.Block}
   */
  init: function() {
    this.setColour(TRAIT_HUE);
    this.appendDummyInput().appendField('', 'NAME');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  },
  /**
   * Save the animal and trait numbers.
   * @returns {!Element} XML storage element.
   * @this {Blockly.Block}
   */
  mutationToDom: function(): Element {
    const container = document.createElement('mutation');
    container.setAttribute('animal', this.animal);
    container.setAttribute('trait', this.trait);
    return container;
  },
  /**
   * Restore the animal and trait numbers.
   * @param {!Element} xmlElement XML storage element.
   * @this {Blockly.Block}
   */
  domToMutation: function(xmlElement: Element) {
    this.populate(parseInt(xmlElement.getAttribute('animal')),
                  parseInt(xmlElement.getAttribute('trait')));
  },
  animal: 0,
  trait: 0,
  /**
   * Set the animal and trait.
   * @param {number} n Animal number.
   * @param {number} m Trait number.
   * @this {Blockly.Block}
   */
  populate: function(n: number, m: number) {
    this.animal = n;
    this.trait = m;
    // Set the trait name.
    const data = getData();
    this.setFieldValue(data[n - 1].traits[m - 1], 'NAME');
  },
  /**
   * Evaluate the correctness of this block.
   * @this {Blockly.Block}
   */
  isCorrect: function() {
    const parent = this.getSurroundParent();
    return parent && (parent.animal === this.animal);
  }
};
