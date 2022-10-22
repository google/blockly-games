/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for Maze game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Maze');

goog.require('Blockly');
goog.require('Blockly.browserEvents');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.JavaScript');
goog.require('Blockly.Trashcan');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.math');
goog.require('Blockly.utils.string');
goog.require('Blockly.VerticalFlyout');
goog.require('Blockly.Xml');
goog.require('BlocklyCode');
goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('Maze.Blocks');
goog.require('Maze.html');


BlocklyGames.storageName = 'maze';

const MAX_BLOCKS =
    [Infinity, Infinity, 2, 5, 5, 5, 5, 10, 7, 10][BlocklyGames.LEVEL - 1];

// Crash type constants.
const CRASH_STOP = 1;
const CRASH_SPIN = 2;
const CRASH_FALL = 3;

const SKINS = [
  // sprite: A 1029x51 set of 21 avatar images.
  // tiles: A 250x200 set of 20 map images.
  // background: An optional 400x450 background image, or false.
  // look: Colour of sonar-like look icon.
  // winSound: List of sounds (in various formats) to play when the player wins.
  // crashSound: List of sounds (in various formats) for player crashes.
  // crashType: Behaviour when player crashes (stop, spin, or fall).
  {
    sprite: 'maze/pegman.png',
    tiles: 'maze/tiles_pegman.png',
    background: false,
    look: '#000',
    winSound: ['maze/win.mp3', 'maze/win.ogg'],
    crashSound: ['maze/fail_pegman.mp3', 'maze/fail_pegman.ogg'],
    crashType: CRASH_STOP,
  },
  {
    sprite: 'maze/astro.png',
    tiles: 'maze/tiles_astro.png',
    background: 'maze/bg_astro.jpg',
    // Coma star cluster, photo by George Hatfield, used with permission.
    look: '#fff',
    winSound: ['maze/win.mp3', 'maze/win.ogg'],
    crashSound: ['maze/fail_astro.mp3', 'maze/fail_astro.ogg'],
    crashType: CRASH_SPIN,
  },
  {
    sprite: 'maze/panda.png',
    tiles: 'maze/tiles_panda.png',
    background: 'maze/bg_panda.jpg',
    // Spring canopy, photo by Rupert Fleetingly, CC licensed for reuse.
    look: '#000',
    winSound: ['maze/win.mp3', 'maze/win.ogg'],
    crashSound: ['maze/fail_panda.mp3', 'maze/fail_panda.ogg'],
    crashType: CRASH_FALL,
  },
];
const SKIN_ID =
    BlocklyGames.getIntegerParamFromUrl('skin', 0, SKINS.length - 1);
const SKIN = SKINS[SKIN_ID];

/**
 * The types of squares in the maze, which is represented
 * as a 2D array of SquareType values.
 * @enum {number}
 */
const SquareType = {
  WALL: 0,
  OPEN: 1,
  START: 2,
  FINISH: 3,
};

// The maze square constants defined above are inlined here
// for ease of reading and writing the static mazes.
const map = [
// Level 1.
 [[0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 2, 1, 3, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0]],
// Level 2.
 [[0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 3, 0, 0, 0],
  [0, 0, 2, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0]],
// Level 3.
 [[0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 2, 1, 1, 1, 1, 3, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0]],
// Level 4.
/**
 * Note, the path continues past the start and the goal in both directions.
 * This is intentionally done so users see the maze is about getting from
 * the start to the goal and not necessarily about moving over every part of
 * the maze, 'mowing the lawn' as Neil calls it.
 */
 [[0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 1, 1],
  [0, 0, 0, 0, 0, 3, 1, 0],
  [0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 0, 0, 0, 0],
  [0, 2, 1, 0, 0, 0, 0, 0],
  [1, 1, 0, 0, 0, 0, 0, 0]],
// Level 5.
 [[0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 3, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 2, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0]],
// Level 6.
 [[0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 0, 0, 0, 1, 0, 0],
  [0, 1, 1, 3, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0],
  [0, 2, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0]],
// Level 7.
 [[0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 0],
  [0, 2, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 0],
  [0, 1, 1, 3, 0, 1, 0, 0],
  [0, 1, 0, 1, 0, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0]],
// Level 8.
 [[0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 0, 0],
  [0, 1, 0, 0, 1, 1, 0, 0],
  [0, 1, 1, 1, 0, 1, 0, 0],
  [0, 0, 0, 1, 0, 1, 0, 0],
  [0, 2, 1, 1, 0, 3, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0]],
// Level 9.
 [[0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 0, 0, 0, 0, 0],
  [3, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 1, 0, 1, 1, 0],
  [1, 1, 1, 1, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 2, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0]],
// Level 10.
 [[0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 0, 3, 0, 1, 0],
  [0, 1, 1, 0, 1, 1, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 1, 0, 0, 1, 0],
  [0, 2, 1, 1, 1, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0]],
][BlocklyGames.LEVEL - 1];

/**
 * Measure maze dimensions and set sizes.
 * ROWS: Number of tiles down.
 * COLS: Number of tiles across.
 * SQUARE_SIZE: Pixel height and width of each maze square (i.e. tile).
 */
const ROWS = map.length;
const COLS = map[0].length;
const SQUARE_SIZE = 50;
const PEGMAN_HEIGHT = 52;
const PEGMAN_WIDTH = 49;

const MAZE_WIDTH = SQUARE_SIZE * COLS;
const MAZE_HEIGHT = SQUARE_SIZE * ROWS;
const PATH_WIDTH = SQUARE_SIZE / 3;

/**
 * Constants for cardinal directions.  Subsequent code assumes these are
 * in the range 0..3 and that opposites have an absolute difference of 2.
 * @enum {number}
 */
const DirectionType = {
  NORTH: 0,
  EAST: 1,
  SOUTH: 2,
  WEST: 3,
};

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
 * Result of last execution.
 */
let result = ResultType.UNSET;

/**
 * Starting direction.
 */
