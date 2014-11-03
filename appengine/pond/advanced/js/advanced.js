/**
 * Blockly Games: Pond Advanced
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
 * @fileoverview Creates an pond programmable with JavaScript.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Pond.Advanced');

goog.require('Pond');
goog.require('Pond.Advanced.soy');
goog.require('Pond.Battle');
goog.require('Pond.Tutorial');
goog.require('Pond.Visualization');
goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');


BlocklyGames.NAME = 'pond-advanced';

/**
 * Initialize Ace and the pond.  Called on page load.
 */
Pond.Advanced.init = function() {
  // Render the Soy template.
  document.body.innerHTML = Pond.Advanced.soy.start({}, null,
      {lang: BlocklyGames.LANG,
       level: BlocklyGames.LEVEL,
       maxLevel: BlocklyGames.MAX_LEVEL,
       html: BlocklyGames.IS_HTML});

  Pond.init();

  // Remove the container for source code in the 'done' dialog.
  var containerCode = document.getElementById('containerCode');
  containerCode.parentNode.removeChild(containerCode);

  var defaultCode;
  if (BlocklyGames.LEVEL == 4) {
    defaultCode = 'swim(0, 50);';
  } else {
    defaultCode = 'cannon(0, 70);';
  }
  BlocklyInterface.editor = window['ace']['edit']('editor');
  BlocklyInterface.editor['setTheme']('ace/theme/chrome');
  var session = BlocklyInterface.editor['getSession']();
  session['setMode']('ace/mode/javascript');
  session['setTabSize'](2);
  session['setUseSoftTabs'](true);
  BlocklyInterface.loadBlocks(defaultCode + '\n', BlocklyGames.LEVEL != 4);

  var rtl = BlocklyGames.isRtl();
  var visualization = document.getElementById('visualization');
  var onresize = function(e) {
    var top = visualization.offsetTop;
    var div = document.getElementById('editor');
    div.style.top = Math.max(10, top - window.pageYOffset) + 'px';
    div.style.left = rtl ? '10px' : '420px';
    div.style.width = (window.innerWidth - 440) + 'px';
  };
  window.addEventListener('scroll', onresize);
  window.addEventListener('resize', onresize);
  onresize();

  for (var playerData, i = 0; playerData = Pond.Tutorial.PLAYERS[i]; i++) {
    if (playerData.code) {
      var div = document.getElementById(playerData.code);
      var code = div.textContent;
    } else {
      var code = function() {return BlocklyInterface.editor['getValue']()};
    }
    var name = BlocklyGames.getMsg(playerData.name);
    Pond.Battle.addPlayer(name, code, playerData.start, playerData.damage);
  }
  Pond.reset();
};

window.addEventListener('load', Pond.Advanced.init);
