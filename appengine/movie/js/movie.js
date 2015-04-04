/**
 * Blockly Games: Movie
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
 * @fileoverview JavaScript for Blockly's Movie application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Movie');

goog.require('Scrubber');
goog.require('Movie.soy');
goog.require('Movie.Blocks');
goog.require('Movie.Answers');
goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');


BlocklyGames.NAME = 'movie';

/**
 * Go to the next level.
 */
BlocklyInterface.nextLevel = function() {
  if (BlocklyGames.LEVEL < BlocklyGames.MAX_LEVEL) {
    window.location = window.location.protocol + '//' +
        window.location.host + window.location.pathname +
        '?lang=' + BlocklyGames.LANG + '&level=' + (BlocklyGames.LEVEL + 1);
  } else {
    BlocklyInterface.indexPage();
  }
};

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
      onresize();
      Blockly.fireUiEvent(window, 'resize');
    });
  window.addEventListener('resize', onresize);
  onresize();

  if (BlocklyGames.LEVEL < BlocklyGames.MAX_LEVEL) {
    Blockly.FieldColour.COLUMNS = 3;
    Blockly.FieldColour.COLOURS =
        ['#ff0000', '#ffcc33', '#ffff00',
         '#009900', '#3333ff', '#cc33cc',
         '#ffffff', '#999999', '#000000'];
  }

  var toolbox = document.getElementById('toolbox');
  Blockly.inject(document.getElementById('blockly'),
      {'media': 'media/',
       'rtl': rtl,
       'toolbox': toolbox,
       'trashcan': true});
  // Prevent collisions with user-defined functions or variables.
  Blockly.JavaScript.addReservedWords('circle,rect,line,penColour,time');

  if (document.getElementById('submitButton')) {
    BlocklyGames.bindClick('submitButton', Movie.submitToReddit);
  }

  var defaultXml = '<xml></xml>';
  if (BlocklyGames.LEVEL == 9) {
    defaultXml = ['<xml xmlns="http://www.w3.org/1999/xhtml">',
          '<block type="movie_colour" inline="false" x="51" y="28">',
            '<value name="COLOUR">',
              '<block type="colour_picker">',
                '<field name="COLOUR">#999999</field>',
              '</block>',
            '</value>',
            '<next>',
              '<block type="movie_line" inline="false">',
                '<value name="X1">',
                  '<block type="math_number">',
                    '<field name="NUM">0</field>',
                  '</block>',
                '</value>',
                '<value name="Y1">',
                  '<block type="math_number">',
                    '<field name="NUM">40</field>',
                  '</block>',
                '</value>',
                '<value name="X2">',
                  '<block type="math_number">',
                    '<field name="NUM">20</field>',
                  '</block>',
                '</value>',
                '<value name="Y2">',
                  '<block type="math_number">',
                    '<field name="NUM">40</field>',
                  '</block>',
                '</value>',
                '<value name="WIDTH">',
                  '<block type="math_number">',
                    '<field name="NUM">1</field>',
                  '</block>',
                '</value>',
                '<next>',
                  '<block type="movie_line" inline="false">',
                    '<value name="X1">',
                      '<block type="math_number">',
                        '<field name="NUM">20</field>',
                      '</block>',
                    '</value>',
                    '<value name="Y1">',
                      '<block type="math_number">',
                        '<field name="NUM">40</field>',
                      '</block>',
                    '</value>',
                    '<value name="X2">',
                      '<block type="math_number">',
                        '<field name="NUM">20</field>',
                      '</block>',
                    '</value>',
                    '<value name="Y2">',
                      '<block type="math_number">',
                        '<field name="NUM">80</field>',
                      '</block>',
                    '</value>',
                    '<value name="WIDTH">',
                      '<block type="math_number">',
                        '<field name="NUM">1</field>',
                      '</block>',
                    '</value>',
                    '<next>',
                      '<block type="movie_line" inline="false">',
                        '<value name="X1">',
                          '<block type="math_number">',
                            '<field name="NUM">20</field>',
                          '</block>',
                        '</value>',
                        '<value name="Y1">',
                          '<block type="math_number">',
                            '<field name="NUM">80</field>',
                          '</block>',
                        '</value>',
                        '<value name="X2">',
                          '<block type="math_number">',
                            '<field name="NUM">80</field>',
                          '</block>',
                        '</value>',
                        '<value name="Y2">',
                          '<block type="math_number">',
                            '<field name="NUM">20</field>',
                          '</block>',
                        '</value>',
                        '<value name="WIDTH">',
                          '<block type="math_number">',
                            '<field name="NUM">1</field>',
                          '</block>',
                        '</value>',
                      '</block>',
                    '</next>',
                  '</block>',
                '</next>',
              '</block>',
            '</next>',
          '</block>',
        '</xml>'].join('');
  }
  BlocklyInterface.loadBlocks(defaultXml, false);

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
  Blockly.addChangeListener(Movie.display);

  // Initialize the scrubber.
  var scrubberSvg = document.getElementById('scrubber');
  Movie.frameScrubber = new Scrubber(scrubberSvg, Movie.display);
  if (BlocklyGames.LEVEL == 1) {
    scrubberSvg.style.display = 'none';
  }

  // Preload the win sound.
  Blockly.loadAudio_(['movie/win.mp3', 'movie/win.ogg'], 'win');
  // Lazy-load the syntax-highlighting.
  setTimeout(BlocklyInterface.importPrettify, 1);

  BlocklyGames.bindClick('helpButton', Movie.showHelp);
  if (location.hash.length < 2 &&
      !BlocklyGames.loadFromLocalStorage(BlocklyGames.NAME,
                                         BlocklyGames.LEVEL)) {
    setTimeout(Movie.showHelp, 1000);
    if (BlocklyGames.LEVEL == 9) {
      setTimeout(BlocklyDialogs.abortOffer, 5 * 60 * 1000);
    }
  }
};

