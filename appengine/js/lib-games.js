/**
 * Blockly Games: Common code (minumum needed to support the index page).
 *
 * Copyright 2013 Google Inc.
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
 * @fileoverview Common support code for all Blockly apps and the index.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('BlocklyGames');

goog.require('goog.math');
goog.require('goog.dom.classes');

/**
 * Lookup for names of languages.  Keys should be in ISO 639 format.
 */
BlocklyGames.LANGUAGE_NAME = {
  'ace': 'بهسا اچيه',
  'af': 'Afrikaans',
  'ar': 'العربية',
  'az': 'Azərbaycanca',
  'be-tarask': 'Taraškievica',
  'br': 'Brezhoneg',
  'ca': 'Català',
  'cdo': '閩東語',
  'cs': 'Česky',
  'da': 'Dansk',
  'de': 'Deutsch',
  'el': 'Ελληνικά',
  'en': 'English',
  'es': 'Español',
  'eu': 'Euskara',
  'fa': 'فارسی',
  'fi': 'Suomi',
  'fo': 'Føroyskt',
  'fr': 'Français',
  'frr': 'Frasch',
  'gl': 'Galego',
  'hak': '客家話',
  'he': 'עברית',
  'hi': 'हिन्दी',
  'hrx': 'Hunsrik',
  'hu': 'Magyar',
  'ia': 'Interlingua',
  'id': 'Bahasa Indonesia',
  'is': 'Íslenska',
  'it': 'Italiano',
  'ja': '日本語',
  'ka': 'ქართული',
  'km': 'ភាសាខ្មែរ',
  'ko': '한국어',
  'ksh': 'Ripoarėsch',
  'ky': 'Кыргызча',
  'la': 'Latine',
  'lb': 'Lëtzebuergesch',
  'lt': 'Lietuvių',
  'lv': 'Latviešu',
  'mg': 'Malagasy',
  'ml': 'മലയാളം',
  'mk': 'Македонски',
  'mr': 'मराठी',
  'ms': 'Bahasa Melayu',
  'mzn': 'مازِرونی',
  'nb': 'Norsk Bokmål',
  'nl': 'Nederlands, Vlaams',
  'oc': 'Lenga d\'òc',
  'pa': 'पंजाबी',
  'pl': 'Polski',
  'pms': 'Piemontèis',
  'ps': 'پښتو',
  'pt': 'Português',
  'pt-br': 'Português Brasileiro',
  'ro': 'Română',
  'ru': 'Русский',
  'sc': 'Sardu',
  'sco': 'Scots',
  'si': 'සිංහල',
  'sk': 'Slovenčina',
  'sr': 'Српски',
  'sv': 'Svenska',
  'sw': 'Kishwahili',
  'th': 'ภาษาไทย',
  'tl': 'Tagalog',
  'tlh': 'tlhIngan Hol',
  'tr': 'Türkçe',
  'uk': 'Українська',
  'vi': 'Tiếng Việt',
  'zh-hans': '簡體中文',
  'zh-hant': '正體中文'
};

/**
 * List of RTL languages.
 */
BlocklyGames.LANGUAGE_RTL = ['ace', 'ar', 'fa', 'he', 'mzn', 'ps'];

/**
 * User's language (e.g. "en").
 * @type string
 */
BlocklyGames.LANG = window['BlocklyGamesLang'];

/**
 * List of languages supported by this app.  Values should be in ISO 639 format.
 * @type !Array.<string>
 */
BlocklyGames.LANGUAGES = window['BlocklyGamesLanguages'];

/**
 * Is the site being served as raw HTML files, as opposed to on App Engine.
 * @type boolean
 */
BlocklyGames.IS_HTML = !!window.location.pathname.match(/\.html$/);

/**
 * Extracts a parameter from the URL.
 * If the parameter is absent default_value is returned.
 * @param {string} name The name of the parameter.
 * @param {string} defaultValue Value to return if paramater not found.
 * @return {string} The parameter value or the default value if not found.
 */
BlocklyGames.getStringParamFromUrl = function(name, defaultValue) {
  var val =
      window.location.search.match(new RegExp('[?&]' + name + '=([^&]+)'));
  return val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : defaultValue;
};

/**
 * Extracts a numeric parameter from the URL.
 * If the parameter is absent or less than min_value, min_value is
 * returned.  If it is greater than max_value, max_value is returned.
 * @param {string} name The name of the parameter.
 * @param {number} minValue The minimum legal value.
 * @param {number} maxValue The maximum legal value.
 * @return {number} A number in the range [min_value, max_value].
 */
BlocklyGames.getNumberParamFromUrl = function(name, minValue, maxValue) {
  var val = Number(BlocklyGames.getStringParamFromUrl(name, 'NaN'));
  return isNaN(val) ? minValue : goog.math.clamp(minValue, val, maxValue);
};

/**
 * Is the current language (BlocklyGames.LANG) an RTL language?
 * @return {boolean} True if RTL, false if LTR.
 */
BlocklyGames.isRtl = function() {
  return BlocklyGames.LANGUAGE_RTL.indexOf(BlocklyGames.LANG) != -1;
};

/**
 * Name of app (maze, bird, ...).
 */
BlocklyGames.NAME;

/**
 * Maximum number of levels.  Common to all apps.
 */
BlocklyGames.MAX_LEVEL = 10;

/**
 * User's level (e.g. 5).
 */
BlocklyGames.LEVEL =
    BlocklyGames.getNumberParamFromUrl('level', 1, BlocklyGames.MAX_LEVEL);

