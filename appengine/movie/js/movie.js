/**
 * @license
 * Copyright 2014 Google LLC
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
 * @fileoverview JavaScript for Movie game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Movie');

goog.require('Blockly.Comment');
goog.require('Blockly.FieldColour');
goog.require('Blockly.FlyoutButton');
goog.require('Blockly.Toolbox');
goog.require('Blockly.Trashcan');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.style');
goog.require('Blockly.VerticalFlyout');
goog.require('Blockly.ZoomControls');
goog.require('BlocklyDialogs');
goog.require('BlocklyGallery');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('Movie.Answers');
goog.require('Movie.Blocks');
goog.require('Movie.soy');
goog.require('Scrubber');


BlocklyGames.NAME = 'movie';

Movie.HEIGHT = 400;
Movie.WIDTH = 400;

/**
 * Number of frames in the animation.
 * First level has only one frame (#0).  The rest have 101 (#0-#100).
 * @type number
 */
Movie.FRAMES = BlocklyGames.LEVEL == 1 ? 0 : 100;

/**
 * Array of pixel errors, one per frame.
 */
Movie.pixelErrors = new Array(Movie.FRAMES);

/**
 * Has the level been solved once?
 */
Movie.success = false;

/**
 * Current frame being shown.
 */
Movie.frameNumber = 0;

/**
 * Initialize Blockly and the movie.  Called on page load.
 */
Movie.init = function() {
  // Render the Soy template.
  document.body.innerHTML = Movie.soy.start({}, null,
      {lang: BlocklyGames.LANG,
       level: BlocklyGames.LEVEL,
       maxLevel: BlocklyGames.MAX_LEVEL,
       html: BlocklyGames.IS_HTML});

  BlocklyInterface.init();

  var rtl = BlocklyGames.isRtl();
  var blocklyDiv = document.getElementById('blockly');
  var visualization = document.getElementById('visualization');
  var onresize = function(e) {
    var top = visualization.offsetTop;
    blocklyDiv.style.top = Math.max(10, top - window.pageYOffset) + 'px';
    blocklyDiv.style.left = rtl ? '10px' : '420px';
    blocklyDiv.style.width = (window.innerWidth - 440) + 'px';
  };
  window.addEventListener('scroll', function() {
    onresize(null);
    Blockly.svgResize(BlocklyInterface.workspace);
  });
  window.addEventListener('resize', onresize);
  onresize(null);

  if (BlocklyGames.LEVEL < BlocklyGames.MAX_LEVEL) {
    Blockly.FieldColour.COLUMNS = 3;
    Blockly.FieldColour.COLOURS =
        ['#ff0000', '#ffcc33', '#ffff00',
         '#009900', '#3333ff', '#cc33cc',
         '#ffffff', '#999999', '#000000'];
  }

  BlocklyInterface.injectBlockly(
      {'rtl': rtl,
       'trashcan': true,
       'zoom': BlocklyGames.LEVEL == BlocklyGames.MAX_LEVEL ?
           {'controls': true, 'wheel': true} : null});
  // Prevent collisions with user-defined functions or variables.
  Blockly.JavaScript.addReservedWords('circle,rect,line,penColour,time');

  if (document.getElementById('submitButton')) {
    BlocklyGames.bindClick('submitButton', Movie.submitToGallery);
  }

  var defaultXml = '<xml></xml>';
  BlocklyInterface.loadBlocks(defaultXml, true);

  Movie.ctxDisplay = document.getElementById('display').getContext('2d');
  Movie.ctxDisplay.globalCompositeOperation = 'source-over';
  Movie.ctxScratch = document.getElementById('scratch').getContext('2d');
  Movie.renderHatching_();
  // Render the frame zero answer because we need it right now.
  Movie.renderAnswer_(0);
  // Remaining answers may be computed later without slowing down page load.
  function renderRemainingAnswers() {
    for (var f = 1; f <= Movie.FRAMES; f++) {
      Movie.renderAnswer_(f);
    }
  }
  setTimeout(renderRemainingAnswers, 1);
  Movie.renderAxies_();
  Movie.display();
  BlocklyInterface.workspace.addChangeListener(Movie.display);

  // Initialize the scrubber.
  var scrubberSvg = document.getElementById('scrubber');
  Movie.frameScrubber = new Scrubber(scrubberSvg, Movie.display);
  if (BlocklyGames.LEVEL == 1) {
    scrubberSvg.style.display = 'none';
  }

  // Preload the win sound.
  BlocklyInterface.workspace.getAudioManager().load(
      ['movie/win.mp3', 'movie/win.ogg'], 'win');
  // Lazy-load the JavaScript interpreter.
  BlocklyInterface.importInterpreter();
  // Lazy-load the syntax-highlighting.
  BlocklyInterface.importPrettify();

  BlocklyGames.bindClick('helpButton', Movie.showHelp);
  if (location.hash.length < 2 &&
      !BlocklyGames.loadFromLocalStorage(BlocklyGames.NAME,
                                         BlocklyGames.LEVEL)) {
    setTimeout(Movie.showHelp, 1000);
  }

  visualization.addEventListener('mouseover', Movie.showCoordinates);
  visualization.addEventListener('mouseout', Movie.hideCoordinates);
  visualization.addEventListener('mousemove', Movie.updateCoordinates);
};

