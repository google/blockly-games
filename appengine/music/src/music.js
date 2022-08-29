/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for Music game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Music');

goog.require('Blockly.Comment');
goog.require('Blockly.FlyoutButton');
goog.require('Blockly.Toolbox');
goog.require('Blockly.Trashcan');
goog.require('Blockly.utils.dom');
goog.require('Blockly.VerticalFlyout');
goog.require('Blockly.ZoomControls');
goog.require('BlocklyDialogs');
goog.require('BlocklyGallery');
goog.require('BlocklyGames');
goog.require('BlocklyGames.Msg');
goog.require('BlocklyInterface');
goog.require('CustomFields.FieldPitch');
goog.require('Music.Blocks');
goog.require('Music.html');
goog.require('Slider');


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
 * @type !Array<!Music.Thread>
 */
Music.threads = [];

/**
 * Time of start of execution.
 * @type number
 */
Music.startTime = 0;

/**
 * Number of 1/64ths notes since the start.
 * @type number
 */
Music.clock64ths = 0;

/**
 * Currently executing thread.
 * @type Music.Thread
 */
Music.activeThread = null;

/**
 * Is the composition ready to be submitted to gallery?
 * @type boolean
 */
Music.canSubmit = false;

/**
 * Constant denoting a rest.
 */
Music.REST = -1;

/**
 * Initialize Blockly and the music.  Called on page load.
 */
