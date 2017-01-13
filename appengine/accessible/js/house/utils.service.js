/**
 * AccessibleBlockly
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Angular2 utility service for multiple components. All
 * functions in this service should be stateless, since this is a singleton
 * service that is used for the entire application.
 *
 * @author madeeha@google.com (Madeeha Ghori)
 */


houseApp.UtilsService = ng.core
  .Class({
    constructor: function() {},
    generateUniqueId: function() {
      return String(Math.round(Math.random() * 1000000000000000));
    },
    generateAriaLabelledByAttr: function(mainLabel, secondLabel) {
      return mainLabel + (secondLabel ? ' ' + secondLabel : '');
    }
  });
