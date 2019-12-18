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
 * @fileoverview Computes leaderboard ranking matches.
 */
'use strict';

goog.provide('Pond.Duck.Rank');

goog.require('Pond.Avatar');
goog.require('Pond.Battle');
goog.require('Pond.Duck');
goog.require('Pond.Duck.Datastore');

/**
 * Match request identifier string.
 * @type {String}
 */
Pond.Duck.Rank.MATCH_KEY = null;

/**
 * List of entries to be ranked based on match result.
 * @type {Array.<string>}
 */
Pond.Duck.Rank.RANK_ENTRIES = [];

/**
 * Initialize interpreter and triggers match request. Called on page load.
 */
Pond.Duck.Rank.init = function () {
  Pond.Battle.isHeadless = true;
  Pond.Battle.GAME_FPS = 1000;
  Pond.Battle.TIME_LIMIT = 60 * 1000;

  // Lazy-load the JavaScript interpreter.
  BlocklyInterface.importInterpreter();

  // Start match request computation.
  Pond.Duck.Datastore.getMatchRequest(Pond.Duck.Rank.handleMatchRequest);
};

/**
 * Computes ranking match.
 */
Pond.Duck.Rank.computeMatch = function() {
  if (!('Interpreter' in window)) {
    // Interpreter lazy loads and hasn't arrived yet.  Try again later.
    setTimeout(Pond.Duck.Rank.computeMatch, 250);
    return;
  }
  Pond.Battle.reset();
  Pond.Battle.start(Pond.Duck.Rank.sendResults);
};

/**
 * Sends request with match results.
 */
Pond.Duck.Rank.sendResults = function() {
  var rankedEntries = [];
  for (var avatar, i = 0; (avatar = Pond.Battle.RANK[i]); i++) {
    rankedEntries.push(Pond.Duck.Rank.RANK_ENTRIES[avatar.name])
  }

  Pond.Duck.Datastore.sendMatchResult(Pond.Duck.Rank.MATCH_KEY, rankedEntries,
      function() {
        Pond.Duck.Datastore.getMatchRequest(Pond.Duck.Rank.handleMatchRequest);
      })
};

/**
 * Handles rank request response.
 */
Pond.Duck.Rank.handleMatchRequest = function() {
  if (this.status === 200) {
    var data = JSON.parse(this.responseText);
    Pond.Duck.Rank.MATCH_KEY = data['match_key'];

    var requestDucks = data['duck_list'];
    Pond.Duck.Rank.RANK_ENTRIES = [];
    Pond.Battle.clearAvatars();
    for (var duck, i = 0; (duck = requestDucks[i]); i++) {
      Pond.Battle.addAvatar(
          new Pond.Avatar(i, duck['js'], Pond.Duck.START_XY[i]));
      Pond.Duck.Rank.RANK_ENTRIES.push(duck['entry_key'])
    }
    Pond.Duck.Rank.computeMatch();
  } else {
    // No matches currently available, wait before asking again.
    setTimeout(function(){
      Pond.Duck.Datastore.getMatchRequest(Pond.Duck.Rank.handleMatchRequest);
    }, 10000);
  }
};

window.addEventListener('load', Pond.Duck.Rank.init);
