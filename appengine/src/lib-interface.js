/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Common support code for games that embed Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('BlocklyInterface');

goog.require('Blockly');
goog.require('Blockly.ContextMenuItems');
goog.require('Blockly.geras.Renderer');
goog.require('Blockly.ShortcutItems');
goog.require('Blockly.Xml');
goog.require('BlocklyGames');
goog.require('BlocklyStorage');


/**
 * Blockly's main workspace.
 * @type Blockly.WorkspaceSvg
 */
BlocklyInterface.workspace = null;

/**
 * Text editor (used as an alternative to Blockly in advanced apps).
 * @type Object
 */
BlocklyInterface.editor = null;

/**
 * Is the blocks editor disabled due to the JS editor having control?
 * @type boolean
 */
BlocklyInterface.blocksDisabled = false;

/**
 * User's code (XML or JS) from the editor (Blockly or ACE) from previous
 * execution.
 * @type string
 */
BlocklyInterface.executedCode = '';

/**
 * Additional parameter to append when moving to next level.
 * @type string
 */
BlocklyInterface.nextLevelParam = '';

/**
 * Common startup tasks for all apps.
 * @param {string} title Text for the page title.
 */
BlocklyInterface.init = function(title) {
  BlocklyGames.init(title);

  // Disable the link button if page isn't backed by App Engine storage.
  const linkButton = BlocklyGames.getElementById('linkButton');
  if (linkButton) {
    if (!BlocklyGames.IS_HTML) {
      BlocklyStorage.getCode = BlocklyInterface.getCode;
      BlocklyStorage.setCode = BlocklyInterface.setCode;
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
};

/**
 * Load blocks saved on App Engine Storage or in session/local storage.
 * @param {string} defaultXml Text representation of default blocks.
 * @param {boolean|!Function} inherit If true or a function, load blocks from
 *     previous level.  If a function, call it to modify the inherited blocks.
 */
BlocklyInterface.loadBlocks = function(defaultXml, inherit) {
  if (!BlocklyGames.IS_HTML && window.location.hash.length > 1) {
    // An href with #key triggers an AJAX call to retrieve saved blocks.
    BlocklyStorage.retrieveXml(window.location.hash.substring(1));
    return;
  }

  // Language switching stores the blocks during the reload.
  let loadOnce;
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
    BlocklyInterface.setCode(restore);
  }
};

/**
 * Set the given code (XML or JS) to the editor (Blockly or ACE).
 * @param {string} code XML or JS code.
 */
BlocklyInterface.setCode = function(code) {
  if (BlocklyInterface.editor) {
    // Text editor.
    BlocklyInterface.editor['setValue'](code, -1);
  } else {
    // Blockly editor.
    const xml = Blockly.Xml.textToDom(code);
    // Clear the workspace to avoid merge.
    BlocklyInterface.workspace.clear();
    Blockly.Xml.domToWorkspace(xml, BlocklyInterface.workspace);
    BlocklyInterface.workspace.clearUndo();
  }
};

/**
 * Get the user's code (XML or JS) from the editor (Blockly or ACE).
 * @returns {string} XML or JS code.
 */
BlocklyInterface.getCode = function() {
  let text;
  if (BlocklyInterface.blocksDisabled) {
    // Text editor.
    text = BlocklyInterface.editor['getValue']();
  } else {
    // Blockly editor.
    const xml = Blockly.Xml.workspaceToDom(BlocklyInterface.workspace, true);
    // Remove x/y coordinates from XML if there's only one block stack.
    // There's no reason to store this, removing it helps with anonymity.
    if (BlocklyInterface.workspace.getTopBlocks(false).length === 1 &&
        xml.querySelector) {
      const block = xml.querySelector('block');
      if (block) {
        block.removeAttribute('x');
        block.removeAttribute('y');
      }
    }
    text = Blockly.Xml.domToText(xml);
  }
  return text;
};

/**
 * Monitor the block or JS editor.  If a change is made that changes the code,
 * clear the key from the URL.
 */
BlocklyInterface.codeChanged = function() {
  if (BlocklyStorage.startCode !== null &&
      BlocklyStorage.startCode !== BlocklyInterface.getCode()) {
    window.location.hash = '';
    BlocklyStorage.startCode = null;
  }
};

/**
 * Inject Blockly workspace into page.
 * @param {!Object} options Dictionary of Blockly options.
 */
BlocklyInterface.injectBlockly = function(options) {
  const toolbox = BlocklyGames.getElementById('toolbox');
  if (toolbox) {
    options['toolbox'] = toolbox;
  }
  options['media'] = 'third-party/blockly/media/';
  options['oneBasedIndex'] = false;
  BlocklyInterface.workspace = Blockly.inject('blockly', options);
  BlocklyInterface.workspace.addChangeListener(BlocklyInterface.codeChanged);
};

/**
 * Save the blocks/JS for this level to persistent client-side storage.
 */
BlocklyInterface.saveToLocalStorage = function() {
  // MSIE 11 does not support localStorage on file:// URLs.
  if (!window.localStorage) {
    return;
  }
  const name = BlocklyGames.storageName + BlocklyGames.LEVEL;
  window.localStorage[name] = BlocklyInterface.executedCode;
};

/**
 * Go to the index page.
 */
BlocklyInterface.indexPage = function() {
  window.location = (BlocklyGames.IS_HTML ? 'index.html' : './') +
      '?lang=' + BlocklyGames.LANG;
};

/**
 * Save the blocks/code for a one-time reload.
 */
BlocklyInterface.saveToSessionStorage = function() {
  // Store the blocks for the duration of the reload.
  // MSIE 11 does not support sessionStorage on file:// URLs.
  if (window.sessionStorage) {
    window.sessionStorage.loadOnceBlocks = BlocklyInterface.getCode();
  }
};

/**
 * Save the blocks and reload with a different language.
 */
BlocklyInterface.changeLanguage = function() {
  BlocklyInterface.saveToSessionStorage();
  BlocklyGames.changeLanguage();
};

/**
 * Go to the next level.
 */
BlocklyInterface.nextLevel = function() {
  if (BlocklyGames.LEVEL < BlocklyGames.MAX_LEVEL) {
    location = location.protocol + '//' + location.host + location.pathname +
        '?lang=' + BlocklyGames.LANG + '&level=' + (BlocklyGames.LEVEL + 1) +
        BlocklyInterface.nextLevelParam;
  } else {
    BlocklyInterface.indexPage();
  }
};

/**
 * Inject readonly Blockly.  Only inserts once.
 * @param {string} id ID of div to be injected into.
 * @param {string|!Array<string>} xml XML string(s) describing blocks.
 */
BlocklyInterface.injectReadonly = function(id, xml) {
  const div = BlocklyGames.getElementById(id);
  if (!div.firstChild) {
    const workspace =
        Blockly.inject(div, {'rtl': BlocklyGames.IS_RTL, 'readOnly': true});
    if (typeof xml !== 'string') {
      xml = xml.join('');
    }
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), workspace);
  }
};

