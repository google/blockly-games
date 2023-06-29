/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A slider control in SVG.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Slider');

goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.math');


Slider = class {
  /**
   * Object representing a horizontal slider widget.
   * @param {number} x The horizontal offset of the slider.
   * @param {number} y The vertical offset of the slider.
   * @param {number} width The total width of the slider.
   * @param {!Element} svgParent The SVG element to append the slider to.
   * @param {Function=} opt_changeFunc Optional callback function that will be
   *     called when the slider is moved.  The current value is passed.
   */
  constructor(x, y, width, svgParent, opt_changeFunc) {
    this.KNOB_Y_ = y - 12;
    this.KNOB_MIN_X_ = x + 8;
    this.KNOB_MAX_X_ = x + width - 8;
    this.TARGET_OVERHANG_ = 20;
    this.value_ = 0.5;
    this.changeFunc_ = opt_changeFunc;
    this.animationTasks_ = [];
    const SVG_NS = Blockly.utils.dom.SVG_NS;

    // Draw the slider.
    /*
    <line class="sliderTrack" x1="10" y1="35" x2="140" y2="35" />
    <rect style="opacity: 0" x="5" y="25" width="150" height="20" />
    <path id="knob"
        transform="translate(67, 23)"
        d="m 8,0 l -8,8 v 12 h 16 v -12 z" />
    <circle style="opacity: 0" r="20" cy="35" cx="75"></circle>
    */
    this.track_ = Blockly.utils.dom.createSvgElement('line', {
        'class': 'sliderTrack',
        'x1': x,
        'y1': y,
        'x2': x + width,
        'y2': y,
      }, svgParent);
    this.trackTarget_ = Blockly.utils.dom.createSvgElement('rect', {
        'style': 'opacity: 0',
        'x': x - this.TARGET_OVERHANG_,
        'y': y - this.TARGET_OVERHANG_,
        'width': width + 2 * this.TARGET_OVERHANG_,
        'height': 2 * this.TARGET_OVERHANG_,
        'rx': this.TARGET_OVERHANG_,
        'ry': this.TARGET_OVERHANG_
      }, svgParent);
    this.knob_ = Blockly.utils.dom.createSvgElement('path', {
        'class': 'sliderKnob',
        'd': 'm 0,0 l -8,8 v 12 h 16 v -12 z'
      }, svgParent);
    this.knobTarget_ = Blockly.utils.dom.createSvgElement('circle', {
        'style': 'opacity: 0',
        'r': this.TARGET_OVERHANG_,
        'cy': y
      }, svgParent);
    this.setValue(0.5);

    // Find the root SVG object.
    while (svgParent && svgParent.nodeName.toLowerCase() !== 'svg') {
      svgParent = svgParent.parentNode;
    }
    this.SVG_ = svgParent;

    // Bind the events to this slider.
    Slider.bindEvent_(this.knobTarget_, 'mousedown', this, this.knobMouseDown_);
    Slider.bindEvent_(this.knobTarget_, 'touchstart', this, this.knobMouseDown_);
    Slider.bindEvent_(this.trackTarget_, 'mousedown', this, this.rectMouseDown_);
    Slider.bindEvent_(this.SVG_, 'mouseup', null, Slider.knobMouseUp_);
    Slider.bindEvent_(this.SVG_, 'touchend', null, Slider.knobMouseUp_);
    Slider.bindEvent_(this.SVG_, 'mousemove', null, Slider.knobMouseMove_);
    Slider.bindEvent_(this.SVG_, 'touchmove', null, Slider.knobMouseMove_);
    Slider.bindEvent_(document, 'mouseover', null, Slider.mouseOver_);
  }

  /**
   * Start a drag when clicking down on the knob.
   * @param {!Event} e Mouse-down event.
   * @private
   */
  knobMouseDown_(e) {
    if (e.type === 'touchstart') {
      if (e.changedTouches.length !== 1) {
        return;
      }
      Slider.touchToMouse_(e);
    }
    Slider.activeSlider_ = this;
    Slider.startMouseX_ = this.mouseToSvg_(e).x;
    Slider.startKnobX_ = 0;
    const transform = this.knob_.getAttribute('transform');
    if (transform) {
      const r = transform.match(/translate\(\s*([-\d.]+)/);
      if (r) {
        Slider.startKnobX_ = Number(r[1]);
      }
    }
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
    Slider.activeSlider_ = null;
  }

  /**
   * Stop a drag when the mouse enters a node not part of the SVG.
   * @param {Event} e Mouse-up event.
   * @private
   */
  static mouseOver_(e) {
    if (!Slider.activeSlider_) {
      return;
    }
    let node = e.target;
    // Find the root SVG object.
    do {
      if (node === Slider.activeSlider_.SVG_) {
        return;
      }
    } while (node = node.parentNode);
    Slider.knobMouseUp_(e);
  }

  /**
   * Drag the knob to follow the mouse.
   * @param {!Event} e Mouse-move event.
   * @private
   */
  static knobMouseMove_(e) {
    const thisSlider = Slider.activeSlider_;
    if (!thisSlider) {
      return;
    }
    if (e.type === 'touchmove') {
      if (e.changedTouches.length !== 1) {
        return;
      }
      Slider.touchToMouse_(e);
    }
    const x = thisSlider.mouseToSvg_(e).x - Slider.startMouseX_ +
        Slider.startKnobX_;
    thisSlider.setValue((x - thisSlider.KNOB_MIN_X_) /
        (thisSlider.KNOB_MAX_X_ - thisSlider.KNOB_MIN_X_));
  }

  /**
   * Jump to a new value when the track is clicked.
   * @param {!Event} e Mouse-down event.
   * @private
   */
  rectMouseDown_(e) {
    if (e.type === 'touchstart') {
      if (e.changedTouches.length !== 1) {
        return;
      }
      Slider.touchToMouse_(e);
    }
    const x = this.mouseToSvg_(e).x;
    this.animateValue_((x - this.KNOB_MIN_X_) /
        (this.KNOB_MAX_X_ - this.KNOB_MIN_X_));
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
    const thisSlider = this;
    const stepFunc = function(i) {
      return function() {
        const newVal = i * (value - oldValue) / (steps - 1) + oldValue;
        thisSlider.setValue(newVal);
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
    this.knob_.setAttribute('transform',
        'translate(' + x + ',' + this.KNOB_Y_ + ')');
    this.knobTarget_.setAttribute('cx', x);
    this.changeFunc_ && this.changeFunc_(this.value_);
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
  touchToMouse_(e) {
    const touchPoint = e.changedTouches[0];
    e.clientX = touchPoint.clientX;
    e.clientY = touchPoint.clientY;
  }
};

/**
 * Slider which is currently being dragged.
 * @type Slider
 * @private
 */
Slider.activeSlider_ = null;
/**
 * X coordinate of mousedown at start of current drag.
 * @type number
 * @private
 */
Slider.startMouseX_ = 0;
/**
 * X coordinate of knob at start of current drag.
 * @type number
 * @private
 */
Slider.startKnobX_ = 0;
