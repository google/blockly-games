/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
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
goog.require('Blockly.JavaScript');
goog.require('Blockly.Toolbox');
goog.require('Blockly.Trashcan');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.style');
goog.require('Blockly.VerticalFlyout');
goog.require('Blockly.ZoomControls');
goog.require('BlocklyCode');
goog.require('BlocklyDialogs');
goog.require('BlocklyGallery');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('Movie.Blocks');
goog.require('Movie.html');
goog.require('Scrubber');


BlocklyGames.storageName = 'movie';

const HEIGHT = 400;
const WIDTH = 400;

/**
 * Number of frames in the animation.
 * First level has only one frame (#0).  The rest have 101 (#0-#100).
 * @type number
 */
const FRAMES = BlocklyGames.LEVEL === 1 ? 0 : 100;

/**
 * Array of pixel errors, one per frame.
 */
let pixelErrors = new Array(FRAMES);

/**
 * Has the level been solved once?
 */
let success = false;

/**
 * Current frame being shown.
 */
let frameNumber = 0;

let ctxDisplay;
let ctxScratch;

/**
 * Initialize Blockly and the movie.  Called on page load.
 */
function init() {
  Movie.Blocks.init();

  // Render the HTML.
  document.body.innerHTML = Movie.html.start(
      {lang: BlocklyGames.LANG,
       level: BlocklyGames.LEVEL,
       maxLevel: BlocklyGames.MAX_LEVEL,
       html: BlocklyGames.IS_HTML});

  BlocklyInterface.init(BlocklyGames.getMsg('Games.movie', false));

  const rtl = BlocklyGames.IS_RTL;
  const blocklyDiv = BlocklyGames.getElementById('blockly');
  const visualization = BlocklyGames.getElementById('visualization');
  const onresize = function(_e) {
    const top = visualization.offsetTop;
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
       'zoom': BlocklyGames.LEVEL === BlocklyGames.MAX_LEVEL ?
           {'controls': true, 'wheel': true} : null});
  // Prevent collisions with user-defined functions or variables.
  Blockly.JavaScript.addReservedWords('circle,rect,line,penColour,time');

  if (BlocklyGames.getElementById('submitButton')) {
    BlocklyGames.bindClick('submitButton', submitToGallery);
  }

  const defaultXml = '<xml></xml>';
  BlocklyInterface.loadBlocks(defaultXml, true);

  ctxDisplay = BlocklyGames.getElementById('display').getContext('2d');
  ctxDisplay.globalCompositeOperation = 'source-over';
  ctxScratch = BlocklyGames.getElementById('scratch').getContext('2d');
  renderHatching_();
  // Render the frame zero answer because we need it right now.
  renderAnswer_(0);
  // Remaining answers may be computed later without slowing down page load.
  function renderRemainingAnswers() {
    for (let f = 1; f <= FRAMES; f++) {
      renderAnswer_(f);
    }
  }
  setTimeout(renderRemainingAnswers, 1);
  renderAxies_();
  codeChange();
  BlocklyInterface.workspace.addChangeListener(codeChange);
  display();

  // Initialize the scrubber.
  const scrubberSvg = BlocklyGames.getElementById('scrubber');
  new Scrubber(scrubberSvg, display, checkAnswers);
  if (BlocklyGames.LEVEL === 1) {
    scrubberSvg.style.display = 'none';
  }

  // Preload the win sound.
  BlocklyInterface.workspace.getAudioManager().load(
      ['movie/win.mp3', 'movie/win.ogg'], 'win');
  // Lazy-load the JavaScript interpreter.
  BlocklyCode.importInterpreter();
  // Lazy-load the syntax-highlighting.
  BlocklyCode.importPrettify();

  BlocklyGames.bindClick('helpButton', showHelp);
  if (location.hash.length < 2 &&
      !BlocklyGames.loadFromLocalStorage(BlocklyGames.storageName,
                                         BlocklyGames.LEVEL)) {
    setTimeout(showHelp, 1000);
  }

  visualization.addEventListener('mouseover', showCoordinates);
  visualization.addEventListener('mouseout', hideCoordinates);
  visualization.addEventListener('mousemove', updateCoordinates);
}

/**
 * Show the x/y coordinates.
 * @param {!Event} e Mouse over event.
 */
