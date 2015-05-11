/**
 * Blockly Games: Table Sorter
 *
 * Copyright 2015 Google Inc.
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
 * @fileoverview Table Sorter.  Adds bi-directional sorting to table columns.
 * Based on: https://neil.fraser.name/software/tablesort/
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('TableSort');

/**
 * HTML for up indicator (sorted small to big).
 */
TableSort.arrowUp = '<img src="pond/player/arrowUp.png" height=21 width=20 alt="&#x25b2;">';

/**
 * HTML for down indicator (sorted big to small).
 */
TableSort.arrowDown = '<img src="pond/player/arrowDown.png" height=21 width=20 alt="&#x25bc;">';

/**
 * HTML for unsorted indicator.
 */
TableSort.arrowNone = '<img src="pond/player/arrowNone.png" height=21 width=20 alt=" ">';

/**
 * List of all the tables.
 * @private
 */
TableSort.tables_ = [];


/**
 * Turn all the header/footer cells of one table into sorting links.
 * @param {!Element} table Table to be converted.
 */
TableSort.init = function(table) {
  TableSort.tables_.push(table);
  var t = TableSort.tables_.length - 1;
  if (table.tHead) {
    for (var y = 0, row; row = table.tHead.rows[y]; y++) {
      for (var x = 0, cell; cell = row.cells[x]; x++) {
        TableSort.linkCell_(cell, t, x);
      }
    }
  }
  if (table.tFoot) {
    for (var y = 0, row; row = table.tFoot.rows[y]; y++) {
      for (var x = 0, cell; cell = row.cells[x]; x++) {
        TableSort.linkCell_(cell, t, x);
      }
    }
  }
  table.lastSort_ = [];
  table.lastColumn_ = -1;
};


/**
 * Turn one header/footer cell into a sorting link.
 * @param {!Element} cell The TH or TD to be made a link.
 * @param {number} t Index of table in TableSort array.
 * @param {number} x Column index.
 * @private
 */
TableSort.linkCell_ = function(cell, t, x) {
  var sortClass = TableSort.getClass_(cell);
  if (sortClass) {
    var func = function(e) {
      TableSort.click(t, x, escape(sortClass));
    };
    cell.addEventListener('mousedown', func);
    cell.addEventListener('touchdown', func);
    // Add an element where the sorting arrows will go.
    var arrow = document.createElement('SPAN');
    arrow.innerHTML = TableSort.arrowNone;
    arrow.className = 'TableSort_' + t + '_' + x;
    cell.appendChild(arrow);
  }
};


/**
 * Return the class name for a cell.  The name must match a sorting function.
 * @param {!Element} cell The cell element.
 * @return {?string} Class name matching a sorting function.
 * @private
 */
TableSort.getClass_ = function(cell) {
  var className = (cell.className || '').toLowerCase();
  var classList = className.split(/\s+/g);
  for (var x = 0; x < classList.length; x++) {
    if (('compare_' + classList[x]) in TableSort) {
      return classList[x];
    }
  }
  return null;
};


/**
 * Sort the rows in this table by the specified column.
 * @param {number} t Index of table in TableSort array.
 * @param {number} column Index of the column to sort by.
 * @param {string} mode Sorting mode (e.g. 'nocase').
 */
TableSort.click = function(t, column, mode) {
  var table = TableSort.tables_[t];
  if (!mode.match(/^[_a-z0-9]+$/)) {
    throw 'Illegal sorting mode type.';
  }
  var compareFunction = TableSort['compare_' + mode];
  if (typeof compareFunction != 'function') {
    throw 'Unknown sorting mode: ' + mode;
  }
  // Determine and record the direction.
  if (table.lastColumn_ == column) {
    table.lastSort_[column] = !table.lastSort_[column];
  } else {
    table.lastColumn_ = column;
  }
  var reverse = table.lastSort_[column];
  // Display the correct arrows on every header/footer cell.
  var spanMatchAll = new RegExp('\\bTableSort_' + t + '_\\d+\\b');
  var spanMatchExact = new RegExp('\\bTableSort_' + t + '_' + column + '\\b');
  var spans = table.getElementsByTagName('SPAN');
  for (var s = 0, span; span = spans[s]; s++) {
    if (span.className && spanMatchAll.test(span.className)) {
      if (spanMatchExact.test(span.className)) {
        if (reverse) {
          span.innerHTML = TableSort.arrowDown;
        } else {
          span.innerHTML = TableSort.arrowUp;
        }
      } else {
        span.innerHTML = TableSort.arrowNone;
      }
    }
  }
  // Fetch the table's data and store it in a dictionary (assoc array).
  if (!table.tBodies.length) {
    return; // No data in table.
  }
  var tablebody = table.tBodies[0];
  var cellDictionary = [];
  for (var y = 0, row; row = tablebody.rows[y]; y++) {
    var cell = row.cells[column];
    cellDictionary[y] = [cell.getAttribute('data-sort'), row];
  }
  // Sort the dictionary.
  cellDictionary.sort(compareFunction);
  // Rebuild the table with the new order.
  for (y = 0; y < cellDictionary.length; y++) {
    var i = reverse ? (cellDictionary.length - 1 - y) : y;
    tablebody.appendChild(cellDictionary[i][1]);
  }
};

/**
 * Case-sensitive sorting.
 * Compare two dictionary structures and indicate which is larger.
 * @param {!Array} a First tuple.
 * @param {!Array} b Second tuple.
 * @return {number} Number indicating which param is larger (-1/0/1).
 */
TableSort['compare_case'] = function(a, b) {
  if (a[0] == b[0]) {
    return 0;
  }
  return (a[0] > b[0]) ? 1 : -1;
};

/**
 * Case-insensitive sorting.
 * Compare two dictionary structures and indicate which is larger.
 * @param {Array} a First tuple.
 * @param {Array} b Second tuple.
 * @return {number} Number indicating which param is larger (-1/0/1).
 */
TableSort['compare_nocase'] = function(a, b) {
  var aLower = a[0].toLowerCase();
  var bLower = b[0].toLowerCase();
  if (aLower == bLower) {
    return 0;
  }
  return (aLower > bLower) ? 1 : -1;
};

/**
 * Numeric sorting.
 * Compare two dictionary structures and indicate which is larger.
 * @param {Array} a First tuple.
 * @param {Array} b Second tuple.
 * @return {number} Number indicating which param is larger (-1/0/1).
 */
TableSort['compare_num'] = function(a, b) {
  var aNum = parseFloat(a[0]);
  if (isNaN(aNum)) {
    aNum = -Number.MAX_VALUE;
  }
  var bNum = parseFloat(b[0]);
  if (isNaN(bNum)) {
    bNum = -Number.MAX_VALUE;
  }
  if (aNum == bNum) {
    return 0;
  }
  return (aNum > bNum) ? 1 : -1;
};
