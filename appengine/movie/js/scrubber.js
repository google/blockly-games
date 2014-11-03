/**
 * Blockly Games: Video Scrubber
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
 * @fileoverview A scrubber control for video.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Scrubber');

goog.require('goog.math');
goog.require('BlocklyGames');


/**
 * Object representing a horizontal scrubber widget.
 * @param {!Element} svgParent The SVG element to append the slider to.
 * @param {Function} opt_changeFunc Optional callback function that will be
 *     called when the scrubber is moved.  The current value is passed.
 * @constructor
 */
Scrubber = function(svgParent, opt_changeFunc) {
  this.KNOB_MIN_X_ = 42;
  this.KNOB_MAX_X_ = 328;
  this.HEIGHT_ = 11.5;
  this.TARGET_OVERHANG_ = 12;
  this.value_ = 0;
  this.changeFunc_ = opt_changeFunc;
  this.animationTasks_ = [];
  this.progressRects_ = [];

  // Draw the frame text.
  var text = document.createElementNS(Scrubber.SVG_NS_, 'text');
  text.setAttribute('style', 'font-size: 10pt');
  text.setAttribute('x', this.KNOB_MAX_X_ + 9);
  text.setAttribute('y', 16);
  svgParent.appendChild(text);
  this.text_ = text;

  // Draw the progress bar.
  var colours = ['#ff3333', '#f72f2f', '#ef2a2a', '#e72727',
                 '#df2222', '#d71f1f', '#cf1a1a'];
  for (var i = 0; i < colours.length; i++) {
    var rect = document.createElementNS(Scrubber.SVG_NS_, 'rect');
    rect.setAttribute('style', 'fill: ' + colours[i]);
    rect.setAttribute('x', this.KNOB_MIN_X_);
    rect.setAttribute('y', 8 + i);
    rect.setAttribute('height', 1);
    svgParent.appendChild(rect);
    this.progressRects_[i] = rect;
  }

  // Draw the slider.
  /*
  <rect style="opacity: 0" x="5" y="25" width="150" height="20" />
  <clipPath id="knobClipPath">
    <rect width="16" height="16" y="3" />
  </clipPath>
  <image xlink:href="movie/icons.png" width="63" height="42" y="3"
      clip-path="url(#knobClipPath)" />
  <circle style="opacity: 0" r="20" cy="35" cx="75"></circle>
  */
  var rect = document.createElementNS(Scrubber.SVG_NS_, 'rect');
  rect.setAttribute('style', 'opacity: 0');
  rect.setAttribute('x', this.KNOB_MIN_X_ - this.TARGET_OVERHANG_);
  rect.setAttribute('y', this.HEIGHT_ - this.TARGET_OVERHANG_);
  rect.setAttribute('width',  this.KNOB_MAX_X_ - this.KNOB_MIN_X_ +
                    2 * this.TARGET_OVERHANG_);
  rect.setAttribute('height', 2 * this.TARGET_OVERHANG_);
  rect.setAttribute('rx', this.TARGET_OVERHANG_);
  rect.setAttribute('ry', this.TARGET_OVERHANG_);
  svgParent.appendChild(rect);
  var trackTarget = rect;
  var knobClip = document.createElementNS(Scrubber.SVG_NS_, 'clipPath');
  knobClip.setAttribute('id', 'knobClipPath');
  svgParent.appendChild(knobClip);
  var knobClipRect = document.createElementNS(Scrubber.SVG_NS_, 'rect');
  knobClipRect.setAttribute('width', '16');
  knobClipRect.setAttribute('height', '16');
  knobClipRect.setAttribute('y', '3');
  knobClip.appendChild(knobClipRect);
  this.knobClipRect_ = knobClipRect;
  var knob = document.createElementNS(Scrubber.SVG_NS_, 'image');
  knob.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      'movie/icons.png');
  knob.setAttribute('clip-path', 'url(#knobClipPath)');
  knob.setAttribute('width', '63');
  knob.setAttribute('height', '42');
  knob.setAttribute('y', '3');
  svgParent.appendChild(knob);
  this.knob_ = knob;
  var rect = document.createElementNS(Scrubber.SVG_NS_, 'rect');
  rect.setAttribute('style', 'opacity: 0');
  rect.setAttribute('width', 2 * this.TARGET_OVERHANG_);
  rect.setAttribute('height', 2 * this.TARGET_OVERHANG_);
  rect.setAttribute('y', this.HEIGHT_ - this.TARGET_OVERHANG_);
  svgParent.appendChild(rect);
  this.knobTarget_ = rect;
  this.setValue(0);

  // Draw the Play button.
  /*
  <clipPath id="playClipPath">
    <rect width=21 height=21 x=5 y=14 />
  </clipPath>
  <image xlink:href="movie/icons.png" width="63" height="42" y="-20"
      clip-path="url(#playClipPath)" />
  */
  var playClip = document.createElementNS(Scrubber.SVG_NS_, 'clipPath');
  playClip.setAttribute('id', 'playClipPath');
  svgParent.appendChild(playClip);
  var playClipRect = document.createElementNS(Scrubber.SVG_NS_, 'rect');
  playClipRect.setAttribute('width', '21');
  playClipRect.setAttribute('height', '21');
  playClipRect.setAttribute('x', '4');
  playClipRect.setAttribute('y', '1');
  playClip.appendChild(playClipRect);
  var play = document.createElementNS(Scrubber.SVG_NS_, 'image');
  play.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      'movie/icons.png');
  play.setAttribute('clip-path', 'url(#playClipPath)');
  play.setAttribute('width', '63');
  play.setAttribute('height', '42');
  play.setAttribute('x', 4 - 21);
  play.setAttribute('y', '-20');
  svgParent.appendChild(play);
  this.play_ = play;


  // Find the root SVG object.
  while (svgParent && svgParent.nodeName.toLowerCase() != 'svg') {
    svgParent = svgParent.parentNode;
  }
  this.SVG_ = svgParent;

  // Bind the events to this slider.
  Scrubber.bindEvent_(this.knobTarget_, 'mousedown', this, this.knobMouseDown_);
  Scrubber.bindEvent_(this.knobTarget_, 'touchstart', this, this.knobMouseDown_);
  Scrubber.bindEvent_(trackTarget, 'mousedown', this, this.rectMouseDown_);
  Scrubber.bindEvent_(this.SVG_, 'mouseup', null, Scrubber.knobMouseUp_);
  Scrubber.bindEvent_(this.SVG_, 'touchend', null, Scrubber.knobMouseUp_);
  Scrubber.bindEvent_(this.SVG_, 'mousemove', null, Scrubber.knobMouseMove_);
  Scrubber.bindEvent_(this.SVG_, 'touchmove', null, Scrubber.knobMouseMove_);
  Scrubber.bindEvent_(this.play_, 'click', this, this.playPause_);
  Scrubber.bindEvent_(this.play_, 'touchend', this, this.playPause_);
};


