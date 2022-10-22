/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for Turtle game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Turtle');

goog.require('Blockly.Comment');
goog.require('Blockly.FieldColour');
goog.require('Blockly.FlyoutButton');
goog.require('Blockly.JavaScript');
goog.require('Blockly.Toolbox');
goog.require('Blockly.Trashcan');
goog.require('Blockly.utils.math');
goog.require('Blockly.VerticalFlyout');
goog.require('Blockly.Xml');
goog.require('Blockly.ZoomControls');
goog.require('BlocklyCode');
goog.require('BlocklyDialogs');
goog.require('BlocklyGallery');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('Slider');
goog.require('Turtle.Blocks');
goog.require('Turtle.html');


BlocklyGames.storageName = 'turtle';

const HEIGHT = 400;
const WIDTH = 400;

/**
 * PID of animation task currently executing.
 * @type !Array<number>
 */
const pidList = [];

/**
 * Number of milliseconds that execution should delay.
 * @type number
 */
let pause = 0;

/**
 * JavaScript interpreter for executing program.
 * @type Interpreter
 */
let interpreter = null;

/**
 * Should the turtle be drawn?
 * @type boolean
 */
let visible = true;

/**
 * Is the drawing ready to be submitted to gallery?
 * @type boolean
 */
let canSubmit = false;

let speedSlider;
let ctxDisplay;
let ctxAnswer;
let ctxScratch;
let turtleX;
let turtleY;
let turtleHeading;
let isPenDown;

/**
 * Initialize Blockly and the turtle.  Called on page load.
 */
function init() {
  Turtle.Blocks.init();

  // Render the HTML.
  document.body.innerHTML = Turtle.html.start(
      {lang: BlocklyGames.LANG,
       level: BlocklyGames.LEVEL,
       maxLevel: BlocklyGames.MAX_LEVEL,
       html: BlocklyGames.IS_HTML});

  BlocklyInterface.init(BlocklyGames.getMsg('Games.turtle', false));

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
  Blockly.JavaScript.addReservedWords('moveForward,moveBackward,' +
      'turnRight,turnLeft,penUp,penDown,penWidth,penColour,' +
      'hideTurtle,showTurtle,print,font');

  if (BlocklyGames.getElementById('submitButton')) {
    BlocklyGames.bindClick('submitButton', submitToGallery);
  }

  // Initialize the slider.
  const sliderSvg = BlocklyGames.getElementById('slider');
  speedSlider = new Slider(10, 35, 130, sliderSvg);

  let defaultXml;
  if (BlocklyGames.LEVEL === BlocklyGames.MAX_LEVEL) {
    defaultXml =
        '<xml>' +
          '<block type="turtle_move" x="70" y="70">' +
            '<value name="VALUE">' +
              '<shadow type="math_number">' +
                '<field name="NUM">10</field>' +
              '</shadow>' +
            '</value>' +
          '</block>' +
        '</xml>';
  } else {
    defaultXml =
        '<xml>' +
          '<block type="turtle_move_internal" x="70" y="70">' +
            '<field name="VALUE">100</field>' +
          '</block>' +
        '</xml>';
  }
  BlocklyInterface.loadBlocks(defaultXml,
      BlocklyGames.LEVEL !== BlocklyGames.MAX_LEVEL || transform10);

  ctxDisplay = BlocklyGames.getElementById('display').getContext('2d');
  ctxAnswer = BlocklyGames.getElementById('answer').getContext('2d');
  ctxScratch = BlocklyGames.getElementById('scratch').getContext('2d');
  drawAnswer();
  reset();

  BlocklyGames.bindClick('runButton', runButtonClick);
  BlocklyGames.bindClick('resetButton', resetButtonClick);

  // Preload the win sound.
  BlocklyInterface.workspace.getAudioManager().load(
      ['turtle/win.mp3', 'turtle/win.ogg'], 'win');
  // Lazy-load the JavaScript interpreter.
  BlocklyCode.importInterpreter();
  // Lazy-load the syntax-highlighting.
  BlocklyCode.importPrettify();

  BlocklyGames.bindClick('helpButton', showHelp);
  if (location.hash.length < 2 &&
      !BlocklyGames.loadFromLocalStorage(BlocklyGames.storageName,
                                         BlocklyGames.LEVEL)) {
    setTimeout(showHelp, 1000);
    if (BlocklyGames.LEVEL === 9) {
      setTimeout(BlocklyDialogs.abortOffer, 5 * 60 * 1000);
    }
  }
  if (BlocklyGames.LEVEL === 1) {
    // Previous apps did not have categories.
    // If the user doesn't find them, point them out.
    BlocklyInterface.workspace.addChangeListener(watchCategories_);
  }
}

