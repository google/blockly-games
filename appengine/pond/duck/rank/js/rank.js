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
 * @fileoverview Creates a view of all the ducks for a user.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

goog.provide('Pond.Duck.Rank');

goog.require('Pond.Duck.Datastore');

/**
 * .
 */
Pond.Duck.Rank.init = function () {
  // Start background match request computation.
  Pond.Duck.Datastore.getMatchRequest(Pond.Duck.Rank.computeRankRequest);
};

/**
 * Handle rank request response.
 */
Pond.Duck.Rank.computeRankRequest = function() {
  if (this.status === 200) {
    var data = JSON.parse(this.responseText);
    var duckList = data['duck_list'];
    // TODO: Compute relative ranking based on match request and send back.
    var rankedEntryKeys = [
      duckList[0]['entry_key'], duckList[3]['entry_key'],
      duckList[2]['entry_key'], duckList[1]['entry_key']];
    Pond.Duck.Datastore.sendMatchResult(
        data['match_key'], rankedEntryKeys,
        function(){
          Pond.Duck.Datastore.getMatchRequest(
              Pond.Duck.Rank.computeRankRequest);
        });
  } else {
    // No matches currently available, wait before asking again.
    setTimeout(function(){
      Pond.Duck.Datastore.getMatchRequest(Pond.Duck.Rank.computeRankRequest);
    }, 10000);
  }
};

window.addEventListener('load', Pond.Duck.Rank.init);
