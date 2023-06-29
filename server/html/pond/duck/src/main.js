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
goog.require('Blockly.Xml');
goog.require('Blockly.ZoomControls');
goog.require('BlocklyAce');
goog.require('BlocklyCode');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('Pond');
goog.require('Pond.Battle');
goog.require('Pond.Blocks');
goog.require('Pond.Duck.html');
goog.require('Pond.Visualization');


BlocklyGames.storageName = 'pond-duck';

/**
 * Array of editor tabs (Blockly and ACE).
 * @type Array<!Element>
 */
let editorTabs = null;

/**
 * ACE editor fires change events even on programmatically caused changes.
 * This property is used to signal times when a programmatic change is made.
 */
let ignoreEditorChanges_ = true;

/**
 * Currently selected avatar.
 * @type Pond.Avatar
 */
Pond.currentAvatar = null;

/**
 * Array of duck data that was loaded separately.
 * @type Array<!Object>
 */
let duckData = null;

/**
 * Indices of tabs.
 */
const tabIndex = {
  BLOCKS: 0,
  JAVASCRIPT: 1,
};

/**
 * Initialize Ace and the pond.  Called on page load.
 */
function init() {
  duckData = window['DUCKS'];
  Pond.Blocks.init();

  // Render the HTML.
  document.body.innerHTML = Pond.Duck.html.start(
      {lang: BlocklyGames.LANG,
       html: BlocklyGames.IS_HTML});

  Pond.init(BlocklyGames.getMsg('Games.pond', false));

  // Setup the tabs.
  function tabHandler(selectedIndex) {
    return function() {
      if (tabs[selectedIndex].classList.contains('tab-disabled')) {
        return;
      }
      changeTab(selectedIndex);
    };
  }
  const tabs = Array.prototype.slice.call(
      document.querySelectorAll('#editorBar>.tab'));
  editorTabs = tabs;
  for (let i = 0; i < tabs.length; i++) {
    BlocklyGames.bindClick(tabs[i], tabHandler(i));
  }

  const rtl = BlocklyGames.IS_RTL;
  const visualization = BlocklyGames.getElementById('visualization');
  const tabDiv = BlocklyGames.getElementById('tabarea');
  const blocklyDiv = BlocklyGames.getElementById('blockly');
  const editorDiv = BlocklyGames.getElementById('editor');
  const divs = [blocklyDiv, editorDiv];
  const onresize = function(_e) {
    const top = visualization.offsetTop;
    tabDiv.style.top = (top - window.pageYOffset) + 'px';
    tabDiv.style.left = rtl ? '10px' : '420px';
    tabDiv.style.width = (window.innerWidth - 440) + 'px';
    const divTop =
        Math.max(0, top + tabDiv.offsetHeight - window.pageYOffset) + 'px';
    const divLeft = rtl ? '10px' : '420px';
    const divWidth = (window.innerWidth - 440) + 'px';
    for (const div of divs) {
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
  const session = BlocklyAce.makeAceSession();
  session['on']('change', editorChanged);

  // Lazy-load the ESx-ES5 transpiler.
  BlocklyAce.importBabel();

  Blockly.JavaScript.addReservedWords('scan,cannon,drive,swim,stop,speed,' +
      'damage,health,loc_x,getX,loc_y,getY,log');

  const coordinates = [
    new Blockly.utils.Coordinate(20, 80),
    new Blockly.utils.Coordinate(80, 80),
    new Blockly.utils.Coordinate(20, 20),
    new Blockly.utils.Coordinate(80, 20),
  ];
  const avatarSelect = BlocklyGames.getElementById('avatar-select');
  for (let i = 0; i < duckData.length; i++) {
    const duckDatum = duckData[i];
    if (duckDatum['name'] === null) {
      duckDatum['name'] = BlocklyGames.getMsg('Pond.playerName', false);
    }
    const option = new Option(duckDatum['name'], duckDatum['id']);
    avatarSelect.add(option);

    const avatar = new Pond.Avatar(duckDatum['name'], coordinates[i], 0,
        duckDatum['editable'], Pond.Battle);
    if (duckDatum['blockly'] === undefined && duckDatum['js'] === undefined) {
      duckDatum['js'] = duckDatum['compiled'];
    }
    if (duckDatum['js']) {
      // Strip off any leading blank lines, and any trailing whitespace.
      duckDatum['js'] = duckDatum['js'].replace(/^\s*\n/, '').trimRight();
    }
    avatar.setCode(duckDatum['blockly'], duckDatum['js'], duckDatum['compiled']);
  }
  avatarSelect.addEventListener('change', changeAvatar);
  Pond.reset();
  if (avatarSelect) {
    changeAvatar();
  }
}

/**
 * Called by the avatar selector when changed.
 */
function changeAvatar() {
  ignoreEditorChanges_ = true;

  const avatarSelect = BlocklyGames.getElementById('avatar-select');
  const i = avatarSelect.selectedIndex;
  if (Pond.currentAvatar === Pond.Battle.AVATARS[i]) {
    return;
  }
  Pond.saveAvatar();
  Pond.currentAvatar = Pond.Battle.AVATARS[i];
  avatarSelect.style.backgroundColor =
      Pond.Visualization.getColour(Pond.currentAvatar);

  if (Pond.currentAvatar.blockly !== undefined) {
    if (BlocklyInterface.workspace) {
      BlocklyInterface.workspace.dispose();
    }
    BlocklyInterface.injectBlockly(
        {'rtl': false,
         'trashcan': true,
         'readOnly': !Pond.currentAvatar.editable,
         'zoom': {'controls': true, 'wheel': true}});
    const xml = Blockly.Xml.textToDom(Pond.currentAvatar.blockly);
    Blockly.Xml.domToWorkspace(xml, BlocklyInterface.workspace);
    BlocklyInterface.workspace.clearUndo();
    setBlocksDisabled(false);
    changeTab(tabIndex.BLOCKS);
  }

  if (Pond.currentAvatar.js !== undefined) {
    BlocklyInterface.editor['setValue'](Pond.currentAvatar.js, -1);
    setBlocksDisabled(true);
    changeTab(tabIndex.JAVASCRIPT);
  }
  BlocklyInterface.editor['setReadOnly'](!Pond.currentAvatar.editable);
  ignoreEditorChanges_ = false;
}

/**
 * Called by the tab bar when a tab is selected.
 * @param {number} index Which tab is now active (0-1).
 */
function changeTab(index) {
  // Change highlighting.
  for (let i = 0; i < editorTabs.length; i++) {
    if (index === i) {
      editorTabs[i].classList.add('tab-selected');
    } else {
      editorTabs[i].classList.remove('tab-selected');
    }
  }
  // Show the correct tab contents.
  const names = ['blockly', 'editor'];
  for (let i = 0; i < names.length; i++) {
    const div = BlocklyGames.getElementById(names[i]);
    div.style.visibility = (i === index) ? 'visible' : 'hidden';
  }
  Blockly.hideChaff(false);
  // Synchronize the documentation popup.
  BlocklyGames.getElementById('docsButton').disabled = false;
  BlocklyGames.LEVEL = (index === tabIndex.BLOCKS) ? 11 : 12;
  if (Pond.isDocsVisible_) {
    BlocklyGames.getElementById('frameDocs').src =
        `pond/docs.html?lang=${BlocklyGames.LANG}&mode=${BlocklyGames.LEVEL}`;
  }
  // Synchronize the JS editor.
  if (!ignoreEditorChanges_ && !BlocklyInterface.blocksDisabled &&
      index === tabIndex.JAVASCRIPT) {
    const code = Blockly.JavaScript.workspaceToCode(BlocklyInterface.workspace);
    ignoreEditorChanges_ = true;
    BlocklyInterface.editor['setValue'](code, -1);
    ignoreEditorChanges_ = false;
  }
}

/**
 * Change event for JS editor.  Warn the user, then disconnect the link from
 * blocks to JavaScript.
 */
function editorChanged() {
  if (ignoreEditorChanges_) {
    return;
  }
  const code = BlocklyCode.getJsCode();
  if (BlocklyInterface.blocksDisabled) {
    if (!code.trim()) {
      // Reestablish link between blocks and JS.
      BlocklyInterface.workspace.clear();
      setBlocksDisabled(false);
    }
  } else {
    if (!BlocklyInterface.workspace.getTopBlocks(false).length ||
        confirm(BlocklyGames.getMsg('Games.breakLink', false))) {
      // Break link between blocks and JS.
      setBlocksDisabled(true);
    } else {
      // Abort change, preserve link.
      ignoreEditorChanges_ = true;
      setTimeout(function() {
        BlocklyInterface.editor['setValue'](code, -1);
        ignoreEditorChanges_ = false;
      }, 0);
    }
  }
}

/**
 * Enable or disable the ability to use Blockly.
 * @param {boolean} disabled True if Blockly is disabled and JS is to be used.
 */
function setBlocksDisabled(disabled) {
  BlocklyInterface.blocksDisabled = disabled;
  const tab = editorTabs[tabIndex.BLOCKS];
  if (disabled) {
    tab.classList.add('tab-disabled');
  } else {
    tab.classList.remove('tab-disabled');
  }
}


(function() {
  //<script type="text/javascript" src="pond/duck/default-ducks.js"></script>
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'pond/duck/default-ducks.js';
  document.head.appendChild(script);
})();

BlocklyGames.callWhenLoaded(init);
