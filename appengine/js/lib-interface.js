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
goog.require('Blockly.geras.Renderer');
goog.require('BlocklyGames');
goog.require('BlocklyGames.Msg');
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
 * User's JavaScript code from previous execution.
 * @type string
 */
BlocklyInterface.executedJsCode = '';

/**
 * Common startup tasks for all apps.
 */
BlocklyInterface.init = function() {
  BlocklyGames.init();

  // Disable the link button if page isn't backed by App Engine storage.
  var linkButton = document.getElementById('linkButton');
  if (linkButton) {
    if (!BlocklyGames.IS_HTML) {
      BlocklyStorage.getCode = BlocklyInterface.getCode;
      BlocklyStorage.setCode = BlocklyInterface.setCode;
      BlocklyGames.bindClick(linkButton, BlocklyStorage.link);
    } else {
      linkButton.style.display = 'none';
    }
  }

  var languageMenu = document.getElementById('languageMenu');
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
  var loadOnce = null;
  try {
    loadOnce = window.sessionStorage.loadOnceBlocks;
  } catch (e) {
    // Firefox sometimes throws a SecurityError when accessing sessionStorage.
    // Restarting Firefox fixes this, so it looks like a bug.
  }
  if (loadOnce) {
    delete window.sessionStorage.loadOnceBlocks;
  }

  var savedLevel =
      BlocklyGames.loadFromLocalStorage(BlocklyGames.NAME, BlocklyGames.LEVEL);
  var inherited = inherit &&
      BlocklyGames.loadFromLocalStorage(BlocklyGames.NAME,
                                        BlocklyGames.LEVEL - 1);
  if (inherited && typeof inherit == 'function') {
    inherited = inherit(inherited);
  }

  var restore = loadOnce || savedLevel || inherited || defaultXml;
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
    var xml = Blockly.Xml.textToDom(code);
    // Clear the workspace to avoid merge.
    BlocklyInterface.workspace.clear();
    Blockly.Xml.domToWorkspace(xml, BlocklyInterface.workspace);
    BlocklyInterface.workspace.clearUndo();
  }
};

/**
 * Get the user's code (XML or JS) from the editor (Blockly or ACE).
 * @return {string} XML or JS code.
 */
BlocklyInterface.getCode = function() {
  if (BlocklyInterface.editor) {
    // Text editor.
    var text = BlocklyInterface.editor['getValue']();
  } else {
    // Blockly editor.
    var xml = Blockly.Xml.workspaceToDom(BlocklyInterface.workspace, true);
    // Remove x/y coordinates from XML if there's only one block stack.
    // There's no reason to store this, removing it helps with anonymity.
    if (BlocklyInterface.workspace.getTopBlocks(false).length == 1 &&
        xml.querySelector) {
      var block = xml.querySelector('block');
      if (block) {
        block.removeAttribute('x');
        block.removeAttribute('y');
      }
    }
    var text = Blockly.Xml.domToText(xml);
  }
  return text;
};

/**
 * Get the user's executable code as JS from the editor (Blockly or ACE).
 * @return {string} JS code.
 */
BlocklyInterface.getJsCode = function() {
  if (BlocklyInterface.blocksDisabled) {
    // Text editor.
    return BlocklyInterface.editor['getValue']();
  }
  // Blockly editor.
  return Blockly.JavaScript.workspaceToCode(BlocklyInterface.workspace);
};

/**
 * Monitor the block or JS editor.  If a change is made that changes the code,
 * clear the key from the URL.
 */
BlocklyInterface.codeChanged = function() {
  if (typeof BlocklyStorage == 'object' && BlocklyStorage.startCode !== null) {
    if (BlocklyStorage.startCode != BlocklyInterface.getCode()) {
      window.location.hash = '';
      BlocklyStorage.startCode = null;
    }
  }
};

/**
 * Inject Blockly workspace into page.
 * @param {!Object} options Dictionary of Blockly options.
 */
