/**
 * Blockly Games: Common code for interfacing with Blockly.
 *
 * Copyright 2013 Google Inc.
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
 * @fileoverview Common support code for Blockly apps.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('BlocklyInterface');

goog.require('BlocklyGames');
goog.require('BlocklyGames.Msg');
goog.require('Blockly');


/**
 * Text editor (used as an alternative to Blockly in advanced apps).
 * @type Object
 */
BlocklyInterface.editor = null;

/**
 * Common startup tasks for all apps.
 */
BlocklyInterface.init = function() {
  BlocklyGames.init();

  // Disable the link button if page isn't backed by App Engine storage.
  var linkButton = document.getElementById('linkButton');
  if ('BlocklyStorage' in window) {
    BlocklyStorage['HTTPREQUEST_ERROR'] =
        BlocklyGames.getMsg('Games_httpRequestError');
    BlocklyStorage['LINK_ALERT'] = BlocklyGames.getMsg('Games_linkAlert');
    BlocklyStorage['HASH_ERROR'] = BlocklyGames.getMsg('Games_hashError');
    BlocklyStorage['XML_ERROR'] = BlocklyGames.getMsg('Games_xmlError');
    // Swap out the BlocklyStorage's alert() for a nicer dialog.
    BlocklyStorage['alert'] = BlocklyGames.storageAlert;
    if (linkButton) {
      BlocklyGames.bindClick(linkButton, BlocklyStorage['link']);
    }
  } else if (linkButton) {
    linkButton.style.display = 'none';
  }

  var languageMenu = document.getElementById('languageMenu');
  languageMenu.addEventListener('change',
      BlocklyInterface.changeLanguage, true);
};

/**
 * Initialize Blockly for a readonly iframe.  Called on page load.
 * XML argument may be generated from the console with:
 * encodeURIComponent(Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(Blockly.mainWorkspace)).slice(5, -6))
 * @param {string} content XML encoding of Blocky blocks.
 */
BlocklyInterface.initReadonly = function(content) {
  // Render the Soy template.
  document.body.innerHTML = content;

  var div = document.getElementById('blockly');
  div.style.height = window.innerHeight + 'px';
  Blockly.inject(div,
      {media: 'media/',
       readOnly: true,
       rtl: BlocklyGames.isRtl(),
       scrollbars: false});

  // Add the blocks.
  var xml = BlocklyGames.getStringParamFromUrl('xml', '');
  BlocklyInterface.setCode('<xml>' + xml + '</xml>');
};

/**
 * Load blocks saved on App Engine Storage or in session/local storage.
 * @param {string} defaultXml Text representation of default blocks.
 * @param {boolean} inherit If true, load blocks from previous level.
 */
BlocklyInterface.loadBlocks = function(defaultXml, inherit) {
  if ('BlocklyStorage' in window && window.location.hash.length > 1) {
    // An href with #key triggers an AJAX call to retrieve saved blocks.
    BlocklyStorage['retrieveXml'](window.location.hash.substring(1));
    return;
  }

  // Language switching stores the blocks during the reload.
  var loadOnce = null;
  try {
    loadOnce = window.sessionStorage.loadOnceBlocks;
  } catch(e) {
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
    Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
  }
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
  if (BlocklyInterface.editor) {
    var text = BlocklyInterface.editor['getValue']();
  } else {
    var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
    var text = Blockly.Xml.domToText(xml);
  }
  window.localStorage[name] = text;
};

/**
 * Go to the index page.
 */
BlocklyInterface.indexPage = function() {
  window.location = (BlocklyGames.IS_HTML ? 'index.html' : './') +
      '?lang=' + BlocklyGames.LANG;
};

/**
 * Save the blocks and reload with a different language.
 */
BlocklyInterface.changeLanguage = function() {
  // Store the blocks for the duration of the reload.
  // MSIE 11 does not support sessionStorage on file:// URLs.
  if (window.sessionStorage) {
    if (BlocklyInterface.editor) {
      var text = BlocklyInterface.editor['getValue']();
    } else {
      var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
      var text = Blockly.Xml.domToText(xml);
    }
    window.sessionStorage.loadOnceBlocks = text;
  }

  BlocklyGames.changeLanguage();
};

/**
 * Highlight the block (or clear highlighting).
 * @param {?string} id ID of block that triggered this action.
 */
BlocklyInterface.highlight = function(id) {
  if (id) {
    var m = id.match(/^block_id_(\d+)$/);
    if (m) {
      id = m[1];
    }
  }
  Blockly.mainWorkspace.highlightBlock(id);
};

/**
 * Convert the user's code to raw JavaScript.
 * @param {string} code Generated code.
 * @return {string} The code without serial numbers and timeout checks.
 */
BlocklyInterface.stripCode = function(code) {
  // Strip out serial numbers.
  return code.replace(/(,\s*)?'block_id_\d+'\)/g, ')').trimRight();
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
 * Load the JavaScript interperter.
 */
BlocklyInterface.importInterpreter = function() {
  //<script type="text/javascript"
  //  src="js-read-only/JS-Interpreter/compiled.js"></script>
  var script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', 'js-read-only/JS-Interpreter/compiled.js');
  document.head.appendChild(script);
};

/**
 * Load the Prettify CSS and JavaScript.
 */
BlocklyInterface.importPrettify = function() {
  //<link rel="stylesheet" type="text/css" href="common/prettify.css">
  //<script type="text/javascript" src="common/prettify.js"></script>
  var link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('type', 'text/css');
  link.setAttribute('href', 'common/prettify.css');
  document.head.appendChild(link);
  var script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', 'common/prettify.js');
  document.head.appendChild(script);
};

// Export symbols that would otherwise be renamed by Closure compiler.
// storage.js is not compiled and calls setCode.
window['BlocklyInterface'] = BlocklyInterface;
BlocklyInterface['setCode'] = BlocklyInterface.setCode;
