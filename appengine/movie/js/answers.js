/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Sample answers for Turtle levels. Used for prompts and marking.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Movie.Answers');


/**
 * Sample solutions for each level.
 * To create an answer, just solve the level in Blockly, then paste the
 * resulting JavaScript here, moving any functions to the beginning of
 * this function.
 * @param {number} f Frame number (0-100).
 */
Movie.answer = function(f) {
  function time() {
    return f;
  }
  switch (BlocklyGames.LEVEL) {
    case 1:
      // Static person.
      Movie.penColour('#ff0000');
      Movie.circle(50, 70, 10);
      Movie.penColour('#3333ff');
      Movie.rect(50, 40, 20, 40);
      Movie.penColour('#000000');
      Movie.line(40, 50, 20, 70, 5);
      Movie.line(60, 50, 80, 70, 5);
      break;
    case 2:
      // Right hand moving up.
      Movie.penColour('#ff0000');
      Movie.circle(50, 70, 10);
      Movie.penColour('#3333ff');
      Movie.rect(50, 40, 20, 40);
      Movie.penColour('#000000');
      Movie.line(40, 50, 20, 70, 5);
      Movie.line(60, 50, 80, time(), 5);
      break;
    case 3:
      // Left hand moving down.
      Movie.penColour('#ff0000');
      Movie.circle(50, 70, 10);
      Movie.penColour('#3333ff');
      Movie.rect(50, 40, 20, 40);
      Movie.penColour('#000000');
      Movie.line(40, 50, 20, 100 - time(), 5);
      Movie.line(60, 50, 80, time(), 5);
      break;
    case 4:
      // Legs cross.
      Movie.penColour('#ff0000');
      Movie.circle(50, 70, 10);
      Movie.penColour('#3333ff');
      Movie.rect(50, 40, 20, 40);
      Movie.penColour('#000000');
      Movie.line(40, 50, 20, 100 - time(), 5);
      Movie.line(60, 50, 80, time(), 5);
      Movie.line(40, 20, time(), 0, 5);
      Movie.line(60, 20, 100 - time(), 0, 5);
      break;
    case 5:
      // Right arm parabola.
      Movie.penColour('#ff0000');
      Movie.circle(50, 70, 10);
      Movie.penColour('#3333ff');
      Movie.rect(50, 40, 20, 40);
      Movie.penColour('#000000');
      Movie.line(40, 50, 20, 100 - time(), 5);
      Movie.line(60, 50, 80, Math.pow((time() - 50) / 5, 2), 5);
      Movie.line(40, 20, time(), 0, 5);
      Movie.line(60, 20, 100 - time(), 0, 5);
      break;
    case 6:
      // Hands.
      Movie.penColour('#ff0000');
      Movie.circle(50, 70, 10);
      Movie.penColour('#3333ff');
      Movie.rect(50, 40, 20, 40);
      Movie.penColour('#000000');
      Movie.line(40, 50, 20, 100 - time(), 5);
      Movie.line(60, 50, 80, Math.pow((time() - 50) / 5, 2), 5);
      Movie.line(40, 20, time(), 0, 5);
      Movie.line(60, 20, 100 - time(), 0, 5);
      Movie.penColour('#ff0000');
      Movie.circle(20, 100 - time(), 5);
      Movie.circle(80, Math.pow((time() - 50) / 5, 2), 5);
      break;
    case 7:
      // Head.
      Movie.penColour('#ff0000');
      if (time() < 50) {
        Movie.circle(50, 70, 10);
      } else {
        Movie.circle(50, 80, 20);
      }
      Movie.penColour('#3333ff');
      Movie.rect(50, 40, 20, 40);
      Movie.penColour('#000000');
      Movie.line(40, 50, 20, 100 - time(), 5);
      Movie.line(60, 50, 80, Math.pow((time() - 50) / 5, 2), 5);
      Movie.line(40, 20, time(), 0, 5);
      Movie.line(60, 20, 100 - time(), 0, 5);
      Movie.penColour('#ff0000');
      Movie.circle(20, 100 - time(), 5);
      Movie.circle(80, Math.pow((time() - 50) / 5, 2), 5);
      break;
    case 8:
      // Legs reverse.
      Movie.penColour('#ff0000');
      if (time() < 50) {
        Movie.circle(50, 70, 10);
      } else {
        Movie.circle(50, 80, 20);
      }
      Movie.penColour('#3333ff');
      Movie.rect(50, 40, 20, 40);
      Movie.penColour('#000000');
      Movie.line(40, 50, 20, 100 - time(), 5);
      Movie.line(60, 50, 80, Math.pow((time() - 50) / 5, 2), 5);
      if (time() < 50) {
        Movie.line(40, 20, time(), 0, 5);
        Movie.line(60, 20, 100 - time(), 0, 5);
      } else {
        Movie.line(40, 20, 100 - time(), 0, 5);
        Movie.line(60, 20, time(), 0, 5);
      }
      Movie.penColour('#ff0000');
      Movie.circle(20, 100 - time(), 5);
      Movie.circle(80, Math.pow((time() - 50) / 5, 2), 5);
      break;
    case 9:
      // Background.
      Movie.penColour('#00ff00');
      Movie.circle(50, time() / 2, time() / 2);
      Movie.penColour('#ff0000');
      if (time() < 50) {
        Movie.circle(50, 70, 10);
      } else {
        Movie.circle(50, 80, 20);
      }
      Movie.penColour('#3333ff');
      Movie.rect(50, 40, 20, 40);
      Movie.penColour('#000000');
      Movie.line(40, 50, 20, 100 - time(), 5);
      Movie.line(60, 50, 80, Math.pow((time() - 50) / 5, 2), 5);
      if (time() < 50) {
        Movie.line(40, 20, time(), 0, 5);
        Movie.line(60, 20, 100 - time(), 0, 5);
      } else {
        Movie.line(40, 20, 100 - time(), 0, 5);
        Movie.line(60, 20, time(), 0, 5);
      }
      Movie.penColour('#ff0000');
      Movie.circle(20, 100 - time(), 5);
      Movie.circle(80, Math.pow((time() - 50) / 5, 2), 5);
      break;
  }
};

