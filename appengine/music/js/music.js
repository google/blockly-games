/**
 * @license
 * Blockly Games: Music
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview JavaScript for Blockly's Music application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Music');

goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('Music.Blocks');
goog.require('Music.soy');
goog.require('Slider');
goog.require('goog.array');
goog.require('goog.dom');


BlocklyGames.NAME = 'music';

Music.HEIGHT = 400;
Music.WIDTH = 400;

/**
 * PID of animation task currently executing.
 * @type number
 */
Music.pid = 0;

/**
 * Number of start blocks on the page (and thus the number of threads).
 */
Music.startCount = 0;

/**
 * Number of staves in the visualization.
 */
Music.staveCount = 0;

/**
 * Number of bars in the visualization.
 */
Music.barCount = 0;

/**
 * JavaScript interpreter for executing program.
 * @type Interpreter
 */
Music.interpreter = null;

/**
 * All executing threads.
 * @type !Array.<!Music.Thread>
 */
Music.threads = [];

/**
 * Time of start of execution.
 * @type {number}
 */
Music.startTime = 0;

/**
 * Number of 1/64ths notes since the start.
 * @type {number}
 */
Music.clock64ths = 0;

/**
 * Currently executing thread.
 * @type Music.Thread
 */
Music.activeThread = null;

/**
 * Is the composition ready to be submitted to Reddit?
 * @type boolean
 */
Music.canSubmit = false;

Music.NOTES = {
  '48': 'C3',
  '50': 'D3',
  '52': 'E3',
  '53': 'F3',
  '55': 'G3',
  '57': 'A3',
  '59': 'B3',
  '60': 'C4',
  '62': 'D4',
  '64': 'E4',
  '65': 'F4',
  '67': 'G4',
  '69': 'A4'
};

/**
 * Initialize Blockly and the music.  Called on page load.
 */
