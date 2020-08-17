/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Creates a multi-user pond (duck page).
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Pond.Duck');

goog.require('Blockly.FlyoutButton');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.dom');
goog.require('Blockly.ZoomControls');
goog.require('BlocklyAce');
goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('Pond');
goog.require('Pond.Battle');
goog.require('Pond.Blocks');
goog.require('Pond.Duck.soy');
goog.require('Pond.Visualization');


BlocklyGames.NAME = 'pond-duck';

/**
 * Array of editor tabs (Blockly and ACE).
 * @type Array.<!Element>
 */
Pond.Duck.editorTabs = null;

/**
 * ACE editor fires change events even on programmatically caused changes.
 * This property is used to signal times when a programmatic change is made.
 */
Pond.Duck.ignoreEditorChanges_ = true;

/**
 * Currently selected avatar.
 * @type Pond.Avatar
 */
Pond.Duck.currentAvatar = null;

/**
 * Array of duck data that was loaded separately.
 * @type Array.<!Object>
 */
Pond.Duck.duckData = null;

/**
 * Initialize Ace and the pond.  Called on page load.
 */
Pond.Duck.init = function() {
  Pond.Duck.duckData = window['DUCKS'];
  // Render the Soy template.
  document.body.innerHTML = Pond.Duck.soy.start({}, null,
      {lang: BlocklyGames.LANG,
       html: BlocklyGames.IS_HTML});

  Pond.init();

  // Setup the tabs.
  function tabHandler(selectedIndex) {
    return function() {
      if (Blockly.utils.dom.hasClass(tabs[selectedIndex], 'tab-disabled')) {
        return;
      }
      for (var i = 0; i < tabs.length; i++) {
        if (selectedIndex == i) {
          Blockly.utils.dom.addClass(tabs[i], 'tab-selected');
        } else {
          Blockly.utils.dom.removeClass(tabs[i], 'tab-selected');
        }
      }
      Pond.Duck.changeTab(selectedIndex);
    };
  }
  var tabs = Array.prototype.slice.call(
      document.querySelectorAll('#editorBar>.tab'));
  for (var i = 0; i < tabs.length; i++) {
    BlocklyGames.bindClick(tabs[i], tabHandler(i));
  }
  Pond.Duck.editorTabs = tabs;

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
    for (var i = 0, div; (div = divs[i]); i++) {
      div.style.top = divTop;
      div.style.left = divLeft;
      div.style.width = divWidth;
    }
  };
  window.addEventListener('scroll', function() {
    onresize(null);
    Blockly.svgResize(BlocklyInterface.workspace);
  });
  window.addEventListener('resize', onresize);
  onresize(null);

  // Inject JS editor.
  var session = BlocklyAce.makeAceSession();
  session['on']('change', Pond.Duck.editorChanged);
  var defaultCode = 'cannon(0, 70);';
  BlocklyInterface.editor['setValue'](defaultCode, -1);

  // Lazy-load the ESx-ES5 transpiler.
  BlocklyAce.importBabel();

  // Inject Blockly.
  BlocklyInterface.injectBlockly(
      {'rtl': false,
       'trashcan': true,
       'zoom': {'controls': true, 'wheel': true}});
  Blockly.JavaScript.addReservedWords('scan,cannon,drive,swim,stop,speed,' +
      'damage,health,loc_x,getX,loc_y,getY,');
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
  var xml = Blockly.Xml.textToDom(defaultXml);
  // Clear the workspace to avoid merge.
  BlocklyInterface.workspace.clear();
  Blockly.Xml.domToWorkspace(xml, BlocklyInterface.workspace);
  BlocklyInterface.workspace.clearUndo();

  var coordinates = [
    new Blockly.utils.Coordinate(20, 80),
    new Blockly.utils.Coordinate(80, 80),
    new Blockly.utils.Coordinate(20, 20),
    new Blockly.utils.Coordinate(80, 20)
  ];
  var avatarSelect = document.getElementById('avatar-select');
  for (var duckData, i = 0; (duckData = Pond.Duck.duckData[i]); i++) {
    if (duckData.name === null) {
      duckData.name = BlocklyGames.getMsg('Pond_myName');
    }
    if (avatarSelect) {
      var option = new Option(duckData.name, duckData.id);
      avatarSelect.add(option);
    }

    if (duckData.es5) {
      var code = duckData.es5;
    } else {
      var code = Pond.Duck.getJsCode;
    }
    var avatar = new Pond.Avatar(duckData.name, coordinates[i], 0, i == 0,
        Pond.Battle);
    avatar.setCode(code);
  }
  avatarSelect.addEventListener('change', Pond.Duck.changeAvatar);
  Pond.reset();
  if (avatarSelect) {
    Pond.Duck.changeAvatar();
    // BUG: Setting the background colour of a select element causes the arrow
    // to disappear in Firefox:
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1298510
    avatarSelect.style.width = '0';
    setTimeout(function() {avatarSelect.style.width = 'auto';}, 0);
  }
  Pond.Duck.changeTab(0);
  Pond.Duck.ignoreEditorChanges_ = false;
};

