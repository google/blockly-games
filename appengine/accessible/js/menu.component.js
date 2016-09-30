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
    <div *ngFor="#levelSetData of levelSetsMetadata">
      <h3>{{levelSetData.name}}</h3>
      <ul role="navigation" class="musicGameNavigation">
        <li *ngFor="#levelNumber1Indexed of levelSetData.levelNumbers1Indexed">
          <a href="./index.html?l={{levelNumber1Indexed}}&levelset={{levelSetId}}"
             [attr.aria-label]="'Level ' + levelNumber1Indexed"
             class="levelDot">
            {{levelNumber1Indexed}}
          </a>
        </li>
      </ul>
    </div>

    <div style="clear: both;"></div>
    `,
    directives: [],
    providers: [musicGame.LevelManagerService, musicGame.UtilsService]
  })
  .Class({
    constructor: [
        musicGame.LevelManagerService, function(levelManagerService) {
      var levelData = levelManagerService.getCurrentLevelData();
      this.levelSetsMetadata = levelManagerService.getLevelSetsMetadata();
      this.levelSetId = levelManagerService.getLevelSetId();
      this.levelSetName = levelManagerService.getLevelSetName();
      this.currentLevelNumber = levelManagerService.getCurrentLevelNumber();
      this.levelNumbers = [];
      for (var i = 0; i < levelManagerService.getNumberOfLevels(); i++) {
        this.levelNumbers.push(i + 1);
      }
    }],
    isCurrentLevelNumber: function(levelNumber1Indexed) {
      return Number(levelNumber1Indexed - 1) == Number(this.currentLevelNumber);
    }
  });
