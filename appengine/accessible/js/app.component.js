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
 * @fileoverview Angular2 Component for the music game.
 * @author sll@google.com (Sean Lip)
 */

musicGame.AppView = ng.core
  .Component({
    selector: 'music-game-app',
    template: `
    <h2>Current Level: Level {{currentLevelNumber + 1}}</h2>
    <ul role="navigation" class="musicGameNavigation">
      <li *ngFor="#levelNumber1Indexed of levelNumbers">
        <a *ngIf="hasReached(levelNumber1Indexed)" href="./index.html?l={{levelNumber1Indexed}}">
          Level {{levelNumber1Indexed}}
        </a>
        <span *ngIf="!hasReached(levelNumber1Indexed)">
          Level {{levelNumber1Indexed}}
        </span>
      </li>
    </ul>

    <div role="main">
      <h3>Instructions</h3>
      <p *ngFor="#para of instructions">{{para}}</p>
      <h3 *ngIf="hints.length > 0">Hints</h3>
      <p *ngFor="#para of hints">{{para}}</p>
      <blockly-app></blockly-app>
    </div>

    <xml id="blockly-toolbox-xml" style="display: none">
      <category name="Loops" *ngIf="loopsBlockTypes.length > 0">
        <block *ngFor="#blockType of loopsBlockTypes"
               [attr.type]="blockType">
        </block>
      </category>
      <category name="Music" *ngIf="musicBlockTypes.length > 0">
        <block *ngFor="#blockType of musicBlockTypes"
               [attr.type]="blockType">
        </block>
      </category>
    </xml>
    `,
    directives: [blocklyApp.AppView],
    providers: [musicGame.LevelManagerService]
  })
  .Class({
    constructor: [
        musicGame.LevelManagerService, function(levelManagerService) {
      var currentLevelData = levelManagerService.getCurrentLevelData();

      this.currentLevelNumber = levelManagerService.getCurrentLevelNumber();
      this.levelNumbers = [];
      for (var i = 0; i < levelManagerService.getNumberOfLevels(); i++) {
        this.levelNumbers.push(i + 1);
      }

      this.musicBlockTypes = [];
      this.loopsBlockTypes = [];
      var that = this;
      levelManagerService.getAllowedBlockTypes().forEach(function(blockType) {
        if (blockType.indexOf('music_') == 0) {
          that.musicBlockTypes.push(blockType);
        } else if (blockType.indexOf('controls_') == 0) {
          that.loopsBlockTypes.push(blockType);
        } else {
          throw Error('Unknown block type: ' + blockType);
        }
      });

      blocklyApp.workspace.clear();
      this.hints = currentLevelData.hints;
      this.instructions = currentLevelData.htmlInstructions;
    }],
    hasReached: function(levelNumber1Indexed) {
      return Number(levelNumber1Indexed - 1) <= Number(this.currentLevelNumber);
    }
  });
