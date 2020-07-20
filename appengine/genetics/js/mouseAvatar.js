/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for mice avatars in the visualization of the game.
 * @author kozbial@google.com (Monica Kozbial)
 */
'use strict';

goog.provide('Genetics.MouseAvatar');

goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.math');
goog.require('Genetics.Mouse');


/**
 * Stores mouse attributes and visualization information for a mouse.
 * @param {!Genetics.Mouse} mouse The mouse to create a avatar for.
 * @constructor
 * @struct
 */
Genetics.MouseAvatar = function(mouse) {
  /**
   * The unique ID of the mouse.
   * @const {number}
   */
  this.id = mouse.id;
  /**
   * The sex of the mouse.
   * @const {Genetics.Mouse.Sex}
   */
  this.sex = mouse.sex;
  /**
   * The size of the mouse.
   * @const {number}
   */
  this.size = mouse.size;
  /**
   * The ID of the player owning the pickFight function on this mouse.
   * @const {number}
   */
  this.pickFightOwner = mouse.pickFightOwner;
  /**
   * The ID of the player owning the proposeMate function on this mouse.
   * @const {number}
   */
  this.proposeMateOwner = mouse.proposeMateOwner;
  /**
   * The ID of the player owning the acceptMate function on this mouse.
   * @const {number}
   */
  this.acceptMateOwner = mouse.acceptMateOwner;

  /**
   * The SVG element containing the mouse.
   * @const {SVGElement}
   */
  this.element = Blockly.utils.dom.createSvgElement('svg', {
      'id': 'mouse' + mouse.id,
      'class': 'mouse',
    }, null);
  this.element.style.transformOrigin = Genetics.MouseAvatar.HALF_SIZE + 'px ' +
      Genetics.MouseAvatar.HALF_SIZE + 'px';

  // Create clip path for mouse image.
  var mouseClip = Blockly.utils.dom.createSvgElement('clipPath', {
      'id': 'mouse' + mouse.id + 'ClipPath'
    }, this.element);
  Blockly.utils.dom.createSvgElement('rect', {
      'width': Genetics.MouseAvatar.WIDTH + 'px',
      'height': Genetics.MouseAvatar.FULL_HEIGHT + 'px'
    }, mouseClip);

  /**
   * The image element containing the mouse sprite.
   * @private {HTMLImageElement}
   * @const
   */
  this.image_ = Blockly.utils.dom.createSvgElement('image', {
      'width': Genetics.MouseAvatar.WIDTH * 3 + 'px',
      'height': Genetics.MouseAvatar.FULL_HEIGHT * 2 + 'px',
      'clip-path': 'url(#mouse' + mouse.id + 'ClipPath)'
    }, this.element);
  if (this.sex == Genetics.Mouse.Sex.FEMALE) {
    this.image_.setAttribute('y', -Genetics.MouseAvatar.FULL_HEIGHT + 'px');
  }
  this.image_.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
      'genetics/mouse.png');

  // Calculate the pie chart arc start/end based on avatar size.
  var xOffset = Genetics.MouseAvatar.WIDTH / 2 -
      Genetics.MouseAvatar.CHART_RADIUS;
  var yOffset = Genetics.MouseAvatar.HEIGHT * 4 / 5 -
      Genetics.MouseAvatar.CHART_RADIUS;
  var radius = Genetics.MouseAvatar.CHART_RADIUS;
  var x1 = radius + xOffset;
  var y1 = yOffset;
  var x2 = radius * (1 + 0.5 * Math.sqrt(3)) + xOffset;
  var y2 = radius * 1.5 + yOffset;
  var x3 = radius * (1 - 0.5 * Math.sqrt(3)) + xOffset;
  var y3 = radius * 1.5 + yOffset;
  var centerX = radius + xOffset;
  var centerY = radius + yOffset;
  var arc = ' A ' + radius + ' ' + radius + ', 0, 0, 1, '
  var lz = ' L ' + centerX + ' ' + centerY + ' Z';

  // Draw top right slice.
  Blockly.utils.dom.createSvgElement('path', {
      'fill': Genetics.Visualization.COLOURS[this.proposeMateOwner],
      'd': 'M ' + x1 + ' ' + y1 + arc + x2 + ' ' + y2 + lz
    }, this.element);

  // Draw bottom slice.
  Blockly.utils.dom.createSvgElement('path', {
      'fill': Genetics.Visualization.COLOURS[this.pickFightOwner],
      'd': 'M ' + x2 + ' ' + y2 + arc + x3 + ' ' + y3 + lz
    }, this.element);

  // Draw top left slice.
  Blockly.utils.dom.createSvgElement('path', {
      'fill': Genetics.Visualization.COLOURS[this.acceptMateOwner],
      'd': 'M ' + x3 + ' ' + y3 + arc + x1 + ' ' + y1 + lz
    }, this.element);

  /**
   * The direction of the mouse, in radians, between 0 and 2PI.
   * @private {number}
   */
  this.direction_ = Math.random() * 2 * Math.PI;  // Choose a random direction.

  /**
   * Whether the mouse is performing a busy animation.
   * @type {boolean}
   */
  this.busy = true;  // Mouse is busy until it is added to the display.

  /**
   * The process ids for the idle mouse animation [0] and busy animation [1].
   * @const {Array.<number>}
   */
  this.actionPids = [0, 0];
  var thisAvatar = this;  // Save 'this' for use in recursive closure.
  var wanderAbout = function() {
    var wanderTime = 400 + 100 * Math.random();
    if (!Genetics.MouseAvatar.wanderingDisabled && !thisAvatar.busy) {
      thisAvatar.randomMove_(wanderTime);
    }
    thisAvatar.actionPids[Genetics.MouseAvatar.IDLE_ACTION_PID_INDEX] =
        setTimeout(wanderAbout, wanderTime);
  };
  wanderAbout();
};

