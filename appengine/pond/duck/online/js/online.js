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

  BlocklyGames.bindClick('duckCreateButton', Pond.Duck.Online.showCreateDuckForm);
  BlocklyGames.bindClick('duckUpdateButton', Pond.Duck.Online.showUpdateDuckForm);
  BlocklyGames.bindClick('duckDeleteButton', Pond.Duck.Online.showDeleteDuckForm);
};

Pond.Duck.Online.storeUserCode_ = function(formPrefix) {
  // Store the user code in the form inputs
  document.getElementById(formPrefix +'Js').value =
      BlocklyInterface.getJsCode();
  document.getElementById(formPrefix + 'Xml').value =
      BlocklyInterface.blocksDisabled ? '' : BlocklyInterface.getXml();
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

Pond.Duck.Online.showDuckForm_ = function(formPrefix, defaultFocusElId, storeUserCode) {
  if (storeUserCode) {
    Pond.Duck.Online.storeUserCode_(formPrefix);
  }
  var content = document.getElementById(formPrefix + 'Dialog');
  var style = {
    width: '40%',
    left: '30%',
    top: '3em'
  };
  var origin = document.getElementById(formPrefix + 'Button');
  BlocklyDialogs.showDialog(content, origin, true, true, style);
  // Wait for the opening animation to complete, then focus the title field.
  setTimeout(function() {
    document.getElementById(defaultFocusElId).focus();
  }, 250);
};

Pond.Duck.Online.bindFormButtonEvents_ = function(formPrefix, formSubmitCallback) {
  var cancel = document.getElementById(formPrefix + 'Cancel');
  cancel.addEventListener('click', BlocklyDialogs.hideDialog, true);
  cancel.addEventListener('touchend', BlocklyDialogs.hideDialog, true);
  var ok = document.getElementById(formPrefix + 'Ok');
  ok.addEventListener('click',formSubmitCallback, true);
  ok.addEventListener('touchend', formSubmitCallback, true);
};

/**
 * Display a dialog for creating a duck.
 */
Pond.Duck.Online.showCreateDuckForm = function() {
  if (!Pond.Duck.Online.showCreateDuckForm.runOnce_) {
    Pond.Duck.Online.bindFormButtonEvents_('duckCreate', Pond.Duck.Online.duckCreate);
    // Only bind the buttons once.
    Pond.Duck.Online.showCreateDuckForm.runOnce_ = true;
  }
  Pond.Duck.Online.showDuckForm_('duckCreate', 'duckCreateName', true);
};

/**
 * Display a dialog for updating a duck.
 */
Pond.Duck.Online.showUpdateDuckForm = function() {
  if (!Pond.Duck.Online.showUpdateDuckForm.runOnce_) {
    Pond.Duck.Online.bindFormButtonEvents_('duckUpdate', Pond.Duck.Online.duckUpdate);
    // Only bind the buttons once.
    Pond.Duck.Online.showUpdateDuckForm.runOnce_ = true;
  }
  Pond.Duck.Online.showDuckForm_('duckUpdate', 'duckUpdateDuckKey', true);
};

/**
 * Display a dialog for deleting a duck.
 */
Pond.Duck.Online.showDeleteDuckForm = function() {
  if (!Pond.Duck.Online.showDeleteDuckForm.runOnce_) {
    Pond.Duck.Online.bindFormButtonEvents_('duckDelete', Pond.Duck.Online.duckDelete);
    // Only bind the buttons once.
    Pond.Duck.Online.showDeleteDuckForm.runOnce_ = true;
  }
  Pond.Duck.Online.showDuckForm_('duckDelete', 'duckDeleteDuckKey', false);
};

Pond.Duck.Online.createDuckFormOnLoadCallback_ = function(action) {
  return function() {
    var text;
    if (this.status == 200) {
      var meta = JSON.parse(this.responseText);
      text = 'Duck ' + action + ' with key: ' + meta['duck_key'];
    } else {
      text = BlocklyGames.getMsg('Games_httpRequestError') + '\nStatus: '
          + this.status;
    }
    BlocklyDialogs.storageAlert(null, text);
  };
};

/**
 * Encode form elements in map.
 * @param {HTMLFormElement} form Form to encode elements from.
 * @return {Object.<string, string>} Encoded elements.
 * @private
 */
Pond.Duck.Online.encodeFormElements_ = function(form) {
  var data = [];
  for (var i = 0, element; (element = form.elements[i]); i++) {
    if (element.name) {
      data[i] = encodeURIComponent(element.name) + '=' +
          encodeURIComponent(element.value);
    }
  }
  return data
};

Pond.Duck.Online.submitDuckForm_ = function(requiredFieldsIds, formId, action) {
  for(var i = 0, fieldId; (fieldId = requiredFieldsIds[i]); i++) {
    var el = document.getElementById(fieldId);
    if (!el.value.trim()) {
      el.value = '';
      el.focus();
      return;
    }
  }
  var form = document.getElementById(formId);
  var data = Pond.Duck.Online.encodeFormElements_(form);
  var onLoadCallback = Pond.Duck.Online.createDuckFormOnLoadCallback_(action);
  Pond.Duck.Online.makeRequest(form.action, data, onLoadCallback);
  BlocklyDialogs.hideDialog(true);
};

/**
 * Create a duck form.
 */
Pond.Duck.Online.duckCreate = function() {
  Pond.Duck.Online.submitDuckForm_(['duckCreateUserId', 'duckCreateName'], 'duckCreateForm', 'created');
};

/**
 * Update a duck form.
 */
Pond.Duck.Online.duckUpdate = function() {
  Pond.Duck.Online.submitDuckForm_(['duckUpdateDuckKey', 'duckUpdateUserId'], 'duckUpdateForm', 'updated');
};

/**
 * Delete a duck form.
 */
Pond.Duck.Online.duckDelete = function() {
  Pond.Duck.Online.submitDuckForm_(['duckDeleteDuckKey', 'duckDeleteUserId'], 'duckDeleteForm', 'deleted');
};

window.addEventListener('load', Pond.Duck.Online.init);