/**
 * Show the x/y coordinates.
 * @param {!Event} e Mouse over event.
 */
Movie.showCoordinates = function(e) {
  document.getElementById('coordinates').style.display = 'block';
};

/**
 * Hide the x/y coordinates.
 * @param {Event} e Mouse out event.
 */
Movie.hideCoordinates = function(e) {
  document.getElementById('coordinates').style.display = 'none';
};

/**
 * Update the x/y coordinates.
 * @param {!Event} e Mouse move event.
 */
Movie.updateCoordinates = function(e) {
  // Get the coordinates of the mouse.
  var rtl = BlocklyGames.isRtl();
  var x = e.clientX;
  var y = e.clientY;
  if (rtl) {
    x -= window.innerWidth;
  }
  // Compensate for the location of the visualization.
  var viz = document.getElementById('visualization');
  var position = Blockly.utils.style.getPageOffset(viz);
  var scroll = Blockly.utils.style.getViewportPageOffset();
  var offset = Blockly.utils.Coordinate.difference(position, scroll);
  x += rtl ? offset.x : -offset.x;
  y -= offset.y;
  // The visualization is 400x400, but the coordinates are 100x100.
  x /= 4;
  y /= 4;
  // Flip the y axis so the origin is at the bottom.
  y = 100 - y;
  if (rtl) {
    x += 100;
  }
  if (BlocklyGames.LEVEL == 10) {
    // Round to the nearest integer.
    x = Math.round(x);
    y = Math.round(y);
  } else {
    // Round to the nearest 10.
    x = Math.round(x / 10) * 10;
    y = Math.round(y / 10) * 10;
  }
  if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
    document.getElementById('x').textContent = 'x = ' + x;
    document.getElementById('y').textContent = 'y = ' + y;
  } else {
    Movie.hideCoordinates();
  }
};

/**
 * Show the help pop-up.
 */
Movie.showHelp = function() {
  var help = document.getElementById('help');
  var button = document.getElementById('helpButton');
  var style = {
    width: '50%',
    left: '25%',
    top: '5em'
  };

  if (BlocklyGames.LEVEL == 2) {
    var xml = '<xml><block type="movie_time" x="15" y="10"></block></xml>';
    BlocklyInterface.injectReadonly('sampleHelp2', xml);
  }

  BlocklyDialogs.showDialog(help, button, true, true, style, Movie.hideHelp);
  BlocklyDialogs.startDialogKeyDown();
};

/**
 * Hide the help pop-up.
 */
Movie.hideHelp = function() {
  BlocklyDialogs.stopDialogKeyDown();
};

/**
 * On startup draw the expected answers and save it to answer canvases.
 * @param {number} f Frame number (0-100).
 * @private
 */
