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

goog.require('Genetics.soy');
goog.require('Genetics.Blocks');
goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('Blockly.FieldDropdown');
goog.require('goog.ui.Tab');
goog.require('goog.ui.TabBar');


BlocklyGames.NAME = 'genetics';

/**
 * Is the blocks editor the program source (true) or is the JS editor
 * the program source (false).
 * @private
 */
Genetics.blocksEnabled_ = true;

/**
 * ACE editor fires change events even on programatically caused changes.
 * This property is used to signal times when a programatic change is made.
 */
Genetics.ignoreEditorChanges_ = true;

/**
 * Initialize Blocky, Ace, and the cage.  Called on page load.
 */
Genetics.init = function() {
  // Render the Soy template.
  document.body.innerHTML = Genetics.soy.start({}, null,
      {
        lang: BlocklyGames.LANG,
        html: BlocklyGames.IS_HTML
      });

  BlocklyInterface.init();
  // TODO init visualization

  // TODO bind button clicks

  // Lazy-load the JavaScript interpreter.
  setTimeout(BlocklyInterface.importInterpreter, 1);
  // Lazy-load the syntax-highlighting.
  setTimeout(BlocklyInterface.importPrettify, 1);

  // Setup the tabs.
  Genetics.tabbar = new goog.ui.TabBar();
  Genetics.tabbar.decorate(document.getElementById('tabbar'));

  var rtl = BlocklyGames.isRtl();
  var visualization = document.getElementById('visualization');
  var tabDiv = document.getElementById('tabarea');
  var blocklyDiv = document.getElementById('blockly');
  var editorDiv = document.getElementById('editor');
  var divs = [blocklyDiv, editorDiv];
  var onresize = function (e) {
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
  window.addEventListener('scroll', function () {
    onresize();
    Blockly.fireUiEvent(window, 'resize');
  });
  window.addEventListener('resize', onresize);
  onresize();

  // Handle SELECT events dispatched by tabs.
  goog.events.listen(Genetics.tabbar, goog.ui.Component.EventType.SELECT,
      function (e) {
        var index = e.target.getParent().getSelectedTabIndex();
        Genetics.changeTab(index);
      });

  // Inject JS editor.
  var defaultCode = '';
  BlocklyInterface.editor = window['ace']['edit']('editor');
  BlocklyInterface.editor['setTheme']('ace/theme/chrome');
  BlocklyInterface.editor['setShowPrintMargin'](false);
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
        'media': 'media/',
        'rtl': false,
        'toolbox': toolbox,
        'trashcan': true,
        'zoom': {'controls': true, 'wheel': true}
      });
  Blockly.JavaScript.addReservedWords('');
  var defaultXml =
  '<xml>' +
    '<block type="procedures_defreturn" deletable="false" editable="false" x="0" y="150">' +
      '<mutation>' +
        '<arg name="me"></arg>' +
        '<arg name="aliveMice"></arg>' +
      '</mutation>' +
      '<field name="NAME">pickFight</field>' +
      '<comment pinned="false" h="86" w="631">' +
'Chooses and returns mouse from aliveMice to pick a fight with or null to choose\n' +
'no mouse and never fight again.\n' +
'Choosing to fight against itself will kill the mouse.\n' +
'@param me the mouse picking a fight\n' +
'@param aliveMice all mice currently in cage\n' +
'@returns the mouse chosen to attempt to mate with or null if no mouse is chosen' +
      '</comment>' +
      '<value name="RETURN">' +
        '<shadow type="logic_null"></shadow>' +
      '</value>' +
    '</block>' +
    '<block type="procedures_defreturn" deletable="false" editable="false" x="0" y="350">' +
      '<mutation>' +
        '<arg name="me"></arg>' +
        '<arg name="aliveMice"></arg>' +
      '</mutation>' +
      '<field name="NAME">chooseMate</field>' +
      '<comment pinned="false" h="86" w="631">' +
'Chooses and returns mouse from aliveMice to attempt to mate with or null to\n' +
'choose no mouse and never mate again. If the mate chosen is valid and agrees to\n' +
'the request then a child will be born.\n' +
'@param me the mouse choosing a mate\n' +
'@param aliveMice all mice currently in cage\n' +
'@returns the mouse chosen to attempt to mate with or null if no mouse is chosen' +
      '</comment>' +
      '<value name="RETURN">' +
        '<shadow type="logic_null"></shadow>' +
      '</value>' +
    '</block>' +
    '<block type="procedures_defreturn" deletable="false" editable="false" x="0" y="550">' +
      '<mutation>' +
        '<arg name="suitor"></arg>' +
        '<arg name="me"></arg>' +
        '<arg name="aliveMice"></arg>' +
      '</mutation>' +
      '<field name="NAME">mateAnswer</field>' +
      '<comment pinned="false" h="86" w="631">' +
'Returns true to agree to mate or false to decline.\n' +
'@param suitor the mouse requesting to mate\n' +
'@param me the mouse choosing a mate\n' +
'@param aliveMice all mice currently in cage\n' +
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

  // TODO reset cage
  Genetics.changeTab(0);
  Genetics.ignoreEditorChanges_ = false;
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


window.addEventListener('load', Genetics.init);