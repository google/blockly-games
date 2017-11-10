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


BlocklyGames.NAME = 'music';

Music.HEIGHT = 400;
Music.WIDTH = 400;

/**
 * PID of animation task currently executing.
 * @type !Array.<number>
 */
Music.pidList = [];

/**
 * Number of start blocks on the page (and thus the number of threads).
 */
Music.startCount = 0;

/**
 * JavaScript interpreter for executing program.
 * @type Interpreter
 */
Music.interpreter = null;

/**
 * Currently executing thread.
 * @type Music.Thread
 */
Music.activeThread = null;

/**
 * Array containing all notes played by user in current execution.
 * @type !Array.<Array.<number>>
 */
Music.userAnswer = [];

/**
 * Is the composition ready to be submitted to Reddit?
 * @type boolean
 */
Music.canSubmit = false;

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
  var staffBox = document.getElementById('staffBox');
  var musicBox = document.getElementById('musicBox');
  var onresize = function(e) {
    var top = staffBox.offsetTop;
    musicBox.style.top = (top + 1) + 'px';
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

  var toolbox = document.getElementById('toolbox');
  BlocklyGames.workspace = Blockly.inject('blockly',
      {'disable': false,
       'media': 'third-party/blockly/media/',
       'rtl': rtl,
       'toolbox': toolbox,
       'zoom': {'maxScale': 2, 'controls': true, 'wheel': true}});
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
  Music.speedSlider = new Slider(10, 35, 130, sliderSvg);

  var defaultXml =
      '<xml>' +
      '  <block type="music_start" deletable="' +
          (BlocklyGames.LEVEL > 6) + '" x="10" y="10"></block>' +
      '</xml>';
  BlocklyInterface.loadBlocks(defaultXml, true);
  // After level 6 the user can create new start blocks.
  // Ensure that start blocks inherited from previous levels are deletable.
  if (BlocklyGames.LEVEL > 6) {
    var blocks = BlocklyGames.workspace.getTopBlocks(false);
    for(var i = 0, block; block = blocks[i]; i++) {
      block.setDeletable(true);
    }
  }

  Music.initExpectedAnswer();
  Music.drawAnswer();
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
  var notes = {'55': 'G3', '57': 'A3', '59': 'B3', '60': 'C4', '62': 'D4',
               '64': 'E4', '65': 'F4', '67': 'G4', '69': 'A4'};
  var sounds = [];
  for (var i = 0; i < instruments.length; i++) {
    for (var midi in notes) {
      sounds.push({'src': instruments[i] + '/' + notes[midi] + '.mp3', id: instruments[i] + midi});
    }
  }
  createjs.Sound.registerSounds(sounds, assetsPath);
};

window.addEventListener('load', Music.init);

/**
 * Draw and position the specified number of staff bars.
 */
