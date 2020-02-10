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
goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('BlocklyStorage');
goog.require('Pond.Avatar');
goog.require('Pond.Duck');
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
 * Initializes Ace and the pond.  Called on page load.
 */
Pond.Duck.Online.init = function() {
  Pond.Duck.Online.duckKey =  BlocklyGames.getStringParamFromUrl('duck', null);
  // Render the Soy template.
  document.body.innerHTML = Pond.Duck.Online.soy.start({}, null,
      {
        lang: BlocklyGames.LANG,
        html: BlocklyGames.IS_HTML,
        duckKey: Pond.Duck.Online.duckKey
      });
  Pond.Duck.TAB_INDEX.DUCK_INFO = 2;
  Pond.Duck.init();

  Pond.Duck.Online.disableInteraction(true);
  // Hide Editors before content loads.
  Pond.Duck.tabContent[Pond.Duck.TAB_INDEX.BLOCKLY]
      .style.visibility = 'hidden';
  Pond.Duck.tabContent[Pond.Duck.TAB_INDEX.JAVASCRIPT]
      .style.visibility = 'hidden';
  // Load content or open dialog to choose content to load
  if (Pond.Duck.Online.duckKey) {
    Pond.Duck.Datastore.getDuck(
        Pond.Duck.Online.duckKey, Pond.Duck.Online.loadDuck,
        function() {
          var url = window.location.origin
              + '/pond-duck-online?lang='+ BlocklyGames.LANG;
          window.location = url;
        });
  } else {
    document.getElementById('spinner').style.display = 'none';
    Pond.reset();
    Pond.Duck.Online.openDuckList_();
  }
  // Bind buttons
  BlocklyGames.bindClick('duckListButton', Pond.Duck.Online.openDuckList_);
  BlocklyGames.bindClick('getOpponents', function() {
    Pond.Duck.Datastore.getOpponents(
        Pond.Duck.Online.duckKey,
        Pond.Duck.Online.loadNewOpponents);
  });

  BlocklyGames.bindClick('leaderboard-tab', Pond.Duck.Online.refreshLeaderboard_);
  BlocklyGames.bindClick('defaultOpponents', function() {
    Pond.Duck.loadDefaultAvatars(Pond.Duck.Online.NAME);
  });
  BlocklyInterface.workspace.addChangeListener(function() {
    var saveBtn = document.getElementById('saveButton');
    if (saveBtn) {
      saveBtn.disabled = false;
    }
  });
};

/**
 * Add an iframe holding the leaderboard to the tab. If an iframe already exists
 * then refresh the leaderboard.
 */
Pond.Duck.Online.refreshLeaderboard_ = function() {
  var iframe = document.getElementById('leaderboard-iframe');
  iframe.contentWindow.location.reload(true);
};

/**
 * Temporarily disables/enables tabs and code buttons (does not affect
 * blocksDisabled).
 * @param {boolean} disable Whether to disable..
 */
Pond.Duck.Online.disableInteraction = function(disable) {
  if (disable) {
    Blockly.utils.dom.addClass(
        Pond.Duck.tabs[Pond.Duck.TAB_INDEX.BLOCKLY], 'tab-disabled');
    Blockly.utils.dom.addClass(
        Pond.Duck.tabs[Pond.Duck.TAB_INDEX.JAVASCRIPT], 'tab-disabled');
    Blockly.utils.dom.addClass(
        Pond.Duck.tabs[Pond.Duck.TAB_INDEX.DUCK_INFO], 'tab-disabled');

  } else {
    Blockly.utils.dom.removeClass(
        Pond.Duck.tabs[Pond.Duck.TAB_INDEX.BLOCKLY], 'tab-disabled');
    Blockly.utils.dom.removeClass(
        Pond.Duck.tabs[Pond.Duck.TAB_INDEX.JAVASCRIPT], 'tab-disabled');
    Blockly.utils.dom.removeClass(
        Pond.Duck.tabs[Pond.Duck.TAB_INDEX.DUCK_INFO], 'tab-disabled');
  }
  document.getElementById('runButton').disabled = disable;
  document.getElementById('resetButton').disabled = disable;
  document.getElementById('getOpponents').disabled = disable;
  document.getElementById('defaultOpponents').disabled = disable;
};

/**
 * Loads a duck into the page.
 * Called as request callback with Duck information in its response.
 */
