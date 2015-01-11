/**
 * Blockly Games: Puzzle
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
 * @fileoverview JavaScript for Blockly's Puzzle application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Puzzle');

goog.require('Puzzle.soy');
goog.require('Puzzle.Blocks');
goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('goog.math');


BlocklyGames.NAME = 'puzzle';

/**
 * Initialize Blockly and the puzzle.  Called on page load.
 */
Puzzle.init = function() {
  // Render the Soy template.
  document.body.innerHTML = Puzzle.soy.start({}, null,
      {lang: BlocklyGames.LANG,
       html: BlocklyGames.IS_HTML});

  BlocklyInterface.init();

  var rtl = BlocklyGames.isRtl();
  var blocklyDiv = document.getElementById('blockly');
  var onresize = function(e) {
    blocklyDiv.style.width = (window.innerWidth - 20) + 'px';
    blocklyDiv.style.height =
        (window.innerHeight - blocklyDiv.offsetTop - 15) + 'px';
  };
  onresize();
  window.addEventListener('resize', onresize);

  Blockly.inject(document.getElementById('blockly'),
      {'media': 'media/',
       'rtl': rtl,
       'scrollbars': false,
       'trashcan': false});

  var savedBlocks =
      BlocklyGames.loadFromLocalStorage(BlocklyGames.NAME, BlocklyGames.LEVEL);
  // Add the blocks.
  try {
    var loadOnce = window.sessionStorage.loadOnceBlocks;
  } catch (e) {
    // Firefox sometimes throws a SecurityError when accessing sessionStorage.
    // Restarting Firefox fixes this, so it looks like a bug.
    var loadOnce = null;
  }
  if (loadOnce) {
    delete window.sessionStorage.loadOnceBlocks;
    var xml = Blockly.Xml.textToDom(loadOnce);
    Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
  } else if (savedBlocks) {
    var xml = Blockly.Xml.textToDom(savedBlocks);
    Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
  } else {
    // Create one of every block.
    var blocksAnimals = [];
    var blocksPictures = [];
    var blocksTraits = [];
    var i = 1;
    while (BlocklyGames.getMsgOrNull('Puzzle_animal' + i)) {
      var block = Blockly.Block.obtain(Blockly.mainWorkspace, 'animal');
      block.populate(i);
      blocksAnimals.push(block);
      var block = Blockly.Block.obtain(Blockly.mainWorkspace, 'picture');
      block.populate(i);
      blocksPictures.push(block);
      var j = 1;
      while (BlocklyGames.getMsgOrNull('Puzzle_animal' + i + 'Trait' + j)) {
        var block = Blockly.Block.obtain(Blockly.mainWorkspace, 'trait');
        block.populate(i, j);
        blocksTraits.push(block);
        j++;
      }
      i++;
    }
    Puzzle.shuffle(blocksAnimals);
    Puzzle.shuffle(blocksPictures);
    Puzzle.shuffle(blocksTraits);
    var blocks = [].concat(blocksAnimals, blocksPictures, blocksTraits);
    if (rtl) {
      blocks.reverse();
    }
    // Initialize all the blocks.
    for (var i = 0, block; block = blocks[i]; i++) {
      block.setDeletable(false);
      block.initSvg();
      block.render();
    }
    var totalArea = 0;
    // Measure the surface area of each block.
    for (var i = 0, block; block = blocks[i]; i++) {
      var blockBox = block.getSvgRoot().getBBox();
      block.cached_width_ = blockBox.width;
      block.cached_height_ = blockBox.height;
      block.cached_area_ = blockBox.width * blockBox.height;
      totalArea += block.cached_area_;
    }
    // Position the blocks randomly.
    var MARGIN = 50;
    Blockly.svgResize();
    var workspaceBox = Blockly.svgSize();
    workspaceBox.width -= MARGIN;
    workspaceBox.height -= MARGIN;
    var countedArea = 0;
    for (var i = 0, block; block = blocks[i]; i++) {
      var blockBox = block.getSvgRoot().getBBox();
      // Spread the blocks horizontally, grouped by type.
      // Spacing is proportional to block's area.
      if (rtl) {
        var dx = blockBox.width +
                 (countedArea / totalArea) * workspaceBox.width;
      } else {
        var dx = (countedArea / totalArea) *
                 (workspaceBox.width - blockBox.width);
      }
      dx = Math.round(dx + Math.random() * MARGIN);
      var dy = Math.round(Math.random() *
                          (workspaceBox.height - blockBox.height));
      block.moveBy(dx, dy);
      countedArea += block.cached_area_;
    }
  }

  BlocklyGames.bindClick('checkButton', Puzzle.checkAnswers);
  BlocklyGames.bindClick('helpButton', function(){Puzzle.showHelp(true);});

  if (!savedBlocks) {
    Puzzle.showHelp(false);
  }

  /**
   * HACK:
   * Chrome (v28) displays a broken image tag on any image that is also
   * shown in the help dialog.  Selecting the block fixes the problem.
   * If Chrome stops corrupting the Duck picture, delete this entire hack.
   */
  if (goog.userAgent.WEBKIT) {
    var blocks = Blockly.mainWorkspace.getAllBlocks();
    for (var i = 0, block; block = blocks[i]; i++) {
      block.select();
    }
    Blockly.selected.unselect();
  }

  // Make connecting blocks easier for beginners.
  Blockly.SNAP_RADIUS *= 2;
  // Preload the win sound.
  Blockly.loadAudio_(['puzzle/win.mp3', 'puzzle/win.ogg'], 'win');
};

