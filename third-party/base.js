// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Stripped down version of Closure's base.js.
 * @provideGoog
 */

/**
 * @define {boolean} Overridden to true by the compiler.
 */
var COMPILED = false;

var goog = goog || {};

goog.provide = goog.provide || function(name) {
  let obj = window;
  const parts = name.split('.');
  for (const part of parts) {
    obj[part] = obj[part] || {};
    obj = obj[part];
  }
};

goog.require = goog.require || function() {};

goog.requireType = goog.requireType || function() {};
