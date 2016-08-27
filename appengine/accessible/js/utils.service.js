/**
 * Blockly Games: Accessible
 *
 * Copyright 2016 Google Inc.
 * https://github.com/google/blockly-games
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Angular2 Service with utility functions.
 * @author sll@google.com (Sean Lip)
 */

var musicGame = {};

musicGame.UtilsService = ng.core
  .Class({
    constructor: [function() {}],
    // Extracts a parameter from the URL, returning defaultValue if the
    // parameter is absent.
    getStringParamFromUrl: function(parameterName, defaultValue) {
      var val = window.location.search.match(
          new RegExp('[?&]' + parameterName + '=([^&]+)'));
      return val ? decodeURIComponent(
          val[1].replace(/\+/g, '%20')) : defaultValue;
    }
  });
