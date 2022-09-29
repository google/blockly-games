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

goog.require('BlocklyGames');
goog.require('Index.html');

/**
 * Array of application names.
 */
const APPS = ['puzzle', 'maze', 'bird', 'turtle', 'movie', 'music',
              'pond-tutor', 'pond-duck'];

/**
 * Render the page and load any progress data.  Called on page load.
 */
function init() {
  // Render the HTML.
  document.body.innerHTML = Index.html.start(
    {lang: BlocklyGames.LANG,
     html: BlocklyGames.IS_HTML,
     rtl: BlocklyGames.IS_RTL});

  BlocklyGames.init('');

  const languageMenu = BlocklyGames.getElementById('languageMenu');
  languageMenu.addEventListener('change', BlocklyGames.changeLanguage, true);

  let storedData = false;
  const levelsDone = [];
  for (let i = 0; i < APPS.length; i++) {
    levelsDone[i] = 0;
    for (let j = 1; j <= BlocklyGames.MAX_LEVEL; j++) {
      if (BlocklyGames.loadFromLocalStorage(APPS[i], j)) {
        storedData = true;
        levelsDone[i]++;
      }
    }
  }
  if (storedData) {
    const clearButtonPara = BlocklyGames.getElementById('clearDataPara');
    clearButtonPara.style.visibility = 'visible';
    BlocklyGames.bindClick('clearData', clearData);
  }

  for (let i = 0; i < levelsDone.length; i++) {
    const app = APPS[i];
    const denominator = (i === 0) ? 1 : BlocklyGames.MAX_LEVEL;
    const angle = levelsDone[i] / denominator * 270;
    if (angle) {
      setTimeout(animateGauge, 1500, app, 0, angle);
    } else {
      // Remove gauge if zero, since IE renders a stub.
      const path = BlocklyGames.getElementById('gauge-' + app);
      path.parentNode.removeChild(path);
    }
  }
}

/**
 * Animate a gauge from zero to a target value.
 * @param {string} app Name of application.
 * @param {number} cur Current angle of gauge in degrees.
 * @param {number} max Final angle of gauge in degrees.
 */
function animateGauge(app, cur, max) {
  const step = 4;
  cur += step;
  drawGauge(app, Math.min(cur, max));
  if (cur < max) {
    setTimeout(animateGauge, 10, app, cur, max);
  }
}

/**
 * Draw the gauge for an app.
 * @param {string} app Name of application.
 * @param {number} angle Angle of gauge in degrees.
 */
function drawGauge(app, angle) {
  const xOffset = 150;
  const yOffset = 60;
  const radius = 52.75;
  const theta0 = toRadians(angle - 45);
  const x = xOffset - Math.cos(theta0) * radius;
  const y = yOffset - Math.sin(theta0) * radius;
  const flag = angle > 180 ? 1 : 0;
  // The starting point is at angle zero.
  const theta1 = toRadians(0 - 45);
  const mx = xOffset - Math.cos(theta1) * radius;
  const my = yOffset - Math.sin(theta1) * radius;
  const path = BlocklyGames.getElementById('gauge-' + app);
  path.setAttribute('d',
      ['M', mx, my, 'A', radius, radius, 0, flag, 1, x, y].join(' '));
}

/**
 * Converts degrees to radians.
 * Copied from Closure's goog.math.toRadians.
 * @param {number} angleDegrees Angle in degrees.
 * @return {number} Angle in radians.
 */
function toRadians(angleDegrees) {
  return angleDegrees * Math.PI / 180;
}

/**
 * Clear all stored data.
 */
function clearData() {
  if (!confirm(BlocklyGames.getMsg('Index.clear', false))) {
    return;
  }
  for (let i = 0; i < APPS.length; i++) {
    for (let j = 1; j <= BlocklyGames.MAX_LEVEL; j++) {
      delete window.localStorage[APPS[i] + j];
    }
  }
  location.reload();
}

BlocklyGames.callWhenLoaded(init);
