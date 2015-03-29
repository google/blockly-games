/**
 * Blockly Games: Bird
 *
 * Copyright 2013 Google Inc.
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
 * @fileoverview JavaScript for Blockly's Bird application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Bird');

goog.require('Bird.soy');
goog.require('Bird.Blocks');
goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('goog.math');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Line');


BlocklyGames.NAME = 'bird';

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

Bird.MAP = [
  // Level 0.
  undefined,
  // Level 1.
  {
    start: new goog.math.Coordinate(20, 20),
    startAngle: 90,
    worm: new goog.math.Coordinate(50, 50),
    nest: new goog.math.Coordinate(80, 80),
    walls: []
  },
  // Level 2.
  {
    start: new goog.math.Coordinate(20, 20),
    startAngle: 0,
    worm: new goog.math.Coordinate(80, 20),
    nest: new goog.math.Coordinate(80, 80),
    walls: [new goog.math.Line(0, 50, 60, 50)]
  },
  // Level 3.
  {
    start: new goog.math.Coordinate(20, 70),
    startAngle: 270,
    worm: new goog.math.Coordinate(50, 20),
    nest: new goog.math.Coordinate(80, 70),
    walls: [new goog.math.Line(50, 50, 50, 100)]
  },
  // Level 4.
  {
    start: new goog.math.Coordinate(20, 80),
    startAngle: 0,
    worm: new goog.math.Coordinate(50, 80),
    nest: new goog.math.Coordinate(80, 20),
    walls: [new goog.math.Line(0, 0, 65, 65)]
  },
  // Level 5.
  {
    start: new goog.math.Coordinate(80, 80),
    startAngle: 270,
    worm: new goog.math.Coordinate(50, 20),
    nest: new goog.math.Coordinate(20, 20),
    walls: [new goog.math.Line(0, 100, 65, 35)]
  },
  // Level 6.
  {
    start: new goog.math.Coordinate(20, 40),
    startAngle: 0,
    worm: new goog.math.Coordinate(80, 20),
    nest: new goog.math.Coordinate(20, 80),
    walls: [new goog.math.Line(0, 59, 50, 59)]
  },
  // Level 7.
  {
    start: new goog.math.Coordinate(80, 80),
    startAngle: 180,
    worm: new goog.math.Coordinate(80, 20),
    nest: new goog.math.Coordinate(20, 20),
    walls: [
      new goog.math.Line(0, 70, 40, 70),
      new goog.math.Line(70, 50, 100, 50)
    ]
  },
  // Level 8.
  {
    start: new goog.math.Coordinate(20, 25),
    startAngle: 90,
    worm: new goog.math.Coordinate(80, 25),
    nest: new goog.math.Coordinate(80, 75),
    walls: [
      new goog.math.Line(50, 0, 50, 25),
      new goog.math.Line(75, 50, 100, 50)
    ]
  },
  // Level 9.
  {
    start: new goog.math.Coordinate(80, 70),
    startAngle: 180,
    worm: new goog.math.Coordinate(20, 20),
    nest: new goog.math.Coordinate(80, 20),
    walls: [
      new goog.math.Line(0, 69, 31, 100),
      new goog.math.Line(40, 50, 71, 0),
      new goog.math.Line(80, 50, 100, 50)
    ]
  },
  // Level 10.
  {
    start: new goog.math.Coordinate(20, 20),
    startAngle: 90,
    worm: new goog.math.Coordinate(80, 50),
    nest: new goog.math.Coordinate(20, 20),
    walls: [
      new goog.math.Line(40, 60, 60, 60),
      new goog.math.Line(40, 60, 60, 30),
      new goog.math.Line(60, 30, 100, 30)
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
 * Current behaviour.
 * @type Bird.Pose
 */
Bird.currentPose = Bird.Pose.SOAR;

/**
 * Create and layout all the nodes for the walls, nest, worm, and bird.
 */
