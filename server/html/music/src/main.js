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
goog.require('Blockly.JavaScript');
goog.require('Blockly.Toolbox');
goog.require('Blockly.Trashcan');
goog.require('Blockly.VerticalFlyout');
goog.require('Blockly.ZoomControls');
goog.require('BlocklyCode');
goog.require('BlocklyDialogs');
goog.require('BlocklyGallery');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('FieldPitch');
goog.require('Music.Blocks');
goog.require('Music.html');
goog.require('Music.startCount');
goog.require('Slider');


BlocklyGames.storageName = 'music';

const HEIGHT = 400;
const WIDTH = 400;

/**
 * PID of animation task currently executing.
 * @type number
 */
let pid = 0;

/**
 * Number of staves in the visualization.
 */
let staveCount = 0;

/**
 * Number of bars in the visualization.
 */
let barCount = 0;

/**
 * JavaScript interpreter for executing program.
 * @type Interpreter
 */
let interpreter = null;

/**
 * All executing threads.
 * @type !Array<!Thread>
 */
let threads = [];

/**
 * Time of start of execution.
 * @type number
 */
let startTime = 0;

/**
 * Number of 1/64ths notes since the start.
 * @type number
 */
let clock64ths = 0;

/**
 * Currently executing thread.
 * @type Thread
 */
let activeThread = null;

/**
 * Is the composition ready to be submitted to gallery?
 * @type boolean
 */
let canSubmit = false;

/**
 * Constant denoting a rest.
 */
const REST = -1;

let speedSlider;

/**
 * Initialize Blockly and the music.  Called on page load.
 */