let startDirection = DirectionType.EAST;

/**
 * PIDs of animation tasks currently executing.
 * @type !Array<number>
 */
const pidList = [];

// Map each possible shape to a sprite.
// Input: Binary string representing Centre/North/West/South/East squares.
// Output: [x, y] coordinates of each tile's sprite in tiles.png.
const tile_SHAPES = {
  '10010': [4, 0],  // Dead ends
  '10001': [3, 3],
  '11000': [0, 1],
  '10100': [0, 2],
  '11010': [4, 1],  // Vertical
  '10101': [3, 2],  // Horizontal
  '10110': [0, 0],  // Elbows
  '10011': [2, 0],
  '11001': [4, 2],
  '11100': [2, 3],
  '11110': [1, 1],  // Junctions
  '10111': [1, 0],
  '11011': [2, 1],
  '11101': [1, 2],
  '11111': [2, 2],  // Cross
  'null0': [4, 3],  // Empty
  'null1': [3, 0],
  'null2': [3, 1],
  'null3': [0, 3],
  'null4': [1, 3],
};

/**
 * Milliseconds between each animation frame.
 */
let stepSpeed;

let start_;
let finish_;
let pegmanX;
let pegmanY;
let pegmanD;

/**
 * Log of Pegman's moves.  Recorded during execution, played back for animation.
 * @type !Array<!Array<string>>
 */
const log = [];

/**
 * Create and layout all the nodes for the path, scenery, Pegman, and goal.
 */
function drawMap() {
  const svg = BlocklyGames.getElementById('svgMaze');
  const scale = Math.max(ROWS, COLS) * SQUARE_SIZE;
  svg.setAttribute('viewBox', '0 0 ' + scale + ' ' + scale);

  // Draw the outer square.
  Blockly.utils.dom.createSvgElement('rect', {
      'height': MAZE_HEIGHT,
      'width': MAZE_WIDTH,
      'fill': '#F1EEE7',
      'stroke-width': 1,
      'stroke': '#CCB',
    }, svg);

  if (SKIN.background) {
    const tile = Blockly.utils.dom.createSvgElement('image', {
        'height': MAZE_HEIGHT,
        'width': MAZE_WIDTH,
        'x': 0,
        'y': 0,
      }, svg);
    tile.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
        SKIN.background);
  }

  // Draw the tiles making up the maze map.

  // Return a value of '0' if the specified square is wall or out of bounds,
  // '1' otherwise (empty, start, finish).
  const normalize = function(x, y) {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) {
      return '0';
    }
    return (map[y][x] === SquareType.WALL) ? '0' : '1';
  };

  // Compute and draw the tile for each square.
  let tileId = 0;
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      // Compute the tile shape.
      let tileShape = normalize(x, y) +
          normalize(x, y - 1) +  // North.
          normalize(x + 1, y) +  // West.
          normalize(x, y + 1) +  // South.
          normalize(x - 1, y);   // East.

      // Draw the tile.
      if (!tile_SHAPES[tileShape]) {
        // Empty square.  Use null0 for large areas, with null1-4 for borders.
        // Add some randomness to avoid large empty spaces.
        if (tileShape === '00000' && Math.random() > 0.3) {
          tileShape = 'null0';
        } else {
          tileShape = 'null' + Math.floor(1 + Math.random() * 4);
        }
      }
      const left = tile_SHAPES[tileShape][0];
      const top = tile_SHAPES[tileShape][1];
      // Tile's clipPath element.
      const tileClip = Blockly.utils.dom.createSvgElement('clipPath', {
          'id': 'tileClipPath' + tileId
        }, svg);
      Blockly.utils.dom.createSvgElement('rect', {
          'height': SQUARE_SIZE,
          'width': SQUARE_SIZE,
          'x': x * SQUARE_SIZE,
          'y': y * SQUARE_SIZE,
        }, tileClip);
      // Tile sprite.
      const tile = Blockly.utils.dom.createSvgElement('image', {
          'height': SQUARE_SIZE * 4,
          'width': SQUARE_SIZE * 5,
          'clip-path': 'url(#tileClipPath' + tileId + ')',
          'x': (x - left) * SQUARE_SIZE,
          'y': (y - top) * SQUARE_SIZE,
        }, svg);
      tile.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
          SKIN.tiles);
      tileId++;
    }
  }

  // Add finish marker.
  const finishMarker = Blockly.utils.dom.createSvgElement('image', {
      'id': 'finish',
      'height': 34,
      'width': 20,
    }, svg);
  finishMarker.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
      'maze/marker.png');

  // Pegman's clipPath element, whose (x, y) is reset by displayPegman
  const pegmanClip = Blockly.utils.dom.createSvgElement('clipPath', {
      'id': 'pegmanClipPath'
    }, svg);
  Blockly.utils.dom.createSvgElement('rect', {
      'id': 'clipRect',
      'height': PEGMAN_HEIGHT,
      'width': PEGMAN_WIDTH,
    }, pegmanClip);

  // Add Pegman.
  const pegmanIcon = Blockly.utils.dom.createSvgElement('image', {
      'id': 'pegman',
      'height': PEGMAN_HEIGHT,
      'width': PEGMAN_WIDTH * 21,  // 49 * 21 = 1029
      'clip-path': 'url(#pegmanClipPath)',
    }, svg);
  pegmanIcon.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
      SKIN.sprite);
}

/**
 * Initialize Blockly and the maze.  Called on page load.
 */