Bird.drawMap = function() {
  var svg = document.getElementById('svgBird');

  // Add four surrounding walls.
  var edge0 = -Bird.WALL_THICKNESS / 2;
  var edge1 = 100 + Bird.WALL_THICKNESS / 2;
  Bird.MAP.walls.push(new goog.math.Line(edge0, edge0, edge0, edge1));
  Bird.MAP.walls.push(new goog.math.Line(edge0, edge1, edge1, edge1));
  Bird.MAP.walls.push(new goog.math.Line(edge1, edge1, edge1, edge0));
  Bird.MAP.walls.push(new goog.math.Line(edge1, edge0, edge0, edge0));

  // Draw the walls.
  for (var k = 0; k < Bird.MAP.walls.length; k++) {
    var wall = Bird.MAP.walls[k];
    var line = document.createElementNS(Blockly.SVG_NS, 'line');
    line.setAttribute('x1', wall.x0 / 100 * Bird.MAP_SIZE);
    line.setAttribute('y1', (1 - wall.y0 / 100) * Bird.MAP_SIZE);
    line.setAttribute('x2', wall.x1 / 100 * Bird.MAP_SIZE);
    line.setAttribute('y2', (1 - wall.y1 / 100) * Bird.MAP_SIZE);
    line.setAttribute('stroke', '#CCB');
    line.setAttribute('stroke-width', Bird.WALL_THICKNESS);
    line.setAttribute('stroke-linecap', 'round');
    svg.appendChild(line);
  }

  // Add nest.
  var image = document.createElementNS(Blockly.SVG_NS, 'image');
  image.setAttribute('id', 'nest');
  image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      'bird/nest.png');
  image.setAttribute('height', Bird.NEST_ICON_SIZE);
  image.setAttribute('width', Bird.NEST_ICON_SIZE);
  svg.appendChild(image);

  // Add worm.
  var image = document.createElementNS(Blockly.SVG_NS, 'image');
  image.setAttribute('id', 'worm');
  image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      'bird/worm.png');
  image.setAttribute('height', Bird.WORM_ICON_SIZE);
  image.setAttribute('width', Bird.WORM_ICON_SIZE);
  svg.appendChild(image);

  // Bird's clipPath element, whose (x, y) is reset by Bird.displayBird
  var birdClip = document.createElementNS(Blockly.SVG_NS, 'clipPath');
  birdClip.setAttribute('id', 'birdClipPath');
  var clipRect = document.createElementNS(Blockly.SVG_NS, 'rect');
  clipRect.setAttribute('id', 'clipRect');
  clipRect.setAttribute('width', Bird.BIRD_ICON_SIZE);
  clipRect.setAttribute('height', Bird.BIRD_ICON_SIZE);
  birdClip.appendChild(clipRect);
  svg.appendChild(birdClip);

  // Add bird.
  var birdIcon = document.createElementNS(Blockly.SVG_NS, 'image');
  birdIcon.setAttribute('id', 'bird');
  birdIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      'bird/birds-120.png');
  birdIcon.setAttribute('height', Bird.BIRD_ICON_SIZE * 4); // 120 * 4 = 480
  birdIcon.setAttribute('width', Bird.BIRD_ICON_SIZE * 12); // 120 * 12 = 1440
  birdIcon.setAttribute('clip-path', 'url(#birdClipPath)');
  svg.appendChild(birdIcon);

  // Draw the outer square.
  var square = document.createElementNS(Blockly.SVG_NS, 'rect');
  square.setAttribute('class', 'edges');
  square.setAttribute('width', Bird.MAP_SIZE);
  square.setAttribute('height', Bird.MAP_SIZE);
  svg.appendChild(square);

  var xAxis = BlocklyGames.LEVEL > 3;
  var yAxis = BlocklyGames.LEVEL > 4;

  var TICK_LENGTH = 9;
  var major = 1;
  for (var i = 0.1; i < 0.9; i += 0.1) {
    if (xAxis) {
      // Bottom edge.
      var tick = document.createElementNS(Blockly.SVG_NS, 'line');
      tick.setAttribute('class', 'edges');
      tick.setAttribute('x1', i * Bird.MAP_SIZE);
      tick.setAttribute('y1', Bird.MAP_SIZE);
      tick.setAttribute('x2', i * Bird.MAP_SIZE);
      tick.setAttribute('y2', Bird.MAP_SIZE - TICK_LENGTH * major);
      svg.appendChild(tick);
    }
    if (yAxis) {
      // Left edge.
      var tick = document.createElementNS(Blockly.SVG_NS, 'line');
      tick.setAttribute('class', 'edges');
      tick.setAttribute('x1', 0);
      tick.setAttribute('y1', i * Bird.MAP_SIZE);
      tick.setAttribute('x2', TICK_LENGTH * major);
      tick.setAttribute('y2', i * Bird.MAP_SIZE);
      svg.appendChild(tick);
    }
    if (major == 2) {
      if (xAxis) {
        // X axis.
        var number = document.createElementNS(Blockly.SVG_NS, 'text');
        number.setAttribute('class', 'edgeX');
        number.setAttribute('x', i * Bird.MAP_SIZE + 2);
        number.setAttribute('y', Bird.MAP_SIZE - 4);
        number.appendChild(document.createTextNode(Math.round(i * 100)));
        svg.appendChild(number);
      }
      if (yAxis) {
        // Y axis.
        var number = document.createElementNS(Blockly.SVG_NS, 'text');
        number.setAttribute('class', 'edgeY');
        number.setAttribute('x', 3);
        number.setAttribute('y', i * Bird.MAP_SIZE - 2);
        number.appendChild(document.createTextNode(Math.round(100 - i * 100)));
        svg.appendChild(number);
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
  Blockly.inject(document.getElementById('blockly'),
      {'media': 'media/',
       'rtl': rtl,
       'toolbox': toolbox,
       'trashcan': true});
  Blockly.loadAudio_(['bird/quack.ogg', 'bird/quack.mp3'], 'quack');
  Blockly.loadAudio_(['bird/whack.mp3', 'bird/whack.ogg'], 'whack');
  Blockly.loadAudio_(['bird/worm.mp3', 'bird/worm.ogg'], 'worm');
  // Not really needed, there are no user-defined functions or variables.
  Blockly.JavaScript.addReservedWords('noWorm,heading,getX,getY');

  Bird.drawMap();

  var defaultXml = '';
  if (BlocklyGames.LEVEL == 1) {
    defaultXml =
      '<xml>' +
      '  <block type="bird_heading" x="70" y="70"></block>' +
      '</xml>';
  } else if (BlocklyGames.LEVEL < 5) {
    defaultXml =
      '<xml>' +
      '  <block type="bird_ifElse" x="70" y="70"></block>' +
      '</xml>';
  } else {
    defaultXml =
      '<xml>' +
      '  <block type="controls_if" x="70" y="70"></block>' +
      '</xml>';
  }
  BlocklyInterface.loadBlocks(defaultXml, false);

  Bird.reset(true);

  BlocklyGames.bindClick('runButton', Bird.runButtonClick);
  BlocklyGames.bindClick('resetButton', Bird.resetButtonClick);

  // Open interactive help.  But wait 5 seconds for the
  // user to think a bit before they are told what to do.
  setTimeout(function() {
    Blockly.addChangeListener(function() {Bird.levelHelp()});
    Bird.levelHelp();
  }, 5000);
  if (BlocklyGames.LEVEL > 8) {
    setTimeout(BlocklyDialogs.abortOffer, 5 * 60 * 1000);
  }

  // Lazy-load the JavaScript interpreter.
  setTimeout(BlocklyInterface.importInterpreter, 1);
  // Lazy-load the syntax-highlighting.
  setTimeout(BlocklyInterface.importPrettify, 1);
};

window.addEventListener('load', Bird.init);

/**
 * When the workspace changes, update the help as needed.
 */
Bird.levelHelp = function() {
  if (Blockly.dragMode_ != 0) {
    // Don't change helps during drags.
    return;
  } else if (Bird.result == Bird.ResultType.SUCCESS ||
             BlocklyGames.loadFromLocalStorage(BlocklyGames.NAME,
                                               BlocklyGames.LEVEL)) {
    // The user has already won.  They are just playing around.
    return;
  }
  var userBlocks = Blockly.Xml.domToText(
      Blockly.Xml.workspaceToDom(Blockly.mainWorkspace));
  var toolbar = Blockly.mainWorkspace.flyout_.workspace_.getTopBlocks(true);
  var content = document.getElementById('dialogHelp');
  var origin = null;
  var style = null;
  if (BlocklyGames.LEVEL == 1) {
    if (userBlocks.indexOf('>90<') != -1 ||
        userBlocks.indexOf('bird_heading') == -1) {
      style = {'width': '370px', 'top': '140px'};
      style[Blockly.RTL ? 'right' : 'left'] = '215px';
      var blocks = Blockly.mainWorkspace.getTopBlocks(true);
      if (blocks.length) {
        origin = blocks[0].getSvgRoot();
      } else {
        origin = toolbar[0].getSvgRoot();
      }
    }
  } else if (BlocklyGames.LEVEL == 2) {
    if (userBlocks.indexOf('bird_noWorm') == -1) {
      style = {'width': '350px', 'top': '170px'};
      style[Blockly.RTL ? 'right' : 'left'] = '180px';
      origin = toolbar[1].getSvgRoot();
    }
  } else if (BlocklyGames.LEVEL == 4) {
    if (userBlocks.indexOf('bird_compare') == -1) {
      style = {'width': '350px', 'top': '230px'};
      style[Blockly.RTL ? 'right' : 'left'] = '180px';
      origin = toolbar[2].getSvgRoot();
    }
  } else if (BlocklyGames.LEVEL == 5) {
    if (userBlocks.indexOf('mutation else') == -1) {
      var blocks = Blockly.mainWorkspace.getTopBlocks(false);
      for (var i = 0, block; block = blocks[i]; i++) {
        if (block.type == 'controls_if') {
          break;
        }
      }
      if (!block.mutator.isVisible()) {
        var xy = Blockly.getAbsoluteXY_(block.getSvgRoot());
        style = {'width': '340px', 'top': (xy.y + 100) + 'px'};
        style.left = (xy.x - (Blockly.RTL ? 350 : 0)) + 'px';
        origin = block.getSvgRoot();
      } else {
        var content = document.getElementById('dialogMutatorHelp');
        origin = block.mutator.workspace_.flyout_.buttons_[1];
        var xy = Blockly.getAbsoluteXY_(origin);
        style = {'width': '340px', 'top': (xy.y + 60) + 'px'};
        style.left = (xy.x - (Blockly.RTL ? 310 : 0)) + 'px';
      }
    }
  } else if (BlocklyGames.LEVEL == 6) {
    if (userBlocks.indexOf('mutation') == -1) {
      var blocks = Blockly.mainWorkspace.getTopBlocks(false);
      for (var i = 0, block; block = blocks[i]; i++) {
        if (block.type == 'controls_if') {
          break;
        }
      }
      var xy = Blockly.getAbsoluteXY_(block.getSvgRoot());
      style = {'width': '350px', 'top': (xy.y + 220) + 'px'};
      style.left = (xy.x - (Blockly.RTL ? 350 : 0)) + 'px';
      origin = block.getSvgRoot();
    }
  } else if (BlocklyGames.LEVEL == 8) {
    if (userBlocks.indexOf('bird_and') == -1) {
      style = {'width': '350px', 'top': '360px'};
      style[Blockly.RTL ? 'right' : 'left'] = '450px';
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
  for (var x = 0; x < Bird.pidList.length; x++) {
    window.clearTimeout(Bird.pidList[x]);
  }
  Bird.pidList = [];

  // Move Bird into position.
  Bird.pos = Bird.MAP.start.clone();
  Bird.angle = Bird.MAP.startAngle;
  Bird.currentAngle = Bird.angle;
  Bird.hasWorm = false;
  Bird.currentPose = Bird.Pose.SOAR;

  Bird.displayBird();

  // Move the worm into position.
  var image = document.getElementById('worm');
  image.setAttribute('x',
      Bird.MAP.worm.x / 100 * Bird.MAP_SIZE - Bird.WORM_ICON_SIZE / 2);
  image.setAttribute('y',
      (1 - Bird.MAP.worm.y / 100) * Bird.MAP_SIZE - Bird.WORM_ICON_SIZE / 2);
  image.style.visibility = 'visible';
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
  Blockly.mainWorkspace.traceOn(true);
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
  Blockly.mainWorkspace.traceOn(false);
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
 * @param {!Interpreter} interpreter The JS interpreter.
 * @param {!Object} scope Global scope.
 */
Bird.initInterpreter = function(interpreter, scope) {
  // API
  var wrapper;
  wrapper = function(angle, id) {
    Bird.heading(angle.valueOf(), id.toString());
  };
  interpreter.setProperty(scope, 'heading',
      interpreter.createNativeFunction(wrapper));
  wrapper = function() {
    return interpreter.createPrimitive(!Bird.hasWorm);
  };
  interpreter.setProperty(scope, 'noWorm',
      interpreter.createNativeFunction(wrapper));
  wrapper = function() {
    return interpreter.createPrimitive(Bird.pos.x);
  };
  interpreter.setProperty(scope, 'getX',
      interpreter.createNativeFunction(wrapper));
  wrapper = function() {
    return interpreter.createPrimitive(Bird.pos.y);
  };
  interpreter.setProperty(scope, 'getY',
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
  var code = Blockly.JavaScript.workspaceToCode();
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
      if (ticks-- == 0) {
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
    Bird.currentPose = action[0] == 'move' ? Bird.Pose.FLAP : Bird.Pose.SOAR;
    Bird.displayBird();
  } else if (action[0] == 'worm') {
    var worm = document.getElementById('worm');
    worm.style.visibility = 'hidden';
  } else if (action[0] == 'finish') {
    Bird.currentPose = Bird.Pose.SIT;
    Bird.displayBird();
    BlocklyInterface.saveToLocalStorage();
    BlocklyDialogs.congratulations();
  } else if (action[0] == 'play') {
    Blockly.playAudio(action[1], 0.5);
  }

  Bird.pidList.push(setTimeout(Bird.animate, Bird.stepSpeed * 5));
};

/**
 * Display bird at the current location, facing the current angle.
 */
Bird.displayBird = function() {
  var diff = goog.math.angleDifference(Bird.angle, Bird.currentAngle);
  var step = 10;
  if (Math.abs(diff) <= step) {
    Bird.currentAngle = Bird.angle;
  } else {
    Bird.currentAngle -= goog.math.sign(diff) * step;
    Bird.currentAngle = goog.math.standardAngle(Bird.currentAngle);
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
  if (Bird.currentPose == Bird.Pose.SOAR) {
    row = 0;
  } else if (Bird.currentPose == Bird.Pose.SIT) {
    row = 3;
  } else if (Bird.currentPose == Bird.Pose.FLAP) {
    row = Math.round(Date.now() / Bird.FLAP_SPEED) % 3;
  } else {
    throw 'Unknown pose.';
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
  return goog.math.Coordinate.distance(Bird.pos, Bird.MAP.nest) < accuracy;
};

/**
 * Has the bird intersected the worm?
 * @return {boolean} True if the bird found the worm, false otherwise.
 */
Bird.intersectWorm = function() {
  var accuracy = 0.5 * Bird.BIRD_ICON_SIZE / Bird.MAP_SIZE * 100;
  return goog.math.Coordinate.distance(Bird.pos, Bird.MAP.worm) < accuracy;
};

/**
 * Has the bird intersected a wall?
 * @return {boolean} True if the bird hit a wall, false otherwise.
 */
Bird.intersectWall = function() {
  var accuracy = 0.2 * Bird.BIRD_ICON_SIZE / Bird.MAP_SIZE * 100;
  for (var i = 0, wall; wall = Bird.MAP.walls[i]; i++) {
    var wallPoint = wall.getClosestSegmentPoint(Bird.pos);
    if (goog.math.Coordinate.distance(wallPoint, Bird.pos) < accuracy) {
      return true;
    }
  }
  return false;
};

/**
 * Move the bird to the given point.
 * @param {!goog.math.Coordinate} p Coordinate of point.
 */
Bird.gotoPoint = function(p) {
  var steps = Math.round(goog.math.Coordinate.distance(Bird.pos, p));
  var angleDegrees = goog.math.angle(Bird.pos.x, Bird.pos.y, p.x, p.y);
  var angleRadians = goog.math.toRadians(angleDegrees);
  for (var i = 0; i < steps; i++) {
    Bird.pos.x += Math.cos(angleRadians);
    Bird.pos.y += Math.sin(angleRadians);
    Bird.log.push(['goto', Bird.pos.x, Bird.pos.y, angleDegrees, null]);
  }
};

/**
 * Attempt to move the bird in the specified direction.
 * @param {number} angle Direction to move (0 = east, 90 = north).
 * @param {string} id ID of block that triggered this action.
 * @throws {true} If the nest is reached.
 * @throws {false} If the bird collides with a wall.
 */
Bird.heading = function(angle, id) {
  var angleRadians = goog.math.toRadians(angle);
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
