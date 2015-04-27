/**
 * Blockly Games: Pond Database
 *
 * Copyright 2014 Google Inc.
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
 * @fileoverview Creates an pond programmable with JavaScript.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Pond.Db');

goog.require('Pond');
goog.require('Pond.Db.soy');
goog.require('Pond.Battle');
goog.require('Pond.Blocks');
goog.require('Pond.Visualization');
goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('goog.events');
goog.require('goog.ui.Tab');
goog.require('goog.ui.TabBar');


BlocklyGames.NAME = 'pond-db';

/**
 * Is the blocks editor the program source (true) or is the JS editor
 * the program source (false).
 * @private
 */
Pond.Db.blocksEnabled_ = true;

/**
 * ACE editor fires change events even on programatically caused changes.
 * This property is used to signal times when a programatic change is made.
 */
Pond.Db.ignoreEditorChanges_ = true;

/**
 * Initialize Ace and the pond.  Called on page load.
 */
Pond.Db.init = function() {
  // Render the Soy template.
  document.body.innerHTML = Pond.Db.soy.start({}, null,
      {lang: BlocklyGames.LANG,
       level: BlocklyGames.LEVEL,
       maxLevel: BlocklyGames.MAX_LEVEL,
       html: BlocklyGames.IS_HTML});

  Pond.init();

  // Setup the tabs.
  Pond.Db.tabbar = new goog.ui.TabBar();
  Pond.Db.tabbar.decorate(document.getElementById('tabbar'));

  var rtl = BlocklyGames.isRtl();
  var visualization = document.getElementById('visualization');
  var tabDiv = document.getElementById('tabarea');
  var aboutDiv = document.getElementById('about');
  var blocklyDiv = document.getElementById('blockly');
  var editorDiv = document.getElementById('editor');
  var divs = [aboutDiv, blocklyDiv, editorDiv];
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
      Blockly.fireUiEvent(window, 'resize');
    });
  window.addEventListener('resize', onresize);
  onresize();

  // Handle SELECT events dispatched by tabs.
  goog.events.listen(Pond.Db.tabbar, goog.ui.Component.EventType.SELECT,
      function(e) {
        var index = e.target.getParent().getSelectedTabIndex();
        Pond.Db.changeTab(index);
      });

  // Inject Blockly.
  var toolbox = document.getElementById('toolbox');
  BlocklyGames.workspace = Blockly.inject(document.getElementById('blockly'),
      {'media': 'media/',
       'rtl': false,
       'toolbox': toolbox,
       'trashcan': true});
  Blockly.JavaScript.addReservedWords('scan,cannon,drive,swim,stop,speed,' +
      'damage,health,loc_x,loc_y');

  var defaultXml =
      '<xml>' +
      '  <block type="pond_cannon" x="70" y="70">' +
      '    <value name="DEGREE">' +
      '      <block type="pond_math_number">' +
      '        <field name="NUM">0</field>' +
      '      </block>' +
      '    </value>' +
      '    <value name="RANGE">' +
      '      <block type="pond_math_number">' +
      '        <field name="NUM">70</field>' +
      '      </block>' +
      '    </value>' +
      '  </block>' +
      '</xml>';
  BlocklyInterface.loadBlocks(defaultXml);

  // Inject JS editor.
  var defaultCode = 'cannon(0, 70);';
  BlocklyInterface.editor = window['ace']['edit']('editor');
  BlocklyInterface.editor['setTheme']('ace/theme/chrome');
  BlocklyInterface.editor['setShowPrintMargin'](false);
  var session = BlocklyInterface.editor['getSession']();
  session['setMode']('ace/mode/javascript');
  session['setTabSize'](2);
  session['setUseSoftTabs'](true);
  session['on']('change', Pond.Db.editorChanged);

  BlocklyInterface.loadBlocks(defaultCode + '\n', BlocklyGames.LEVEL != 4);

  var players = [
    {
      start: new goog.math.Coordinate(20, 80),
      damage: 0,
      name: 'Pond_playerName',
      code: null
    },
    {
      start: new goog.math.Coordinate(80, 20),
      damage: 0,
      name: 'Pond_rookName',
      code: 'playerRook'
    },
    {
      start: new goog.math.Coordinate(20, 20),
      damage: 0,
      name: 'Pond_counterName',
      code: 'playerCounter'
    },
    {
      start: new goog.math.Coordinate(80, 80),
      damage: 0,
      name: 'Pond_sniperName',
      code: 'playerSniper'
    }
  ];

  for (var playerData, i = 0; playerData = players[i]; i++) {
    if (playerData.code) {
      var div = document.getElementById(playerData.code);
      var code = div.textContent;
    } else {
      var code = function() {
        if (Pond.Db.blocksEnabled_) {
          return Blockly.JavaScript.workspaceToCode(BlocklyGames.workspace);
        } else {
          return BlocklyInterface.editor['getValue']();
        }
      };
    }
    var name = BlocklyGames.getMsg(playerData.name);
    Pond.Battle.addPlayer(name, code, playerData.start, playerData.damage);
  }
  Pond.reset();
  Pond.Db.changeTab(0);
  Pond.Db.ignoreEditorChanges_ = false;
};

