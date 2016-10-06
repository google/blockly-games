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
 * @fileoverview JavaScript for Blockly's Genetics game application and level
 * specific logic.
 * @author kozbial@google.com (Monica Kozbial)
 */
'use strict';

goog.provide('Genetics');

goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('Genetics.Blocks');
goog.require('Genetics.Cage');
goog.require('Genetics.Mouse');
goog.require('Genetics.MouseAvatar');
goog.require('Genetics.Visualization');
goog.require('Genetics.soy');
goog.require('goog.array');
goog.require('goog.ui.Tab');
goog.require('goog.ui.TabBar');


/**
 * The name of the app.
 * @const {string}
 */
BlocklyGames.NAME = 'genetics';

/**
 * Is the blocks editor the program source (true) or is the JS editor
 * the program source (false).
 * @private {boolean}
 */
Genetics.blocksEnabled_ = true;

/**
 * ACE editor fires change events even on programatically caused changes.
 * This property is used to signal times when a programatic change is made.
 * @private {boolean}
 */
Genetics.ignoreEditorChanges_ = true;

/**
 * Initialize Blockly, Ace, and the cage.  Called on page load.
 */
Genetics.init = function() {
  // Render the Soy template.
  document.body.innerHTML = Genetics.soy.start({}, null,
      {lang: BlocklyGames.LANG,
       level: BlocklyGames.LEVEL,
       maxLevel: BlocklyGames.MAX_LEVEL,
       html: BlocklyGames.IS_HTML});

  BlocklyInterface.init();
  Genetics.Visualization.init();

  BlocklyGames.bindClick('runButton', Genetics.runButtonClick);
  BlocklyGames.bindClick('resetButton', Genetics.resetButtonClick);
  BlocklyGames.bindClick('docsButton', Genetics.docsButtonClick);
  BlocklyGames.bindClick('closeDocs', Genetics.docsCloseClick);

  // Lazy-load the JavaScript interpreter.
  setTimeout(BlocklyInterface.importInterpreter, 1);

  if (BlocklyGames.LEVEL > 8) {
    // Setup the tabs.
    Genetics.tabbar = new goog.ui.TabBar();
    Genetics.tabbar.decorate(document.getElementById('tabbar'));

    // Handle SELECT events dispatched by tabs.
    goog.events.listen(Genetics.tabbar, goog.ui.Component.EventType.SELECT,
        function(e) {
          var index = e.target.getParent().getSelectedTabIndex();
          Genetics.changeTab(index);
        });
  }

  BlocklyGames.bindClick('helpButton', Genetics.showHelp);
  if (location.hash.length < 2 &&
      !BlocklyGames.loadFromLocalStorage(BlocklyGames.NAME,
          BlocklyGames.LEVEL)) {
    setTimeout(Genetics.showHelp, 1000);
  }

  var rtl = BlocklyGames.isRtl();
  var visualization = document.getElementById('visualization');
  var tabDiv = document.getElementById('tabarea');
  var blocklyDiv = document.getElementById('blockly');
  var editorDiv = document.getElementById('editor');
  if (editorDiv && blocklyDiv) {
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
  } else {
    var mainEditorDiv = blocklyDiv || editorDiv;
    var onresize = function(e) {
      var top = visualization.offsetTop;
      mainEditorDiv.style.top = Math.max(10, top - window.pageYOffset) + 'px';
      mainEditorDiv.style.left = rtl ? '10px' : '420px';
      mainEditorDiv.style.width = (window.innerWidth - 440) + 'px';
    };
  }

  window.addEventListener('scroll', function() {
    onresize();
    Blockly.svgResize(BlocklyGames.workspace);
  });
  window.addEventListener('resize', onresize);
  onresize();

  if (editorDiv) {
    // Inject JS editor.
    // Remove the container for source code in the 'done' dialog.
    var containerCode = document.getElementById('containerCode');
    containerCode.parentNode.removeChild(containerCode);

    var defaultCode = '';
    switch (BlocklyGames.LEVEL) {
      case 2:
        defaultCode =
           ['/**\n',
            ' * Return the last mouse from getMice().\n',
            ' * @return {Mouse|null} The mouse chosen to fight with.\n',
            ' */\n',
            'function pickFight() {\n',
            '  return null;\n',
            '}'].join('');
        break;
      case 4:
        defaultCode =
           ['/**\n',
            ' * Return a mouse from getMice() that is smaller than itself.\n',
            ' * @return {Mouse|null} The mouse chosen to fight with.\n',
            ' */\n',
            'function pickFight() {\n',
            '  for (var i = 0; i < getMice().length; i++) {\n',
            '    var mouse = getMice()[i];\n',
            '  }\n',
            '  return null;\n',
            '}'].join('');
        break;
      case 6:
        defaultCode =
           ['/**\n',
            ' * Return a mouse from getMice() that is fertile, of the ',
            'opposite sex,\n',
            ' * and bigger than itself.\n',
            ' * @return {Mouse|null} The mouse chosen to attempt to mate with.',
            '\n',
            ' */\n',
            'function proposeMate() {\n',
            '  for (var i = 0; i < getMice().length; i++) {\n',
            '    var mouse = getMice()[i];\n',
            '  }\n',
            '  return null;\n',
            '}'].join('');
        break;
      case 8:
        defaultCode =
           ['/**\n',
            ' *  Return true if the suitor mouse is of the opposite sex and ',
            'bigger than itself.\n',
            ' *  @param {Mouse} suitor the mouse requesting to mate.\n',
            ' *  @return {Boolean} Whether the mate request is accepted.\n',
            ' */\n',
            'function acceptMate(suitor) {\n',
            '  return false;\n',
            '}'].join('');
        break;
    }
    BlocklyInterface.editor = window['ace']['edit']('editor');
    BlocklyInterface.editor['setTheme']('ace/theme/chrome');
    BlocklyInterface.editor['setShowPrintMargin'](false);
    var session = BlocklyInterface.editor['getSession']();
    session['setMode']('ace/mode/javascript');
    session['setTabSize'](2);
    session['setUseSoftTabs'](true);
    session['on']('change', Genetics.editorChanged);
    if (defaultCode) {
      BlocklyInterface.loadBlocks(defaultCode + '\n', false);
    }
  }

  if (blocklyDiv) {
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

    var defaultXml;
    switch (BlocklyGames.LEVEL) {
      case 1:
        defaultXml =
           ['<xml>',
              '<block type="genetics_pickFight" deletable="false" ',
                  'editable="false" x="0" y="150">',
                '<comment pinned="true">',
                'Return the first mouse from getMice().\n',
                '@return {Mouse|null} The mouse chosen to fight with.',
                '</comment>',
              '</block>',
            '</xml>'].join('');
        break;
      case 3:
        defaultXml =
           ['<xml>',
              '<block type="genetics_pickFight" deletable="false" ',
                  'editable="false" x="0" y="150">',
                '<comment pinned="true">',
                'Return a mouse from getMice() that is smaller than 2.\n',
                '@return {Mouse|null} The mouse chosen to fight with.',
                '</comment>',
                '<statement name="STACK">',
                  '<block type="controls_for">',
                    '<field name="VAR">i</field>',
                    '<value name="FROM">',
                      '<shadow type="math_number">',
                        '<field name="NUM">0</field>',
                      '</shadow>',
                    '</value>',
                    '<value name="TO">',
                      '<shadow type="lists_length">',
                        '<value name="VALUE">',
                          '<shadow type="genetics_getMice"></shadow>',
                        '</value>',
                      '</shadow>',
                    '</value>',
                    '<statement name="DO">',
                      '<block type="variables_set" >',
                        '<field name="VAR">mouse</field>',
                        '<value name="VALUE">',
                          '<block type="lists_getIndex">',
                            '<field name="MODE">GET</field>',
                            '<field name="WHERE">FROM_START</field>',
                            '<value name="VALUE">',
                              '<block type="genetics_getMice"></block>',
                            '</value>',
                            '<value name="AT">',
                              '<block type="variables_get">',
                                '<field name="VAR">i</field>',
                              '</block>',
                            '</value>',
                          '</block>',
                        '</value>',
                      '</block>',
                    '</statement>',
                  '</block>',
                '</statement>',
              '</block>',
            '</xml>'].join('');
        break;
      case 5:
        defaultXml =
           ['<xml>',
              '<block type="genetics_proposeMate" deletable="false" ',
                  'editable="false" x="0" y="150">',
                '<comment pinned="true">',
                'Return a mouse from getMice() that is fertile and of the ',
                    'opposite sex.\n',
                '@return {Mouse|null} The mouse chosen to attempt to mate ',
                    'with.',
                '</comment>',
                '<statement name="STACK">',
                  '<block type="controls_for">',
                    '<field name="VAR">i</field>',
                    '<value name="FROM">',
                      '<shadow type="math_number">',
                        '<field name="NUM">0</field>',
                      '</shadow>',
                    '</value>',
                    '<value name="TO">',
                      '<shadow type="lists_length">',
                        '<value name="VALUE">',
                          '<shadow type="genetics_getMice"></shadow>',
                        '</value>',
                      '</shadow>',
                    '</value>',
                    '<statement name="DO">',
                      '<block type="variables_set" >',
                        '<field name="VAR">mouse</field>',
                        '<value name="VALUE">',
                          '<block type="lists_getIndex">',
                            '<field name="MODE">GET</field>',
                            '<field name="WHERE">FROM_START</field>',
                            '<value name="VALUE">',
                              '<block type="genetics_getMice"></block>',
                            '</value>',
                            '<value name="AT">',
                              '<block type="variables_get">',
                                '<field name="VAR">i</field>',
                              '</block>',
                            '</value>',
                          '</block>',
                        '</value>',
                      '</block>',
                    '</statement>',
                  '</block>',
                '</statement>',
              '</block>',
            '</xml>'].join('');
        break;
      case 7:
        defaultXml =
           ['<xml>',
              '<block type="genetics_acceptMate" deletable="false" ',
                  'editable="false" x="0" y="150">',
                '<comment pinned="true">',
                'Return true if the suitor mouse is of the opposite sex.\n',
                '@param {Mouse} suitor the mouse requesting to mate.\n',
                '@return {Boolean} Whether the mate request is accepted.',
                '</comment>',
              '</block>',
            '</xml>'].join('');
        break;
    }
    if (defaultXml) {
      BlocklyInterface.loadBlocks(defaultXml, false);
    }
  }

  Blockly.JavaScript.addReservedWords('pickFight,proposeMate,acceptMate');

  if (tabDiv) {
    var defaultXml =
       ['<xml>',
          '<block type="genetics_pickFight" deletable="false" ',
              'editable="true" x="0" y="150">',
            '<comment pinned="false" h="65" w="560">',
            'Return a mouse from cage to pick a fight with. Returning itself ',
                'will kill the mouse and returning null will result in no ',
                'fights.\n',
            '@return {Mouse|null} The mouse chosen to fight with.',
            '</comment>',
            '<value name="RETURN">',
              '<shadow type="logic_null"></shadow>',
            '</value>',
          '</block>',
          '<block type="genetics_proposeMate" deletable="false" ',
              'editable="true" x="0" y="350">',
            '<comment pinned="false" h="80" w="590">',
            'Return a mouse from cage to attempt to mate with. If the mate ',
                'chosen accepts, is fertile, and is of the opposite sex, ',
                'then a child will be born.\n',
            '@return {Mouse|null} The mouse chosen to attempt to mate with.',
            '</comment>',
            '<value name="RETURN">',
              '<shadow type="logic_null"></shadow>',
            '</value>',
          '</block>',
          '<block type="genetics_acceptMate" deletable="false" ',
              'editable="true" x="0" y="550">',
            '<comment pinned="false" h="80" w="560">',
            'Return true to agree to a mate request or false to decline a ',
                'mate request.\n',
            '@param {Mouse} suitor the mouse requesting to mate.\n',
            '@return {Boolean} Whether the mate request is accepted.',
            '</comment>',
            '<value name="RETURN">',
              '<shadow type="logic_boolean">',
                '<field name="BOOL">TRUE</field>',
              '</shadow>',
            '</value>',
          '</block>',
        '</xml>'].join('');
    var xml = Blockly.Xml.textToDom(defaultXml);
    // Clear the workspace to avoid merge.
    BlocklyGames.workspace.clear();
    Blockly.Xml.domToWorkspace(xml, BlocklyGames.workspace);
    BlocklyGames.workspace.clearUndo();
  }

  Genetics.blocksEnabled_ = blocklyDiv != null;

  // Set level specific settings in Cage.
  var players;
  if (BlocklyGames.LEVEL <= 8) {
    players = [
      {
        name: 'Genetics_myName',
        code: null
      },
      {
        name: 'Genetics_tutorEnemy',
        code: 'playerTutor'
      },
      {
        name: 'Genetics_tutorEnemy',
        code: 'playerTutor'
      },
      {
        name: 'Genetics_tutorEnemy',
        code: 'playerTutor'
      }
    ];
    Genetics.Visualization.wanderAfterMate = false;
    Genetics.Cage.historyPreserved = true;
    Genetics.Cage.discreteFights = true;
    Genetics.Cage.soloPlayerMouse = BlocklyGames.LEVEL <= 6;
    Genetics.Cage.skipPickFight = BlocklyGames.LEVEL >= 5;
    Genetics.Cage.ignorePlayerMouse =
        BlocklyGames.LEVEL == 7 || BlocklyGames.LEVEL == 8;
    Genetics.Cage.prependedCode =
        document.getElementById('playerTutor').textContent;
  } else if (BlocklyGames.LEVEL == 9) {
    players = [
      {
        name: 'Genetics_myName',
        code: null
      },
      {
        name: 'Genetics_simpleName',
        code: 'playerSimple'
      },
      {
        name: 'Genetics_simpleName',
        code: 'playerSimple'
      },
      {
        name: 'Genetics_simpleName',
        code: 'playerSimple'
      }
    ];
  } else {  // BlocklyGames.LEVEL == 10
    players = [
      {
        name: 'Genetics_myName',
        code: null
      },
      {
        name: 'Genetics_aggressiveName',
        code: 'playerAggressive'
      },
      {
        name: 'Genetics_highBreedingName',
        code: 'playerHighBreeding'
      },
      {
        name: 'Genetics_simpleName',
        code: 'playerSimple'
      }
    ];
  }
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
  if (tabDiv) {
    Genetics.changeTab(0);
    Genetics.ignoreEditorChanges_ = false;
  }
};