function init() {
  Music.Blocks.init();

  // Render the HTML.
  document.body.innerHTML = Music.html.start(
      {lang: BlocklyGames.LANG,
       level: BlocklyGames.LEVEL,
       maxLevel: BlocklyGames.MAX_LEVEL,
       html: BlocklyGames.IS_HTML});

  BlocklyInterface.init(BlocklyGames.getMsg('Games.music', false));

  const rtl = BlocklyGames.IS_RTL;
  const blocklyDiv = BlocklyGames.getElementById('blockly');
  const paddingBox = BlocklyGames.getElementById('paddingBox');
  const staveBox = BlocklyGames.getElementById('staveBox');
  const musicBox = BlocklyGames.getElementById('musicBox');
  const onresize = function(_e) {
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
  BlocklyInterface.workspace.addChangeListener(disableExtraStarts);
  BlocklyInterface.workspace.addChangeListener(disableSubmit);
  // Prevent collisions with user-defined functions or variables.
  Blockly.JavaScript.addReservedWords('play,rest,setInstrument,' +
      'start0,start1,start2,start3,start4,start5,start6,start7,start8,start9');
  // Only start1-4 are used, but no harm in being safe.

  if (BlocklyGames.getElementById('submitButton')) {
    BlocklyGames.bindClick('submitButton', submitToGallery);
  }

  // Initialize the slider.
  const sliderSvg = BlocklyGames.getElementById('slider');
  speedSlider = new Slider(10, 35, 130, sliderSvg, sliderChange);

  const defaultXml =
      '<xml>' +
        '<block type="music_start" deletable="' +
          (BlocklyGames.LEVEL > 6) + '" x="180" y="50"></block>' +
      '</xml>';
  BlocklyInterface.loadBlocks(defaultXml,
      BlocklyGames.LEVEL !== BlocklyGames.MAX_LEVEL || transform10);
  // After level 6 the user can create new start blocks.
  // Ensure that start blocks inherited from previous levels are deletable.
  if (BlocklyGames.LEVEL > 6) {
    const blocks = BlocklyInterface.workspace.getTopBlocks(false);
    for(const block of blocks) {
      block.setDeletable(true);
    }
  }

  initExpectedAnswer();
  reset();

  BlocklyGames.bindClick('runButton', runButtonClick);
  BlocklyGames.bindClick('resetButton', resetButtonClick);

  // Lazy-load the JavaScript interpreter.
  BlocklyCode.importInterpreter();
  // Lazy-load the syntax-highlighting.
  BlocklyCode.importPrettify();
  // Lazy-load the sounds.
  setTimeout(importSounds, 1);

  BlocklyGames.bindClick('helpButton', showHelp);
  if (location.hash.length < 2 &&
      !BlocklyGames.loadFromLocalStorage(BlocklyGames.storageName,
                                         BlocklyGames.LEVEL)) {
    setTimeout(showHelp, 1000);
  }
}

/**
 * Load the sounds.
 */
function importSounds() {
  //<script type="text/javascript"
  //  src="third-party/SoundJS/soundjs.min.js"></script>
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'third-party/SoundJS/soundjs.min.js';
  script.onload = registerSounds;
  document.head.appendChild(script);
}

/**
 * Register the sounds.
 */
function registerSounds() {
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

    if (instances) {
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
    for (let j = 0; j < FieldPitch.NOTES.length; j++) {
      sounds.push({'src': instruments[i] + '/' + FieldPitch.NOTES[j] + '.mp3',
                   id: instruments[i] + j});
    }
  }
  createjs.Sound.registerSounds(sounds, assetsPath);
}

/**
 * The speed slider has changed.  Erase the start time to force re-computation.
 */
function sliderChange() {
  startTime = 0;
}

/**
 * Draw and position the specified number of stave bars.
 * @param {number} n Number of stave bars.
 */
function drawStave(n) {
  staveCount = n;
  const staveBox = BlocklyGames.getElementById('staveBox');
  // <img src="music/stave.png" class="stave" style="top: 100px">
  for (let i = 1; i <= n; i++) {
    const top = staveTop_(i, n);
    const img = document.createElement('img');
    img.src = 'music/stave.png';
    img.className = 'stave';
    img.style.top = Math.round(top) + 'px';
    staveBox.appendChild(img);
  }
}

/**
 * Return the height of a stave bar.
 * @param {number} i Which stave bar to compute (base 1).
 * @param {number} n Number of stave bars.
 * @returns {number} Top edge of stave bar.
 * @private
 */
function staveTop_(i, n) {
  const staveHeight = 69;
  const boxHeight = 400 - 15;  // Subtract the scrollbar.
  let top = (2 * i - 1) / (2 * n) * boxHeight;
  top -= staveHeight / 2;  // Center the stave on the desired spot.
  top += 5;  // Notes stick up a bit.
  return top;
}

/**
 * Draw and position the specified note or rest.
 * @param {number} i Which stave bar to draw on (base 1).
 * @param {number} time Distance down the stave (on the scale of whole notes).
 * @param {number} pitch Value of note (0-12), or rest (REST).
 * @param {number} duration Duration of note or rest (1, 0.5, 0.25...).
 * @param {string} className Name of CSS class for image.
 */
function drawNote(i, time, pitch, duration, className) {
  while (duration > 1) {
    drawNote(i, time, pitch, 1, className);
    time += 1;
    duration -= 1;
  }
  let top = staveTop_(i, staveCount);
  if (pitch === REST) {
    top += 21;
    top = Math.round(top);
  } else {
    top += pitch * -4.5 + 32;
    top = Math.floor(top);  // I have no idea why floor is better than round.
  }

  const LEFT_PADDING = 10;
  const WHOLE_WIDTH = 256;
  const left = Math.round(time * WHOLE_WIDTH + LEFT_PADDING);
  const musicContainer = BlocklyGames.getElementById('musicContainer');
  const img = document.createElement('img');
  const name = (pitch === REST ? 'rest' : 'note');
  img.src = 'music/' + name + duration + '.png';
  img.className = className + ' ' + name;
  img.style.top = top + 'px';
  img.style.left = left + 'px';
  if (pitch !== REST) {
    img.title = FieldPitch.NOTES[pitch];
  }
  musicContainer.appendChild(img);
  if (!className) {
    // Add a splash effect when playing a note.
    const splash = img.cloneNode();
    musicContainer.appendChild(splash);
    // Wait 0 ms to trigger the CSS Transition.
    setTimeout(function() {splash.className = 'splash ' + name;}, 0);
    // Garbage collect the now-invisible splash note.
    // It might be already gone if the user hit 'reset'.
    setTimeout(function() {
      splash.parentNode && splash.parentNode.removeChild(splash);
    }, 1000);
  }
  if (pitch === 0 || pitch === 12) {
    const line = document.createElement('img');
    line.src = 'music/black1x1.gif';
    line.className = className + ' ' +
        (duration === 1 ? ' ledgerLineWide' : ' ledgerLine');
    line.style.top = (top + 32) + 'px';
    line.style.left = (left - 5) + 'px';
    musicContainer.appendChild(line);
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
    xml = xml.replace(/%1/g, BlocklyGames.getMsg('Music.firstPart', true));
    BlocklyInterface.injectReadonly('sampleHelp2', xml);
  } else if (BlocklyGames.LEVEL === 6) {
    const xml = '<xml><block type="music_instrument" x="5" y="10"></block></xml>';
    BlocklyInterface.injectReadonly('sampleHelp6', xml);
  } else if (BlocklyGames.LEVEL === 7) {
    const xml = '<xml><block type="music_rest_whole" x="5" y="10"></block></xml>';
    BlocklyInterface.injectReadonly('sampleHelp7', xml);
  }

  BlocklyDialogs.showDialog(help, button, true, true, style,
      BlocklyDialogs.stopDialogKeyDown);
  BlocklyDialogs.startDialogKeyDown();
}

/**
 * On startup draw the expected answer and save it to the answer canvas.
 */
function drawAnswer() {
  // Clear all content.
  BlocklyGames.getElementById('staveBox').innerHTML = '';
  const musicContainer = BlocklyGames.getElementById('musicContainer');
  musicContainer.innerHTML = '';
  barCount = 0;
  // Add spacer to allow scrollbar to scroll past last note/rest.
  // <img id="musicContainerWidth" src="common/1x1.gif">
  const img = document.createElement('img');
  img.id = 'musicContainerWidth';
  img.src = 'common/1x1.gif';
  musicContainer.appendChild(img);

  if (!expectedAnswer) {
    // Level 10 has no expected answer.
    drawStave(Music.startCount.get() || 1);
  } else {
    drawStave(expectedAnswer.length);
    for (let i = 0; i < expectedAnswer.length; i++) {
      const chanel = expectedAnswer[i];
      let time = 0;
      for (let j = 0; j < chanel.length; j += 2) {
        const pitch = chanel[j];
        const duration = chanel[j + 1];
        drawNote(i + 1, time, pitch, duration, 'goal');
        time += duration;
      }
    }
    // Both Chrome and FF fail to recompute musicBox.scrollWidth for a few ms.
    // The first autoScroll will draw the first couple of bars immediately.
    // The delayed autoScroll will draw the rest (offscreen) once scrollWidth
    // has been computed.
    autoScroll();
    setTimeout(autoScroll, 100);
  }
}

/**
 * Ensure that there aren't more than the maximum allowed start blocks.
 * @param {!Blockly.Events.Abstract} e Change event.
 */
function disableExtraStarts(e) {
  const toolbox = BlocklyGames.getElementById('toolbox');
  const toolboxStart = BlocklyGames.getElementById('music_start');
  if (!toolboxStart) {
    return;
  }
  const maxStarts = expectedAnswer ? expectedAnswer.length : 4;
  const oldStartCount = Music.startCount.get();

  if (e instanceof Blockly.Events.BlockCreate) {
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
      Music.startCount.set(maxStarts);
    } else {
      Music.startCount.set(startBlocks.length);
    }
  } else if (e instanceof Blockly.Events.BlockDelete) {
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
    Music.startCount.set(startBlocksEnabled.length);
  }
  if (Music.startCount.get() !== oldStartCount) {
    resetButtonClick();
  }
}