/**
 * The width of a mouse.
 * @const {number}
 */
Genetics.MouseAvatar.WIDTH = 40;

/**
 * The height of a mouse (without tail).
 * @const {number}
 */
Genetics.MouseAvatar.HEIGHT = 45;

/**
 * The height of a mouse (with tail).
 * @const {number}
 */
Genetics.MouseAvatar.FULL_HEIGHT = 60;

/**
 * The half of the width of the mouse.
 * @const {number}
 */
Genetics.MouseAvatar.HALF_SIZE = Genetics.MouseAvatar.WIDTH / 2;

/**
 * The radius of the chart on the mouse.
 * @const {number}
 */
Genetics.MouseAvatar.CHART_RADIUS = 15 / 2;

/**
 * The index at which process ids for idle actions is stored.
 * @const {number}
 */
Genetics.MouseAvatar.IDLE_ACTION_PID_INDEX = 0;

/**
 * The index at which process ids for busy actions is stored.
 * @const {number}
 */
Genetics.MouseAvatar.BUSY_ACTION_PID_INDEX = 1;

/**
 * Speed of mouse in pixels per second when moving to a destination with
 * purpose.
 * @const {number}
 */
Genetics.MouseAvatar.BUSY_SPEED = 0.07;

/**
 * Speed of a mouse in pixels per second when wandering.
 * @const {number}
 */
Genetics.MouseAvatar.IDLE_SPEED = 0.05;

/**
 * The width/height of the display div containing the mice.
 * Set in Visualization.
 * @type {number}
 */
Genetics.MouseAvatar.DISPLAY_SIZE = 0;

/**
 * Whether wandering is currently disabled.
 * @type {boolean}
 */
Genetics.MouseAvatar.wanderingDisabled = false;

/**
 * Sets the direction to a value between 0-2PI in radians and rotates the
 * mouse to match the direction. Direction angle is clockwise, with 0
 * indicating the mouse facing right.
 * @param {number} direction The new value for direction.
 */
Genetics.MouseAvatar.prototype.setDirection = function(direction) {
  // Convert direction to a value between 0-2PI
  direction %= 2 * Math.PI;
  if (direction < 0) {
    direction += 2 * Math.PI;
  }
  // Determine what the change of direction is.
  var delta = this.direction_ - direction;
  if (Math.abs(delta) > Math.PI / 10) {
    // If change is significant enough, show tail animation.
    var image = this.image_;
    var resetStraight = function() {
      image.setAttribute('x', '0px');
    };
    if (delta > 0) {
      // If the mouse turned right.
      this.image_.setAttribute('x', -Genetics.MouseAvatar.WIDTH + 'px');
      setTimeout(resetStraight, 150);
    } else if (delta < 0) {
      // If the mouse turned left.
      this.image_.setAttribute('x', -2 * Genetics.MouseAvatar.WIDTH + 'px');
      setTimeout(resetStraight, 150);
    }
  }
  // Rotate mouse image to match direction facing.
  this.element.style.transform =
      'rotate(' + (direction + Math.PI / 2) + 'rad)';
  this.direction_ = direction;
};

/**
 * Returns the direction the mouse is facing as an angle in radians.
 * @return {number}
 */
Genetics.MouseAvatar.prototype.getDirection = function() {
  return this.direction_;
};

/**
 * Stops the mouse animations and clears all queued actions.
 */
Genetics.MouseAvatar.prototype.stop = function() {
  for (var i = 0; i < this.actionPids.length; i++) {
    clearTimeout(this.actionPids[i]);
  }
  // Stop any animations on the mouse.
  this.stopMove();
  this.element.style['animation'] = '';
};

