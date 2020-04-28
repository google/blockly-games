/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Common support code for dialogs.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('BlocklyDialogs');

goog.require('Blockly');
goog.require('Blockly.utils.style');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');


/**
 * Is the dialog currently onscreen?
 * @private
 */
BlocklyDialogs.isDialogVisible_ = false;

/**
 * A closing dialog should animate towards this element.
 * @type Element
 * @private
 */
BlocklyDialogs.dialogOrigin_ = null;

/**
 * A function to call when a dialog closes.
 * @type Function
 * @private
 */
BlocklyDialogs.dialogDispose_ = null;

/**
 * Show the dialog pop-up.
 * @param {Element} content DOM element to display in the dialog.
 * @param {Element} origin Animate the dialog opening/closing from/to this
 *     DOM element.  If null, don't show any animations for opening or closing.
 * @param {boolean} animate Animate the dialog opening (if origin not null).
 * @param {boolean} modal If true, grey out background and prevent interaction.
 * @param {!Object} style A dictionary of style rules for the dialog.
 * @param {Function} disposeFunc An optional function to call when the dialog
 *     closes.  Normally used for unhooking events.
 */
BlocklyDialogs.showDialog = function(content, origin, animate, modal, style,
                                     disposeFunc) {
  if (!content) {
    throw TypeError('Content not found: ' + content);
  }
  if (BlocklyDialogs.isDialogVisible_) {
    BlocklyDialogs.hideDialog(false);
  }
  if (Blockly.getMainWorkspace()) {
    // Some levels have an editor instead of Blockly.
    Blockly.hideChaff(true);
  }
  BlocklyDialogs.isDialogVisible_ = true;
  BlocklyDialogs.dialogOrigin_ = origin;
  BlocklyDialogs.dialogDispose_ = disposeFunc;
  var dialog = document.getElementById('dialog');
  var shadow = document.getElementById('dialogShadow');
  var border = document.getElementById('dialogBorder');

  // Copy all the specified styles to the dialog.
  for (var name in style) {
    dialog.style[name] = style[name];
  }
  if (modal) {
    shadow.style.visibility = 'visible';
    shadow.style.opacity = 0.3;
    shadow.style.zIndex = 9;
    var header = document.createElement('div');
    header.id = 'dialogHeader';
    dialog.appendChild(header);
    BlocklyDialogs.dialogMouseDownWrapper_ =
        Blockly.bindEvent_(header, 'mousedown', null,
                           BlocklyDialogs.dialogMouseDown_);
  }
  dialog.appendChild(content);
  content.className = content.className.replace('dialogHiddenContent', '');

  function endResult() {
    // Check that the dialog wasn't closed during opening.
    if (BlocklyDialogs.isDialogVisible_) {
      dialog.style.visibility = 'visible';
      dialog.style.zIndex = 10;
      border.style.visibility = 'hidden';
    }
  }
  if (animate && origin) {
    BlocklyDialogs.matchBorder_(origin, false, 0.2);
    BlocklyDialogs.matchBorder_(dialog, true, 0.8);
    // In 175ms show the dialog and hide the animated border.
    setTimeout(endResult, 175);
  } else {
    // No animation.  Just set the final state.
    endResult();
  }
};

/**
 * Horizontal start coordinate of dialog drag.
 */
BlocklyDialogs.dialogStartX_ = 0;

/**
 * Vertical start coordinate of dialog drag.
 */
BlocklyDialogs.dialogStartY_ = 0;

/**
 * Handle start of drag of dialog.
 * @param {!Event} e Mouse down event.
 * @private
 */
BlocklyDialogs.dialogMouseDown_ = function(e) {
  BlocklyDialogs.dialogUnbindDragEvents_();
  if (Blockly.utils.isRightButton(e)) {
    // Right-click.
    return;
  }
  // Left click (or middle click).
  // Record the starting offset between the current location and the mouse.
  var dialog = document.getElementById('dialog');
  BlocklyDialogs.dialogStartX_ = dialog.offsetLeft - e.clientX;
  BlocklyDialogs.dialogStartY_ = dialog.offsetTop - e.clientY;

  BlocklyDialogs.dialogMouseUpWrapper_ = Blockly.bindEvent_(document,
      'mouseup', null, BlocklyDialogs.dialogUnbindDragEvents_);
  BlocklyDialogs.dialogMouseMoveWrapper_ = Blockly.bindEvent_(document,
      'mousemove', null, BlocklyDialogs.dialogMouseMove_);
  // This event has been handled.  No need to bubble up to the document.
  e.stopPropagation();
};

