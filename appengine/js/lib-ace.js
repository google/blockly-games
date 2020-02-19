/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Common support code for games that embed Ace.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('BlocklyAce');

goog.require('BlocklyInterface');


/**
 * Load the Babel transpiler.
 * Defer loading until page is loaded and responsive.
 */
BlocklyAce.importBabel = function() {
  function load() {
    //<script type="text/javascript"
    //  src="third-party/babel.min.js"></script>
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'third-party/babel.min.js';
    document.head.appendChild(script);
  }
  setTimeout(load, 1);
};

/**
 * Attempt to transpile user code to ES5.
 * @param {string} code User code that may contain ES6+ syntax.
 * @return {string|undefined} ES5 code, or undefined if Babel not loaded.
 * @throws SyntaxError if code is unparsable.
 */
BlocklyAce.transpileToEs5 = function(code) {
  if (typeof Babel != 'object') {
    return undefined;
  }
  var options = {
    'presets': ['es2015']
  };
  var fish = Babel.transform(code, options);
  return fish.code;
};


/**
 * Create an ACE editor, and return the session object.
 * @return {!Object} ACE session object
 */
BlocklyAce.makeAceSession = function() {
  var ace = window['ace'];
  ace['require']('ace/ext/language_tools');
  var editor = ace['edit']('editor');
  BlocklyInterface.editor = editor;
  editor['setTheme']('ace/theme/chrome');
  editor['setShowPrintMargin'](false);
  editor['setOptions']({
    'enableBasicAutocompletion': true,
    'enableLiveAutocompletion': true
  });
  var session = editor['getSession']();
  session['setMode']('ace/mode/javascript');
  session['setTabSize'](2);
  session['setUseSoftTabs'](true);
  session['on']('change', BlocklyInterface.codeChanged);
  BlocklyAce.removeUnsupportedKeywords_();
  return session;
};

/**
 * Remove keywords not supported by the JS-Interpreter.
 * This trims out bogus entries in the autocomplete.
 * @private
 */
BlocklyAce.removeUnsupportedKeywords_ = function() {
  var keywords = BlocklyInterface.editor['getSession']()['getMode']()['$highlightRules']['$keywordList'];
  if (keywords) {
    keywords.splice(0, Infinity, 'arguments', 'this', 'NaN', 'Math', 'JSON',
        'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'eval', 'String',
        'RegExp', 'Object', 'Number', 'Function', 'Date', 'Boolean', 'Array',
        'while', 'var', 'let', 'typeof', 'try', 'throw', 'switch', 'return',
        'new', 'instanceof', 'of', 'in', 'if', 'function', 'for', 'finally',
        'else', 'do', 'delete', 'continue', 'catch', 'case', 'break', 'const',
        'undefined', 'Infinity', 'null', 'false', 'true');
  } else {
    // Keyword list doesn't appear until after the JS mode is loaded.
    // Keep polling until it shows up.
    setTimeout(BlocklyAce.removeUnsupportedKeywords_,
        BlocklyAce.removeUnsupportedKeywords_.delay_ *= 2);
  }
};

/**
 * Exponential back-off for polling.  Start at 1ms.
 * @private
 */
BlocklyAce.removeUnsupportedKeywords_.delay_ = 1;
