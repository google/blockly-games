/**
 * Blockly Games: Accessible
 *
 * Copyright 2016 Google Inc.
 * https://github.com/google/blockly-games
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
 * @fileoverview Angular2 Service that manages all game logic.
 * @author sll@google.com (Sean Lip)
 */

var musicGame = {};

musicGame.LevelManagerService = ng.core
  .Class({
    constructor: [function() {
      this.levelSet_ = LEVELS['TUTORIAL'];

      // Level numbers here are 0-indexed.
      this.currentLevelNumber_ = 0;
      var levelNumberFromUrl = Number(location.search.split('l=')[1]);
      if (levelNumberFromUrl - 1 >= 0 &&
          levelNumberFromUrl - 1 < this.levelSet_.length) {
        this.currentLevelNumber_ = levelNumberFromUrl - 1;
      }

      // TODO(sll): Load from local storage.
      this.latestAvailableLevelNumber_ = this.currentLevelNumber_;

      var that = this;
      ACCESSIBLE_GLOBALS.toolbarButtonConfig[0].action = function() {
        musicPlayer.reset();
        runCodeToPopulatePlayerLine();
        musicPlayer.playPlayerLine(100, function() {
          that.gradeCurrentLevel();
        });
      }
    }],
    getCurrentLevelNumber: function() {
      return this.currentLevelNumber_;
    },
    getNumberOfLevels: function() {
      return this.levelSet_.length;
    },
    getAllowedBlockTypes: function() {
      return this.getCurrentLevelData().allowedBlockTypes;
    },
    setCurrentLevel: function(current1IndexedLevelNumber) {
      this.currentLevelNumber_ = current1IndexedLevelNumber - 1;
      this.latestAvailableLevelNumber_ = Math.max(
          this.latestAvailableLevelNumber_, current1IndexedLevelNumber - 1);
    },
    setLatestAvailableLevel: function(levelNumber) {
      this.latestAvailableLevelNumber_ = levelNumber;
    },
    getCurrentLevelData: function() {
      return this.levelSet_[this.currentLevelNumber_];
    },
    gradeCurrentLevel: function() {
      var currentLevelData = this.getCurrentLevelData();

      var expectedPlayerLine = new MusicLine();
      expectedPlayerLine.setFromChordsAndDurations(
          currentLevelData.expectedLine);
      var correct = musicPlayer.doesPlayerLineEqual(expectedPlayerLine);

      var errorMessage = 'Not quite! Try again!';
      var errorMessageChanged = false;
      if (!correct && !errorMessageChanged) {
        errorMessage = 'Not quite! Are you playing the right note?'
        errorMessageChanged = true;
      }

      if (correct) {
        alert('Good job! You completed the level!');

        var newUrl = window.location.href;
        if (newUrl.lastIndexOf('?') + 4 === newUrl.length) {
          newUrl = newUrl.substring(0, newUrl.length - 1) +
            Number(this.currentLevelNumber_ + 2);
        } else {
          newUrl += '?l=' + Number(this.currentLevelNumber_ + 2);
        }

        window.location = newUrl;
      } else {
        alert(errorMessage);
      }
    }
  });