function showCoordinates(e) {
  BlocklyGames.getElementById('coordinates').style.display = 'block';
}

/**
 * Hide the x/y coordinates.
 * @param {Event} e Mouse out event.
 */
function hideCoordinates(e) {
  BlocklyGames.getElementById('coordinates').style.display = 'none';
}

/**
 * Update the x/y coordinates.
 * @param {!Event} e Mouse move event.
 */
function updateCoordinates(e) {
  // Get the coordinates of the mouse.
  const rtl = BlocklyGames.IS_RTL;
  let x = e.clientX;
  let y = e.clientY;
  if (rtl) {
    x -= window.innerWidth;
  }
  // Compensate for the location of the visualization.
  const viz = BlocklyGames.getElementById('visualization');
  const position = Blockly.utils.style.getPageOffset(viz);
  const scroll = Blockly.utils.style.getViewportPageOffset();
  const offset = Blockly.utils.Coordinate.difference(position, scroll);
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
  if (BlocklyGames.LEVEL === 10) {
    // Round to the nearest integer.
    x = Math.round(x);
    y = Math.round(y);
  } else {
    // Round to the nearest 10.
    x = Math.round(x / 10) * 10;
    y = Math.round(y / 10) * 10;
  }
  if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
    BlocklyGames.getElementById('x').textContent = 'x = ' + x;
    BlocklyGames.getElementById('y').textContent = 'y = ' + y;
  } else {
    hideCoordinates();
  }
}

/**
 * Show the help pop-up.
 */
function showHelp() {
  const help = BlocklyGames.getElementById('help');
  const button = BlocklyGames.getElementById('helpButton');
  const style = {
    width: '50%',
    left: '25%',
    top: '5em',
  };

  if (BlocklyGames.LEVEL === 2) {
    const xml = '<xml><block type="movie_time" x="15" y="10"></block></xml>';
    BlocklyInterface.injectReadonly('sampleHelp2', xml);
  }

  BlocklyDialogs.showDialog(help, button, true, true, style,
      BlocklyDialogs.stopDialogKeyDown);
  BlocklyDialogs.startDialogKeyDown();
}

/**
 * On startup draw the expected answers and save it to answer canvases.
 * @param {number} f Frame number (0-100).
 * @private
 */
function renderAnswer_(f) {
  const div = BlocklyGames.getElementById('visualization');
  ctxScratch.strokeStyle = '#000';
  ctxScratch.fillStyle = '#000';
  // Create a new canvas object for each answer.
  // <canvas id="answer1" width="400" height="400" style="display: none">
  // </canvas>
  const canvas = document.createElement('canvas');
  canvas.id = 'answer' + f;
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  canvas.style.display = 'none';
  div.appendChild(canvas);

  // Clear the scratch canvas.
  ctxScratch.canvas.width = ctxScratch.canvas.width;
  // Render the answer.
  answer(f);
  // Copy the scratch canvas to the answer canvas.
  const ctx = canvas.getContext('2d');
  ctx.globalCompositeOperation = 'copy';
  ctx.drawImage(ctxScratch.canvas, 0, 0);
}

/**
 * On startup draw hatching that will be displayed across the answers.
 * @private
 */
function renderHatching_() {
  const ctx = BlocklyGames.getElementById('hatching').getContext('2d');
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  for (let i = -HEIGHT; i < HEIGHT; i += 4) {
    ctx.beginPath();
    ctx.moveTo(i, -i);
    ctx.lineTo(i + HEIGHT, -i + WIDTH);
    ctx.stroke();
  }
}

/**
 * On startup draw the axis scales and save it to the axies canvas.
 * @private
 */
function renderAxies_() {
  const ctx = BlocklyGames.getElementById('axies').getContext('2d');
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#bba';
  ctx.fillStyle = '#bba';
  ctx.font = 'normal 14px sans-serif';
  const TICK_LENGTH = 9;
  let major = 1;
  for (let i = 0.1; i < 0.9; i += 0.1) {
    // Bottom edge.
    ctx.beginPath();
    ctx.moveTo(i * WIDTH, HEIGHT);
    ctx.lineTo(i * WIDTH, HEIGHT - TICK_LENGTH * major);
    ctx.stroke();
    // Left edge.
    ctx.beginPath();
    ctx.moveTo(0, i * HEIGHT);
    ctx.lineTo(TICK_LENGTH * major, i * HEIGHT);
    ctx.stroke();
    if (major === 2) {
      ctx.fillText(Math.round(i * 100), i * WIDTH + 2, HEIGHT - 4);
      ctx.fillText(Math.round(100 - i * 100), 3, i * HEIGHT - 2);
    }
    major = (major === 1) ? 2 : 1;
  }
}

