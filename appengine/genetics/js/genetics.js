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
 * @fileoverview JavaScript for Blockly's Genetics application.
 * @author kozbial@google.com (Monica Kozbial)
 */
'use strict';

goog.provide('Genetics');

goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('Genetics.Blocks');
goog.require('Genetics.Cage');
goog.require('Genetics.Visualization');
goog.require('Genetics.soy');
goog.require('goog.ui.Tab');
goog.require('goog.ui.TabBar');


/**
 * The name of the app.
 * @type {string}
 */
BlocklyGames.NAME = 'genetics';

/**
 * Optional callback function for when a simulation ends.
 * @type function(number)
 */
Genetics.endSimulation = null;

/**
 * Is the blocks editor the program source (true) or is the JS editor
 * the program source (false).
 * @private
 */
Genetics.blocksEnabled_ = true;

/**
 * ACE editor fires change events even on programatically caused changes.
 * This property is used to signal times when a programatic change is made.
 * @private
 */
Genetics.ignoreEditorChanges_ = true;

/**
 * Initialize Blockly, Ace, and the cage.  Called on page load.
 */
Genetics.init = function() {
  // Render the Soy template.
  document.body.innerHTML = Genetics.soy.start({}, null,
      {
        lang: BlocklyGames.LANG,
        html: BlocklyGames.IS_HTML
      });

  BlocklyInterface.init();
  Genetics.Visualization.init();

  BlocklyGames.bindClick('runButton', Genetics.runButtonClick);
  BlocklyGames.bindClick('resetButton', Genetics.resetButtonClick);
  BlocklyGames.bindClick('docsButton', Genetics.docsButtonClick);
  BlocklyGames.bindClick('closeDocs', Genetics.docsCloseClick);

  // Lazy-load the JavaScript interpreter.
  setTimeout(BlocklyInterface.importInterpreter, 1);

  // Setup the tabs.
  Genetics.tabbar = new goog.ui.TabBar();
  Genetics.tabbar.decorate(document.getElementById('tabbar'));

  var rtl = BlocklyGames.isRtl();
  var visualization = document.getElementById('visualization');
  var tabDiv = document.getElementById('tabarea');
  var blocklyDiv = document.getElementById('blockly');
  var editorDiv = document.getElementById('editor');
  var divs = [blocklyDiv, editorDiv];
  var onresize = function(e) {
    var top = visualization.offsetTop;
    tabDiv.style.top = (top - window.pageYOffset) + 'px';
    tabDiv.style.left = rtl ? '10px' : '420px';
    tabDiv.style.width = (window.innerWidth - 440) + 'px';
    var divTop =
        Math.max(0, top + tabDiv.offsetHeight - window.pageYOffset) + 'px';
    var divLeft = rtl ? '10px' : '420px';
    var divWidth = (window.innerWidth - 440) + 'px';
    for (var i = 0, div; div = divs[i]; i++) {
      div.style.top = divTop;
      div.style.left = divLeft;
      div.style.width = divWidth;
    }
  };
  window.addEventListener('scroll', function() {
    onresize();
    Blockly.svgResize(BlocklyGames.workspace);
  });
  window.addEventListener('resize', onresize);
  onresize();

  // Handle SELECT events dispatched by tabs.
  goog.events.listen(Genetics.tabbar, goog.ui.Component.EventType.SELECT,
      function(e) {
        var index = e.target.getParent().getSelectedTabIndex();
        Genetics.changeTab(index);
      });

  // Inject JS editor.
  var defaultCode = '';
  BlocklyInterface.editor = window['ace']['edit']('editor');
  BlocklyInterface.editor['setTheme']('ace/theme/chrome');
  BlocklyInterface.editor['setShowPrintMargin'](false);
  BlocklyInterface.editor['setOptions']({
    'enableBasicAutocompletion': true,
    'enableSnippets': true,
    'enableLiveAutocompletion': false
  });
  var session = BlocklyInterface.editor['getSession']();
  session['setMode']('ace/mode/javascript');
  session['setTabSize'](2);
  session['setUseSoftTabs'](true);
  session['on']('change', Genetics.editorChanged);
  BlocklyInterface.editor['setValue'](defaultCode, -1);

  // Inject Blockly.
  var toolbox = document.getElementById('toolbox');
  BlocklyGames.workspace = Blockly.inject('blockly',
      {
        'media': 'third-party/blockly/media/',
        'rtl': false,
        'toolbox': toolbox,
        'trashcan': true,
        'zoom': {'controls': true, 'wheel': true}
      });
  // Disable blocks not within a function.
  BlocklyGames.workspace.addChangeListener(Blockly.Events.disableOrphans);
  Blockly.JavaScript.addReservedWords('pickFight,proposeMate,acceptMate');
  var defaultXml =
  '<xml>' +
    '<block type="genetics_pickFight" deletable="false" editable="false" ' +
        'x="0" y="150">' +
      '<comment pinned="false">' +
'Chooses and returns a mouse from mice to pick a fight with or null to ' +
    'choose no\n' +
'mouse and never fight again.\n' +
'Choosing to fight against itself will kill the mouse.\n' +
'@returns the mouse chosen to attempt to mate with or null if no mouse is ' +
    'chosen' +
      '</comment>' +
      '<value name="RETURN">' +
        '<shadow type="logic_null"></shadow>' +
      '</value>' +
    '</block>' +
    '<block type="genetics_proposeMate" deletable="false" editable="false" ' +
        'x="0" y="350">' +
      '<comment pinned="false">' +
'Chooses and returns a mouse from mice to attempt to mate with or null ' +
    'to choose\n' +
'no mouse and never mate again. If the mate chosen is valid and agrees to ' +
    'the\n' +
'request then a child will be born.\n' +
'@returns the mouse chosen to attempt to mate with or null if no mouse is ' +
    'chosen' +
      '</comment>' +
      '<value name="RETURN">' +
        '<shadow type="logic_null"></shadow>' +
      '</value>' +
    '</block>' +
    '<block type="genetics_acceptMate" deletable="false" editable="false" ' +
        'x="0" y="550">' +
      '<comment pinned="false">' +
'Returns true to agree to mate or false to decline.\n' +
'@param suitor the mouse requesting to mate\n' +
'@returns the the answer to the mating request' +
      '</comment>' +
      '<value name="RETURN">' +
        '<shadow type="logic_boolean">' +
          '<field name="BOOL">TRUE</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
  '</xml>';
  var xml = Blockly.Xml.textToDom(defaultXml);
  // Clear the workspace to avoid merge.
  BlocklyGames.workspace.clear();
  Blockly.Xml.domToWorkspace(xml, BlocklyGames.workspace);
  BlocklyGames.workspace.clearUndo();

  var players = [
    {
      name: 'Genetics_myName',
      code: null
    },
    {
      name: 'Genetics_simpleName',
      code: 'playerSimple'
    },
    {
      name: 'Genetics_aggressiveName',
      code: 'playerAggressive'
    },
    {
      name: 'Genetics_highBreedingName',
      code: 'playerHighBreeding'
    }
  ];
  for (var playerData, i = 0; playerData = players[i]; i++) {
    if (playerData.code) {
      var div = document.getElementById(playerData.code);
      var code = div.textContent;
    } else {
      var code = function() {
        if (Genetics.blocksEnabled_) {
          return Blockly.JavaScript.workspaceToCode(BlocklyGames.workspace);
        } else {
          return BlocklyInterface.editor['getValue']();
        }
      };
    }
    var name = BlocklyGames.getMsg(playerData.name);
    Genetics.Cage.addPlayer(name, code);
  }
  Genetics.reset();
  Genetics.changeTab(0);
  Genetics.ignoreEditorChanges_ = false;
};

