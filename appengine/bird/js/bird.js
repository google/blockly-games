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
goog.require('Bird.soy');
goog.require('Blockly.Trashcan');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.math');
goog.require('Blockly.utils.style');
goog.require('Blockly.VerticalFlyout');
goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');


BlocklyGames.NAME = 'bird';

/**
 * Milliseconds between each animation frame.
 */
Bird.stepSpeed;

Bird.BIRD_ICON_SIZE = 120;
Bird.NEST_ICON_SIZE = 100;
Bird.WORM_ICON_SIZE = 100;
Bird.MAP_SIZE = 400;
Bird.WALL_THICKNESS = 10;
Bird.FLAP_SPEED = 100; // ms.

/**
 * Object representing a line.
 * Copied from goog.math.Line
 * @param {number} x0 X coordinate of the start point.
 * @param {number} y0 Y coordinate of the start point.
 * @param {number} x1 X coordinate of the end point.
 * @param {number} y1 Y coordinate of the end point.
 * @struct
 * @final
 * @constructor
 */
Bird.Line = function(x0, y0, x1, y1) {
  /**
   * X coordinate of the first point.
   * @type {number}
   */
  this.x0 = x0;

  /**
   * Y coordinate of the first point.
   * @type {number}
   */
  this.y0 = y0;

  /**
   * X coordinate of the first control point.
   * @type {number}
   */
  this.x1 = x1;

  /**
   * Y coordinate of the first control point.
   * @type {number}
   */
  this.y1 = y1;
};

/**
 * Compute the distance between this line segment and the given coordinate.
 * @param {!Blockly.utils.Coordinate} xy Point to measure from.
 * @return {number} Distance from point to closest point on line segment.
 */
Bird.Line.prototype.distance = function(xy) {
  var a = xy.x - this.x0;
  var b = xy.y - this.y0;
  var c = this.x1 - this.x0;
  var d = this.y1 - this.y0;

  var dot = a * c + b * d;
  var lenSq = c * c + d * d;
  var param = lenSq ? dot / lenSq : -1;

  var closestPoint;
  if (param < 0) {
    closestPoint = new Blockly.utils.Coordinate(this.x0, this.y0);
  } else if (param > 1) {
    closestPoint = new Blockly.utils.Coordinate(this.x1, this.y1);
  } else {
    closestPoint =
        new Blockly.utils.Coordinate(this.x0 + param * c, this.y0 + param * d);
  }
  return Blockly.utils.Coordinate.distance(xy, closestPoint);
};

