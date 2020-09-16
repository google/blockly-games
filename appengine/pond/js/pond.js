/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Creates an pond for avatars to compete in.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Pond');

goog.require('Blockly.Comment');
goog.require('Blockly.Toolbox');
goog.require('Blockly.Trashcan');
goog.require('Blockly.VerticalFlyout');
goog.require('BlocklyGames');
goog.require('Pond.Battle');
goog.require('Pond.Visualization');


/**
 * Optional callback function for when a game ends.
 * @type Function(number)
 */
Pond.endBattle = null;

/**
 * Initialize the pond.  Called on page load.
 */
Pond.init = function() {
  BlocklyInterface.init();
  Pond.Visualization.init();

  BlocklyGames.bindClick('runButton', Pond.runButtonClick);
  BlocklyGames.bindClick('resetButton', Pond.resetButtonClick);
  BlocklyGames.bindClick('docsButton', Pond.docsButtonClick);
  BlocklyGames.bindClick('closeDocs', Pond.docsCloseClick);

  // Lazy-load the JavaScript interpreter.
  BlocklyInterface.importInterpreter();
  // Lazy-load the syntax-highlighting.
  BlocklyInterface.importPrettify();
};

/**
 * Currently selected avatar.
 * @type Pond.Avatar
 */
Pond.currentAvatar = null;

/**
 * Is the documentation open?
 * @private
 */
Pond.isDocsVisible_ = false;

/**
 * Open the documentation frame.
 */
Pond.docsButtonClick = function() {
  if (Pond.isDocsVisible_) {
    return;
  }
  var origin = document.getElementById('docsButton');
  var dialog = document.getElementById('dialogDocs');
  var frame = document.getElementById('frameDocs');
  var src = 'pond/docs.html?lang=' + BlocklyGames.LANG +
        '&mode=' + BlocklyGames.LEVEL;
  if (frame.src != src) {
    frame.src = src;
  }

  function endResult() {
    dialog.style.visibility = 'visible';
    var border = document.getElementById('dialogBorder');
    border.style.visibility = 'hidden';
  }
  Pond.isDocsVisible_ = true;
  BlocklyDialogs.matchBorder_(origin, false, 0.2);
  BlocklyDialogs.matchBorder_(dialog, true, 0.8);
  // In 175ms show the dialog and hide the animated border.
  setTimeout(endResult, 175);
};

/**
 * Close the documentation frame.
 */
Pond.docsCloseClick = function() {
  if (!Pond.isDocsVisible_) {
    return;
  }
  var origin = document.getElementById('docsButton');
  var dialog = document.getElementById('dialogDocs');

  function endResult() {
    var border = document.getElementById('dialogBorder');
    border.style.visibility = 'hidden';
  }
  Pond.isDocsVisible_ = false;
  BlocklyDialogs.matchBorder_(dialog, false, 0.8);
  BlocklyDialogs.matchBorder_(origin, true, 0.2);
  // In 175ms hide the animated border.
  setTimeout(endResult, 175);
  dialog.style.visibility = 'hidden';
};

/**
 * Save changes to the editor back to the current avatar.
 */
Pond.saveAvatar = function() {
  var avatar = Pond.currentAvatar;
  if (!avatar) return;
  var code = BlocklyInterface.getCode();
  var compiled = BlocklyInterface.getJsCode();
  if (BlocklyInterface.blocksDisabled) {
    try {
      compiled = BlocklyAce.transpileToEs5(compiled) || compiled;
    } catch (e) {
      alert(e);
    }
    avatar.setCode(undefined, code, compiled);
  } else {
    avatar.setCode(code, undefined, compiled);
  }
};

/**
 * Click the run button.  Start the Pond.
 * @param {!Event} e Mouse or touch event.
 */
Pond.runButtonClick = function(e) {
  // Prevent double-clicks or double-taps.
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  Pond.saveAvatar();
  var runButton = document.getElementById('runButton');
  var resetButton = document.getElementById('resetButton');
  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton.style.minWidth) {
    resetButton.style.minWidth = runButton.offsetWidth + 'px';
  }
  runButton.style.display = 'none';
  resetButton.style.display = 'inline';
  Pond.execute();
};

/**
 * Click the reset button.  Reset the Pond.
 * @param {!Event} e Mouse or touch event.
 */
Pond.resetButtonClick = function(e) {
  // Prevent double-clicks or double-taps.
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  var runButton = document.getElementById('runButton');
  runButton.style.display = 'inline';
  document.getElementById('resetButton').style.display = 'none';
  Pond.reset();
};

/**
 * Execute the users' code.  Heaven help us...
 */
Pond.execute = function() {
  if (!('Interpreter' in window)) {
    // Interpreter lazy loads and hasn't arrived yet.  Try again later.
    setTimeout(Pond.execute, 250);
    return;
  }
  Pond.reset();

  Pond.Battle.start(Pond.endBattle);
  Pond.Visualization.start();
};

/**
 * Reset the pond and kill any pending tasks.
 */
Pond.reset = function() {
  Pond.Battle.reset();
  Pond.Visualization.reset();
};

/**
 * Show the help pop-up.
 */
Pond.showHelp = function() {
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
