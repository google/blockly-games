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
 * @fileoverview Angular2 Component for a generic modal for congratulatory or
 * error messages.
 *
 * @author sll@google.com (Sean Lip)
 */

musicGame.GenericModalComponent = ng.core.Component({
  selector: 'generic-modal',
  template: `
    <div *ngIf="modalIsVisible" role="dialog" tabindex="-1">
      <div (click)="hideModal()" class="blocklyModalCurtain">
        <!-- The $event.stopPropagation() here prevents the modal from
        closing when its interior is clicked. -->
        <div class="blocklyModal" (click)="$event.stopPropagation()" role="document">
          <h3 *ngIf="header">{{header}}</h3>
          <p *ngFor="#message of messageParagraphs">
            {{message}}
          </p>
          <div class="blocklyModalButtonContainer"
               *ngFor="#buttonInfo of actionButtonsInfo; #i=index">
            <button [id]="getOptionId(i)" (click)="buttonInfo.action()">
              {{buttonInfo.text}}
            </button>
          </div>
          <div class="blocklyModalButtonContainer">
            <button [id]="getDismissOptionId()" (click)="hideModal()">OK</button>
          </div>
        </div>
      </div>
    </div>
  `
})
.Class({
  constructor: [
    musicGame.GenericModalService, musicGame.LevelManagerService,
    function(genericModalService, levelManagerService) {
      this.genericModalService = genericModalService;
      this.levelManagerService = levelManagerService;
      this.modalIsVisible = false;
      this.header = '';
      this.messageParagraphs = '';
      this.actionButtonsInfo = [];
      this.onDismissCallback = null;
      this.activeActionButtonIndex = 0;
      this.keysToActions = {};

      var that = this;
      document.addEventListener('keydown', function(evt) {
        var stringifiedKeycode = String(evt.keyCode);
        if (that.keysToActions.hasOwnProperty(stringifiedKeycode)) {
          that.keysToActions[stringifiedKeycode](evt);
        }
      });

      this.genericModalService.registerPreShowHook(
        function(header, messageParagraphs, actionButtonsInfo, onDismissCallback) {
          that.modalIsVisible = true;
          that.header = header || '';
          that.messageParagraphs = messageParagraphs;
          that.actionButtonsInfo = actionButtonsInfo || [];
          that.onDismissCallback = onDismissCallback;
          that.activeActionButtonIndex = 0;

          that.keysToActions = {
            // Tab key: no-op.
            '9': function(evt) {
              evt.preventDefault();
              evt.stopPropagation();
            },
            // Enter key: selects an action and performs it.
            '13': function(evt) {
              evt.preventDefault();
              evt.stopPropagation();

              var button = document.getElementById(
                  that.getOptionId(that.activeActionButtonIndex));
              if (that.activeActionButtonIndex <
                  that.actionButtonsInfo.length) {
                that.actionButtonsInfo[that.activeActionButtonIndex].action();
              } else {
                that.hideModal();
              }
            },
            // Escape key: no-op.
            '27': function() {
              evt.preventDefault();
              evt.stopPropagation();
            },
            // Up key: navigates to the previous item in the list.
            '38': function(evt) {
              // Prevent the page from scrolling.
              evt.preventDefault();
              if (that.activeActionButtonIndex == 0) {
                that.levelManagerService.playOopsSound();
              } else {
                that.activeActionButtonIndex--;
                that.focusOnOption(that.activeActionButtonIndex);
              }
            },
            // Down key: navigates to the next item in the list.
            '40': function(evt) {
              // Prevent the page from scrolling.
              evt.preventDefault();
              if (that.activeActionButtonIndex ==
                  that.actionButtonsInfo.length) {
                that.levelManagerService.playOopsSound();
              } else {
                that.activeActionButtonIndex++;
                that.focusOnOption(that.activeActionButtonIndex);
              }
            }
          };

          setTimeout(function() {
            that.focusOnOption(0);
          }, 150);
        }
      );
    }
  ],
  focusOnOption: function(index) {
    var button = document.getElementById(this.getOptionId(index));
    button.focus();
  },
  getOptionId: function(index) {
    return 'musicGameModalButton' + index;
  },
  getDismissOptionId: function(index) {
    return this.getOptionId(this.actionButtonsInfo.length);
  },
  hideModal: function() {
    this.modalIsVisible = false;
    this.keysToActions = {};
    if (this.onDismissCallback) {
      this.onDismissCallback();
    }
  }
});