/**
 * Don't allow gallery submissions after a code change but before an execution.
 * @param {!Blockly.Events.Abstract} e Change event.
 */
function disableSubmit(e) {
  if (!e.isUiEvent) {
    canSubmit = false;
  }
}

/**
 * Reset the music to the start position, clear the display, and kill any
 * pending tasks.
 */
function reset() {
  // Kill any task.
  clearTimeout(pid);
  threads.forEach(stopSound);
  interpreter = null;
  activeThread = null;
  threads.length = 0;
  clock64ths = 0;
  startTime = 0;
  canSubmit = false;

  drawAnswer();
}

/**
 * Click the run button.  Start the program.
 * @param {!Event} e Mouse or touch event.
 */
function runButtonClick(e) {
  // Prevent double-clicks or double-taps.
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  const runButton = BlocklyGames.getElementById('runButton');
  const resetButton = BlocklyGames.getElementById('resetButton');
  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton.style.minWidth) {
    resetButton.style.minWidth = runButton.offsetWidth + 'px';
  }
  runButton.style.display = 'none';
  resetButton.style.display = 'inline';
  BlocklyGames.getElementById('spinner').style.visibility = 'visible';
  execute();
}

/**
 * Click the reset button.  Reset the Music.
 * @param {!Event=} opt_e Mouse or touch event.
 */
