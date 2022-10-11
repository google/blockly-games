/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Common support code for dialogs.
 * @author fraser@google.com (Neil Fraser)
 */
import {getElementById, loadFromLocalStorage, storageName, LEVEL} from './lib-games.js';
import {workspace, indexPage} from './lib-interface.js';

import {hideChaff} from '../third-party/blockly/core/blockly.js';
import {bind, unbind, isRightButton, Data} from '../third-party/blockly/core/browser_events.js';
import {getPageOffset} from '../third-party/blockly/core/utils/style.js';


/**
 * Is the dialog currently onscreen?
 */
export let isDialogVisible = false;

/**
 * A closing dialog should animate towards this element.
 * @type Element
 * @private
 */
let dialogOrigin_: Element = null;

/**
 * A function to call when a dialog closes.
 * @type Function
 * @private
 */
let dialogDispose_: Function = null;

/**
 * Binding data that can be passed to unbind.
 * @type Blockly.browserEvents.Data
 * @private
 */
let dialogMouseDownWrapper_: Data = null;

/**
 * Binding data that can be passed to unbind.
 * @type Blockly.browserEvents.Data
 * @private
 */
let dialogMouseUpWrapper_: Data = null;

/**
 * Binding data that can be passed to unbind.
 * @type Blockly.browserEvents.Data
 * @private
 */
let dialogMouseMoveWrapper_: Data = null;

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
export function showDialog(content: Element, origin: Element, animate: boolean,
    modal: boolean, style: object, disposeFunc: Function) {
  if (!content) {
    throw TypeError('Content not found: ' + content);
  }
  const buttons = content.getElementsByClassName('addHideHandler');
  var button;
  while ((button = buttons[0])) {
    button.addEventListener('click', hideDialog, true);
    button.addEventListener('touchend', hideDialog, true);
    button.classList.remove('addHideHandler');
  }
  if ( isDialogVisible) {
    hideDialog(false);
  }
  if (workspace) {
    // Some levels have an editor instead of Blockly.
    hideChaff(true);
  }
   isDialogVisible = true;
  dialogOrigin_ = origin;
  dialogDispose_ = disposeFunc;
  const dialog = getElementById('dialog');
  const shadow = getElementById('dialogShadow');
  const border = getElementById('dialogBorder');

  // Copy all the specified styles to the dialog.
  for (const name in style) {
    dialog.style[name] = style[name];
  }
  if (modal) {
    shadow.style.visibility = 'visible';
    shadow.style.opacity = 0.3;
    shadow.style.zIndex = 9;
    const header = document.createElement('div');
    header.id = 'dialogHeader';
    dialog.appendChild(header);
    dialogMouseDownWrapper_ = bind(header, 'mousedown', null, dialogMouseDown_);
  }
  dialog.appendChild(content);
  content.classList.remove('dialogHiddenContent');

  function endResult() {
    // Check that the dialog wasn't closed during opening.
    if (! isDialogVisible) {
      return;
    }
    dialog.style.visibility = 'visible';
    dialog.style.zIndex = 10;
    border.style.visibility = 'hidden';

    // Focus on the dialog's most important button.
    let buttons = content.getElementsByClassName('primary');
    if (!buttons.length) {
      buttons = content.getElementsByClassName('secondary');
      if (!buttons.length) {
        buttons = content.getElementsByTagName('button');
      }
    }
    if (buttons[0] instanceof HTMLElement) {
      buttons[0].focus();
    }
  }
  // The origin (if it exists) might be a button we should lose focus on.
  if (origin instanceof HTMLElement) {
    try {
      origin.blur();
    } catch(e) {}
  }

  if (animate && origin) {
    matchBorder_(origin, false, 0.2);
    matchBorder_(dialog, true, 0.8);
    // In 175ms show the dialog and hide the animated border.
    setTimeout(endResult, 175);
  } else {
    // No animation.  Just set the final state.
    endResult();
  }
}

