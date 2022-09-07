/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview startCount variable for Music game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Music.startCount');


/**
 * Number of start blocks on the page (and thus the number of threads).
 */
Music.startCount.value = 0;

/**
 * Getter for the number of start blocks.
 * @returns {number} Integer number of start blocks on workspace.
 */
Music.startCount.get = function() {
  return Music.startCount.value;
};

/**
 * Setter for the number of start blocks.
 * @param {number} value Integer number of start blocks on workspace.
 */
Music.startCount.set = function(value) {
  Music.startCount.value = value;
};