/**
 * Draw one frame of the movie.
 * @param {!Interpreter} interpreter A JS-Interpreter loaded with user code.
 * @private
 */
function drawFrame_(interpreter) {
  // Clear the canvas.
  ctxScratch.canvas.width = ctxScratch.canvas.width;
  ctxScratch.strokeStyle = '#000';
  ctxScratch.fillStyle = '#000';
  // Levels 1-9 should be slightly transparent so eclipsed blocks may be seen.
  // Level 10 should be opaque so that the movie is clean.
  ctxScratch.globalAlpha =
      (BlocklyGames.LEVEL === BlocklyGames.MAX_LEVEL) ? 1 : 0.9;

  let go = true;
  for (let tick = 0; go && tick < 10000; tick++) {
    try {
      go = interpreter.step();
    } catch (e) {
      // User error, terminate in shame.
      alert(e);
      go = false;
    }
  }
}

/**
 * Generate new JavaScript if the code has changed.
 * @param {!Blockly.Events.Abstract=} opt_e Change event.
 */
function codeChange(opt_e) {
  if (opt_e && opt_e.isUiEvent) {
    return;
  }
  if (BlocklyInterface.workspace.isDragging()) {
    // Don't update code during a drag (insertion markers mess everything up).
    return;
  }
  const code = BlocklyCode.getJsCode();
  if (BlocklyCode.executedJsCode === code) {
    return;
  }
  // Code has changed, clear all recorded frame info.
  pixelErrors = new Array(FRAMES);
  BlocklyCode.executedJsCode = code;
  BlocklyInterface.executedCode = BlocklyInterface.getCode();
  display();
}

/**
 * Copy the scratch canvas to the display canvas.
 * @param {number=} opt_frameNumber Which frame to draw (0-100).
 *     If not defined, draws the current frame.
 */
function display(opt_frameNumber) {
  if (!('Interpreter' in window)) {
    // Interpreter lazy loads and hasn't arrived yet.  Try again later.
    setTimeout(display, 99, opt_frameNumber);
    return;
  }
  if (typeof opt_frameNumber === 'number') {
    frameNumber = opt_frameNumber;
  }

  // Clear the display with white.
  ctxDisplay.beginPath();
  ctxDisplay.rect(0, 0, ctxDisplay.canvas.width, ctxDisplay.canvas.height);
  ctxDisplay.fillStyle = '#fff';
  ctxDisplay.fill();

  // Copy the answer.
  const answer = BlocklyGames.getElementById('answer' + frameNumber);
  if (answer) {
    ctxDisplay.globalAlpha = 0.2;
    ctxDisplay.drawImage(answer, 0, 0);
    ctxDisplay.globalAlpha = 1;
  }

  // Copy the hatching.
  const hatching = BlocklyGames.getElementById('hatching');
  ctxDisplay.drawImage(hatching, 0, 0);

  // Draw and copy the user layer.
  const code = BlocklyCode.executedJsCode;
  let interpreter;
  try {
    interpreter = new Interpreter(code, initInterpreter);
  } catch (e) {
    // Trap syntax errors: break outside a loop, or return outside a function.
    console.error(e);
  }
  if (interpreter) {
    drawFrame_(interpreter);
  } else {
    // In the event of a syntax error, clear the canvas.
    ctxScratch.canvas.width = ctxScratch.canvas.width;
  }
  ctxDisplay.drawImage(ctxScratch.canvas, 0, 0);

  // Copy the axies.
  ctxDisplay.drawImage(BlocklyGames.getElementById('axies'), 0, 0);
  checkFrameAnswer();
  if (BlocklyGames.LEVEL === 1) {
    setTimeout(checkAnswers, 1000);
  }
}

/**
 * Inject the Movie API into a JavaScript interpreter.
 * @param {!Interpreter} interpreter The JS-Interpreter.
 * @param {!Interpreter.Object} globalObject Global object.
 */
