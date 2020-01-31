/**
 * @license
 * Copyright 2019 Google LLC
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
 * @fileoverview Creates a view of the top ten ducks on the given ducks
 *     leaderboard.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

goog.provide('Pond.Duck.Leaderboard');

goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyGames.Msg');
goog.require('Pond.Duck.Datastore');
goog.require('Pond.Duck.Leaderboard.soy');


/**
 * Initialize the leadboard to display the top ten ducks.
 */
Pond.Duck.Leaderboard.init = function () {
  document.body.innerHTML = Pond.Duck.Leaderboard.soy.start({}, null,
      {
        lang: BlocklyGames.LANG,
        html: BlocklyGames.IS_HTML,
      });
  var duckKey = BlocklyGames.getStringParamFromUrl('duck', null);
  Pond.Duck.Datastore.getTopTenDucks(duckKey, Pond.Duck.Leaderboard.refreshTopDucks);
};

/**
 * Callback function for AJAX call.
 * Response contains a list holding all the top ten ducks
 * (name, duck_key, ranking, and optionally isOwner).
 */
Pond.Duck.Leaderboard.refreshTopDucks = function() {
  // Convert the response data into something the template will understand.
  var responseData = JSON.parse(this.responseText);
  var topDucksEl = document.getElementById('topDucks');

  topDucksEl.innerHTML =
      Pond.Duck.Leaderboard.soy.topDucks({topDucks: responseData["topDucks"]},
      null);
  document.getElementById('loading').style.display = 'none';
};

window.addEventListener('load', Pond.Duck.Leaderboard.init);