/**
 * Determines the starting mice in the game based on the level and adds them
 * to the game.
 */
Genetics.addStartingMice = function() {
  var startingMice;
  if (BlocklyGames.LEVEL == 1) {
    startingMice = [
      {
        // Create player mouse.
        id: 0,
        playerId: 0,
        x: 200,
        y: 300,
        direction: -Math.PI / 2,
        size: 2,
        aggressiveness: 1
      },
      {
        // Create bigger mouse.
        id: 1,
        playerId: 3,
        x: 300,
        y: 100,
        direction: Math.PI / 2,
        size: 3
      },
      {
        // Create same size mouse.
        id: 2,
        playerId: 2,
        x: 200,
        y: 100,
        direction: Math.PI / 2,
        size: 2
      },
      {
        // Create smaller mouse.
        id: 3,
        playerId: 1,
        x: 100,
        y: 100,
        direction: Math.PI / 2,
        size: 1
      }
    ];
  } else if (BlocklyGames.LEVEL == 2) {
    startingMice = [
      {
        // Create player mouse.
        id: 0,
        playerId: 0,
        x: 200,
        y: 300,
        direction: -Math.PI / 2,
        size: 2,
        aggressiveness: 1
      },
      {
        // Create smaller mouse.
        id: 1,
        playerId: 3,
        x: 300,
        y: 100,
        direction: Math.PI / 2,
        size: 1
      },
      {
        // Create same size mouse.
        id: 2,
        playerId: 2,
        x: 200,
        y: 100,
        direction: Math.PI / 2,
        size: 2
      },
      {
        // Create bigger mouse.
        id: 3,
        playerId: 1,
        x: 100,
        y: 100,
        direction: Math.PI / 2,
        size: 2
      }
    ];
  } else if (BlocklyGames.LEVEL <= 4) {
    startingMice = [
      {
        // Create player mouse.
        id: 0,
        playerId: 0,
        x: 200,
        y: 200,
        direction: -Math.PI / 2,
        size: 2,
        aggressiveness: 3
      },
      {
        // Create bigger mouse.
        id: 1,
        playerId: 1,
        x: 150,
        y: 100,
        direction: Math.PI / 2,
        size: 3
      },
      {
        // Create bigger mouse.
        id: 2,
        playerId: 2,
        x: 250,
        y: 300,
        direction: Math.PI / 2,
        size: 3
      },
      {
        // Create same size mouse.
        id: 3,
        playerId: 3,
        x: 300,
        y: 200,
        direction: Math.PI / 2,
        size: 2
      },
      {
        // Create smaller mouse.
        id: 4,
        playerId: 1,
        x: 250,
        y: 100,
        direction: Math.PI / 2,
        size: 1
      },
      {
        // Create smaller mouse.
        id: 5,
        playerId: 2,
        x: 150,
        y: 300,
        direction: Math.PI / 2,
        size: 1
      },
      {
        // Create smaller mouse.
        id: 6,
        playerId: 3,
        x: 100,
        y: 200,
        direction: Math.PI / 2,
        size: 1
      }
    ];
    goog.array.shuffle(startingMice);
  } else if (BlocklyGames.LEVEL <= 8) {
    startingMice = [
      {
        // Create player mouse.
        id: 0,
        playerId: 0,
        x: 200,
        y: 200,
        direction: -Math.PI / 2,
        size: 2,
        fertility: 5
      },
      {
        // Create bigger mouse.
        id: 1,
        playerId: 1,
        x: 150,
        y: 100,
        direction: Math.PI / 2,
        size: 3,
        sex: Genetics.Mouse.Sex.MALE
      },
      {
        // Create bigger mouse.
        id: 2,
        playerId: 2,
        x: 250,
        y: 300,
        direction: Math.PI / 2,
        size: 3,
        sex: Genetics.Mouse.Sex.FEMALE
      },
      {
        // Create bigger mouse.
        id: 3,
        playerId: 3,
        x: 300,
        y: 200,
        direction: Math.PI / 2,
        size: 3,
        sex: Genetics.Mouse.Sex.MALE
      },
      {
        // Create bigger mouse.
        id: 4,
        playerId: 1,
        x: 250,
        y: 100,
        direction: Math.PI / 2,
        size: 3,
        sex: Genetics.Mouse.Sex.FEMALE
      },
      {
        // Create same size mouse.
        id: 5,
        playerId: 2,
        x: 150,
        y: 300,
        direction: Math.PI / 2,
        size: 2,
        sex: Genetics.Mouse.Sex.FEMALE
      },
      {
        // Create same size mouse.
        id: 6,
        playerId: 3,
        x: 100,
        y: 200,
        direction: Math.PI / 2,
        size: 2,
        sex: Genetics.Mouse.Sex.MALE
      }
    ];
    goog.array.shuffle(startingMice);
  } else {  // BlocklyGames.LEVEL >= 9
    startingMice = [];
    var mouseId = 0;
    for (var playerId = 0; playerId < 4; playerId++) {
      for (var i = 0; i < 2; i++) {
        startingMice.push({
          id: mouseId++,
          sex: (i % 2 == 0) ? Genetics.Mouse.Sex.MALE :
              Genetics.Mouse.Sex.FEMALE,
          playerId: playerId
        });
      }
    }
    goog.array.shuffle(startingMice);
  }
  for (var i = 0, mouseStats; mouseStats = startingMice[i]; i++) {
    var sex = mouseStats.sex ||
        ((goog.math.randomInt(2) == 0) ? Genetics.Mouse.Sex.MALE :
            Genetics.Mouse.Sex.FEMALE);
    var mouse = new Genetics.Mouse(mouseStats.id, sex, mouseStats.playerId);
    // Set other mouse attributes if a value was declared.
    if (mouseStats.size != null) {
      mouse.size = mouseStats.size;
    }
    if (mouseStats.fertility != null) {
      mouse.fertility = mouseStats.fertility;
    }
    if (mouseStats.aggressiveness != null) {
      mouse.aggressiveness = mouseStats.aggressiveness;
    }
    Genetics.Cage.addMouse(mouse);
    if (BlocklyGames.LEVEL <= 8) {
      Genetics.Visualization.addMouse(mouse, mouseStats.x, mouseStats.y,
          mouseStats.direction);
    } else {
      new Genetics.Cage.Event('ADD', mouse).addToQueue();
    }
  }
};

