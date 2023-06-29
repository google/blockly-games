/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for Bird game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Bird');

goog.require('Bird.Blocks');
goog.require('Bird.html');
goog.require('Blockly.JavaScript');
goog.require('Blockly.Trashcan');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.math');
goog.require('Blockly.utils.style');
goog.require('Blockly.VerticalFlyout');
goog.require('Blockly.Xml');
goog.require('BlocklyCode');
goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');


BlocklyGames.storageName = 'bird';

const BIRD_ICON_SIZE = 120;
const NEST_ICON_SIZE = 100;
const WORM_ICON_SIZE = 100;
const MAP_SIZE = 400;
const WALL_THICKNESS = 10;
const FLAP_SPEED = 100; // ms.

/**
 * Milliseconds between each animation frame.
 */
let stepSpeed;
let pos;
let angle;
let currentAngle;
let hasWorm;

/**
 * Log of duck's moves.  Recorded during execution, played back for animation.
 * @type !Array<!Array>
 */
const log = [];

/**
 * PIDs of animation tasks currently executing.
 * @type !Array<number>
 */
const pidList = [];

class Line {
  /**
   * Object representing a line.
   * Copied from goog.math.Line
   * @param {number} x0 X coordinate of the start point.
   * @param {number} y0 Y coordinate of the start point.
   * @param {number} x1 X coordinate of the end point.
   * @param {number} y1 Y coordinate of the end point.
   * @struct
   */
  constructor(x0, y0, x1, y1) {
    /**
     * X coordinate of the first point.
     * @type number
     */
    this.x0 = x0;

    /**
     * Y coordinate of the first point.
     * @type number
     */
    this.y0 = y0;

    /**
     * X coordinate of the first control point.
     * @type number
     */
    this.x1 = x1;

    /**
     * Y coordinate of the first control point.
     * @type number
     */
    this.y1 = y1;
  }

  /**
   * Compute the distance between this line segment and the given coordinate.
   * @param {!Blockly.utils.Coordinate} xy Point to measure from.
   * @returns {number} Distance from point to closest point on line segment.
   */
  distance(xy) {
    const a = xy.x - this.x0;
    const b = xy.y - this.y0;
    const c = this.x1 - this.x0;
    const d = this.y1 - this.y0;

    const dot = a * c + b * d;
    const lenSq = c * c + d * d;
    const param = lenSq ? dot / lenSq : -1;

    let closestPoint;
    if (param < 0) {
      closestPoint = new Blockly.utils.Coordinate(this.x0, this.y0);
    } else if (param > 1) {
      closestPoint = new Blockly.utils.Coordinate(this.x1, this.y1);
    } else {
      closestPoint =
          new Blockly.utils.Coordinate(this.x0 + param * c, this.y0 + param * d);
    }
    return Blockly.utils.Coordinate.distance(xy, closestPoint);
  }
}