/**
 * Horizontal start coordinate of dialog drag.
 */
let dialogStartX_ = 0;

/**
 * Vertical start coordinate of dialog drag.
 */
let dialogStartY_ = 0;

/**
 * Handle start of drag of dialog.
 * @param {!MouseEvent} e Mouse down event.
 * @private
 */
function dialogMouseDown_(e: MouseEvent) {
  dialogUnbindDragEvents_();
  if (isRightButton(e)) {
    // Right-click.
    return;
  }
  // Left click (or middle click).
  // Record the starting offset between the current location and the mouse.
  const dialog = getElementById('dialog');
  dialogStartX_ = dialog.offsetLeft - e.clientX;
  dialogStartY_ = dialog.offsetTop - e.clientY;

  dialogMouseUpWrapper_ = bind(document, 'mouseup', null, dialogUnbindDragEvents_);
  dialogMouseMoveWrapper_ = bind(document, 'mousemove', null, dialogMouseMove_);
  // This event has been handled.  No need to bubble up to the document.
  e.stopPropagation();
}

/**
 * Drag the dialog to follow the mouse.
 * @param {!MouseEvent} e Mouse move event.
 * @private
 */
function dialogMouseMove_(e: MouseEvent) {
  const dialog = getElementById('dialog');
  let dialogLeft = dialogStartX_ + e.clientX;
  let dialogTop = dialogStartY_ + e.clientY;
  dialogTop = Math.max(dialogTop, 0);
  dialogTop = Math.min(dialogTop, window.innerHeight - dialog.offsetHeight);
  dialogLeft = Math.max(dialogLeft, 0);
  dialogLeft = Math.min(dialogLeft, window.innerWidth - dialog.offsetWidth);
  dialog.style.left = dialogLeft + 'px';
  dialog.style.top = dialogTop + 'px';
}

/**
 * Stop binding to the global mouseup and mousemove events.
 * @private
 */
function dialogUnbindDragEvents_() {
  if (dialogMouseUpWrapper_) {
    unbind(dialogMouseUpWrapper_);
    dialogMouseUpWrapper_ = null;
  }
  if (dialogMouseMoveWrapper_) {
    unbind(dialogMouseMoveWrapper_);
    dialogMouseMoveWrapper_ = null;
  }
}

/**
 * Hide the dialog pop-up.
 * @param {boolean} opt_animate Animate the dialog closing.  Defaults to true.
 *     Requires that origin was not null when dialog was opened.
 */
export function hideDialog(opt_animate: boolean = true) {
  if (! isDialogVisible) {
    return;
  }
  dialogUnbindDragEvents_();
  if (dialogMouseDownWrapper_) {
    unbind(dialogMouseDownWrapper_);
    dialogMouseDownWrapper_ = null;
  }

   isDialogVisible = false;
  dialogDispose_ && dialogDispose_();
  dialogDispose_ = null;
  const origin = opt_animate ? dialogOrigin_ : null;
  const dialog = getElementById('dialog');
  const shadow = getElementById('dialogShadow');

  shadow.style.opacity = 0;

  function endResult() {
    shadow.style.zIndex = -1;
    shadow.style.visibility = 'hidden';
    const border = getElementById('dialogBorder');
    border.style.visibility = 'hidden';
  }
  if (origin && dialog) {
    matchBorder_(dialog, false, 0.8);
    matchBorder_(origin, true, 0.2);
    // In 175ms hide both the shadow and the animated border.
    setTimeout(endResult, 175);
  } else {
    // No animation.  Just set the final state.
    endResult();
  }
  dialog.style.visibility = 'hidden';
  dialog.style.zIndex = -1;
  const header = getElementById('dialogHeader');
  if (header) {
    header.parentNode.removeChild(header);
  }
  while (dialog.firstChild) {
    const content = dialog.firstChild;
    content.classList.add('dialogHiddenContent');
    document.body.appendChild(content);
  }
}

type Box = {
  x: number;
  y: number;
  height: number;
  width: number;
};