/**
 * Transform a program written in level 9 blocks into one written in the more
 * advanced level 10 blocks.
 * @param {string} xml Level 9 blocks in XML as text.
 * @returns {string} Level 10 blocks in XML as text.
 */
function transform10(xml) {
  const tree = Blockly.Xml.textToDom(xml);
  let node = tree;
  while (node) {
    if (node.nodeName.toLowerCase() === 'block') {
      const type = node.getAttribute('type');
      // Find the last child that's a 'field'.
      let child = node.lastChild;
      while (child && child.nodeName.toLowerCase() !== 'field') {
        child = child.previousSibling;
      }
      const childName = child && child.getAttribute('name');

      if (type === 'turtle_colour_internal' && childName === 'COLOUR') {
        /*
        Old:
          <block type="turtle_colour_internal">
            <field name="COLOUR">#ffff00</field>
            <next>...</next>
          </block>
        New:
          <block type="turtle_colour">
            <value name="COLOUR">
              <shadow type="colour_picker">
                <field name="COLOUR">#ffff00</field>
              </shadow>
            </value>
            <next>...</next>
          </block>
        */
        node.setAttribute('type', 'turtle_colour');
        node.removeChild(child);
        const value = document.createElement('value');
        value.setAttribute('name', 'COLOUR');
        node.appendChild(value);
        const shadow = document.createElement('shadow');
        shadow.setAttribute('type', 'colour_picker');
        value.appendChild(shadow);
        shadow.appendChild(child);
      }

      if (type === 'turtle_repeat_internal' && childName === 'TIMES') {
        /*
        Old:
          <block type="turtle_repeat_internal">
            <field name="TIMES">3</field>
            <statement name="DO">...</statement>
            <next>...</next>
          </block>
        New:
          <block type="controls_repeat_ext">
            <value name="TIMES">
              <shadow type="math_number">
                <field name="NUM">3</field>
              </shadow>
            </value>
            <statement name="DO">...</statement>
            <next>...</next>
          </block>
        */
        node.setAttribute('type', 'controls_repeat_ext');
        node.removeChild(child);
        const value = document.createElement('value');
        value.setAttribute('name', 'TIMES');
        node.appendChild(value);
        const shadow = document.createElement('shadow');
        shadow.setAttribute('type', 'math_number');
        value.appendChild(shadow);
        child.setAttribute('name', 'NUM');
        shadow.appendChild(child);
      }

      if (type === 'turtle_move_internal' && childName === 'VALUE') {
        /*
        Old:
          <block type="turtle_move_internal">
            <field name="DIR">moveForward</field>
            <field name="VALUE">50</field>
            <next>...</next>
          </block>
        New:
          <block type="turtle_move">
            <field name="DIR">moveForward</field>
            <value name="VALUE">
              <shadow type="math_number">
                <field name="NUM">50</field>
              </shadow>
            </value>
            <next>...</next>
          </block>
        */
        node.setAttribute('type', 'turtle_move');
        node.removeChild(child);
        const value = document.createElement('value');
        value.setAttribute('name', 'VALUE');
        node.appendChild(value);
        const shadow = document.createElement('shadow');
        shadow.setAttribute('type', 'math_number');
        value.appendChild(shadow);
        child.setAttribute('name', 'NUM');
        shadow.appendChild(child);
      }

      if (type === 'turtle_turn_internal' && childName === 'VALUE') {
        /*
        Old:
          <block type="turtle_move_internal">
            <field name="DIR">turnRight</field>
            <field name="VALUE">90</field>
            <next>...</next>
          </block>
        New:
          <block type="turtle_move">
            <field name="DIR">turnRight</field>
            <value name="VALUE">
              <shadow type="math_number">
                <field name="NUM">90</field>
              </shadow>
            </value>
            <next>...</next>
          </block>
        */
        node.setAttribute('type', 'turtle_turn');
        node.removeChild(child);
        const value = document.createElement('value');
        value.setAttribute('name', 'VALUE');
        node.appendChild(value);
        const shadow = document.createElement('shadow');
        shadow.setAttribute('type', 'math_number');
        value.appendChild(shadow);
        child.setAttribute('name', 'NUM');
        shadow.appendChild(child);
      }
    }
    node = nextNode(node);
  }
  return Blockly.Xml.domToText(tree);
}

