/**
 * Blockly Games: Pond Database
 *
 * Copyright 2015 Google Inc.
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
 * @fileoverview Creates a multi-user pond (player page).
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Pond.Player');

goog.require('Pond.Player.soy');
goog.require('BlocklyGames');
goog.require('TableSort');


BlocklyGames.NAME = 'pond-player';


/**
 * Initialize Ace and the pond.  Called on page load.
 */
Pond.Player.init = function() {
  // Player's level is equal to their best duck.
  var level = 1;
  for (var i = 0; i < DATA['ducks'].length; i++) {
    level = Math.max(level, DATA['ducks'][i]['level']);
  }

  // Render the Soy template.
  document.body.innerHTML = Pond.Player.soy.start({}, null,
      {lang: BlocklyGames.LANG,
       html: BlocklyGames.IS_HTML,
       editable: DATA['editable'],
       name: DATA['name'],
       description: DATA['description'],
       ducks: DATA['ducks'],
       level: level});

  // Make the duck table sortable.
  var table = document.getElementById('duck-table');
  if (table) {
    TableSort.init(table);
    // Start with a decending level sort.
    TableSort.click(0, 1, 'num');
    TableSort.click(0, 1, 'num');
  }

  BlocklyGames.init();
};


window.addEventListener('load', Pond.Player.init);