Movie.renderAnswer_ = function(f) {
  var div = document.getElementById('visualization');
  Movie.ctxScratch.strokeStyle = '#000';
  Movie.ctxScratch.fillStyle = '#000';
  // Create a new canvas object for each answer.
  // <canvas id="answer1" width="400" height="400" style="display: none">
  // </canvas>
  var canvas = document.createElement('canvas');
  canvas.id = 'answer' + f;
  canvas.width = Movie.WIDTH;
  canvas.height = Movie.HEIGHT;
  canvas.style.display = 'none';
  div.appendChild(canvas);

  // Clear the scratch canvas.
  Movie.ctxScratch.canvas.width = Movie.ctxScratch.canvas.width;
  // Render the answer.
  Movie.answer(f);
  // Copy the scratch canvas to the answer canvas.
  var ctx = canvas.getContext('2d');
  ctx.globalCompositeOperation = 'copy';
  ctx.drawImage(Movie.ctxScratch.canvas, 0, 0);
};

/**
 * On startup draw hatching that will be displayed across the answers.
 * @private
 */
Movie.renderHatching_ = function() {
  var ctx = document.getElementById('hatching').getContext('2d');
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  for (var i = -Movie.HEIGHT; i < Movie.HEIGHT; i += 4) {
    ctx.beginPath();
    ctx.moveTo(i, -i);
    ctx.lineTo(i + Movie.HEIGHT, -i + Movie.WIDTH);
    ctx.stroke();
  }
};

/**
 * On startup draw the axis scales and save it to the axies canvas.
 * @private
 */
Movie.renderAxies_ = function() {
  var ctx = document.getElementById('axies').getContext('2d');
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#bba';
  ctx.fillStyle = '#bba';
  ctx.font = 'normal 14px sans-serif';
  var TICK_LENGTH = 9;
  var major = 1;
  for (var i = 0.1; i < 0.9; i += 0.1) {
    // Bottom edge.
    ctx.beginPath();
    ctx.moveTo(i * Movie.WIDTH, Movie.HEIGHT);
    ctx.lineTo(i * Movie.WIDTH, Movie.HEIGHT - TICK_LENGTH * major);
    ctx.stroke();
    // Left edge.
    ctx.beginPath();
    ctx.moveTo(0, i * Movie.HEIGHT);
    ctx.lineTo(TICK_LENGTH * major, i * Movie.HEIGHT);
    ctx.stroke();
    if (major == 2) {
      ctx.fillText(Math.round(i * 100), i * Movie.WIDTH + 2, Movie.HEIGHT - 4);
      ctx.fillText(Math.round(100 - i * 100), 3, i * Movie.HEIGHT - 2);
    }
    major = major == 1 ? 2 : 1;
  }
};

/**
 * Draw one frame of the movie.
 * @param {!Interpreter} interpreter A JS Interpreter loaded with user code.
 * @private
 */
Movie.drawFrame_ = function(interpreter) {
  // Clear the canvas.
  Movie.ctxScratch.canvas.width = Movie.ctxScratch.canvas.width;
  Movie.ctxScratch.strokeStyle = '#000';
  Movie.ctxScratch.fillStyle = '#000';
  // Levels 1-9 should be slightly transparent so eclipsed blocks may be seen.
  // Level 10 should be opaque so that the movie is clean.
  Movie.ctxScratch.globalAlpha =
      (BlocklyGames.LEVEL == BlocklyGames.MAX_LEVEL) ? 1 : 0.9;

  var go = true;
  for (var tick = 0; go && tick < 10000; tick++) {
    try {
      go = interpreter.step();
    } catch (e) {
      // User error, terminate in shame.
      alert(e);
      go = false;
    }
  }
};

/**
 * Copy the scratch canvas to the display canvas.
 * @param {number=} opt_frameNumber Which frame to draw (0-100).
 *     If not defined, draws the current frame.
 */
