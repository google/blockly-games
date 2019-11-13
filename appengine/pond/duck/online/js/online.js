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
 * @fileoverview Creates a multi-user online pond (online duck page).
 * @author kozbial@google.com (Monica Kozbial)
 */
'use strict';

goog.provide('Pond.Duck.Online');

goog.require('BlocklyInterface');
goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('Pond');
goog.require('Pond.Duck');
goog.require('Pond.Duck.Online.soy');

BlocklyGames.NAME = 'pond-duck-online';

/**
 * Initialize Ace and the pond.  Called on page load.
 */
Pond.Duck.Online.init = function() {
  // Render the Soy template.
  document.body.innerHTML = Pond.Duck.Online.soy.start({}, null,
      {
        lang: BlocklyGames.LANG,
        html: BlocklyGames.IS_HTML
      });

  Pond.Duck.init();

  BlocklyGames.bindClick('createButton', Pond.Duck.Online.showCreateDuckForm);
  BlocklyGames.bindClick('updateButton', Pond.Duck.Online.showUpdateDuckForm);
  BlocklyGames.bindClick('deleteButton', Pond.Duck.Online.showDeleteDuckForm);
};

/**
 * Display a dialog for creating a duck.
 */
Pond.Duck.Online.showCreateDuckForm = function() {
  // Encode the user code
  document.getElementById('createJs').value =
      BlocklyInterface.editor['getValue']();
  document.getElementById('createXml').value =
      Pond.Duck.Online.blocksEnabled_ ? BlocklyInterface.getXml() : '';

  var content = document.getElementById('duckCreateDialog');
  var style = {
    width: '40%',
    left: '30%',
    top: '3em'
  };

  if (!Pond.Duck.Online.showCreateDuckForm.runOnce_) {
    var cancel = document.getElementById('duckCreateCancel');
    cancel.addEventListener('click', BlocklyDialogs.hideDialog, true);
    cancel.addEventListener('touchend', BlocklyDialogs.hideDialog, true);
    var ok = document.getElementById('duckCreateOk');
    ok.addEventListener('click', Pond.Duck.Online.duckCreate, true);
    ok.addEventListener('touchend', Pond.Duck.Online.duckCreate, true);
    // Only bind the buttons once.
    Pond.Duck.Online.showCreateDuckForm.runOnce_ = true;
  }
  var origin = document.getElementById('createButton');
  BlocklyDialogs.showDialog(content, origin, true, true, style);
  // Wait for the opening animation to complete, then focus the title field.
  setTimeout(function() {
    document.getElementById('createName').focus();
  }, 250);
};

/**
 * Display a dialog for updating a duck.
 */
Pond.Duck.Online.showUpdateDuckForm = function() {
  // Encode the user code
  document.getElementById('updateJs').value =
      BlocklyInterface.editor['getValue']();
  document.getElementById('updateXml').value =
      Pond.Duck.Online.blocksEnabled_ ? BlocklyInterface.getXml() : '';

  var content = document.getElementById('duckUpdateDialog');
  var style = {
    width: '40%',
    left: '30%',
    top: '3em'
  };

  if (!Pond.Duck.Online.showUpdateDuckForm.runOnce_) {
    var cancel = document.getElementById('duckUpdateCancel');
    cancel.addEventListener('click', BlocklyDialogs.hideDialog, true);
    cancel.addEventListener('touchend', BlocklyDialogs.hideDialog, true);
    var ok = document.getElementById('duckUpdateOk');
    ok.addEventListener('click', Pond.Duck.Online.duckUpdate, true);
    ok.addEventListener('touchend', Pond.Duck.Online.duckUpdate, true);
    // Only bind the buttons once.
    Pond.Duck.Online.showUpdateDuckForm.runOnce_ = true;
  }
  var origin = document.getElementById('updateButton');
  BlocklyDialogs.showDialog(content, origin, true, true, style);
  // Wait for the opening animation to complete, then focus the title field.
  setTimeout(function() {
    document.getElementById('updateDuckKey').focus();
  }, 250);
};

/**
 * Display a dialog for deleting a duck.
 */
Pond.Duck.Online.showDeleteDuckForm = function() {
  var content = document.getElementById('duckDeleteDialog');
  var style = {
    width: '40%',
    left: '30%',
    top: '3em'
  };

  if (!Pond.Duck.Online.showDeleteDuckForm.runOnce_) {
    var cancel = document.getElementById('duckDeleteCancel');
    cancel.addEventListener('click', BlocklyDialogs.hideDialog, true);
    cancel.addEventListener('touchend', BlocklyDialogs.hideDialog, true);
    var ok = document.getElementById('duckDeleteOk');
    ok.addEventListener('click', Pond.Duck.Online.duckDelete, true);
    ok.addEventListener('touchend', Pond.Duck.Online.duckDelete, true);
    // Only bind the buttons once.
    Pond.Duck.Online.showDeleteDuckForm.runOnce_ = true;
  }
  var origin = document.getElementById('deleteButton');
  BlocklyDialogs.showDialog(content, origin, true, true, style);
  // Wait for the opening animation to complete, then focus the title field.
  setTimeout(function() {
    document.getElementById('deleteDuckKey').focus();
  }, 250);
};