function resetButtonClick(opt_e) {
  // Prevent double-clicks or double-taps.
  if (opt_e && BlocklyInterface.eventSpam(opt_e)) {
    return;
  }
  const runButton = BlocklyGames.getElementById('runButton');
  runButton.style.display = 'inline';
  BlocklyGames.getElementById('resetButton').style.display = 'none';
  BlocklyGames.getElementById('spinner').style.visibility = 'hidden';
  BlocklyInterface.workspace.highlightBlock(null);
  reset();
}

/**
 * Inject the Music API into a JavaScript interpreter.
 * @param {!Interpreter} interpreter The JS-Interpreter.
 * @param {!Interpreter.Object} globalObject Global object.
 */
function initInterpreter(interpreter, globalObject) {
  // API
  let wrapper;
  wrapper = function(duration, pitch, id) {
    play(duration, pitch, id);
  };
  wrap('play');

  wrapper = function(duration, id) {
    rest(duration, id);
  };
  wrap('rest');

  wrapper = function(instrument) {
    setInstrument(instrument);
  };
  wrap('setInstrument');

  function wrap(name) {
    interpreter.setProperty(globalObject, name,
        interpreter.createNativeFunction(wrapper, false));
  }
}

/**
 * Execute the user's code.  Heaven help us...
 */
function execute() {
  if (!('Interpreter' in window)) {
    // Interpreter lazy loads and hasn't arrived yet.  Try again later.
    setTimeout(execute, 99);
    return;
  }
  if (!('createjs' in window) || !createjs.Sound.isReady()) {
    // SoundJS lazy loads and hasn't arrived yet.  Try again later.
    setTimeout(execute, 99);
    return;
  }
  reset();
  Blockly.selected && Blockly.selected.unselect();
  // For safety, recompute startCount in the generator.
  Music.startCount.set(0);
  // Create an interpreter whose global scope will be the cross-thread global.
  const code = BlocklyCode.getJsCode();
  BlocklyCode.executedJsCode = code;
  BlocklyInterface.executedCode = BlocklyInterface.getCode();
  const startCount = Music.startCount.get();
  if (startCount === 0) {  // Blank workspace.
    resetButtonClick();
  }

  interpreter = new Interpreter(code, initInterpreter);
  for (let i = 1; i <= startCount; i++) {
    const tempInterpreter = new Interpreter('');
    // Replace this thread's global scope with the cross-thread global.
    tempInterpreter.getStateStack()[0].scope = interpreter.getGlobalScope();
    tempInterpreter.appendCode(`start${i}();\n`);
    threads.push(new Thread(i, tempInterpreter.getStateStack()));
  }
  setTimeout(tick, 100);
}

/**
 * Execute a 1/64th tick of the program.
 */
function tick() {
  // Delay between start of each beat (1/64ths of a whole note).
  const scaleDuration = 1000 * (2.5 - 2 * speedSlider.getValue()) / 64;
  if (!startTime) {
    // Either the first tick, or first tick after slider was adjusted.
    startTime = Date.now() - clock64ths * scaleDuration;
  }
  let done = true;
  for (const thread of threads) {
    if (!thread.done) {
      done = false;
      if (thread.pauseUntil64ths <= clock64ths) {
        executeChunk_(thread);
      }
    }
  }

  if (done) {
    // Program complete.
    if (checkAnswer()) {
      BlocklyInterface.saveToLocalStorage();
      if (BlocklyGames.LEVEL < BlocklyGames.MAX_LEVEL) {
        // No congrats for last level, it is open ended.
        Music.startCount.set(0);
        BlocklyCode.congratulations();
      }
    }
    BlocklyGames.getElementById('spinner').style.visibility = 'hidden';
    BlocklyInterface.workspace.highlightBlock(null);
    // Playback complete; allow the user to submit this music to gallery.
    canSubmit = true;
  } else {
    autoScroll();
    clock64ths++;
    const ms = (startTime + clock64ths * scaleDuration) - Date.now();
    pid = setTimeout(tick, ms);
  }
}

/**
 * Execute a bite-sized chunk of the user's code.
 * @param {!Thread} thread Thread to execute.
 * @private
 */