function init() {
  Maze.Blocks.init();

  // Add skin parameter when moving to next level.
  BlocklyInterface.nextLevelParam = '&skin=' + SKIN_ID;

  // Render the HTML.
  document.body.innerHTML = Maze.html.start(
      {lang: BlocklyGames.LANG,
       level: BlocklyGames.LEVEL,
       maxLevel: BlocklyGames.MAX_LEVEL,
       skin: SKIN_ID,
       html: BlocklyGames.IS_HTML});

  BlocklyInterface.init(BlocklyGames.getMsg('Games.maze', false));

  // Setup the Pegman menu.
  const pegmanImg = document.querySelector('#pegmanButton>img');
  pegmanImg.style.backgroundImage = 'url(' + SKIN.sprite + ')';
  const pegmanMenu = BlocklyGames.getElementById('pegmanMenu');
  const handlerFactory = function(n) {
    return function() {
      changePegman(n);
    };
  };
  for (let i = 0; i < SKINS.length; i++) {
    if (i === SKIN_ID) {
      continue;
    }
    const div = document.createElement('div');
    const img = document.createElement('img');
    img.src = 'common/1x1.gif';
    img.style.backgroundImage = 'url(' + SKINS[i].sprite + ')';
    div.appendChild(img);
    pegmanMenu.appendChild(div);
    Blockly.browserEvents.bind(div, 'mousedown', null, handlerFactory(i));
  }
  Blockly.browserEvents.bind(window, 'resize', null, hidePegmanMenu);
  const pegmanButton = BlocklyGames.getElementById('pegmanButton');
  Blockly.browserEvents.bind(pegmanButton, 'mousedown', null, showPegmanMenu);
  const pegmanButtonArrow = BlocklyGames.getElementById('pegmanButtonArrow');
  const arrow = document.createTextNode(Blockly.FieldDropdown.ARROW_CHAR);
  pegmanButtonArrow.appendChild(arrow);

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

  // Scale the workspace so level 1 = 1.3, and level 10 = 1.0.
  const scale = 1 + (1 - (BlocklyGames.LEVEL / BlocklyGames.MAX_LEVEL)) / 3;
  BlocklyInterface.injectBlockly(
      {'maxBlocks': MAX_BLOCKS,
       'rtl': rtl,
       'trashcan': true,
       'zoom': {'startScale': scale}});
  BlocklyInterface.workspace.getAudioManager().load(SKIN.winSound, 'win');
  BlocklyInterface.workspace.getAudioManager().load(SKIN.crashSound, 'fail');
  // Not really needed, there are no user-defined functions or variables.
  Blockly.JavaScript.addReservedWords('moveForward,moveBackward,' +
      'turnRight,turnLeft,isPathForward,isPathRight,isPathBackward,isPathLeft');

  drawMap();

  const defaultXml =
      '<xml>' +
        '<block movable="' + (BlocklyGames.LEVEL !== 1) + '" ' +
        'type="maze_moveForward" x="70" y="70"></block>' +
      '</xml>';
  BlocklyInterface.loadBlocks(defaultXml, false);

  // Locate the start and finish squares.
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (map[y][x] === SquareType.START) {
        start_ = {x, y};
      } else if (map[y][x] === SquareType.FINISH) {
        finish_ = {x, y};
      }
    }
  }

  reset(true);
  BlocklyInterface.workspace.addChangeListener(updateCapacity);

  document.body.addEventListener('mousemove', updatePegSpin_, true);

  BlocklyGames.bindClick('runButton', runButtonClick);
  BlocklyGames.bindClick('resetButton', resetButtonClick);

  if (BlocklyGames.LEVEL === 1) {
    // Make connecting blocks easier for beginners.
    Blockly.SNAP_RADIUS *= 2;
    Blockly.CONNECTING_SNAP_RADIUS = Blockly.SNAP_RADIUS;
  }
  if (BlocklyGames.LEVEL === 10) {
    if (!BlocklyGames.loadFromLocalStorage(BlocklyGames.storageName,
                                           BlocklyGames.LEVEL)) {
      // Level 10 gets an introductory modal dialog.
      // Skip the dialog if the user has already won.
      const content = BlocklyGames.getElementById('dialogHelpWallFollow');
      const style = {
        'width': '30%',
        'left': '35%',
        'top': '12em',
      };
      BlocklyDialogs.showDialog(content, null, false, true, style,
          BlocklyDialogs.stopDialogKeyDown);
      BlocklyDialogs.startDialogKeyDown();
      setTimeout(BlocklyDialogs.abortOffer, 5 * 60 * 1000);
    }
  } else {
    // All other levels get interactive help.  But wait 5 seconds for the
    // user to think a bit before they are told what to do.
    setTimeout(function() {
      BlocklyInterface.workspace.addChangeListener(levelHelp);
      levelHelp();
    }, 5000);
  }

  // Add the spinning Pegman icon to the done dialog.
  // <img id="pegSpin" src="common/1x1.gif">
  const buttonDiv = BlocklyGames.getElementById('dialogDoneButtons');
  const pegSpin = document.createElement('img');
  pegSpin.id = 'pegSpin';
  pegSpin.src = 'common/1x1.gif';
  pegSpin.style.backgroundImage = 'url(' + SKIN.sprite + ')';
  buttonDiv.parentNode.insertBefore(pegSpin, buttonDiv);

  // Lazy-load the JavaScript interpreter.
  BlocklyCode.importInterpreter();
  // Lazy-load the syntax-highlighting.
  BlocklyCode.importPrettify();
}

/**
 * When the workspace changes, update the help as needed.
 * @param {Blockly.Events.Abstract=} opt_event Custom data for event.
 */
