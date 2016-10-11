/**
 * Blockly Games: Documentation
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
 * @fileoverview Shared JavaScript for Blockly Games Documentation.
 * @author kozbial@google.com (Monica Kozbial)
 */
'use strict';

goog.provide('Docs');

goog.require('goog.ui.AnimatedZippy');
goog.require('goog.events');

/**
 * Called during animation.
 * Overwrites the original animate method on zippy so that top of the div is
 * anchored instead of bottom.
 * @param {goog.events.Event} e The event.
 * @private
 * @suppress {duplicate}
 */
goog.ui.AnimatedZippy.prototype.onAnimate_ = function(e) {
  var contentElement = this.getContentElement();
  var h = contentElement.offsetHeight;
  contentElement.style.marginBottom = (e.y - h) + 'px';
};