function executeChunk_(thread) {
  activeThread = thread;
  // Switch the interpreter to run the provided thread.
  interpreter.setStateStack(thread.stateStack);
  let ticks = 10000;
  let go;
  do {
    try {
      go = interpreter.step();
    } catch (e) {
      // User error, terminate in shame.
      alert(e);
      go = false;
    }
    if (ticks-- === 0) {
      console.warn('Thread ' + thread.stave + ' is running slowly.');
      return;
    }
    if (thread.pauseUntil64ths > clock64ths) {
      // Previously executed command (play or rest) requested a pause.
      return;
    }
  } while (go);
  // Thread complete.  Wrap up.
  stopSound(thread);
  if (thread.highlighedBlock) {
    BlocklyCode.highlight(thread.highlighedBlock, false);
    thread.highlighedBlock = null;
  }
  thread.done = true;
}

/**
 * Stop the specified thread from playing the current sound.
 * @param {!Thread} thread Thread object.
 */
function stopSound(thread) {
  const sound = thread.sound;
  if (sound) {
    // Firefox requires 100ms to start a note playing, so delaying the end
    // eliminates the staccato.  Adds a nice smoothness to Chrome.
    setTimeout(sound['stop'].bind(sound), 100);
    thread.sound = null;
  }
}

/**
 * Scroll the music display horizontally to the current time.
 */
function autoScroll() {
  const musicBox = BlocklyGames.getElementById('musicBox');
  const musicContainer = BlocklyGames.getElementById('musicContainer');
  const musicContainerWidth = BlocklyGames.getElementById('musicContainerWidth');

  // Ensure a half-screenfull of blank music to the right of last note.
  const LEFT_PADDING = 10;
  const WHOLE_WIDTH = 256;
  const RIGHT_PADDING = BlocklyGames.LEVEL < BlocklyGames.MAX_LEVEL ? 200 : 100;
  let newWidth;
  if (clock64ths) {
    newWidth = Math.round(clock64ths / 64 * WHOLE_WIDTH +
                          LEFT_PADDING + RIGHT_PADDING);
  } else {
    newWidth = musicBox.scrollWidth + RIGHT_PADDING;
  }
  musicContainerWidth.width = newWidth;
  // Draw a bar at one whole note intervals on all staves.
  while (barCount < Math.floor(newWidth / WHOLE_WIDTH)) {
    barCount++;
    for (let j = 1; j <= staveCount; j++) {
      const top = staveTop_(j, staveCount);
      const img = document.createElement('img');
      img.src = 'music/black1x1.gif';
      img.className = 'barLine';
      img.style.top = (top + 18) + 'px';
      img.style.left = (barCount * WHOLE_WIDTH + LEFT_PADDING - 5) + 'px';
      musicContainer.appendChild(img);
    }
  }

  const musicBoxMid = (400 - 36) / 2;  // There's a 36px margin for the clef.
  musicBox.scrollLeft = clock64ths * (WHOLE_WIDTH / 64) - musicBoxMid;
}

/**
 * Highlight a block and pause.
 * @param {?string} id ID of block.
 */
function animate(id) {
  if (id) {
    if (activeThread.highlighedBlock) {
      BlocklyCode.highlight(activeThread.highlighedBlock, false);
    }
    BlocklyCode.highlight(id, true);
    activeThread.highlighedBlock = id;
  }
}

/**
 * Play one note.
 * @param {number} duration Fraction of a whole note length to play.
 * @param {number} pitch Note number to play (0-12).
 * @param {?string} id ID of block.
 */
function play(duration, pitch, id) {
  if (activeThread.resting) {
    // Reorder this thread to the top of the resting threads.
    // Find the min resting thread stave.
    let minResting = Infinity;
    for (const thread of threads) {
      if (thread.resting && thread.stave < minResting) {
        minResting = thread.stave;
      }
    }
    // Swap this thread and the min-thread's staves.
    for (const thread of threads) {
      if (minResting === thread.stave) {
        const swapStave = activeThread.stave;
        activeThread.stave = minResting;
        thread.stave = swapStave;
        break;
      }
    }
    activeThread.resting = false;
  }
  pitch = Math.round(pitch);
  if (pitch < 0 || pitch > 12) {
    console.warn('Note out of range (0-12): ' + pitch);
    rest(duration, id);
    return;
  }
  stopSound(activeThread);
  activeThread.sound = createjs.Sound.play(activeThread.instrument + pitch);
  activeThread.pauseUntil64ths = duration * 64 + clock64ths;
  // Make a record of this note.
  activeThread.transcript.push(pitch, duration);
  let wrong = false;
  if (BlocklyGames.LEVEL < BlocklyGames.MAX_LEVEL) {
    const expected = expectedAnswer[activeThread.stave - 1];
    const actual = activeThread.transcript;
    const i = actual.length - 2;
    if (expected[i] !== actual[i] || expected[i + 1] !== actual[i + 1]) {
      wrong = true;
    }
  }
  drawNote(activeThread.stave, clock64ths / 64,
      pitch, duration, wrong ? 'wrong' : '');
  animate(id);
}