function levelHelp(opt_event) {
  if (opt_event && opt_event.isUiEvent) {
    // Just a change to highlighting or somesuch.
    return;
  } else if (BlocklyInterface.workspace.isDragging()) {
    // Don't change helps during drags.
    return;
  } else if (result === ResultType.SUCCESS ||
             BlocklyGames.loadFromLocalStorage(BlocklyGames.storageName,
                                               BlocklyGames.LEVEL)) {
    // The user has already won.  They are just playing around.
    return;
  }
  const rtl = BlocklyGames.IS_RTL;
  const userBlocks = Blockly.Xml.domToText(
      Blockly.Xml.workspaceToDom(BlocklyInterface.workspace));
  const toolbar =
      BlocklyInterface.workspace.getFlyout().getWorkspace().getTopBlocks(true);
  let content = null;
  let origin = null;
  let style = null;
  if (BlocklyGames.LEVEL === 1) {
    if (BlocklyInterface.workspace.getAllBlocks(false).length < 2) {
      content = BlocklyGames.getElementById('dialogHelpStack');
      style = {'width': '370px', 'top': '130px'};
      style[rtl ? 'right' : 'left'] = '215px';
      origin = toolbar[0].getSvgRoot();
    } else {
      const topBlocks = BlocklyInterface.workspace.getTopBlocks(true);
      if (topBlocks.length > 1) {
        const xml = [
            '<xml>',
              '<block type="maze_moveForward" x="10" y="10">',
                '<next>',
                  '<block type="maze_moveForward"></block>',
                '</next>',
              '</block>',
            '</xml>'];
        BlocklyInterface.injectReadonly('sampleOneTopBlock', xml);
        content = BlocklyGames.getElementById('dialogHelpOneTopBlock');
        style = {'width': '360px', 'top': '120px'};
        style[rtl ? 'right' : 'left'] = '225px';
        origin = topBlocks[0].getSvgRoot();
      } else if (result === ResultType.UNSET) {
        // Show run help dialog.
        content = BlocklyGames.getElementById('dialogHelpRun');
        style = {'width': '360px', 'top': '410px'};
        style[rtl ? 'right' : 'left'] = '400px';
        origin = BlocklyGames.getElementById('runButton');
      }
    }
  } else if (BlocklyGames.LEVEL === 2) {
    if (result !== ResultType.UNSET &&
        BlocklyGames.getElementById('runButton').style.display === 'none') {
      content = BlocklyGames.getElementById('dialogHelpReset');
      style = {'width': '360px', 'top': '410px'};
      style[rtl ? 'right' : 'left'] = '400px';
      origin = BlocklyGames.getElementById('resetButton');
    }
  } else if (BlocklyGames.LEVEL === 3) {
    if (!userBlocks.includes('maze_forever')) {
      if (!BlocklyInterface.workspace.remainingCapacity()) {
        content = BlocklyGames.getElementById('dialogHelpCapacity');
        style = {'width': '430px', 'top': '310px'};
        style[rtl ? 'right' : 'left'] = '50px';
        origin = BlocklyGames.getElementById('capacityBubble');
      } else {
        content = BlocklyGames.getElementById('dialogHelpRepeat');
        style = {'width': '360px', 'top': '360px'};
        style[rtl ? 'right' : 'left'] = '425px';
        origin = toolbar[3].getSvgRoot();
      }
    }
  } else if (BlocklyGames.LEVEL === 4) {
    if (!BlocklyInterface.workspace.remainingCapacity() &&
        (!userBlocks.includes('maze_forever') ||
         BlocklyInterface.workspace.getTopBlocks(false).length > 1)) {
      content = BlocklyGames.getElementById('dialogHelpCapacity');
      style = {'width': '430px', 'top': '310px'};
      style[rtl ? 'right' : 'left'] = '50px';
      origin = BlocklyGames.getElementById('capacityBubble');
    } else {
      let showHelp = true;
      // Only show help if there is not a loop with two nested blocks.
      const loopBlocks =
          BlocklyInterface.workspace.getBlocksByType('maze_forever', false);
      for (let loopBlock of loopBlocks) {
        let block = loopBlock.getInputTargetBlock('DO');
        let i = 0;
        while (block) {
          i++
          block = block.getNextBlock();
        }
        if (i > 1) {
          showHelp = false;
          break;
        }
      }
      if (showHelp) {
        content = BlocklyGames.getElementById('dialogHelpRepeatMany');
        style = {'width': '360px', 'top': '360px'};
        style[rtl ? 'right' : 'left'] = '425px';
        origin = toolbar[3].getSvgRoot();
      }
    }
  } else if (BlocklyGames.LEVEL === 5) {
    if (SKIN_ID === 0 && !showPegmanMenu.activatedOnce) {
      content = BlocklyGames.getElementById('dialogHelpSkins');
      style = {'width': '360px', 'top': '60px'};
      style[rtl ? 'left' : 'right'] = '20px';
      origin = BlocklyGames.getElementById('pegmanButton');
    }
  } else if (BlocklyGames.LEVEL === 6) {
    if (!userBlocks.includes('maze_if')) {
      content = BlocklyGames.getElementById('dialogHelpIf');
      style = {'width': '360px', 'top': '430px'};
      style[rtl ? 'right' : 'left'] = '425px';
      origin = toolbar[4].getSvgRoot();
    }
  } else if (BlocklyGames.LEVEL === 7) {
    if (!levelHelp.initialized7_) {
      // Create fake dropdown.
      const span = document.createElement('span');
      span.className = 'helpMenuFake';
      // Safe from HTML injection due to createTextNode below.
      const options =
          [BlocklyGames.getMsg('Maze.pathAhead', false),
           BlocklyGames.getMsg('Maze.pathLeft', false),
           BlocklyGames.getMsg('Maze.pathRight', false)];
      const prefix = Blockly.utils.string.commonWordPrefix(options);
      const suffix = Blockly.utils.string.commonWordSuffix(options);
      let option;
      if (suffix) {
        option = options[0].slice(prefix, -suffix);
      } else {
        option = options[0].substring(prefix);
      }
      // Add dropdown arrow: "option ▾" (LTR) or "▾ אופציה" (RTL)
      span.textContent = option + ' ' + Blockly.FieldDropdown.ARROW_CHAR;
      // Inject fake dropdown into message.
      const container = BlocklyGames.getElementById('helpMenuText');
      const msg = container.textContent;
      container.textContent = '';
      const parts = msg.split(/%\d/);
      for (let i = 0; i < parts.length; i++) {
        container.appendChild(document.createTextNode(parts[i]));
        if (i !== parts.length - 1) {
          container.appendChild(span.cloneNode(true));
        }
      }
      levelHelp.initialized7_ = true;
    }
    // The hint says to change from 'ahead', but keep the hint visible
    // until the user chooses 'right'.
    if (!userBlocks.includes('isPathRight')) {
      content = BlocklyGames.getElementById('dialogHelpMenu');
      style = {'width': '360px', 'top': '430px'};
      style[rtl ? 'right' : 'left'] = '425px';
      origin = toolbar[4].getSvgRoot();
    }
  } else if (BlocklyGames.LEVEL === 9) {
    if (!userBlocks.includes('maze_ifElse')) {
      content = BlocklyGames.getElementById('dialogHelpIfElse');
      style = {'width': '360px', 'top': '305px'};
      style[rtl ? 'right' : 'left'] = '425px';
      origin = toolbar[5].getSvgRoot();
    }
  }
  if (content) {
    if (content.parentNode !== BlocklyGames.getElementById('dialog')) {
      BlocklyDialogs.showDialog(content, origin, true, false, style, null);
    }
  } else {
    BlocklyDialogs.hideDialog(false);
  }
}

