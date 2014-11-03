/**
 * Blockly Games: Pond
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
 * @fileoverview Common code for ten tutorial levels,
 *     used for both blocks and JavaScript.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Pond.Tutorial');

goog.require('Pond');
goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('goog.math.Coordinate');


/**
 * Go to the next level.
 */
BlocklyInterface.nextLevel = function() {
  if (BlocklyGames.LEVEL < BlocklyGames.MAX_LEVEL) {
    window.location = window.location.protocol + '//' +
        window.location.host + window.location.pathname +
        '?lang=' + BlocklyGames.LANG + '&level=' + (BlocklyGames.LEVEL + 1);
  } else {
    BlocklyInterface.indexPage();
  }
};

Pond.Tutorial.PLAYERS = [
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
  // Level 3.
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
  // Level 4.
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
  // Level 5.
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
  // Level 6.
  [
    {
      start: new goog.math.Coordinate(10, 90),
      damage: 50,
      name: 'Pond_playerName',
      code: null
    },
    {
      start: new goog.math.Coordinate(40, 60),
      damage: 0,
      name: 'Pond_scaredName',
      code: 'playerScared'
    }
  ],
  // Level 7.
  [
    {
      start: new goog.math.Coordinate(50, 50),
      damage: 0,
      name: 'Pond_playerName',
      code: null
    },
    {
      start: new goog.math.Coordinate(50, 20),
      damage: 0,
      name: 'Pond_rabbitName',
      code: 'playerRabbit'
    }
  ],
  // Level 8.
  [
    {
      start: new goog.math.Coordinate(20, 80),
      damage: 0,
      name: 'Pond_playerName',
      code: null
    },
    {
      start: new goog.math.Coordinate(50, 50),
      damage: 0,
      name: 'Pond_rookName',
      code: 'playerRook'
    }
  ],
  // Level 9.
  [
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
    }
  ],
  // Level 10.
  [
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
  ]
][BlocklyGames.LEVEL];

/**
 * Callback function for when a game ends.
 * @param {number} survivors Number of players left alive.
 */
Pond.endBattle = function(survivors) {
  Pond.Visualization.stop();
  if (survivors == 0) {
    // Everyone died.
  } else if (survivors == 1) {
    // Winner.
    if (typeof Pond.Battle.RANK[0].code_ == 'function') {
      if (BlocklyGames.LEVEL == 3 && Pond.Battle.ticks > 200000) {
        // Player just pinged Pendulum to death with fixed range.
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