/**
 * Wait one rest.
 * @param {number} duration Fraction of a whole note length to rest.
 * @param {?string} id ID of block.
 */
function rest(duration, id) {
  if (activeThread.resting) {
    // Reorder this thread to the bottom of the resting threads that hasn't
    // played yet.  Find the max resting thread stave.
    let maxResting = 0;
    const unplayedLength = activeThread.transcript[1] || 0;
    for (const thread of threads) {
      if (thread.resting && thread.stave > maxResting &&
          (thread.transcript[1] || 0) <= unplayedLength) {
        maxResting = thread.stave;
      }
    }
    // Swap this thread and the max-thread's staves.
    for (const thread of threads) {
      if (maxResting === thread.stave) {
        const swapStave = activeThread.stave;
        activeThread.stave = maxResting;
        thread.stave = swapStave;
        break;
      }
    }
  }
  stopSound(activeThread);
  activeThread.pauseUntil64ths = duration * 64 + clock64ths;
  // Make a record of this rest.
  if (activeThread.transcript.length > 1 &&
      activeThread.transcript
          [activeThread.transcript.length - 2] === REST) {
    // Concatenate this rest with previous one.
    activeThread.transcript
        [activeThread.transcript.length - 1] += duration;
  } else {
    activeThread.transcript.push(REST, duration);
  }
  let wrong = false;
  if (BlocklyGames.LEVEL < BlocklyGames.MAX_LEVEL) {
    const expected = expectedAnswer[activeThread.stave - 1];
    const actual = activeThread.transcript;
    const i = actual.length - 2;
    if (expected[i] !== actual[i] || expected[i + 1] < actual[i + 1]) {
      wrong = true;
    }
  }
  drawNote(activeThread.stave, clock64ths / 64,
      REST, duration, wrong ? 'wrong' : '');
  animate(id);
}

/**
 * Switch to a new instrument.
 * @param {string} instrument Name of new instrument.
 */
function setInstrument(instrument) {
  activeThread.instrument = instrument;
}

/**
 * Array containing all notes expected to be played for this level.
 * @type !Array<!Array<number>>|undefined
 */
let expectedAnswer = undefined;

/**
 * Compute the expected answer for this level.
 */
function initExpectedAnswer() {
  let levelNotes = [];
  function doubleReplica(a) {
    levelNotes = levelNotes.concat(a).concat(a);
    return levelNotes;
  }
  function singleReplica(a) {
    levelNotes = levelNotes.concat(a);
    return levelNotes;
  }
  expectedAnswer = [
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
    [levelNotes, [REST, 2].concat(levelNotes)],
    // Level 8.
    [
      singleReplica(levelNotes),
      [REST, 2].concat(levelNotes)
    ],
    // Level 9.
    [
      levelNotes,
      [REST, 2].concat(levelNotes),
      [REST, 4].concat(levelNotes),
      [REST, 6].concat(levelNotes)
    ],
    // Level 10.
    undefined,
  ][BlocklyGames.LEVEL - 1];
}

/**
 * Verify if the answer is correct.
 * If so, move on to next level.
 */
