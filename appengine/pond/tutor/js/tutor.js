/**
 * Blockly Games: Pond Tutor
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
 * @fileoverview Creates a pond programmable with blocks or JavaScript.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Pond.Tutor');

goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('Pond');
goog.require('Pond.Battle');
goog.require('Pond.Blocks');
goog.require('Pond.Tutor.soy');
goog.require('Pond.Visualization');
goog.require('goog.math.Coordinate');


BlocklyGames.NAME = 'pond-tutor';

/**
 * Initialize Blockly xor Ace, and the pond.  Called on page load.
 */
Pond.Tutor.init = function() {
  // Render the Soy template.
  document.body.innerHTML = Pond.Tutor.soy.start({}, null,
      {lang: BlocklyGames.LANG,
       level: BlocklyGames.LEVEL,
       maxLevel: BlocklyGames.MAX_LEVEL,
       html: BlocklyGames.IS_HTML});

  Pond.init();

  BlocklyGames.bindClick('helpButton', Pond.showHelp);
  if (location.hash.length < 2 &&
      !BlocklyGames.loadFromLocalStorage(BlocklyGames.NAME,
                                         BlocklyGames.LEVEL)) {
    setTimeout(Pond.showHelp, 1000);
  }

  var rtl = BlocklyGames.isRtl();
  var blocklyDiv = document.getElementById('blockly');
  var editorDiv = document.getElementById('editor');
  var visualization = document.getElementById('visualization');

  if (blocklyDiv) {
    var onresize = function(e) {
      var top = visualization.offsetTop;
      blocklyDiv.style.top = Math.max(10, top - window.pageYOffset) + 'px';
      blocklyDiv.style.left = rtl ? '10px' : '420px';
      blocklyDiv.style.width = (window.innerWidth - 440) + 'px';
    };
    window.addEventListener('scroll', function() {
      onresize();
      Blockly.svgResize(BlocklyGames.workspace);
    });
    window.addEventListener('resize', onresize);
    onresize();

    var toolbox = document.getElementById('toolbox');
    BlocklyGames.workspace = Blockly.inject('blockly',
        {'media': 'third-party/blockly/media/',
         'rtl': false,
         'toolbox': toolbox,
         'trashcan': true});
    Blockly.JavaScript.addReservedWords('scan,cannon,drive,swim,stop,speed,' +
        'damage,health,loc_x,getX,loc_y,getY,');

    var defaultXml;
    if (BlocklyGames.LEVEL == 7) {
      defaultXml =
        '<xml>' +
        '  <block type="pond_swim" x="70" y="70">' +
        '    <value name="DEGREE">' +
        '      <shadow type="pond_math_number">' +
        '        <field name="NUM">0</field>' +
        '      </shadow>' +
        '    </value>' +
        '  </block>' +
        '</xml>';
    } else {
      defaultXml =
        '<xml>' +
        '  <block type="pond_cannon" x="70" y="70">' +
        '    <value name="DEGREE">' +
        '      <shadow type="pond_math_number">' +
        '        <field name="NUM">0</field>' +
        '      </shadow>' +
        '    </value>' +
        '    <value name="RANGE">' +
        '      <shadow type="pond_math_number">' +
        '        <field name="NUM">70</field>' +
        '      </shadow>' +
        '    </value>' +
        '  </block>' +
        '</xml>';
    }
    BlocklyInterface.loadBlocks(defaultXml);
  }

  if (editorDiv) {
    // Remove the container for source code in the 'done' dialog.
    var containerCode = document.getElementById('containerCode');
    containerCode.parentNode.removeChild(containerCode);

    var defaultCode;
    if (BlocklyGames.LEVEL == 8) {
      defaultCode = 'swim(0);';
    } else {
      defaultCode = 'cannon(0, 70);';
    }
    BlocklyInterface.editor = window['ace']['edit']('editor');
    BlocklyInterface.editor['setTheme']('ace/theme/chrome');
    BlocklyInterface.editor['setShowPrintMargin'](false);
    var session = BlocklyInterface.editor['getSession']();
    session['setMode']('ace/mode/javascript');
    session['setTabSize'](2);
    session['setUseSoftTabs'](true);
    BlocklyInterface.loadBlocks(defaultCode + '\n');

    var onresize = function(e) {
      var top = visualization.offsetTop;
      editorDiv.style.top = Math.max(10, top - window.pageYOffset) + 'px';
      editorDiv.style.left = rtl ? '10px' : '420px';
      editorDiv.style.width = (window.innerWidth - 440) + 'px';
    };
    window.addEventListener('scroll', function() {
      onresize();
      Blockly.svgResize(BlocklyGames.workspace);
    });
    window.addEventListener('resize', onresize);
  }

  onresize();

  for (var avatarData, i = 0; avatarData = Pond.Tutor.PLAYERS[i]; i++) {
    if (avatarData.code) {
      var div = document.getElementById(avatarData.code);
      var code = div.textContent;
    } else {
      if (blocklyDiv) {
        var code = function() {
          return Blockly.JavaScript.workspaceToCode(BlocklyGames.workspace);
        };
      } else {
        var code = function() {return BlocklyInterface.editor['getValue']()};
      }
    }
    var name = BlocklyGames.getMsg(avatarData.name);
    Pond.Battle.addAvatar(name, code, avatarData.start, avatarData.damage);
  }
  Pond.reset();
};

