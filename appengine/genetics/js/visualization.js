/**
 * Blockly Games: Genetics
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview JavaScript for the visualization of the Genetics game.
 * @author kozbial@google.com (Monica Kozbial)
 */
'use strict';

goog.provide('Genetics.Visualization');

goog.require('Genetics.Cage');


/**
 * Frames per second to draw.  Has no impact on game play, just the display.
 */
Genetics.Visualization.FPS = 36;

/**
 * Mapping of mouse id to mouse for mice currently being visualized.
 * @type {!Object.<number, Genetics.Mouse>}
 */
Genetics.Visualization.MICE = {};

/**
 * Mapping of mouse id to x,y position.
 * @type {!Object.<number, Array<number>>}
 */
Genetics.Visualization.MICE_LOCATIONS = {};

/**
 * PID of executing task.
 * @type {number}
 */
Genetics.Visualization.pid = 0;

/**
 * Setup the visualization (run once).
 */
Genetics.Visualization.init = function() {
};

/**
 * Stop visualization.
 */
Genetics.Visualization.stop = function() {
  clearTimeout(Genetics.Visualization.pid);
};

/**
 * Stop and reset the visualization.
 */
Genetics.Visualization.reset = function() {
  Genetics.Visualization.stop();
  Genetics.Visualization.MICE.length = 0;
  Genetics.Visualization.MICE_LOCATIONS.length = 0;
};

/**
 * Time when the previous frame was drawn.
 */
Genetics.Visualization.lastFrame = 0;

/**
 * Delay between previous frame was drawn and the current frame was scheduled.
 */
Genetics.Visualization.lastDelay = 0;

/**
 * Start the visualization running.
 */
Genetics.Visualization.start = function() {
  Genetics.Visualization.update();
};

/**
 * Start the visualization running.
 */
Genetics.Visualization.update = function() {
  Genetics.Visualization.display_();
  Genetics.Visualization.handleEvents_();
  // Frame done.  Calculate the actual elapsed time and schedule the next frame.
  var now = Date.now();
  var workTime = now - Genetics.Visualization.lastFrame -
      Genetics.Visualization.lastDelay;
  var delay = Math.max(1, (1000 / Genetics.Visualization.FPS) - workTime);
  Genetics.Visualization.pid = setTimeout(Genetics.Visualization.update, delay);
  Genetics.Visualization.lastFrame = now;
  Genetics.Visualization.lastDelay = delay;
};

/**
 * Visualize the current state of the cage simulation (Genetics.Cage).
 * @private
 */
Genetics.Visualization.display_ = function() {
  // TODO(kozbial) draw current state of the screen.
};

/**
 * Handle events in Cage events queue.
 * @private
 */
Genetics.Visualization.handleEvents_ = function() {
  // Handle any queued events.
  for (var i = 0; i < Genetics.Cage.EVENTS.length; i++) {
    var event = Genetics.Cage.EVENTS[i];
    console.log(JSON.stringify(event, null, 4));
  }
  Genetics.Cage.EVENTS.length = 0;
};
