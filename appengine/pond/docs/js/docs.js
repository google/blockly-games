/**
 * Blockly Games: Pond Documentation
 *
 * Copyright 2014 Google Inc.
 * https://github.com/google/blockly-games
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
 * @fileoverview JavaScript for Blockly's Pond Documentation.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Pond.Docs');

goog.require('Pond.Docs.soy');
goog.require('goog.ui.AnimatedZippy');

/**
 * Print the page.  Called on page load.
 */
Pond.Docs.init = function() {
  var param = window.location.search.match(/[?&]mode=([^&]+)/);
  var level = param ? Number(param[1]) : Infinity;
  var pond = level % 2 ? 'blocks' : 'js';
  document.body.innerHTML = Pond.Docs.soy.start({}, null,
      {level: level,
       pond: pond});

  // Turn all h2 tags into zippies.
  var headers = document.getElementsByTagName('h2');
  for (var i = 0, header; header = headers[i]; i++) {
    new goog.ui.AnimatedZippy(header, header.id + '-content', false);
  }
};

window.addEventListener('load', Pond.Docs.init);