if (window.location.pathname.match(/readonly.html$/)) {
  window.addEventListener('load', function() {
    BlocklyInterface.initReadonly(Puzzle.soy.readonly());
  });
} else {
  window.addEventListener('load', Puzzle.init);
}

/**
 * Shuffles the values in the specified array using the Fisher-Yates in-place
 * shuffle (also known as the Knuth Shuffle).
 * Runtime: O(n)
 * Based on Closure's goog.array.shuffle.
 * @param {!Array} arr The array to be shuffled.
 */
Puzzle.shuffle = function(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    // Choose a random array index in [0, i] (inclusive with i).
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
};

/**
 * Return a list of all legs.
 * @return {!Array<!Array<string>>} Array of human-readable and
 *   language-neutral tuples.
 */
Puzzle.legs = function() {
  var list = [[BlocklyGames.getMsg('Puzzle_legsChoose'), '0']];
  var i = 1;
  var legs;
  while (legs = BlocklyGames.getMsgOrNull('Puzzle_animal' + i + 'Legs')) {
    list[i] = [legs, String(i)];
    i++;
  }
  // Sort numericallly.
  list.sort(function(a, b) {return a[0] - b[0];});
  return list;
};

/**
 * Count and highlight the errors.
 */
Puzzle.checkAnswers = function() {
  var blocks = Blockly.mainWorkspace.getAllBlocks();
  var errors = 0;
  var badBlocks = [];
  for (var b = 0, block; block = blocks[b]; b++) {
    if (!block.isCorrect()) {
      errors++;
      // Bring the offending blocks to the front.
      block.select();
      badBlocks.push(block);
    }
  }

  var graphValue = document.getElementById('graphValue');
  setTimeout(function() {
      graphValue.style.width =
          (100 * (blocks.length - errors) / blocks.length) + 'px';
  }, 500);

  var messages;
  if (errors == 1) {
    messages = [BlocklyGames.getMsg('Puzzle_error1'),
                BlocklyGames.getMsg('Puzzle_tryAgain')];
  } else if (errors) {
    messages = [BlocklyGames.getMsg('Puzzle_error2').replace('%1', errors),
                BlocklyGames.getMsg('Puzzle_tryAgain')];
  } else {
    messages = [BlocklyGames.getMsg('Puzzle_error0').replace(
        '%1', blocks.length)];
    BlocklyInterface.saveToLocalStorage();
  }
  var textDiv = document.getElementById('answerMessage');
  textDiv.textContent = '';
  for (var i = 0; i < messages.length; i++) {
    var line = document.createElement('div');
    line.appendChild(document.createTextNode(messages[i]));
    textDiv.appendChild(line);
  }

  var content = document.getElementById('answers');
  var button = document.getElementById('checkButton');
  var rtl = BlocklyGames.isRtl();
  var style = {
    width: '25%',
    left: rtl ? '5%' : '70%',
    top: '5em'
  };
  var action = errors ? BlocklyDialogs.stopDialogKeyDown :
      BlocklyInterface.indexPage;
  BlocklyDialogs.showDialog(content, button, true, true, style, action);
  BlocklyDialogs.startDialogKeyDown();

  if (badBlocks.length) {
    // Pick a random bad block and blink it until the dialog closes.
    Puzzle.shuffle(badBlocks);
    var badBlock = badBlocks[0];
    var blink = function() {
      badBlock.select();
      if (BlocklyDialogs.isDialogVisible_) {
        setTimeout(function() {badBlock.unselect();}, 150);
        setTimeout(blink, 300);
      }
    };
    blink();
  } else {
    setTimeout(Puzzle.endDance, 2000);
    if (Blockly.selected) {
      Blockly.selected.unselect();
    }
  }
};