if (window.location.pathname.match(/readonly.html$/)) {
  window.addEventListener('load', function() {
    BlocklyInterface.initReadonly(Movie.soy.readonly());
  });
} else {
  window.addEventListener('load', Movie.init);
}

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
      ctx.fillText(Math.round(100 - i * 100), 3, i* Movie.HEIGHT - 2);
    }
    major = major == 1 ? 2 : 1;
  }
};

/**
 * Draw one frame of the movie.
 * @param {!Object} interpreter A JS interpreter loaded with user code.
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
 * @param {number=} frameNumber Which frame to draw (0-100).
 */
Movie.display = function(frameNumber) {
  if (typeof frameNumber == 'number') {
    Movie.frameNumber = frameNumber;
  } else {
    frameNumber = Movie.frameNumber;
  }

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
  var code = Blockly.JavaScript.workspaceToCode();
  var interpreter = new Interpreter(code, Movie.initInterpreter);
  Movie.drawFrame_(interpreter);
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
 * @param {!Object} scope Global scope.
 * @param {!Interpreter} interpreter The JS interpreter.
 */
Movie.initInterpreter = function(interpreter, scope) {
  // API
  var wrapper;
  wrapper = function(x, y, radius) {
    Movie.circle(x.valueOf(), y.valueOf(), radius.valueOf());
  };
  interpreter.setProperty(scope, 'circle',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(x, y, w, h) {
    Movie.rect(x.valueOf(), y.valueOf(), w.valueOf(), h.valueOf());
  };
  interpreter.setProperty(scope, 'rect',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(x1, y1, x2, y2, w) {
    Movie.line(x1.valueOf(), y1.valueOf(),
               x2.valueOf(), y2.valueOf(), w.valueOf());
  };
  interpreter.setProperty(scope, 'line',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(colour) {
    Movie.penColour(colour.toString());
  };
  interpreter.setProperty(scope, 'penColour',
      interpreter.createNativeFunction(wrapper));

  wrapper = function() {
    return interpreter.createPrimitive(Movie.frameNumber);
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
  var userImage =
      Movie.ctxScratch.getImageData(0, 0, Movie.WIDTH, Movie.HEIGHT);
  var answer = document.getElementById('answer' + Movie.frameNumber);
  if (answer) {
    var ctxAnswer = answer.getContext('2d');
    var answerImage = ctxAnswer.getImageData(0, 0, Movie.WIDTH, Movie.HEIGHT);
    var len = Math.min(userImage.data.length, answerImage.data.length);
    var delta = 0;
    // Pixels are in RGBA format.  Only check the Alpha bytes.
    for (var i = 3; i < len; i += 4) {
      // Check the Alpha byte.
      if (Math.abs(userImage.data[i] - answerImage.data[i]) > 64) {
        delta++;
      }
    }
    Movie.pixelErrors[Movie.frameNumber] = delta;
  }
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
      Blockly.playAudio('win', 0.5);
      BlocklyDialogs.congratulations();
    }
  }
};

/**
 * Send an image of the canvas to Reddit.
 */
Movie.submitToReddit = function() {
  var blockCount = Blockly.mainWorkspace.getAllBlocks(false).length;
  var code = Blockly.JavaScript.workspaceToCode();
  if (blockCount < 5 || code.indexOf('time()') == -1) {
    alert(BlocklyGames.getMsg('Movie_submitDisabled'));
    return;
  }
  // Draw and copy the user layer.
  var code = Blockly.JavaScript.workspaceToCode();
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
  ctxThumb.drawImage(Movie.ctxScratch.canvas, 0, 0, 100, 100);
  var thumbData = thumbnail.toDataURL('image/png');
  document.getElementById('t2r_thumb').value = thumbData;

  // Encode the XML.
  var xml = Blockly.Xml.workspaceToDom(Blockly.getMainWorkspace());
  var xmlData = Blockly.Xml.domToText(xml);
  document.getElementById('t2r_xml').value = xmlData;

  // Submit the form.
  document.getElementById('t2r_form').submit();
};
