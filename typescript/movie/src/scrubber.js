/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A scrubber control for video.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Scrubber');

goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.math');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');


Scrubber = class {
  /**
   * Object representing a horizontal scrubber widget.
   * @param {!Element} svgParent The SVG element to append the slider to.
   * @param {!Function} changeFunc Callback function that will be called
   *     when the scrubber is moved.  The current value is passed.
   * @param {!Function} stopFunc Callback function that will be called
   *     when the scrubber stops moving.
   */
  constructor(svgParent, changeFunc, stopFunc) {
    this.KNOB_MIN_X_ = 42;
    this.KNOB_MAX_X_ = 328;
    this.HEIGHT_ = 11.5;
    this.TARGET_OVERHANG_ = 12;
    this.value_ = 0;
    this.changeFunc_ = changeFunc;
    this.stopFunc_ = stopFunc;
    this.animationTasks_ = [];
    this.progressRects_ = [];
    const SVG_NS = Blockly.utils.dom.SVG_NS;

    // Draw the frame text.
    this.text_ = Blockly.utils.dom.createSvgElement('text', {
        'style': 'font-size: 10pt',
        'x': this.KNOB_MAX_X_ + 9,
        'y': 16
      }, svgParent);
    if (BlocklyGames.IS_RTL) {
      this.text_.setAttribute('text-anchor', 'end');
    }

    // Draw the progress bar.
    const colours = ['#ff3333', '#f72f2f', '#ef2a2a', '#e72727',
                     '#df2222', '#d71f1f', '#cf1a1a'];
    for (let i = 0; i < colours.length; i++) {
      this.progressRects_[i] = Blockly.utils.dom.createSvgElement('rect', {
          'style': 'fill: ' + colours[i],
          'x': this.KNOB_MIN_X_,
          'y': 8 + i,
          'height': 1,
        }, svgParent);
    }

    // Draw the slider.
    /*
    <rect style="opacity: 0" x="5" y="25" width="150" height="20" />
    <clipPath id="knobClipPath">
      <rect width="16" height="16" y="3" />
    </clipPath>
    <image xlink:href="common/icons.png" width="84" height="63" y="3"
        clip-path="url(#knobClipPath)" />
    <circle style="opacity: 0" r="20" cy="35" cx="75"></circle>
    */
    const trackTarget = Blockly.utils.dom.createSvgElement('rect', {
        'style': 'opacity: 0',
        'x': this.KNOB_MIN_X_ - this.TARGET_OVERHANG_,
        'y': this.HEIGHT_ - this.TARGET_OVERHANG_,
        'height': 2 * this.TARGET_OVERHANG_,
        'width': this.KNOB_MAX_X_ - this.KNOB_MIN_X_ + 2 * this.TARGET_OVERHANG_,
        'rx': this.TARGET_OVERHANG_,
        'ry': this.TARGET_OVERHANG_,
      }, svgParent);
    const knobClip = Blockly.utils.dom.createSvgElement('clipPath', {
        'id': 'knobClipPath',
      }, svgParent);
    this.knobClipRect_ = Blockly.utils.dom.createSvgElement('rect', {
        'height': 16,
        'width': 16,
        'y': 3,
      }, knobClip);
    this.knob_ = Blockly.utils.dom.createSvgElement('image', {
      'height': 63,
      'width': 84,
      'clip-path': 'url(#knobClipPath)',
      'y': -39,
    }, svgParent);
    this.knob_.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
        'common/icons.png');
    this.knobTarget_ = Blockly.utils.dom.createSvgElement('rect', {
        'style': 'opacity: 0',
        'height': 2 * this.TARGET_OVERHANG_,
        'width': 2 * this.TARGET_OVERHANG_,
        'y': this.HEIGHT_ - this.TARGET_OVERHANG_,
      }, svgParent);
    this.setValue(0);

    // Draw the Play button.
    /*
    <clipPath id="playClipPath">
      <rect width=21 height=21 x=4 y=1 />
    </clipPath>
    <image xlink:href="common/icons.png" width="84" height="63" x="-16" y="-41"
        clip-path="url(#playClipPath)" />
    */
    const playClip = Blockly.utils.dom.createSvgElement('clipPath', {
        'id': 'playClipPath',
      }, svgParent);
    Blockly.utils.dom.createSvgElement('rect', {
        'height': 21,
        'width': 21,
        'x': 4,
        'y': 1,
      }, playClip);
    this.play_ = Blockly.utils.dom.createSvgElement('image', {
        'clip-path': 'url(#playClipPath)',
        'height': 63,
        'width': 84,
        'x': 5 - 21,
        'y': -41,
      }, svgParent);
    this.play_.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
        'common/icons.png');

    // Find the root SVG object.
    while (svgParent && svgParent.nodeName.toLowerCase() !== 'svg') {
      svgParent = svgParent.parentElement;
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
  }

  /**
   * Start a drag when clicking down on the knob.
   * @param {!Event} e Mouse-down event.
   * @private
   */
  knobMouseDown_(e) {
    if (this.playPid_) {
      this.playPause_();
    }
    if (e.type === 'touchstart') {
      if (e.changedTouches.length !== 1) {
        return;
      }
      Scrubber.touchToMouse_(e);
    }
    Scrubber.activeScrubber_ = this;
    Scrubber.startMouseX_ = this.mouseToSvg_(e).x;
    Scrubber.startKnobX_ = Number(this.knob_.getAttribute('x')) +
      this.KNOB_MIN_X_ + 8 + 21;
    // Stop browser from attempting to drag the knob or
    // from scrolling/zooming the page.
    e.preventDefault();
  }

  /**
   * Stop a drag when clicking up anywhere.
   * @param {Event} e Mouse-up event.
   * @private
   */
  static knobMouseUp_(e) {
    Scrubber.activeScrubber_ = null;
  }

  /**
   * Stop a drag when the mouse enters a node not part of the SVG.
   * @param {Event} e Mouse-up event.
   * @private
   */
  static mouseOver_(e) {
    if (!Scrubber.activeScrubber_) {
      return;
    }
    let node = e.target;
    // Find the root SVG object.
    do {
      if (node === Scrubber.activeScrubber_.SVG_) {
        return;
      }
    } while (node = node.parentNode);
    Scrubber.knobMouseUp_(e);
  }

  /**
   * Drag the knob to follow the mouse.
   * @param {!Event} e Mouse-move event.
   * @private
   */
  static knobMouseMove_(e) {
    const thisScrubber = Scrubber.activeScrubber_;
    if (!thisScrubber) {
      return;
    }
    if (e.type === 'touchmove') {
      if (e.changedTouches.length !== 1) {
        return;
      }
      Scrubber.touchToMouse_(e);
    }
    const x = thisScrubber.mouseToSvg_(e).x - Scrubber.startMouseX_ +
        Scrubber.startKnobX_;
    thisScrubber.setValue((x - thisScrubber.KNOB_MIN_X_) /
        (thisScrubber.KNOB_MAX_X_ - thisScrubber.KNOB_MIN_X_));
  }

  /**
   * Jump to a new value when the track is clicked.
   * @param {!Event} e Mouse-down event.
   * @private
   */
  rectMouseDown_(e) {
    if (this.playPid_) {
      this.playPause_();
    }
    if (e.type === 'touchstart') {
      if (e.changedTouches.length !== 1) {
        return;
      }
      Scrubber.touchToMouse_(e);
    }
    const x = this.mouseToSvg_(e).x;
    this.animateValue_((x - this.KNOB_MIN_X_) /
        (this.KNOB_MAX_X_ - this.KNOB_MIN_X_));
  }

  /**
   * Play/Pause button was clicked.
   * @param {!Event=} opt_e Mouse or touch event.
   * @private
   */
  playPause_(opt_e) {
    // Prevent double-clicks or double-taps.
    if (opt_e && BlocklyInterface.eventSpam(opt_e)) {
      return;
    }
    if (this.playPid_) {
      // Pause the playback.
      this.play_.setAttribute('x', 5 - 21);
      clearTimeout(this.playPid_);
      this.playPid_ = 0;
      this.stopFunc_();
    } else {
      // Start the playback.
      this.play_.setAttribute('x', 5);
      if (this.getValue() >= 1) {
        this.setValue(0);
      }
      this.nextFrame_();
    }
  };

  /**
   * Start the visualization running.
   * @private
   */
  nextFrame_() {
    const value = this.getValue();
    if (value >= 1) {
      this.playPause_();
      return;
    }
    this.setValue(value + 0.01);
    // Frame done.  Calculate the actual elapsed time and schedule the next frame.
    const now = Date.now();
    const workTime = now - this.lastFrame_ - this.lastDelay_;
    const delay = Math.max(1, (1000 / this.FPS) - workTime);
    this.playPid_ = setTimeout(() => this.nextFrame_(), delay);
    this.lastFrame_ = now;
    this.lastDelay_ = delay;
  }

  /**
   * Returns the slider's value (0.0 - 1.0).
   * @returns {number} Current value.
   */
  getValue() {
    return this.value_;
  }

  /**
   * Animates the slider's value (0.0 - 1.0).
   * @param {number} value New value.
   * @private
   */
  animateValue_(value) {
    // Clear any ongoing animations.
    this.animationTasks_.forEach(clearTimeout);
    this.animationTasks_ = [];

    const duration = 200; // Milliseconds to animate for.
    const steps = 10; // Number of steps to animate.
    const oldValue = this.getValue();
    const thisScrubber = this;
    const stepFunc = function(i) {
      return function() {
        const newVal = i * (value - oldValue) / (steps - 1) + oldValue;
        thisScrubber.setValue(newVal);
      };
    };
    for (let i = 0; i < steps; i++) {
      this.animationTasks_.push(setTimeout(stepFunc(i), i * duration / steps));
    }
  }

  /**
   * Sets the slider's value (0.0 - 1.0).
   * @param {number} value New value.
   */
  setValue(value) {
    this.value_ = Blockly.utils.math.clamp(value, 0, 1);
    const x = this.KNOB_MIN_X_ +
        (this.KNOB_MAX_X_ - this.KNOB_MIN_X_) * this.value_;
    this.knobClipRect_.setAttribute('x', x - 8);
    this.knob_.setAttribute('x', x - 63 - 8);
    this.knobTarget_.setAttribute('x', x - this.TARGET_OVERHANG_);

    for (const rect of this.progressRects_) {
      rect.setAttribute('width', x - this.KNOB_MIN_X_);
    }

    while (this.text_.firstChild) {
      this.text_.removeChild(this.text_.firstChild);
    }
    const frame = Math.round(this.value_ * 100);
    const textNode = document.createTextNode('time = ' + frame);
    this.text_.appendChild(textNode);

    this.changeFunc_(frame);
  }

  /**
   * Convert the mouse coordinates into SVG coordinates.
   * @param {!Object} e Object with x and y mouse coordinates.
   * @returns {!Object} Object with x and y properties in SVG coordinates.
   * @private
   */
  mouseToSvg_(e) {
    const svgPoint = this.SVG_.createSVGPoint();
    svgPoint.x = e.clientX;
    svgPoint.y = e.clientY;
    const matrix = this.SVG_.getScreenCTM().inverse();
    return svgPoint.matrixTransform(matrix);
  }

  /**
   * Bind an event to a function call.
   * @param {!Node} node Node upon which to listen.
   * @param {string} name Event name to listen to (e.g. 'mousedown').
   * @param {Object} thisObject The value of 'this' in the function.
   * @param {!Function} func Function to call when event is triggered.
   * @private
   */
  static bindEvent_(node, name, thisObject, func) {
    const wrapFunc = function(_e) {
      func.apply(thisObject, arguments);
    };
    node.addEventListener(name, wrapFunc, false);
  }

  /**
   * Map the touch event's properties to be compatible with a mouse event.
   * @param {TouchEvent} e Event to modify.
   * @private
   */
  static touchToMouse_(e) {
    const touchPoint = e.changedTouches[0];
    e.clientX = touchPoint.clientX;
    e.clientY = touchPoint.clientY;
  }
};

/**
 * Scrubber which is currently being dragged.
 * @type Scrubber
 * @private
 */
Scrubber.activeScrubber_ = null;
/**
 * X coordinate of mousedown at start of current drag.
 * @type number
 * @private
 */
Scrubber.startMouseX_ = 0;
/**
 * X coordinate of knob at start of current drag.
 * @type number
 * @private
 */
Scrubber.startKnobX_ = 0;

/**
 * Time when the previous frame was drawn.
 * @private
 */
Scrubber.lastFrame_ = 0;

/**
 * Delay between previous frame was drawn and the current frame was scheduled.
 * @private
 */
Scrubber.lastDelay_ = 0;

/**
 * Speed of animation.  One hundred frames in four seconds.
 * @private
 */
Scrubber.FPS = 100 / 4;

/**
 * PID of play timer.
 * @private
 */
Scrubber.playPid_ = 0;