/**
 * Called by the tab bar when a tab is selected.
 * @param {number} index Which tab is now active (0-2).
 */
Pond.Db.changeTab = function(index) {
  var ABOUT = 0;
  var BLOCKS = 1;
  var JAVASCRIPT = 2;
  // Show the correct tab contents.
  var aboutDiv = document.getElementById('about');
  var blocklyDiv = document.getElementById('blockly');
  var editorDiv = document.getElementById('editor');
  var divs = [aboutDiv, blocklyDiv, editorDiv];
  for (var i = 0, div; div = divs[i]; i++) {
    div.style.visibility = (i == index) ? 'visible' : 'hidden';
  }
  // Synchronize the documentation popup.
  document.getElementById('docsButton').disabled = (index == ABOUT);
  if (index == ABOUT) {
    Pond.docsCloseClick();
  } else {
    BlocklyGames.LEVEL = (index == BLOCKS) ? 11 : 12;
    if (Pond.isDocsVisible_) {
      var frame = document.getElementById('frameDocs');
      frame.src = 'pond/docs.html?lang=' + BlocklyGames.LANG +
          '&mode=' + BlocklyGames.LEVEL;
    }
  }
  // Synchronize the JS editor.
  if (index == JAVASCRIPT && Pond.Db.blocksEnabled_) {
    var code = Blockly.JavaScript.workspaceToCode(BlocklyGames.workspace);
    Pond.Db.ignoreEditorChanges_ = true;
    BlocklyInterface.editor['setValue'](code, -1);
    Pond.Db.ignoreEditorChanges_ = false;
  }
};

/**
 * Change event for JS editor.  Warn the user, then disconnect the link from
 * blocks to JavaScript.
 */
Pond.Db.editorChanged = function() {
  if (Pond.Db.ignoreEditorChanges_) {
    return;
  }
  if (Pond.Db.blocksEnabled_) {
    if (!BlocklyGames.workspace.getTopBlocks(false).length ||
        confirm(BlocklyGames.getMsg('Pond_breakLink'))) {
      // Break link betweeen blocks and JS.
      Pond.Db.tabbar.getChildAt(1).setEnabled(false);
      Pond.Db.blocksEnabled_ = false;
    } else {
      // Abort change, preserve link.
      var code = Blockly.JavaScript.workspaceToCode(BlocklyGames.workspace);
      Pond.Db.ignoreEditorChanges_ = true;
      BlocklyInterface.editor['setValue'](code, -1);
      Pond.Db.ignoreEditorChanges_ = false;
    }
  } else {
    var code = BlocklyInterface.editor['getValue']();
    if (!code.trim()) {
      // Reestablish link between blocks and JS.
      BlocklyGames.workspace.clear();
      Pond.Db.tabbar.getChildAt(1).setEnabled(true);
      Pond.Db.blocksEnabled_ = true;
    }
  }
};

window.addEventListener('load', Pond.Db.init);
