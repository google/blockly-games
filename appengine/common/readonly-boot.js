/**
 * Blockly Games: Bootloader for Readonly
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
 * @fileoverview Load the correct language pack for the current application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

(function() {
  var appName = location.search.match(/[?&]app=([-\w]+)/)[1];
  var appLanguage = location.search.match(/[?&]lang=([-\w]+)/)[1];
  window['BlocklyGamesLanguages'] = [appLanguage];
  var script = document.createElement('script');
  script.src = appName + '/generated/' + appLanguage + '/compressed.js';
  script.type = 'text/javascript';
  document.head.appendChild(script);
})();