Pond.Duck.Online.loadDuck = function() {
  document.getElementById('spinner').style.display = 'none';
  // Load duck code.
  var meta = JSON.parse(this.responseText);
  var opt_xml = meta['code']['opt_xml'];
  var code = opt_xml || meta['code']['js'];

  Pond.Duck.Online.disableInteraction(false);
  Pond.Duck.setBlocksEnabled(!!opt_xml);
  Pond.Duck.setCode(code);
  Pond.Duck.Online.NAME = meta['name'];
  // Load opponents.
  Pond.Duck.loadDefaultAvatars(Pond.Duck.Online.NAME);
  // Update content of duck info tab.
  Pond.Duck.Online.renderDuckInfo.call(this);
  // Show Duck Info tab.
  Pond.Duck.selectTab(Pond.Duck.TAB_INDEX.DUCK_INFO);
};

/**
 * Renders the duck info tab.
 * Called as request callback with Duck information in its response.
 */
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
    document.getElementById('getOpponents').disabled = false;
  } else {
    BlocklyGames.bindClick(
        'publishButton',
        function() {
          if (confirm(BlocklyGames.getMsg('Online_publishDuckDialog'))) {
            Pond.Duck.Datastore.setPublished(
              Pond.Duck.Online.duckKey, true, Pond.Duck.Online.renderDuckInfo);
          }
        });
    document.getElementById('getOpponents').disabled = true;
  }
  BlocklyGames.bindClick(
      'deleteButton',
      function() {
        if (confirm(BlocklyGames.getMsg('Online_deleteDuckDialog'))) {
          Pond.Duck.Datastore.deleteDuck(Pond.Duck.Online.duckKey, false,
            function() {
              var url = window.location.origin
                  + '/pond-duck-online?lang='+ BlocklyGames.LANG;
              window.location = url;
            });
        }
      });

  BlocklyGames.bindClick(
      'copyButton',
      function() {
        Pond.Duck.Datastore.copyDuck(Pond.Duck.Online.duckKey,false,
            Pond.Duck.Datastore.redirectToNewDuck);
      });

  BlocklyGames.bindClick(
      'saveButton',
      function(e) {
        Pond.Duck.Datastore.updateDuckCode(
            Pond.Duck.Online.duckKey,
            BlocklyInterface.getJsCode(),
            BlocklyInterface.blocksDisabled ? '' : BlocklyInterface.getXml(),
            Pond.Duck.Online.renderDuckInfo);
        e.target.disabled = true;
      });
};

/**
 * Loads a new set of opponents.
 */
Pond.Duck.Online.loadNewOpponents = function() {
  var avatarList = [
    Pond.Avatar.createPlayerAvatar(
        Pond.Duck.Online.NAME, Pond.Duck.START_XY[0])];
  if (this.status === 200) {
    // Add provided opponents.
    var opponentList = JSON.parse(this.responseText);
    for (var i = 0, duck; (duck = opponentList[i]); i++) {
      var newAvatar = new Pond.Avatar(
          duck.name, duck['code']['js'], Pond.Duck.START_XY[i + 1]);
      avatarList.push(newAvatar);
    }
  }
  // TODO: Inform the user if we weren't provided enough opponents and are
  // loading default players as well.
  var defaultPlayers = Pond.Duck.getDefaultAvatars();
  for (var i = avatarList.length; i < 4; i++) {
    avatarList.push(defaultPlayers[i]);
  }
  Pond.Duck.loadAvatars(avatarList);
};

/**
 * Opens the duck list.
 */
Pond.Duck.Online.openDuckList_ = function() {
  // TODO: handle potentially changing size of duck list (on copy or delete)
  // TODO: allow for the dialog to be dismissed if there is a duck loaded
  var duckList = document.getElementById('duckListIframe');
  // Reload duck list content (editing source of iframe triggers reload)
  duckList.src += '';
  // Resize to fit content
  var body = duckList.contentWindow.document.body;
  var html = duckList.contentWindow.document.documentElement;
  var computedWidth = Math.max(
      body.scrollWidth, body.offsetWidth, body.clientWidth,
      html.scrollWidth, html.offsetWidth, html.clientWidth);
  var computedHeight = Math.max(
      body.scrollHeight, body.offsetHeight, body.clientHeight,
      html.scrollHeight, html.offsetHeight, html.clientHeight);
  duckList.width = computedWidth;
  duckList.height = computedHeight;

  var content = document.getElementById('duckListDialog');
  var style = {
    width: 'fit-content',
    'margin-left': '-25%',
    left: '50%',
    top: '3em'
  };
  var origin = document.getElementById('duckListButton');
  BlocklyDialogs.showDialog(content, origin, true, true, style);
};

window.addEventListener('load', Pond.Duck.Online.init);