/**
 * Reload with a different Pegman skin.
 * @param {number} newSkin ID of new skin.
 */
function changePegman(newSkin) {
  BlocklyInterface.saveToSessionStorage();
  location = location.protocol + '//' + location.host + location.pathname +
      '?lang=' + BlocklyGames.LANG + '&level=' + BlocklyGames.LEVEL +
      '&skin=' + newSkin;
}

let pegmanMenuMouse_;

/**
 * Display the Pegman skin-change menu.
 * @param {!Event} e Mouse, touch, or resize event.
 */
function showPegmanMenu(e) {
  const menu = BlocklyGames.getElementById('pegmanMenu');
  if (menu.style.display === 'block') {
    // Menu is already open.  Close it.
    hidePegmanMenu(e);
    return;
  }
  // Prevent double-clicks or double-taps.
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  const button = BlocklyGames.getElementById('pegmanButton');
  button.classList.add('buttonHover');
  menu.style.top = (button.offsetTop + button.offsetHeight) + 'px';
  menu.style.left = button.offsetLeft + 'px';
  menu.style.display = 'block';
  pegmanMenuMouse_ =
      Blockly.browserEvents.bind(document.body, 'mousedown', null, hidePegmanMenu);
  // Close the skin-changing hint if open.
  const hint = BlocklyGames.getElementById('dialogHelpSkins');
  if (hint && hint.className !== 'dialogHiddenContent') {
    BlocklyDialogs.hideDialog(false);
  }
  showPegmanMenu.activatedOnce = true;
}

/**
 * Hide the Pegman skin-change menu.
 * @param {!Event} e Mouse, touch, or resize event.
 */
function hidePegmanMenu(e) {
  // Prevent double-clicks or double-taps.
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  BlocklyGames.getElementById('pegmanMenu').style.display = 'none';
  BlocklyGames.getElementById('pegmanButton').classList.remove('buttonHover');
  if (pegmanMenuMouse_) {
    Blockly.browserEvents.unbind(pegmanMenuMouse_);
    pegmanMenuMouse_ = undefined;
  }
}

/**
 * Reset the maze to the start position and kill any pending animation tasks.
 * @param {boolean} first True if an opening animation is to be played.
 */