const MAP = [
  // Level 1.
  {
    start: new Blockly.utils.Coordinate(20, 20),
    startAngle: 90,
    worm: new Blockly.utils.Coordinate(50, 50),
    nest: new Blockly.utils.Coordinate(80, 80),
    walls: [],
  },
  // Level 2.
  {
    start: new Blockly.utils.Coordinate(20, 20),
    startAngle: 0,
    worm: new Blockly.utils.Coordinate(80, 20),
    nest: new Blockly.utils.Coordinate(80, 80),
    walls: [new Line(0, 50, 60, 50)],
  },
  // Level 3.
  {
    start: new Blockly.utils.Coordinate(20, 70),
    startAngle: 270,
    worm: new Blockly.utils.Coordinate(50, 20),
    nest: new Blockly.utils.Coordinate(80, 70),
    walls: [new Line(50, 50, 50, 100)],
  },
  // Level 4.
  {
    start: new Blockly.utils.Coordinate(20, 80),
    startAngle: 0,
    worm: null,
    nest: new Blockly.utils.Coordinate(80, 20),
    walls: [new Line(0, 0, 65, 65)],
  },
  // Level 5.
  {
    start: new Blockly.utils.Coordinate(80, 80),
    startAngle: 270,
    worm: null,
    nest: new Blockly.utils.Coordinate(20, 20),
    walls: [new Line(0, 100, 65, 35)],
  },
  // Level 6.
  {
    start: new Blockly.utils.Coordinate(20, 40),
    startAngle: 0,
    worm: new Blockly.utils.Coordinate(80, 20),
    nest: new Blockly.utils.Coordinate(20, 80),
    walls: [new Line(0, 59, 50, 59)],
  },
  // Level 7.
  {
    start: new Blockly.utils.Coordinate(80, 80),
    startAngle: 180,
    worm: new Blockly.utils.Coordinate(80, 20),
    nest: new Blockly.utils.Coordinate(20, 20),
    walls: [
      new Line(0, 70, 40, 70),
      new Line(70, 50, 100, 50),
    ],
  },
  // Level 8.
  {
    start: new Blockly.utils.Coordinate(20, 25),
    startAngle: 90,
    worm: new Blockly.utils.Coordinate(80, 25),
    nest: new Blockly.utils.Coordinate(80, 75),
    walls: [
      new Line(50, 0, 50, 25),
      new Line(75, 50, 100, 50),
      new Line(50, 100, 50, 75),
      new Line(0, 50, 25, 50),
    ],
  },
  // Level 9.
  {
    start: new Blockly.utils.Coordinate(80, 70),
    startAngle: 180,
    worm: new Blockly.utils.Coordinate(20, 20),
    nest: new Blockly.utils.Coordinate(80, 20),
    walls: [
      new Line(0, 69, 31, 100),
      new Line(40, 50, 71, 0),
      new Line(80, 50, 100, 50),
    ],
  },
  // Level 10.
  {
    start: new Blockly.utils.Coordinate(20, 20),
    startAngle: 90,
    worm: new Blockly.utils.Coordinate(80, 50),
    nest: new Blockly.utils.Coordinate(20, 20),
    walls: [
      new Line(40, 60, 60, 60),
      new Line(40, 60, 60, 30),
      new Line(60, 30, 100, 30),
    ],
  }
][BlocklyGames.LEVEL - 1];

/**
 * Behaviour for the bird.
 * @enum {number}
 */
const Pose = {
  SOAR: 1,
  FLAP: 2,
  SIT: 3,
};

/**
 * Create and layout all the nodes for the walls, nest, worm, and bird.
 */