/**
 * Stops mouse's current movement path.
 */
Genetics.MouseAvatar.prototype.stopMove = function() {
  var computedStyle = window.getComputedStyle(this.element);
  var top = computedStyle.top;
  var left = computedStyle.left;
  this.element.style.top = top;
  this.element.style.left = left;
  this.element.style['transition'] = '';
};

/**
 * Moves the mouse to the specified position over the specified time and then
 * calls the callback.
 * @param {number} x The x position of the target destination.
 * @param {number} y The y position of the target destination.
 * @param {!Function} callback The function to call after the event is animated.
 * @param {number=} opt_time The duration of the move in milliseconds.
 */
Genetics.MouseAvatar.prototype.move = function(x, y, callback, opt_time) {
  var xClamped = Blockly.utils.math.clamp(x, 0,
      Genetics.MouseAvatar.DISPLAY_SIZE - Genetics.MouseAvatar.WIDTH);
  var yClamped = Blockly.utils.math.clamp(y, 0,
      Genetics.MouseAvatar.DISPLAY_SIZE - Genetics.MouseAvatar.WIDTH);

  var mouseX = parseInt(this.element.style.left, 10);
  var mouseY = parseInt(this.element.style.top, 10);

  var xDelta = xClamped - mouseX;
  var yDelta = yClamped - mouseY;

  // Calculate the time it would take to get to destination if not set.
  var time = (opt_time != null) ? opt_time :
      Math.hypot(Math.abs(xDelta), Math.abs(yDelta)) /
          Genetics.MouseAvatar.BUSY_SPEED;

  if (time < 10 || (Math.abs(xDelta) < 1 && Math.abs(yDelta) < 1)) {
    // If move is shorter than minimum transition time (10) or is too short.
    this.element.style.left = xClamped + 'px';
    this.element.style.top = yClamped + 'px';
    // Turn mouse towards requested destination.
    this.setDirection(Math.atan2(y - mouseY, x - mouseX));
    this.actionPids[Genetics.MouseAvatar.BUSY_ACTION_PID_INDEX] =
        setTimeout(callback, time);
    return;
  }

  // Turn mouse towards destination.
  this.setDirection(Math.atan2(yDelta, xDelta));

  this.element.style['transition'] = 'top ' + time + 'ms linear, left ' +
      time + 'ms linear';
  this.element.style.left = xClamped + 'px';
  this.element.style.top = yClamped + 'px';

  this.actionPids[Genetics.MouseAvatar.BUSY_ACTION_PID_INDEX] =
      setTimeout(callback, time);
};

/**
 * Moves a mouse avatar in a random direction for the time specified.
 * @param {number} time The time that the mouse should move in a direction in
 *     milliseconds.
 * @private
 */
Genetics.MouseAvatar.prototype.randomMove_ = function(time) {
  // Choose a direction based off current direction.
  var range = Math.PI / 2;
  var moveDirection = this.getDirection() + Math.random() * range - range / 2;
  // Calculate destination in direction chosen.
  var distance = Genetics.MouseAvatar.IDLE_SPEED * time;
  var mouseX = parseInt(this.element.style.left, 10);
  var mouseY = parseInt(this.element.style.top, 10);
  var x = mouseX + Math.cos(moveDirection) * distance;
  var y = mouseY + Math.sin(moveDirection) * distance;

  this.move(x, y, function() {}, time);
};

/**
 * Sets the mouse's state to not busy.
 * @param {boolean=} opt_wanderBeforeFree Whether the mouse should wander before
 *     switch to not busy state.
 */
Genetics.MouseAvatar.prototype.freeMouse = function(opt_wanderBeforeFree) {
  if (opt_wanderBeforeFree) {
    this.moveAbout_(3, this.freeMouse.bind(this));
  } else {
    this.busy = false;
  }
};

/**
 * Moves a mouse avatar around in random directions for the specified number
 * of steps.
 * @param {number} steps The number of times the mouse should move in a random
 *     direction.
 * @param {!Function} callback The function to call after the mouse has
 *      completed all requested movement.
 * @private
 */
Genetics.MouseAvatar.prototype.moveAbout_ = function(steps, callback) {
  var count = 0;
  var thisAvatar = this;  // Save 'this' for use in recursive closure.
  var moveStep = function() {
    var moveTime = 400 + 100 * Math.random();
    thisAvatar.randomMove_(moveTime);
    if (++count < steps) {
      thisAvatar.actionPids[Genetics.MouseAvatar.BUSY_ACTION_PID_INDEX] =
          setTimeout(moveStep, moveTime);
    } else {
      callback();
    }
  };
  moveStep();
};