BlocklyInterface.injectBlockly = function(options) {
  var toolbox = document.getElementById('toolbox');
  if (toolbox) {
    options['toolbox'] = toolbox;
  }
  options['media'] = 'third-party/blockly/media/';
  options['oneBasedIndex'] = false;
  BlocklyInterface.workspace = Blockly.inject('blockly', options);
  BlocklyInterface.workspace.addChangeListener(BlocklyInterface.codeChanged);
};

/**
 * Save the blocks for this level to persistent client-side storage.
 */
BlocklyInterface.saveToLocalStorage = function() {
  // MSIE 11 does not support localStorage on file:// URLs.
  if (typeof Blockly == undefined || !window.localStorage) {
    return;
  }
  var name = BlocklyGames.NAME + BlocklyGames.LEVEL;
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
    window.location = window.location.protocol + '//' +
        window.location.host + window.location.pathname +
        '?lang=' + BlocklyGames.LANG + '&level=' + (BlocklyGames.LEVEL + 1);
  } else {
    BlocklyInterface.indexPage();
  }
};

/**
 * Highlight the block (or clear highlighting).
 * @param {?string} id ID of block that triggered this action.
 * @param {boolean=} opt_state If undefined, highlight specified block and
 * automatically unhighlight all others.  If true or false, manually
 * highlight/unhighlight the specified block.
 */
BlocklyInterface.highlight = function(id, opt_state) {
  if (id) {
    var m = id.match(/^block_id_([^']+)$/);
    if (m) {
      id = m[1];
    }
  }
  BlocklyInterface.workspace.highlightBlock(id, opt_state);
};

/**
 * Inject readonly Blockly.  Only inserts once.
 * @param {string} id ID of div to be injected into.
 * @param {string|!Array.<string>} xml XML string(s) describing blocks.
 */
BlocklyInterface.injectReadonly = function(id, xml) {
  var div = document.getElementById(id);
  if (!div.firstChild) {
    var rtl = BlocklyGames.isRtl();
    var workspace = Blockly.inject(div, {'rtl': rtl, 'readOnly': true});
    if (typeof xml != 'string') {
      xml = xml.join('');
    }
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), workspace);
  }
};

/**
 * Convert the user's code to raw JavaScript.
 * @param {string} code Generated code.
 * @return {string} The code without serial numbers.
 */
BlocklyInterface.stripCode = function(code) {
  // Strip out serial numbers.
  code = code.replace(/(,\s*)?'block_id_[^']+'\)/g, ')');
  return code.replace(/\s+$/, '');
};

/**
 * Determine if this event is unwanted.
 * @param {!Event} e Mouse or touch event.
 * @return {boolean} True if spam.
 */
BlocklyInterface.eventSpam = function(e) {
  // Touch screens can generate 'touchend' followed shortly thereafter by
  // 'click'.  For now, just look for this very specific combination.
  // Some devices have both mice and touch, but assume the two won't occur
  // within two seconds of each other.
  var touchMouseTime = 2000;
  if (e.type == 'click' &&
      BlocklyInterface.eventSpam.previousType_ == 'touchend' &&
      BlocklyInterface.eventSpam.previousDate_ + touchMouseTime > Date.now()) {
    e.preventDefault();
    e.stopPropagation();
    return true;
  }
  // Users double-click or double-tap accidentally.
  var doubleClickTime = 400;
  if (BlocklyInterface.eventSpam.previousType_ == e.type &&
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

/**
 * Load the JavaScript interpreter.
 * Defer loading until page is loaded and responsive.
 */
BlocklyInterface.importInterpreter = function() {
  function load() {
    //<script type="text/javascript"
    //  src="third-party/JS-Interpreter/compressed.js"></script>
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'third-party/JS-Interpreter/compressed.js';
    document.head.appendChild(script);
  }
  setTimeout(load, 1);
};

/**
 * Load the Prettify CSS and JavaScript.
 * Defer loading until page is loaded and responsive.
 */
BlocklyInterface.importPrettify = function() {
  function load() {
    //<link rel="stylesheet" type="text/css" href="common/prettify.css">
    //<script type="text/javascript" src="common/prettify.js"></script>
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'common/prettify.css';
    document.head.appendChild(link);
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'common/prettify.js';
    document.head.appendChild(script);
  }
  setTimeout(load, 1);
};
