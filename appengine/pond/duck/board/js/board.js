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
goog.require('Pond.Duck.Datastore');
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
  Pond.Duck.Datastore.getAllDucks(Pond.Duck.Board.refreshDuckList);
};

/**
 * Copy the duck with the given duck key.
 * @param {Event} e The event that holds the duck key.
 */
Pond.Duck.Board.copyDuck = function(e) {
  document.getElementById('loading').style.display = 'table-cell';
  var duckKey = e.target.getAttribute('data-duck-key');
  Pond.Duck.Datastore.copyDuck(duckKey, true,
      Pond.Duck.Board.createGetDucksCallback('copied'));
};

/**
 * Delete the duck with the given duck key.
 * @param {Event} e The event that holds the duck key.
 */
Pond.Duck.Board.deleteDuck = function(e) {
  document.getElementById('loading').style.display = 'table-cell';
  var duckKey = e.target.getAttribute('data-duck-key');
  Pond.Duck.Datastore.deleteDuck(duckKey, true,
      Pond.Duck.Board.createGetDucksCallback('deleted'));
};

/**
 * Redirect the user to a page to edit the duck.
 * @param {Event} e The event that holds the duck key.
 */
Pond.Duck.Board.editDuck = function(e) {
  var duckKey = e.target.getAttribute('data-duck-key');
  var url = top.window.location.origin
      + '/pond-duck-online?lang='+ BlocklyGames.LANG
      + '&duck=' + duckKey;
  top.window.location = url;
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
    Pond.Duck.Board.refreshDuckList.call(this);
    var meta = JSON.parse(this.responseText);
    var text = 'Duck ' + action + ' with key: ' + meta['duck_key'];
    BlocklyDialogs.storageAlert(null, text);
  };
};

/**
 * Callback function for AJAX call.
 * Response contains a list holding all the ducks for the current user
 * (name, duck_key, and optionally ranking).
 */
Pond.Duck.Board.refreshDuckList = function() {
  // Convert the response data into something template will understand.
  var responseData = JSON.parse(this.responseText);
  var duckListEl = document.getElementById('duckList');
  duckListEl.innerHTML =
      Pond.Duck.Board.soy.duckList({ducks: responseData["duckList"]}, null);
  document.getElementById('loading').style.display = 'none';

  var copyBtns = duckListEl.getElementsByClassName('copyDuck');
  var deleteBtns = duckListEl.getElementsByClassName('deleteDuck');
  var editBtns = duckListEl.getElementsByClassName('editDuck');
  for(var i = 0, cpyBtn; (cpyBtn = copyBtns[i]); i++) {
    BlocklyGames.bindClick(cpyBtn, Pond.Duck.Board.copyDuck);
  }
  for(var i = 0, deleteBtn; (deleteBtn = deleteBtns[i]); i++) {
    BlocklyGames.bindClick(deleteBtn, Pond.Duck.Board.deleteDuck);
  }
  for(var i = 0, editBtn; (editBtn = editBtns[i]); i++) {
    BlocklyGames.bindClick(editBtn, Pond.Duck.Board.editDuck);
  }
};

window.addEventListener('load', Pond.Duck.Board.init);
