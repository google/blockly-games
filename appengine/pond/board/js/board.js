/**
 * @license
 * Copyright 2014 Google LLC
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
 * @fileoverview Creates a multi-user pond (duck page).
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Pond.Board');

goog.require('BlocklyGames');
goog.require('Pond.Datastore');
goog.require('Pond.Board.soy');


/**
 * Initialize Ace and the pond.  Called on page load.
 */
Pond.Board.init = function () {
  //TODO: Have a loading screen before loading the ducks
  Pond.Datastore.getAllDucks(Pond.Board.getDucksCallback);
};


Pond.Board.copyDuck = function(e) {
  var duckId = e.srcElement.getAttribute('duckId');
  Pond.Datastore.copyDuck(duckId, Pond.Board.copyCallback);
};

Pond.Board.deleteDuck = function(e) {
  var duckId = e.srcElement.getAttribute('duckId');
  Pond.Datastore.deleteDuck(duckId, Pond.Board.deleteCallback);
};

Pond.Board.createDuck = function() {
  console.log("Show dialog here");
};

Pond.Board.getDucksCallback = function() {
  var text;
  if (this.status == 200) {
    var duckList = JSON.parse(this.responseText);
    Pond.Board.setTemplate(duckList)
  } else {
    text = BlocklyGames.getMsg('Games_httpRequestError') + '\nStatus: '
        + this.status;
  }
};

Pond.Board.deleteCallback = function() {
  var text;
  if (this.status == 200) {
    console.log("In delete");
  } else {
    text = BlocklyGames.getMsg('Games_httpRequestError') + '\nStatus: '
        + this.status;
  }
};

Pond.Board.copyCallback = function() {
  var text;
  if (this.status == 200) {
    var duckList = JSON.parse(this.responseText);
    Pond.Datastore.getAllDucks(Pond.Board.getDucksCallback);
  } else {
    text = BlocklyGames.getMsg('Games_httpRequestError') + '\nStatus: '
        + this.status;
  }
};

/**
 * 
 */
Pond.Board.setTemplate = function(ducks) {
  console.log("ducks length: " + ducks.length);
  document.body.innerHTML = Pond.Board.soy.start({}, null,
    {
      lang: BlocklyGames.LANG,
      html: BlocklyGames.IS_HTML,
      ducks: ducks
    });
  var copyBtns = document.getElementsByClassName('copyDuck');
  var deleteBtns = document.getElementsByClassName('deleteDuck');
  var createBtn = document.getElementById('createButton');
  for (var i = 0; i < copyBtns.length; i++) {
    BlocklyGames.bindClick(copyBtns[i], Pond.Board.copyDuck);
  }
  for (var i = 0; i < deleteBtns.length; i++) {
    BlocklyGames.bindClick(deleteBtns[i], Pond.Board.deleteDuck);
  }
  BlocklyGames.bindClick(createBtn, Pond.Board.createDuck);

};

window.addEventListener('load', Pond.Board.init);