/**
 * Drag the dialog to follow the mouse.
 * @param {!Event} e Mouse move event.
 * @private
 */
BlocklyDialogs.dialogMouseMove_ = function(e) {
  var dialog = document.getElementById('dialog');
  var dialogLeft = BlocklyDialogs.dialogStartX_ + e.clientX;
  var dialogTop = BlocklyDialogs.dialogStartY_ + e.clientY;
  dialogTop = Math.max(dialogTop, 0);
  dialogTop = Math.min(dialogTop, window.innerHeight - dialog.offsetHeight);
  dialogLeft = Math.max(dialogLeft, 0);
  dialogLeft = Math.min(dialogLeft, window.innerWidth - dialog.offsetWidth);
  dialog.style.left = dialogLeft + 'px';
  dialog.style.top = dialogTop + 'px';
};

/**
 * Stop binding to the global mouseup and mousemove events.
 * @private
 */
BlocklyDialogs.dialogUnbindDragEvents_ = function() {
  if (BlocklyDialogs.dialogMouseUpWrapper_) {
    Blockly.unbindEvent_(BlocklyDialogs.dialogMouseUpWrapper_);
    BlocklyDialogs.dialogMouseUpWrapper_ = null;
  }
  if (BlocklyDialogs.dialogMouseMoveWrapper_) {
    Blockly.unbindEvent_(BlocklyDialogs.dialogMouseMoveWrapper_);
    BlocklyDialogs.dialogMouseMoveWrapper_ = null;
  }
};

/**
 * Hide the dialog pop-up.
 * @param {boolean} opt_animate Animate the dialog closing.  Defaults to true.
 *     Requires that origin was not null when dialog was opened.
 */
BlocklyDialogs.hideDialog = function(opt_animate) {
  if (!BlocklyDialogs.isDialogVisible_) {
    return;
  }
  BlocklyDialogs.dialogUnbindDragEvents_();
  if (BlocklyDialogs.dialogMouseDownWrapper_) {
    Blockly.unbindEvent_(BlocklyDialogs.dialogMouseDownWrapper_);
    BlocklyDialogs.dialogMouseDownWrapper_ = null;
  }

  BlocklyDialogs.isDialogVisible_ = false;
  BlocklyDialogs.dialogDispose_ && BlocklyDialogs.dialogDispose_();
  BlocklyDialogs.dialogDispose_ = null;
  var origin = (opt_animate === false) ? null : BlocklyDialogs.dialogOrigin_;
  var dialog = document.getElementById('dialog');
  var shadow = document.getElementById('dialogShadow');

  shadow.style.opacity = 0;

  function endResult() {
    shadow.style.zIndex = -1;
    shadow.style.visibility = 'hidden';
    var border = document.getElementById('dialogBorder');
    border.style.visibility = 'hidden';
  }
  if (origin && dialog) {
    BlocklyDialogs.matchBorder_(dialog, false, 0.8);
    BlocklyDialogs.matchBorder_(origin, true, 0.2);
    // In 175ms hide both the shadow and the animated border.
    setTimeout(endResult, 175);
  } else {
    // No animation.  Just set the final state.
    endResult();
  }
  dialog.style.visibility = 'hidden';
  dialog.style.zIndex = -1;
  var header = document.getElementById('dialogHeader');
  if (header) {
    header.parentNode.removeChild(header);
  }
  while (dialog.firstChild) {
    var content = dialog.firstChild;
    content.className += ' dialogHiddenContent';
    document.body.appendChild(content);
  }
};

/**
 * Match the animated border to the a element's size and location.
 * @param {!Element} element Element to match.
 * @param {boolean} animate Animate to the new location.
 * @param {number} opacity Opacity of border.
 * @private
 */