/**
 * Walk from one node to the next in a tree.
 * @param {!Node} node Current node.
 * @returns {Node} Next node, or null if ran off bottom of tree.
 */
function nextNode(node) {
  if (node.firstChild) {
    return node.firstChild;
  }
  do {
    if (node.nextSibling) {
      return node.nextSibling;
    }
  } while ((node = node.parentNode));
  return node;
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

  if (BlocklyGames.LEVEL === 3) {
    const xml = '<xml><block type="turtle_colour_internal" x="5" y="10">' +
        '<field name="COLOUR">#ffff00</field></block></xml>';
    BlocklyInterface.injectReadonly('sampleHelp3', xml);
  } else if (BlocklyGames.LEVEL === 4) {
    const xml = '<xml><block type="turtle_pen" x="5" y="10"></block></xml>';
    BlocklyInterface.injectReadonly('sampleHelp4', xml);
  }

  BlocklyDialogs.showDialog(help, button, true, true, style, hideHelp);
  BlocklyDialogs.startDialogKeyDown();
}

/**
 * Hide the help pop-up.
 */
function hideHelp() {
  BlocklyDialogs.stopDialogKeyDown();
  if (BlocklyGames.LEVEL === 1) {
    // Previous apps did not have categories.
    // If the user doesn't find them, point them out.
    setTimeout(showCategoryHelp, 5000);
  }
}

/**
 * Show the help pop-up to encourage clicking on the toolbox categories.
 */
function showCategoryHelp() {
  if (categoryClicked_ || BlocklyDialogs.isDialogVisible_) {
    return;
  }
  const help = BlocklyGames.getElementById('helpToolbox');
  const style = {
    width: '25%',
    top: '3.3em',
  };
  if (BlocklyGames.IS_RTL) {
    style.right = '525px';
  } else {
    style.left = '525px';
  }
  const origin = BlocklyGames.getElementById(':0');  // Toolbox's tree root.
  BlocklyDialogs.showDialog(help, origin, true, false, style, null);
}


/**
 * Flag indicating if a toolbox category has been clicked yet.
 * Level one only.
 * @private
 */
let categoryClicked_ = false;

/**
 * Monitor to see if the user finds the categories in level one.
 * @param {!Blockly.Events.Abstract} event Custom data for event.
 * @private
 */
function watchCategories_(event) {
  if (event.type === Blockly.Events.TOOLBOX_ITEM_SELECT) {
    categoryClicked_ = true;
    BlocklyDialogs.hideDialog(false);
    BlocklyInterface.workspace.removeChangeListener(watchCategories_);
  }
}

/**
 * On startup draw the expected answer and save it to the answer canvas.
 */
function drawAnswer() {
  reset();
  answer();
  ctxAnswer.globalCompositeOperation = 'copy';
  ctxAnswer.drawImage(ctxScratch.canvas, 0, 0);
  ctxAnswer.globalCompositeOperation = 'source-over';
}

/**
 * Reset the turtle to the start position, clear the display, and kill any
 * pending tasks.
 */
function reset() {
  // Starting location and heading of the turtle.
  turtleX = HEIGHT / 2;
  turtleY = WIDTH / 2;
  turtleHeading = 0;
  isPenDown = true;
  visible = true;

  // Clear the canvas.
  ctxScratch.canvas.width = ctxScratch.canvas.width;
  ctxScratch.strokeStyle = '#fff';
  ctxScratch.fillStyle = '#fff';
  ctxScratch.lineWidth = 5;
  ctxScratch.lineCap = 'round';
  ctxScratch.font = 'normal 18pt Arial';
  display();

  // Kill all tasks.
  pidList.forEach(clearTimeout);
  pidList.length = 0;
  interpreter = null;
}