Scrubber.SVG_NS_ = 'http://www.w3.org/2000/svg';

Scrubber.activeScrubber_ = null;
Scrubber.startMouseX_ = 0;
Scrubber.startKnobX_ = 0;

/**
 * Start a drag when clicking down on the knob.
 * @param {!Event} e Mouse-down event.
 * @private
 */
Scrubber.prototype.knobMouseDown_ = function(e) {
  if (this.playPid_) {
    this.playPause_();
  }
  if (e.type == 'touchstart') {
    if (e.changedTouches.length != 1) {
      return;
    }
    Scrubber.touchToMouse_(e)
  }
  Scrubber.activeScrubber_ = this;
  Scrubber.startMouseX_ = this.mouseToSvg_(e).x;
  Scrubber.startKnobX_ = Number(this.knob_.getAttribute('x')) +
    this.KNOB_MIN_X_ + 8;
  // Stop browser from attempting to drag the knob or
  // from scrolling/zooming the page.
  e.preventDefault();
};

/**
 * Stop a drag when clicking up anywhere.
 * @param {Event} e Mouse-up event.
 * @private
 */
Scrubber.knobMouseUp_ = function(e) {
  Scrubber.activeScrubber_ = null;
};

/**
 * Stop a drag when the mouse enters a node not part of the SVG.
 * @param {Event} e Mouse-up event.
 * @private
 */
Scrubber.mouseOver_ = function(e) {
  if (!Scrubber.activeScrubber_) {
    return;
  }
  var node = e.target;
  // Find the root SVG object.
  do {
    if (node == Scrubber.activeScrubber_.SVG_) {
      return;
    }
  } while (node = node.parentNode);
  Scrubber.knobMouseUp_(e);
};

/**
 * Drag the knob to follow the mouse.
 * @param {!Event} e Mouse-move event.
 * @private
 */
Scrubber.knobMouseMove_ = function(e) {
  var thisScrubber = Scrubber.activeScrubber_;
  if (!thisScrubber) {
    return;
  }
  if (e.type == 'touchmove') {
    if (e.changedTouches.length != 1) {
      return;
    }
    Scrubber.touchToMouse_(e)
  }
  var x = thisScrubber.mouseToSvg_(e).x - Scrubber.startMouseX_ +
      Scrubber.startKnobX_;
  thisScrubber.setValue((x - thisScrubber.KNOB_MIN_X_) /
      (thisScrubber.KNOB_MAX_X_ - thisScrubber.KNOB_MIN_X_));
};

/**
 * Jump to a new value when the track is clicked.
 * @param {!Event} e Mouse-down event.
 * @private
 */
Scrubber.prototype.rectMouseDown_ = function(e) {
  if (this.playPid_) {
    this.playPause_();
  }
  if (e.type == 'touchstart') {
    if (e.changedTouches.length != 1) {
      return;
    }
    Scrubber.touchToMouse_(e)
  }
  var x = this.mouseToSvg_(e).x;
  this.animateValue((x - this.KNOB_MIN_X_) /
      (this.KNOB_MAX_X_ - this.KNOB_MIN_X_));
};

/**
 * PID of play timer.
 * @private
 */
Scrubber.prototype.playPid_ = 0;