function drawMap() {
  const svg = BlocklyGames.getElementById('svgBird');

  // Add four surrounding walls.
  const edge0 = -WALL_THICKNESS / 2;
  const edge1 = 100 + WALL_THICKNESS / 2;
  MAP.walls.push(
      new Line(edge0, edge0, edge0, edge1),
      new Line(edge0, edge1, edge1, edge1),
      new Line(edge1, edge1, edge1, edge0),
      new Line(edge1, edge0, edge0, edge0));

  // Draw the walls.
  for (const wall of MAP.walls) {
    Blockly.utils.dom.createSvgElement('line', {
        'x1': wall.x0 / 100 * MAP_SIZE,
        'y1': (1 - wall.y0 / 100) * MAP_SIZE,
        'x2': wall.x1 / 100 * MAP_SIZE,
        'y2': (1 - wall.y1 / 100) * MAP_SIZE,
        'stroke': '#CCB',
        'stroke-width': WALL_THICKNESS,
        'stroke-linecap': 'round',
      }, svg);
  }

  // Add nest.
  const nestImage = Blockly.utils.dom.createSvgElement('image', {
      'id': 'nest',
      'height': NEST_ICON_SIZE,
      'width': NEST_ICON_SIZE,
    }, svg);
  nestImage.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
      'bird/nest.png');

  // Add worm.
  if (MAP.worm) {
    const wormGroup = Blockly.utils.dom.createSvgElement('g', {
        'id': 'worm',
      }, svg);
    const wormImage = Blockly.utils.dom.createSvgElement('image', {
        'height': WORM_ICON_SIZE,
        'width': WORM_ICON_SIZE,
      }, wormGroup);
    wormImage.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
        'bird/worm.png');
  }

  // Bird's clipPath element, whose (x, y) is reset by displayBird
  const birdClip = Blockly.utils.dom.createSvgElement('clipPath', {
      'id': 'birdClipPath'
    }, svg);
  Blockly.utils.dom.createSvgElement('rect', {
      'id': 'clipRect',
      'height': BIRD_ICON_SIZE,
      'width': BIRD_ICON_SIZE,
    }, birdClip);

  // Add bird.
  const birdIcon = Blockly.utils.dom.createSvgElement('image', {
      'id': 'bird',
      'height': BIRD_ICON_SIZE * 4,  // 120 * 4 = 480
      'width': BIRD_ICON_SIZE * 12,  // 120 * 12 = 1440
      'clip-path': 'url(#birdClipPath)',
    }, svg);
  birdIcon.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
      'bird/birds-120.png');

  // Draw the outer square.
  Blockly.utils.dom.createSvgElement('rect', {
      'class': 'edges',
      'height': MAP_SIZE,
      'width': MAP_SIZE,
    }, svg);

  const xAxis = BlocklyGames.LEVEL > 3;
  const yAxis = BlocklyGames.LEVEL > 4;

  const TICK_LENGTH = 9;
  let major = 1;
  for (let i = 0.1; i < 0.9; i += 0.1) {
    if (xAxis) {
      // Bottom edge.
      Blockly.utils.dom.createSvgElement('line', {
          'class': 'edges',
          'x1': i * MAP_SIZE,
          'y1': MAP_SIZE,
          'x2': i * MAP_SIZE,
          'y2': MAP_SIZE - TICK_LENGTH * major,
        }, svg);
    }
    if (yAxis) {
      // Left edge.
      Blockly.utils.dom.createSvgElement('line', {
          'class': 'edges',
          'x1': 0,
          'y1': i * MAP_SIZE,
          'x2': i * TICK_LENGTH * major,
          'y2': i * MAP_SIZE,
        }, svg);
    }
    if (major === 2) {
      if (xAxis) {
        // X axis.
        const number = Blockly.utils.dom.createSvgElement('text', {
            'class': 'edgeX',
            'x': i * MAP_SIZE + 2,
            'y': MAP_SIZE - 4,
          }, svg);
        number.appendChild(document.createTextNode(Math.round(i * 100)));
      }
      if (yAxis) {
        // Y axis.
        const number = Blockly.utils.dom.createSvgElement('text', {
            'class': 'edgeY',
            'x': 3,
            'y': i * MAP_SIZE - 2,
          }, svg);
        number.appendChild(document.createTextNode(Math.round(100 - i * 100)));
      }
    }
    major = (major === 1) ? 2 : 1;
  }
}

/**
 * Initialize Blockly and the bird.  Called on page load.
 */
function init() {
  Bird.Blocks.init();

  // Render the HTML.
  document.body.innerHTML = Bird.html.start(
      {lang: BlocklyGames.LANG,
       level: BlocklyGames.LEVEL,
       maxLevel: BlocklyGames.MAX_LEVEL,
       html: BlocklyGames.IS_HTML});

  BlocklyInterface.init(BlocklyGames.getMsg('Games.bird', false));

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

  BlocklyInterface.injectBlockly(
      {'rtl': rtl,
       'trashcan': true});
  BlocklyInterface.workspace.getAudioManager().load(
      ['bird/quack.ogg', 'bird/quack.mp3'], 'quack');
  BlocklyInterface.workspace.getAudioManager().load(
      ['bird/whack.mp3', 'bird/whack.ogg'], 'whack');
  BlocklyInterface.workspace.getAudioManager().load(
      ['bird/worm.mp3', 'bird/worm.ogg'], 'worm');
  if (BlocklyGames.LEVEL > 1) {
    BlocklyInterface.workspace.addChangeListener(Blockly.Events.disableOrphans);
  }
  // Not really needed, there are no user-defined functions or variables.
  Blockly.JavaScript.addReservedWords('noWorm,heading,getX,getY');

  drawMap();

  let blockType;
  if (BlocklyGames.LEVEL === 1) {
    blockType = 'bird_heading';
  } else if (BlocklyGames.LEVEL < 5) {
    blockType = 'bird_ifElse';
  } else {
    blockType = 'controls_if';
  }
  BlocklyInterface.loadBlocks(
      `<xml><block type="${blockType}" x="70" y="70" deletable="false"></block></xml>`, false);

  reset(true);

  BlocklyGames.bindClick('runButton', runButtonClick);
  BlocklyGames.bindClick('resetButton', resetButtonClick);

  // Open interactive help.  But wait 5 seconds for the
  // user to think a bit before they are told what to do.
  setTimeout(function() {
    BlocklyInterface.workspace.addChangeListener(levelHelp);
    levelHelp();
  }, 5000);
  if (BlocklyGames.LEVEL > 8) {
    setTimeout(BlocklyDialogs.abortOffer, 5 * 60 * 1000);
  }

  // Lazy-load the JavaScript interpreter.
  BlocklyCode.importInterpreter();
  // Lazy-load the syntax-highlighting.
  BlocklyCode.importPrettify();
}

