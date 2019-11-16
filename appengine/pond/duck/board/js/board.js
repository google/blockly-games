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

goog.provide('Pond.Duck.Board');

goog.require('BlocklyGames');
goog.require('Pond');
goog.require('Pond.Duck');
goog.require('Pond.Duck.Board.soy');

/**
 * Initialize Ace and the pond.  Called on page load.
 */
Pond.Duck.Board.init = function () {
  //TODO: Have a loading screen before loading the ducks
  var userid = Pond.Duck.Board.querystring('userid');
  Pond.Duck.Board.getAllDucks(userid);
};

Pond.Duck.Board.querystring = function(obj) {  
  var result = [];
  var match;
  var re = new RegExp('(?:\\?|&)' + obj + '=(.*?)(?=&|$)', 'gi');
  while ((match = re.exec(document.location.search)) !== null) {
      result.push(match[1]);
  }
  return result;
}

/**
 * 
 */
Pond.Duck.Board.setTemplate = function(ducks) {
  document.body.innerHTML = Pond.Duck.Board.soy.start({}, null,
    {
      lang: BlocklyGames.LANG,
      html: BlocklyGames.IS_HTML,
      ducks: ducks
    });
};

/**
 * 
 */
Pond.Duck.Board.getAllDucks = function(userid) {
  var url = 'pond-storage/ducks?userid=' + userid;
  var onLoadCallback = function() {
    var text;
    if (this.status == 200) {
      var duckList = JSON.parse(this.responseText);
      Pond.Duck.Board.setTemplate(duckList)
    } else {
      text = BlocklyGames.getMsg('Games_httpRequestError') + '\nStatus: '
          + this.status;
    }
  };
  Pond.Duck.Board.makeRequest(url, 'GET', {}, onLoadCallback);
};

/**
 * Fire a new AJAX request.
 * @param {string} url URL to fetch.
 * @param {Object.<string, string>} data Body of data to be sent in request.
 * @private
 */
Pond.Duck.Board.makeRequest = function(url, type, data, onLoadCallback) {
  var xhr = new XMLHttpRequest();
  xhr.open(type, url);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.onload = onLoadCallback;
  xhr.send();
};

window.addEventListener('load', Pond.Duck.Board.init);
