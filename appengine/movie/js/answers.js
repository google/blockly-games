/**
 * Blockly Games: Movie Answers
 *
 * Copyright 2014 Google Inc.
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
      Movie.circle(50, 80, 10);
      Movie.penColour('#3333ff');
      Movie.rect(50, 40, 20, 60);
      Movie.penColour('#000000');
      Movie.line(20, 70, 50, 50, 5);
      Movie.line(50, 50, 80, 70, 5);
      break;
    case 2:
      // Circle moving.
      Movie.penColour('#ff0000');
      Movie.circle(time(), 50, 10);
      break;
    case 3:
      // Circle moving backward.
      Movie.penColour('#ff0000');
      Movie.circle(100 - time(), 50, 10);
      break;
    case 4:
      // Four circles.
      Movie.penColour('#009900');  // Green.
      Movie.circle(time(), 50, 20);
      Movie.circle(100 - time(), 50, 20);
      Movie.circle(50, 100 - time(), 20);
      Movie.circle(50, time(), 20);
      break;
    case 5:
      // Mouse.
      Movie.circle(30, time() + 20, 10);
      Movie.circle(50, time(), 20);
      Movie.circle(70, time() + 20, 10);
      break;
    case 6:
      // Two lines.
      Movie.line(100 - time(), 100, time(), time(), 1);
      Movie.line(time(), time(), 100 - time(), 0, 1);
      break;
    case 7:
      // Parabolic ball.
      Movie.penColour('#009900');
      Movie.circle(time(), 100 - Math.pow((time() - 50) / 5, 2), 10);
      break;
    case 8:
      // Colliding circles.
      if (time() < 50) {
        Movie.penColour('#ff0000');
        Movie.circle(time(), time(), 10);
        Movie.penColour('#3333ff');
        Movie.circle(100 - time(), 100 - time(), 10);
      } else {
        Movie.penColour('#009900');
        Movie.circle(50, 50, 10);
      }
      break;
    case 9:
      // Follow the wire.
      Movie.penColour('#999999');
      Movie.line(0, 40, 20, 40, 1);
      Movie.line(20, 40, 20, 80, 1);
      Movie.line(20, 80, 80, 20, 1);

      Movie.penColour('#009900');
      if (time() < 20) {
        Movie.circle(time(), 40, 10);
      } else if (time() < 40) {
        Movie.circle(20, time() * 2, 10);
      } else {
        Movie.circle(time() - 20, 120 - time(), 10);
      }
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
    return Blockly.mainWorkspace.getAllBlocks().length > 1;
  }
  // Check the already recorded pixel errors on every frame.
  for (var f = 0; f <= Movie.FRAMES; f++) {
    if (Movie.pixelErrors[f] === undefined) {
      // Not rendered yet.
      return false;
    } else if (Movie.pixelErrors[f] > 100) {
      // Too many errors.
      console.log('Pixel errors (frame ' + f + '): ' + Movie.pixelErrors[f]);
      return false;
    }
  }
  return true;
};
