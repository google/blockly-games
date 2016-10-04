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

musicGame.NAME = 'MUSIC_ACCESSIBLE';

musicGame.LevelManagerService = ng.core
  .Class({
    constructor: [musicGame.UtilsService, function(utilsService) {
      this.levelSetId_ = utilsService.getStringParamFromUrl(
          'levelset', 'tutorial');

      this.levelSet_ = LEVEL_SETS[this.levelSetId_].levels;

      // Level numbers here are 0-indexed.
      var levelNumberFromUrl = utilsService.getStringParamFromUrl('l', '1');
      this.currentLevelNumber_ = levelNumberFromUrl - 1;

      this.applauseAudioFile = new Audio('media/applause.mp3');
      this.oopsAudioFile = new Audio('media/oops.mp3');
    }],
    loadExistingCode: function() {
      var inherit = this.getCurrentLevelData().continueFromPreviousLevel;
      var defaultXmlText = this.getCurrentLevelData().defaultXml;

      // Try loading saved XML for this level, saved XML from previous level,
      // or default XML for this level, in that order.
      var xmlTextToRestore = this.loadCodeFromLocalStorage_(
          this.levelSetId_, this.currentLevelNumber_);
      if (!xmlTextToRestore && inherit) {
        var inheritedXmlText = this.loadCodeFromLocalStorage_(
            this.levelSetId_, this.currentLevelNumber_ - 1);
        if (inheritedXmlText) {
          xmlTextToRestore = inheritedXmlText;
        }
      }
      if (!xmlTextToRestore && defaultXmlText) {
        xmlTextToRestore = defaultXmlText;
      }

      if (xmlTextToRestore) {
        // The timeout is needed to give the workspace a chance to load before
        // the initial XML is converted to blocks.
        setTimeout(function() {
          var xml = Blockly.Xml.textToDom(xmlTextToRestore);
          Blockly.Xml.domToWorkspace(xml, blocklyApp.workspace);
        }, 0);
      }
    },
    playApplause_: function() {
      this.applauseAudioFile.play();
    },
    playOops_: function() {
      this.oopsAudioFile.play();
    },
    getLocalStorageCodeKey_: function(levelSetId, levelNumber) {
      return [musicGame.NAME, levelSetId, levelNumber].join('.');
    },
    clearData: function() {
      if (!confirm('Delete all your solutions?')) {
        return;
      }

      var that = this;
      this.getLevelSetsMetadata().forEach(function(levelSetMetadata) {
        levelSetMetadata.levels.forEach(function(level) {
          var key = that.getLocalStorageCodeKey_(
              levelSetMetadata.id, level.number1Indexed - 1);
          delete window.localStorage[key];
        });
      });

      location.reload();
    },
    saveCodeToLocalStorage_: function(levelSetId, levelNumber) {
      // MSIE 11 does not support localStorage on file:// URLs.
      if (!window.localStorage) {
        return;
      }
      var key = this.getLocalStorageCodeKey_(levelSetId, levelNumber);
      var xml = Blockly.Xml.workspaceToDom(blocklyApp.workspace);
      window.localStorage[key] = Blockly.Xml.domToText(xml);
    },
    loadCodeFromLocalStorage_: function(levelSetId, levelNumber) {
      if (!window.localStorage) {
        return;
      }

      var key = this.getLocalStorageCodeKey_(levelSetId, levelNumber);
      return window.localStorage[key];
    },
    getLevelSetId: function() {
      return this.levelSetId_;
    },
    getLevelSetName: function() {
      return LEVEL_SETS[this.levelSetId_].name;
    },
    getLevelSetsMetadata: function() {
      if (!this.levelSetsMetadata) {
        this.levelSetsMetadata = [];

        var that = this;
        for (var levelSetId in LEVEL_SETS) {
          var levels = LEVEL_SETS[levelSetId].levels.map(function(_, index) {
            return {
              number1Indexed: index + 1,
              completed: that.loadCodeFromLocalStorage_(levelSetId, index)
            };
          });

          this.levelSetsMetadata.push({
            id: levelSetId,
            name: LEVEL_SETS[levelSetId].name,
            levels: levels
          });
        }
      }

      return this.levelSetsMetadata;
    },
    getCurrentLevelNumber: function() {
      return this.currentLevelNumber_;
    },
    getNumberOfLevels: function() {
      return this.levelSet_.length;
    },
    getToolboxBlockDefns: function() {
      return this.getCurrentLevelData().toolboxBlockDefns;
    },
    setCurrentLevel: function(current1IndexedLevelNumber) {
      this.currentLevelNumber_ = current1IndexedLevelNumber - 1;
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
      if (correct) {
        this.saveCodeToLocalStorage_(
            this.getLevelSetId(), this.getCurrentLevelNumber());
        this.playApplause_();

        if (this.currentLevelNumber_ == this.levelSet_.length - 1) {
          if (this.levelSetId_ == 'tutorial') {
            alert(
                'Congratulations, you have finished the tutorial levels! ' +
                'Press Enter to continue to the main game.');
            window.location =
                window.location.protocol + '//' +
                window.location.host + window.location.pathname +
                '?l=1&levelset=game1';
          }
        } else {
          alert(
              'Good job! You completed the level! Press Enter to continue ' +
              'to level ' + (this.currentLevelNumber_ + 2) + '.');
          window.location =
              window.location.protocol + '//' +
              window.location.host + window.location.pathname +
              '?l=' + Number(this.currentLevelNumber_ + 2) +
              '&levelset=' + this.levelSetId_;
        }
      } else {
        var playerChords = musicPlayer.getPlayerChords();
        var errorMessage = (
            'Not quite! Are you playing the right notes? Compare your tune ' +
            'and the desired tune to see if there\'s a difference.');
        if (currentLevelData.getTargetedFeedback) {
          var targetedMessage = currentLevelData.getTargetedFeedback(
              playerChords);
          if (targetedMessage) {
            errorMessage = targetedMessage;
          }
        }
        alert(errorMessage);
      }
    }
  });
