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

goog.provide('Pond.Duck.Board');

goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyGames.Msg');
goog.require('Pond.Datastore');
goog.require('Pond.Duck.Board.soy');


/**
 * Initialize the board holding all the ducks for the current user.
 */
Pond.Duck.Board.init = function () {
  document.body.innerHTML = Pond.Duck.Board.soy.start({}, null,
      {
        lang: BlocklyGames.LANG,
        html: BlocklyGames.IS_HTML,
      });
  var createBtn = document.getElementById('createButton');
  BlocklyGames.bindClick(createBtn, Pond.Duck.Board.createDuck);
  Pond.Datastore.getAllDucks(Pond.Duck.Board.refreshDuckList);
};

/**
 * Copy the duck with the given duckId.
 * @param {Event} e The event that holds the duckId.
 */
Pond.Duck.Board.copyDuck = function(e) {
  document.getElementById('loading').style.display = 'table-cell';
  var duckId = e.target.getAttribute('data-duckId');
  Pond.Datastore.copyDuck(duckId,
      Pond.Duck.Board.createGetDucksCallback('copied'));
};

/**
 * Delete the duck with the given duckId.
 * @param {Event} e The event that holds the duckId.
 */
Pond.Duck.Board.deleteDuck = function(e) {
  document.getElementById('loading').style.display = 'table-cell';
  var duckId = e.target.getAttribute('data-duckId');
  Pond.Datastore.deleteDuck(duckId,
      Pond.Duck.Board.createGetDucksCallback('deleted'));
};

/**
 * TODO: Show the dialog to create a duck.
 */
Pond.Duck.Board.createDuck = function() {
  console.log("Show dialog here");
};

/**
 * Callback for copy/delete action.
 * @param {string} action Action attempted.
 */
Pond.Duck.Board.createGetDucksCallback = function(action) {
  return function() {
    var text;
    if (this.status == 200) {
      Pond.Duck.Board.refreshDuckList.call(this);
      var meta = JSON.parse(this.responseText);
      text = 'Duck ' + action + ' with key: ' + meta['duck_key'];
    } else {
      text = BlocklyGames.getMsg('Games_httpRequestError') + '\nStatus: '
          + this.status;
    }
    document.getElementById('loading').style.display = 'none';
    BlocklyDialogs.storageAlert(null, text);
  };
};

/**
 * Callback function for AJAX call.
 * Response contains a list holding all the ducks for the current user
 * (name, duckId, and optionally ranking).
 */
Pond.Duck.Board.refreshDuckList = function() {
  // Convert the response data into something template will understand.
  var responseData = JSON.parse(this.responseText);
  var templateDucks = [];
  for(var i = 0, duckData; (duckData = responseData["duckList"][i]); i++) {
    var templateDuck = {
      name: duckData['name'],
      duckId: duckData['duckId'],
    };
    if (duckData['ranking']) {
      templateDuck.ranking = duckData['ranking'];
    }
    templateDucks.push(templateDuck);
  }
  var duckListEl = document.getElementById('duckList');
  duckListEl.innerHTML =
      Pond.Duck.Board.soy.duckList({ducks: templateDucks}, null);

  var copyBtns = duckListEl.getElementsByClassName('copyDuck');
  var deleteBtns = duckListEl.getElementsByClassName('deleteDuck');
  for(var i = 0, cpyBtn; (cpyBtn = copyBtns[i]); i++) {
    BlocklyGames.bindClick(cpyBtn, Pond.Duck.Board.copyDuck);
  }
  for(var i = 0, deleteBtn; (deleteBtn = deleteBtns[i]); i++) {
    BlocklyGames.bindClick(deleteBtn, Pond.Duck.Board.deleteDuck);
  }
};

window.addEventListener('load', Pond.Duck.Board.init);
