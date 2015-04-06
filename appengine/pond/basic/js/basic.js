/**
 * Blockly Games: Pond Basic
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
 * @fileoverview Creates an pond programmable with blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Pond.Basic');

goog.require('Pond');
goog.require('Pond.Basic.soy');
goog.require('Pond.Battle');
goog.require('Pond.Blocks');
goog.require('Pond.Tutorial');
goog.require('Pond.Visualization');
goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');


BlocklyGames.NAME = 'pond-basic';

/**
 * Initialize Blockly and the pond.  Called on page load.
 */
Pond.Basic.init = function() {
  // Render the Soy template.
  document.body.innerHTML = Pond.Basic.soy.start({}, null,
      {lang: BlocklyGames.LANG,
       level: BlocklyGames.LEVEL,
       maxLevel: BlocklyGames.MAX_LEVEL,
       html: BlocklyGames.IS_HTML});

  Pond.init();

  var rtl = BlocklyGames.isRtl();
  var blocklyDiv = document.getElementById('blockly');
  var visualization = document.getElementById('visualization');
  var onresize = function(e) {
    var top = visualization.offsetTop;
    blocklyDiv.style.top = Math.max(10, top - window.pageYOffset) + 'px';
    blocklyDiv.style.left = rtl ? '10px' : '420px';
    blocklyDiv.style.width = (window.innerWidth - 440) + 'px';
  };
  window.addEventListener('scroll', function() {
      onresize();
      Blockly.fireUiEvent(window, 'resize');
    });
  window.addEventListener('resize', onresize);
  onresize();

  var toolbox = document.getElementById('toolbox');
  Blockly.inject(document.getElementById('blockly'),
      {'media': 'media/',
       'rtl': false,
       'toolbox': toolbox,
       'trashcan': true});
  Blockly.JavaScript.addReservedWords('scan,cannon,drive,swim,stop,speed,' +
      'damage,health,loc_x,loc_y');

  var defaultXml;
  if (BlocklyGames.LEVEL == 4) {
    defaultXml =
      '<xml>' +
      '  <block type="pond_swim" x="70" y="70">' +
      '    <value name="DEGREE">' +
      '      <block type="pond_math_number">' +
      '        <field name="NUM">0</field>' +
      '      </block>' +
      '    </value>' +
      '  </block>' +
      '</xml>';
  } else {
    defaultXml =
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
  }
  BlocklyInterface.loadBlocks(defaultXml, BlocklyGames.LEVEL != 4);

  for (var playerData, i = 0; playerData = Pond.Tutorial.PLAYERS[i]; i++) {
    if (playerData.code) {
      var div = document.getElementById(playerData.code);
      var code = div.textContent;
    } else {
      var code = function() {return Blockly.JavaScript.workspaceToCode()};
    }
    var name = BlocklyGames.getMsg(playerData.name);
    Pond.Battle.addPlayer(name, code, playerData.start, playerData.damage);
  }
  Pond.reset();
};

window.addEventListener('load', Pond.Basic.init);