/**
 * PID of task to poll the mutator's state in level 5.
 * @private
 */
let mutatorHelpPid_ = 0;

/**
 * When the workspace changes, update the help as needed.
 */
function levelHelp() {
  if (BlocklyInterface.workspace.isDragging()) {
    // Don't change helps during drags.
    return;
  } else if (BlocklyGames.loadFromLocalStorage(BlocklyGames.storageName,
                                               BlocklyGames.LEVEL)) {
    // The user has already won.  They are just playing around.
    return;
  }
  const rtl = BlocklyGames.IS_RTL;
  const userBlocks = Blockly.Xml.domToText(
      Blockly.Xml.workspaceToDom(BlocklyInterface.workspace));
  const toolbar =
      BlocklyInterface.workspace.getFlyout().getWorkspace().getTopBlocks(true);
  let content = BlocklyGames.getElementById('dialogHelp' + BlocklyGames.LEVEL);
  let origin = null;
  let style = null;
  if (BlocklyGames.LEVEL === 1) {
    if ((userBlocks.includes('>90<') ||
        !userBlocks.includes('bird_heading')) &&
        !Blockly.WidgetDiv.isVisible()) {
      style = {'width': '370px', 'top': '140px'};
      style[rtl ? 'right' : 'left'] = '215px';
      const blocks = BlocklyInterface.workspace.getTopBlocks(true);
      origin = (blocks.length ? blocks : toolbar)[0].getSvgRoot();
    }
  } else if (BlocklyGames.LEVEL === 2) {
    if (!userBlocks.includes('bird_noWorm')) {
      style = {'width': '350px', 'top': '170px'};
      style[rtl ? 'right' : 'left'] = '180px';
      origin = toolbar[1].getSvgRoot();
    }
  } else if (BlocklyGames.LEVEL === 4) {
    if (!userBlocks.includes('bird_compare')) {
      style = {'width': '350px', 'top': '230px'};
      style[rtl ? 'right' : 'left'] = '180px';
      origin = toolbar[2].getSvgRoot();
    }
  } else if (BlocklyGames.LEVEL === 5) {
    if (!mutatorHelpPid_) {
      // Keep polling the mutator's state.
      mutatorHelpPid_ = setInterval(levelHelp, 100);
    }
    if (!userBlocks.includes('mutation else')) {
      const blocks = BlocklyInterface.workspace.getTopBlocks(false);
      let block;
      for (block of blocks) {
        if (block.type === 'controls_if') {
          break;
        }
      }
      if (!block.mutator.isVisible()) {
        const xy = Blockly.utils.style.getPageOffset(block.getSvgRoot());
        style = {'width': '340px', 'top': (xy.y + 100) + 'px'};
        style.left = (xy.x - (rtl ? 280 : 0)) + 'px';
        origin = block.getSvgRoot();
      } else {
        content = BlocklyGames.getElementById('dialogMutatorHelp');
        // Second help box should be below the 'else' block in the mutator.
        origin = block.mutator.getWorkspace().getFlyout().getWorkspace()
            .getTopBlocks(true)[1].getSvgRoot();
        const xy = Blockly.utils.style.getPageOffset(origin);
        style = {'width': '340px', 'top': (xy.y + 60) + 'px'};
        style.left = (xy.x - (rtl ? 310 : 0)) + 'px';
      }
    }
  } else if (BlocklyGames.LEVEL === 6) {
    if (!userBlocks.includes('mutation')) {
      const blocks = BlocklyInterface.workspace.getTopBlocks(false);
      let block;
      for (block of blocks) {
        if (block.type === 'controls_if') {
          break;
        }
      }
      const xy = Blockly.utils.style.getPageOffset(block.getSvgRoot());
      style = {'width': '350px', 'top': (xy.y + 220) + 'px'};
      style.left = (xy.x - (rtl ? 350 : 0)) + 'px';
      origin = block.getSvgRoot();
    }
  } else if (BlocklyGames.LEVEL === 8) {
    if (!userBlocks.includes('bird_and')) {
      style = {'width': '350px', 'top': '360px'};
      style[rtl ? 'right' : 'left'] = '450px';
      origin = toolbar[4].getSvgRoot();
    }
  }
  if (content && style) {
    if (content.parentNode !== BlocklyGames.getElementById('dialog')) {
      BlocklyDialogs.showDialog(content, origin, true, false, style, null);
    }
  } else {
    BlocklyDialogs.hideDialog(false);
  }
}