function checkAnswer() {
  // On level 10 everyone is a winner.
  if (!expectedAnswer) {
    return true;
  }

  // Incorrect number of staves?
  if (expectedAnswer.length !== threads.length) {
    console.log('Expected ' + expectedAnswer.length + ' voices, found ' +
                threads.length);
    return false;
  }

  // Notes match expected answer?
  for (let i = 0; i < expectedAnswer.length; i++) {
    if (threads[i].stave === i + 1) {
      if (String(expectedAnswer[i]) !==
          String(threads[i].transcript)) {
        console.log('Expected "' + expectedAnswer[i] +
            '" notes,\n found "' + threads[i].transcript + '"');
        return false;
      }
      continue;
    }
  }

  if (BlocklyGames.LEVEL >= 6) {
    // Count the number of distinct non-pianos.
    const code = BlocklyCode.executedJsCode;
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
      const content = BlocklyGames.getElementById('helpUseInstruments');
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
  ][BlocklyGames.LEVEL - 1];
  let blockCount = 0;
  const blocks = BlocklyInterface.workspace.getAllBlocks(false);
  for (const block of blocks) {
    if (block.type !== 'music_instrument' &&
        block.isEnabled() && !block.getInheritedDisabled()) {
      blockCount++;
    }
  }
  if (maxCount && (blockCount > maxCount)) {
    console.log('Too many blocks.  Found: ' + blockCount + ' Max: ' + maxCount);
    // Use a function, dummy.
    const content = BlocklyGames.getElementById('helpUseFunctions');
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
}

/**
 * Transform a program written in level 9 blocks into one written in the more
 * advanced level 10 blocks.
 * @param {string} xml Level 9 blocks in XML as text.
 * @returns {string} Level 10 blocks in XML as text.
 */
function transform10(xml) {
  // The level 7/8/9 rest block is non-configurable whole-note duration.
  return xml.replace(/"music_rest_whole"/g, '"music_rest"');
}

/**
 * Send an image of the canvas to gallery.
 */
function submitToGallery() {
  const startCount = Music.startCount.get();
  if (!canSubmit || startCount < 1) {
    alert(BlocklyGames.getMsg('submitDisabled', false));
    return;
  }
  // Encode the thumbnail.
  const thumb = 'data:image/png;base64,' + [undefined,
    'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAAAAABVicqIAAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfhDAQXCQ8DSgv8AAACEklEQVRo3mP8z0B7wMQwasmoJaOWjFoyasmoJaOWjFpCR0samV3p4JN/IqNxMjIt+UsPS248oIMll3fRI04WvKeDJcfX0yN1TaaHJRd66JFP+n7SwZLnsfTI8dtW09gSRlYGhq/Vn2lrSdACVgaGR620tYQvqp6N4efcczS15DtDdRgzw5sptI74xS4MDAu20zp1zZVl+D+B1pZIb+Fl2LWF1jWjXgwDQz/Nq99KXYZ9p2ltiWwKA8NMmjck/PUY9tDcEvkAhte7aG0Jg6/gt4M0t8SEi+EC7Rt3dgxvaW/Jf4Zf9Gim/qeHJay0t4SRgY32ljxn4KW9JfcZNGluyeefDLI0t2T3Nx4tmlty+hOTO80t2c9gQPNS+PAD1nCaW3LiJUMArS15sZ3JVorWlvyTlMkkSiELBZZIdb3XobolV7afu8bMZRyCaHpJE1tUEws22/NCCkMuOYaI/yQBYn1yqmY3jPntEanhSqQlTRPfURB5xFlSOPU3A60tKUZvvf+j/gDOHIyRAXHqWzIZPay4jUltbRAE3Rh6FH6QloSJ8MlSdAH2Cnaq+4QHXUvwfxIBI+HGGQfaKIrjTlYGqkc8WlJy2k6qHcRYkoTM4Sncy056biQcok8cECGnsvs/GYCYUvhxoSoDAwMDk1bK0v9kAUai1kjcvPCAQVBOSY3cFvPoQoxRS0YtGbVk1JLhbgkATHAP6cDyYR8AAAAASUVORK5CYII=',
    'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAAAAABVicqIAAAB8klEQVRo3u3aO0/CUBQA4FMjJsaBTg4uxcHEzZLowlLG3on6CwyDM/EXgLMD8AuAXyDbrYvt4uojTg4GBgc10dY4OZg6FHld0tflOJhzN3pP79f7OL20oASAX1aAEEIIIYQQTGTYj6pVlnGrv7TPNl8i6ldlgTdu8/eYGDnknttOgjAJ5ILbD8kiMyLPnNufiaOzINecX6U6IS3yzTkfpL2qdMix8/SVoevpkNfHRUcPGLNdQMyTNcZMDcDGy5MCM1kONU9KzNwHzDzZYCbbAsw82TEZA9Q8MUy2h7yE10su/qa1mwN8hL5IEEIIIYQQQgghhBBCyB8ivWpRUZRi24+JC9KUujH1wWuov42olhF1Wvae9LYb4w74fZyn32oX9cEUAMA/dPEn/sTFX10tYawKSxgu/w5AGzfknwoBliwybLu3AAB6fXSgK+SFZsnlyaA8CVbDdDCEVpzIJmKRxuwLifCk+XIUyCDe3DAsRmKMGMTTYRFSSWfEIMJ0hsjMC+f8eSCFNIXBr4xulJMjNS+QQjxVQDqjKiccMaPpJbl5RyEdwdCmah1nkHSHiEIqKdMh034i5HWtjL/9HrUQ9vi56653s25wkasrPz3nGecjNk9utDHRCSRKzA9nLdf9yOu6VQaZotAfMQghhBBC/jvyA6C+2c6ogwZuAAAAAElFTkSuQmCC',
    'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAAAAABVicqIAAAB4ElEQVRo3u2aPVKDUBCAl4ytA7U6k1hZQio7SUorMuMBoicgOQG5AXKC4AGcxMoyuQFJaQWeAGbsXYvEwPuBBxkZR2e3y9t979tfMnlEQ2hfOkAQghCEIASRyonS4vXjSq54Oz0rU9xyK6iSYXPPHe4IKjxBfnNO4PxOvv58cV2iaA65+Qzkiu1gVqKwqPAEIQhBCEIQghCEIAQhCEEIQpA/DcmeHi41TesH2Y/+jmcQ0+Xu8M3ksS1IMMv9T9qBZNPwuJo0gGTDTfuFP5rRADI5mlGVrmwLYBqHOovXOCN+IXkHsBtAkmCZAAAMvP2C2LE2exn0Eq4zADBGnnia9Jo2GuQGPRsREXvCzqi4I8z1Rs/jjpNCJqzHO0Ne/BKnAKAGJOXuxOSQcZFhQCWkU3ccuuxHtzCXy77qOSYEYgkFRkTEeXFJX1XEUSNdYm/sEzPOEV5a6RUsFJBYjPXb64UDAADOnEGwIe4yiwqIL2wxC9rVKhbSK/a2p4LY1eMgSlzpVc1XG3OrWi98rehh4weke68w4FtLX1vKFna5OJQvipAdoK4su0J36cXsRmoG211uijUgGB0o3RphsJPllDglTnzq2wC67UVYV2LXBDAdPy4z0OiPGAQhCEEI8t8hX5wfXfFkGIkcAAAAAElFTkSuQmCC',
    'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAAAAABVicqIAAACU0lEQVRo3u2aTY7aQBCFnyMWkRLJZjkrs8rWzlwAcwLgBMAJ4AYWJwBOYOYEkBPYXCD2Ohs7J7AjJcomUmXhAf90N+OMbWmkVG2A6nZ/7q56JSijEfq3d2AIQxjy/0AGUu/w93v59B8fBooBXe7/84sATVq7hll32yAOPKdw1R4e5P6vnz4qBh7l/p/fAIBkNnZJbvBVAwq/DyLiwDOEIQxhCEMYwhCGMIQhDGEIQ97iT+ymdgkCwJhNjd4g2eGYAADOxq4vyHZ/a1hlq34g2STqPfDR5xoj6R6STOqL9gCZC/3DUeeQvRAPszUkOUyGmqbNn66OgzBlc3eBl1tR4ew22clbUb6wipnea0W9mMLZdl98CCovJTsabXQSrZrIwXPaiDGayNrQ9SB7yzZiTKQMLCs9c9NftlL8XNFOPxdvdTdy/rHUJ9+BcRFOIR56vqATbi75LjYzlUAuhXjKkC/HIANgONfCvVXKwQ6SIIEzUhCSp3MEAPbSqurkVFxgjFwiori5HCqWlmJko9TPTasH68o1FzZheEZd7YN7qSrIwW4waXVUlJWwLljZcemnJvtYSgAgIoqFopDXrkXZZcVNGGuoIGKi5zedWkXIvSYISRitZ4gnjOjXLHItADAXjU6KiMSUdp8hDuSnle/G91Nqar78dkFEr5SDxFxhqR0pHm3oZ6OrL6iLjaJA6nu7K8Z4f8sws8oI6dVWS6FF6THRqTwwTamFWVLxonoDU59aWaEs001rD7zitQWY011Mrc2b6tDH64qwNP5zDEMYwpBu7S/9DO5PRs/ScgAAAABJRU5ErkJggg=='
  ][startCount];
  const thumbnail = BlocklyGames.getElementById('thumbnail');
  const ctxThumb = thumbnail.getContext('2d');
  ctxThumb.globalCompositeOperation = 'copy';
  const image = new Image();
  image.onload = function() {
    ctxThumb.drawImage(image, 0, 0, 200, 200);
  };
  image.src = thumb;
  BlocklyGames.getElementById('galleryThumb').value = thumb;

  // Show the dialog.
  BlocklyGallery.showGalleryForm();
}

class Thread {
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
}

BlocklyGames.callWhenLoaded(init);