Music.init = function() {
  if (!Object.keys(BlocklyGames.Msg).length) {
    // Messages haven't arrived yet.  Try again later.
    setTimeout(Music.init, 99);
    return;
  }

  // Render the HTML.
  document.body.innerHTML = Music.html.start(
      {lang: BlocklyGames.LANG,
       level: BlocklyGames.LEVEL,
       maxLevel: BlocklyGames.MAX_LEVEL,
       html: BlocklyGames.IS_HTML});

  BlocklyInterface.init(BlocklyGames.Msg['Games.music']);

  const rtl = BlocklyGames.IS_RTL;
  const blocklyDiv = document.getElementById('blockly');
  const paddingBox = document.getElementById('paddingBox');
  const staveBox = document.getElementById('staveBox');
  const musicBox = document.getElementById('musicBox');
  const onresize = function(e) {
    const top = paddingBox.offsetTop;
    staveBox.style.top = top + 'px';
    musicBox.style.top = top + 'px';
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
  // Scale the workspace so level 1 = 1.0, and level 10 = 0.7.
  const scale = 1.03333 - 0.0333333 * BlocklyGames.LEVEL;
  BlocklyInterface.injectBlockly(
      {'disable': false,
       'rtl': rtl,
       'zoom': {
          'maxScale': 2,
          'controls': true,
          'wheel': true,
          'startScale': scale}});
  BlocklyInterface.workspace.addChangeListener(Blockly.Events.disableOrphans);
  BlocklyInterface.workspace.addChangeListener(Music.disableExtraStarts);
  BlocklyInterface.workspace.addChangeListener(Music.disableSubmit);
  // Prevent collisions with user-defined functions or variables.
  Blockly.JavaScript.addReservedWords('play,rest,setInstrument,' +
      'start0,start1,start2,start3,start4,start5,start6,start7,start8,start9');
  // Only start1-4 are used, but no harm in being safe.

  if (document.getElementById('submitButton')) {
    BlocklyGames.bindClick('submitButton', Music.submitToGallery);
  }

  // Initialize the slider.
  const sliderSvg = document.getElementById('slider');
  Music.speedSlider = new Slider(10, 35, 130, sliderSvg, Music.sliderChange);

  const defaultXml =
      '<xml>' +
        '<block type="music_start" deletable="' +
          (BlocklyGames.LEVEL > 6) + '" x="180" y="50"></block>' +
      '</xml>';
  BlocklyInterface.loadBlocks(defaultXml,
      BlocklyGames.LEVEL !== BlocklyGames.MAX_LEVEL || Music.transform10);
  // After level 6 the user can create new start blocks.
  // Ensure that start blocks inherited from previous levels are deletable.
  if (BlocklyGames.LEVEL > 6) {
    const blocks = BlocklyInterface.workspace.getTopBlocks(false);
    for(const block of blocks) {
      block.setDeletable(true);
    }
  }

  Music.initExpectedAnswer();
  Music.reset();

  BlocklyGames.bindClick('runButton', Music.runButtonClick);
  BlocklyGames.bindClick('resetButton', Music.resetButtonClick);

  // Lazy-load the JavaScript interpreter.
  BlocklyInterface.importInterpreter();
  // Lazy-load the syntax-highlighting.
  BlocklyInterface.importPrettify();
  // Lazy-load the sounds.
  setTimeout(Music.importSounds, 1);

  BlocklyGames.bindClick('helpButton', Music.showHelp);
  if (location.hash.length < 2 &&
      !BlocklyGames.loadFromLocalStorage(BlocklyGames.NAME,
                                         BlocklyGames.LEVEL)) {
    setTimeout(Music.showHelp, 1000);
  }
};

window.addEventListener('load', Music.init);

/**
 * Load the sounds.
 */
Music.importSounds = function() {
  //<script type="text/javascript"
  //  src="third-party/SoundJS/soundjs.min.js"></script>
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'third-party/SoundJS/soundjs.min.js';
  script.onload = Music.registerSounds;
  document.head.appendChild(script);
};

/**
 * Register the sounds.
 */
Music.registerSounds = function() {
  // The packaged version of _handlePreloadComplete occasionally throws errors:
  //   TypeError: Cannot read properties of null (reading '1')
  // A fix has been created, but isn't yet compiled into the package:
  //   https://github.com/CreateJS/SoundJS/issues/269
  // Monkey-patch the fix.
  createjs['AbstractPlugin'].prototype['_handlePreloadComplete'] = function(e) {
    const src = e.target.getItem().src;
    const result = e.result;
    const instances = this['_soundInstances'][src];
    this['_audioSources'][src] = result;

    if (instances && instances.length > 0) {
      for (const instance of instances) {
        instance['playbackResource'] = result;
      }
    }
    this['_soundInstances'][src] = null;
  };

  const assetsPath = 'third-party/soundfonts/';
  const instruments = ['piano', 'trumpet', 'violin', 'drum',
                       'flute', 'banjo', 'guitar', 'choir'];

  const sounds = [];
  for (let i = 0; i < instruments.length; i++) {
    for (let j = 0; j < CustomFields.FieldPitch.NOTES.length; j++) {
      sounds.push({'src': instruments[i] + '/' +
                       CustomFields.FieldPitch.NOTES[j] + '.mp3',
                   id: instruments[i] + j});
    }
  }
  createjs.Sound.registerSounds(sounds, assetsPath);
};

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
  const staveBox = document.getElementById('staveBox');
  // <img src="music/stave.png" class="stave" style="top: 100px">
  for (let i = 1; i <= n; i++) {
    const top = Music.staveTop_(i, n);
    const img = document.createElement('img');
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
 * @returns {number} Top edge of stave bar.
 * @private
 */
Music.staveTop_ = function(i, n) {
  const staveHeight = 69;
  const boxHeight = 400 - 15;  // Subtract the scrollbar.
  let top = (2 * i - 1) / (2 * n) * boxHeight;
  top -= staveHeight / 2;  // Center the stave on the desired spot.
  top += 5;  // Notes stick up a bit.
  return top;
};

/**
 * Draw and position the specified note or rest.
 * @param {number} i Which stave bar to draw on (base 1).
 * @param {number} time Distance down the stave (on the scale of whole notes).
 * @param {number} pitch Value of note (0-12), or rest (Music.REST).
 * @param {number} duration Duration of note or rest (1, 0.5, 0.25...).
 * @param {string} className Name of CSS class for image.
 */
Music.drawNote = function(i, time, pitch, duration, className) {
  while (duration > 1) {
    Music.drawNote(i, time, pitch, 1, className);
    time += 1;
    duration -= 1;
  }
  let top = Music.staveTop_(i, Music.staveCount);
  if (pitch === Music.REST) {
    top += 21;
    top = Math.round(top);
  } else {
    top += pitch * -4.5 + 32;
    top = Math.floor(top);  // I have no idea why floor is better than round.
  }

  const LEFT_PADDING = 10;
  const WHOLE_WIDTH = 256;
  const left = Math.round(time * WHOLE_WIDTH + LEFT_PADDING);
  const musicContainer = document.getElementById('musicContainer');
  const img = document.createElement('img');
  const name = (pitch === Music.REST ? 'rest' : 'note');
  img.src = 'music/' + name + duration + '.png';
  img.className = className + ' ' + name;
  img.style.top = top + 'px';
  img.style.left = left + 'px';
  if (pitch !== Music.REST) {
    img.title = CustomFields.FieldPitch.NOTES[pitch];
  }
  musicContainer.appendChild(img);
  if (!className) {
    // Add a splash effect when playing a note.
    const splash = img.cloneNode();
    musicContainer.appendChild(splash);
    // Wait 0 ms to trigger the CSS Transition.
    setTimeout(function() {splash.className = 'splash ' + name;}, 0);
    // Garbage collect the now-invisible note.
    setTimeout(function() {Blockly.utils.dom.removeNode(splash);}, 1000);
  }
  if (pitch === '0' || pitch === '12') {
    const line = document.createElement('img');
    line.src = 'music/black1x1.gif';
    line.className = className +
        (duration === 1 ? ' ledgerLineWide' : ' ledgerLine');
    line.style.top = (top + 32) + 'px';
    line.style.left = (left - 5) + 'px';
    musicContainer.appendChild(line);
  }
};

/**
 * Show the help pop-up.
 */
Music.showHelp = function() {
  const help = document.getElementById('help');
  const button = document.getElementById('helpButton');
  const style = {
    width: '50%',
    left: '25%',
    top: '5em',
  };

  if (BlocklyGames.LEVEL === 2) {
    let xml =
        '<xml>' +
          '<block type="procedures_defnoreturn" x="5" y="10">' +
            '<field name="NAME">%1</field>' +
          '</block>' +
          '<block type="procedures_callnoreturn" x="5" y="85">' +
            '<mutation name="%1"></mutation>' +
            '<next>' +
              '<block type="procedures_callnoreturn">' +
                '<mutation name="%1"></mutation>' +
              '</block>' +
            '</next>' +
          '</block>' +
        '</xml>';
    const firstPart = BlocklyGames.Msg['Music.firstPart'];
    xml = xml.replace(/%1/g, BlocklyGames.esc(firstPart));
    BlocklyInterface.injectReadonly('sampleHelp2', xml);
  } else if (BlocklyGames.LEVEL === 6) {
    const xml = '<xml><block type="music_instrument" x="5" y="10"></block></xml>';
    BlocklyInterface.injectReadonly('sampleHelp6', xml);
  } else if (BlocklyGames.LEVEL === 7) {
    const xml = '<xml><block type="music_rest_whole" x="5" y="10"></block></xml>';
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
  const help = document.getElementById('helpToolbox');
  const style = {
    width: '25%',
    left: '525px',
    top: '3.3em',
  };
  const origin = document.getElementById(':0');  // Toolbox's tree root.
  BlocklyDialogs.showDialog(help, origin, true, false, style, null);
};

/**
 * On startup draw the expected answer and save it to the answer canvas.
 */
Music.drawAnswer = function() {
  // Clear all content.
  document.getElementById('staveBox').innerHTML = '';
  const musicContainer = document.getElementById('musicContainer');
  musicContainer.innerHTML = '';
  Music.barCount = 0;
  // Add spacer to allow scrollbar to scroll past last note/rest.
  // <img id="musicContainerWidth" src="common/1x1.gif">
  const img = document.createElement('img');
  img.id = 'musicContainerWidth';
  img.src = 'common/1x1.gif';
  musicContainer.appendChild(img);

  if (!Music.expectedAnswer) {
    // Level 10 has no expected answer.
    Music.drawStave(Music.startCount || 1);
  } else {
    Music.drawStave(Music.expectedAnswer.length);
    for (let i = 0; i < Music.expectedAnswer.length; i++) {
      const chanel = Music.expectedAnswer[i];
      let time = 0;
      for (let j = 0; j < chanel.length; j += 2) {
        const pitch = chanel[j];
        const duration = chanel[j + 1];
        Music.drawNote(i + 1, time, pitch, duration, 'goal');
        time += duration;
      }
    }
    // Both Chrome and FF read musicBox.scrollWidth as too small on some levels
    // without a setTimeout here.  Unknown why.
    setTimeout(Music.autoScroll, 0);
  }
};

/**
 * Ensure that there aren't more than the maximum allowed start blocks.
 * @param {!Blockly.Events.Abstract} e Change event.
 */
Music.disableExtraStarts = function(e) {
  const toolbox = document.getElementById('toolbox');
  const toolboxStart = document.getElementById('music_start');
  if (!toolboxStart) {
    return;
  }
  const maxStarts = Music.expectedAnswer ? Music.expectedAnswer.length : 4;
  const oldStartCount = Music.startCount;

  if (e instanceof Blockly.Events.Create) {
    const startBlocks = [];
    const blocks = BlocklyInterface.workspace.getTopBlocks(false);
    for (const block of blocks) {
      if (block.type === 'music_start' && !block.isInsertionMarker()) {
        startBlocks.push(block);
      }
    }
    if (maxStarts < startBlocks.length) {
      // Too many start blocks.  Disable any new ones.
      for (const id of e.ids) {
        for (const startBlock of startBlocks) {
          if (startBlock.id === id) {
            startBlock.setEnabled(false);
          }
        }
      }
    }
    if (maxStarts <= startBlocks.length) {
      // Disable start block in toolbox.
      toolboxStart.setAttribute('disabled', 'true');
      BlocklyInterface.workspace.updateToolbox(toolbox);
      Music.startCount = maxStarts;
    } else {
      Music.startCount = startBlocks.length;
    }
  } else if (e instanceof Blockly.Events.Delete) {
    const startBlocksEnabled = [];
    const startBlocksDisabled = [];
    const blocks = BlocklyInterface.workspace.getTopBlocks(true);
    for (const block of blocks) {
      if (block.type === 'music_start') {
        (block.isEnabled() ? startBlocksEnabled : startBlocksDisabled)
            .push(block);
      }
    }
    while (maxStarts > startBlocksEnabled.length &&
           startBlocksDisabled.length) {
      // Enable a disabled start block.
      const block = startBlocksDisabled.shift();
      block.setEnabled(true);
      startBlocksEnabled.push(block);
    }
    if (maxStarts > startBlocksEnabled.length) {
      // Enable start block in toolbox.
      toolboxStart.setAttribute('disabled', 'false');
      BlocklyInterface.workspace.updateToolbox(toolbox);
    }
    Music.startCount = startBlocksEnabled.length;
  }
  if (Music.startCount !== oldStartCount) {
    Music.resetButtonClick();
  }
};

/**
 * Don't allow gallery submissions after a code change but before an execution.
 * @param {!Blockly.Events.Abstract} e Change event.
 */
Music.disableSubmit = function(e) {
  if (!e.isUiEvent) {
    Music.canSubmit = false;
  }
};

/**
 * Reset the music to the start position, clear the display, and kill any
 * pending tasks.
 */
Music.reset = function() {
  // Kill any task.
  clearTimeout(Music.pid);
  Music.threads.forEach(Music.stopSound);
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
  const runButton = document.getElementById('runButton');
  const resetButton = document.getElementById('resetButton');
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
  const runButton = document.getElementById('runButton');
  runButton.style.display = 'inline';
  document.getElementById('resetButton').style.display = 'none';
  document.getElementById('spinner').style.visibility = 'hidden';
  BlocklyInterface.workspace.highlightBlock(null);
  Music.reset();
};

/**
 * Inject the Music API into a JavaScript interpreter.
 * @param {!Interpreter} interpreter The JS-Interpreter.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Music.initInterpreter = function(interpreter, globalObject) {
  // API
  let wrapper;
  wrapper = function(duration, pitch, id) {
    Music.play(duration, pitch, id);
  };
  wrap('play');

  wrapper = function(duration, id) {
    Music.rest(duration, id);
  };
  wrap('rest');

  wrapper = function(instrument) {
    Music.setInstrument(instrument);
  };
  wrap('setInstrument');

  function wrap(name) {
    interpreter.setProperty(globalObject, name,
        interpreter.createNativeFunction(wrapper));
  }
};

/**
 * Execute the user's code.  Heaven help us...
 */
Music.execute = function() {
  if (!('Interpreter' in window)) {
    // Interpreter lazy loads and hasn't arrived yet.  Try again later.
    setTimeout(Music.execute, 99);
    return;
  }
  if (!('createjs' in window) || !createjs.Sound.isReady()) {
    // SoundJS lazy loads and hasn't arrived yet.  Try again later.
    setTimeout(Music.execute, 99);
    return;
  }
  Music.reset();
  Blockly.selected && Blockly.selected.unselect();
  // For safety, recompute startCount in the generator.
  Music.startCount = 0;
  // Create an interpreter whose global scope will be the cross-thread global.
  const code = BlocklyInterface.getJsCode();
  BlocklyInterface.executedJsCode = code;
  BlocklyInterface.executedCode = BlocklyInterface.getCode();
  if (Music.startCount === 0) {  // Blank workspace.
    Music.resetButtonClick();
  }

  Music.interpreter = new Interpreter(code, Music.initInterpreter);
  for (let i = 1; i <= Music.startCount; i++) {
    const interpreter = new Interpreter('');
    // Replace this thread's global scope with the cross-thread global.
    interpreter.stateStack[0].scope = Music.interpreter.globalScope;
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
  const scaleDuration = 1000 * (2.5 - 2 * Music.speedSlider.getValue()) / 64;
  if (!Music.startTime) {
    // Either the first tick, or first tick after slider was adjusted.
    Music.startTime = Date.now() - Music.clock64ths * scaleDuration;
  }
  let done = true;
  for (const thread of Music.threads) {
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
        Music.startCount = 0;
        BlocklyDialogs.congratulations();
      }
    }
    document.getElementById('spinner').style.visibility = 'hidden';
    BlocklyInterface.workspace.highlightBlock(null);
    // Playback complete; allow the user to submit this music to gallery.
    Music.canSubmit = true;
  } else {
    Music.autoScroll();
    Music.clock64ths++;
    const ms = (Music.startTime + Music.clock64ths * scaleDuration) - Date.now();
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
  let ticks = 10000;
  let go;
  do {
    try {
      go = Music.interpreter.step();
    } catch (e) {
      // User error, terminate in shame.
      alert(e);
      go = false;
    }
    if (ticks-- === 0) {
      console.warn('Thread ' + thread.stave + ' is running slowly.');
      return;
    }
    if (thread.pauseUntil64ths > Music.clock64ths) {
      // Previously executed command (play or rest) requested a pause.
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
  const sound = thread.sound;
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
  const musicBox = document.getElementById('musicBox');
  const musicContainer = document.getElementById('musicContainer');
  const musicContainerWidth = document.getElementById('musicContainerWidth');

  // Ensure a half-screenfull of blank music to the right of last note.
  const LEFT_PADDING = 10;
  const WHOLE_WIDTH = 256;
  const RIGHT_PADDING = BlocklyGames.LEVEL < BlocklyGames.MAX_LEVEL ? 200 : 100;
  let newWidth;
  if (Music.clock64ths) {
    newWidth = Math.round(Music.clock64ths / 64 * WHOLE_WIDTH +
                          LEFT_PADDING + RIGHT_PADDING);
  } else {
    newWidth = musicBox.scrollWidth + RIGHT_PADDING;
  }
  musicContainerWidth.width = newWidth;
  // Draw a bar at one whole note intervals on all staves.
  while (Music.barCount < Math.floor(newWidth / WHOLE_WIDTH)) {
    Music.barCount++;
    for (let j = 1; j <= Music.staveCount; j++) {
      const top = Music.staveTop_(j, Music.staveCount);
      const img = document.createElement('img');
      img.src = 'music/black1x1.gif';
      img.className = 'barLine';
      img.style.top = (top + 18) + 'px';
      img.style.left = (Music.barCount * WHOLE_WIDTH + LEFT_PADDING - 5) + 'px';
      musicContainer.appendChild(img);
    }
  }

  const musicBoxMid = (400 - 36) / 2;  // There's a 36px margin for the clef.
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
 * @param {number} pitch Note number to play (0-12).
 * @param {?string} id ID of block.
 */
Music.play = function(duration, pitch, id) {
  if (Music.activeThread.resting) {
    // Reorder this thread to the top of the resting threads.
    // Find the min resting thread stave.
    let minResting = Infinity;
    for (const thread of Music.threads) {
      if (thread.resting && thread.stave < minResting) {
        minResting = thread.stave;
      }
    }
    // Swap this thread and the min-thread's staves.
    for (const thread of Music.threads) {
      if (minResting === thread.stave) {
        const swapStave = Music.activeThread.stave;
        Music.activeThread.stave = minResting;
        thread.stave = swapStave;
        break;
      }
    }
    Music.activeThread.resting = false;
  }
  pitch = Math.round(pitch);
  if (pitch < 0 || pitch > 12) {
    console.warn('Note out of range (0-12): ' + pitch);
    Music.rest(duration, id);
    return;
  }
  Music.stopSound(Music.activeThread);
  Music.activeThread.sound = createjs.Sound.play(Music.activeThread.instrument + pitch);
  Music.activeThread.pauseUntil64ths = duration * 64 + Music.clock64ths;
  // Make a record of this note.
  Music.activeThread.transcript.push(pitch, duration);
  let wrong = false;
  if (BlocklyGames.LEVEL < BlocklyGames.MAX_LEVEL) {
    const expected = Music.expectedAnswer[Music.activeThread.stave - 1];
    const actual = Music.activeThread.transcript;
    const i = actual.length - 2;
    if (expected[i] !== actual[i] || expected[i + 1] !== actual[i + 1]) {
      wrong = true;
    }
  }
  Music.drawNote(Music.activeThread.stave, Music.clock64ths / 64,
                 pitch, duration, wrong ? 'wrong' : '');
  Music.animate(id);
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
          [Music.activeThread.transcript.length - 2] === Music.REST) {
    // Concatenate this rest with previous one.
    Music.activeThread.transcript
        [Music.activeThread.transcript.length - 1] += duration;
  } else {
    Music.activeThread.transcript.push(Music.REST, duration);
  }
  let wrong = false;
  if (BlocklyGames.LEVEL < BlocklyGames.MAX_LEVEL) {
    const expected = Music.expectedAnswer[Music.activeThread.stave - 1];
    const actual = Music.activeThread.transcript;
    const i = actual.length - 2;
    if (expected[i] !== actual[i] || expected[i + 1] < actual[i + 1]) {
      wrong = true;
    }
  }
  Music.drawNote(Music.activeThread.stave, Music.clock64ths / 64,
                 Music.REST, duration, wrong ? 'wrong' : '');
  Music.animate(id);
};

/**
 * Switch to a new instrument.
 * @param {string} instrument Name of new instrument.
 */
Music.setInstrument = function(instrument) {
  Music.activeThread.instrument = instrument;
};

/**
 * Array containing all notes expected to be played for this level.
 * @type !Array<!Array<number>>|undefined
 */
Music.expectedAnswer = undefined;

/**
 * Compute the expected answer for this level.
 */
Music.initExpectedAnswer = function() {
  let levelNotes = [];
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
    [[7, 0.25, 8, 0.25, 9, 0.25, 7, 0.25]],
    // Level 2.
    [doubleReplica([7, 0.25, 8, 0.25, 9, 0.25, 7, 0.25])],
    // Level 3.
    [doubleReplica([9, 0.25, 10, 0.25, 11, 0.5])],
    // Level 4.
    [doubleReplica([11, 0.125, 12, 0.125, 11, 0.125, 10, 0.125, 9, 0.25, 7, 0.25])],
    // Level 5.
    [doubleReplica([7, 0.25, 4, 0.25, 7, 0.5])],
    // Level 6.
    [levelNotes],
    // Level 7.
    [levelNotes, [Music.REST, 2].concat(levelNotes)],
    // Level 8.
    [
      singleReplica(levelNotes),
      [Music.REST, 2].concat(levelNotes)
    ],
    // Level 9.
    [
      levelNotes,
      [Music.REST, 2].concat(levelNotes),
      [Music.REST, 4].concat(levelNotes),
      [Music.REST, 6].concat(levelNotes)
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
  // On level 10 everyone is a winner.
  if (!Music.expectedAnswer) {
    return true;
  }

  // Incorrect number of staves?
  if (Music.expectedAnswer.length !== Music.threads.length) {
    console.log('Expected ' + Music.expectedAnswer.length + ' voices, found ' +
                Music.threads.length);
    return false;
  }

  // Notes match expected answer?
  for (let i = 0; i < Music.expectedAnswer.length; i++) {
    if (Music.threads[i].stave === i + 1) {
      if (String(Music.expectedAnswer[i]) !==
          String(Music.threads[i].transcript)) {
        console.log('Expected "' + Music.expectedAnswer[i] +
            '" notes,\n found "' + Music.threads[i].transcript + '"');
        return false;
      }
      continue;
    }
  }

  if (BlocklyGames.LEVEL >= 6) {
    // Count the number of distinct non-pianos.
    const code = BlocklyInterface.executedJsCode;
    const instrumentList = code.match(/setInstrument\('\w+'\)/g) || [];
    // Yes, you can cheat with a comment.  In this case I don't care.
    // Remove duplicates.
    const instrumentHash = new Set(instrumentList);
    // The piano does not count as a new instrument.
    instrumentHash.delete("setInstrument('piano')");
    const instruments = instrumentHash.size;

    // Level 6 requires a "set instrument" block.
    // Fail silently since that's the entire point of the level.
    if (BlocklyGames.LEVEL === 6 && instruments < 1) {
      return false;
    }

    // Level 7+8 require at least one "set instrument" block.
    // Level 9 requires at least three "set instrument" blocks.
    // Fail with a warning.
    if (((BlocklyGames.LEVEL === 7 || BlocklyGames.LEVEL === 8) &&
         instruments < 1) || (BlocklyGames.LEVEL === 9 && instruments < 3)) {
      console.log('Not enough instruments.  Found: ' + instruments);
      const content = document.getElementById('helpUseInstruments');
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
  }

  // Functions should be used to reduce note count.
  const maxCount = [
    undefined,  // Level 0.
    undefined,  // Level 1.
    16,  // Level 2.
    23,  // Level 3.
    38,  // Level 4.
    47,  // Level 5.
    47,  // Level 6.
    53,  // Level 7.
    55,  // Level 8.
    71,  // Level 9.
    undefined,  // Level 10.
  ][BlocklyGames.LEVEL];
  let blockCount = 0;
  const blocks = BlocklyInterface.workspace.getAllBlocks();
  for (const block of blocks) {
    if (block.type !== 'music_instrument' &&
        block.isEnabled() && !block.getInheritedDisabled()) {
      blockCount++;
    }
  }
  if (maxCount && (blockCount > maxCount)) {
    console.log('Too many blocks.  Found: ' + blockCount + ' Max: ' + maxCount);
    // Use a function, dummy.
    const content = document.getElementById('helpUseFunctions');
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
  return true;
};

/**
 * Transform a program written in level 9 blocks into one written in the more
 * advanced level 10 blocks.
 * @param {string} xml Level 9 blocks in XML as text.
 * @returns {string} Level 10 blocks in XML as text.
 */
Music.transform10 = function(xml) {
  // The level 7/8/9 rest block is non-configurable whole-note duration.
  return xml.replace(/"music_rest_whole"/g, '"music_rest"');
};

/**
 * Send an image of the canvas to gallery.
 */
Music.submitToGallery = function() {
  if (!Music.canSubmit || !Music.startCount) {
    alert(BlocklyGames.Msg['Music.submitDisabled']);
    return;
  }
  // Encode the thumbnail.
  const thumb = 'data:image/png;base64,' + [undefined,
    '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'
  ][Music.startCount];
  const thumbnail = document.getElementById('thumbnail');
  const ctxThumb = thumbnail.getContext('2d');
  ctxThumb.globalCompositeOperation = 'copy';
  const image = new Image();
  image.onload = function() {
    ctxThumb.drawImage(image, 0, 0, 200, 200);
  };
  image.src = thumb;
  document.getElementById('galleryThumb').value = thumb;

  // Show the dialog.
  BlocklyGallery.showGalleryForm();
};

Music.Thread = class {
  /**
   * One execution thread.
   * @param {number} i Number of this thread (1-4).
   * @param {!Array<!Interpreter.State>} stateStack JS-Interpreter state stack.
   */
  constructor(i, stateStack) {
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
  }
};