/**
 * Copy the scratch canvas to the display canvas. Add a turtle marker.
 */
function display() {
  // Clear the display with black.
  ctxDisplay.beginPath();
  ctxDisplay.rect(0, 0, ctxDisplay.canvas.width, ctxDisplay.canvas.height);
  ctxDisplay.fillStyle = '#000';
  ctxDisplay.fill();

  // Draw the answer layer.
  ctxDisplay.globalCompositeOperation = 'source-over';
  ctxDisplay.globalAlpha = 0.2;
  ctxDisplay.drawImage(ctxAnswer.canvas, 0, 0);
  ctxDisplay.globalAlpha = 1;

  // Draw the user layer.
  ctxDisplay.globalCompositeOperation = 'source-over';
  ctxDisplay.drawImage(ctxScratch.canvas, 0, 0);

  // Draw the turtle.
  if (visible) {
    // Make the turtle the colour of the pen.
    ctxDisplay.strokeStyle = ctxScratch.strokeStyle;
    ctxDisplay.fillStyle = ctxScratch.fillStyle;

    // Draw the turtle body.
    const radius = ctxScratch.lineWidth / 2 + 10;
    ctxDisplay.beginPath();
    ctxDisplay.arc(turtleX, turtleY, radius, 0, 2 * Math.PI, false);
    ctxDisplay.lineWidth = 3;
    ctxDisplay.stroke();

    // Draw the turtle head.
    const WIDTH = 0.3;
    const HEAD_TIP = 10;
    const ARROW_TIP = 4;
    const BEND = 6;
    let radians = Blockly.utils.math.toRadians(turtleHeading);
    const tipX = turtleX + (radius + HEAD_TIP) * Math.sin(radians);
    const tipY = turtleY - (radius + HEAD_TIP) * Math.cos(radians);
    radians -= WIDTH;
    const leftX = turtleX + (radius + ARROW_TIP) * Math.sin(radians);
    const leftY = turtleY - (radius + ARROW_TIP) * Math.cos(radians);
    radians += WIDTH / 2;
    const leftControlX = turtleX + (radius + BEND) * Math.sin(radians);
    const leftControlY = turtleY - (radius + BEND) * Math.cos(radians);
    radians += WIDTH;
    const rightControlX = turtleX + (radius + BEND) * Math.sin(radians);
    const rightControlY = turtleY - (radius + BEND) * Math.cos(radians);
    radians += WIDTH / 2;
    const rightX = turtleX + (radius + ARROW_TIP) * Math.sin(radians);
    const rightY = turtleY - (radius + ARROW_TIP) * Math.cos(radians);
    ctxDisplay.beginPath();
    ctxDisplay.moveTo(tipX, tipY);
    ctxDisplay.lineTo(leftX, leftY);
    ctxDisplay.bezierCurveTo(leftControlX, leftControlY,
        rightControlX, rightControlY, rightX, rightY);
    ctxDisplay.closePath();
    ctxDisplay.fill();
  }
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
 * Click the reset button.  Reset the Turtle.
 * @param {!Event} e Mouse or touch event.
 */
function resetButtonClick(e) {
  // Prevent double-clicks or double-taps.
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  const runButton = BlocklyGames.getElementById('runButton');
  runButton.style.display = 'inline';
  BlocklyGames.getElementById('resetButton').style.display = 'none';
  BlocklyGames.getElementById('spinner').style.visibility = 'hidden';
  BlocklyInterface.workspace.highlightBlock(null);
  reset();

  // Image cleared; prevent user from submitting to gallery.
  canSubmit = false;
}

/**
 * Inject the Turtle API into a JavaScript interpreter.
 * @param {!Interpreter} interpreter The JS-Interpreter.
 * @param {!Interpreter.Object} globalObject Global object.
 */
function initInterpreter(interpreter, globalObject) {
  // API
  let wrapper;
  wrapper = function(distance, id) {
    move(distance, id);
  };
  wrap('moveForward');

  wrapper = function(distance, id) {
    move(-distance, id);
  };
  wrap('moveBackward');

  wrapper = function(angle, id) {
    turn(angle, id);
  };
  wrap('turnRight');

  wrapper = function(angle, id) {
    turn(-angle, id);
  };
  wrap('turnLeft');

  wrapper = function(id) {
    penDown(false, id);
  };
  wrap('penUp');

  wrapper = function(id) {
    penDown(true, id);
  };
  wrap('penDown');

  wrapper = function(width, id) {
    penWidth(width, id);
  };
  wrap('penWidth');

  wrapper = function(colour, id) {
    penColour(colour, id);
  };
  wrap('penColour');

  wrapper = function(id) {
    isVisible(false, id);
  };
  wrap('hideTurtle');

  wrapper = function(id) {
    isVisible(true, id);
  };
  wrap('showTurtle');

  wrapper = function(text, id) {
    drawPrint(text, id);
  };
  wrap('print');

  wrapper = function(font, size, style, id) {
    drawFont(font, size, style, id);
  };
  wrap('font');

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

  reset();
  Blockly.selected && Blockly.selected.unselect();
  const code = BlocklyCode.getJsCode();
  BlocklyCode.executedJsCode = code;
  BlocklyInterface.executedCode = BlocklyInterface.getCode();
  interpreter = new Interpreter(code, initInterpreter);
  pidList.push(setTimeout(executeChunk_, 100));
}

/**
 * Execute a bite-sized chunk of the user's code.
 * @private
 */
function executeChunk_() {
  // All tasks should be complete now.  Clean up the PID list.
  pidList.length = 0;
  pause = 0;
  // Normally we'll execute until we reach a command that requests a pause
  // (which means a turtle block), then highlight a block and wait, before
  // executing the next chunk.  However, put a limit of 1000 steps on each
  // chunk in case there's a tight loop with no turtle blocks.
  let ticks = 1000;
  let go;
  do {
    try {
      go = interpreter.step();
    } catch (e) {
      // User error, terminate in shame.
      alert(e);
      go = false;
    }
    if (!ticks--) {
      pause = 1;
    }
    if (go && pause) {
      // The last executed command requested a pause.
      go = false;
      pidList.push(setTimeout(executeChunk_, pause));
    }
  } while (go);
  // Wrap up if complete.
  if (!pause) {
    BlocklyGames.getElementById('spinner').style.visibility = 'hidden';
    BlocklyInterface.workspace.highlightBlock(null);
    checkAnswer();
    // Image complete; allow the user to submit this image to gallery.
    canSubmit = true;
  }
}

/**
 * Highlight a block and pause.
 * @param {string|undefined} id ID of block.
 */
function animate(id) {
  // No need for a full render if there's no block ID,
  // since that's the signature of just pre-drawing the answer layer.
  if (id) {
    display();
    BlocklyCode.highlight(id);
    // Scale the speed non-linearly, to give better precision at the fast end.
    const stepSpeed = 1000 * Math.pow(1 - speedSlider.getValue(), 2);
    pause = Math.max(1, stepSpeed);
  }
}

/**
 * Move the turtle forward or backward.
 * @param {number} distance Pixels to move.
 * @param {string=} opt_id ID of block.
 */
function move(distance, opt_id) {
  if (isPenDown) {
    ctxScratch.beginPath();
    ctxScratch.moveTo(turtleX, turtleY);
  }
  let bump = 0;
  if (distance) {
    const radians = Blockly.utils.math.toRadians(turtleHeading);
    turtleX += distance * Math.sin(radians);
    turtleY -= distance * Math.cos(radians);
  } else {
    // WebKit (unlike Gecko) draws nothing for a zero-length line.
    bump = 0.1;
  }
  if (isPenDown) {
    ctxScratch.lineTo(turtleX, turtleY + bump);
    ctxScratch.stroke();
  }
  animate(opt_id);
}

/**
 * Turn the turtle left or right.
 * @param {number} angle Degrees to turn clockwise.
 * @param {string=} opt_id ID of block.
 */
function turn(angle, opt_id) {
  turtleHeading = BlocklyGames.normalizeAngle(turtleHeading + angle);
  animate(opt_id);
}

/**
 * Lift or lower the pen.
 * @param {boolean} down True if down, false if up.
 * @param {string=} opt_id ID of block.
 */
function penDown(down, opt_id) {
  isPenDown = down;
  animate(opt_id);
}

/**
 * Change the thickness of lines.
 * @param {number} width New thickness in pixels.
 * @param {string=} opt_id ID of block.
 */
function penWidth(width, opt_id) {
  ctxScratch.lineWidth = width;
  animate(opt_id);
}

/**
 * Change the colour of the pen.
 * @param {string} colour CSS colour string.
 * @param {string=} opt_id ID of block.
 */
function penColour(colour, opt_id) {
  ctxScratch.strokeStyle = colour;
  ctxScratch.fillStyle = colour;
  animate(opt_id);
}

/**
 * Make the turtle visible or invisible.
 * @param {boolean} visible True if visible, false if invisible.
 * @param {string=} opt_id ID of block.
 */
function isVisible(visible, opt_id) {
  visible = visible;
  animate(opt_id);
}

/**
 * Print some text.
 * @param {string} text Text to print.
 * @param {string=} opt_id ID of block.
 */
function drawPrint(text, opt_id) {
  ctxScratch.save();
  ctxScratch.translate(turtleX, turtleY);
  ctxScratch.rotate(Blockly.utils.math.toRadians(turtleHeading - 90));
  ctxScratch.fillText(text, 0, 0);
  ctxScratch.restore();
  animate(opt_id);
}

/**
 * Change the typeface of printed text.
 * @param {string} font Font name (e.g. 'Arial').
 * @param {number} size Font size (e.g. 18).
 * @param {string} style Font style (e.g. 'italic').
 * @param {string=} opt_id ID of block.
 */
function drawFont(font, size, style, opt_id) {
  ctxScratch.font = style + ' ' + size + 'pt ' + font;
  animate(opt_id);
}

/**
 * Verify if the answer is correct.
 * If so, move on to next level.
 */
function checkAnswer() {
  // Compare the Alpha (opacity) byte of each pixel in the user's image and
  // the sample answer image.
  const userImage = ctxScratch.getImageData(0, 0, WIDTH, HEIGHT);
  const answerImage = ctxAnswer.getImageData(0, 0, WIDTH, HEIGHT);
  const len = Math.min(userImage.data.length, answerImage.data.length);
  let delta = 0;
  // Pixels are in RGBA format.  Only check the Alpha bytes.
  for (let i = 3; i < len; i += 4) {
    // Check the Alpha byte.
    if (Math.abs(userImage.data[i] - answerImage.data[i]) > 64) {
      delta++;
    }
  }
  if (isCorrect(delta)) {
    BlocklyInterface.saveToLocalStorage();
    if (BlocklyGames.LEVEL < BlocklyGames.MAX_LEVEL) {
      // No congrats for last level, it is open ended.
      BlocklyInterface.workspace.getAudioManager().play('win', 0.5);
      BlocklyCode.congratulations();
    }
  } else {
    penColour('#ff0000');
  }
}

/**
 * Send an image of the canvas to gallery.
 */
function submitToGallery() {
  if (!canSubmit) {
    alert(BlocklyGames.getMsg('Turtle.submitDisabled', false));
    return;
  }
  // Encode the thumbnail.
  const thumbnail = BlocklyGames.getElementById('thumbnail');
  const ctxThumb = thumbnail.getContext('2d');
  ctxThumb.globalCompositeOperation = 'copy';
  ctxThumb.drawImage(ctxDisplay.canvas, 0, 0, 200, 200);
  const thumbData = thumbnail.toDataURL('image/png');
  BlocklyGames.getElementById('galleryThumb').value = thumbData;

  // Show the dialog.
  BlocklyGallery.showGalleryForm();
}

/**
 * Sample solutions for each level.
 * To create an answer, just solve the level in Blockly, then paste the
 * resulting JavaScript here, moving any functions to the beginning of
 * this function, and renaming the API functions (e.g. moveForward -> move).
 */
function answer() {
  // Helper functions.
  function drawStar(length) {
    for (let count = 0; count < 5; count++) {
      move(length);
      turn(144);
    }
  }

  switch (BlocklyGames.LEVEL) {
    case 1:
      // Square.
      for (let count = 0; count < 4; count++) {
        move(100);
        turn(90);
      }
      break;
    case 2:
      // Pentagon.
      for (let count = 0; count < 5; count++) {
        move(100);
        turn(72);
      }
      break;
    case 3:
      // Star.
      penColour('#ffff00');
      drawStar(100);
      break;
    case 4:
      // Pen up/down.
      penColour('#ffff00');
      drawStar(50);
      penDown(false);
      move(150);
      penDown(true);
      move(20);
      break;
    case 5:
      // Four stars.
      penColour('#ffff00');
      for (let count = 0; count < 4; count++) {
        drawStar(50);
        penDown(false);
        move(150);
        turn(90);
        penDown(true);
      }
      break;
    case 6:
      // Three stars and a line.
      penColour('#ffff00');
      for (let count = 0; count < 3; count++) {
        drawStar(50);
        penDown(false);
        move(150);
        turn(120);
        penDown(true);
      }
      penDown(false);
      turn(-90);
      move(100);
      penDown(true);
      penColour('#ffffff');
      move(50);
      break;
    case 7:
      // Three stars and 4 lines.
      penColour('#ffff00');
      for (let count = 0; count < 3; count++) {
        drawStar(50);
        penDown(false);
        move(150);
        turn(120);
        penDown(true);
      }
      penDown(false);
      turn(-90);
      move(100);
      penDown(true);
      penColour('#ffffff');
      for (let count = 0; count < 4; count++) {
        move(50);
        move(-50);
        turn(45);
      }
      break;
    case 8:
      // Three stars and a circle.
      penColour('#ffff00');
      for (let count = 0; count < 3; count++) {
        drawStar(50);
        penDown(false);
        move(150);
        turn(120);
        penDown(true);
      }
      penDown(false);
      turn(-90);
      move(100);
      penDown(true);
      penColour('#ffffff');
      for (let count = 0; count < 360; count++) {
        move(50);
        move(-50);
        turn(1);
      }
      break;
    case 9:
      // Three stars and a crescent.
      penColour('#ffff00');
      for (let count = 0; count < 3; count++) {
        drawStar(50);
        penDown(false);
        move(150);
        turn(120);
        penDown(true);
      }
      penDown(false);
      turn(-90);
      move(100);
      penDown(true);
      penColour('#ffffff');
      for (let count = 0; count < 360; count++) {
        move(50);
        move(-50);
        turn(1);
      }
      turn(120);
      move(20);
      penColour('#000000');
      for (let count = 0; count < 360; count++) {
        move(50);
        move(-50);
        turn(1);
      }
      break;
  }
}

/**
 * Validate whether the user's answer is correct.
 * @param {number} pixelErrors Number of pixels that are wrong.
 * @returns {boolean} True if the level is solved, false otherwise.
 */
function isCorrect(pixelErrors) {
  if (BlocklyGames.LEVEL === BlocklyGames.MAX_LEVEL) {
    // Any non-null answer is correct.
    return BlocklyInterface.workspace.getAllBlocks(false).length > 1;
  }
  console.log('Pixel errors: ' + pixelErrors);
  // There's an alternate solution for level 9 that has the moon rotated by
  // 12 degrees.  Allow that one to pass.
  // https://groups.google.com/forum/#!topic/blockly-games/xMwt-JHnZGY
  // There's also an alternate solution for level 8 that has multiple
  // redraws.  Allow that one to pass too.
  // https://groups.google.com/g/blockly-games/c/aOq4F5FIK64
  if (pixelErrors > (BlocklyGames.LEVEL === 9 ? 600 :
      (BlocklyGames.LEVEL === 8 ? 350 : 100))) {
    // Too many errors.
    return false;
  }
  const blockCount = BlocklyInterface.workspace.getAllBlocks(false).length;
  if ((BlocklyGames.LEVEL <= 2 && blockCount > 3) ||
      (BlocklyGames.LEVEL === 3 && blockCount > 4) ||
      (BlocklyGames.LEVEL === 5 && blockCount > 10)) {
    // Use a loop, dummy.
    const content = BlocklyGames.getElementById('helpUseLoop');
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

BlocklyGames.callWhenLoaded(init);
