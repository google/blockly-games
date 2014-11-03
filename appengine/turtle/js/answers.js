/**
 * Blockly Games: Turtle Graphics Answers
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
 * @fileoverview Sample answers for Turtle levels. Used for prompts and marking.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Turtle.Answers');


/**
 * Sample solutions for each level.
 * To create an answer, just solve the level in Blockly, then paste the
 * resulting JavaScript here, moving any functions to the beginning of
 * this function.
 */
Turtle.answer = function() {
  // Helper functions.
  function drawStar(length) {
    for (var count = 0; count < 5; count++) {
      Turtle.move(length);
      Turtle.turn(144);
    }
  }

  switch (BlocklyGames.LEVEL) {
    case 1:
      // Square.
      for (var count = 0; count < 4; count++) {
        Turtle.move(100);
        Turtle.turn(90);
      }
      break;
    case 2:
      // Pentagon.
      for (var count = 0; count < 5; count++) {
        Turtle.move(100);
        Turtle.turn(72);
      }
      break;
    case 3:
      // Star.
      Turtle.penColour('#ffff00');
      drawStar(100);
      break;
    case 4:
      // Pen up/down.
      Turtle.penColour('#ffff00');
      drawStar(50);
      Turtle.penDown(false);
      Turtle.move(150);
      Turtle.penDown(true);
      Turtle.move(20);
      break;
    case 5:
      // Four stars.
      Turtle.penColour('#ffff00');
      for (var count = 0; count < 4; count++) {
        Turtle.penDown(false);
        Turtle.move(150);
        Turtle.turn(90);
        Turtle.penDown(true);
        drawStar(50);
      }
      break;
    case 6:
      // Three stars and a line.
      Turtle.penColour('#ffff00');
      for (var count = 0; count < 3; count++) {
        Turtle.penDown(false);
        Turtle.move(150);
        Turtle.turn(120);
        Turtle.penDown(true);
        drawStar(50);
      }
      Turtle.penDown(false);
      Turtle.turn(-90);
      Turtle.move(100);
      Turtle.penDown(true);
      Turtle.penColour('#ffffff');
      Turtle.move(50);
      break;
    case 7:
      // Three stars and 4 lines.
      Turtle.penColour('#ffff00');
      for (var count = 0; count < 3; count++) {
        Turtle.penDown(false);
        Turtle.move(150);
        Turtle.turn(120);
        Turtle.penDown(true);
        drawStar(50);
      }
      Turtle.penDown(false);
      Turtle.turn(-90);
      Turtle.move(100);
      Turtle.penDown(true);
      Turtle.penColour('#ffffff');
      for (var count = 0; count < 4; count++) {
        Turtle.move(50);
        Turtle.move(-50);
        Turtle.turn(45);
      }
      break;
    case 8:
      // Three stars and a circle.
      Turtle.penColour('#ffff00');
      for (var count = 0; count < 3; count++) {
        Turtle.penDown(false);
        Turtle.move(150);
        Turtle.turn(120);
        Turtle.penDown(true);
        drawStar(50);
      }
      Turtle.penDown(false);
      Turtle.turn(-90);
      Turtle.move(100);
      Turtle.penDown(true);
      Turtle.penColour('#ffffff');
      for (var count = 0; count < 360; count++) {
        Turtle.move(50);
        Turtle.move(-50);
        Turtle.turn(1);
      }
      break;
    case 9:
      // Three stars and a crescent.
      Turtle.penColour('#ffff00');
      for (var count = 0; count < 3; count++) {
        Turtle.penDown(false);
        Turtle.move(150);
        Turtle.turn(120);
        Turtle.penDown(true);
        drawStar(50);
      }
      Turtle.penDown(false);
      Turtle.turn(-90);
      Turtle.move(100);
      Turtle.penDown(true);
      Turtle.penColour('#ffffff');
      for (var count = 0; count < 360; count++) {
        Turtle.move(50);
        Turtle.move(-50);
        Turtle.turn(1);
      }
      Turtle.turn(120);
      Turtle.move(20);
      Turtle.penColour('#000000');
      for (var count = 0; count < 360; count++) {
        Turtle.move(50);
        Turtle.move(-50);
        Turtle.turn(1);
      }
      break;
  }
};

/**
 * Validate whether the user's answer is correct.
 * @param {number} pixelErrors Number of pixels that are wrong.
 * @return {boolean} True if the level is solved, false otherwise.
 */
Turtle.isCorrect = function(pixelErrors) {
  if (BlocklyGames.LEVEL == BlocklyGames.MAX_LEVEL) {
    // Any non-null answer is correct.
    return Blockly.mainWorkspace.getAllBlocks().length > 1;
  }
  console.log('Pixel errors: ' + pixelErrors);
  if (pixelErrors > 100) {
    // Too many errors.
    return false;
  }
  if ((BlocklyGames.LEVEL <= 2 &&
       Blockly.mainWorkspace.getAllBlocks().length > 3) ||
      (BlocklyGames.LEVEL == 3 &&
       Blockly.mainWorkspace.getAllBlocks().length > 4)) {
    // Use a loop, dummy.
    var content = document.getElementById('helpUseLoop');
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
  return true;
};