Music.drawStaff = function(n) {
  var staffHeight = 69;
  var boxHeight = 400;
  // <img src="music/staff.png" class="staff" style="top: 100px">
  var box = document.getElementById('staffBox');
  for (var i = 1; i <= n; i++) {
    // Compact formula (by Quynh).
    var top = i * (boxHeight - staffHeight * n) / (n + 1) ;
    // Verbose equivalent formula (by Neil).
    // Keeping it in case we need parts for note display.
    //var top = ((2 * i - 1) / (2 * n) * boxHeight) - (staffHeight * (i - 1));
    //top -= staffHeight / 2;  // Center the staff on the desired spot.
    var img = document.createElement('img');
    img.src = 'music/staff.png';
    img.className = 'staff';
    img.style.top = Math.round(top) + 'px';
    box.appendChild(img);
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
    var xml = '<xml><block type="procedures_defnoreturn" x="5" y="10"><field name="NAME">do something</field>'
  +'</block><block type="procedures_callnoreturn" x="5" y="85"><mutation name="do something"></mutation></block></xml>';
    BlocklyInterface.injectReadonly('sampleHelp2', xml);
  } else if (BlocklyGames.LEVEL == 6) {
    var xml = '<xml><block type="music_instrument" x="5" y="10"></block></xml>';
    BlocklyInterface.injectReadonly('sampleHelp6', xml);
  } else if (BlocklyGames.LEVEL == 7) {
    var xml = '<xml><block type="music_rest" x="5" y="10"></block></xml>';
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
  Music.drawStaff(Music.expectedAnswer ? Music.expectedAnswer.length : 4);
  Music.reset();
};

/**
 * Ensure that there aren't more than the maximum allowed start blocks.
 * @param {!Blockly.Events.Abstract} e Change event.
 */
Music.disableExtraStarts = function(e) {
  var toolbox = document.getElementById('toolbox');
  // Fragile: Assume start block is always in the first category ('Music')
  // and is always the last block in that category.
  var toolboxStart = toolbox.firstChild.lastChild;
  var maxStarts = Music.expectedAnswer ? Music.expectedAnswer.length : 4;

  if (e instanceof Blockly.Events.Create) {
    var startBlocks = [];
    var blocks = BlocklyGames.workspace.getTopBlocks(false);
    for (var i = 0, block; block = blocks[i]; i++) {
      if (block.type == 'music_start') {
        startBlocks.push(block);
      }
    }
    if (maxStarts < startBlocks.length) {
      // Too many start blocks.  Disable any new ones.
      for (var i = 0, id; id = e.ids[i]; i++) {
        for (var j = 0, startBlock; startBlock = startBlocks[j]; j++) {
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
    }
  } else if (e instanceof Blockly.Events.Delete) {
    var startBlocksEnabled = [];
    var startBlocksDisabled = [];
    var blocks = BlocklyGames.workspace.getTopBlocks(true);
    for (var i = 0, block; block = blocks[i]; i++) {
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
  }
};

/**
 * Reset the music to the start position, clear the display, and kill any
 * pending tasks.
 */
Music.reset = function() {
  Music.display();

  // Kill all tasks.
  for (var i = 0; i < Music.pidList.length; i++) {
    window.clearTimeout(Music.pidList[i]);
  }
  Music.interpreter = null;
  Music.activeThread = null;
  Music.pidList.length = 0;
  Music.startCount = 0;
  Music.userAnswer.length = 0;
};

/**
 * Copy the scratch canvas to the display canvas. Add a music marker.
 */
Music.display = function() {
  // TODO
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
  // Create an interpreter whose global scope will be the cross-thread global.
  var code = Blockly.JavaScript.workspaceToCode(BlocklyGames.workspace);
  Music.interpreter = new Interpreter(code, Music.initInterpreter);

  for (var i = 1; i <= Music.startCount; i++) {
    var interpreter = new Interpreter('');
    // Replace this thread's global scope with the cross-thread global.
    interpreter.stateStack[0].scope = Music.interpreter.global;
    interpreter.appendCode('start' + i + '();\n');
    var thread = new Music.Thread(i, interpreter.stateStack);
    Music.pidList.push(setTimeout(
        goog.partial(Music.executeChunk_, thread), 100));
  }
  if (Music.startCount == 0) {
    Music.resetButtonClick();
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
  thread.pauseMs = 0;
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
    if (go && thread.pauseMs) {
      // The last executed command requested a pause.
      go = false;
      Music.pidList.push(setTimeout(goog.partial(Music.executeChunk_, thread),
                                    thread.pauseMs));

    }
  } while (go);
  // Wrap up if complete.
  if (!thread.pauseMs) {
    if (thread.highlighedBlock) {
      BlocklyInterface.highlight(thread.highlighedBlock, false);
      thread.highlighedBlock = null;
    }
    Music.userAnswer.push(thread.subStartBlock);

    Music.startCount--;
    if (Music.startCount == 0) {
      if (Music.checkAnswer()) {
        BlocklyInterface.saveToLocalStorage();
        if (BlocklyGames.LEVEL < BlocklyGames.MAX_LEVEL) {
          // No congrats for last level, it is open ended.
          BlocklyDialogs.congratulations();
        }
      }
      Music.resetButtonClick();
      BlocklyGames.workspace.highlightBlock(null);
      // Playback complete; allow the user to submit this music to Reddit.
      Music.canSubmit = true;
    }
  }
};

/**
 * Highlight a block and pause.
 * @param {?string} id ID of block.
 */
Music.animate = function(id) {
  Music.display();
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
 * @param {number} duration Fraction of a note length to play.
 * @param {number} pitch MIDI note number to play.
 * @param {?string} id ID of block.
 */
Music.play = function(duration, pitch, id) {
  var mySound = createjs.Sound.play(Music.activeThread.instrument + pitch);
  var scaleDuration = duration * 1000 *
      (2.5 - 2 * Music.speedSlider.getValue());
  Music.activeThread.pauseMs = scaleDuration -
      (Number(new Date()) - Music.activeThread.idealTime);
  Music.activeThread.idealTime += scaleDuration;
  setTimeout(function() {mySound['stop']();}, Music.activeThread.pauseMs);
  Music.activeThread.subStartBlock.push(pitch);
  Music.activeThread.subStartBlock.push(duration);
  Music.animate(id);
};

/**
 * Wait one rest.
 * @param {number} duration Fraction of a note length to rest.
 * @param {?string} id ID of block.
 */
Music.rest = function(duration, id) {
  var scaleDuration = duration * 1000 *
      (2.5 - 2 * Music.speedSlider.getValue());
  Music.activeThread.pauseMs = scaleDuration -
      (Number(new Date()) - Music.activeThread.idealTime);
  Music.activeThread.idealTime += scaleDuration;
  if (Music.activeThread.subStartBlock.length > 1 &&
      Music.activeThread.subStartBlock
          [Music.activeThread.subStartBlock.length - 2] == 0) {
    Music.activeThread.subStartBlock
        [Music.activeThread.subStartBlock.length - 1]++;
  } else {
    Music.activeThread.subStartBlock.push(0);
    Music.activeThread.subStartBlock.push(duration);
  }
  Music.animate(id);
}

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
  if (Music.expectedAnswer.length != Music.userAnswer.length) {
    return false;
  }
  for (var i = 0; i < Music.expectedAnswer.length; i++) {
    var isFound = false;
    for (var j = 0; j < Music.userAnswer.length; j++) {
      if (goog.array.equals(Music.expectedAnswer[i], Music.userAnswer[j])) {
        isFound = true;
        break;
      }
    }
    if (!isFound) {
      return false;
    }
  }
  if (BlocklyGames.LEVEL == 6) {
    // Also check for the existence of a "set instrument" block.
    var code = Blockly.JavaScript.workspaceToCode(BlocklyGames.workspace);
    if (code.indexOf('setInstrument') == -1) {
      // Yes, you can cheat with a comment.  In this case I don't care.
      return false;
    }
  }
  return true;
};

/**
 * Send an image of the canvas to Reddit.
 */
Music.submitToReddit = function() {
  if (!Music.canSubmit) {
    alert(BlocklyGames.getMsg('Music_submitDisabled'));
    return;
  }
  // Encode the thumbnail.
  var thumbnail = document.getElementById('thumbnail');
  var ctxThumb = thumbnail.getContext('2d');
  ctxThumb.globalCompositeOperation = 'copy';
  ctxThumb.drawImage(Music.ctxDisplay.canvas, 0, 0, 100, 100);
  var thumbData = thumbnail.toDataURL('image/png');
  document.getElementById('t2r_thumb').value = thumbData;

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
 * @param {!Array} stateStack JS Interpreter state stack.
 * @constructor
 */
Music.Thread = function(i, stateStack) {
  this.i = i;
  this.stateStack = stateStack;
  this.subStartBlock = [];
  this.instrument = 'piano';
  this.idealTime = Number(new Date());
  this.pauseMs = 0;
  this.highlighedBlock = null;
};