/**
 * Is the documentation open?
 * @private
 */
Genetics.isDocsVisible_ = false;

/**
 * Open the documentation frame.
 */
Genetics.docsButtonClick = function() {
  // TODO(kozbial)
};

/**
 * Close the documentation frame.
 */
Genetics.docsCloseClick = function() {
  // TODO(kozbial)
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
  Genetics.reset();

  Genetics.Cage.start(Genetics.endSimulation);
  Genetics.Visualization.start();
};

/**
 * Reset the Genetics simulation and kill any pending tasks.
 */
Genetics.reset = function() {
  Genetics.Cage.reset();
  Genetics.Visualization.reset();
};

/**
 * Show the help pop-up.
 */
Genetics.showHelp = function() {
  // TODO(kozbial)
};

/**
 * Called by the tab bar when a tab is selected.
 * @param {number} index Which tab is now active (0-2).
 */
Genetics.changeTab = function(index) {
  var BLOCKS = 0;
  var JAVASCRIPT = 1;
  // Show the correct tab contents.
  var names = ['blockly', 'editor'];
  for (var i = 0, name; name = names[i]; i++) {
    var div = document.getElementById(name);
    div.style.visibility = (i == index) ? 'visible' : 'hidden';
  }
  // Show/hide Blockly divs.
  var names = ['.blocklyTooltipDiv', '.blocklyToolboxDiv'];
  for (var i = 0, name; name = names[i]; i++) {
    var div = document.querySelector(name);
    div.style.visibility = (index == BLOCKS) ? 'visible' : 'hidden';
  }
  BlocklyGames.LEVEL = (index == BLOCKS) ? 11 : 12;
  if (Genetics.isDocsVisible_) {
    var frame = document.getElementById('frameDocs');
    frame.src = 'genetics/docs.html?lang=' + BlocklyGames.LANG +
        '&mode=' + BlocklyGames.LEVEL;
  }
  // Synchronize the JS editor.
  if (index == JAVASCRIPT && Genetics.blocksEnabled_) {
    var code = Blockly.JavaScript.workspaceToCode(BlocklyGames.workspace);
    Genetics.ignoreEditorChanges_ = true;
    BlocklyInterface.editor['setValue'](code, -1);
    Genetics.ignoreEditorChanges_ = false;
  }
};

/**
 * Change event for JS editor.  Warn the user, then disconnect the link from
 * blocks to JavaScript.
 */
Genetics.editorChanged = function() {
  if (Genetics.ignoreEditorChanges_) {
    return;
  }
  if (Genetics.blocksEnabled_) {
    if (!BlocklyGames.workspace.getTopBlocks(false).length ||
        confirm(BlocklyGames.getMsg('Games_breakLink'))) {
      // Break link between blocks and JS.
      Genetics.tabbar.getChildAt(0).setEnabled(false);
      Genetics.blocksEnabled_ = false;
    } else {
      // Abort change, preserve link.
      var code = Blockly.JavaScript.workspaceToCode(BlocklyGames.workspace);
      Genetics.ignoreEditorChanges_ = true;
      BlocklyInterface.editor['setValue'](code, -1);
      Genetics.ignoreEditorChanges_ = false;
    }
  } else {
    var code = BlocklyInterface.editor['getValue']();
    if (!code.trim()) {
      // Reestablish link between blocks and JS.
      BlocklyGames.workspace.clear();
      Genetics.tabbar.getChildAt(0).setEnabled(true);
      Genetics.blocksEnabled_ = true;
    }
  }
};

/**
 * Prints messages sent from Visualization to console.
 * @param {string} msg The message to print.
 */
Genetics.log = function(msg) {
  console.log(msg);
};

window.addEventListener('load', Genetics.init);
