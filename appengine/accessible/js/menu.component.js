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
 * @fileoverview Angular2 Component for the menu of the music game.
 * @author sll@google.com (Sean Lip)
 */

musicGame.MenuView = ng.core
  .Component({
    selector: 'music-game-menu',
    template: `
    <div>
      <h3>House</h3>
      <ul role="navigation" class="musicGameNavigation">
        <li>
          <a href="./house.html" [attr.aria-label]="'Level 1'" class="levelDot">
            1
          </a>
        </li>
      </ul>
    </div>

    <div *ngFor="#levelSetData of levelSetsMetadata">
      <h3>{{levelSetData.name}}</h3>
      <ul role="navigation" class="musicGameNavigation">
        <li *ngFor="#level of levelSetData.levels">
          <a href="./stage.html?l={{level.number1Indexed}}&levelset={{levelSetData.id}}"
             [attr.aria-label]="getLevelDotAriaLabel(level)"
             class="levelDot"
             [ngClass]="{'levelDotCompleted': level.completed}">
            {{level.number1Indexed}}
          </a>
        </li>
      </ul>
    </div>

    <p class="footer">
      Want to start over? <button (click)="clearData()">Clear data</button>
    </p>
    `,
    directives: [],
    providers: [
        musicGame.GenericModalService, musicGame.LevelManagerService,
        musicGame.UtilsService]
  })
  .Class({
    constructor: [
        musicGame.LevelManagerService, function(levelManagerService) {
      this.levelManagerService = levelManagerService;
      this.levelSetsMetadata = levelManagerService.getLevelSetsMetadata();
    }],
    clearData: function() {
      this.levelManagerService.clearData();
    },
    getLevelDotAriaLabel: function(level) {
      var label = 'Level ' + level.number1Indexed;
      if (level.isCompleted) {
        label += ' completed';
      }
      return label;
    },
    isCurrentLevelNumber: function(levelNumber1Indexed) {
      return Number(levelNumber1Indexed - 1) == Number(this.currentLevelNumber);
    }
  });