/**
 * Returns whether the game is over and adds events to the event queue if it is.
 * Handles Genetics levels 1 to 8 only.
 * @return {boolean}
 */
Genetics.checkForLevelEnd = function() {
  switch (BlocklyGames.LEVEL) {
    case 1:
      // Player was asked to return the first mouse from the list (which also
      // happens to be the only mouse smaller than the player mouse).
      // fallthrough
    case 2:
      // Player was asked to return the last mouse from the list (which also
      // happens to be the only mouse smaller than the player mouse).
      // Case 1 and Case 2
      for (var i = 0, event; event = Genetics.Cage.Events[i]; i++) {
        // This level should have only one fight event.
        if (event['TYPE'] == 'FIGHT') {
          new Genetics.Cage.Event('END_GAME',
              event['RESULT'] == 'WIN').addToQueue();
          return true;
        } else if (event['TYPE'] != 'START_GAME' &&
            event['TYPE'] != 'NEXT_ROUND') {
          // If an unexpected event occurred, then the level is failed.
          new Genetics.Cage.Event('END_GAME', false).addToQueue();
          return true;
        }
      }
      return false;
    case 3:
      // Player was asked to return a mouse that is smaller than two. They
      // succeed if they win 3 fights.
      // fallthrough
    case 4:
      // Player was asked to return a mouse that is smaller than itself. They
      // succeed if they win 3 fights.
      // Case 3 and Case 4
      var successfulFights = 0;
      for (var i = 0, event; event = Genetics.Cage.Events[i]; i++) {
        if (event['TYPE'] == 'FIGHT') {
          if (event['RESULT'] == 'WIN') {
            successfulFights++;
            if (successfulFights == 3) {
              new Genetics.Cage.Event('END_GAME', true).addToQueue();
              return true;
            }
          } else {
            // If the player did not win a fight, they fail the level.
            new Genetics.Cage.Event('END_GAME', false).addToQueue();
            return true;
          }
        } else if (event['TYPE'] != 'START_GAME' &&
            event['TYPE'] != 'NEXT_ROUND') {
          // If an unexpected event occurred, then the level is failed.
          new Genetics.Cage.Event('END_GAME', false).addToQueue();
          return true;
        }
      }
      return false;
    case 5:
      // Player was asked to return a mouse that is a valid mate. The player
      // succeeds if they mate 3 times successfully.
      // fallthrough
    case 6:
      // Player was asked to return a mouse that is a valid mate and bigger
      // than itself. The player succeeds if they mate 5 times successfully with
      // a mate that fits this criteria.
      // Case 5 and Case 6
      var successfulMates = 0;
      for (var i = 0, event; event = Genetics.Cage.Events[i]; i++) {
        if (event['TYPE'] == 'MATE') {
          if (event['RESULT'] == 'SUCCESS') {
            if (BlocklyGames.LEVEL == 6 &&
                Genetics.Cage.miceMap_[event['OPT_PARTNER']].size <=
                Genetics.Mouse.SIZE) {
              // If it is level 6 and the player tried to mate with someone
              // that wasn't bigger than itself, they fail.
              new Genetics.Cage.Event('END_GAME', false).addToQueue();
              return true;
            }
            successfulMates++;
            if (successfulMates == 5) {
              new Genetics.Cage.Event('END_GAME', true).addToQueue();
              return true;
            }
          } else {
            // If the player had an unsuccessful mating attempt, then the level
            // is failed.
            new Genetics.Cage.Event('END_GAME', false).addToQueue();
            return true;
          }
        } else if (event['TYPE'] != 'START_GAME' &&
            event['TYPE'] != 'NEXT_ROUND') {
          // If an unexpected event occurred, then the level is failed.
          new Genetics.Cage.Event('END_GAME', false).addToQueue();
          return true;
        }
      }
      return false;
    case 7:
      // Player was asked to respond to mate request such that they return true
      // if a mate is valid, false otherwise. The player succeeds if they
      // correctly respond 5 times.
      // fallthrough
    case 8:
      // Player was asked to respond to mate request such that they return true
      // if a mate is valid and bigger than itself, false otherwise. The player
      // succeeds if they correctly respond 5 times.
      // Case 7 and Case 8
      var successfulMates = 0;
      for (var i = 0, event; event = Genetics.Cage.Events[i]; i++) {
        if (event['TYPE'] == 'MATE') {
          if (event['RESULT'] == 'SUCCESS') {
            if (BlocklyGames.LEVEL == 8 &&
                Genetics.Cage.miceMap_[event['ID']].size <=
                Genetics.Mouse.SIZE) {
              // If it is level 8 and the player tried to mate with someone
              // that wasn't bigger than itself, they fail.
              new Genetics.Cage.Event('END_GAME', false).addToQueue();
              return true;
            }
            successfulMates++;
            if (successfulMates == 5) {
              new Genetics.Cage.Event('END_GAME', true).addToQueue();
              return true;
            }
          } else if (event['RESULT'] == 'REJECTION') {
            var self = Genetics.Cage.miceMap_[0];
            var mate = Genetics.Cage.miceMap_[event['ID']];
            if (self.sex != mate.sex && (BlocklyGames.LEVEL != 8 ||
                self.size < mate.sex)) {
              // If the player rejected a correct mate request, then they fail.
              new Genetics.Cage.Event('END_GAME', false).addToQueue();
              return true;
            }
          } else {
            // If the mate event is anything other than a success or rejection,
            // then the level is failed.
            new Genetics.Cage.Event('END_GAME', false).addToQueue();
            return true;
          }
        } else if (event['TYPE'] != 'START_GAME' &&
            event['TYPE'] != 'NEXT_ROUND' && event['TYPE'] != 'RETIRE') {
          // If an unexpected event occurred, then the level is failed.
          new Genetics.Cage.Event('END_GAME', false).addToQueue();
          return true;
        }
      }
      return false;
    default:
      throw 'unhandled checkForLevelEnd for level ' + BlocklyGames.LEVEL;
  }
};

/**
 * Is the documentation open?
 * @private {boolean}
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

  // Enable wandering if level is not level 1-2.
  Genetics.MouseAvatar.wanderingDisabled = BlocklyGames.LEVEL <= 2;

  var checkForEnd =
      (BlocklyGames.LEVEL <= 8) ? Genetics.checkForLevelEnd : null;
  Genetics.Cage.start(checkForEnd);
  Genetics.Visualization.start();
};

/**
 * Reset the Genetics simulation and kill any pending tasks.
 */
Genetics.reset = function() {
  Genetics.Cage.reset();
  Genetics.Visualization.reset();
  // Disable wandering so that mice don't move until game plays.
  Genetics.MouseAvatar.wanderingDisabled = true;
  Genetics.addStartingMice();

};

/**
 * Show the help pop-up.
 */
Genetics.showHelp = function() {
  var help = document.getElementById('help');
  var button = document.getElementById('helpButton');
  var style = {
    width: '50%',
    left: '25%',
    top: '5em'
  };
  BlocklyDialogs.showDialog(help, button, true, true, style,
      BlocklyDialogs.stopDialogKeyDown);
  BlocklyDialogs.startDialogKeyDown();
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