BlocklyDialogs.matchBorder_ = function(element, animate, opacity) {
  if (!element) {
    return;
  }
  var border = document.getElementById('dialogBorder');
  var bBox = BlocklyDialogs.getBBox_(element);
  function change() {
    border.style.width = bBox.width + 'px';
    border.style.height = bBox.height + 'px';
    border.style.left = bBox.x + 'px';
    border.style.top = bBox.y + 'px';
    border.style.opacity = opacity;
  }
  if (animate) {
    border.className = 'dialogAnimate';
    setTimeout(change, 1);
  } else {
    border.className = '';
    change();
  }
  border.style.visibility = 'visible';
};

/**
 * Compute the absolute coordinates and dimensions of an HTML or SVG element.
 * @param {!Element} element Element to match.
 * @return {!Object} Contains height, width, x, and y properties.
 * @private
 */
BlocklyDialogs.getBBox_ = function(element) {
  var xy = Blockly.utils.style.getPageOffset(element);
  var box = {
    x: xy.x,
    y: xy.y
  };
  if (element.getBBox) {
    // SVG element.
    var bBox = element.getBBox();
    box.height = bBox.height;
    box.width = bBox.width;
  } else {
    // HTML element.
    box.height = element.offsetHeight;
    box.width = element.offsetWidth;
  }
  return box;
};

/**
 * Display a storage-related modal dialog.
 * @param {?Element} origin Source of dialog opening animation.
 * @param {string} message Text to alert.
 */
BlocklyDialogs.storageAlert = function(origin, message) {
  var container = document.getElementById('containerStorage');
  container.textContent = '';
  var lines = message.split('\n');
  for (var i = 0; i < lines.length; i++) {
    var p = document.createElement('p');
    p.appendChild(document.createTextNode(lines[i]));
    container.appendChild(p);
  }

  var content = document.getElementById('dialogStorage');
  var style = {
    width: '50%',
    left: '25%',
    top: '5em'
  };
  BlocklyDialogs.showDialog(content, origin, true, true, style,
      BlocklyDialogs.stopDialogKeyDown);
  BlocklyDialogs.startDialogKeyDown();
};

/**
 * Display a dialog suggesting that the user give up.
 */
BlocklyDialogs.abortOffer = function() {
  // If the user has solved the level, all is well.
  if (BlocklyGames.loadFromLocalStorage(BlocklyGames.NAME,
                                        BlocklyGames.LEVEL)) {
    return;
  }
  // Don't override an existing dialog, or interrupt a drag.
  if (BlocklyDialogs.isDialogVisible_ || BlocklyInterface.workspace.isDragging()) {
    setTimeout(BlocklyDialogs.abortOffer, 15 * 1000);
    return;
  }

  var content = document.getElementById('dialogAbort');
  var style = {
    width: '40%',
    left: '30%',
    top: '3em'
  };

  var cancel = document.getElementById('abortCancel');
  cancel.addEventListener('click', BlocklyDialogs.hideDialog, true);
  cancel.addEventListener('touchend', BlocklyDialogs.hideDialog, true);
  var ok = document.getElementById('abortOk');
  ok.addEventListener('click', BlocklyInterface.indexPage, true);
  ok.addEventListener('touchend', BlocklyInterface.indexPage, true);

  BlocklyDialogs.showDialog(content, null, false, true, style,
      function() {
        document.body.removeEventListener('keydown',
            BlocklyDialogs.abortKeyDown, true);
        });
  document.body.addEventListener('keydown', BlocklyDialogs.abortKeyDown, true);
};

/**
 * Congratulates the user for completing the level and offers to
 * direct them to the next level, if available.
 */
