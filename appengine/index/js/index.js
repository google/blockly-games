/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for index page.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Index');

goog.require('Blockly.utils.math');
goog.require('BlocklyGames');
goog.require('BlocklyGames.Msg');
goog.require('Index.html');


/**
 * Array of application names.
 */
Index.APPS = ['puzzle', 'maze', 'bird', 'turtle', 'movie', 'music',
              'pond-tutor', 'pond-duck'];

/**
 * Initialize Blockly and the maze.  Called on page load.
 */
Index.init = function() {
  // Render the HTML.
  document.body.innerHTML = Index.html.start(
    {lang: BlocklyGames.LANG,
     html: BlocklyGames.IS_HTML,
     rtl: BlocklyGames.IS_RTL});

  BlocklyGames.init('');

  const languageMenu = document.getElementById('languageMenu');
  languageMenu.addEventListener('change', BlocklyGames.changeLanguage, true);

  let storedData = false;
  const levelsDone = [];
  for (let i = 0; i < Index.APPS.length; i++) {
    levelsDone[i] = 0;
    for (let j = 1; j <= BlocklyGames.MAX_LEVEL; j++) {
      if (BlocklyGames.loadFromLocalStorage(Index.APPS[i], j)) {
        storedData = true;
        levelsDone[i]++;
      }
    }
  }
  if (storedData) {
    const clearButtonPara = document.getElementById('clearDataPara');
    clearButtonPara.style.visibility = 'visible';
    BlocklyGames.bindClick('clearData', Index.clearData_);
  }

  function animateFactory(app, angle) {
    return function() {
      Index.animateGauge(app, 0, angle);
    };
  }
  for (let i = 0; i < levelsDone.length; i++) {
    const app = Index.APPS[i];
    const denominator = (i === 0) ? 1 : BlocklyGames.MAX_LEVEL;
    const angle = levelsDone[i] / denominator * 270;
    if (angle) {
      setTimeout(animateFactory(app, angle), 1500);
    } else {
      // Remove gauge if zero, since IE renders a stub.
      const path = document.getElementById('gauge-' + app);
      path.parentNode.removeChild(path);
    }
  }
};

window.addEventListener('load', Index.init, false);

/**
 * Animate a gauge from zero to a target value.
 * @param {string} app Name of application.
 * @param {number} cur Current angle of gauge in degrees.
 * @param {number} max Final angle of gauge in degrees.
 */
Index.animateGauge = function(app, cur, max) {
  const step = 4;
  cur += step;
  Index.drawGauge(app, Math.min(cur, max));
  if (cur < max) {
    setTimeout(function() {
      Index.animateGauge(app, cur, max);
    }, 10);
  }
};

/**
 * Draw the gauge for an app.
 * @param {string} app Name of application.
 * @param {number} angle Angle of gauge in degrees.
 */
Index.drawGauge = function(app, angle) {
  const xOffset = 150;
  const yOffset = 60;
  const radius = 52.75;
  const theta0 = Blockly.utils.math.toRadians(angle - 45);
  const x = xOffset - Math.cos(theta0) * radius;
  const y = yOffset - Math.sin(theta0) * radius;
  const flag = angle > 180 ? 1 : 0;
  // The starting point is at angle zero.
  const theta1 = Blockly.utils.math.toRadians(0 - 45);
  const mx = xOffset - Math.cos(theta1) * radius;
  const my = yOffset - Math.sin(theta1) * radius;
  const path = document.getElementById('gauge-' + app);
  path.setAttribute('d',
      ['M ' + mx + ',' + my + ' A', radius, radius, 0, flag, 1, x, y].join(' '));
};

/**
 * Clear all stored data.
 * @private
 */
Index.clearData_ = function() {
  if (!confirm(BlocklyGames.Msg['Index.clear'])) {
    return;
  }
  for (let i = 0; i < Index.APPS.length; i++) {
    for (let j = 1; j <= BlocklyGames.MAX_LEVEL; j++) {
      delete window.localStorage[Index.APPS[i] + j];
    }
  }
  location.reload();
};
