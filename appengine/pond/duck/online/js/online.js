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

goog.require('Blockly.utils.dom');
goog.require('BlocklyInterface');
goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyGames.Msg');
goog.require('Pond');
goog.require('Pond.Duck');
goog.require('Pond.Battle');
goog.require('Pond.Duck.Datastore');
goog.require('Pond.Duck.Online.soy');

BlocklyGames.NAME = 'pond-duck-online';

/**
 * UrlSafe key of currently loaded duck.
 * @type {string}
 */
Pond.Duck.Online.duckKey = undefined;

/**
 * Name of the currently loaded duck or null if no duck is loaded.
 * @type {?string}
 */
Pond.Duck.Online.NAME = null;

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
  Pond.Duck.TAB_INDEX.DUCK_INFO = 2;
  Pond.Duck.init();

  BlocklyGames.bindClick('duckCreateButton', Pond.Duck.Online.showCreateDuckForm);
  BlocklyGames.bindClick('duckUpdateButton', Pond.Duck.Online.showUpdateDuckForm);
  BlocklyGames.bindClick('duckDeleteButton', Pond.Duck.Online.showDeleteDuckForm);
  BlocklyGames.bindClick('getOpponents', function() {
    Pond.Duck.Datastore.getOpponents(
        Pond.Duck.Online.duckKey,
        Pond.Duck.Online.addNewOpponents);
  });
  BlocklyGames.bindClick('defaultOpponents', function() {
    Pond.Duck.loadDefaultAvatars(Pond.Duck.Online.NAME);
  });

  Pond.Duck.loadDefaultAvatars();

  Pond.Duck.Online.duckKey =  BlocklyGames.getStringParamFromUrl('duck', null);
  if (Pond.Duck.Online.duckKey) {
    Pond.Duck.Online.tempDisableEditors(true);
    Pond.Duck.Datastore.getDuck(
        Pond.Duck.Online.duckKey, Pond.Duck.Online.loadDuck);
  } else {
    Blockly.utils.dom.addClass(
        Pond.Duck.tabs[Pond.Duck.TAB_INDEX.DUCK_INFO], 'tab-disabled');
    document.getElementById('spinner').style.display = 'none';
    // Load default code.
    Pond.Duck.loadDefaultCode();
    // Show Blockly editor tab.
    Pond.Duck.changeTab(Pond.Duck.TAB_INDEX.BLOCKLY);
  }
};

/**
 * Temporarily disable editors (does not affect blocksDisabled).
 * @param {boolean} disable Whether to disable the editors.
 */
Pond.Duck.Online.tempDisableEditors = function(disable) {
  if (disable) {
    Blockly.utils.dom.addClass(
        Pond.Duck.tabs[Pond.Duck.TAB_INDEX.BLOCKLY], 'tab-disabled');
    Blockly.utils.dom.addClass(
        Pond.Duck.tabs[Pond.Duck.TAB_INDEX.JAVASCRIPT], 'tab-disabled');
    Pond.Duck.tabContent[Pond.Duck.TAB_INDEX.BLOCKLY].style.visibility = 'hidden';
    Pond.Duck.tabContent[Pond.Duck.TAB_INDEX.BLOCKLY].style.visibility = 'hidden';
  } else {
    Blockly.utils.dom.removeClass(
        Pond.Duck.tabs[Pond.Duck.TAB_INDEX.BLOCKLY], 'tab-disabled');
    Blockly.utils.dom.removeClass(
        Pond.Duck.tabs[Pond.Duck.TAB_INDEX.JAVASCRIPT], 'tab-disabled');
  }
};

/**
 * Callback for when a user loads the page with a duck id.
 */
Pond.Duck.Online.loadDuck = function() {
  document.getElementById('spinner').style.display = 'none';
  // Load duck code.
  var meta = JSON.parse(this.responseText);
  var opt_xml = meta['code']['opt_xml'];
  var code = opt_xml || meta['code']['js'];

  Pond.Duck.Online.tempDisableEditors(false);
  Pond.Duck.setBlocksEnabled(!!opt_xml);
  Pond.Duck.setCode(code);
  Pond.Duck.Online.NAME = meta.name;
  // Update content of duck info tab.
  Pond.Duck.Online.renderDuckInfo.call(this);

  // Show Duck Info tab.
  Pond.Duck.selectTab(Pond.Duck.TAB_INDEX.DUCK_INFO);
  Pond.Duck.loadDefaultAvatars(Pond.Duck.Online.NAME);
};

Pond.Duck.Online.renderDuckInfo = function() {
  // Load duck info template.
  var data = JSON.parse(this.responseText);
  var duckInfoEl = document.getElementById('duck-info');
  duckInfoEl.innerHTML =
      Pond.Duck.Online.soy.duckInfo({duck: data}, null);

  // Bind button clicks.
  if (data["published"]) {
    BlocklyGames.bindClick(
        'unPublishButton',
        function() {
          Pond.Duck.Datastore.setPublished(
              Pond.Duck.Online.duckKey, false, Pond.Duck.Online.renderDuckInfo);
        });
  } else {
    BlocklyGames.bindClick(
        'publishButton',
        function() {
          Pond.Duck.Datastore.setPublished(
              Pond.Duck.Online.duckKey, true, Pond.Duck.Online.renderDuckInfo);
        });
  }
  BlocklyGames.bindClick(
      'deleteButton',
      function() {
        Pond.Duck.Datastore.deleteDuck(
            Pond.Duck.Online.duckKey, false,
            function() {
              var url = window.location.origin
                  + '/pond-duck-online?lang='+ BlocklyGames.LANG;
              window.location = url;
            });
      });

  BlocklyGames.bindClick(
      'copyButton',
      function() {
        Pond.Duck.Datastore.copyDuck(Pond.Duck.Online.duckKey,false,
            Pond.Duck.Datastore.redirectToNewDuck);
      });

  BlocklyGames.bindClick(
      'saveButton',
      function() {
        Pond.Duck.Datastore.updateDuckCode(
            Pond.Duck.Online.duckKey,
            BlocklyInterface.getJsCode(),
            BlocklyInterface.blocksDisabled ? '' : BlocklyInterface.getXml(),
            Pond.Duck.Online.renderDuckInfo);
      });
};