BlocklyDialogs.congratulations = function() {
  var content = document.getElementById('dialogDone');
  var style = {
    width: '40%',
    left: '30%',
    top: '3em'
  };

  // Add the user's code.
  if (BlocklyInterface.workspace) {
    var linesText = document.getElementById('dialogLinesText');
    linesText.textContent = '';
    var code = BlocklyInterface.executedJsCode;
    code = BlocklyInterface.stripCode(code);
    var noComments = code.replace(/\/\/[^\n]*/g, '');  // Inline comments.
    noComments = noComments.replace(/\/\*.*\*\//g, '');  /* Block comments. */
    noComments = noComments.replace(/[ \t]+\n/g, '\n');  // Trailing spaces.
    noComments = noComments.replace(/\n+/g, '\n');  // Blank lines.
    noComments = noComments.trim();
    var lineCount = noComments.split('\n').length;
    var pre = document.getElementById('containerCode');
    pre.textContent = code;
    if (typeof prettyPrintOne == 'function') {
      code = pre.innerHTML;
      code = prettyPrintOne(code, 'js');
      pre.innerHTML = code;
    }
    if (lineCount == 1) {
      var text = BlocklyGames.getMsg('Games_linesOfCode1');
    } else {
      var text = BlocklyGames.getMsg('Games_linesOfCode2')
          .replace('%1', String(lineCount));
    }
    linesText.appendChild(document.createTextNode(text));
  }

  if (BlocklyGames.LEVEL < BlocklyGames.MAX_LEVEL) {
    var text = BlocklyGames.getMsg('Games_nextLevel')
        .replace('%1', String(BlocklyGames.LEVEL + 1));
  } else {
    var text = BlocklyGames.getMsg('Games_finalLevel');
  }

  var cancel = document.getElementById('doneCancel');
  cancel.addEventListener('click', BlocklyDialogs.hideDialog, true);
  cancel.addEventListener('touchend', BlocklyDialogs.hideDialog, true);
  var ok = document.getElementById('doneOk');
  ok.addEventListener('click', BlocklyInterface.nextLevel, true);
  ok.addEventListener('touchend', BlocklyInterface.nextLevel, true);

  BlocklyDialogs.showDialog(content, null, false, true, style,
      function() {
        document.body.removeEventListener('keydown',
            BlocklyDialogs.congratulationsKeyDown, true);
        });
  document.body.addEventListener('keydown',
      BlocklyDialogs.congratulationsKeyDown, true);

  document.getElementById('dialogDoneText').textContent = text;
};

/**
 * If the user preses enter, escape, or space, hide the dialog.
 * @param {!Event} e Keyboard event.
 * @private
 */
BlocklyDialogs.dialogKeyDown_ = function(e) {
  if (BlocklyDialogs.isDialogVisible_) {
    if (e.keyCode == 13 ||
        e.keyCode == 27 ||
        e.keyCode == 32) {
      BlocklyDialogs.hideDialog(true);
      e.stopPropagation();
      e.preventDefault();
    }
  }
};

/**
 * Start listening for BlocklyDialogs.dialogKeyDown_.
 */
BlocklyDialogs.startDialogKeyDown = function() {
  document.body.addEventListener('keydown',
      BlocklyDialogs.dialogKeyDown_, true);
};

/**
 * Stop listening for BlocklyDialogs.dialogKeyDown_.
 */
BlocklyDialogs.stopDialogKeyDown = function() {
  document.body.removeEventListener('keydown',
      BlocklyDialogs.dialogKeyDown_, true);
};

/**
 * If the user preses enter, escape, or space, hide the dialog.
 * Enter and space move to the next level, escape does not.
 * @param {!Event} e Keyboard event.
 */
BlocklyDialogs.congratulationsKeyDown = function(e) {
  if (e.keyCode == 13 ||
      e.keyCode == 27 ||
      e.keyCode == 32) {
    BlocklyDialogs.hideDialog(true);
    e.stopPropagation();
    e.preventDefault();
    if (e.keyCode != 27) {
      BlocklyInterface.nextLevel();
    }
  }
};

/**
 * If the user presses enter, escape, or space, hide the dialog.
 * Enter and space move to the index page, escape does not.
 * @param {!Event} e Keyboard event.
 */
BlocklyDialogs.abortKeyDown = function(e) {
  if (e.keyCode == 13 ||
      e.keyCode == 27 ||
      e.keyCode == 32) {
    BlocklyDialogs.hideDialog(true);
    e.stopPropagation();
    e.preventDefault();
    if (e.keyCode != 27) {
      BlocklyInterface.indexPage();
    }
  }
};

// Export symbols that would otherwise be renamed by Closure compiler.
window['BlocklyDialogs'] = BlocklyDialogs;
// template.soy has a hardcoded onclick="BlocklyDialogs.hidedialogs()".
BlocklyDialogs['hideDialog'] = BlocklyDialogs.hideDialog;
