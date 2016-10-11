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
 * @fileoverview Angular2 Component that details how house subtrees are
 * rendered in the AccessibleBlockly workspace.
 * @author sll@google.com (Sean Lip)
 */

houseApp.HouseTreeView = ng.core
  .Component({
    selector: 'house-tree',
    template: `
    <template ngFor #item [ngForOf]="contents" #contentIndex="index">
      <li [id]="idPrefix + contentIndex"
          role="treeitem" class="blocklyHasChildren" [attr.aria-level]="level"
          [attr.aria-labelledBy]="generateAriaLabelledByAttr(idPrefix + contentIndex + 'nameLabel', 'move-right-to-view-submenu')">
        <label [id]="idPrefix + contentIndex + 'nameLabel'">{{item.name}}</label>

        <ol role="group" *ngIf="item.contents">
          <house-tree [contents]="item.contents" [level]="level + 1" [tree]="tree"
                      [idPrefix]="idPrefix + '.' + contentIndex">
          </house-tree>
        </ol>

        <ol role="group">
          <li *ngFor="#action of item.actions; #i = index;"
              [id]="idPrefix + contentIndex + 'action' + i" role="treeitem"
              [attr.aria-labelledBy]="generateAriaLabelledByAttr(idPrefix + contentIndex + 'action' + i + 'button', 'blockly-button')"
              [attr.aria-level]="level + 1">
            <button [id]="idPrefix + contentIndex + 'action' + i"
                    (click)="onClickButton(action.alert)" tabindex="-1">
              {{action.name}}
            </button>
          </li>
        </ol>
      </li>
    </template>
    `,
    directives: [ng.core.forwardRef(function() {
      return houseApp.HouseTreeView;
    })],
    inputs: ['contents', 'level', 'tree', 'isTopLevel', 'idPrefix']
  })
  .Class({
    constructor: [houseApp.TreeService, function(_treeService) {
      this.treeService = _treeService;
    }],
    ngOnInit: function() {
      // TODO(sll): Redo this.
      // Make a list of all the id keys.
      this.idKeys = ['blockRoot', 'blockSummary', 'listItem', 'label'];

      if (this.contents.actions) {
        this.contents.actions.forEach(function(action, index) {
          that.idKeys.push('action' + index, 'action' + index + 'Button');
        });
      }
    },
    ngAfterViewInit: function() {
      // TODO(sll): Redo this.
      // If this is a top-level tree in the workspace, set its id and active
      // descendant. (Note that a timeout is needed here in order to trigger
      // Angular change detection.)
      var that = this;
      setTimeout(function() {
        if (that.tree && that.isTopLevel && !that.tree.id) {
          that.tree.id = that.generateUniqueId();
        }
        if (that.tree && that.isTopLevel &&
            !that.treeService.getActiveDescId(that.tree.id)) {
          that.treeService.setActiveDesc(that.idPrefix + '0', that.tree.id);
        }
      });
    },
    onClickButton: function(message) {
      // TODO(sll): Replace with an aria-live notification.
      alert(message);
    },
    generateAriaLabelledByAttr: function(mainLabel, secondLabel) {
      return mainLabel + (secondLabel ? ' ' + secondLabel : '');
    },
    generateUniqueId: function() {
      return String(Math.round(Math.random() * 1000000000000000));
    }
  });