/**
 * Get the user's executable code as JS from the editor (Blockly or ACE).
 * @return {string} JS code.
 */
Pond.Duck.getJsCode = function() {
  var code = BlocklyInterface.getJsCode();
  try {
    code = BlocklyAce.transpileToEs5(code) || code;
  } catch (e) {
    alert(e);
    throw Error('Your duck has an error:\n' + e);
  }
  return code;
};

/**
 * Called by the avatar selector when changed.
 */
Pond.Duck.changeAvatar = function() {
  var avatarSelect = document.getElementById('avatar-select');
  var i = avatarSelect.selectedIndex;
  if (Pond.Duck.currentAvatar == Pond.Battle.AVATARS[i]) {
    return;
  }
  Pond.Duck.currentAvatar = Pond.Battle.AVATARS[i];
  avatarSelect.style.backgroundColor =
      Pond.Visualization.getColour(Pond.Duck.currentAvatar);
};

/**
 * Called by the tab bar when a tab is selected.
 * @param {number} index Which tab is now active (0-1).
 */
Pond.Duck.changeTab = function(index) {
  var BLOCKS = 0;
  var JAVASCRIPT = 1;
  // Show the correct tab contents.
  var names = ['blockly', 'editor'];
  for (var i = 0, name; (name = names[i]); i++) {
    var div = document.getElementById(name);
    div.style.visibility = (i == index) ? 'visible' : 'hidden';
  }
  // Show/hide Blockly divs.
  var names = ['.blocklyTooltipDiv', '.blocklyToolboxDiv'];
  for (var i = 0, name; (name = names[i]); i++) {
    var div = document.querySelector(name);
    div.style.visibility = (index == BLOCKS) ? 'visible' : 'hidden';
  }
  // Synchronize the documentation popup.
  document.getElementById('docsButton').disabled = false;
  BlocklyGames.LEVEL = (index == BLOCKS) ? 11 : 12;
  if (Pond.isDocsVisible_) {
    var frame = document.getElementById('frameDocs');
    frame.src = 'pond/docs.html?lang=' + BlocklyGames.LANG +
        '&mode=' + BlocklyGames.LEVEL;
  }
  // Synchronize the JS editor.
  if (index == JAVASCRIPT && !BlocklyInterface.blocksDisabled) {
    var code = Blockly.JavaScript.workspaceToCode(BlocklyInterface.workspace);
    Pond.Duck.ignoreEditorChanges_ = true;
    BlocklyInterface.editor['setValue'](code, -1);
    Pond.Duck.ignoreEditorChanges_ = false;
  }
};

/**
 * Change event for JS editor.  Warn the user, then disconnect the link from
 * blocks to JavaScript.
 */
Pond.Duck.editorChanged = function() {
  if (Pond.Duck.ignoreEditorChanges_) {
    return;
  }
  var code = BlocklyInterface.getJsCode();
  if (BlocklyInterface.blocksDisabled) {
    if (!code.trim()) {
      // Reestablish link between blocks and JS.
      BlocklyInterface.workspace.clear();
      Blockly.utils.dom.removeClass(Pond.Duck.editorTabs[0], 'tab-disabled');
      BlocklyInterface.blocksDisabled = false;
    }
  } else {
    if (!BlocklyInterface.workspace.getTopBlocks(false).length ||
        confirm(BlocklyGames.getMsg('Games_breakLink'))) {
      // Break link between blocks and JS.
      Blockly.utils.dom.addClass(Pond.Duck.editorTabs[0], 'tab-disabled');
      BlocklyInterface.blocksDisabled = true;
    } else {
      // Abort change, preserve link.
      Pond.Duck.ignoreEditorChanges_ = true;
      BlocklyInterface.editor['setValue'](code, -1);
      Pond.Duck.ignoreEditorChanges_ = false;
    }
  }
};

(function() {
  //<script type="text/javascript" src="pond/duck/default-ducks.js"></script>
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'pond/duck/default-ducks.js';
  document.head.appendChild(script);
})();
window.addEventListener('load', Pond.Duck.init);