/**
 * Fire a new AJAX request.
 * @param {string} url URL to fetch.
 * @param {Object.<string, string>} data Body of data to be sent in request.
 * @private
 */
Pond.Duck.Online.makeRequest = function(url, data, onLoadCallback) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', url);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.onload = onLoadCallback;
  xhr.send(data.join('&'));
};

/**
 * Encode form elements in map.
 * @param {HTMLFormElement} form Form to encode elements from.
 * @return {Object.<string, string>} Encoded elements.
 * @private
 */
Pond.Duck.Online.encodeFormElements = function(form) {
  var data = [];
  for (var i = 0, element; (element = form.elements[i]); i++) {
    if (element.name) {
      data[i] = encodeURIComponent(element.name) + '=' +
          encodeURIComponent(element.value);
    }
  }
  return data
};

/**
 * Create a duck form.
 */
Pond.Duck.Online.duckCreate = function() {
  // Check that there is a user id.
  var userid = document.getElementById('createUserId');
  if (!userid.value.trim()) {
    userid.value = '';
    userid.focus();
    return;
  }
  // Check that there is a duck name.
  var name = document.getElementById('createName');
  if (!name.value.trim()) {
    name.value = '';
    name.focus();
    return;
  }

  var form = document.getElementById('duckCreateForm');
  var data = Pond.Duck.Online.encodeFormElements(form);
  var onLoadCallback = function() {
    if (this.readyState == 4) {
      var text;
      if (this.status == 200) {
        var meta = JSON.parse(this.responseText);
        text = 'Duck created with key: ' + meta['duck_key'];
      } else {
        text = BlocklyGames.getMsg('Games_httpRequestError') + '\nStatus: '
            + this.status;
      }
      BlocklyDialogs.storageAlert(null, text);
    }
  };
  Pond.Duck.Online.makeRequest(form.action, data, onLoadCallback);
  BlocklyDialogs.hideDialog(true);
};

/**
 * Update a duck form.
 */
Pond.Duck.Online.duckUpdate = function() {
  // Check that there is a duck key.
  var duckKey = document.getElementById('updateDuckKey');
  if (!duckKey.value.trim()) {
    duckKey.value = '';
    duckKey.focus();
    return;
  }
  // Check that there is a user id.
  var userid = document.getElementById('updateUserId');
  if (!userid.value.trim()) {
    userid.value = '';
    userid.focus();
    return;
  }

  var form = document.getElementById('duckUpdateForm');
  var data = Pond.Duck.Online.encodeFormElements(form);
  var onLoadCallback = function() {
    if (this.readyState == 4) {
      var text;
      if (this.status == 200) {
        var meta = JSON.parse(this.responseText);
        text = 'Duck updated with key: ' + meta['duck_key'];
      } else {
        text = BlocklyGames.getMsg('Games_httpRequestError') + '\nStatus: '
            + this.status;
      }
      BlocklyDialogs.storageAlert(null, text);
    }
  };
  Pond.Duck.Online.makeRequest(form.action, data, onLoadCallback);
  BlocklyDialogs.hideDialog(true);
};

/**
 * Delete a duck form.
 */
Pond.Duck.Online.duckDelete = function() {
  // Check that there is a duck key.
  var duckKey = document.getElementById('deleteDuckKey');
  if (!duckKey.value.trim()) {
    duckKey.value = '';
    duckKey.focus();
    return;
  }
  // Check that there is a user id.
  var userid = document.getElementById('deleteUserId');
  if (!userid.value.trim()) {
    userid.value = '';
    userid.focus();
    return;
  }

  var form = document.getElementById('duckDeleteForm');
  var data = Pond.Duck.Online.encodeFormElements(form);
  var onLoadCallback = function() {
    if (this.readyState == 4) {
      var text;
      if (this.status == 200) {
        var meta = JSON.parse(this.responseText);
        text = 'Duck deleted with key: ' + meta['duck_key'];
      } else {
        text = BlocklyGames.getMsg('Games_httpRequestError') + '\nStatus: '
            + this.status;
      }
      BlocklyDialogs.storageAlert(null, text);
    }
  };
  Pond.Duck.Online.makeRequest(form.action, data, onLoadCallback);
  BlocklyDialogs.hideDialog(true);
};

window.addEventListener('load', Pond.Duck.Online.init);