window.addEventListener('load', Pond.Tutor.init);

Pond.Tutor.PLAYERS = [
  // Level 0.
  undefined,
  // Level 1.
  [
    {
      start: new goog.math.Coordinate(50, 30),
      damage: 0,
      name: 'Pond_playerName',
      code: null
    },
    {
      start: new goog.math.Coordinate(50, 70),
      damage: 99,
      name: 'Pond_targetName',
      code: 'playerTarget'
    }
  ],
  // Level 2.
  [
    {
      start: new goog.math.Coordinate(70, 50),
      damage: 0,
      name: 'Pond_playerName',
      code: null
    },
    {
      start: new goog.math.Coordinate(20, 50),
      damage: 99,
      name: 'Pond_targetName',
      code: 'playerTarget'
    }
  ],
  // Level 3.
  [
    {
      start: new goog.math.Coordinate(20, 20),
      damage: 0,
      name: 'Pond_playerName',
      code: null
    },
    {
      start: new goog.math.Coordinate(20 + 42.4264, 20 + 42.4264),
      damage: 0,
      name: 'Pond_targetName',
      code: 'playerTarget'
    }
  ],
  // Level 4.
  [
    {
      start: new goog.math.Coordinate(50, 80),
      damage: 0,
      name: 'Pond_playerName',
      code: null
    },
    {
      start: new goog.math.Coordinate(50, 20),
      damage: 0,
      name: 'Pond_targetName',
      code: 'playerTarget'
    }
  ],
  // Level 5.
  [
    {
      start: new goog.math.Coordinate(90, 50),
      damage: 0,
      name: 'Pond_playerName',
      code: null
    },
    {
      start: new goog.math.Coordinate(50, 50),
      damage: 0,
      name: 'Pond_pendulumName',
      code: 'playerPendulum'
    }
  ],
  // Level 6.
  [
    {
      start: new goog.math.Coordinate(10, 50),
      damage: 0,
      name: 'Pond_playerName',
      code: null
    },
    {
      start: new goog.math.Coordinate(50, 50),
      damage: 0,
      name: 'Pond_pendulumName',
      code: 'playerPendulum'
    }
  ],
  // Level 7.
  [
    {
      start: new goog.math.Coordinate(20, 80),
      damage: 0,
      name: 'Pond_playerName',
      code: null
    },
    {
      start: new goog.math.Coordinate(80, 20),
      damage: 99,
      name: 'Pond_targetName',
      code: 'playerTarget'
    }
  ],
  // Level 8.
  [
    {
      start: new goog.math.Coordinate(50, 90),
      damage: 0,
      name: 'Pond_playerName',
      code: null
    },
    {
      start: new goog.math.Coordinate(50, 10),
      damage: 99,
      name: 'Pond_pendulumName',
      code: 'playerPendulum'
    }
  ],
  // Level 9.
  [
    {
      start: new goog.math.Coordinate(5, 50),
      damage: 99,
      name: 'Pond_playerName',
      code: null
    },
    {
      start: new goog.math.Coordinate(95, 50),
      damage: 0,
      name: 'Pond_targetName',
      code: 'playerTarget'
    }
  ],
  // Level 10.
  [
    {
      start: new goog.math.Coordinate(10, 10),
      damage: 50,
      name: 'Pond_playerName',
      code: null
    },
    {
      start: new goog.math.Coordinate(40, 40),
      damage: 0,
      name: 'Pond_scaredName',
      code: 'playerScared'
    }
  ]
][BlocklyGames.LEVEL];

/**
 * Callback function for when a game ends.
 * @param {number} survivors Number of avatars left alive.
 * @suppress {duplicate}
 */
Pond.endBattle = function(survivors) {
  Pond.Visualization.stop();
  if (survivors == 0) {
    // Everyone died.
  } else if (survivors == 1) {
    // Winner.
    if (typeof Pond.Battle.RANK[0].code_ == 'function') {
      if ((BlocklyGames.LEVEL == 5 || BlocklyGames.LEVEL == 6) &&
          Pond.Battle.ticks > 200000) {
        // Avatar just pinged Pendulum to death with fixed range.
        // Use 'scan', dummy.
        var content = document.getElementById('helpUseScan');
        var style = {
          'width': '30%',
          'left': '35%',
          'top': '12em'
        };
        BlocklyDialogs.showDialog(content, null, false, true, style,
            BlocklyDialogs.stopDialogKeyDown);
        BlocklyDialogs.startDialogKeyDown();
      } else {
        BlocklyInterface.saveToLocalStorage();
        BlocklyDialogs.congratulations();
      }
    }
  } else {
    // Timeout.
  }
};
