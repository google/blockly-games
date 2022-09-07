/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Load the correct language pack and code bundle.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

// Redirect to new domain.
if (location.host === 'blockly-games.appspot.com') {
  location.replace('https://blockly.games' +
      location.pathname + location.search + location.hash);
}

(function() {
  // Application path.
  var appName = location.pathname.match(/\/([-\w]+)(\.html)?$/);
  appName = appName ? appName[1].replace('-', '/') : 'index';

  // Supported languages (consistent across all apps).
  window['BlocklyGamesLanguages'] = [
    'am', 'ar', 'be', 'be-tarask', 'bg', 'bn', 'br', 'ca', 'cs', 'da', 'de',
    'el', 'en', 'eo', 'es', 'eu', 'fa', 'fi', 'fo', 'fr', 'gl', 'ha', 'he',
    'hi', 'hr', 'hu', 'hy', 'ia', 'id', 'ig', 'is', 'it', 'ja', 'kab', 'kn',
    'ko', 'lt', 'lv', 'ms', 'my', 'nb', 'nl', 'pl', 'pms', 'pt', 'pt-br',
    'ro', 'ru', 'sc', 'sk', 'sl', 'sq', 'sr', 'sr-latn', 'sv', 'th', 'ti',
    'tr', 'uk', 'ur', 'vi', 'yo', 'zh-hans', 'zh-hant'
  ];

  // Use a series of heuristics that determine the likely language of this user.
  // First choice: The URL specified language.
  var param = location.search.match(/[?&]lang=([^&]+)/);
  var lang = param ? param[1].replace(/\+/g, '%20') : null;
  if (window['BlocklyGamesLanguages'].indexOf(lang) !== -1) {
    // Save this explicit choice as cookie.
    var exp = (new Date(Date.now() + 2 * 31536000000)).toUTCString();
    document.cookie = 'lang=' + escape(lang) + '; expires=' + exp + 'path=/';
  } else {
    // Second choice: Language cookie.
    var cookie = document.cookie.match(/(^|;)\s*lang=([\w\-]+)/);
    lang = cookie ? unescape(cookie[2]) : null;
    if (window['BlocklyGamesLanguages'].indexOf(lang) === -1) {
      // Third choice: The browser's language.
      lang = navigator.language;
      if (window['BlocklyGamesLanguages'].indexOf(lang) === -1) {
        // Fourth choice: English.
        lang = 'en';
      }
    }
  }
  window['BlocklyGamesLang'] = lang;

  var debug = false;
  try {
    debug = !!sessionStorage.getItem('debug');
    if (debug) {
      console.info('Loading uncompressed JavaScript.');
    }
  } catch (e) {
    // Don't even think of throwing an error.
  }

  // Load the chosen language pack.
  var script = document.createElement('script');
  if (debug) {
    script.src = 'generated/msg/' + lang + '.js';
  } else {
    script.src = appName + '/generated/msg/' + lang + '.js';
  }
  script.type = 'text/javascript';
  document.head.appendChild(script);
  // Load the code bundle for the chosen game.
  var script = document.createElement('script');
  if (debug) {
    script.src = appName + '/generated/uncompressed.js';
  } else {
    script.src = appName + '/generated/compressed.js';
  }
  script.type = 'text/javascript';
  document.head.appendChild(script);
})();