/**
 * Match the animated border to the a element's size and location.
 * @param {!Element} element Element to match.
 * @param {boolean} animate Animate to the new location.
 * @param {number} opacity Opacity of border.
 * @private
 */
function matchBorder_(element: Element, animate: boolean, opacity: number) {
  if (!element) {
    return;
  }
  const border = getElementById('dialogBorder');
  const bBox = getBBox_(element);
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
}

/**
 * Compute the absolute coordinates and dimensions of an HTML or SVG element.
 * @param {!Element} element Element to match.
 * @returns {!Box} Contains height, width, x, and y properties.
 * @private
 */
function getBBox_(element: Element): Box {
  const xy = getPageOffset(element);
  const box = {
    x: xy.x,
    y: xy.y,
    height: NaN,
    width: NaN,
  };
  if (element instanceof SVGGraphicsElement) {
    // SVG element.
    const bBox = element.getBBox();
    box.height = bBox.height;
    box.width = bBox.width;
  } else if (element instanceof HTMLElement) {
    // HTML element.
    box.height = element.offsetHeight;
    box.width = element.offsetWidth;
  }
  return box;
}

/**
 * Display a storage-related modal dialog.
 * @param {string} message Text to alert.
 */
export function storageAlert(message: string) {
  const origin = getElementById('linkButton');  // May be null (in Gallery).
  const container = getElementById('containerStorage');
  container.textContent = '';
  const lines = message.split('\n');
  for (const line of lines) {
    const p = document.createElement('p');
    p.appendChild(document.createTextNode(line));
    container.appendChild(p);
  }

  const content = getElementById('dialogStorage');
  const style = {
    width: '50%',
    left: '25%',
    top: '5em',
  };
  showDialog(content, origin, true, true, style, stopDialogKeyDown);
  startDialogKeyDown();
}

/**
 * Display a dialog suggesting that the user give up.
 */
export function abortOffer() {
  // If the user has solved the level, all is well.
  if (loadFromLocalStorage(storageName, LEVEL)) {
    return;
  }
  // Don't override an existing dialog, or interrupt a drag.
  if ( isDialogVisible ||
      workspace.isDragging()) {
    setTimeout(abortOffer, 15 * 1000);
    return;
  }

  const content = getElementById('dialogAbort');
  const style = {
    width: '40%',
    left: '30%',
    top: '3em',
  };

  const ok = getElementById('abortOk');
  ok.addEventListener('click', indexPage, true);
  ok.addEventListener('touchend', indexPage, true);

  showDialog(content, null, false, true, style,
      function() {
        document.body.removeEventListener('keydown', abortKeyDown_, true);
        });
  document.body.addEventListener('keydown', abortKeyDown_, true);
}

/**
 * If the user presses enter, escape, or space, hide the dialog.
 * @param {!KeyboardEvent} e Keyboard event.
 */
export function dialogKeyDown(e: KeyboardEvent) {
  if ( isDialogVisible) {
    if (e.code === 'Enter' || e.code === 'Escape' || e.code === 'Space') {
      hideDialog(true);
      e.stopPropagation();
      e.preventDefault();
    }
  }
}

/**
 * Start listening for BlocklyDialogs.dialogKeyDown.
 */
export function startDialogKeyDown() {
  document.body.addEventListener('keydown', dialogKeyDown, true);
}

/**
 * Stop listening for BlocklyDialogs.dialogKeyDown.
 */
export function stopDialogKeyDown() {
  document.body.removeEventListener('keydown', dialogKeyDown, true);
}

/**
 * If the user presses enter, escape, or space, hide the dialog.
 * Enter and space move to the index page, escape does not.
 * @param {!KeyboardEvent} e Keyboard event.
 * @private
 */
function abortKeyDown_(e: KeyboardEvent) {
  dialogKeyDown(e);
  if (e.code === 'Enter' || e.code === 'Space') {
    indexPage();
  }
}