/**
 * Reset the bird to the start position and kill any pending animation tasks.
 * @param {boolean} first True if an opening animation is to be played.
 */
function reset(first) {
  // Kill all tasks.
  pidList.forEach(clearTimeout);
  pidList.length = 0;

  // Move Bird into position.
  pos = new Blockly.utils.Coordinate(MAP.start.x, MAP.start.y);
  angle = MAP.startAngle;
  currentAngle = angle;
  hasWorm = !MAP.worm;
  if (first) {
    // Opening animation.
    displayBird(Pose.SIT);
    pidList.push(setTimeout(function() {
      displayBird(Pose.FLAP);
      pidList.push(setTimeout(function() {
        displayBird(Pose.SOAR);
      }, 400));
    }, 400));
  } else {
    displayBird(Pose.SOAR);
  }


  // Move the worm into position.
  const wormGroup = BlocklyGames.getElementById('worm');
  if (wormGroup) {
    const x = MAP.worm.x / 100 * MAP_SIZE - WORM_ICON_SIZE / 2;
    const y = (1 - MAP.worm.y / 100) * MAP_SIZE - WORM_ICON_SIZE / 2;
    wormGroup.setAttribute('transform', `translate(${x} ${y})`);
    Blockly.utils.dom.removeClass(wormGroup, 'eaten');
  }
  // Move the nest into position.
  const nestImage = BlocklyGames.getElementById('nest');
  nestImage.setAttribute('x',
      MAP.nest.x / 100 * MAP_SIZE - NEST_ICON_SIZE / 2);
  nestImage.setAttribute('y',
      (1 - MAP.nest.y / 100) * MAP_SIZE - NEST_ICON_SIZE / 2);
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
  reset(false);
  execute();
}

/**
 * Click the reset button.  Reset the bird.
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
  BlocklyInterface.workspace.highlightBlock(null);
  reset(false);
}

/**
 * Outcomes of running the user program.
 */
const ResultType = {
  UNSET: 0,
  SUCCESS: 1,
  FAILURE: -1,
  TIMEOUT: 2,
  ERROR: -2,
};

/**
 * Inject the Bird API into a JavaScript interpreter.
 * @param {!Interpreter} interpreter The JS-Interpreter.
 * @param {!Interpreter.Object} globalObject Global object.
 */