Bird.MAP = [
  // Level 0.
  undefined,
  // Level 1.
  {
    start: new Blockly.utils.Coordinate(20, 20),
    startAngle: 90,
    worm: new Blockly.utils.Coordinate(50, 50),
    nest: new Blockly.utils.Coordinate(80, 80),
    walls: []
  },
  // Level 2.
  {
    start: new Blockly.utils.Coordinate(20, 20),
    startAngle: 0,
    worm: new Blockly.utils.Coordinate(80, 20),
    nest: new Blockly.utils.Coordinate(80, 80),
    walls: [new Bird.Line(0, 50, 60, 50)]
  },
  // Level 3.
  {
    start: new Blockly.utils.Coordinate(20, 70),
    startAngle: 270,
    worm: new Blockly.utils.Coordinate(50, 20),
    nest: new Blockly.utils.Coordinate(80, 70),
    walls: [new Bird.Line(50, 50, 50, 100)]
  },
  // Level 4.
  {
    start: new Blockly.utils.Coordinate(20, 80),
    startAngle: 0,
    worm: null,
    nest: new Blockly.utils.Coordinate(80, 20),
    walls: [new Bird.Line(0, 0, 65, 65)]
  },
  // Level 5.
  {
    start: new Blockly.utils.Coordinate(80, 80),
    startAngle: 270,
    worm: null,
    nest: new Blockly.utils.Coordinate(20, 20),
    walls: [new Bird.Line(0, 100, 65, 35)]
  },
  // Level 6.
  {
    start: new Blockly.utils.Coordinate(20, 40),
    startAngle: 0,
    worm: new Blockly.utils.Coordinate(80, 20),
    nest: new Blockly.utils.Coordinate(20, 80),
    walls: [new Bird.Line(0, 59, 50, 59)]
  },
  // Level 7.
  {
    start: new Blockly.utils.Coordinate(80, 80),
    startAngle: 180,
    worm: new Blockly.utils.Coordinate(80, 20),
    nest: new Blockly.utils.Coordinate(20, 20),
    walls: [
      new Bird.Line(0, 70, 40, 70),
      new Bird.Line(70, 50, 100, 50)
    ]
  },
  // Level 8.
  {
    start: new Blockly.utils.Coordinate(20, 25),
    startAngle: 90,
    worm: new Blockly.utils.Coordinate(80, 25),
    nest: new Blockly.utils.Coordinate(80, 75),
    walls: [
      new Bird.Line(50, 0, 50, 25),
      new Bird.Line(75, 50, 100, 50),
      new Bird.Line(50, 100, 50, 75),
      new Bird.Line(0, 50, 25, 50)
    ]
  },
  // Level 9.
  {
    start: new Blockly.utils.Coordinate(80, 70),
    startAngle: 180,
    worm: new Blockly.utils.Coordinate(20, 20),
    nest: new Blockly.utils.Coordinate(80, 20),
    walls: [
      new Bird.Line(0, 69, 31, 100),
      new Bird.Line(40, 50, 71, 0),
      new Bird.Line(80, 50, 100, 50)
    ]
  },
  // Level 10.
  {
    start: new Blockly.utils.Coordinate(20, 20),
    startAngle: 90,
    worm: new Blockly.utils.Coordinate(80, 50),
    nest: new Blockly.utils.Coordinate(20, 20),
    walls: [
      new Bird.Line(40, 60, 60, 60),
      new Bird.Line(40, 60, 60, 30),
      new Bird.Line(60, 30, 100, 30)
    ]
  }
][BlocklyGames.LEVEL];

/**
 * PIDs of animation tasks currently executing.
 */
Bird.pidList = [];

/**
 * Behaviour for the bird.
 * @enum {number}
 */
Bird.Pose = {
  SOAR: 1,
  FLAP: 2,
  SIT: 3
};

/**
 * Create and layout all the nodes for the walls, nest, worm, and bird.
 */
