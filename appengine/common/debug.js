/**
 * Blockly Games: Debug
 *
 * Copyright 2015 Google Inc.
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
 * @fileoverview JavaScript Debug page.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

function setDebug(debug) {
  if (debug) {
    sessionStorage.setItem('debug', 1);
    console.info('Uncompressed mode activated.  Happy hacking!');
  } else {
    sessionStorage.removeItem('debug');
    console.info('Compressed mode activated.');
  }
}

(function() {
  var debug = !!sessionStorage.getItem('debug');
  document.getElementById(debug ? 'debug1' : 'debug0').checked = true;
})();
