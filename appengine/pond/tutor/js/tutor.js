/**
 * @license
 * Copyright 2013 Google LLC
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

goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.JavaScript');
goog.require('BlocklyAce');
goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('Pond');
goog.require('Pond.Avatar');
goog.require('Pond.Battle');
goog.require('Pond.Blocks');
goog.require('Pond.Tutor.soy');
goog.require('Pond.Visualization');


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
      onresize(null);
      Blockly.svgResize(BlocklyInterface.workspace);
    });
    onresize(null);
    BlocklyInterface.injectBlockly(
        {'rtl': false,
         'trashcan': true});
    Blockly.JavaScript.addReservedWords('scan,cannon,drive,swim,stop,speed,' +
        'damage,health,loc_x,getX,loc_y,getY,');

    var defaultXml;
    if (BlocklyGames.LEVEL == 7) {
      defaultXml =
        '<xml>' +
          '<block type="pond_swim" x="70" y="70">' +
            '<value name="DEGREE">' +
              '<shadow type="pond_math_number">' +
                '<mutation angle_field="true"></mutation>' +
                '<field name="NUM">0</field>' +
              '</shadow>' +
            '</value>' +
          '</block>' +
        '</xml>';
    } else {
      defaultXml =
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
    }
    BlocklyInterface.loadBlocks(defaultXml);
  }

  if (editorDiv) {
    BlocklyInterface.blocksDisabled = true;
    // Remove the container for source code in the 'done' dialog.
    var containerCode = document.getElementById('containerCode');
    containerCode.parentNode.removeChild(containerCode);

    var defaultCode;
    if (BlocklyGames.LEVEL == 8) {
      defaultCode = 'swim(0);';
    } else {
      defaultCode = 'cannon(0, 70);';
    }
    BlocklyAce.makeAceSession();
    BlocklyInterface.loadBlocks(defaultCode + '\n');

    var onresize = function(e) {
      var top = visualization.offsetTop;
      editorDiv.style.top = Math.max(10, top - window.pageYOffset) + 'px';
      editorDiv.style.left = rtl ? '10px' : '420px';
      editorDiv.style.width = (window.innerWidth - 440) + 'px';
    };
    window.addEventListener('scroll', onresize);

    // Lazy-load the ESx-ES5 transpiler.
    BlocklyAce.importBabel();
  }

  window.addEventListener('resize', onresize);
  onresize(null);

  var avatars = Pond.getAvatars();

  for (var avatarData, i = 0; (avatarData = avatars[i]); i++) {
    Pond.Battle.addAvatar(avatarData);
  }
  Pond.reset();
};

window.addEventListener('load', Pond.Tutor.init);

/**
 * Get the players for the current level.
 */
Pond.getAvatars = function() {
  return [
    // Level 0.
    undefined,
    // Level 1.
    [
      Pond.Avatar.createPlayerAvatar(
          'Pond_playerName', new Blockly.utils.Coordinate(50, 30)),
      Pond.Avatar.createDefaultAvatar(
          'Pond_targetName', 'playerTarget',
          new Blockly.utils.Coordinate(50, 70), 99)
    ],
    // Level 2.
    [
      Pond.Avatar.createPlayerAvatar(
          'Pond_playerName', new Blockly.utils.Coordinate(70, 50)),
      Pond.Avatar.createDefaultAvatar(
          'Pond_targetName', 'playerTarget',
          new Blockly.utils.Coordinate(20, 50), 99)
    ],
    // Level 3.
    [
      Pond.Avatar.createPlayerAvatar(
          'Pond_playerName', new Blockly.utils.Coordinate(20, 20)),
      Pond.Avatar.createDefaultAvatar(
          'Pond_targetName', 'playerTarget',
          new Blockly.utils.Coordinate(20 + 42.4264, 20 + 42.4264), 0)
    ],
    // Level 4.
    [
      Pond.Avatar.createPlayerAvatar(
          'Pond_playerName', new Blockly.utils.Coordinate(50, 80)),
      Pond.Avatar.createDefaultAvatar(
          'Pond_targetName', 'playerTarget',
          new Blockly.utils.Coordinate(50, 20), 0)
    ],
    // Level 5.
    [
      Pond.Avatar.createPlayerAvatar(
          'Pond_playerName', new Blockly.utils.Coordinate(90, 50)),
      Pond.Avatar.createDefaultAvatar(
          'Pond_pendulumName', 'playerPendulum',
          new Blockly.utils.Coordinate(50, 50), 0)
    ],
    // Level 6.
    [
      Pond.Avatar.createPlayerAvatar(
          'Pond_playerName', new Blockly.utils.Coordinate(10, 50)),
      Pond.Avatar.createDefaultAvatar(
          'Pond_pendulumName', 'playerPendulum',
          new Blockly.utils.Coordinate(50, 50), 0)
    ],
    // Level 7.
    [
      Pond.Avatar.createPlayerAvatar(
          'Pond_playerName', new Blockly.utils.Coordinate(20, 80)),
      Pond.Avatar.createDefaultAvatar(
          'Pond_targetName', 'playerTarget',
          new Blockly.utils.Coordinate(80, 20), 99)
    ],
    // Level 8.
    [
      Pond.Avatar.createPlayerAvatar(
          'Pond_playerName', new Blockly.utils.Coordinate(50, 90)),
      Pond.Avatar.createDefaultAvatar(
          'Pond_pendulumName', 'playerPendulum',
          new Blockly.utils.Coordinate(50, 10), 99)
    ],
    // Level 9.
    [
      Pond.Avatar.createPlayerAvatar(
          'Pond_playerName', new Blockly.utils.Coordinate(5, 50), 99),
      Pond.Avatar.createDefaultAvatar(
          'Pond_targetName', 'playerTarget',
          new Blockly.utils.Coordinate(95, 50), 0)
    ],
    // Level 10.
    [
      Pond.Avatar.createPlayerAvatar(
          'Pond_playerName', new Blockly.utils.Coordinate(10, 10), 50),
      Pond.Avatar.createDefaultAvatar(
          'Pond_scaredName', 'playerScared',
          new Blockly.utils.Coordinate(40, 40), 0)
    ]
  ][BlocklyGames.LEVEL];
};

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
