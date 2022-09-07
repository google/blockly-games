/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Empty name space for the Message singleton.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Name space for the Msg singleton.
 * Msg gets populated in the message files.
 */
goog.provide('BlocklyGames.Msg');

goog.require('Blockly.Msg');


/**
 * Exported so that if BlocklyGames is compiled with ADVANCED_COMPILATION,
 * the BlocklyGames.Msg object exists for message files included in script tags.
 */
if (!window['BlocklyGames']) {
  window['BlocklyGames'] = {};
}
if (!window['BlocklyGames']['Msg']) {
  window['BlocklyGames']['Msg'] = BlocklyGames.Msg;
}