Movie.display = function(opt_frameNumber) {
  if (!('Interpreter' in window)) {
    // Interpreter lazy loads and hasn't arrived yet.  Try again later.
    setTimeout(function() {Movie.display(opt_frameNumber);}, 250);
    return;
  }
  if (typeof opt_frameNumber == 'number') {
    Movie.frameNumber = opt_frameNumber;
  }
  var frameNumber = Movie.frameNumber;

  // Clear the display with white.
  Movie.ctxDisplay.beginPath();
  Movie.ctxDisplay.rect(0, 0,
      Movie.ctxDisplay.canvas.width, Movie.ctxDisplay.canvas.height);
  Movie.ctxDisplay.fillStyle = '#ffffff';
  Movie.ctxDisplay.fill();

  // Copy the answer.
  var answer = document.getElementById('answer' + frameNumber);
  if (answer) {
    Movie.ctxDisplay.globalAlpha = 0.2;
    Movie.ctxDisplay.drawImage(answer, 0, 0);
    Movie.ctxDisplay.globalAlpha = 1;
  }

  // Copy the hatching.
  var hatching = document.getElementById('hatching');
  Movie.ctxDisplay.drawImage(hatching, 0, 0);

  // Draw and copy the user layer.
  var code = BlocklyInterface.getJsCode();
  try {
    var interpreter = new Interpreter(code, Movie.initInterpreter);
  } catch (e) {
    // Trap syntax errors: break outside a loop, or return outside a function.
    console.error(e);
  }
  if (interpreter) {
    Movie.drawFrame_(interpreter);
  } else {
    // In the event of a syntax error, clear the canvas.
    Movie.ctxScratch.canvas.width = Movie.ctxScratch.canvas.width;
  }
  Movie.ctxDisplay.drawImage(Movie.ctxScratch.canvas, 0, 0);

  // Copy the axies.
  Movie.ctxDisplay.drawImage(document.getElementById('axies'), 0, 0);
  Movie.checkFrameAnswer();
  if (BlocklyGames.LEVEL == 1) {
    setTimeout(Movie.checkAnswers, 1000);
  }
};

/**
 * Inject the Movie API into a JavaScript interpreter.
 * @param {!Interpreter} interpreter The JS Interpreter.
 * @param {!Interpreter.Object} scope Global scope.
 */
