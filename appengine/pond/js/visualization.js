/**
 * Blockly Games: Pond
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
 * @fileoverview Creates an pond for players to compete in.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Pond.Visualization');

goog.require('Pond.Battle');
goog.require('Blockly');


/**
 * Frames per second to draw.  Has no impact on game play, just the display.
 */
Pond.Visualization.FPS = 36;

Pond.Visualization.PLAYER_SIZE = 35;
Pond.Visualization.PLAYER_HALF_SIZE = Pond.Visualization.PLAYER_SIZE / 2;
Pond.Visualization.MISSILE_RADIUS = 5;

Pond.Visualization.CRASH_LOG = {};
Pond.Visualization.EXPLOSIONS = [];

Pond.Visualization.SPRITES = new Image();
Pond.Visualization.SPRITES.src = 'pond/sprites.png';

Pond.Visualization.COLOURS = ['#ff8b00', '#c90015', '#166c0b', '#11162a'];

Pond.Visualization.pid = 0;


/**
 * Setup the visualization (run once).
 */
Pond.Visualization.init = function() {
  // Configure the canvas elements.
  var ctxScratch = document.getElementById('scratch').getContext('2d');
  Pond.Visualization.ctxScratch_ = ctxScratch;
  var ctxDisplay = document.getElementById('display').getContext('2d');
  Pond.Visualization.ctxDisplay_ = ctxDisplay;
  Pond.Visualization.CANVAS_SIZE = ctxDisplay.canvas.width;
  ctxDisplay.globalCompositeOperation = 'copy';
  Blockly.loadAudio_(['pond/whack.mp3', 'pond/whack.ogg'], 'whack');
  Blockly.loadAudio_(['pond/boom.mp3', 'pond/boom.ogg'], 'boom');
  Blockly.loadAudio_(['pond/splash.mp3', 'pond/splash.ogg'], 'splash');
};

/**
 * Stop visualization.
 */
Pond.Visualization.stop = function() {
  clearTimeout(Pond.Visualization.pid);
};

/**
 * Stop and reset the visualization.
 */
Pond.Visualization.reset = function() {
  Pond.Visualization.stop();
  Pond.Visualization.EXPLOSIONS.length = 0;
  // Clear out the player status row.
  var row = document.getElementById('playerStatRow');
  row.innerHTML = '';
  var nameDivs = [];
  var healthDivs = [];
  for (var i = 0, player; player = Pond.Battle.PLAYERS[i]; i++) {
    // Assign a colour to each player.
    var hexColour =
        Pond.Visualization.COLOURS[i % Pond.Visualization.COLOURS.length];
    player.visualizationIndex = i;
    // Add a cell to the player status row.
    // <td>
    //   <div class="playerStatHealth"></div>
    //   <div class="playerStatName">Rabbit</div>
    //   <div>&nbsp;</div>
    // </td>
    var td = document.createElement('td');
    td.style.borderColor = hexColour;
    var div = document.createElement('div');
    div.className = 'playerStatHealth';
    div.style.background = hexColour;
    player.visualizationHealth = div;
    healthDivs[i] = div;
    td.appendChild(div);
    var div = document.createElement('div');
    div.className = 'playerStatName';
    var text = document.createTextNode(player.name);
    div.appendChild(text);
    nameDivs[i] = div;
    td.appendChild(div);
    var div = document.createElement('div');
    var text = document.createTextNode('\u00a0');
    div.appendChild(text);
    td.appendChild(div);
    row.appendChild(td);
  }
  for (var i = 0, div; div = nameDivs[i]; i++) {
    div.style.width = (div.parentNode.offsetWidth - 2) + 'px';
  }
  for (var i = 0, div; div = healthDivs[i]; i++) {
    div.style.height = (div.parentNode.offsetHeight - 2) + 'px';
  }
  // Render a single frame.
  Pond.Visualization.display_();
};

/**
 * Time when the previous frame was drawn.
 */
Pond.Visualization.lastFrame = 0;

/**
 * Delay between previous frame was drawn and the current frame was scheduled.
 */
Pond.Visualization.lastDelay = 0;

/**
 * Start the visualization running.
 */
Pond.Visualization.start = function() {
  Pond.Visualization.display_();
  // Frame done.  Calculate the actual elapsed time and schedule the next frame.
  var now = Date.now();
  var workTime = now - Pond.Visualization.lastFrame -
      Pond.Visualization.lastDelay;
  var delay = Math.max(1, (1000 / Pond.Visualization.FPS) - workTime);
  Pond.Visualization.pid = setTimeout(Pond.Visualization.start, delay);
  Pond.Visualization.lastFrame = now;
  Pond.Visualization.lastDelay = delay;
};

