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

houseApp.LevelManagerService = ng.core
  .Class({
    constructor: [
        houseApp.NotificationsService, function(_notificationsService) {
      this.currentLevelNumber_ = 0;
      this.instructions = [
        'For the first task, find the cat in the living room and feed it.',
        'For the second task, go to the garage and wash the car.',
        'For the third task, play with the baby.',
        'For the fourth task, flush the toilet.',
        'For the fifth task, find the photographs in the basement.'
      ];

      this.notificationsService = _notificationsService;
      this.applauseAudioFile = new Audio('media/applause.mp3');
    }],
    playApplause_: function() {
      this.applauseAudioFile.play();
    },
    getCurrentLevelNumber: function() {
      return this.currentLevelNumber_;
    },
    getCurrentInstructions: function() {
      return this.instructions[this.currentLevelNumber_];
    },
    setCurrentLevel: function(current1IndexedLevelNumber) {
      this.currentLevelNumber_ = current1IndexedLevelNumber - 1;
    },
    onCurrentLevelSuccess: function(preMessage) {
      this.playApplause_();
      if (this.currentLevelNumber_ == 4) {
        alert('Congratulations, you have finished all the tasks!');
        // Return to the main menu.
        window.location =
            window.location.protocol + '//' +
            window.location.host + window.location.pathname + '/../index.html';
      } else {
        var message =
            preMessage +
            ' Congratulations, you finished task ' +
            (this.currentLevelNumber_ + 1) + '! ' +
            'Refer to the instructions for the next task.';
        this.notificationsService.setStatusMessage(message);
        this.currentLevelNumber_++;
      }
    }
  });