function initInterpreter(interpreter, globalObject) {
  // API
  let wrapper;
  wrapper = function(x, y, radius) {
    circle(x, y, radius);
  };
  wrap('circle');

  wrapper = function(x, y, w, h) {
    rect(x, y, w, h);
  };
  wrap('rect');

  wrapper = function(x1, y1, x2, y2, w) {
    line(x1, y1, x2, y2, w);
  };
  wrap('line');

  wrapper = function(colour) {
    penColour(colour);
  };
  wrap('penColour');

  wrapper = function() {
    return frameNumber;
  };
  wrap('time');

  function wrap(name) {
    interpreter.setProperty(globalObject, name,
        interpreter.createNativeFunction(wrapper, false));
  }
}

/**
 * Convert from ideal 0-100 coordinates to canvas's 0-400 coordinates.
 */
const SCALE = 400 / 100;

/**
 * Draw a circle.
 * @param {number} x Horizontal location of centre (0-100).
 * @param {number} y Vertical location of centre (0-100).
 * @param {number} radius Radius of circle.
 */
function circle(x, y, radius) {
  y = 100 - y;
  x *= SCALE;
  y *= SCALE;
  radius = Math.max(radius * SCALE, 0);
  ctxScratch.beginPath();
  ctxScratch.arc(x, y, radius, 0, 2 * Math.PI, false);
  ctxScratch.fill();
}

/**
 * Draw a rectangle.
 * @param {number} x Horizontal location of centre (0-100).
 * @param {number} y Vertical location of centre (0-100).
 * @param {number} width Width of rectangle.
 * @param {number} height Height of rectangle.
 */
function rect(x, y, width, height) {
  y = 100 - y;
  x *= SCALE;
  y *= SCALE;
  width = Math.max(width * SCALE, 0);
  height = Math.max(height * SCALE, 0);
  ctxScratch.beginPath();
  ctxScratch.rect(x - width / 2, y - height / 2, width, height);
  ctxScratch.fill();
}

/**
 * Draw a rectangle.
 * @param {number} x1 Horizontal location of start (0-100).
 * @param {number} y1 Vertical location of start (0-100).
 * @param {number} x2 Horizontal location of end (0-100).
 * @param {number} y2 Vertical location of end (0-100).
 * @param {number} width Width of line.
 */
function line(x1, y1, x2, y2, width) {
  y1 = 100 - y1;
  y2 = 100 - y2;
  x1 *= SCALE;
  y1 *= SCALE;
  x2 *= SCALE;
  y2 *= SCALE;
  width *= SCALE;
  ctxScratch.beginPath();
  ctxScratch.moveTo(x1, y1);
  ctxScratch.lineTo(x2, y2);
  ctxScratch.lineWidth = Math.max(width, 0);
  ctxScratch.stroke();
}

/**
 * Change the colour of the pen.
 * @param {string} colour CSS colour string.
 */
function penColour(colour) {
  ctxScratch.strokeStyle = colour;
  ctxScratch.fillStyle = colour;
}

/**
 * Verify if the answer to this frame is correct.
 */
function checkFrameAnswer() {
  // Compare the Alpha (opacity) byte of each pixel in the user's image and
  // the sample answer image.
  const answer = BlocklyGames.getElementById('answer' + frameNumber);
  if (!answer) {
    return;
  }
  const ctxAnswer = answer.getContext('2d');
  const answerImage = ctxAnswer.getImageData(0, 0, WIDTH, HEIGHT);
  const userImage =
      ctxScratch.getImageData(0, 0, WIDTH, HEIGHT);
  const len = Math.min(userImage.data.length, answerImage.data.length);
  let delta = 0;
  // Pixels are in RGBA format.  Only check the Alpha bytes.
  for (let i = 3; i < len; i += 4) {
    // Check the Alpha byte.
    if (Math.abs(userImage.data[i] - answerImage.data[i]) > 96) {
      delta++;
    }
  }
  pixelErrors[frameNumber] = delta;
}

/**
 * Verify if all the answers are correct.
 * If so, move on to next level.
 */