/**
 * Common startup tasks for all apps.
 */
BlocklyGames.init = function() {
  // Set the page title with the content of the H1 title.
  document.title = document.getElementById('title').textContent;

  // Set the HTML's language and direction.
  // document.dir fails in Mozilla, use document.body.parentNode.dir instead.
  // https://bugzilla.mozilla.org/show_bug.cgi?id=151407
  var rtl = BlocklyGames.isRtl();
  document.head.parentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');
  document.head.parentElement.setAttribute('lang', BlocklyGames.LANG);

  // Sort languages alphabetically.
  var languages = [];
  for (var i = 0; i < BlocklyGames.LANGUAGES.length; i++) {
    var lang = BlocklyGames.LANGUAGES[i];
    languages.push([BlocklyGames.LANGUAGE_NAME[lang], lang]);
  }
  var comp = function(a, b) {
    // Sort based on first argument ('English', 'Русский', '简体字', etc).
    if (a[0] > b[0]) return 1;
    if (a[0] < b[0]) return -1;
    return 0;
  };
  languages.sort(comp);
  // Populate the language selection menu.
  var languageMenu = document.getElementById('languageMenu');
  languageMenu.options.length = 0;
  for (var i = 0; i < languages.length; i++) {
    var tuple = languages[i];
    var lang = tuple[1];
    var option = new Option(tuple[0], lang);
    if (lang == BlocklyGames.LANG) {
      option.selected = true;
    }
    languageMenu.options.add(option);
  }
  if (languageMenu.options.length <= 1) {
    // No choices.  Hide the language menu.
    languageMenu.style.display = 'none';
  }

  // Highlight levels that have been completed.
  for (var i = 1; i <= BlocklyGames.MAX_LEVEL; i++) {
    var link = document.getElementById('level' + i);
    var done = !!BlocklyGames.loadFromLocalStorage(BlocklyGames.NAME, i);
    if (link && done) {
      goog.dom.classes.add(link, 'level_done');
    }
  }

  // Fixes viewport for small screens.
  var viewport = document.querySelector('meta[name="viewport"]');
  if (viewport && screen.availWidth < 725) {
    viewport.setAttribute('content',
        'width=725, initial-scale=.35, user-scalable=no');
  }

  // Lazy-load Google analytics.
  setTimeout(BlocklyGames.importAnalytics, 1);
};

/**
 * Reload with a different language.
 */
BlocklyGames.changeLanguage = function() {
  var languageMenu = document.getElementById('languageMenu');
  var newLang = encodeURIComponent(
      languageMenu.options[languageMenu.selectedIndex].value);
  var search = window.location.search;
  if (search.length <= 1) {
    search = '?lang=' + newLang;
  } else if (search.match(/[?&]lang=[^&]*/)) {
    search = search.replace(/([?&]lang=)[^&]*/, '$1' + newLang);
  } else {
    search = search.replace(/\?/, '?lang=' + newLang + '&');
  }

  window.location = window.location.protocol + '//' +
      window.location.host + window.location.pathname + search;
};

/**
 * Attempt to fetch the saved blocks for a level.
 * May be used to simply determine if a level is complete.
 * @param {string} name Name of app (maze, bird, ...).
 * @param {number} level Level (1-10).
 * @return {string=} Serialized XML, or undefined.
 */
BlocklyGames.loadFromLocalStorage = function(name, level) {
  var xml;
  try {
    xml = window.localStorage[name + level];
  } catch(e) {
    // Firefox sometimes throws a SecurityError when accessing localStorage.
    // Restarting Firefox fixes this, so it looks like a bug.
  }
  return xml;
};


/**
 * Gets the message with the given key from the document.
 * @param {string} key The key of the document element.
 * @return {string} The textContent of the specified element,
 *     or an error message if the element was not found.
 */
BlocklyGames.getMsg = function(key) {
  var msg = BlocklyGames.getMsgOrNull(key);
  return msg === null ? '[Unknown message: ' + key + ']' : msg;
};

/**
 * Gets the message with the given key from the document.
 * @param {string} key The key of the document element.
 * @return {string} The textContent of the specified element,
 *     or null if the element was not found.
 */
BlocklyGames.getMsgOrNull = function(key) {
  var element = document.getElementById(key);
  if (element) {
    var text = element.textContent;
    // Convert newline sequences.
    text = text.replace(/\\n/g, '\n');
    return text;
  } else {
    return null;
  }
};

/**
 * Bind a function to a button's click event.
 * On touch-enabled browsers, ontouchend is treated as equivalent to onclick.
 * @param {!Element|string} el Button element or ID thereof.
 * @param {!Function} func Event handler to bind.
 */
BlocklyGames.bindClick = function(el, func) {
  if (typeof el == 'string') {
    el = document.getElementById(el);
  }
  el.addEventListener('click', func, true);
  el.addEventListener('touchend', func, true);
};


/**
 * Load the Google Analytics.
 */
BlocklyGames.importAnalytics = function() {
  if (BlocklyGames.IS_HTML) {
    return;
  }
  var gaName = 'GoogleAnalyticsFunction';
  window['GoogleAnalyticsObject'] = gaName;
  var gaObject = function() {
    (gaObject['q'] = gaObject['q'] || []).push(arguments);
  };
  window[gaName] = gaObject;
  gaObject['l'] = 1 * new Date();
  var script = document.createElement('script');
  script.async = 1;
  script.src = '//www.google-analytics.com/analytics.js';
  document.head.appendChild(script);

  gaObject('create', 'UA-50448074-1', 'auto');
  gaObject('send', 'pageview');
};
