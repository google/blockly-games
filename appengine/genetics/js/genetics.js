/**
 * Blockly Games: Genetics
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
 * @fileoverview JavaScript for Blockly's Genetics game application and level
 * specific logic.
 * @author kozbial@google.com (Monica Kozbial)
 */
'use strict';

goog.provide('Genetics');

goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('Genetics.Cage');
goog.require('Genetics.Mouse');
goog.require('Genetics.MouseAvatar');
goog.require('Genetics.Visualization');
goog.require('goog.array');

/**
 * Optional callback function for when a game ends.
 * @param {boolean} success Whether the game/level was succeeded.
 * @type {function(boolean)}
 */
Genetics.endGame = null;

/**
 * Optional function for checking for alternate end conditions.
 * @type {Function}
 */
Genetics.checkForEnd = null;

/**
/**
 * The mode that the editor is in. Either 'blocks' or 'js'.
 * @type {string}
 */
Genetics.mode = 'blocks';

/**
 * Initialize genetics.  Called on page load.
 */
Genetics.init = function() {
  BlocklyInterface.init();
  Genetics.Visualization.init();

  BlocklyGames.bindClick('runButton', Genetics.runButtonClick);
  BlocklyGames.bindClick('resetButton', Genetics.resetButtonClick);
  BlocklyGames.bindClick('docsButton', Genetics.docsButtonClick);
  BlocklyGames.bindClick('closeDocs', Genetics.docsCloseClick);

  // Lazy-load the JavaScript interpreter.
  setTimeout(BlocklyInterface.importInterpreter, 1);
  // Lazy-load the syntax-highlighting.
  setTimeout(BlocklyInterface.importPrettify, 1);
};

/**
 * Is the documentation open?
 * @private {boolean}
 */
Genetics.isDocsVisible_ = false;

/**
 * Open the documentation frame.
 */
Genetics.docsButtonClick = function() {
  if (Genetics.isDocsVisible_) {
    return;
  }
  var origin = document.getElementById('docsButton');
  var dialog = document.getElementById('dialogDocs');
  var frame = document.getElementById('frameDocs');
  var src = 'docs/genetics.html?lang=' + BlocklyGames.LANG +
      '&level=' + BlocklyGames.LEVEL + '&mode=' + Genetics.mode;
  if (frame.src != src) {
    frame.src = src;
  }

  function endResult() {
    dialog.style.visibility = 'visible';
    var border = document.getElementById('dialogBorder');
    border.style.visibility = 'hidden';
  }
  Genetics.isDocsVisible_ = true;
  BlocklyDialogs.matchBorder_(origin, false, 0.2);
  BlocklyDialogs.matchBorder_(dialog, true, 0.8);
  // In 175ms show the dialog and hide the animated border.
  setTimeout(endResult, 175);
};

/**
 * Close the documentation frame.
 */
Genetics.docsCloseClick = function() {
  if (!Genetics.isDocsVisible_) {
    return;
  }
  var origin = document.getElementById('docsButton');
  var dialog = document.getElementById('dialogDocs');

  function endResult() {
    var border = document.getElementById('dialogBorder');
    border.style.visibility = 'hidden';
  }
  Genetics.isDocsVisible_ = false;
  BlocklyDialogs.matchBorder_(dialog, false, 0.8);
  BlocklyDialogs.matchBorder_(origin, true, 0.2);
  // In 175ms hide the animated border.
  setTimeout(endResult, 175);
  dialog.style.visibility = 'hidden';
};

/**
 * Click the run button. Start the Genetics simulation.
 * @param {!Event} e Mouse or touch event.
 */
Genetics.runButtonClick = function(e) {
  // Prevent double-clicks or double-taps.
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  var runButton = document.getElementById('runButton');
  var resetButton = document.getElementById('resetButton');
  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton.style.minWidth) {
    resetButton.style.minWidth = runButton.offsetWidth + 'px';
  }
  runButton.style.display = 'none';
  resetButton.style.display = 'inline';
  Genetics.execute();
};

/**
 * Click the reset button. Reset the Genetics simulation.
 * @param {!Event} e Mouse or touch event.
 */
Genetics.resetButtonClick = function(e) {
  // Prevent double-clicks or double-taps.
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  var runButton = document.getElementById('runButton');
  runButton.style.display = 'inline';
  document.getElementById('resetButton').style.display = 'none';
  Genetics.reset();
};

/**
 * Runs the Genetics simulation with the user's code.
 */
Genetics.execute = function() {
  if (!('Interpreter' in window)) {
    // Interpreter lazy loads and hasn't arrived yet.  Try again later.
    setTimeout(Genetics.execute, 250);
    return;
  }

  Genetics.Cage.start(Genetics.checkForEnd);
  Genetics.Visualization.start(Genetics.endGame);
};

/**
 * Reset the Genetics simulation and kill any pending tasks.
 */
Genetics.reset = function() {
  Genetics.Cage.reset();
  Genetics.Visualization.reset();
  Genetics.Cage.addStartingMice();
};

/**
 * Show the help pop-up.
 */
Genetics.showHelp = function() {
  var help = document.getElementById('help');
  var button = document.getElementById('helpButton');
  var style = {
    width: '50%',
    left: '25%',
    top: '5em'
  };
  BlocklyDialogs.showDialog(help, button, true, true, style,
      BlocklyDialogs.stopDialogKeyDown);
  BlocklyDialogs.startDialogKeyDown();
};

/**
 * Prints messages sent from Visualization to console.
 * @param {string} msg The message to print.
 */
Genetics.log = function(msg) {
  console.log(msg);
};
