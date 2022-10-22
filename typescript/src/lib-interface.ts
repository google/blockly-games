/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Common support code for games that embed Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
import * as BlocklyGames from './lib-games.js';
import * as BlocklyInterface from './lib-interface.js';
import * as BlocklyStorage from './lib-storage.js';

import {inject} from '../third-party/blockly/core/inject.js';
import {domToText, domToWorkspace, textToDom, workspaceToDom}
    from '../third-party/blockly/core/xml.js';
import type {WorkspaceSvg} from '../third-party/blockly/core/workspace_svg.js';


/**
 * Blockly's main workspace.
 * @type Blockly.WorkspaceSvg
 */
export let workspace: WorkspaceSvg = null;

/**
 * Text editor (used as an alternative to Blockly in advanced apps).
 * @type Object
 */
export let editor: object = null;

/**
 * Is the blocks editor disabled due to the JS editor having control?
 * @type boolean
 */
export let blocksDisabled: boolean = false;

/**
 * User's code (XML or JS) from the editor (Blockly or ACE) from previous
 * execution.
 * @type string
 */
export let executedCode: string = '';

/**
 * Setter for `executedCode`.
 * @param {string} newCode New code string.
 */
export function setExecutedCode(newCode: string) {
  executedCode = newCode;
}

/**
 * Additional parameter to append when moving to next level.
 * @type string
 */
export let nextLevelParam: string = '';

/**
 * Setter for `nextLevelParam`.
 * @param {string} newParam New parameter.
 */
export function setNextLevelParam(newParam: string) {
  nextLevelParam = newParam;
}

/**
 * Common startup tasks for all apps.
 * @param {string} title Text for the page title.
 */
export function init(title: string) {
  BlocklyGames.init(title);

  // Disable the link button if page isn't backed by App Engine storage.
  const linkButton = BlocklyGames.getElementById('linkButton');
  if (linkButton) {
    if (!BlocklyGames.IS_HTML) {
      BlocklyStorage.setGetCodeFunction(getCode);
      BlocklyStorage.setSetCodeFunction(setCode);
      BlocklyGames.bindClick(linkButton, BlocklyStorage.link);
    } else {
      linkButton.style.display = 'none';
    }
  }

  const languageMenu = BlocklyGames.getElementById('languageMenu');
  if (languageMenu) {
    languageMenu.addEventListener('change',
        BlocklyInterface.changeLanguage, true);
  }
}

/**
 * Load blocks saved on App Engine Storage or in session/local storage.
 * @param {string} defaultXml Text representation of default blocks.
 * @param {boolean|!Function} inherit If true or a function, load blocks from
 *     previous level.  If a function, call it to modify the inherited blocks.
 */
export function loadBlocks(defaultXml: string, inherit: boolean | Function) {
  if (!BlocklyGames.IS_HTML && window.location.hash.length > 1) {
    // An href with #key triggers an AJAX call to retrieve saved blocks.
    BlocklyStorage.retrieveXml(window.location.hash.substring(1));
    return;
  }

  // Language switching stores the blocks during the reload.
  let loadOnce: string;
  try {
    loadOnce = window.sessionStorage.loadOnceBlocks;
  } catch (e) {
    // Firefox sometimes throws a SecurityError when accessing sessionStorage.
    // Restarting Firefox fixes this, so it looks like a bug.
  }
  if (loadOnce) {
    delete window.sessionStorage.loadOnceBlocks;
  }

  const savedLevel =
      BlocklyGames.loadFromLocalStorage(BlocklyGames.storageName,
                                        BlocklyGames.LEVEL);
  let inherited = inherit &&
      BlocklyGames.loadFromLocalStorage(BlocklyGames.storageName,
                                        BlocklyGames.LEVEL - 1);
  if (inherited && typeof inherit === 'function') {
    inherited = inherit(inherited);
  }

  const restore = loadOnce || savedLevel || inherited || defaultXml;
  if (restore) {
    setCode(restore);
  }
}

/**
 * Set the given code (XML or JS) to the editor (Blockly or ACE).
 * @param {string} code XML or JS code.
 */
export function setCode(code: string) {
  if (editor) {
    // Text editor.
    editor['setValue'](code, -1);
  } else {
    // Blockly editor.
    const xml = textToDom(code);
    // Clear the workspace to avoid merge.
    workspace.clear();
    domToWorkspace(xml, workspace);
    workspace.clearUndo();
  }
}

/**
 * Get the user's code (XML or JS) from the editor (Blockly or ACE).
 * @returns {string} XML or JS code.
 */