Bird.drawMap = function() {
  var svg = document.getElementById('svgBird');

  // Add four surrounding walls.
  var edge0 = -Bird.WALL_THICKNESS / 2;
  var edge1 = 100 + Bird.WALL_THICKNESS / 2;
  Bird.MAP.walls.push(
      new Bird.Line(edge0, edge0, edge0, edge1),
      new Bird.Line(edge0, edge1, edge1, edge1),
      new Bird.Line(edge1, edge1, edge1, edge0),
      new Bird.Line(edge1, edge0, edge0, edge0));

  // Draw the walls.
  for (var i = 0, wall; (wall = Bird.MAP.walls[i]); i++) {
    Blockly.utils.dom.createSvgElement('line', {
        'x1': wall.x0 / 100 * Bird.MAP_SIZE,
        'y1': (1 - wall.y0 / 100) * Bird.MAP_SIZE,
        'x2': wall.x1 / 100 * Bird.MAP_SIZE,
        'y2': (1 - wall.y1 / 100) * Bird.MAP_SIZE,
        'stroke': '#CCB',
        'stroke-width': Bird.WALL_THICKNESS,
        'stroke-linecap': 'round'
      }, svg);
  }

  // Add nest.
  var nestImage = Blockly.utils.dom.createSvgElement('image', {
      'id': 'nest',
      'height': Bird.NEST_ICON_SIZE,
      'width': Bird.NEST_ICON_SIZE
    }, svg);
  nestImage.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
      'bird/nest.png');

  // Add worm.
  if (Bird.MAP.worm) {
    var wormImage = Blockly.utils.dom.createSvgElement('image', {
        'id': 'worm',
        'height': Bird.WORM_ICON_SIZE,
        'width': Bird.WORM_ICON_SIZE
      }, svg);
    wormImage.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
        'bird/worm.png');
  }

  // Bird's clipPath element, whose (x, y) is reset by Bird.displayBird
  var birdClip = Blockly.utils.dom.createSvgElement('clipPath', {
      'id': 'birdClipPath'
    }, svg);
  Blockly.utils.dom.createSvgElement('rect', {
      'id': 'clipRect',
      'height': Bird.BIRD_ICON_SIZE,
      'width': Bird.BIRD_ICON_SIZE
    }, birdClip);

  // Add bird.
  var birdIcon = Blockly.utils.dom.createSvgElement('image', {
      'id': 'bird',
      'height': Bird.BIRD_ICON_SIZE * 4,  // 120 * 4 = 480
      'width': Bird.BIRD_ICON_SIZE * 12,  // 120 * 12 = 1440
      'clip-path': 'url(#birdClipPath)'
    }, svg);
  birdIcon.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
      'bird/birds-120.png');

  // Draw the outer square.
  Blockly.utils.dom.createSvgElement('rect', {
      'class': 'edges',
      'height': Bird.MAP_SIZE,
      'width': Bird.MAP_SIZE
    }, svg);

  var xAxis = BlocklyGames.LEVEL > 3;
  var yAxis = BlocklyGames.LEVEL > 4;

  var TICK_LENGTH = 9;
  var major = 1;
  for (var i = 0.1; i < 0.9; i += 0.1) {
    if (xAxis) {
      // Bottom edge.
      Blockly.utils.dom.createSvgElement('line', {
          'class': 'edges',
          'x1': i * Bird.MAP_SIZE,
          'y1': Bird.MAP_SIZE,
          'x2': i * Bird.MAP_SIZE,
          'y2': Bird.MAP_SIZE - TICK_LENGTH * major
        }, svg);
    }
    if (yAxis) {
      // Left edge.
      Blockly.utils.dom.createSvgElement('line', {
          'class': 'edges',
          'x1': 0,
          'y1': i * Bird.MAP_SIZE,
          'x2': i * TICK_LENGTH * major,
          'y2': i * Bird.MAP_SIZE
        }, svg);
    }
    if (major == 2) {
      if (xAxis) {
        // X axis.
        var number = Blockly.utils.dom.createSvgElement('text', {
            'class': 'edgeX',
            'x': i * Bird.MAP_SIZE + 2,
            'y': Bird.MAP_SIZE - 4
          }, svg);
        number.appendChild(document.createTextNode(Math.round(i * 100)));
      }
      if (yAxis) {
        // Y axis.
        var number = Blockly.utils.dom.createSvgElement('text', {
            'class': 'edgeY',
            'x': 3,
            'y': i * Bird.MAP_SIZE - 2
          }, svg);
        number.appendChild(document.createTextNode(Math.round(100 - i * 100)));
      }
    }
    major = major == 1 ? 2 : 1;
  }
};

/**
 * Initialize Blockly and the bird.  Called on page load.
 */