function initInterpreter(interpreter, globalObject) {
  // API
  let wrapper;
  wrapper = function(angle, id) {
    heading(angle, id);
  };
  wrap('heading');

  wrapper = function() {
    return !hasWorm;
  };
  wrap('noWorm');

  wrapper = function() {
    return pos.x;
  };
  wrap('getX');

  wrapper = function() {
    return pos.y;
  };
  wrap('getY');

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

  log.length = 0;
  Blockly.selected && Blockly.selected.unselect();
  let code = BlocklyCode.getJsCode();
  BlocklyCode.executedJsCode = code;
  BlocklyInterface.executedCode = BlocklyInterface.getCode();
  const start = code.indexOf('if (');
  const end = code.indexOf('}\n');
  if (start !== -1 && end !== -1) {
    // Ugly hack: if there is an 'if' statement, ignore isolated heading blocks.
    code = code.substring(start, end + 2);
  }
  code = 'while(true) {\n' + code + '}';
  let result = ResultType.UNSET;
  const interpreter = new Interpreter(code, initInterpreter);

  // Try running the user's code.  There are four possible outcomes:
  // 1. If bird reaches the finish [SUCCESS], true is thrown.
  // 2. If the program is terminated due to running too long [TIMEOUT],
  //    false is thrown.
  // 3. If another error occurs [ERROR], that error is thrown.
  // 4. If the program ended normally but without finishing [FAILURE],
  //    no error or exception is thrown.
  try {
    let ticks = 100000;  // 100k ticks runs Bird for about 3 minutes.
    while (interpreter.step()) {
      if (ticks-- <= 0) {
        throw Infinity;
      }
    }
    result = ResultType.FAILURE;
  } catch (e) {
    // A boolean is thrown for normal termination.
    // Abnormal termination is a user error.
    if (e === Infinity) {
      result = ResultType.TIMEOUT;
    } else if (e === true) {
      result = ResultType.SUCCESS;
    } else if (e === false) {
      result = ResultType.ERROR;
    } else {
      // Syntax error, can't happen.
      result = ResultType.ERROR;
      window.alert(e);
    }
  }

  // Fast animation if execution is successful.  Slow otherwise.
  stepSpeed = (result === ResultType.SUCCESS) ? 10 : 15;

  // log now contains a transcript of all the user's actions.
  // Reset the bird and animate the transcript.
  reset(false);
  pidList.push(setTimeout(animate, 1));
}

/**
 * Iterate through the recorded path and animate the bird's actions.
 */
function animate() {
  // All tasks should be complete now.  Clean up the PID list.
  pidList.length = 0;

  const action = log.shift();
  if (!action) {
    BlocklyCode.highlight(null);
    return;
  }
  BlocklyCode.highlight(action.pop());

  if (action[0] === 'move' || action[0] === 'goto') {
    [, pos.x, pos.y, angle] = action;
    displayBird(action[0] === 'move' ? Pose.FLAP : Pose.SOAR);
  } else if (action[0] === 'worm') {
    Blockly.utils.dom.addClass(BlocklyGames.getElementById('worm'), 'eaten');
  } else if (action[0] === 'finish') {
    displayBird(Pose.SIT);
    BlocklyInterface.saveToLocalStorage();
    BlocklyCode.congratulations();
  } else if (action[0] === 'play') {
    BlocklyInterface.workspace.getAudioManager().play(action[1], 0.5);
  }

  pidList.push(setTimeout(animate, stepSpeed * 5));
}

/**
 * Display bird at the current location, facing the current angle.
 * @param {!Pose} pose Set new pose.
 */
function displayBird(pose) {
  let diff = BlocklyGames.normalizeAngle(currentAngle - angle);
  if (diff > 180) {
    diff -= 360;
  }
  const step = 10;
  if (Math.abs(diff) <= step) {
    currentAngle = angle;
  } else {
    currentAngle = BlocklyGames.normalizeAngle(currentAngle +
        (diff < 0 ? step : -step));
  }
  // Divide into 12 quads.
  const quad = (14 - Math.round(currentAngle / 360 * 12)) % 12;
  const quadAngle = 360 / 12;  // 30.
  let remainder = currentAngle % quadAngle;
  if (remainder >= quadAngle / 2) {
    remainder -= quadAngle;
  }
  remainder *= -1;

  let row;
  if (pose === Pose.SOAR) {
    row = 0;
  } else if (pose === Pose.SIT) {
    row = 3;
  } else if (pose === Pose.FLAP) {
    row = Math.round(Date.now() / FLAP_SPEED) % 3;
  } else {
    throw Error('Unknown pose.');
  }

  const x = pos.x / 100 * MAP_SIZE - BIRD_ICON_SIZE / 2;
  const y = (1 - pos.y / 100) * MAP_SIZE - BIRD_ICON_SIZE / 2;
  const birdIcon = BlocklyGames.getElementById('bird');
  birdIcon.setAttribute('x', x - quad * BIRD_ICON_SIZE);
  birdIcon.setAttribute('y', y - row * BIRD_ICON_SIZE);
  birdIcon.setAttribute('transform', 'rotate(' + remainder + ', ' +
      (x + BIRD_ICON_SIZE / 2) + ', ' +
      (y + BIRD_ICON_SIZE / 2) + ')');

  const clipRect = BlocklyGames.getElementById('clipRect');
  clipRect.setAttribute('x', x);
  clipRect.setAttribute('y', y);
}