Music.init = function() {
  // Render the Soy template.
  document.body.innerHTML = Music.soy.start({}, null,
      {lang: BlocklyGames.LANG,
       level: BlocklyGames.LEVEL,
       maxLevel: BlocklyGames.MAX_LEVEL,
       html: BlocklyGames.IS_HTML});

  BlocklyInterface.init();

  var rtl = BlocklyGames.isRtl();
  var blocklyDiv = document.getElementById('blockly');
  var paddingBox = document.getElementById('paddingBox');
  var staveBox = document.getElementById('staveBox');
  var musicBox = document.getElementById('musicBox');
  var onresize = function(e) {
    var top = paddingBox.offsetTop;
    staveBox.style.top = top + 'px';
    musicBox.style.top = top + 'px';
    blocklyDiv.style.top = Math.max(10, top - window.pageYOffset) + 'px';
    blocklyDiv.style.left = rtl ? '10px' : '420px';
    blocklyDiv.style.width = (window.innerWidth - 440) + 'px';
  };
  window.addEventListener('scroll', function() {
      onresize(null);
      Blockly.svgResize(BlocklyGames.workspace);
    });
  window.addEventListener('resize', onresize);
  onresize(null);
  // Scale the workspace so level 1 = 1.0, and level 10 = 0.7.
  var scale = 1.03333 - 0.0333333 * BlocklyGames.LEVEL;
  var toolbox = document.getElementById('toolbox');
  BlocklyGames.workspace = Blockly.inject('blockly',
      {'disable': false,
       'media': 'third-party/blockly/media/',
       'rtl': rtl,
       'toolbox': toolbox,
       'zoom': {
          'maxScale': 2,
          'controls': true,
          'wheel': true,
          'startScale': scale}});
  BlocklyGames.workspace.addChangeListener(Blockly.Events.disableOrphans);
  BlocklyGames.workspace.addChangeListener(Music.disableExtraStarts);
  // Prevent collisions with user-defined functions or variables.
  Blockly.JavaScript.addReservedWords('play,rest,setInstrument,' +
      'start0,start1,start2,start3,start4,start5,start6,start7,start8,start9');
  // Only start1-4 are used, but no harm in being safe.

  if (document.getElementById('submitButton')) {
    BlocklyGames.bindClick('submitButton', Music.submitToReddit);
  }

  // Initialize the slider.
  var sliderSvg = document.getElementById('slider');
  Music.speedSlider = new Slider(10, 35, 130, sliderSvg, Music.sliderChange);

  var defaultXml =
      '<xml>' +
      '  <block type="music_start" deletable="' +
          (BlocklyGames.LEVEL > 6) + '" x="10" y="10"></block>' +
      '</xml>';
  BlocklyInterface.loadBlocks(defaultXml,
      BlocklyGames.LEVEL != BlocklyGames.MAX_LEVEL || Music.transform10);
  // After level 6 the user can create new start blocks.
  // Ensure that start blocks inherited from previous levels are deletable.
  if (BlocklyGames.LEVEL > 6) {
    var blocks = BlocklyGames.workspace.getTopBlocks(false);
    for(var i = 0, block; (block = blocks[i]); i++) {
      block.setDeletable(true);
    }
  }

  Music.initExpectedAnswer();
  Music.reset();

  BlocklyGames.bindClick('runButton', Music.runButtonClick);
  BlocklyGames.bindClick('resetButton', Music.resetButtonClick);

  // Lazy-load the JavaScript interpreter.
  setTimeout(BlocklyInterface.importInterpreter, 1);
  // Lazy-load the syntax-highlighting.
  setTimeout(BlocklyInterface.importPrettify, 1);

  BlocklyGames.bindClick('helpButton', Music.showHelp);
  if (location.hash.length < 2 &&
      !BlocklyGames.loadFromLocalStorage(BlocklyGames.NAME,
                                         BlocklyGames.LEVEL)) {
    setTimeout(Music.showHelp, 1000);
    if (BlocklyGames.LEVEL == 9) {
      setTimeout(BlocklyDialogs.abortOffer, 5 * 60 * 1000);
    }
  }

  var assetsPath = 'third-party/midi-js-soundfonts/';
  var instruments = ['piano', 'trumpet', 'violin', 'drum',
                     'flute', 'banjo', 'guitar', 'choir'];
  var sounds = [];
  for (var i = 0; i < instruments.length; i++) {
    for (var midi in Music.NOTES) {
      sounds.push({'src': instruments[i] + '/' + Music.NOTES[midi] + '.mp3',
                   id: instruments[i] + midi});
    }
  }
  createjs.Sound.registerSounds(sounds, assetsPath);
};

window.addEventListener('load', Music.init);

/**
 * The speed slider has changed.  Erase the start time to force re-computation.
 */
Music.sliderChange = function() {
  Music.startTime = 0;
};

/**
 * Draw and position the specified number of stave bars.
 * @param {number} n Number of stave bars.
 */
Music.drawStave = function(n) {
  Music.staveCount = n;
  var staveBox = document.getElementById('staveBox');
  // <img src="music/stave.png" class="stave" style="top: 100px">
  for (var i = 1; i <= n; i++) {
    var top = Music.staveTop_(i, n);
    var img = document.createElement('img');
    img.src = 'music/stave.png';
    img.className = 'stave';
    img.style.top = Math.round(top) + 'px';
    staveBox.appendChild(img);
  }
};

/**
 * Return the height of a stave bar.
 * @param {number} i Which stave bar to compute (base 1).
 * @param {number} n Number of stave bars.
 * @return {number} Top edge of stave bar.
 * @private
 */
Music.staveTop_ = function(i, n) {
  var staveHeight = 69;
  var boxHeight = 400 - 15;  // Subtract the scrollbar.
  var top = (2 * i - 1) / (2 * n) * boxHeight;
  top -= staveHeight / 2;  // Center the stave on the desired spot.
  top += 5;  // Notes stick up a bit.
  return top;
};

/**
 * Draw and position the specified note or rest.
 * @param {number} i Which stave bar to draw on (base 1).
 * @param {number} time Distance down the stave (on the scale of whole notes).
 * @param {string} pitch MIDI value of note (48 - 69), or rest (0).
 * @param {number} duration Duration of note or rest (1, 0.5, 0.25...).
 * @param {string} className Name of CSS class for image.
 */