/**
 * Validate whether the user's answer is correct.
 * @return {boolean} True if the level is solved, false otherwise.
 */
Movie.isCorrect = function() {
  if (BlocklyGames.LEVEL == BlocklyGames.MAX_LEVEL) {
    // Any non-null answer is correct.
    return BlocklyInterface.workspace.getAllBlocks().length > 1;
  }
  // Check the already recorded pixel errors on every frame.
  for (var f = 0; f <= Movie.FRAMES; f++) {
    if (f == 50) {
      // Don't check the middle frame.  Makes pesky off-by-one errors go away.
      // E.g. if (time < 50) vs if (time <= 50)
      continue;
    } else if (Movie.pixelErrors[f] === undefined) {
      // Not rendered yet.
      return false;
    } else if (Movie.pixelErrors[f] > 100) {
      // Too many errors.
      console.log('Pixel errors (frame ' + f + '): ' + Movie.pixelErrors[f]);
      return false;
    }
  }
  if (BlocklyGames.LEVEL == 9) {
    // Ensure that the background is behind the figure, not in front.
    var blocks = BlocklyInterface.workspace.getAllBlocks(true);
    for (var i = 0, block; (block = blocks[i]); i++) {
      if (block.type == 'movie_circle') {
        // Check that the radius on the first circle block is connected to a
        // division block.
        if (block.getInputTargetBlock('RADIUS').type != 'math_arithmetic') {
          var content = document.getElementById('helpLayer');
          var style = {
            'width': '30%',
            'left': '35%',
            'top': '12em'
          };
          BlocklyDialogs.showDialog(content, null, false, true, style,
              BlocklyDialogs.stopDialogKeyDown);
          BlocklyDialogs.startDialogKeyDown();
          return false;
        }
        break;
      }
    }
  }
  return true;
};
