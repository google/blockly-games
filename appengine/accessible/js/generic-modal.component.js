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
    <div *ngIf="modalIsVisible" class="blocklyModalCurtain"
         (click)="dismissModal()">
      <!-- $event.stopPropagation() prevents the modal from closing when its
      interior is clicked. -->
      <div id="genericModal" class="blocklyModal" role="alertdialog"
           (click)="$event.stopPropagation()" tabindex="-1"
           aria-labelledby="genericModalHeading"
           aria-describedby="genericModalText">
        <h3 id="genericModalHeading" *ngIf="header">{{header}}</h3>

        <div id="genericModalText" tabindex="0" role="document">
          <p *ngFor="#message of messageParagraphs">
            {{message}}
          </p>
        </div>

        <div class="blocklyModalButtonContainer"
             *ngFor="#buttonInfo of actionButtonsInfo; #i=index">
          <button [id]="getOptionId(i)" (click)="buttonInfo.action()">
            {{buttonInfo.text}}
          </button>
        </div>
        <div class="blocklyModalButtonContainer">
          <button [id]="getDismissOptionId()" (click)="dismissModal()">OK</button>
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
      this.activeActionButtonIndex = -1;
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
          that.activeActionButtonIndex = -1;

          that.keysToActions = {
            // Tab key: navigates to the previous or next item in the list.
            '9': function(evt) {
              evt.preventDefault();
              evt.stopPropagation();

              if (evt.shiftKey) {
                // Move to the previous item in the list.
                if (that.activeActionButtonIndex <= 0) {
                  that.activeActionButtonIndex = 0;
                  that.levelManagerService.playOopsSound();
                } else {
                  that.activeActionButtonIndex--;
                }
              } else {
                if (that.activeActionButtonIndex ==
                    that.actionButtonsInfo.length) {
                  that.levelManagerService.playOopsSound();
                } else {
                  that.activeActionButtonIndex++;
                }
              }

              that.focusOnOption(that.activeActionButtonIndex);
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
                that.dismissModal();
              }
            },
            // Escape key: no-op.
            '27': function() {
              evt.preventDefault();
              evt.stopPropagation();
              that.dismissModal();
            },
            // Up key: no-op.
            '38': function(evt) {
              // Prevent the page from scrolling.
              evt.preventDefault();
            },
            // Down key: no-op.
            '40': function(evt) {
              // Prevent the page from scrolling.
              evt.preventDefault();
            }
          };

          setTimeout(function() {
            document.getElementById('genericModalText').focus();
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
  dismissModal: function() {
    this.modalIsVisible = false;
    this.keysToActions = {};
    if (this.onDismissCallback) {
      this.onDismissCallback();
    }
  }
});
