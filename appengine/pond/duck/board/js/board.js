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

goog.require('BlocklyGames');
goog.require('Pond.Datastore');
goog.require('Pond.Duck.Board.soy');


/**
 * Initialize the board holding all the ducks for the current user.
 */
Pond.Duck.Board.init = function () {
  //TODO: Have a loading screen before loading the ducks
  Pond.Datastore.getAllDucks(Pond.Duck.Board.getDucksCallback);
};

/**
 * Copy the duck with the given duckId.
 * @param {Event} e The event that holds the duckId.
 */
Pond.Duck.Board.copyDuck = function(e) {
  var duckId = e.srcElement.getAttribute('duckId');
  Pond.Datastore.copyDuck(duckId, Pond.Duck.Board.copyCallback);
};

/**
 * Delete the duck with the given duckId.
 * @param {Event} e The event that holds the duckId.
 */
Pond.Duck.Board.deleteDuck = function(e) {
  var duckId = e.srcElement.getAttribute('duckId');
  Pond.Datastore.deleteDuck(duckId, Pond.Duck.Board.deleteCallback);
};

/**
 * TODO: Show the dialog to create a duck.
 */
Pond.Duck.Board.createDuck = function() {
  console.log("Show dialog here");
};

/**
 * Callback for when all the ducks for a user are fetched.s
 */
Pond.Duck.Board.getDucksCallback = function() {
  var text;
  if (this.status == 200) {
    var duckList = JSON.parse(this.responseText);
    Pond.Duck.Board.setTemplate(duckList)
  } else {
    text = BlocklyGames.getMsg('Games_httpRequestError') + '\nStatus: '
        + this.status;
  }
};

/**
 * Callback for when a duck is deleted.
 */
Pond.Duck.Board.deleteCallback = function() {
  if (this.status == 200) {
    // TODO: Get all ducks and update the template
  } else {
    var text = BlocklyGames.getMsg('Games_httpRequestError') + '\nStatus: '
        + this.status;
  }
};

/**
 * Callback for when a duck is copied.
 */
Pond.Duck.Board.copyCallback = function() {
  if (this.status == 200) {
    // TODO: Get all ducks and update the template
  } else {
    var text = BlocklyGames.getMsg('Games_httpRequestError') + '\nStatus: '
        + this.status;
  }
};

/**
 * Set the template and add bind all events.s
 */
Pond.Duck.Board.setTemplate = function(ducks) {
  document.body.innerHTML = Pond.Duck.Board.soy.start({}, null,
    {
      lang: BlocklyGames.LANG,
      html: BlocklyGames.IS_HTML,
      ducks: ducks
    });
  var copyBtns = document.getElementsByClassName('copyDuck');
  var deleteBtns = document.getElementsByClassName('deleteDuck');
  var createBtn = document.getElementById('createButton');
  for (var i = 0; i < copyBtns.length; i++) {
    BlocklyGames.bindClick(copyBtns[i], Pond.Duck.Board.copyDuck);
  }
  for (var i = 0; i < deleteBtns.length; i++) {
    BlocklyGames.bindClick(deleteBtns[i], Pond.Duck.Board.deleteDuck);
  }
  BlocklyGames.bindClick(createBtn, Pond.Duck.Board.createDuck);

};

window.addEventListener('load', Pond.Duck.Board.init);
