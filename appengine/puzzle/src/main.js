/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for Puzzle game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Puzzle');

goog.require('Blockly.utils.math');
goog.require('Blockly.Xml');
goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('Puzzle.data');
goog.require('Puzzle.html');
goog.require('Puzzle.Blocks');


BlocklyGames.storageName = 'puzzle';

/**
 * Initialize Blockly and the puzzle.  Called on page load.
 */
function init() {
  // Render the HTML.
  document.body.innerHTML = Puzzle.html.start(
      {lang: BlocklyGames.LANG,
       html: BlocklyGames.IS_HTML});

  BlocklyInterface.init(BlocklyGames.getMsg('Games.puzzle', false));

  const rtl = BlocklyGames.IS_RTL;
  const blocklyDiv = BlocklyGames.getElementById('blockly');
  const onresize = function(_e) {
    blocklyDiv.style.width = (window.innerWidth - 20) + 'px';
    blocklyDiv.style.height =
        (window.innerHeight - blocklyDiv.offsetTop - 15) + 'px';
  };
  onresize(null);
  window.addEventListener('resize', onresize);

  BlocklyInterface.injectBlockly(
      {'rtl': rtl,
       'scrollbars': false,
       'trashcan': false});

  const savedBlocks =
      BlocklyGames.loadFromLocalStorage(BlocklyGames.storageName, BlocklyGames.LEVEL);
  // Add the blocks.
  let loadOnce;
  try {
    loadOnce = window.sessionStorage.loadOnceBlocks;
  } catch (e) {
    // Firefox sometimes throws a SecurityError when accessing sessionStorage.
    // Restarting Firefox fixes this, so it looks like a bug.
    loadOnce = null;
  }
  if (loadOnce) {
    delete window.sessionStorage.loadOnceBlocks;
    const xml = Blockly.Xml.textToDom(loadOnce);
    Blockly.Xml.domToWorkspace(xml, BlocklyInterface.workspace);
  } else if (savedBlocks) {
    const xml = Blockly.Xml.textToDom(savedBlocks);
    Blockly.Xml.domToWorkspace(xml, BlocklyInterface.workspace);
  } else {
    // Create one of every block.
    const blocksAnimals = [];
    const blocksPictures = [];
    const blocksTraits = [];
    const data = Puzzle.data.getData();
    for (let i = 0; i < data.length; i++) {
      const animalBlock = BlocklyInterface.workspace.newBlock('animal');
      animalBlock.populate(i + 1);
      blocksAnimals.push(animalBlock);
      const pictureBlock = BlocklyInterface.workspace.newBlock('picture');
      pictureBlock.populate(i + 1);
      blocksPictures.push(pictureBlock);
      for (let j = 0; j < data[i].traits.length; j++) {
        const traitBlock = BlocklyInterface.workspace.newBlock('trait');
        traitBlock.populate(i + 1, j + 1);
        blocksTraits.push(traitBlock);
      }
    }
    shuffle(blocksAnimals);
    shuffle(blocksPictures);
    shuffle(blocksTraits);
    const blocks = [].concat(blocksAnimals, blocksPictures, blocksTraits);
    if (rtl) {
      blocks.reverse();
    }
    // Initialize all the blocks.
    for (const block of blocks) {
      block.setDeletable(false);
      block.initSvg();
      block.render();
    }
    let totalArea = 0;
    // Measure the surface area of each block.
    for (const block of blocks) {
      const blockBox = block.getSvgRoot().getBBox();
      block.cached_width_ = blockBox.width;
      block.cached_height_ = blockBox.height;
      block.cached_area_ = blockBox.width * blockBox.height;
      totalArea += block.cached_area_;
    }
    // Position the blocks randomly.
    const MARGIN = 50;
    Blockly.svgResize(BlocklyInterface.workspace);
    const workspaceBox = BlocklyInterface.workspace.getCachedParentSvgSize();
    workspaceBox.width -= MARGIN;
    workspaceBox.height -= MARGIN;
    let countedArea = 0;
    for (const block of blocks) {
      const blockBox = block.getSvgRoot().getBBox();
      // Spread the blocks horizontally, grouped by type.
      // Spacing is proportional to block's area.
      let dx;
      if (rtl) {
        dx = blockBox.width +
                 (countedArea / totalArea) * workspaceBox.width;
      } else {
        dx = (countedArea / totalArea) *
                 (workspaceBox.width - blockBox.width);
      }
      dx = Math.round(dx + Math.random() * MARGIN);
      const dy = Math.round(Math.random() *
                          (workspaceBox.height - blockBox.height));
      block.moveBy(dx, dy);
      countedArea += block.cached_area_;
    }
  }
  BlocklyInterface.workspace.clearUndo();

  BlocklyGames.bindClick('checkButton', checkAnswers);
  BlocklyGames.bindClick('helpButton', function(){showHelp(true);});

  if (!savedBlocks) {
    showHelp(false);
  }

  // Make connecting blocks easier for beginners.
  Blockly.SNAP_RADIUS *= 2;
  Blockly.CONNECTING_SNAP_RADIUS = Blockly.SNAP_RADIUS;
  // Preload the win sound.
  BlocklyInterface.workspace.getAudioManager().load(
      ['puzzle/win.mp3', 'puzzle/win.ogg'], 'win');
}