function checkAnswers() {
  if (BlocklyGames.LEVEL > 1 && frameNumber !== FRAMES) {
    // Only check answers at the end of the run.
    return;
  }
  if (isCorrect() && !success) {
    success = true;
    BlocklyInterface.saveToLocalStorage();
    if (BlocklyGames.LEVEL < BlocklyGames.MAX_LEVEL) {
      // No congrats for last level, it is open ended.
      BlocklyInterface.workspace.getAudioManager().play('win', 0.5);
      BlocklyCode.congratulations();
    }
  }
}

/**
 * Send an image of the canvas to gallery.
 */
function submitToGallery() {
  const blockCount = BlocklyInterface.workspace.getAllBlocks(false).length;
  const code = BlocklyCode.getJsCode();
  if (blockCount < 4 || !code.includes('time()')) {
    alert(BlocklyGames.getMsg('submitDisabled', false));
    return;
  }
  // Draw and copy the user layer.
  const interpreter = new Interpreter(code, initInterpreter);
  const backupFrameNumber = frameNumber;
  try {
    frameNumber = Math.round(FRAMES / 2);
    drawFrame_(interpreter);
  } finally {
    frameNumber = backupFrameNumber;
  }
  // Encode the thumbnail.
  const thumbnail = BlocklyGames.getElementById('thumbnail');
  const ctxThumb = thumbnail.getContext('2d');
  ctxThumb.globalCompositeOperation = 'copy';
  ctxThumb.drawImage(ctxScratch.canvas, 0, 0, 200, 200);
  const thumbData = thumbnail.toDataURL('image/png');
  BlocklyGames.getElementById('galleryThumb').value = thumbData;

  // Show the dialog.
  BlocklyGallery.showGalleryForm();
}

/**
 * Sample solutions for each level.
 * To create an answer, just solve the level in Blockly, then paste the
 * resulting JavaScript here, moving any functions to the beginning of
 * this function.
 * @param {number} f Frame number (0-100).
 */
