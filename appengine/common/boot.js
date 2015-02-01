/**
 * Blockly Games: Bootloader
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
  // Application path.
  var appName = location.pathname.match(/\/([-\w]+)(\.html)?$/);
  appName = appName ? appName[1].replace('-', '/') : 'index';

  // Supported languages (consistent across all apps).
  window['BlocklyGamesLanguages'] = [
      'ar', 'be-tarask', 'br', 'ca', 'cs', 'da', 'de', 'el', 'en', 'es',
      'fa', 'fi', 'fr', 'gl', 'he', 'hrx', 'hu', 'ia', 'is', 'it', 'ja',
      'ko', 'lt', 'lv', 'mk', 'ms', 'nb', 'nl', 'pl', 'pms', 'pt-br',
      'ro', 'ru', 'sc', 'sco', 'sk', 'sr', 'sv', 'th', 'tr', 'uk', 'vi',
      'zh-hans', 'zh-hant'
      ];

  // Use a series of heuristics that determine the likely language of this user.
  // First choice: The URL specified language.
  var param = window.location.search.match(/[?&]lang=([^&]+)/);
  var lang = param ? param[1].replace(/\+/g, '%20') : null;
  if (window['BlocklyGamesLanguages'].indexOf(lang) != -1) {
    // Save this explicit choice as cookie.
    document.cookie = 'lang=' + escape(lang) + '; path=/';
  } else {
    // Second choice: Language cookie.
    var cookie = document.cookie.match(/(^|;)\s*lang=(\w+)/);
    lang = cookie ? unescape(cookie[2]) : null;
    if (window['BlocklyGamesLanguages'].indexOf(lang) == -1) {
      // Third choice: The browser's language.
      lang = navigator.language;
      if (window['BlocklyGamesLanguages'].indexOf(lang) == -1) {
        // Fourth choice: English.
        lang = 'en';
      }
    }
  }
  window['BlocklyGamesLang'] = lang;

  // Load the chosen language pack.
  var script = document.createElement('script');
  script.src = appName + '/generated/' + lang + '/uncompressed.js';
  script.type = 'text/javascript';
  document.head.appendChild(script);
})();