/**
 * Shuffles the values in the specified array using the Fisher-Yates in-place
 * shuffle (also known as the Knuth Shuffle).
 * Runtime: O(n)
 * Based on Closure's goog.array.shuffle.
 * @param {!Array} arr The array to be shuffled.
 */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    // Choose a random array index in [0, i] (inclusive with i).
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
}

/**
 * Count and highlight the errors.
 */
function checkAnswers() {
  const blocks = BlocklyInterface.workspace.getAllBlocks(false);
  let errors = 0;
  const badBlocks = [];
  for (const block of blocks) {
    if (!block.isCorrect()) {
      errors++;
      // Bring the offending blocks to the front.
      block.select();
      badBlocks.push(block);
    }
  }

  const graphValue = BlocklyGames.getElementById('graphValue');
  setTimeout(function() {
      graphValue.style.width =
          (100 * (blocks.length - errors) / blocks.length) + 'px';
  }, 500);

  let messages;
  // Safe from HTML injection due to createTextNode below.
  if (errors === 1) {
    messages = [BlocklyGames.getMsg('Puzzle.error1', false),
                BlocklyGames.getMsg('Puzzle.tryAgain', false)];
  } else if (errors) {
    messages = [BlocklyGames.getMsg('Puzzle.error2', false).replace('%1', errors),
                BlocklyGames.getMsg('Puzzle.tryAgain', false)];
  } else {
    messages = [BlocklyGames.getMsg('Puzzle.error0', false).replace(
        '%1', blocks.length)];
    BlocklyInterface.executedCode = BlocklyInterface.getCode();
    BlocklyInterface.saveToLocalStorage();
  }
  const textDiv = BlocklyGames.getElementById('answerMessage');
  textDiv.textContent = '';
  for (const message of messages) {
    const line = document.createElement('div');
    line.appendChild(document.createTextNode(message));
    textDiv.appendChild(line);
  }

  const content = BlocklyGames.getElementById('answers');
  const button = BlocklyGames.getElementById('checkButton');
  const style = {
    width: '25%',
    left: BlocklyGames.IS_RTL ? '5%' : '70%',
    top: '5em',
  };
  const action = errors ? BlocklyDialogs.stopDialogKeyDown :
      BlocklyInterface.indexPage;
  BlocklyDialogs.showDialog(content, button, true, true, style, action);
  BlocklyDialogs.startDialogKeyDown();

  if (badBlocks.length) {
    // Pick a random bad block and blink it until the dialog closes.
    shuffle(badBlocks);
    const badBlock = badBlocks[0];
    const blink = function() {
      badBlock.select();
      if (BlocklyDialogs.isDialogVisible_) {
        setTimeout(function() {badBlock.unselect();}, 150);
        setTimeout(blink, 300);
      }
    };
    blink();
  } else {
    setTimeout(endDance, 2000);
    if (Blockly.selected) {
      Blockly.selected.unselect();
    }
  }
}

/**
 * All blocks correct.  Do the end dance.
 */
function endDance() {
  BlocklyInterface.workspace.getAudioManager().play('win', 0.5);
  // Enable dragging of workspace.  This sets Blockly to allow blocks to
  // move off-screen, rather than auto-bump them back in bounds.
  // This has no UI change, since the workspace is now permanently
  // non-interactive due to the modal winning dialog.
  BlocklyInterface.workspace.options.moveOptions.drag = true;
  const blocks = BlocklyInterface.workspace.getTopBlocks(false);
  for (let i = 0; i < blocks.length; i++) {
    const angle = 360 * (i / blocks.length);
    animate(blocks[i], angle);
  }
}

