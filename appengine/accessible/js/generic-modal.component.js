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
          <p>
            {{message}}
          </p>
          <button (click)="hideModal()" id="modalOkButton">OK</button>
        </div>
      </div>
    </div>
  `
})
.Class({
  constructor: [musicGame.GenericModalService, function(genericModalService) {
    this.genericModalService = genericModalService;
    this.modalIsVisible = false;
    this.message = '';
    this.onCloseCallback = null;

    var that = this;
    this.genericModalService.registerPreShowHook(
      function(message, onCloseCallback) {
        that.modalIsVisible = true;
        that.message = message;
        that.onCloseCallback = onCloseCallback;

        setTimeout(function() {
          document.getElementById('modalOkButton').focus();
        }, 150);
      }
    );
  }],
  hideModal: function() {
    this.modalIsVisible = false;
    if (this.onCloseCallback) {
      this.onCloseCallback();
    }
    this.message = '';
  }
});
