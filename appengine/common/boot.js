/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Load the correct language pack for the current application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

// Redirect to new domain.
if (location.host == 'blockly-games.appspot.com') {
  location.replace('https://blockly.games' +
      location.pathname + location.search + location.hash);
}

(function() {
  // Application path.
  var appName = location.pathname.match(/\/([-\w]+)(\.html)?$/);
  appName = appName ? appName[1].replace('-', '/') : 'index';

  // Supported languages (consistent across all apps).
  window['BlocklyGamesLanguages'] = [
    'ar', 'be', 'be-tarask', 'bg', 'bn', 'br', 'cs', 'da', 'de', 'el',
    'en', 'eo', 'es', 'eu', 'fa', 'fi', 'fo', 'fr', 'gl', 'ha', 'he',
    'hi', 'hu', 'hy', 'ia', 'id', 'ig', 'is', 'it', 'ja', 'kab', 'ko',
    'lt', 'lv', 'ms', 'my', 'nb', 'nl', 'pl', 'pms', 'pt', 'pt-br',
    'ro', 'ru', 'sc', 'sk', 'sl', 'sq', 'sr', 'sv', 'th', 'ti', 'tr',
    'uk', 'ur', 'vi', 'yo', 'zh-hans', 'zh-hant'
  ];

  // Use a series of heuristics that determine the likely language of this user.
  // First choice: The URL specified language.
  var param = location.search.match(/[?&]lang=([^&]+)/);
  var lang = param ? param[1].replace(/\+/g, '%20') : null;
  if (window['BlocklyGamesLanguages'].indexOf(lang) != -1) {
    // Save this explicit choice as cookie.
    var exp = (new Date(Date.now() + 2 * 31536000000)).toUTCString();
    document.cookie = 'lang=' + escape(lang) + '; expires=' + exp + 'path=/';
  } else {
    // Second choice: Language cookie.
    var cookie = document.cookie.match(/(^|;)\s*lang=([\w\-]+)/);
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
  var debug = false;
  try {
    debug = !!sessionStorage.getItem('debug');
    if (debug) {
      console.info('Loading uncompressed JavaScript.');
    }
  } catch (e) {
    // Don't even think of throwing an error.
  }
  script.src = appName + '/generated/' + lang +
      (debug ? '/uncompressed.js' : '/compressed.js');
  script.type = 'text/javascript';
  document.head.appendChild(script);
})();
