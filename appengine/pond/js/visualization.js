/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Creates an pond for avatars to compete in.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Pond.Visualization');

goog.require('Blockly');
goog.require('Blockly.utils.math');
goog.require('Blockly.utils.userAgent');
goog.require('Pond.Battle');


/**
 * Frames per second to draw.  Has no impact on game play, just the display.
 */
Pond.Visualization.FPS = 36;

Pond.Visualization.AVATAR_SIZE = 35;
Pond.Visualization.AVATAR_HALF_SIZE = Pond.Visualization.AVATAR_SIZE / 2;
Pond.Visualization.MISSILE_RADIUS = 5;

Pond.Visualization.CRASH_LOG = {};
Pond.Visualization.EXPLOSIONS = [];

Pond.Visualization.SPRITES = new Image();
Pond.Visualization.SPRITES.src = 'pond/sprites.png';

Pond.Visualization.COLOURS = ['#ff8b00', '#c90015', '#166c0b', '#223068'];

Pond.Visualization.pid = 0;

/**
 * Database of pre-loaded sounds.
 * @private
 * @const
 */
Pond.Visualization.SOUNDS_ = Object.create(null);

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
  Pond.Visualization.loadAudio_(['pond/whack.mp3', 'pond/whack.ogg'], 'whack');
  Pond.Visualization.loadAudio_(['pond/boom.mp3', 'pond/boom.ogg'], 'boom');
  Pond.Visualization.loadAudio_(['pond/splash.mp3', 'pond/splash.ogg'],
      'splash');
  // iOS can only process one sound at a time.  Trying to load more than one
  // corrupts the earlier ones.  Just load one and leave the others uncached.
  if (!Blockly.utils.userAgent.IPAD && !Blockly.utils.userAgent.IPHONE) {
    Pond.Visualization.preloadAudio_();
  }
};

/**
 * Stop visualization.
 */
Pond.Visualization.stop = function() {
  clearTimeout(Pond.Visualization.pid);
};

/**
 * Get the colour for an avatar.
 * @param {!Pond.Avatar} avatar An avatar.
 * @return {string} Hex code string.
 */
Pond.Visualization.getColour = function(avatar) {
  return Pond.Visualization.COLOURS
      [avatar.visualizationIndex % Pond.Visualization.COLOURS.length];
};

/**
 * Stop and reset the visualization.
 */