function answer(f) {
  function time() {
    return f;
  }
  switch (BlocklyGames.LEVEL) {
    case 1:
      // Static person.
      penColour('#ff0000');
      circle(50, 70, 10);
      penColour('#3333ff');
      rect(50, 40, 20, 40);
      penColour('#000000');
      line(40, 50, 20, 70, 5);
      line(60, 50, 80, 70, 5);
      break;
    case 2:
      // Right hand moving up.
      penColour('#ff0000');
      circle(50, 70, 10);
      penColour('#3333ff');
      rect(50, 40, 20, 40);
      penColour('#000000');
      line(40, 50, 20, 70, 5);
      line(60, 50, 80, time(), 5);
      break;
    case 3:
      // Left hand moving down.
      penColour('#ff0000');
      circle(50, 70, 10);
      penColour('#3333ff');
      rect(50, 40, 20, 40);
      penColour('#000000');
      line(40, 50, 20, 100 - time(), 5);
      line(60, 50, 80, time(), 5);
      break;
    case 4:
      // Legs cross.
      penColour('#ff0000');
      circle(50, 70, 10);
      penColour('#3333ff');
      rect(50, 40, 20, 40);
      penColour('#000000');
      line(40, 50, 20, 100 - time(), 5);
      line(60, 50, 80, time(), 5);
      line(40, 20, time(), 0, 5);
      line(60, 20, 100 - time(), 0, 5);
      break;
    case 5:
      // Right arm parabola.
      penColour('#ff0000');
      circle(50, 70, 10);
      penColour('#3333ff');
      rect(50, 40, 20, 40);
      penColour('#000000');
      line(40, 50, 20, 100 - time(), 5);
      line(60, 50, 80, Math.pow((time() - 50) / 5, 2), 5);
      line(40, 20, time(), 0, 5);
      line(60, 20, 100 - time(), 0, 5);
      break;
    case 6:
      // Hands.
      penColour('#ff0000');
      circle(50, 70, 10);
      penColour('#3333ff');
      rect(50, 40, 20, 40);
      penColour('#000000');
      line(40, 50, 20, 100 - time(), 5);
      line(60, 50, 80, Math.pow((time() - 50) / 5, 2), 5);
      line(40, 20, time(), 0, 5);
      line(60, 20, 100 - time(), 0, 5);
      penColour('#ff0000');
      circle(20, 100 - time(), 5);
      circle(80, Math.pow((time() - 50) / 5, 2), 5);
      break;
    case 7:
      // Head.
      penColour('#ff0000');
      if (time() < 50) {
        circle(50, 70, 10);
      } else {
        circle(50, 80, 20);
      }
      penColour('#3333ff');
      rect(50, 40, 20, 40);
      penColour('#000000');
      line(40, 50, 20, 100 - time(), 5);
      line(60, 50, 80, Math.pow((time() - 50) / 5, 2), 5);
      line(40, 20, time(), 0, 5);
      line(60, 20, 100 - time(), 0, 5);
      penColour('#ff0000');
      circle(20, 100 - time(), 5);
      circle(80, Math.pow((time() - 50) / 5, 2), 5);
      break;
    case 8:
      // Legs reverse.
      penColour('#ff0000');
      if (time() < 50) {
        circle(50, 70, 10);
      } else {
        circle(50, 80, 20);
      }
      penColour('#3333ff');
      rect(50, 40, 20, 40);
      penColour('#000000');
      line(40, 50, 20, 100 - time(), 5);
      line(60, 50, 80, Math.pow((time() - 50) / 5, 2), 5);
      if (time() < 50) {
        line(40, 20, time(), 0, 5);
        line(60, 20, 100 - time(), 0, 5);
      } else {
        line(40, 20, 100 - time(), 0, 5);
        line(60, 20, time(), 0, 5);
      }
      penColour('#ff0000');
      circle(20, 100 - time(), 5);
      circle(80, Math.pow((time() - 50) / 5, 2), 5);
      break;
    case 9:
      // Background.
      penColour('#00ff00');
      circle(50, time() / 2, time() / 2);
      penColour('#ff0000');
      if (time() < 50) {
        circle(50, 70, 10);
      } else {
        circle(50, 80, 20);
      }
      penColour('#3333ff');
      rect(50, 40, 20, 40);
      penColour('#000000');
      line(40, 50, 20, 100 - time(), 5);
      line(60, 50, 80, Math.pow((time() - 50) / 5, 2), 5);
      if (time() < 50) {
        line(40, 20, time(), 0, 5);
        line(60, 20, 100 - time(), 0, 5);
      } else {
        line(40, 20, 100 - time(), 0, 5);
        line(60, 20, time(), 0, 5);
      }
      penColour('#ff0000');
      circle(20, 100 - time(), 5);
      circle(80, Math.pow((time() - 50) / 5, 2), 5);
      break;
  }
}

/**
 * Validate whether the user's answer is correct.
 * @returns {boolean} True if the level is solved, false otherwise.
 */
function isCorrect() {
  if (BlocklyGames.LEVEL === BlocklyGames.MAX_LEVEL) {
    // Any non-null answer is correct.
    return BlocklyInterface.workspace.getAllBlocks(false).length > 1;
  }
  // Check the already recorded pixel errors on every frame.
  for (let f = 0; f <= FRAMES; f++) {
    if (f === 50) {
      // Don't check the middle frame.  Makes pesky off-by-one errors go away.
      // E.g. if (time < 50) vs if (time <= 50)
      continue;
    } else if (pixelErrors[f] === undefined) {
      // Not rendered yet.
      return false;
    } else if (pixelErrors[f] > 100) {
      // Too many errors.
      console.log('Pixel errors (frame ' + f + '): ' + pixelErrors[f]);
      return false;
    }
  }
  if (BlocklyGames.LEVEL === 9) {
    // Ensure that the background is behind the figure, not in front.
    const blocks = BlocklyInterface.workspace.getAllBlocks(true);
    for (const block of blocks) {
      if (block.type === 'movie_circle') {
        // Check that the radius on the first circle block is connected to a
        // division block.
        if (block.getInputTargetBlock('RADIUS').type !== 'math_arithmetic') {
          const content = BlocklyGames.getElementById('helpLayer');
          const style = {
            'width': '30%',
            'left': '35%',
            'top': '12em',
          };
          BlocklyDialogs.showDialog(content, null, false, true, style,
              BlocklyDialogs.stopDialogKeyDown);
          BlocklyDialogs.startDialogKeyDown();
          return false;
        }
        break;
      }
    }
  }
  return true;
}

BlocklyGames.callWhenLoaded(init);