/**
 * Convert an pond coordinate (0-100) to a canvas coordinate.
 * @param {number} pondValue X or Y coordinate in the pond.
 * @return {number} X or Y coordinate on the canvas.
 */
Pond.Visualization.canvasCoordinate = function(pondValue) {
  return pondValue / 100 *
      (Pond.Visualization.CANVAS_SIZE - Pond.Visualization.PLAYER_SIZE) +
      Pond.Visualization.PLAYER_HALF_SIZE;
};

/**
 * Visualize the current battle (Pond.Battle).
 * @private
 */
Pond.Visualization.display_ = function() {
  var ctx = Pond.Visualization.ctxScratch_;
  // Clear the display with blue.
  ctx.beginPath();
  ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = '#527dbf';
  ctx.fill();
  // Draw the players, dead ones first.
  var players = [];
  for (var i = 0, player; player = Pond.Battle.PLAYERS[i]; i++) {
    if (player.dead) {
      players.push(player);
    }
  }
  for (var i = 0, player; player = Pond.Battle.PLAYERS[i]; i++) {
    if (!player.dead) {
      players.push(player);
    }
  }
  for (var i = 0, player; player = players[i]; i++) {
    ctx.save();
    var x = Pond.Visualization.canvasCoordinate(player.loc.x);
    var y = Pond.Visualization.canvasCoordinate(100 - player.loc.y);
    ctx.translate(x, y);
    var colour = (player.visualizationIndex %
        Pond.Visualization.COLOURS.length) * Pond.Visualization.PLAYER_SIZE;
    if (player.dead) {
      ctx.globalAlpha = 0.25;
    }
    if (player.speed > 0) {
      // Draw wake bubbles.
      ctx.save();
      if (player.speed > 50) {
        var speed = 0;
      } else if (player.speed > 25) {
        var speed = Pond.Visualization.PLAYER_SIZE;
      } else {
        var speed = Pond.Visualization.PLAYER_SIZE * 2;
      }
      ctx.rotate(-player.degree / 180 * Math.PI);
      ctx.drawImage(Pond.Visualization.SPRITES,
          Pond.Visualization.PLAYER_SIZE * 13, speed,
          Pond.Visualization.PLAYER_SIZE,
          Pond.Visualization.PLAYER_SIZE,
          7 - Pond.Visualization.PLAYER_SIZE * 1.5,
          -Pond.Visualization.PLAYER_HALF_SIZE,
          Pond.Visualization.PLAYER_SIZE,
          Pond.Visualization.PLAYER_SIZE);
      ctx.restore();
    }

    // Draw player body.
    ctx.drawImage(Pond.Visualization.SPRITES,
        0, colour,
        Pond.Visualization.PLAYER_SIZE,
        Pond.Visualization.PLAYER_SIZE,
        -Pond.Visualization.PLAYER_HALF_SIZE,
        -Pond.Visualization.PLAYER_HALF_SIZE,
        Pond.Visualization.PLAYER_SIZE,
        Pond.Visualization.PLAYER_SIZE);

    // Draw player head.
    // Offset the head from the middle.
    var headRadialOffset = 12;
    var headVerticalOffset = 2;
    var radians = player.facing / 180 * Math.PI;
    var hx = Math.cos(radians) * headRadialOffset;
    var hy = -Math.sin(radians) * headRadialOffset - headVerticalOffset;
    ctx.translate(hx, hy);
    // Divide into 12 quads.
    var quad = (14 - Math.round(player.facing / 360 * 12)) % 12 + 1;
    var quadAngle = 360 / 12;  // 30.
    var remainder = player.facing % quadAngle;
    if (remainder >= quadAngle / 2) {
      remainder -= quadAngle;
    }
    // For unknown reasons remainder is too large.  Scale down the rotation.
    remainder /= 1.5;
    ctx.rotate(-remainder / 180 * Math.PI);
    ctx.drawImage(Pond.Visualization.SPRITES,
        quad * Pond.Visualization.PLAYER_SIZE, colour,
        Pond.Visualization.PLAYER_SIZE,
        Pond.Visualization.PLAYER_SIZE,
        2 - Pond.Visualization.PLAYER_HALF_SIZE,
        2 - Pond.Visualization.PLAYER_HALF_SIZE,
        Pond.Visualization.PLAYER_SIZE,
        Pond.Visualization.PLAYER_SIZE);

    ctx.restore();
  }

  // Draw the missiles.
  for (var i = 0, missile; missile = Pond.Battle.MISSILES[i]; i++) {
    ctx.save();
    var progress = missile.progress / missile.range;
    var dx = (missile.endLoc.x - missile.startLoc.x) * progress;
    var dy = (missile.endLoc.y - missile.startLoc.y) * -progress;
    // Calculate parabolic arc.
    var halfRange = missile.range / 2;
    var height = missile.range * 0.15;  // Change to set height of arc.
    var xAxis = missile.progress - halfRange
    var xIntercept = Math.sqrt(height);
    var parabola = height -
        Math.pow(xAxis / Math.sqrt(height) * height / halfRange, 2);
    // Calculate the on-canvas coordinates.
    var missileX = Pond.Visualization.canvasCoordinate(
        missile.startLoc.x + dx);
    var missileY = Pond.Visualization.canvasCoordinate(
        100 - missile.startLoc.y + dy - parabola);
    var shadowY =
        Pond.Visualization.canvasCoordinate(100 - missile.startLoc.y + dy);
    // Draw missile and shadow.
    ctx.beginPath();
    ctx.arc(missileX, shadowY,
            Math.max(0, 1 - parabola / 10) * Pond.Visualization.MISSILE_RADIUS,
            0, Math.PI*2, true);
    ctx.closePath();
    ctx.fillStyle = 'rgba(128, 128, 128, ' +
        Math.max(0, 1 - parabola / 10) + ')';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(missileX, missileY, Pond.Visualization.MISSILE_RADIUS,
            0, Math.PI*2, true);
    ctx.closePath();
    ctx.fillStyle = Pond.Visualization.COLOURS[
        missile.player.visualizationIndex % Pond.Visualization.COLOURS.length];
    ctx.fill();
  }

  // Handle any queued events.
  for (var i = 0; i < Pond.Battle.EVENTS.length; i++) {
    var event = Pond.Battle.EVENTS[i];
    var player = event['player'];
    if (event['type'] == 'CRASH') {
      // Impact between two players, or a player and the wall.
      // Only play the crash sound if this player hasn't crashed recently.
      var lastCrash = Pond.Visualization.CRASH_LOG[player.id];
      if (!lastCrash || lastCrash + 1000 < goog.now()) {
        Blockly.playAudio('whack', event['damage'] /
                          Pond.Battle.COLLISION_DAMAGE);
        Pond.Visualization.CRASH_LOG[player.id] = goog.now();
      }
    } else if (event['type'] == 'SCAN') {
      // Show a sensor scan beam.
      var halfResolution = Math.max(event['resolution'] / 2, 0.5);
      var angle1 = -goog.math.toRadians(event['degree'] + halfResolution);
      var angle2 = -goog.math.toRadians(event['degree'] - halfResolution);
      ctx.beginPath();
      var x = Pond.Visualization.canvasCoordinate(player.loc.x);
      var y = Pond.Visualization.canvasCoordinate(100 - player.loc.y);
      var r = 200;
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle1) * r, y + Math.sin(angle1) * r);
      ctx.arc(x, y, r, angle1, angle2);
      ctx.lineTo(x, y);
      var gradient = ctx.createRadialGradient(x, y,
          Pond.Visualization.PLAYER_HALF_SIZE, x, y, r);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fill();
    } else if (event['type'] == 'BANG') {
      // No visualization for firing a cannon currently exists.
    } else if (event['type'] == 'BOOM') {
      // A missile has landed.
      if (event['damage']) {
        // A player has taken damage.
        Blockly.playAudio('boom', event['damage'] / 10);
      }
      Pond.Visualization.EXPLOSIONS.push({x: event['x'], y: event['y'], t: 0});
    } else if (event['type'] == 'DIE') {
      // A player just sustained fatal damage.
      Blockly.playAudio('splash');
    }
  }
  Pond.Battle.EVENTS.length = 0;

  // Draw all the explosions.
  for (var i = Pond.Visualization.EXPLOSIONS.length - 1; i >= 0; i--) {
    var explosion = Pond.Visualization.EXPLOSIONS[i];
    var x = Pond.Visualization.canvasCoordinate(explosion.x);
    var y = Pond.Visualization.canvasCoordinate(100 - explosion.y);
    ctx.beginPath();
    ctx.arc(x, y, explosion.t + 1, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.lineWidth = Pond.Visualization.MISSILE_RADIUS;
    ctx.strokeStyle = 'rgba(255, 255, 255, ' + (1 - explosion.t / 10) + ')';
    ctx.stroke();
    explosion.t += 2;
    if (explosion.t > 10) {
      Pond.Visualization.EXPLOSIONS.splice(i, 1);
    }
  }

  // Draw on the user-visible canvas.
  Pond.Visualization.ctxDisplay_.drawImage(ctx.canvas, 0, 0);

  // Update the health bars.
  for (var i = 0, player; player = players[i]; i++) {
    var div = player.visualizationHealth;
    div.parentNode.title = Math.round(100 - player.damage) + '%';
    var width = div.parentNode.offsetWidth * (1 - player.damage / 100) - 2;
    div.style.width = Math.max(0, width) + 'px';
  }
};