export function getCode(): string {
  let text: string;
  if (blocksDisabled) {
    // Text editor.
    text = editor['getValue']();
  } else {
    // Blockly editor.
    const xml = workspaceToDom(workspace, true);
    // Remove x/y coordinates from XML if there's only one block stack.
    // There's no reason to store this, removing it helps with anonymity.
    if (workspace.getTopBlocks(false).length === 1 && xml.querySelector) {
      const block = xml.querySelector('block');
      if (block) {
        block.removeAttribute('x');
        block.removeAttribute('y');
      }
    }
    text = domToText(xml);
  }
  return text;
}

/**
 * Monitor the block or JS editor.  If a change is made that changes the code,
 * clear the key from the URL.
 */
export function codeChanged() {
  if (BlocklyStorage.startCode !== null &&
      BlocklyStorage.startCode !== getCode()) {
    window.location.hash = '';
    BlocklyStorage.setStartCode(null);
  }
}

/**
 * Inject Blockly workspace into page.
 * @param {!Object} options Dictionary of Blockly options.
 */
export function injectBlockly(options: object) {
  const toolbox = BlocklyGames.getElementById('toolbox');
  if (toolbox) {
    options['toolbox'] = toolbox;
  }
  options['media'] = 'third-party/blockly/media/';
  options['oneBasedIndex'] = false;
  workspace = inject('blockly', options);
  workspace.addChangeListener(codeChanged);
}

/**
 * Save the blocks/JS for this level to persistent client-side storage.
 */
export function saveToLocalStorage() {
  // MSIE 11 does not support localStorage on file:// URLs.
  if (!window.localStorage) {
    return;
  }
  const name = BlocklyGames.storageName + BlocklyGames.LEVEL;
  window.localStorage[name] = executedCode;
}

/**
 * Go to the index page.
 */
export function indexPage() {
  window.location.assign((BlocklyGames.IS_HTML ? 'index.html' : './') +
      '?lang=' + BlocklyGames.LANG);
}

/**
 * Save the blocks/code for a one-time reload.
 */
export function saveToSessionStorage() {
  // Store the blocks for the duration of the reload.
  // MSIE 11 does not support sessionStorage on file:// URLs.
  if (window.sessionStorage) {
    window.sessionStorage.loadOnceBlocks = getCode();
  }
}

/**
 * Save the blocks and reload with a different language.
 */
export function changeLanguage() {
  saveToSessionStorage();
  BlocklyGames.changeLanguage();
}

/**
 * Go to the next level.
 */
export function nextLevel() {
  if (BlocklyGames.LEVEL < BlocklyGames.MAX_LEVEL) {
    location.assign(location.protocol + '//' + location.host +
        location.pathname + '?lang=' + BlocklyGames.LANG +
        '&level=' + (BlocklyGames.LEVEL + 1) + nextLevelParam);
  } else {
    indexPage();
  }
}

/**
 * Inject readonly Blockly.  Only inserts once.
 * @param {string} id ID of div to be injected into.
 * @param {string|!Array<string>} xml XML string(s) describing blocks.
 */
export function injectReadonly(id: string, xml: string | Array<string>) {
  const div = BlocklyGames.getElementById(id);
  if (!div.firstChild) {
    const workspace =
        inject(div, {'rtl': BlocklyGames.IS_RTL, 'readOnly': true});
    if (typeof xml !== 'string') {
      xml = xml.join('');
    }
    domToWorkspace(textToDom(xml), workspace);
  }
}

/**
 * Determine if this event is unwanted.
 * @param {!Event} e Mouse or touch event.
 * @returns {boolean} True if spam.
 */
export function eventSpam(e: Event): boolean {
  // Touch screens can generate 'touchend' followed shortly thereafter by
  // 'click'.  For now, just look for this very specific combination.
  // Some devices have both mice and touch, but assume the two won't occur
  // within two seconds of each other.
  const touchMouseTime = 2000;
  if (e.type === 'click' &&
      eventSpam.previousType_ === 'touchend' &&
      eventSpam.previousDate_ + touchMouseTime > Date.now()) {
    e.preventDefault();
    e.stopPropagation();
    return true;
  }
  // Users double-click or double-tap accidentally.
  const doubleClickTime = 400;
  if (eventSpam.previousType_ === e.type &&
      eventSpam.previousDate_ + doubleClickTime > Date.now()) {
    e.preventDefault();
    e.stopPropagation();
    return true;
  }
  eventSpam.previousType_ = e.type;
  eventSpam.previousDate_ = Date.now();
  return false;
}

eventSpam.previousType_ = null;
eventSpam.previousDate_ = 0;