/**
 * Load a new set of opponents.
 */
Pond.Duck.Online.addNewOpponents = function() {
  var opponentList = JSON.parse(this.responseText);
  var avatarList = [Pond.Avatar.createPlayerAvatar(Pond.Duck.Online.NAME)];
  // TODO: If we don't have three opponents then fill in with default
  if (opponentList) {
    for (var i = 0, duck; (duck = opponentList[i]); i++) {
      var newAvatar = new Pond.Avatar(duck.name, duck['code']['js']);
      avatarList.push(newAvatar);
    }
    Pond.Duck.loadAvatars(avatarList);
  }
};

/* Logic for Buttons and Forms for debugging purposes. */
/**
 * Store user code in specified form.
 * @param {string} formPrefix Prefix of element ids for form.
 */
Pond.Duck.Online.storeUserCodeInForm_ = function(formPrefix) {
  // Store the user code in the form inputs
  document.getElementById(formPrefix +'Js').value =
      BlocklyInterface.getJsCode();
  document.getElementById(formPrefix + 'Xml').value =
      BlocklyInterface.blocksDisabled ? '' : BlocklyInterface.getXml();
};
/**
 * Display dialog based on specified form prefix.
 * @param {string} formPrefix Prefix of element ids for form.
 * @param {string} defaultFocusElId Element id of element to focus after opening
 *    form.
 * @param {boolean} storeUserCode Whether to store user code in element.
 */
Pond.Duck.Online.showDuckForm_ = function(formPrefix, defaultFocusElId, storeUserCode) {
  if (storeUserCode) {
    Pond.Duck.Online.storeUserCodeInForm_(formPrefix);
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
/**
 * Bind button click events for specified form.
 * @param {string} formPrefix Prefix of element ids for form.
 * @param {!Function} formSubmitCallback Callback for form submit.
 */
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
    Pond.Duck.Online.bindFormButtonEvents_('duckCreate', Pond.Duck.Online.duckCreateForm);
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
    Pond.Duck.Online.bindFormButtonEvents_('duckUpdate', Pond.Duck.Online.duckUpdateForm);
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
    Pond.Duck.Online.bindFormButtonEvents_('duckDelete', Pond.Duck.Online.duckDeleteForm);
    // Only bind the buttons once.
    Pond.Duck.Online.showDeleteDuckForm.runOnce_ = true;
  }
  Pond.Duck.Online.showDuckForm_('duckDelete', 'duckDeleteDuckKey', false);
};
/**
 * Creates a popup with information on what action was completed, or an error message.
 * @param {string} action The action completed. (created, deleted, updated)
 */
Pond.Duck.Online.createDuckFormOnLoadCallback_ = function(action) {
  return function() {
    var meta = JSON.parse(this.responseText);
    var text = 'Duck ' + action + ' with key: ' + meta['duck_key'];
    BlocklyDialogs.storageAlert(null, text);
  };
};
/**
 * Encode form elements in map.
 * @param {HTMLFormElement} form Form to encode elements from.
 * @return {Array<string>} Encoded elements in a list of strings in the form:
 *    "<name>=<value>"
 * @private
 */
Pond.Duck.Online.encodeFormElements_ = function(form) {
  var data = [];
  for (var i = 0, element; (element = form.elements[i]); i++) {
    if (element.name) {
      data.push(encodeURIComponent(element.name) + '='
          + encodeURIComponent(element.value));
    }
  }
  return data
};
/**
 * Submits the form information.
 * @param {Array.<string>} requiredFieldsIds The required ids for the fields we
 *     want to send in the request.
 * @param {string} formId The id of the form used to collect information on
 *     what info to send in the request.
 * @param {string} action The action completed. (created, deleted, updated)
 */
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
  BlocklyStorage['makeRequest'](form.action, data.join('&'), onLoadCallback);
  BlocklyDialogs.hideDialog(true);
};
/**
 * Create a duck form.
 */
Pond.Duck.Online.duckCreateForm = function() {
  Pond.Duck.Online.submitDuckForm_(['duckCreateName'], 'duckCreateForm', 'created');
};
/**
 * Update a duck form.
 */
Pond.Duck.Online.duckUpdateForm = function() {
  Pond.Duck.Online.submitDuckForm_(['duckUpdateDuckKey'], 'duckUpdateForm', 'updated');
};
/**
 * Delete a duck form.
 */
Pond.Duck.Online.duckDeleteForm = function() {
  Pond.Duck.Online.submitDuckForm_(['duckDeleteDuckKey'], 'duckDeleteForm', 'deleted');
};

window.addEventListener('load', Pond.Duck.Online.init);
