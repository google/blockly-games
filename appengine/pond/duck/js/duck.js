/**
 * @license
 * Copyright 2014 Google LLC
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
 * @fileoverview Creates a multi-user pond (duck page).
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Pond.Duck');

goog.require('Blockly.FlyoutButton');
goog.require('Blockly.JavaScript');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.dom');
goog.require('Blockly.ZoomControls');
goog.require('BlocklyAce');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('Pond');
goog.require('Pond.Avatar');
goog.require('Pond.Battle');
goog.require('Pond.Blocks');

/**
 * Array of tabs.
 * @type Array.<!Element>
 */
Pond.Duck.tabs = null;

/**
 * Array of tab content.
 * @type Array.<!Element>
 */
Pond.Duck.tabContent = null;

/**
 * Object holding name of tabs to tab index.
 * @type {Object.<number>}
 */
Pond.Duck.TAB_INDEX = {
  BLOCKLY: 0,
  JAVASCRIPT: 1
};

/**
 * ACE editor fires change events even on programmatically caused changes.
 * This property is used to signal times when a programmatic change is made.
 */
Pond.Duck.ignoreEditorChanges_ = true;

/**
 * Starting positions for avatars.
 */
Pond.Duck.START_XY = [
  new Blockly.utils.Coordinate(10, 90),
  new Blockly.utils.Coordinate(90, 10),
  new Blockly.utils.Coordinate(10, 10),
  new Blockly.utils.Coordinate(90, 90),
  // Only first four positions are currently used.
  new Blockly.utils.Coordinate(50, 99),
  new Blockly.utils.Coordinate(50, 1),
  new Blockly.utils.Coordinate(1, 50),
  new Blockly.utils.Coordinate(99, 50),
  new Blockly.utils.Coordinate(50, 49)
];

/**
 * Initialize Ace and the pond.  Called on page load.
 */
Pond.Duck.init = function () {
  Pond.init();

  // Setup the tabs.
  Pond.Duck.tabs = Array.prototype.slice.call(
      document.querySelectorAll('#editorBar>.tab'));
  for(var i = 0, tab; (tab = Pond.Duck.tabs[i]); i++) {
    BlocklyGames.bindClick(tab, Pond.Duck.selectTab.bind(this, i));
  }
  Pond.Duck.tabContent = Array.prototype.slice.call(
      document.querySelectorAll('#tabarea>.tab-content'));

  var rtl = BlocklyGames.isRtl();
  var visualization = document.getElementById('visualization');
  var tabDiv = document.getElementById('tabarea');
  var onresize = function (e) {
    var top = visualization.offsetTop;
    tabDiv.style.top = (top - window.pageYOffset) + 'px';
    tabDiv.style.left = rtl ? '10px' : '420px';
    tabDiv.style.width = (window.innerWidth - 440) + 'px';
    var divTop =
        Math.max(0, top + tabDiv.offsetHeight - window.pageYOffset) + 'px';
    var divLeft = rtl ? '10px' : '420px';
    var divWidth = (window.innerWidth - 440) + 'px';
    for (var i = 0, div; (div = Pond.Duck.tabContent[i]); i++) {
      div.style.top = divTop;
      div.style.left = divLeft;
      div.style.width = divWidth;
    }
  };
  window.addEventListener('scroll', function () {
    onresize(null);
    Blockly.svgResize(BlocklyInterface.workspace);
  });
  window.addEventListener('resize', onresize);
  onresize(null);

  // Inject JS editor.
  var session = BlocklyAce.makeAceSession();
  session['on']('change', Pond.Duck.editorChanged);

  // Lazy-load the ESx-ES5 transpiler.
  BlocklyAce.importBabel();

  // Inject Blockly.
  BlocklyInterface.injectBlockly(
      {'rtl': false,
       'trashcan': true,
       'zoom': {'controls': true, 'wheel': true}});
  Blockly.JavaScript.addReservedWords('scan,cannon,drive,swim,stop,speed,' +
      'damage,health,loc_x,getX,loc_y,getY,');
};

/**
 * Returns default opponents for game.
 * The soy templates: playerRook, playerCounter, and playerSniper (templates
 * containing code for default opponents) must be loaded before calling this
 * method.
 * @return {Array.<Pond.Avatar>}
 */
Pond.Duck.getDefaultAvatars = function() {
  return [
    Pond.Avatar.createDefaultAvatar(
        'Pond_rookName', 'playerRook', Pond.Duck.START_XY[1]),
    Pond.Avatar.createDefaultAvatar(
        'Pond_counterName', 'playerCounter', Pond.Duck.START_XY[2]),
    Pond.Avatar.createDefaultAvatar(
        'Pond_sniperName', 'playerSniper', Pond.Duck.START_XY[3])
  ];
};

/**
 * Load default players for the the pond game.
 * @param {string=} [opt_currentPlayerName='Pond_myName'] The name of the currently loaded duck
 *     or the default name.
 */
Pond.Duck.loadDefaultAvatars = function (opt_currentPlayerName) {
  var avatars = [
    Pond.Avatar.createPlayerAvatar(
        opt_currentPlayerName || 'Pond_myName', Pond.Duck.START_XY[0])];
  Array.prototype.push.apply(avatars, Pond.Duck.getDefaultAvatars());
  Pond.Duck.loadAvatars(avatars);
};

/**
 * Load specified players to pond game.
 */
Pond.Duck.loadAvatars = function (avatars) {
  Pond.Battle.clearAvatars();
  for (var avatar, i = 0; (avatar = avatars[i]); i++) {
    Pond.Battle.addAvatar(avatar);
  }
  Pond.reset();
};