/**
 * All blocks correct.  Do the end dance.
 */
Puzzle.endDance = function() {
  Blockly.playAudio('win', 0.5);
  var blocks = Blockly.mainWorkspace.getTopBlocks(false);
  for (var i = 0, block; block = blocks[i]; i++) {
    var angle = 360 * (i / blocks.length);
    Puzzle.animate(block, angle);
  }
};

/**
 * Animate a block moving around after the puzzle is complete.
 * @param {!Blockly.Block} block Block to move.
 * @param {number} angleOffset Degrees offset in circle.
 */
Puzzle.animate = function(block, angleOffset) {
  if (!BlocklyDialogs.isDialogVisible_) {
    // Firefox can navigate 'back' to this page with the animation running
    // but the dialog gone.
    return;
  }
  // Collect all the metrics.
  var workspaceMetrics = Blockly.mainWorkspace.getMetrics();
  var halfHeight = workspaceMetrics.viewHeight / 2;
  var halfWidth = workspaceMetrics.viewWidth / 2;
  var blockXY = block.getRelativeToSurfaceXY();
  var blockHW = block.getHeightWidth();
  var radius = Math.max(175, Math.min(halfHeight, halfWidth) -
      Math.max(blockHW.height, blockHW.width) / 2);

  var ms = Date.now();
  // Rotate the blocks around the centre.
  var angle = angleOffset + (ms / 50 % 360);
  // Vary the radius sinusoidally.
  radius *= Math.sin(((ms % 5000) / 5000) * (Math.PI * 2)) / 8 + 7 / 8;
  var targetX = goog.math.angleDx(angle, radius) + halfWidth -
      blockHW.width / 2;
  var targetY = goog.math.angleDy(angle, radius) + halfHeight -
      blockHW.height / 2;
  var speed = 5;

  var distance = Math.sqrt(Math.pow(targetX - blockXY.x, 2) +
                           Math.pow(targetY - blockXY.y, 2));
  if (distance < speed) {
    var dx = targetX - blockXY.x;
    var dy = targetY - blockXY.y;
  } else {
    var heading = goog.math.angle(blockXY.x, blockXY.y, targetX, targetY);
    var dx = Math.round(goog.math.angleDx(heading, speed));
    var dy = Math.round(goog.math.angleDy(heading, speed));
  }
  block.moveBy(dx, dy);
  setTimeout(Puzzle.animate.bind(null, block, angleOffset), 50);
};

/**
 * Show the help pop-up.
 * @param {boolean} animate Animate the pop-up opening.
 */
Puzzle.showHelp = function(animate) {
  var help = document.getElementById('help');
  var button = document.getElementById('helpButton');
  var style = {
    width: '50%',
    left: '25%',
    top: '5em'
  };
  BlocklyDialogs.showDialog(help, button, animate, true, style,
      BlocklyDialogs.stopDialogKeyDown);
  BlocklyDialogs.startDialogKeyDown();
};