Music.drawNote = function(i, time, pitch, duration, className) {
  while (duration > 1) {
    Music.drawNote(i, time, pitch, 1, className);
    time += 1;
    duration -= 1;
  }
  var noteIndex = ['48', '50', '52', '53', '55', '57', '59', '60', '62', '64',
                   '65', '67', '69'].indexOf(pitch);
  var top = Music.staveTop_(i, Music.staveCount);
  if (noteIndex == -1) {
    top += 21;
    top = Math.round(top);
  } else {
    top += noteIndex * -4.5 + 32;
    top = Math.floor(top);  // I have no idea why floor is better than round.
  }

  var LEFT_PADDING = 10;
  var WHOLE_WIDTH = 256;
  var left = Math.round(time * WHOLE_WIDTH + LEFT_PADDING);
  var musicContainer = document.getElementById('musicContainer');
  var img = document.createElement('img');
  var name = (noteIndex == -1 ? 'rest' : 'note');
  img.src = 'music/' + name + duration + '.png';
  img.className = className + ' ' + name;
  img.style.top = top + 'px';
  img.style.left = left + 'px';
  if (noteIndex != -1) {
    img.title = Music.NOTES[pitch];
  }
  musicContainer.appendChild(img);
  if (!className) {
    var splash = document.createElement('img');
    splash.src = 'music/' + name + duration + '.png';
    splash.className = name;
    splash.style.top = top + 'px';
    splash.style.left = left + 'px';
    musicContainer.appendChild(splash);
    // Wait 0ms to trigger the CSS Transition.
    setTimeout(function() {splash.className = 'splash-' + name + ' ' + name;},
               0);
    // Garbage collect the now-invisible note.
    setTimeout(function() {musicContainer.removeChild(splash);}, 1000);
  }
  if (pitch == '48' || pitch == '69') {
    var line = document.createElement('img');
    line.src = 'music/black1x1.gif';
    line.className = className + ' ledgerLine';
    line.style.top = (top + 32) + 'px';
    line.style.left = (left - 5) + 'px';
    musicContainer.appendChild(line);
  }
};

/**
 * Show the help pop-up.
 */
Music.showHelp = function() {
  var help = document.getElementById('help');
  var button = document.getElementById('helpButton');
  var style = {
    width: '50%',
    left: '25%',
    top: '5em'
  };

  if (BlocklyGames.LEVEL == 2) {
    var xml = '<xml><block type="procedures_defnoreturn" x="5" y="10"><field name="NAME">do something</field>' +
        '</block><block type="procedures_callnoreturn" x="5" y="85"><mutation name="do something"></mutation></block></xml>';
    BlocklyInterface.injectReadonly('sampleHelp2', xml);
  } else if (BlocklyGames.LEVEL == 6) {
    var xml = '<xml><block type="music_instrument" x="5" y="10"></block></xml>';
    BlocklyInterface.injectReadonly('sampleHelp6', xml);
  } else if (BlocklyGames.LEVEL == 7) {
    var xml = '<xml><block type="music_rest_whole" x="5" y="10"></block></xml>';
    BlocklyInterface.injectReadonly('sampleHelp7', xml);
  }

  BlocklyDialogs.showDialog(help, button, true, true, style, Music.hideHelp);
  BlocklyDialogs.startDialogKeyDown();
};

/**
 * Hide the help pop-up.
 */
Music.hideHelp = function() {
  BlocklyDialogs.stopDialogKeyDown();
};

/**
 * Show the help pop-up to encourage clicking on the toolbox categories.
 */
Music.showCategoryHelp = function() {
  if (Music.categoryClicked_ || BlocklyDialogs.isDialogVisible_) {
    return;
  }
  var help = document.getElementById('helpToolbox');
  var style = {
    width: '25%',
    left: '525px',
    top: '3.3em'
  };
  var origin = document.getElementById(':0');  // Toolbox's tree root.
  BlocklyDialogs.showDialog(help, origin, true, false, style, null);
};

/**
 * On startup draw the expected answer and save it to the answer canvas.
 */
