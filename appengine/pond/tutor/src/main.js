/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Creates a pond programmable with blocks or JavaScript.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Pond.Tutor');

goog.require('Blockly.JavaScript');
goog.require('Blockly.utils.Coordinate');
goog.require('BlocklyAce');
goog.require('BlocklyCode');
goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('Pond');
goog.require('Pond.Battle');
goog.require('Pond.Blocks');
goog.require('Pond.Tutor.html');
goog.require('Pond.Visualization');


BlocklyGames.storageName = 'pond-tutor';

/**
 * Initialize Blockly xor Ace, and the pond.  Called on page load.
 */
function init() {
  Pond.Blocks.init();

  // Render the HTML.
  document.body.innerHTML = Pond.Tutor.html.start(
      {lang: BlocklyGames.LANG,
       level: BlocklyGames.LEVEL,
       maxLevel: BlocklyGames.MAX_LEVEL,
       html: BlocklyGames.IS_HTML});

  Pond.init(BlocklyGames.getMsg('Games.pondTutor', false));

  BlocklyGames.bindClick('helpButton', Pond.showHelp);
  if (location.hash.length < 2 &&
      !BlocklyGames.loadFromLocalStorage(BlocklyGames.storageName,
                                         BlocklyGames.LEVEL)) {
    setTimeout(Pond.showHelp, 1000);
  }

  const rtl = BlocklyGames.IS_RTL;
  const blocklyDiv = BlocklyGames.getElementById('blockly');
  const editorDiv = BlocklyGames.getElementById('editor');
  const visualization = BlocklyGames.getElementById('visualization');
  let onresize;

  if (blocklyDiv) {
    onresize = function(_e) {
      const top = visualization.offsetTop;
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

    let defaultXml;
    if (BlocklyGames.LEVEL === 7) {
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
    const containerCode = BlocklyGames.getElementById('containerCode');
    containerCode.parentNode.removeChild(containerCode);

    let defaultCode;
    if (BlocklyGames.LEVEL === 8) {
      defaultCode = 'swim(0);';
    } else {
      defaultCode = 'cannon(0, 70);';
    }
    BlocklyAce.makeAceSession();
    BlocklyInterface.loadBlocks(defaultCode + '\n');

    onresize = function(_e) {
      const top = visualization.offsetTop;
      editorDiv.style.top = Math.max(10, top - window.pageYOffset) + 'px';
      editorDiv.style.left = rtl ? '10px' : '420px';
      editorDiv.style.width = (window.innerWidth - 440) + 'px';
    };
    window.addEventListener('scroll', onresize);

    // Lazy-load the ESx-ES5 transpiler.
    BlocklyAce.importBabel();
  }

  BlocklyGames.bindClick('runButton', runButtonClick);
  window.addEventListener('resize', onresize);
  onresize(null);

  const avatarData = getAvatarData();
  for (const avatarDatum of avatarData) {
    const avatar = new Pond.Avatar(avatarDatum.name, avatarDatum.start,
        avatarDatum.damage, !avatarDatum.code, Pond.Battle);
    if (avatarDatum.code) {
      const div = BlocklyGames.getElementById(avatarDatum.code);
      const code = div.textContent;
      avatar.setCode(undefined, code, code);
    } else {
      Pond.currentAvatar = avatar;
    }
  }
  Pond.reset();
}

/**
 * Click the run button.  Save the code for the end of level dialog and save.
 * This runs in parallel with Pond.runButtonClick on a separate event handler.
 * @param {!Event} e Mouse or touch event.
 */
function runButtonClick(e) {
  BlocklyCode.executedJsCode = BlocklyCode.getJsCode();
  BlocklyInterface.executedCode = BlocklyInterface.getCode();
}

/**
 * Get the data for the avatars to be loaded into the current level.
 * @param {!Array<!Object>}
 */
function getAvatarData() {
  const playerName = BlocklyGames.getMsg('Pond.playerName', false);
  const targetName = BlocklyGames.getMsg('Pond.targetName', false);
  const pendulumName = BlocklyGames.getMsg('Pond.pendulumName', false);
  const scaredName = BlocklyGames.getMsg('Pond.scaredName', false);

  return [
    // Level 1.
    [
      {
        start: new Blockly.utils.Coordinate(50, 30),
        damage: 0,
        name: playerName,
        code: null,
      },
      {
        start: new Blockly.utils.Coordinate(50, 70),
        damage: 99,
        name: targetName,
        code: 'playerTarget',
      }
    ],
    // Level 2.
    [
      {
        start: new Blockly.utils.Coordinate(70, 50),
        damage: 0,
        name: playerName,
        code: null,
      },
      {
        start: new Blockly.utils.Coordinate(20, 50),
        damage: 99,
        name: targetName,
        code: 'playerTarget',
      }
    ],
    // Level 3.
    [
      {
        start: new Blockly.utils.Coordinate(20, 20),
        damage: 0,
        name: playerName,
        code: null,
      },
      {
        start: new Blockly.utils.Coordinate(20 + 42.4264, 20 + 42.4264),
        damage: 0,
        name: targetName,
        code: 'playerTarget',
      }
    ],
    // Level 4.
    [
      {
        start: new Blockly.utils.Coordinate(50, 80),
        damage: 0,
        name: playerName,
        code: null,
      },
      {
        start: new Blockly.utils.Coordinate(50, 20),
        damage: 0,
        name: targetName,
        code: 'playerTarget',
      }
    ],
    // Level 5.
    [
      {
        start: new Blockly.utils.Coordinate(90, 50),
        damage: 0,
        name: playerName,
        code: null,
      },
      {
        start: new Blockly.utils.Coordinate(50, 50),
        damage: 0,
        name: pendulumName,
        code: 'playerPendulum',
      }
    ],
    // Level 6.
    [
      {
        start: new Blockly.utils.Coordinate(10, 50),
        damage: 0,
        name: playerName,
        code: null,
      },
      {
        start: new Blockly.utils.Coordinate(50, 50),
        damage: 0,
        name: pendulumName,
        code: 'playerPendulum',
      }
    ],
    // Level 7.
    [
      {
        start: new Blockly.utils.Coordinate(20, 80),
        damage: 0,
        name: playerName,
        code: null,
      },
      {
        start: new Blockly.utils.Coordinate(80, 20),
        damage: 99,
        name: targetName,
        code: 'playerTarget',
      }
    ],
    // Level 8.
    [
      {
        start: new Blockly.utils.Coordinate(50, 90),
        damage: 0,
        name: playerName,
        code: null,
      },
      {
        start: new Blockly.utils.Coordinate(50, 10),
        damage: 99,
        name: pendulumName,
        code: 'playerPendulum',
      }
    ],
    // Level 9.
    [
      {
        start: new Blockly.utils.Coordinate(5, 50),
        damage: 99,
        name: playerName,
        code: null,
      },
      {
        start: new Blockly.utils.Coordinate(95, 50),
        damage: 0,
        name: targetName,
        code: 'playerTarget',
      }
    ],
    // Level 10.
    [
      {
        start: new Blockly.utils.Coordinate(10, 10),
        damage: 50,
        name: playerName,
        code: null,
      },
      {
        start: new Blockly.utils.Coordinate(40, 40),
        damage: 0,
        name: scaredName,
        code: 'playerScared',
      }
    ],
  ][BlocklyGames.LEVEL - 1];
}

/**
 * Callback function for when a game ends.
 * @param {number} survivors Number of avatars left alive.
 * @suppress {duplicate}
 */
Pond.endBattle = function(survivors) {
  Pond.Visualization.stop();
  if (survivors === 0) {
    // Everyone died.
  } else if (survivors === 1) {
    // Winner.
    if (Pond.Battle.RANK[0].visualizationIndex === 0) {
      if ((BlocklyGames.LEVEL === 5 || BlocklyGames.LEVEL === 6) &&
          Pond.Battle.ticks > 200000) {
        // Avatar just pinged Pendulum to death with fixed range.
        // Use 'scan', dummy.
        const content = BlocklyGames.getElementById('helpUseScan');
        const style = {
          'width': '30%',
          'left': '35%',
          'top': '12em',
        };
        BlocklyDialogs.showDialog(content, null, false, true, style,
            BlocklyDialogs.stopDialogKeyDown);
        BlocklyDialogs.startDialogKeyDown();
      } else {
        BlocklyInterface.saveToLocalStorage();
        BlocklyCode.congratulations();
      }
    }
  } else {
    // Timeout.
  }
};

BlocklyGames.callWhenLoaded(init);
