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

goog.provide('Pond.Duck.Basic');

goog.require('BlocklyGames');
goog.require('Pond');
goog.require('Pond.Duck');
goog.require('Pond.Duck.Basic.soy');

BlocklyGames.NAME = 'pond-duck-basic';

/**
 * Initialize Ace and the pond.  Called on page load.
 */
Pond.Duck.Basic.init = function () {
  // Render the Soy template.
  document.body.innerHTML = Pond.Duck.Basic.soy.start({}, null,
      {
        lang: BlocklyGames.LANG,
        html: BlocklyGames.IS_HTML
      });

  Pond.Duck.init();
  Pond.Duck.loadDefaultCode();
  Pond.Duck.loadDefaultAvatars();

  // Show Blockly editor tab.
  Pond.Duck.changeTab(Pond.Duck.TAB_INDEX.BLOCKLY);
};

window.addEventListener('load', Pond.Duck.Basic.init);