Music.drawAnswer = function() {
  // Clear all content.
  goog.dom.removeChildren(document.getElementById('staveBox'));
  var musicContainer = document.getElementById('musicContainer');
  goog.dom.removeChildren(musicContainer);
  Music.barCount = 0;
  // Add spacer to allow scrollbar to scroll past last note/rest.
  // <img src="third-party/blockly/media/1x1.gif">
  var img = document.createElement('img');
  img.id = 'musicContainerWidth';
  img.src = 'third-party/blockly/media/1x1.gif';
  musicContainer.appendChild(img);

  if (!Music.expectedAnswer) {
    // Level 10 has no expected answer.
    Music.drawStave(Music.startCount || 1);
  } else {
    Music.drawStave(Music.expectedAnswer.length);
    for (var i = 0; i < Music.expectedAnswer.length; i++) {
      var chanel = Music.expectedAnswer[i];
      var time = 0;
      for (var j = 0; j < chanel.length; j += 2) {
        var pitch = String(chanel[j]);
        var duration = chanel[j + 1];
        Music.drawNote(i + 1, time, pitch, duration, 'goal');
        time += duration;
      }
    }
    Music.autoScroll();
  }
};

/**
 * Ensure that there aren't more than the maximum allowed start blocks.
 * @param {!Blockly.Events.Abstract} e Change event.
 */
Music.disableExtraStarts = function(e) {
  var toolbox = document.getElementById('toolbox');
  var toolboxStart = document.getElementById('music_start');
  if (!toolboxStart) {
    return;
  }
  var maxStarts = Music.expectedAnswer ? Music.expectedAnswer.length : 4;
  var oldStartCount = Music.startCount;

  if (e instanceof Blockly.Events.Create) {
    var startBlocks = [];
    var blocks = BlocklyGames.workspace.getTopBlocks(false);
    for (var i = 0, block; (block = blocks[i]); i++) {
      if (block.type == 'music_start') {
        startBlocks.push(block);
      }
    }
    if (maxStarts < startBlocks.length) {
      // Too many start blocks.  Disable any new ones.
      for (var i = 0, id; (id = e.ids[i]); i++) {
        for (var j = 0, startBlock; (startBlock = startBlocks[j]); j++) {
          if (startBlock.id == id) {
            startBlock.setDisabled(true);
          }
        }
      }
    }
    if (maxStarts <= startBlocks.length) {
      // Disable start block in toolbox.
      toolboxStart.setAttribute('disabled', 'true');
      BlocklyGames.workspace.updateToolbox(toolbox);
      Music.startCount = maxStarts;
    } else {
      Music.startCount = startBlocks.length;
    }
  } else if (e instanceof Blockly.Events.Delete) {
    var startBlocksEnabled = [];
    var startBlocksDisabled = [];
    var blocks = BlocklyGames.workspace.getTopBlocks(true);
    for (var i = 0, block; (block = blocks[i]); i++) {
      if (block.type == 'music_start') {
        (block.disabled ? startBlocksDisabled : startBlocksEnabled).push(block);
      }
    }
    while (maxStarts > startBlocksEnabled.length &&
           startBlocksDisabled.length) {
      // Enable a disabled start block.
      var block = startBlocksDisabled.shift();
      block.setDisabled(false);
      startBlocksEnabled.push(block);
    }
    if (maxStarts > startBlocksEnabled.length) {
      // Enable start block in toolbox.
      toolboxStart.setAttribute('disabled', 'false');
      BlocklyGames.workspace.updateToolbox(toolbox);
    }
    Music.startCount = startBlocksEnabled.length;
  }
  if (Music.startCount != oldStartCount) {
    Music.resetButtonClick();
  }
};

/**
 * Reset the music to the start position, clear the display, and kill any
 * pending tasks.
 */
Music.reset = function() {
  // Kill any task.
  clearTimeout(Music.pid);
  for (var i = 0, thread; (thread = Music.threads[i]); i++) {
    Music.stopSound(thread);
  }
  Music.interpreter = null;
  Music.activeThread = null;
  Music.threads.length = 0;
  Music.clock64ths = 0;
  Music.startTime = 0;
  Music.canSubmit = false;

  Music.drawAnswer();
};

