/**
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

  var toolbox = document.getElementById('toolbox');
  BlocklyGames.workspace = Blockly.inject('blockly',
      {'media': 'third-party/blockly/media/',
       'rtl': rtl,
       'toolbox': toolbox,
       'zoom': {'controls': true, 'wheel': true}});
  BlocklyGames.workspace.addChangeListener(BlocklyInterface.disableOrphans);
  // Prevent collisions with user-defined functions or variables.
  Blockly.JavaScript.addReservedWords('play,rest,setInstrument');

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
    var blocks = BlocklyGames.workspace.getTopBlocks();
    for(var i = 0; i < blocks.length; i++) {
      blocks[i].setDeletable(true);
    }
  }

  Music.ctxDisplay = document.getElementById('display').getContext('2d');
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

if (window.location.pathname.match(/readonly.html$/)) {
  window.addEventListener('load', function() {
    BlocklyInterface.initReadonly(Music.soy.readonly());
  });
} else {
  window.addEventListener('load', Music.init);
}

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
  Music.reset();
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
  Music.pidList.length = 0;
  Music.startCount = 0;
  Music.userAnswer.length = 0;
};

/**
 * Copy the scratch canvas to the display canvas. Add a music marker.
 */
Music.display = function() {
  // Clear the display with black.
  Music.ctxDisplay.beginPath();
  Music.ctxDisplay.rect(0, 0,
      Music.ctxDisplay.canvas.width, Music.ctxDisplay.canvas.height);
  Music.ctxDisplay.fillStyle = '#000000';
  Music.ctxDisplay.fill();
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
  BlocklyGames.workspace.traceOn(true);
  Music.execute();
};

/**
 * Click the reset button.  Reset the Music.
 * @param {!Event} opt_e Mouse or touch event.
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
  BlocklyGames.workspace.traceOn(false);
  Music.reset();
};

/**
 * Inject the Music API into a JavaScript interpreter.
 * @param {!Object} scope Global scope.
 * @param {!Interpreter} interpreter The JS interpreter.
 */
Music.initInterpreter = function(interpreter, scope) {
  // API
  var wrapper;
  wrapper = function(duration, pitch, id) {
    Music.play(duration.valueOf(), pitch.valueOf(), id.toString(), interpreter);
  };
  interpreter.setProperty(scope, 'play',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(duration, id) {
    Music.rest(duration.valueOf(), id.toString(), interpreter);
  };
  interpreter.setProperty(scope, 'rest',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(instrument, id) {
    Music.setInstrument(instrument.toString(), id.toString(), interpreter);
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
  var code = Blockly.JavaScript.workspaceToCode(BlocklyGames.workspace);
  for (var i = 1; i <= Music.startCount; i++) {
    var interpreter = new Interpreter(code + 'start' + i + '();\n',
                                      Music.initInterpreter);
    interpreter.subStartBlock = [];
    interpreter.instrument = 'piano';
    interpreter.idealTime = Number(new Date());
    Music.pidList.push(setTimeout(
        goog.partial(Music.executeChunk_, interpreter), 100));
  }
  if (Music.startCount == 0) {
    Music.resetButtonClick();
  }
};

/**
 * Execute a bite-sized chunk of the user's code.
 * @param {!Interpreter} interpreter JavaScript interpreter for this thread.
 * @private
 */
Music.executeChunk_ = function(interpreter) {
  interpreter.pauseMs = 0;
  var go;
  do {
    try {
      go = interpreter.step();
    } catch (e) {
      // User error, terminate in shame.
      alert(e);
      go = false;
    }
    if (go && interpreter.pauseMs) {
      // The last executed command requested a pause.
      go = false;
      Music.pidList.push(setTimeout(goog.partial(Music.executeChunk_,
          interpreter), interpreter.pauseMs));

    }
  } while (go);
  // Wrap up if complete.
  if (!interpreter.pauseMs) {
    Music.userAnswer.push(interpreter.subStartBlock);

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
    BlocklyInterface.highlight(id);
  }
};

/**
 * Play one note.
 * @param {number} duration Fraction of a note length to play.
 * @param {number} pitch MIDI note number to play.
 * @param {?string} id ID of block.
 * @param {!Interpreter} interpreter JavaScript interpreter for this thread.
 */
Music.play = function(duration, pitch, id, interpreter) {
  var mySound = createjs.Sound.play(interpreter.instrument + pitch);
  var scaleDuration = duration * 1000 *
      (2.5 - 2 * Music.speedSlider.getValue());
  interpreter.pauseMs = scaleDuration -
      (Number(new Date()) - interpreter.idealTime);
  interpreter.idealTime += scaleDuration;
  setTimeout(function() {mySound.stop();}, interpreter.pauseMs);
  interpreter.subStartBlock.push(pitch);
  interpreter.subStartBlock.push(duration);
  Music.animate(id);
};

/**
 * Wait one rest.
 * @param {number} duration Fraction of a note length to rest.
 * @param {?string} id ID of block.
 * @param {!Interpreter} interpreter JavaScript interpreter for this thread.
 */
Music.rest = function(duration, id, interpreter) {
  var scaleDuration = duration * 1000 *
      (2.5 - 2 * Music.speedSlider.getValue());
  interpreter.pauseMs = scaleDuration -
      (Number(new Date()) - interpreter.idealTime);
  interpreter.idealTime += scaleDuration;
  if (interpreter.subStartBlock.length > 1 &&
      interpreter.subStartBlock[interpreter.subStartBlock.length - 2] == 0) {
    interpreter.subStartBlock[interpreter.subStartBlock.length - 1] ++;
  } else {
    interpreter.subStartBlock.push(0);
    interpreter.subStartBlock.push(duration);
  }
  Music.animate(id);
}

/**
 * Switch to a new instrument.
 * @param {string} instrument Name of new instrument.
 * @param {?string} id ID of block.
 * @param {!Interpreter} interpreter JavaScript interpreter for this thread.
 */
Music.setInstrument = function(instrument, id, interpreter) {
  interpreter.instrument = instrument;
};

/**
 * Verify if the answer is correct.
 * If so, move on to next level.
 */
Music.checkAnswer = function() {
  var levelNotes = [];
  function doubleReplica(a) {
    levelNotes = levelNotes.concat(a).concat(a);
    return levelNotes;
  }
  function singleReplica(a) {
    levelNotes = levelNotes.concat(a);
    return levelNotes;
  }
  /**
   * Array containing all notes expected to be played for this level.
   * @type !Array.<Array.<number>>
   */
  var expectedAnswer = [
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
  if (!expectedAnswer) {
    // On level 10 everyone is a winner.
    return true;
  }
  if (expectedAnswer.length != Music.userAnswer.length) {
    return false;
  }
  for (var i = 0; i < expectedAnswer.length; i++) {
    var isFound = false;
    for (var j = 0; j < Music.userAnswer.length; j++) {
      if (goog.array.equals(expectedAnswer[i], Music.userAnswer[j])) {
        isFound = true;
        break;
      }
    }
    if (!isFound) {
      return false;
    }
  }
  if (BlocklyGames.LEVEL == 6) {
    // Also check for the existance of a "set instrument" block.
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