/**
 * Animate a block moving around after the puzzle is complete.
 * @param {!Blockly.Block} block Block to move.
 * @param {number} angleOffset Degrees offset in circle.
 */
function animate(block, angleOffset) {
  if (!BlocklyDialogs.isDialogVisible_) {
    // Firefox can navigate 'back' to this page with the animation running
    // but the dialog gone.
    return;
  }
  // Collect all the metrics.
  const workspaceMetrics = BlocklyInterface.workspace.getMetrics();
  const halfHeight = workspaceMetrics.viewHeight / 2;
  const halfWidth = workspaceMetrics.viewWidth / 2;
  const blockHW = block.getHeightWidth();
  const blockXY = block.getRelativeToSurfaceXY();
  if (BlocklyGames.IS_RTL) {
    blockXY.x -= blockHW.width;
  }
  let radius = Math.max(175, Math.min(halfHeight, halfWidth) -
      Math.max(blockHW.height, blockHW.width) / 2);

  const ms = Date.now();
  // Rotate the blocks around the centre.
  const angle = angleOffset + (ms / 50 % 360);
  // Vary the radius sinusoidally.
  radius *= Math.sin(((ms % 5000) / 5000) * (Math.PI * 2)) / 8 + 7 / 8;
  const targetX = angleDx(angle, radius) + halfWidth -
      blockHW.width / 2;
  const targetY = angleDy(angle, radius) + halfHeight -
      blockHW.height / 2;
  const speed = 5;

  const distance = Math.sqrt(Math.pow(targetX - blockXY.x, 2) +
                             Math.pow(targetY - blockXY.y, 2));
  let dx, dy;
  if (distance < speed) {
    dx = targetX - blockXY.x;
    dy = targetY - blockXY.y;
  } else {
    const heading = pointsToAngle(blockXY.x, blockXY.y, targetX, targetY);
    dx = Math.round(angleDx(heading, speed));
    dy = Math.round(angleDy(heading, speed));
  }
  block.moveBy(dx, dy);
  setTimeout(animate, 50, block, angleOffset);
}

/**
 * For a given angle and radius, finds the X portion of the offset.
 * Copied from Closure's goog.math.angleDx.
 * @param {number} degrees Angle in degrees (zero points in +X direction).
 * @param {number} radius Radius.
 * @returns {number} The x-distance for the angle and radius.
 */
function angleDx(degrees, radius) {
  return radius * Math.cos(Blockly.utils.math.toRadians(degrees));
}

/**
 * For a given angle and radius, finds the Y portion of the offset.
 * Copied from Closure's goog.math.angleDy.
 * @param {number} degrees Angle in degrees (zero points in +X direction).
 * @param {number} radius Radius.
 * @returns {number} The y-distance for the angle and radius.
 */
function angleDy(degrees, radius) {
  return radius * Math.sin(Blockly.utils.math.toRadians(degrees));
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
 * Show the help pop-up.
 * @param {boolean} animate Animate the pop-up opening.
 */
function showHelp(animate) {
  const xml = [
      '<xml>',
        '<block type="animal" x="5" y="5">',
          '<mutation animal="1"></mutation>',
          '<title name="LEGS">1</title>',
          '<value name="PIC">',
            '<block type="picture">',
              '<mutation animal="1"></mutation>',
            '</block>',
          '</value>',
          '<statement name="TRAITS">',
            '<block type="trait">',
              '<mutation animal="1" trait="2"></mutation>',
              '<next>',
                '<block type="trait">',
                  '<mutation animal="1" trait="1"></mutation>',
                '</block>',
              '</next>',
            '</block>',
          '</statement>',
        '</block>',
      '</xml>'];
  BlocklyInterface.injectReadonly('sample', xml);

  const help = BlocklyGames.getElementById('help');
  const button = BlocklyGames.getElementById('helpButton');
  const style = {
    width: '50%',
    left: '25%',
    top: '5em',
  };
  BlocklyDialogs.showDialog(help, button, animate, true, style,
      BlocklyDialogs.stopDialogKeyDown);
  BlocklyDialogs.startDialogKeyDown();
}

BlocklyGames.callWhenLoaded(init);