/**
 * Load default code to editors.
 */
Pond.Duck.loadDefaultCode = function () {
  var defaultCode = 'cannon(0, 70);';
  BlocklyInterface.editor['setValue'](defaultCode, -1);
  var defaultXml =
      '<xml>' +
      '<block type="pond_cannon" x="70" y="70">' +
      '<value name="DEGREE">' +
      '<shadow type="pond_math_number">' +
      '<mutation angle_field="true"></mutation>' +
      '<field name="NUM">0</field>' +
      '</shadow>' +
      '</value>' +
      '<value name="RANGE">' +
      '<shadow type="pond_math_number">' +
      '<mutation angle_field="false"></mutation>' +
      '<field name="NUM">70</field>' +
      '</shadow>' +
      '</value>' +
      '</block>' +
      '</xml>';

  Pond.Duck.setCode(defaultXml);
};

/**
 * Selects the tab at the specified index and triggers display of the
 * corresponding tab content.
 * @param {number} selectedIndex The index of the tab to select.
 */
Pond.Duck.selectTab = function(selectedIndex) {
  if (Blockly.utils.dom.hasClass(
      Pond.Duck.tabs[selectedIndex], 'tab-disabled')) {
    return;
  }
  for (var tab, i = 0; (tab = Pond.Duck.tabs[i]); i++) {
    if (selectedIndex == i) {
      Blockly.utils.dom.addClass(tab, 'tab-selected');
    } else {
      Blockly.utils.dom.removeClass(tab, 'tab-selected');
    }
  }
  Pond.Duck.changeTab(selectedIndex);
};

/**
 * Called by the tab bar when a tab is selected.
 * @param {number} index Which tab is now active.
 */
Pond.Duck.changeTab = function (index) {
  var BLOCKS = Pond.Duck.TAB_INDEX.BLOCKLY;
  var JAVASCRIPT =  Pond.Duck.TAB_INDEX.JAVASCRIPT;
  // Show the correct tab contents.
  for (var i = 0, el; (el = Pond.Duck.tabContent[i]); i++) {
    el.style.visibility = (i === index) ? 'visible' : 'hidden';
  }
  // Show/hide Blockly divs.
  var names = ['.blocklyTooltipDiv', '.blocklyToolboxDiv'];
  for (var i = 0, name; (name = names[i]); i++) {
    var div = document.querySelector(name);
    div.style.visibility = (index === BLOCKS) ? 'visible' : 'hidden';
  }
  if (index === BLOCKS || index === JAVASCRIPT) {
    // Synchronize the documentation popup.
    Pond.Duck.updateDocLanguage(index === BLOCKS);
    // Synchronize the JS editor.
    if (index === JAVASCRIPT && !BlocklyInterface.blocksDisabled) {
      Pond.Duck.setCode(BlocklyInterface.getJsCode(), true);
    }
  }
};

/**
 * Update programming language displayed in doc.
 * @param {boolean} isBlocks Whether to update the docs to Block language.
 */
Pond.Duck.updateDocLanguage = function (isBlocks) {
  document.getElementById('docsButton').disabled = false;
  BlocklyGames.LEVEL = isBlocks ? 11 : 12;
  if (Pond.isDocsVisible_) {
    var frame = document.getElementById('frameDocs');
    frame.src = 'pond/docs.html?lang=' + BlocklyGames.LANG +
        '&mode=' + BlocklyGames.LEVEL;
  }
};

/**
 * Change event for JS editor.  Warn the user, then disconnect the link from
 * blocks to JavaScript.
 */
Pond.Duck.editorChanged = function () {
  if (Pond.Duck.ignoreEditorChanges_) {
    return;
  }
  var code = BlocklyInterface.getJsCode();
  if (BlocklyInterface.blocksDisabled) {
    if (!code.trim()) {
      // Reestablish link between blocks and JS.
      BlocklyInterface.workspace.clear();
      Pond.Duck.setBlocksEnabled(true);
    }
    var saveBtn = document.getElementById('saveButton');
    if (saveBtn) {
      saveBtn.disabled = false;
    }
  } else {
    if (!BlocklyInterface.workspace.getTopBlocks(false).length ||
        confirm(BlocklyGames.getMsg('Games_breakLink'))) {
      // Break link between blocks and JS.
      Pond.Duck.setBlocksEnabled(false);
    } else {
      // Revert changes in JS editor.
      Pond.Duck.setCode(code, true);
    }
  }
};

/**
 * Set the given code (XML or JS) to the editor (Blockly or ACE).
 * @param {string} code XML or JS code.
 * @param {boolean=} opt_setJSOverride Whether to set Js editor, even if Blocks
 *    are not currently disabled.
 */
Pond.Duck.setCode = function(code, opt_setJSOverride) {
  Pond.Duck.ignoreEditorChanges_ = true;
  BlocklyInterface.setCode(code, opt_setJSOverride);
  Pond.Duck.ignoreEditorChanges_ = false;
};

/**
 * Disable or enable the block editor.
 */
Pond.Duck.setBlocksEnabled = function (enable) {
  if (enable) {
    Blockly.utils.dom.removeClass(
        Pond.Duck.tabs[Pond.Duck.TAB_INDEX.BLOCKLY], 'tab-disabled');
  } else {
    Blockly.utils.dom.addClass(
        Pond.Duck.tabs[Pond.Duck.TAB_INDEX.BLOCKLY], 'tab-disabled');
  }
  BlocklyInterface.blocksDisabled = !enable;
};