/**
 * Has the bird intersected the nest?
 * @returns {boolean} True if the bird found the nest, false otherwise.
 */
function intersectNest() {
  const accuracy = 0.5 * BIRD_ICON_SIZE / MAP_SIZE * 100;
  return Blockly.utils.Coordinate.distance(pos, MAP.nest) < accuracy;
}

/**
 * Has the bird intersected the worm?
 * @returns {boolean} True if the bird found the worm, false otherwise.
 */
function intersectWorm() {
  if (MAP.worm) {
    const accuracy = 0.5 * BIRD_ICON_SIZE / MAP_SIZE * 100;
    return Blockly.utils.Coordinate.distance(pos, MAP.worm) < accuracy;
  }
  return false;
}

/**
 * Has the bird intersected a wall?
 * @returns {boolean} True if the bird hit a wall, false otherwise.
 */
function intersectWall() {
  const accuracy = 0.2 * BIRD_ICON_SIZE / MAP_SIZE * 100;
  for (const wall of MAP.walls) {
    if (wall.distance(pos) < accuracy) {
      return true;
    }
  }
  return false;
}

/**
 * Move the bird to the given point.
 * @param {!Blockly.utils.Coordinate} p Coordinate of point.
 */
function gotoPoint(p) {
  const steps = Math.round(Blockly.utils.Coordinate.distance(pos, p));
  const angleDegrees = pointsToAngle(pos.x, pos.y, p.x, p.y);
  const angleRadians = Blockly.utils.math.toRadians(angleDegrees);
  for (let i = 0; i < steps; i++) {
    pos.x += Math.cos(angleRadians);
    pos.y += Math.sin(angleRadians);
    log.push(['goto', pos.x, pos.y, angleDegrees, null]);
  }
}

/**
 * Computes the angle between two points (x1,y1) and (x2,y2).
 * Angle zero points in the +X direction, 90 degrees points in the +Y
 * direction (down) and from there we grow clockwise towards 360 degrees.
 * Copied from Closure's goog.math.angle.
 * @param {number} x1 x of first point.
 * @param {number} y1 y of first point.
 * @param {number} x2 x of second point.
 * @param {number} y2 y of second point.
 * @returns {number} Standardized angle in degrees of the vector from
 *     x1,y1 to x2,y2.
 */
function pointsToAngle(x1, y1, x2, y2) {
  const angle = Blockly.utils.math.toDegrees(Math.atan2(y2 - y1, x2 - x1));
  return BlocklyGames.normalizeAngle(angle);
}

/**
 * Attempt to move the bird in the specified direction.
 * @param {number} angle Direction to move (0 = east, 90 = north).
 * @param {string} id ID of block that triggered this action.
 * @throws {true} If the nest is reached.
 * @throws {false} If the bird collides with a wall.
 */
function heading(angle, id) {
  const angleRadians = Blockly.utils.math.toRadians(angle);
  pos.x += Math.cos(angleRadians);
  pos.y += Math.sin(angleRadians);
  angle = angle;
  log.push(['move', pos.x, pos.y, angle, id]);
  if (hasWorm && intersectNest()) {
    // Finished.  Terminate the user's program.
    log.push(['play', 'quack', null]);
    gotoPoint(MAP.nest);
    log.push(['finish', null]);
    throw true;
  }
  if (!hasWorm && intersectWorm()) {
    gotoPoint(MAP.worm);
    log.push(['worm', null]);
    log.push(['play', 'worm', null]);
    hasWorm = true;
  }
  if (intersectWall()) {
    log.push(['play', 'whack', null]);
    throw false;
  }
}

BlocklyGames.callWhenLoaded(init);