Bird.init = function() {
  // Render the Soy template.
  document.body.innerHTML = Bird.soy.start({}, null,
      {lang: BlocklyGames.LANG,
       level: BlocklyGames.LEVEL,
       maxLevel: BlocklyGames.MAX_LEVEL,
       html: BlocklyGames.IS_HTML});

  BlocklyInterface.init();

  var rtl = BlocklyGames.isRtl();
  var blocklyDiv = document.getElementById('blockly');
  var visualization = document.getElementById('visualization');
  var onresize = function(_e) {
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

  Bird.drawMap();

  var defaultXml;
  if (BlocklyGames.LEVEL == 1) {
    defaultXml = '<xml><block type="bird_heading" x="70" y="70"></block></xml>';
  } else if (BlocklyGames.LEVEL < 5) {
    defaultXml = '<xml><block type="bird_ifElse" x="70" y="70"></block></xml>';
  } else {
    defaultXml = '<xml><block type="controls_if" x="70" y="70"></block></xml>';
  }
  BlocklyInterface.loadBlocks(defaultXml, false);

  Bird.reset(true);

  BlocklyGames.bindClick('runButton', Bird.runButtonClick);
  BlocklyGames.bindClick('resetButton', Bird.resetButtonClick);

  // Open interactive help.  But wait 5 seconds for the
  // user to think a bit before they are told what to do.
  setTimeout(function() {
    BlocklyInterface.workspace.addChangeListener(function() {Bird.levelHelp();});
    Bird.levelHelp();
  }, 5000);
  if (BlocklyGames.LEVEL > 8) {
    setTimeout(BlocklyDialogs.abortOffer, 5 * 60 * 1000);
  }

  // Lazy-load the JavaScript interpreter.
  BlocklyInterface.importInterpreter();
  // Lazy-load the syntax-highlighting.
  BlocklyInterface.importPrettify();
};

window.addEventListener('load', Bird.init);

/**
 * PID of task to poll the mutator's state in level 5.
 * @private
 */
Bird.mutatorHelpPid_ = 0;

/**
 * When the workspace changes, update the help as needed.
 */
Bird.levelHelp = function() {
  if (BlocklyInterface.workspace.isDragging()) {
    // Don't change helps during drags.
    return;
  } else if (BlocklyGames.loadFromLocalStorage(BlocklyGames.NAME,
                                               BlocklyGames.LEVEL)) {
    // The user has already won.  They are just playing around.
    return;
  }
  var rtl = BlocklyGames.isRtl();
  var userBlocks = Blockly.Xml.domToText(
      Blockly.Xml.workspaceToDom(BlocklyInterface.workspace));
  var toolbar = BlocklyInterface.workspace.flyout_.workspace_.getTopBlocks(true);
  var content = document.getElementById('dialogHelp');
  var origin = null;
  var style = null;
  if (BlocklyGames.LEVEL == 1) {
    if ((userBlocks.indexOf('>90<') != -1 ||
        userBlocks.indexOf('bird_heading') == -1) &&
        !Blockly.WidgetDiv.isVisible()) {
      style = {'width': '370px', 'top': '140px'};
      style[rtl ? 'right' : 'left'] = '215px';
      var blocks = BlocklyInterface.workspace.getTopBlocks(true);
      if (blocks.length) {
        origin = blocks[0].getSvgRoot();
      } else {
        origin = toolbar[0].getSvgRoot();
      }
    }
  } else if (BlocklyGames.LEVEL == 2) {
    if (userBlocks.indexOf('bird_noWorm') == -1) {
      style = {'width': '350px', 'top': '170px'};
      style[rtl ? 'right' : 'left'] = '180px';
      origin = toolbar[1].getSvgRoot();
    }
  } else if (BlocklyGames.LEVEL == 4) {
    if (userBlocks.indexOf('bird_compare') == -1) {
      style = {'width': '350px', 'top': '230px'};
      style[rtl ? 'right' : 'left'] = '180px';
      origin = toolbar[2].getSvgRoot();
    }
  } else if (BlocklyGames.LEVEL == 5) {
    if (!Bird.mutatorHelpPid_) {
      // Keep polling the mutator's state.
      Bird.mutatorHelpPid_ = setInterval(Bird.levelHelp, 100);
    }
    if (userBlocks.indexOf('mutation else') == -1) {
      var blocks = BlocklyInterface.workspace.getTopBlocks(false);
      for (var i = 0, block; (block = blocks[i]); i++) {
        if (block.type == 'controls_if') {
          break;
        }
      }
      if (!block.mutator.isVisible()) {
        var xy = Blockly.utils.style.getPageOffset(block.getSvgRoot());
        style = {'width': '340px', 'top': (xy.y + 100) + 'px'};
        style.left = (xy.x - (rtl ? 280 : 0)) + 'px';
        origin = block.getSvgRoot();
      } else {
        content = document.getElementById('dialogMutatorHelp');
        // Second help box should be below the 'else' block in the mutator.
        // Really fragile code.  There is no public API for this.
        origin = block.mutator.workspace_.flyout_.mats_[1];
        var xy = Blockly.utils.style.getPageOffset(origin);
        style = {'width': '340px', 'top': (xy.y + 60) + 'px'};
        style.left = (xy.x - (rtl ? 310 : 0)) + 'px';
      }
    }
  } else if (BlocklyGames.LEVEL == 6) {
    if (userBlocks.indexOf('mutation') == -1) {
      var blocks = BlocklyInterface.workspace.getTopBlocks(false);
      for (var i = 0, block; (block = blocks[i]); i++) {
        if (block.type == 'controls_if') {
          break;
        }
      }
      var xy = Blockly.utils.style.getPageOffset(block.getSvgRoot());
      style = {'width': '350px', 'top': (xy.y + 220) + 'px'};
      style.left = (xy.x - (rtl ? 350 : 0)) + 'px';
      origin = block.getSvgRoot();
    }
  } else if (BlocklyGames.LEVEL == 8) {
    if (userBlocks.indexOf('bird_and') == -1) {
      style = {'width': '350px', 'top': '360px'};
      style[rtl ? 'right' : 'left'] = '450px';
      origin = toolbar[4].getSvgRoot();
    }
  }
  if (style) {
    if (content.parentNode != document.getElementById('dialog')) {
      BlocklyDialogs.showDialog(content, origin, true, false, style, null);
    }
  } else {
    BlocklyDialogs.hideDialog(false);
  }
};

/**
 * Reset the bird to the start position and kill any pending animation tasks.
 * @param {boolean} first True if an opening animation is to be played.
 */
Bird.reset = function(first) {
  // Kill all tasks.
  for (var i = 0; i < Bird.pidList.length; i++) {
    clearTimeout(Bird.pidList[i]);
  }
  Bird.pidList = [];

  // Move Bird into position.
  Bird.pos = new Blockly.utils.Coordinate(Bird.MAP.start.x, Bird.MAP.start.y);
  Bird.angle = Bird.MAP.startAngle;
  Bird.currentAngle = Bird.angle;
  Bird.hasWorm = !Bird.MAP.worm;
  if (first) {
    // Opening animation.
    Bird.displayBird(Bird.Pose.SIT);
    Bird.pidList.push(setTimeout(function() {
      Bird.displayBird(Bird.Pose.FLAP);
      Bird.pidList.push(setTimeout(function() {
        Bird.displayBird(Bird.Pose.SOAR);
      }, 400));
    }, 400));
  } else {
    Bird.displayBird(Bird.Pose.SOAR);
  }


  // Move the worm into position.
  var image = document.getElementById('worm');
  if (image) {
    image.setAttribute('x',
        Bird.MAP.worm.x / 100 * Bird.MAP_SIZE - Bird.WORM_ICON_SIZE / 2);
    image.setAttribute('y',
        (1 - Bird.MAP.worm.y / 100) * Bird.MAP_SIZE - Bird.WORM_ICON_SIZE / 2);
    image.style.visibility = 'visible';
  }
  // Move the nest into position.
  var image = document.getElementById('nest');
  image.setAttribute('x',
      Bird.MAP.nest.x / 100 * Bird.MAP_SIZE - Bird.NEST_ICON_SIZE / 2);
  image.setAttribute('y',
      (1 - Bird.MAP.nest.y / 100) * Bird.MAP_SIZE - Bird.NEST_ICON_SIZE / 2);
};

/**
 * Click the run button.  Start the program.
 * @param {!Event} e Mouse or touch event.
 */
Bird.runButtonClick = function(e) {
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
  Bird.reset(false);
  Bird.execute();
};

/**
 * Click the reset button.  Reset the bird.
 * @param {!Event} e Mouse or touch event.
 */
Bird.resetButtonClick = function(e) {
  // Prevent double-clicks or double-taps.
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  var runButton = document.getElementById('runButton');
  runButton.style.display = 'inline';
  document.getElementById('resetButton').style.display = 'none';
  BlocklyInterface.workspace.highlightBlock(null);
  Bird.reset(false);
};

/**
 * Outcomes of running the user program.
 */
Bird.ResultType = {
  UNSET: 0,
  SUCCESS: 1,
  FAILURE: -1,
  TIMEOUT: 2,
  ERROR: -2
};

/**
 * Inject the Bird API into a JavaScript interpreter.
 * @param {!Interpreter} interpreter The JS-Interpreter.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Bird.initInterpreter = function(interpreter, globalObject) {
  // API
  var wrapper;
  wrapper = function(angle, id) {
    Bird.heading(angle, id);
  };
  interpreter.setProperty(globalObject, 'heading',
      interpreter.createNativeFunction(wrapper));
  wrapper = function() {
    return !Bird.hasWorm;
  };
  interpreter.setProperty(globalObject, 'noWorm',
      interpreter.createNativeFunction(wrapper));
  wrapper = function() {
    return Bird.pos.x;
  };
  interpreter.setProperty(globalObject, 'getX',
      interpreter.createNativeFunction(wrapper));
  wrapper = function() {
    return Bird.pos.y;
  };
  interpreter.setProperty(globalObject, 'getY',
      interpreter.createNativeFunction(wrapper));
};

/**
 * Execute the user's code.  Heaven help us...
 */
Bird.execute = function() {
  if (!('Interpreter' in window)) {
    // Interpreter lazy loads and hasn't arrived yet.  Try again later.
    setTimeout(Bird.execute, 250);
    return;
  }

  Bird.log = [];
  Blockly.selected && Blockly.selected.unselect();
  var code = BlocklyInterface.getJsCode();
  BlocklyInterface.executedJsCode = code;
  BlocklyInterface.executedCode = BlocklyInterface.getCode();
  var start = code.indexOf('if (');
  var end = code.indexOf('}\n');
  if (start != -1 && end != -1) {
    // Ugly hack: if there is an 'if' statement, ignore isolated heading blocks.
    code = code.substring(start, end + 2);
  }
  code = 'while(true) {\n' +
      code +
      '}';
  var result = Bird.ResultType.UNSET;
  var interpreter = new Interpreter(code, Bird.initInterpreter);

  // Try running the user's code.  There are four possible outcomes:
  // 1. If bird reaches the finish [SUCCESS], true is thrown.
  // 2. If the program is terminated due to running too long [TIMEOUT],
  //    false is thrown.
  // 3. If another error occurs [ERROR], that error is thrown.
  // 4. If the program ended normally but without finishing [FAILURE],
  //    no error or exception is thrown.
  try {
    var ticks = 100000;  // 100k ticks runs Bird for about 3 minutes.
    while (interpreter.step()) {
      if (ticks-- <= 0) {
        throw Infinity;
      }
    }
    result = Bird.ResultType.FAILURE;
  } catch (e) {
    // A boolean is thrown for normal termination.
    // Abnormal termination is a user error.
    if (e === Infinity) {
      result = Bird.ResultType.TIMEOUT;
    } else if (e === true) {
      result = Bird.ResultType.SUCCESS;
    } else if (e === false) {
      result = Bird.ResultType.ERROR;
    } else {
      // Syntax error, can't happen.
      result = Bird.ResultType.ERROR;
      window.alert(e);
    }
  }

  // Fast animation if execution is successful.  Slow otherwise.
  Bird.stepSpeed = (result == Bird.ResultType.SUCCESS) ? 10 : 15;

  // Bird.log now contains a transcript of all the user's actions.
  // Reset the bird and animate the transcript.
  Bird.reset(false);
  Bird.pidList.push(setTimeout(Bird.animate, 1));
};

/**
 * Iterate through the recorded path and animate the bird's actions.
 */
Bird.animate = function() {
  // All tasks should be complete now.  Clean up the PID list.
  Bird.pidList = [];

  var action = Bird.log.shift();
  if (!action) {
    BlocklyInterface.highlight(null);
    return;
  }
  BlocklyInterface.highlight(action.pop());

  if (action[0] == 'move' || action[0] == 'goto') {
    Bird.pos.x = action[1];
    Bird.pos.y = action[2];
    Bird.angle = action[3];
    Bird.displayBird(action[0] == 'move' ? Bird.Pose.FLAP : Bird.Pose.SOAR);
  } else if (action[0] == 'worm') {
    var worm = document.getElementById('worm');
    worm.style.visibility = 'hidden';
  } else if (action[0] == 'finish') {
    Bird.displayBird(Bird.Pose.SIT);
    BlocklyInterface.saveToLocalStorage();
    BlocklyDialogs.congratulations();
  } else if (action[0] == 'play') {
    BlocklyInterface.workspace.getAudioManager().play(action[1], 0.5);
  }

  Bird.pidList.push(setTimeout(Bird.animate, Bird.stepSpeed * 5));
};

/**
 * Display bird at the current location, facing the current angle.
 * @param {!Bird.Pose} pose Set new pose.
 */
Bird.displayBird = function(pose) {
  var diff = BlocklyGames.normalizeAngle(Bird.currentAngle - Bird.angle);
  if (diff > 180) {
    diff -= 360;
  }
  var step = 10;
  if (Math.abs(diff) <= step) {
    Bird.currentAngle = Bird.angle;
  } else {
    Bird.currentAngle = BlocklyGames.normalizeAngle(Bird.currentAngle +
        (diff < 0 ? step : -step));
  }
  // Divide into 12 quads.
  var quad = (14 - Math.round(Bird.currentAngle / 360 * 12)) % 12;
  var quadAngle = 360 / 12;  // 30.
  var remainder = Bird.currentAngle % quadAngle;
  if (remainder >= quadAngle / 2) {
    remainder -= quadAngle;
  }
  remainder *= -1;

  var row;
  if (pose == Bird.Pose.SOAR) {
    row = 0;
  } else if (pose == Bird.Pose.SIT) {
    row = 3;
  } else if (pose == Bird.Pose.FLAP) {
    row = Math.round(Date.now() / Bird.FLAP_SPEED) % 3;
  } else {
    throw Error('Unknown pose.');
  }

  var x = Bird.pos.x / 100 * Bird.MAP_SIZE - Bird.BIRD_ICON_SIZE / 2;
  var y = (1 - Bird.pos.y / 100) * Bird.MAP_SIZE - Bird.BIRD_ICON_SIZE / 2;
  var birdIcon = document.getElementById('bird');
  birdIcon.setAttribute('x', x - quad * Bird.BIRD_ICON_SIZE);
  birdIcon.setAttribute('y', y - row * Bird.BIRD_ICON_SIZE);
  birdIcon.setAttribute('transform', 'rotate(' + remainder + ', ' +
      (x + Bird.BIRD_ICON_SIZE / 2) + ', ' +
      (y + Bird.BIRD_ICON_SIZE / 2) + ')');

  var clipRect = document.getElementById('clipRect');
  clipRect.setAttribute('x', x);
  clipRect.setAttribute('y', y);
};

/**
 * Has the bird intersected the nest?
 * @return {boolean} True if the bird found the nest, false otherwise.
 */
Bird.intersectNest = function() {
  var accuracy = 0.5 * Bird.BIRD_ICON_SIZE / Bird.MAP_SIZE * 100;
  return Blockly.utils.Coordinate.distance(Bird.pos, Bird.MAP.nest) < accuracy;
};

/**
 * Has the bird intersected the worm?
 * @return {boolean} True if the bird found the worm, false otherwise.
 */
Bird.intersectWorm = function() {
  if (Bird.MAP.worm) {
    var accuracy = 0.5 * Bird.BIRD_ICON_SIZE / Bird.MAP_SIZE * 100;
    return Blockly.utils.Coordinate.distance(Bird.pos, Bird.MAP.worm) < accuracy;
  }
  return false;
};

/**
 * Has the bird intersected a wall?
 * @return {boolean} True if the bird hit a wall, false otherwise.
 */
Bird.intersectWall = function() {
  var accuracy = 0.2 * Bird.BIRD_ICON_SIZE / Bird.MAP_SIZE * 100;
  for (var i = 0, wall; (wall = Bird.MAP.walls[i]); i++) {
    if (wall.distance(Bird.pos) < accuracy) {
      return true;
    }
  }
  return false;
};

/**
 * Move the bird to the given point.
 * @param {!Blockly.utils.Coordinate} p Coordinate of point.
 */
Bird.gotoPoint = function(p) {
  var steps = Math.round(Blockly.utils.Coordinate.distance(Bird.pos, p));
  var angleDegrees = Bird.pointsToAngle(Bird.pos.x, Bird.pos.y, p.x, p.y);
  var angleRadians = Blockly.utils.math.toRadians(angleDegrees);
  for (var i = 0; i < steps; i++) {
    Bird.pos.x += Math.cos(angleRadians);
    Bird.pos.y += Math.sin(angleRadians);
    Bird.log.push(['goto', Bird.pos.x, Bird.pos.y, angleDegrees, null]);
  }
};

/**
 * Computes the angle between two points (x1,y1) and (x2,y2).
 * Angle zero points in the +X direction, 90 degrees points in the +Y
 * direction (down) and from there we grow clockwise towards 360 degrees.
 * Copied from Closure's goog.math.angle.
 * @param {number} x1 x of first point.
 * @param {number} y1 y of first point.
 * @param {number} x2 x of second point.
 * @param {number} y2 y of second point.
 * @return {number} Standardized angle in degrees of the vector from
 *     x1,y1 to x2,y2.
 */
Bird.pointsToAngle = function(x1, y1, x2, y2) {
  var angle = Blockly.utils.math.toDegrees(Math.atan2(y2 - y1, x2 - x1));
  return BlocklyGames.normalizeAngle(angle);
};

/**
 * Attempt to move the bird in the specified direction.
 * @param {number} angle Direction to move (0 = east, 90 = north).
 * @param {string} id ID of block that triggered this action.
 * @throws {true} If the nest is reached.
 * @throws {false} If the bird collides with a wall.
 */
Bird.heading = function(angle, id) {
  var angleRadians = Blockly.utils.math.toRadians(angle);
  Bird.pos.x += Math.cos(angleRadians);
  Bird.pos.y += Math.sin(angleRadians);
  Bird.angle = angle;
  Bird.log.push(['move', Bird.pos.x, Bird.pos.y, Bird.angle, id]);
  if (Bird.hasWorm && Bird.intersectNest()) {
    // Finished.  Terminate the user's program.
    Bird.log.push(['play', 'quack', null]);
    Bird.gotoPoint(Bird.MAP.nest);
    Bird.log.push(['finish', null]);
    throw true;
  }
  if (!Bird.hasWorm && Bird.intersectWorm()) {
    Bird.gotoPoint(Bird.MAP.worm);
    Bird.log.push(['worm', null]);
    Bird.log.push(['play', 'worm', null]);
    Bird.hasWorm = true;
  }
  if (Bird.intersectWall()) {
    Bird.log.push(['play', 'whack', null]);
    throw false;
  }
};