/**
 * Play/Pause button was clicked.
 * @param {=Event} e Mouse or touch event.
 * @private
 */
Scrubber.prototype.playPause_ = function(e) {
  // Prevent double-clicks or double-taps.
  if (e && BlocklyInterface.eventSpam(e)) {
    return;
  }
  if (this.playPid_) {
    // Pause the playback.
    this.play_.setAttribute('x', 4 - 21);
    clearTimeout(this.playPid_);
    this.playPid_ = 0;
    Movie.checkAnswers();
  } else {
    // Start the playback.
    this.play_.setAttribute('x', 4);
    if (this.getValue() >= 1) {
      this.setValue(0);
    }
    this.nextFrame();
  }
};


/**
 * Time when the previous frame was drawn.
 * @private
 */
Scrubber.prototype.lastFrame_ = 0;

/**
 * Delay between previous frame was drawn and the current frame was scheduled.
 * @private
 */
Scrubber.prototype.lastDelay_ = 0;

/**
 * Speed of animation.  One hundred frames in four seconds.
 */
Scrubber.prototype.FPS = 100 / 4;

/**
 * Start the visualization running.
 */
Scrubber.prototype.nextFrame = function() {
  var value = this.getValue();
  if (value >= 1) {
    this.playPause_();
    return;
  }
  this.setValue(value + 0.01);
  // Frame done.  Calculate the actual elapsed time and schedule the next frame.
  var now = Date.now();
  var workTime = now - this.lastFrame_ - this.lastDelay_;
  var delay = Math.max(1, (1000 / this.FPS) - workTime);
  var thisScrubber = this;
  this.playPid_ = setTimeout(function(){thisScrubber.nextFrame();}, delay);
  this.lastFrame_ = now;
  this.lastDelay_ = delay;
};

/**
 * Returns the slider's value (0.0 - 1.0).
 * @return {number} Current value.
 */
Scrubber.prototype.getValue = function() {
  return this.value_;
};

/**
 * Animates the slider's value (0.0 - 1.0).
 * @param {number} value New value.
 */
Scrubber.prototype.animateValue = function(value) {
  // Clear any ongoing animations.
  while (this.animationTasks_.length) {
    clearTimeout(this.animationTasks_.pop());
  }
  var duration = 200; // Milliseconds to animate for.
  var steps = 10; // Number of steps to animate.
  var oldValue = this.getValue();
  var thisScrubber = this;
  var stepFunc = function(i) {
    return function() {
      var newVal = i * (value - oldValue) / (steps - 1) + oldValue;
      thisScrubber.setValue(newVal);
    };
  }
  for (var i = 0; i < steps; i++) {
    this.animationTasks_.push(setTimeout(stepFunc(i), i * duration / steps));
  }
};

/**
 * Sets the slider's value (0.0 - 1.0).
 * @param {number} value New value.
 */
Scrubber.prototype.setValue = function(value) {
  this.value_ = goog.math.clamp(value, 0, 1);
  var x = this.KNOB_MIN_X_ +
      (this.KNOB_MAX_X_ - this.KNOB_MIN_X_) * this.value_;
  this.knobClipRect_.setAttribute('x', x - 8);
  this.knob_.setAttribute('x', x - 42 - 8);
  this.knobTarget_.setAttribute('x', x - this.TARGET_OVERHANG_);

  for (var i = 0, rect; rect = this.progressRects_[i]; i++) {
    rect.setAttribute('width',  x - this.KNOB_MIN_X_);
  }

  while (this.text_.firstChild) {
    this.text_.removeChild(this.text_.firstChild);
  }
  var frame = Math.round(this.value_ * 100);
  var textNode = document.createTextNode('time = ' + frame);
  this.text_.appendChild(textNode);

  this.changeFunc_ && this.changeFunc_(frame);
};

/**
 * Convert the mouse coordinates into SVG coordinates.
 * @param {!Object} e Object with x and y mouse coordinates.
 * @return {!Object} Object with x and y properties in SVG coordinates.
 * @private
 */
Scrubber.prototype.mouseToSvg_ = function(e) {
  var svgPoint = this.SVG_.createSVGPoint();
  svgPoint.x = e.clientX;
  svgPoint.y = e.clientY;
  var matrix = this.SVG_.getScreenCTM().inverse();
  return svgPoint.matrixTransform(matrix);
};

/**
 * Bind an event to a function call.
 * @param {!Node} node Node upon which to listen.
 * @param {string} name Event name to listen to (e.g. 'mousedown').
 * @param {Object} thisObject The value of 'this' in the function.
 * @param {!Function} func Function to call when event is triggered.
 * @private
 */
Scrubber.bindEvent_ = function(node, name, thisObject, func) {
  var wrapFunc = function(e) {
    func.apply(thisObject, arguments);
  };
  node.addEventListener(name, wrapFunc, false);
};

/**
 * Map the touch event's properties to be compatible with a mouse event.
 * @param {TouchEvent} e Event to modify.
 */
Scrubber.touchToMouse_ = function(e) {
  var touchPoint = e.changedTouches[0];
  e.clientX = touchPoint.clientX;
  e.clientY = touchPoint.clientY;
};