/**
 * Click the run button.  Start the program.
 * @param {!Event} e Mouse or touch event.
 */
Music.runButtonClick = function(e) {
  // Prevent double-clicks or double-taps.
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  var runButton = document.getElementById('runButton');
  var resetButton = document.getElementById('resetButton');
  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton.style.minWidth) {
    resetButton.style.minWidth = runButton.offsetWidth + 'px';
  }
  runButton.style.display = 'none';
  resetButton.style.display = 'inline';
  document.getElementById('spinner').style.visibility = 'visible';
  Music.execute();
};

/**
 * Click the reset button.  Reset the Music.
 * @param {!Event=} opt_e Mouse or touch event.
 */
Music.resetButtonClick = function(opt_e) {
  // Prevent double-clicks or double-taps.
  if (opt_e && BlocklyInterface.eventSpam(opt_e)) {
    return;
  }
  var runButton = document.getElementById('runButton');
  runButton.style.display = 'inline';
  document.getElementById('resetButton').style.display = 'none';
  document.getElementById('spinner').style.visibility = 'hidden';
  BlocklyGames.workspace.highlightBlock(null);
  Music.reset();
};

/**
 * Inject the Music API into a JavaScript interpreter.
 * @param {!Interpreter} interpreter The JS Interpreter.
 * @param {!Interpreter.Object} scope Global scope.
 */