function reset(first) {
  // Kill all tasks.
  pidList.forEach(clearTimeout);
  pidList.length = 0;

  // Move Pegman into position.
  pegmanX = start_.x;
  pegmanY = start_.y;

  if (first) {
    // Opening animation.
    pegmanD = startDirection + 1;
    scheduleFinish(false);
    pidList.push(setTimeout(function() {
      stepSpeed = 100;
      schedule([pegmanX, pegmanY, pegmanD * 4],
               [pegmanX, pegmanY, pegmanD * 4 - 4]);
      pegmanD++;
    }, stepSpeed * 5));
  } else {
    pegmanD = startDirection;
    displayPegman(pegmanX, pegmanY, pegmanD * 4);
  }

  // Move the finish icon into position.
  const finishIcon = BlocklyGames.getElementById('finish');
  finishIcon.setAttribute('x', SQUARE_SIZE * (finish_.x + 0.5) -
      finishIcon.getAttribute('width') / 2);
  finishIcon.setAttribute('y', SQUARE_SIZE * (finish_.y + 0.6) -
      finishIcon.getAttribute('height'));

  // Make 'look' icon invisible and promote to top.
  const lookIcon = BlocklyGames.getElementById('look');
  lookIcon.style.display = 'none';
  lookIcon.parentNode.appendChild(lookIcon);
  const paths = lookIcon.getElementsByTagName('path');
  for (const path of paths) {
    path.setAttribute('stroke', SKIN.look);
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
  BlocklyDialogs.hideDialog(false);
  // Only allow a single top block on level 1.
  if (BlocklyGames.LEVEL === 1 &&
      BlocklyInterface.workspace.getTopBlocks(false).length > 1 &&
      result !== ResultType.SUCCESS &&
      !BlocklyGames.loadFromLocalStorage(BlocklyGames.storageName,
                                         BlocklyGames.LEVEL)) {
    levelHelp();
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
 * Updates the document's 'capacity' element with a message
 * indicating how many more blocks are permitted.  The capacity
 * is retrieved from BlocklyInterface.workspace.remainingCapacity().
 */
function updateCapacity() {
  const cap = BlocklyInterface.workspace.remainingCapacity();
  const p = BlocklyGames.getElementById('capacity');
  if (cap === Infinity) {
    p.style.display = 'none';
  } else {
    p.style.display = 'inline';
    p.innerHTML = '';
    const capSpan = document.createElement('span');
    capSpan.className = 'capacityNumber';
    capSpan.appendChild(document.createTextNode(Number(cap)));
    // Safe from HTML injection due to createTextNode below.
    let msg;
    if (cap === 0) {
      msg = BlocklyGames.getMsg('Maze.capacity0', false);
    } else if (cap === 1) {
      msg = BlocklyGames.getMsg('Maze.capacity1', false);
    } else {
      msg = BlocklyGames.getMsg('Maze.capacity2', false);
    }
    const parts = msg.split(/%\d/);
    for (let i = 0; i < parts.length; i++) {
      p.appendChild(document.createTextNode(parts[i]));
      if (i !== parts.length - 1) {
        p.appendChild(capSpan.cloneNode(true));
      }
    }
  }
}

/**
 * Click the reset button.  Reset the maze.
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
  levelHelp();
}

/**
 * Inject the Maze API into a JavaScript interpreter.
 * @param {!Interpreter} interpreter The JS-Interpreter.
 * @param {!Interpreter.Object} globalObject Global object.
 */
function initInterpreter(interpreter, globalObject) {
  // API
  let wrapper;
  wrapper = function(id) {
    move(0, id);
  };
  wrap('moveForward');

  wrapper = function(id) {
    move(2, id);
  };
  wrap('moveBackward');

  wrapper = function(id) {
    turn(0, id);
  };
  wrap('turnLeft');

  wrapper = function(id) {
    turn(1, id);
  };
  wrap('turnRight');

  wrapper = function(id) {
    return isPath(0, id);
  };
  wrap('isPathForward');

  wrapper = function(id) {
    return isPath(1, id);
  };
  wrap('isPathRight');

  wrapper = function(id) {
    return isPath(2, id);
  };
  wrap('isPathBackward');

  wrapper = function(id) {
    return isPath(3, id);
  };
  wrap('isPathLeft');

  wrapper = function() {
    return notDone();
  };
  wrap('notDone');

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
  const code = BlocklyCode.getJsCode();
  BlocklyCode.executedJsCode = code;
  BlocklyInterface.executedCode = BlocklyInterface.getCode();
  result = ResultType.UNSET;
  const interpreter = new Interpreter(code, initInterpreter);

  // Try running the user's code.  There are four possible outcomes:
  // 1. If pegman reaches the finish [SUCCESS], true is thrown.
  // 2. If the program is terminated due to running too long [TIMEOUT],
  //    false is thrown.
  // 3. If another error occurs [ERROR], that error is thrown.
  // 4. If the program ended normally but without solving the maze [FAILURE],
  //    no error or exception is thrown.
  try {
    let ticks = 10000;  // 10k ticks runs Pegman for about 8 minutes.
    while (interpreter.step()) {
      if (ticks-- === 0) {
        throw Infinity;
      }
    }
    result = notDone() ?
        ResultType.FAILURE : ResultType.SUCCESS;
  } catch (e) {
    // A boolean is thrown for normal termination.
    // Abnormal termination is a user error.
    if (e === Infinity) {
      result = ResultType.TIMEOUT;
    } else if (e === false) {
      result = ResultType.ERROR;
    } else {
      // Syntax error, can't happen.
      result = ResultType.ERROR;
      alert(e);
    }
  }

  // Fast animation if execution is successful.  Slow otherwise.
  if (result === ResultType.SUCCESS) {
    stepSpeed = 100;
    log.push(['finish', null]);
  } else {
    stepSpeed = 150;
  }

  // log now contains a transcript of all the user's actions.
  // Reset the maze and animate the transcript.
  reset(false);
  pidList.push(setTimeout(animate, 100));
}

/**
 * Iterate through the recorded path and animate pegman's actions.
 */
function animate() {
  const action = log.shift();
  if (!action) {
    BlocklyCode.highlight(null);
    levelHelp();
    return;
  }
  BlocklyCode.highlight(action[1]);

  switch (action[0]) {
    case 'north':
      schedule([pegmanX, pegmanY, pegmanD * 4],
               [pegmanX, pegmanY - 1, pegmanD * 4]);
      pegmanY--;
      break;
    case 'east':
      schedule([pegmanX, pegmanY, pegmanD * 4],
               [pegmanX + 1, pegmanY, pegmanD * 4]);
      pegmanX++;
      break;
    case 'south':
      schedule([pegmanX, pegmanY, pegmanD * 4],
               [pegmanX, pegmanY + 1, pegmanD * 4]);
      pegmanY++;
      break;
    case 'west':
      schedule([pegmanX, pegmanY, pegmanD * 4],
               [pegmanX - 1, pegmanY, pegmanD * 4]);
      pegmanX--;
      break;
    case 'look_north':
      scheduleLook(DirectionType.NORTH);
      break;
    case 'look_east':
      scheduleLook(DirectionType.EAST);
      break;
    case 'look_south':
      scheduleLook(DirectionType.SOUTH);
      break;
    case 'look_west':
      scheduleLook(DirectionType.WEST);
      break;
    case 'fail_forward':
      scheduleFail(true);
      break;
    case 'fail_backward':
      scheduleFail(false);
      break;
    case 'left':
      schedule([pegmanX, pegmanY, pegmanD * 4],
               [pegmanX, pegmanY, pegmanD * 4 - 4]);
      pegmanD = constrainDirection4(pegmanD - 1);
      break;
    case 'right':
      schedule([pegmanX, pegmanY, pegmanD * 4],
               [pegmanX, pegmanY, pegmanD * 4 + 4]);
      pegmanD = constrainDirection4(pegmanD + 1);
      break;
    case 'finish':
      scheduleFinish(true);
      BlocklyInterface.saveToLocalStorage();
      setTimeout(BlocklyCode.congratulations, 1000);
  }

  pidList.push(setTimeout(animate, stepSpeed * 5));
}

/**
 * Point the congratulations Pegman to face the mouse.
 * @param {Event} e Mouse move event.
 * @private
 */
function updatePegSpin_(e) {
  if (BlocklyGames.getElementById('dialogDone').className ===
      'dialogHiddenContent') {
    return;
  }
  const pegSpin = BlocklyGames.getElementById('pegSpin');
  const bBox = BlocklyDialogs.getBBox(pegSpin);
  const x = bBox.x + bBox.width / 2 - window.pageXOffset;
  const y = bBox.y + bBox.height / 2 - window.pageYOffset;
  const dx = e.clientX - x;
  const dy = e.clientY - y;
  let angle = Blockly.utils.math.toDegrees(Math.atan(dy / dx));
  // 0: North, 90: East, 180: South, 270: West.
  if (dx > 0) {
    angle += 90;
  } else {
    angle += 270;
  }
  // Divide into 16 quads.
  let quad = Math.round(angle / 360 * 16);
  if (quad === 16) {
    quad = 15;
  }
  // Display correct Pegman sprite.
  pegSpin.style.backgroundPosition = (-quad * PEGMAN_WIDTH) + 'px 0px';
}

/**
 * Schedule the animations for a move or turn.
 * @param {!Array<number>} startPos X, Y and direction starting points.
 * @param {!Array<number>} endPos X, Y and direction ending points.
 */
function schedule(startPos, endPos) {
  const deltas = [(endPos[0] - startPos[0]) / 4,
                (endPos[1] - startPos[1]) / 4,
                (endPos[2] - startPos[2]) / 4];
  displayPegman(startPos[0] + deltas[0],
                startPos[1] + deltas[1],
                constrainDirection16(startPos[2] + deltas[2]));
  pidList.push(setTimeout(function() {
      displayPegman(startPos[0] + deltas[0] * 2,
          startPos[1] + deltas[1] * 2,
          constrainDirection16(startPos[2] + deltas[2] * 2));
    }, stepSpeed));
  pidList.push(setTimeout(function() {
      displayPegman(startPos[0] + deltas[0] * 3,
          startPos[1] + deltas[1] * 3,
          constrainDirection16(startPos[2] + deltas[2] * 3));
    }, stepSpeed * 2));
  pidList.push(setTimeout(function() {
      displayPegman(endPos[0], endPos[1],
          constrainDirection16(endPos[2]));
    }, stepSpeed * 3));
}

/**
 * Schedule the animations and sounds for a failed move.
 * @param {boolean} forward True if forward, false if backward.
 */
function scheduleFail(forward) {
  let deltaX = 0;
  let deltaY = 0;
  switch (pegmanD) {
    case DirectionType.NORTH:
      deltaY = -1;
      break;
    case DirectionType.EAST:
      deltaX = 1;
      break;
    case DirectionType.SOUTH:
      deltaY = 1;
      break;
    case DirectionType.WEST:
      deltaX = -1;
      break;
  }
  if (!forward) {
    deltaX = -deltaX;
    deltaY = -deltaY;
  }
  if (SKIN.crashType === CRASH_STOP) {
    // Bounce bounce.
    deltaX /= 4;
    deltaY /= 4;
    const direction16 = constrainDirection16(pegmanD * 4);
    displayPegman(pegmanX + deltaX, pegmanY + deltaY, direction16);
    BlocklyInterface.workspace.getAudioManager().play('fail', 0.5);
    pidList.push(setTimeout(function() {
      displayPegman(pegmanX, pegmanY, direction16);
    }, stepSpeed));
    pidList.push(setTimeout(function() {
      displayPegman(pegmanX + deltaX, pegmanY + deltaY, direction16);
      BlocklyInterface.workspace.getAudioManager().play('fail', 0.5);
    }, stepSpeed * 2));
    pidList.push(setTimeout(function() {
        displayPegman(pegmanX, pegmanY, direction16);
      }, stepSpeed * 3));
  } else {
    // Add a small random delta away from the grid.
    const deltaZ = (Math.random() - 0.5) * 10;
    const deltaD = (Math.random() - 0.5) / 2;
    deltaX += (Math.random() - 0.5) / 4;
    deltaY += (Math.random() - 0.5) / 4;
    deltaX /= 8;
    deltaY /= 8;
    let acceleration = 0;
    if (SKIN.crashType === CRASH_FALL) {
      acceleration = 0.01;
    }
    pidList.push(setTimeout(function() {
      BlocklyInterface.workspace.getAudioManager().play('fail', 0.5);
    }, stepSpeed * 2));
    const setPosition = function(n) {
      return function() {
        const direction16 = constrainDirection16(pegmanD * 4 + deltaD * n);
        displayPegman(pegmanX + deltaX * n, pegmanY + deltaY * n,
                      direction16, deltaZ * n);
        deltaY += acceleration;
      };
    };
    // 100 frames should get Pegman offscreen.
    for (let i = 1; i < 100; i++) {
      pidList.push(setTimeout(setPosition(i),
          stepSpeed * i / 2));
    }
  }
}

/**
 * Schedule the animations and sound for a victory dance.
 * @param {boolean} sound Play the victory sound.
 */
function scheduleFinish(sound) {
  const direction16 = constrainDirection16(pegmanD * 4);
  displayPegman(pegmanX, pegmanY, 16);
  if (sound) {
    BlocklyInterface.workspace.getAudioManager().play('win', 0.5);
  }
  stepSpeed = 150;  // Slow down victory animation a bit.
  pidList.push(setTimeout(function() {
      displayPegman(pegmanX, pegmanY, 18);
    }, stepSpeed));
  pidList.push(setTimeout(function() {
      displayPegman(pegmanX, pegmanY, 16);
    }, stepSpeed * 2));
  pidList.push(setTimeout(function() {
      displayPegman(pegmanX, pegmanY, direction16);
    }, stepSpeed * 3));
}

/**
 * Display Pegman at the specified location, facing the specified direction.
 * @param {number} x Horizontal grid (or fraction thereof).
 * @param {number} y Vertical grid (or fraction thereof).
 * @param {number} d Direction (0 - 15) or dance (16 - 17).
 * @param {number=} opt_angle Optional angle (in degrees) to rotate Pegman.
 */
function displayPegman(x, y, d, opt_angle) {
  const pegmanIcon = BlocklyGames.getElementById('pegman');
  pegmanIcon.setAttribute('x', x * SQUARE_SIZE - d * PEGMAN_WIDTH + 1);
  pegmanIcon.setAttribute('y', SQUARE_SIZE * (y + 0.5) - PEGMAN_HEIGHT / 2 - 8);
  if (opt_angle) {
    pegmanIcon.setAttribute('transform', 'rotate(' + opt_angle + ', ' +
        (x * SQUARE_SIZE + SQUARE_SIZE / 2) + ', ' +
        (y * SQUARE_SIZE + SQUARE_SIZE / 2) + ')');
  } else {
    pegmanIcon.setAttribute('transform', 'rotate(0, 0, 0)');
  }

  const clipRect = BlocklyGames.getElementById('clipRect');
  clipRect.setAttribute('x', x * SQUARE_SIZE + 1);
  clipRect.setAttribute('y', pegmanIcon.getAttribute('y'));
}

/**
 * Display the look icon at Pegman's current location,
 * in the specified direction.
 * @param {!DirectionType} d Direction (0 - 3).
 */
function scheduleLook(d) {
  let x = pegmanX;
  let y = pegmanY;
  switch (d) {
    case DirectionType.NORTH:
      x += 0.5;
      break;
    case DirectionType.EAST:
      x += 1;
      y += 0.5;
      break;
    case DirectionType.SOUTH:
      x += 0.5;
      y += 1;
      break;
    case DirectionType.WEST:
      y += 0.5;
      break;
  }
  x *= SQUARE_SIZE;
  y *= SQUARE_SIZE;
  const deg = d * 90 - 45;

  const lookIcon = BlocklyGames.getElementById('look');
  lookIcon.setAttribute('transform',
      'translate(' + x + ', ' + y + ') ' +
      'rotate(' + deg + ' 0 0) scale(.4)');
  const paths = lookIcon.getElementsByTagName('path');
  lookIcon.style.display = 'inline';
  for (let i = 0; i < paths.length; i++) {
    scheduleLookStep(paths[i], stepSpeed * i);
  }
}

/**
 * Schedule one of the 'look' icon's waves to appear, then disappear.
 * @param {!Element} path Element to make appear.
 * @param {number} delay Milliseconds to wait before making wave appear.
 */
function scheduleLookStep(path, delay) {
  pidList.push(setTimeout(function() {
    path.style.display = 'inline';
    setTimeout(function() {
      path.style.display = 'none';
    }, stepSpeed * 2);
  }, delay));
}

/**
 * Keep the direction within 0-3, wrapping at both ends.
 * @param {number} d Potentially out-of-bounds direction value.
 * @returns {number} Legal direction value.
 */
function constrainDirection4(d) {
  d = Math.round(d) % 4;
  if (d < 0) {
    d += 4;
  }
  return d;
}

/**
 * Keep the direction within 0-15, wrapping at both ends.
 * @param {number} d Potentially out-of-bounds direction value.
 * @returns {number} Legal direction value.
 */
function constrainDirection16(d) {
  d = Math.round(d) % 16;
  if (d < 0) {
    d += 16;
  }
  return d;
}

// Core functions.

/**
 * Attempt to move pegman forward or backward.
 * @param {number} direction Direction to move (0 = forward, 2 = backward).
 * @param {string} id ID of block that triggered this action.
 * @throws {true} If the end of the maze is reached.
 * @throws {false} If Pegman collides with a wall.
 */
function move(direction, id) {
  if (!isPath(direction, null)) {
    log.push(['fail_' + (direction ? 'backward' : 'forward'), id]);
    throw false;
  }
  // If moving backward, flip the effective direction.
  const effectiveDirection = pegmanD + direction;
  let command;
  switch (constrainDirection4(effectiveDirection)) {
    case DirectionType.NORTH:
      pegmanY--;
      command = 'north';
      break;
    case DirectionType.EAST:
      pegmanX++;
      command = 'east';
      break;
    case DirectionType.SOUTH:
      pegmanY++;
      command = 'south';
      break;
    case DirectionType.WEST:
      pegmanX--;
      command = 'west';
      break;
  }
  log.push([command, id]);
}

/**
 * Turn pegman left or right.
 * @param {number} direction Direction to turn (0 = left, 1 = right).
 * @param {string} id ID of block that triggered this action.
 */
function turn(direction, id) {
  if (direction) {
    // Right turn (clockwise).
    pegmanD++;
    log.push(['right', id]);
  } else {
    // Left turn (counterclockwise).
    pegmanD--;
    log.push(['left', id]);
  }
  pegmanD = constrainDirection4(pegmanD);
}

/**
 * Is there a path next to pegman?
 * @param {number} direction Direction to look
 *     (0 = forward, 1 = right, 2 = backward, 3 = left).
 * @param {?string} id ID of block that triggered this action.
 *     Null if called as a helper function in move().
 * @returns {boolean} True if there is a path.
 */
function isPath(direction, id) {
  const effectiveDirection = pegmanD + direction;
  let square, command;
  switch (constrainDirection4(effectiveDirection)) {
    case DirectionType.NORTH:
      square = map[pegmanY - 1] && map[pegmanY - 1][pegmanX];
      command = 'look_north';
      break;
    case DirectionType.EAST:
      square = map[pegmanY][pegmanX + 1];
      command = 'look_east';
      break;
    case DirectionType.SOUTH:
      square = map[pegmanY + 1] && map[pegmanY + 1][pegmanX];
      command = 'look_south';
      break;
    case DirectionType.WEST:
      square = map[pegmanY][pegmanX - 1];
      command = 'look_west';
      break;
  }
  if (id) {
    log.push([command, id]);
  }
  return square !== SquareType.WALL && square !== undefined;
}

/**
 * Is the player at the finish marker?
 * @returns {boolean} True if not done, false if done.
 */
function notDone() {
  return pegmanX !== finish_.x || pegmanY !== finish_.y;
}

BlocklyGames.callWhenLoaded(init);