Movie.initInterpreter = function(interpreter, scope) {
  // API
  var wrapper;
  wrapper = function(x, y, radius) {
    Movie.circle(x, y, radius);
  };
  interpreter.setProperty(scope, 'circle',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(x, y, w, h) {
    Movie.rect(x, y, w, h);
  };
  interpreter.setProperty(scope, 'rect',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(x1, y1, x2, y2, w) {
    Movie.line(x1, y1, x2, y2, w);
  };
  interpreter.setProperty(scope, 'line',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(colour) {
    Movie.penColour(colour);
  };
  interpreter.setProperty(scope, 'penColour',
      interpreter.createNativeFunction(wrapper));

  wrapper = function() {
    return Movie.frameNumber;
  };
  interpreter.setProperty(scope, 'time',
      interpreter.createNativeFunction(wrapper));
};

/**
 * Convert from ideal 0-100 coordinates to canvas's 0-400 coordinates.
 */
Movie.SCALE = 400 / 100;

/**
 * Draw a circle.
 * @param {number} x Horizontal location of centre (0-100).
 * @param {number} y Vertical location of centre (0-100).
 * @param {number} radius Radius of circle.
 */
Movie.circle = function(x, y, radius) {
  y = 100 - y;
  x *= Movie.SCALE;
  y *= Movie.SCALE;
  radius = Math.max(radius * Movie.SCALE, 0);
  Movie.ctxScratch.beginPath();
  Movie.ctxScratch.arc(x, y, radius, 0, 2 * Math.PI, false);
  Movie.ctxScratch.fill();
};

/**
 * Draw a rectangle.
 * @param {number} x Horizontal location of centre (0-100).
 * @param {number} y Vertical location of centre (0-100).
 * @param {number} width Width of rectangle.
 * @param {number} height Height of rectangle.
 */
Movie.rect = function(x, y, width, height) {
  y = 100 - y;
  x *= Movie.SCALE;
  y *= Movie.SCALE;
  width = Math.max(width * Movie.SCALE, 0);
  height = Math.max(height * Movie.SCALE, 0);
  Movie.ctxScratch.beginPath();
  Movie.ctxScratch.rect(x - width / 2, y - height / 2, width, height);
  Movie.ctxScratch.fill();
};

/**
 * Draw a rectangle.
 * @param {number} x1 Horizontal location of start (0-100).
 * @param {number} y1 Vertical location of start (0-100).
 * @param {number} x2 Horizontal location of end (0-100).
 * @param {number} y2 Vertical location of end (0-100).
 * @param {number} width Width of line.
 */
Movie.line = function(x1, y1, x2, y2, width) {
  y1 = 100 - y1;
  y2 = 100 - y2;
  x1 *= Movie.SCALE;
  y1 *= Movie.SCALE;
  x2 *= Movie.SCALE;
  y2 *= Movie.SCALE;
  width *= Movie.SCALE;
  Movie.ctxScratch.beginPath();
  Movie.ctxScratch.moveTo(x1, y1);
  Movie.ctxScratch.lineTo(x2, y2);
  Movie.ctxScratch.lineWidth = Math.max(width, 0);
  Movie.ctxScratch.stroke();
};

/**
 * Change the colour of the pen.
 * @param {string} colour Hexadecimal #rrggbb colour string.
 */
Movie.penColour = function(colour) {
  Movie.ctxScratch.strokeStyle = colour;
  Movie.ctxScratch.fillStyle = colour;
};

/**
 * Verify if the answer to this frame is correct.
 */
Movie.checkFrameAnswer = function() {
  // Compare the Alpha (opacity) byte of each pixel in the user's image and
  // the sample answer image.
  var answer = document.getElementById('answer' + Movie.frameNumber);
  if (!answer) {
    return;
  }
  var ctxAnswer = answer.getContext('2d');
  var answerImage = ctxAnswer.getImageData(0, 0, Movie.WIDTH, Movie.HEIGHT);
  var userImage =
      Movie.ctxScratch.getImageData(0, 0, Movie.WIDTH, Movie.HEIGHT);
  var len = Math.min(userImage.data.length, answerImage.data.length);
  var delta = 0;
  // Pixels are in RGBA format.  Only check the Alpha bytes.
  for (var i = 3; i < len; i += 4) {
    // Check the Alpha byte.
    if (Math.abs(userImage.data[i] - answerImage.data[i]) > 96) {
      delta++;
    }
  }
  Movie.pixelErrors[Movie.frameNumber] = delta;
};

/**
 * Verify if all the answers are correct.
 * If so, move on to next level.
 */
Movie.checkAnswers = function() {
  if (BlocklyGames.LEVEL > 1 && Movie.frameNumber != Movie.FRAMES) {
    // Only check answers at the end of the run.
    return;
  }
  if (Movie.isCorrect() && !Movie.success) {
    Movie.success = true;
    BlocklyInterface.saveToLocalStorage();
    if (BlocklyGames.LEVEL < BlocklyGames.MAX_LEVEL) {
      // No congrats for last level, it is open ended.
      BlocklyInterface.workspace.getAudioManager().play('win', 0.5);
      BlocklyDialogs.congratulations();
    }
  }
};

/**
 * Send an image of the canvas to gallery.
 */
Movie.submitToGallery = function() {
  var blockCount = BlocklyInterface.workspace.getAllBlocks().length;
  var code = BlocklyInterface.getJsCode();
  if (blockCount < 4 || code.indexOf('time()') == -1) {
    alert(BlocklyGames.getMsg('Movie_submitDisabled'));
    return;
  }
  // Draw and copy the user layer.
  var interpreter = new Interpreter(code, Movie.initInterpreter);
  var frameNumber = Movie.frameNumber;
  try {
    Movie.frameNumber = Math.round(Movie.FRAMES / 2);
    Movie.drawFrame_(interpreter);
  } finally {
    Movie.frameNumber = frameNumber;
  }
  // Encode the thumbnail.
  var thumbnail = document.getElementById('thumbnail');
  var ctxThumb = thumbnail.getContext('2d');
  ctxThumb.globalCompositeOperation = 'copy';
  ctxThumb.drawImage(Movie.ctxScratch.canvas, 0, 0, 200, 200);
  var thumbData = thumbnail.toDataURL('image/png');
  document.getElementById('galleryThumb').value = thumbData;

  // Show the dialog.
  BlocklyGallery.showGalleryForm();
};

window.addEventListener('load', Movie.init);