Music.initInterpreter = function(interpreter, scope) {
  // API
  var wrapper;
  wrapper = function(duration, pitch, id) {
    Music.play(duration, pitch, id);
  };
  interpreter.setProperty(scope, 'play',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(duration, id) {
    Music.rest(duration, id);
  };
  interpreter.setProperty(scope, 'rest',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(instrument, id) {
    Music.setInstrument(instrument, id);
  };
  interpreter.setProperty(scope, 'setInstrument',
      interpreter.createNativeFunction(wrapper));
};

/**
 * Execute the user's code.  Heaven help us...
 */
Music.execute = function() {
  if (!('Interpreter' in window)) {
    // Interpreter lazy loads and hasn't arrived yet.  Try again later.
    setTimeout(Music.execute, 250);
    return;
  }
  Music.reset();
  Blockly.selected && Blockly.selected.unselect();
  // For safety, recompute startCount in the generator.
  Music.startCount = 0;
  // Create an interpreter whose global scope will be the cross-thread global.
  var code = Blockly.JavaScript.workspaceToCode(BlocklyGames.workspace);
  if (Music.startCount == 0) {  // Blank workspace.
    Music.resetButtonClick();
  }

  Music.interpreter = new Interpreter(code, Music.initInterpreter);
  for (var i = 1; i <= Music.startCount; i++) {
    var interpreter = new Interpreter('');
    // Replace this thread's global scope with the cross-thread global.
    interpreter.stateStack[0].scope = Music.interpreter.global;
    interpreter.appendCode('start' + i + '();\n');
    Music.threads.push(new Music.Thread(i, interpreter.stateStack));
  }
  setTimeout(Music.tick, 100);
};

/**
 * Execute a 1/64th tick of the program.
 */
Music.tick = function() {
  // Delay between start of each beat (1/64ths of a whole note).
  var scaleDuration = 1000 * (2.5 - 2 * Music.speedSlider.getValue()) / 64;
  if (!Music.startTime) {
    // Either the first tick, or first tick after slider was adjusted.
    Music.startTime = Date.now() - Music.clock64ths * scaleDuration;
  }
  var done = true;
  for (var i = 0, thread; (thread = Music.threads[i]); i++) {
    if (!thread.done) {
      done = false;
      if (thread.pauseUntil64ths <= Music.clock64ths) {
        Music.executeChunk_(thread);
      }
    }
  }

  if (done) {
    // Program complete.
    if (Music.checkAnswer()) {
      BlocklyInterface.saveToLocalStorage();
      if (BlocklyGames.LEVEL < BlocklyGames.MAX_LEVEL) {
        // No congrats for last level, it is open ended.
        BlocklyDialogs.congratulations();
      }
    }
    document.getElementById('spinner').style.visibility = 'hidden';
    BlocklyGames.workspace.highlightBlock(null);
    // Playback complete; allow the user to submit this music to Reddit.
    Music.canSubmit = true;
  } else {
    Music.autoScroll();
    Music.clock64ths++;
    var ms = (Music.startTime + Music.clock64ths * scaleDuration) - Date.now();
    Music.pid = setTimeout(Music.tick, ms);
  }
};

/**
 * Execute a bite-sized chunk of the user's code.
 * @param {!Music.Thread} thread Thread to execute.
 * @private
 */
Music.executeChunk_ = function(thread) {
  Music.activeThread = thread;
  Music.interpreter.stateStack = thread.stateStack;
  // Switch the interpreter to run the provided thread.
  Music.interpreter.stateStack = thread.stateStack;
  var go;
  do {
    try {
      go = Music.interpreter.step();
    } catch (e) {
      // User error, terminate in shame.
      alert(e);
      go = false;
    }
    if (thread.pauseUntil64ths > Music.clock64ths) {
      // The last executed command requested a pause.
      return;
    }
  } while (go);
  // Thread complete.  Wrap up.
  Music.stopSound(thread);
  if (thread.highlighedBlock) {
    BlocklyInterface.highlight(thread.highlighedBlock, false);
    thread.highlighedBlock = null;
  }
  thread.done = true;
};

/**
 * Stop the specified thread from playing the current sound.
 * @param {!Music.Thread} thread Thread object.
 */
Music.stopSound = function(thread) {
  var sound = thread.sound;
  if (sound) {
    // Firefox requires 100ms to start a note playing, so delaying the end
    // eliminates the staccato.  Adds a nice smoothness to Chrome.
    setTimeout(sound['stop'].bind(sound), 100);
    thread.sound = null;
  }
};

/**
 * Scroll the music display horizontally to the current time.
 */
Music.autoScroll = function() {
  var musicBox = document.getElementById('musicBox');
  var musicContainer = document.getElementById('musicContainer');
  var musicContainerWidth = document.getElementById('musicContainerWidth');

  // Ensure a half-screenfull of blank music to the right of last note.
  var LEFT_PADDING = 10;
  var WHOLE_WIDTH = 256;
  var RIGHT_PADDING = BlocklyGames.LEVEL < BlocklyGames.MAX_LEVEL ? 200 : 100;
  if (Music.clock64ths) {
    var newWidth = Math.round(Music.clock64ths / 64 * WHOLE_WIDTH +
                              LEFT_PADDING + RIGHT_PADDING);
  } else {
    var newWidth = musicBox.scrollWidth + RIGHT_PADDING;
  }
  musicContainerWidth.width = newWidth;
  // Draw a bar at one whole note intervals on all staves.
  while (Music.barCount < Math.floor(newWidth / WHOLE_WIDTH)) {
    Music.barCount++;
    for (var j = 1; j <= Music.staveCount; j++) {
      var top = Music.staveTop_(j, Music.staveCount);
      var img = document.createElement('img');
      img.src = 'music/black1x1.gif';
      img.className = 'barLine';
      img.style.top = (top + 18) + 'px';
      img.style.left = (Music.barCount * WHOLE_WIDTH + LEFT_PADDING - 5) + 'px';
      musicContainer.appendChild(img);
    }
  }

  var musicBoxMid = (400 - 36) / 2;  // There's a 36px margin for the clef.
  musicBox.scrollLeft = Music.clock64ths * (WHOLE_WIDTH / 64) - musicBoxMid;
};

/**
 * Highlight a block and pause.
 * @param {?string} id ID of block.
 */
Music.animate = function(id) {
  if (id) {
    if (Music.activeThread.highlighedBlock) {
      BlocklyInterface.highlight(Music.activeThread.highlighedBlock, false);
    }
    BlocklyInterface.highlight(id, true);
    Music.activeThread.highlighedBlock = id;
  }
};

/**
 * Play one note.
 * @param {number} duration Fraction of a whole note length to play.
 * @param {number} pitch MIDI note number to play.
 * @param {?string} id ID of block.
 */
Music.play = function(duration, pitch, id) {
  if (Music.activeThread.resting) {
    // Reorder this thread to the top of the resting threads.
    // Find the min resting thread stave.
    var minResting = Infinity;
    for (var i = 0, thread; (thread = Music.threads[i]); i++) {
      if (thread.resting && thread.stave < minResting) {
        minResting = thread.stave;
      }
    }
    // Swap this thread and the min-thread's staves.
    for (var i = 0, thread; (thread = Music.threads[i]); i++) {
      if (minResting == thread.stave) {
        var swapStave = Music.activeThread.stave;
        Music.activeThread.stave = minResting;
        thread.stave = swapStave;
        break;
      }
    }
    Music.activeThread.resting = false;
  }
  Music.stopSound(Music.activeThread);
  Music.activeThread.sound = createjs.Sound.play(Music.activeThread.instrument + pitch);
  Music.activeThread.pauseUntil64ths = duration * 64 + Music.clock64ths;
  // Make a record of this note.
  Music.activeThread.transcript.push(pitch);
  Music.activeThread.transcript.push(duration);
  Music.animate(id);
  Music.drawNote(Music.activeThread.stave, Music.clock64ths / 64, String(pitch),
                 duration, '');
};

/**
 * Wait one rest.
 * @param {number} duration Fraction of a whole note length to rest.
 * @param {?string} id ID of block.
 */
Music.rest = function(duration, id) {
  Music.stopSound(Music.activeThread);
  Music.activeThread.pauseUntil64ths = duration * 64 + Music.clock64ths;
  // Make a record of this rest.
  if (Music.activeThread.transcript.length > 1 &&
      Music.activeThread.transcript
          [Music.activeThread.transcript.length - 2] == 0) {
    // Concatenate this rest with previous one.
    Music.activeThread.transcript
        [Music.activeThread.transcript.length - 1] += duration;
  } else {
    Music.activeThread.transcript.push(0);
    Music.activeThread.transcript.push(duration);
  }
  Music.animate(id);
  Music.drawNote(Music.activeThread.stave, Music.clock64ths / 64, '0',
                 duration, '');
};

/**
 * Switch to a new instrument.
 * @param {string} instrument Name of new instrument.
 * @param {?string} id ID of block.
 */
Music.setInstrument = function(instrument, id) {
  Music.activeThread.instrument = instrument;
};

/**
 * Array containing all notes expected to be played for this level.
 * @type !Array.<!Array.<number>>|undefined
 */
Music.expectedAnswer = undefined;

/**
 * Compute the expected answer for this level.
 */
Music.initExpectedAnswer = function() {
  var levelNotes = [];
  function doubleReplica(a) {
    levelNotes = levelNotes.concat(a).concat(a);
    return levelNotes;
  }
  function singleReplica(a) {
    levelNotes = levelNotes.concat(a);
    return levelNotes;
  }
  Music.expectedAnswer = [
    // Level 0.
    undefined,
    // Level 1.
    [[60, 0.25, 62, 0.25, 64, 0.25, 60, 0.25]],
    // Level 2.
    [doubleReplica([60, 0.25, 62, 0.25, 64, 0.25, 60, 0.25])],
    // Level 3.
    [doubleReplica([64, 0.25, 65, 0.25, 67, 0.5])],
    // Level 4.
    [doubleReplica([67, 0.125, 69, 0.125, 67, 0.125, 65, 0.125, 64, 0.25, 60, 0.25])],
    // Level 5.
    [doubleReplica([60, 0.25, 55, 0.25, 60, 0.5])],
    // Level 6.
    [levelNotes],
    // Level 7.
    [levelNotes, [0,2].concat(levelNotes)],
    // Level 8.
    [
      singleReplica(levelNotes),
      [0,2].concat(levelNotes)
    ],
    // Level 9.
    [
      levelNotes,
      [0,2].concat(levelNotes),
      [0,4].concat(levelNotes),
      [0,6].concat(levelNotes)
    ],
    // Level 10.
    undefined,
  ][BlocklyGames.LEVEL];
};

/**
 * Verify if the answer is correct.
 * If so, move on to next level.
 */
Music.checkAnswer = function() {
  if (!Music.expectedAnswer) {
    // On level 10 everyone is a winner.
    return true;
  }
  if (Music.expectedAnswer.length != Music.threads.length) {
    console.log('Expected ' + Music.expectedAnswer.length + ' voices, found ' +
                Music.threads.length);
    return false;
  }
  for (var i = 0; i < Music.expectedAnswer.length; i++) {
    if (Music.threads[i].stave == i + 1) {
      if (!goog.array.equals(Music.expectedAnswer[i],
                             Music.threads[i].transcript)) {
        return false;
      }
      continue;
    }
  }
  if (BlocklyGames.LEVEL == 6) {
    // Also check for the existence of a "set instrument" block.
    var code = Blockly.JavaScript.workspaceToCode(BlocklyGames.workspace);
    if (code.indexOf('setInstrument') == -1 || code.indexOf('piano') != -1) {
      // Yes, you can cheat with a comment.  In this case I don't care.
      return false;
    }
  }
  var maxCount = [
    undefined,  // Level 0.
    undefined,  // Level 1.
    16,  // Level 2.
    23,  // Level 3.
    38,  // Level 4.
    47,  // Level 5.
    48,  // Level 6.
    55,  // Level 7.
    57,  // Level 8.
    75,  // Level 9.
    undefined  // Level 10.
  ][BlocklyGames.LEVEL];
  var blockCount = BlocklyGames.workspace.getAllBlocks().length;
  if (maxCount && (blockCount > maxCount)) {
    // Use a function, dummy.
    var content = document.getElementById('helpUseFunctions');
    var style = {
      'width': '30%',
      'left': '35%',
      'top': '12em'
    };
    BlocklyDialogs.showDialog(content, null, false, true, style,
        BlocklyDialogs.stopDialogKeyDown);
    BlocklyDialogs.startDialogKeyDown();
    return false;
  }
  return true;
};

/**
 * Transform a program written in level 9 blocks into one written in the more
 * advanced level 10 blocks.
 * @param {string} xml Level 9 blocks in XML as text.
 * @return {string} Level 10 blocks in XML as text.
 */
Music.transform10 = function(xml) {
  // The level 7/8/9 rest block is non-configurable whole-note duration.
  return xml.replace(/"music_rest_whole"/g, '"music_rest"');
};

/**
 * Send an image of the canvas to Reddit.
 */
Music.submitToReddit = function() {
  if (!Music.canSubmit && Music.startCount) {
    alert(BlocklyGames.getMsg('Music_submitDisabled'));
    return;
  }
  // Encode the thumbnail.
  var thumb = [
    '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'
  ][Music.startCount];
  document.getElementById('t2r_thumb').value = 'data:image/png;base64,' + thumb;

  // Encode the XML.
  var xml = Blockly.Xml.workspaceToDom(BlocklyGames.workspace);
  var xmlData = Blockly.Xml.domToText(xml);
  document.getElementById('t2r_xml').value = xmlData;

  // Submit the form.
  document.getElementById('t2r_form').submit();
};

/**
 * One execution thread.
 * @param {number} i Number of this thread (1-4).
 * @param {!Array.<!Interpreter.State>} stateStack JS Interpreter state stack.
 * @constructor
 */
Music.Thread = function(i, stateStack) {
  this.stave = i;  // 1-4
  this.stateStack = stateStack;
  this.transcript = [];
  this.instrument = 'piano';
  this.pauseUntil64ths = 0;
  this.highlighedBlock = null;
  // Currently playing sound object.
  this.sound = null;
  // Has not played a note yet.  Level 1-9 the threads need to reorder
  // as the first note is played.  Level 10 is by start block height.
  this.resting = BlocklyGames.LEVEL < BlocklyGames.MAX_LEVEL;
  this.done = false;
};