/**
 * Determine if this event is unwanted.
 * @param {!Event} e Mouse or touch event.
 * @returns {boolean} True if spam.
 */
BlocklyInterface.eventSpam = function(e) {
  // Touch screens can generate 'touchend' followed shortly thereafter by
  // 'click'.  For now, just look for this very specific combination.
  // Some devices have both mice and touch, but assume the two won't occur
  // within two seconds of each other.
  const touchMouseTime = 2000;
  if (e.type === 'click' &&
      BlocklyInterface.eventSpam.previousType_ === 'touchend' &&
      BlocklyInterface.eventSpam.previousDate_ + touchMouseTime > Date.now()) {
    e.preventDefault();
    e.stopPropagation();
    return true;
  }
  // Users double-click or double-tap accidentally.
  const doubleClickTime = 400;
  if (BlocklyInterface.eventSpam.previousType_ === e.type &&
      BlocklyInterface.eventSpam.previousDate_ + doubleClickTime > Date.now()) {
    e.preventDefault();
    e.stopPropagation();
    return true;
  }
  BlocklyInterface.eventSpam.previousType_ = e.type;
  BlocklyInterface.eventSpam.previousDate_ = Date.now();
  return false;
};

BlocklyInterface.eventSpam.previousType_ = null;
BlocklyInterface.eventSpam.previousDate_ = 0;
