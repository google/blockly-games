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
 * @fileoverview Angular2 Main component for the house game.
 * @author sll@google.com (Sean Lip)
 */

houseApp.HouseView = ng.core
  .Component({
    selector: 'house-app',
    template: `
    <div>
      <h3 #houseTitle id="house-title">House</h3>

      <div>
        <ol #tree tabindex="0" role="tree" id="mainTree"
            class="blocklyTree blocklyWorkspaceTree"
            [attr.aria-activedescendant]="getActiveDescId(tree.id)"
            [attr.aria-labelledby]="houseTitle.id"
            (keydown)="onKeypress($event, tree)">
          <house-tree [contents]="houseData" [level]="0"
            [tree]="tree" [isTopLevel]="true"
            [idPrefix]="'house.'">
          </house-tree>
        </ol>
      </div>
    </div>

    <label aria-hidden="true" hidden id="move-right-to-view-submenu">Move right to view submenu.</label>
    `,
    directives: [houseApp.HouseTreeView],
    providers: [
        houseApp.NotificationsService, houseApp.TreeService]
  })
  .Class({
    constructor: [
        houseApp.NotificationsService, houseApp.TreeService,
        function(_notificationsService, _treeService) {
      this.notificationsService = _notificationsService;
      this.treeService = _treeService;

      this.houseData = houseData;
    }],
    getStatusMessage: function() {
      return this.notificationsService.getStatusMessage();
    },
    getActiveDescId: function(treeId) {
      return this.treeService.getActiveDescId(treeId);
    },
    onKeypress: function(e, tree) {
      this.treeService.onKeypress(e, tree);
    }
  });