Pond.Visualization.reset = function() {
  Pond.Visualization.stop();
  Pond.Visualization.EXPLOSIONS.length = 0;
  // Clear out the avatar status row.
  var row1 = document.getElementById('avatarStatRow1');
  row1.innerHTML = '';
  var row2 = document.getElementById('avatarStatRow2');
  row2.innerHTML = '';
  var nameDivs = [];
  var healthDivs = [];
  var avatarSelect = document.getElementById('avatar-select');
  for (var i = 0, avatar; (avatar = Pond.Battle.AVATARS[i]); i++) {
    // Players 0+1 on first row, 2+3 on second, 4+5 on first, etc.
    var row = (Math.floor(i / 2) % 2) ? row2 : row1;
    // Assign a colour to each avatar.
    var hexColour = Pond.Visualization.getColour(avatar);
    // Add a cell to the avatar status row.
    // <td>
    //   <div class="avatarStatHealth"></div>
    //   <div class="avatarStatName">Rabbit</div>
    //   <div>&nbsp;</div>
    // </td>
    var td = document.createElement('td');
    if (avatarSelect) {
      td.className = 'asButton';
      td.setAttribute('role', 'button');
      var handler = (function(n) {return function() {
        avatarSelect.selectedIndex = n;
        var evt = document.createEvent('HTMLEvents');
        evt.initEvent('change', false, true);
        avatarSelect.dispatchEvent(evt);
      }})(i);
      td.addEventListener('click', handler);
    }
    td.style.borderColor = hexColour;
    var div = document.createElement('div');
    div.className = 'avatarStatHealth';
    div.style.background = hexColour;
    avatar.visualizationHealth = div;
    healthDivs[i] = div;
    td.appendChild(div);
    var div = document.createElement('div');
    div.className = 'avatarStatName';
    var text = document.createTextNode(avatar.name);
    div.appendChild(text);
    nameDivs[i] = div;
    td.appendChild(div);
    var div = document.createElement('div');
    var text = document.createTextNode('\u00a0');
    div.appendChild(text);
    td.appendChild(div);
    row.appendChild(td);
  }
  for (var i = 0, div; (div = nameDivs[i]); i++) {
    div.style.width = (div.parentNode.offsetWidth - 2) + 'px';
  }
  for (var i = 0, div; (div = healthDivs[i]); i++) {
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
      (Pond.Visualization.CANVAS_SIZE - Pond.Visualization.AVATAR_SIZE) +
      Pond.Visualization.AVATAR_HALF_SIZE;
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
  // Draw the avatars, dead ones first.
  var avatars = [];
  for (var i = 0, avatar; (avatar = Pond.Battle.AVATARS[i]); i++) {
    if (avatar.dead) {
      avatars.push(avatar);
    }
  }
  for (var i = 0, avatar; (avatar = Pond.Battle.AVATARS[i]); i++) {
    if (!avatar.dead) {
      avatars.push(avatar);
    }
  }
  for (var i = 0, avatar; (avatar = avatars[i]); i++) {
    ctx.save();
    var x = Pond.Visualization.canvasCoordinate(avatar.loc.x);
    var y = Pond.Visualization.canvasCoordinate(100 - avatar.loc.y);
    ctx.translate(x, y);
    var colour = (avatar.visualizationIndex %
        Pond.Visualization.COLOURS.length) * Pond.Visualization.AVATAR_SIZE;
    if (avatar.dead) {
      ctx.globalAlpha = 0.25;
    }
    if (avatar.speed > 0) {
      // Draw wake bubbles.
      ctx.save();
      if (avatar.speed > 50) {
        var speed = 0;
      } else if (avatar.speed > 25) {
        var speed = Pond.Visualization.AVATAR_SIZE;
      } else {
        var speed = Pond.Visualization.AVATAR_SIZE * 2;
      }
      ctx.rotate(Blockly.utils.math.toRadians(-avatar.degree));
      ctx.drawImage(Pond.Visualization.SPRITES,
          Pond.Visualization.AVATAR_SIZE * 13, speed,
          Pond.Visualization.AVATAR_SIZE,
          Pond.Visualization.AVATAR_SIZE,
          7 - Pond.Visualization.AVATAR_SIZE * 1.5,
          -Pond.Visualization.AVATAR_HALF_SIZE,
          Pond.Visualization.AVATAR_SIZE,
          Pond.Visualization.AVATAR_SIZE);
      ctx.restore();
    }

    // Draw avatar body.
    ctx.drawImage(Pond.Visualization.SPRITES,
        0, colour,
        Pond.Visualization.AVATAR_SIZE,
        Pond.Visualization.AVATAR_SIZE,
        -Pond.Visualization.AVATAR_HALF_SIZE,
        -Pond.Visualization.AVATAR_HALF_SIZE,
        Pond.Visualization.AVATAR_SIZE,
        Pond.Visualization.AVATAR_SIZE);

    // Draw avatar head.
    // Offset the head from the middle.
    var headRadialOffset = 12;
    var headVerticalOffset = 2;
    var radians = Blockly.utils.math.toRadians(avatar.facing);
    var hx = Math.cos(radians) * headRadialOffset;
    var hy = -Math.sin(radians) * headRadialOffset - headVerticalOffset;
    ctx.translate(hx, hy);
    // Divide into 12 quads.
    var quad = (14 - Math.round(avatar.facing / 360 * 12)) % 12 + 1;
    var quadAngle = 360 / 12;  // 30.
    var remainder = avatar.facing % quadAngle;
    if (remainder >= quadAngle / 2) {
      remainder -= quadAngle;
    }
    // For unknown reasons remainder is too large.  Scale down the rotation.
    remainder /= 1.5;
    ctx.rotate(Blockly.utils.math.toRadians(-remainder));
    ctx.drawImage(Pond.Visualization.SPRITES,
        quad * Pond.Visualization.AVATAR_SIZE, colour,
        Pond.Visualization.AVATAR_SIZE,
        Pond.Visualization.AVATAR_SIZE,
        2 - Pond.Visualization.AVATAR_HALF_SIZE,
        2 - Pond.Visualization.AVATAR_HALF_SIZE,
        Pond.Visualization.AVATAR_SIZE,
        Pond.Visualization.AVATAR_SIZE);

    ctx.restore();
  }

  // Draw the missiles.
  for (var i = 0, missile; (missile = Pond.Battle.MISSILES[i]); i++) {
    ctx.save();
    var progress = missile.progress / missile.range;
    var dx = (missile.endLoc.x - missile.startLoc.x) * progress;
    var dy = (missile.endLoc.y - missile.startLoc.y) * -progress;
    // Calculate parabolic arc.
    var halfRange = missile.range / 2;
    var height = missile.range * 0.15;  // Change to set height of arc.
    var xAxis = missile.progress - halfRange;
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
            0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = 'rgba(128, 128, 128, ' +
        Math.max(0, 1 - parabola / 10) + ')';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(missileX, missileY, Pond.Visualization.MISSILE_RADIUS,
            0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = Pond.Visualization.getColour(missile.avatar);
    ctx.fill();
  }

  // Handle any queued events.
  for (var i = 0; i < Pond.Battle.EVENTS.length; i++) {
    var event = Pond.Battle.EVENTS[i];
    var avatar = event['avatar'];
    if (event['type'] == 'CRASH') {
      // Impact between two avatars, or a avatar and the wall.
      // Only play the crash sound if this avatar hasn't crashed recently.
      var lastCrash = Pond.Visualization.CRASH_LOG[avatar.id];
      if (!lastCrash || lastCrash + 1000 < Date.now()) {
        Pond.Visualization.playAudio_('whack', event['damage'] /
                          Pond.Battle.COLLISION_DAMAGE);
        Pond.Visualization.CRASH_LOG[avatar.id] = Date.now();
      }
    } else if (event['type'] == 'SCAN') {
      // Show a sensor scan beam.
      var halfResolution = Math.max(event['resolution'] / 2, 0.5);
      var angle1 = -Blockly.utils.math.toRadians(event['degree'] + halfResolution);
      var angle2 = -Blockly.utils.math.toRadians(event['degree'] - halfResolution);
      ctx.beginPath();
      var x = Pond.Visualization.canvasCoordinate(avatar.loc.x);
      var y = Pond.Visualization.canvasCoordinate(100 - avatar.loc.y);
      var r = 200;
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle1) * r, y + Math.sin(angle1) * r);
      ctx.arc(x, y, r, angle1, angle2);
      ctx.lineTo(x, y);
      var gradient = ctx.createRadialGradient(x, y,
          Pond.Visualization.AVATAR_HALF_SIZE, x, y, r);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fill();
    } else if (event['type'] == 'BANG') {
      // No visualization for firing a cannon currently exists.
    } else if (event['type'] == 'BOOM') {
      // A missile has landed.
      if (event['damage']) {
        // A avatar has taken damage.
        Pond.Visualization.playAudio_('boom', event['damage'] / 10);
      }
      Pond.Visualization.EXPLOSIONS.push({x: event['x'], y: event['y'], t: 0});
    } else if (event['type'] == 'DIE') {
      // A avatar just sustained fatal damage.
      Pond.Visualization.playAudio_('splash');
    }
  }
  Pond.Battle.EVENTS.length = 0;

  // Draw all the explosions.
  for (var i = Pond.Visualization.EXPLOSIONS.length - 1; i >= 0; i--) {
    var explosion = Pond.Visualization.EXPLOSIONS[i];
    var x = Pond.Visualization.canvasCoordinate(explosion.x);
    var y = Pond.Visualization.canvasCoordinate(100 - explosion.y);
    ctx.beginPath();
    ctx.arc(x, y, explosion.t + 1, 0, Math.PI * 2, true);
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
  for (var i = 0, avatar; (avatar = avatars[i]); i++) {
    var div = avatar.visualizationHealth;
    div.parentNode.title = avatar.name + ': ' +
        Math.round(100 - avatar.damage) + '%';
    var width = div.parentNode.offsetWidth * (1 - avatar.damage / 100) - 2;
    div.style.width = Math.max(0, width) + 'px';
  }
};

/**
 * Load an audio file.  Cache it, ready for instantaneous playing.
 * @param {!Array.<string>} filenames List of file types in decreasing order of
 *   preference (i.e. increasing size).  E.g. ['media/go.mp3', 'media/go.wav']
 *   Filenames include path from Blockly's root.  File extensions matter.
 * @param {string} name Name of sound.
 * @private
 */
Pond.Visualization.loadAudio_ = function(filenames, name) {
  if (!window['Audio'] || !filenames.length) {
    // No browser support for Audio.
    return;
  }
  var sound;
  var audioTest = new window['Audio']();
  for (var i = 0; i < filenames.length; i++) {
    var filename = filenames[i];
    var ext = filename.match(/\.(\w+)$/);
    if (ext && audioTest.canPlayType('audio/' + ext[1])) {
      // Found an audio format we can play.
      sound = new window['Audio'](filename);
      break;
    }
  }
  if (sound && sound.play) {
    Pond.Visualization.SOUNDS_[name] = sound;
  }
};

/**
 * Preload all the audio files so that they play quickly when asked for.
 * @private
 */
Pond.Visualization.preloadAudio_ = function() {
  for (var name in Pond.Visualization.SOUNDS_) {
    var sound = Pond.Visualization.SOUNDS_[name];
    sound.volume = 0.01;
    sound.play().catch(function() {});
    sound.pause();
  }
};

/**
 * Play an audio file at specified value.  If volume is not specified,
 * use full volume (1).
 * @param {string} name Name of sound.
 * @param {?number} opt_volume Volume of sound (0-1).
 * @private
 */
Pond.Visualization.playAudio_ = function(name, opt_volume) {
  var sound = Pond.Visualization.SOUNDS_[name];
  var mySound;
  if (Blockly.utils.userAgent.IPAD || Blockly.utils.userAgent.ANDROID) {
    // Creating a new audio node causes lag in IE9, Android and iPad. Android
    // and IE9 refetch the file from the server, iPad uses a singleton audio
    // node which must be deleted and recreated for each new audio tag.
    mySound = sound;
  } else {
    mySound = sound.cloneNode();
  }
  mySound.volume = (opt_volume === undefined ? 1 : opt_volume);
  mySound.play();
};
