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

musicGame.NAME = 'MUSIC_ACCESSIBLE';

musicGame.AppView = ng.core
  .Component({
    selector: 'music-game-app',
    template: `
    <div>
      <h1>Blockly Games: {{levelSetName}}</h1>
      <h2>Current Level: Level {{currentLevelNumber + 1}}</h2>
      <ul role="navigation" class="musicGameNavigation">
        <li *ngFor="#levelNumber1Indexed of levelNumbers">
          <a *ngIf="hasReached(levelNumber1Indexed)" href="./index.html?l={{levelNumber1Indexed}}&levelset={{levelSetId}}">
            Level {{levelNumber1Indexed}}
          </a>
          <span *ngIf="!hasReached(levelNumber1Indexed)">
            Level {{levelNumber1Indexed}}
          </span>
        </li>
        <li *ngFor="#levelSetData of otherLevelSetsMetadata">
          <a href="./index.html?l={{levelNumber1Indexed}}&levelset={{levelSetData.id}}">
            {{levelSetData.name}}
          </a>
        </li>
      </ul>
    </div>

    <div style="clear: both;"></div>

    <div role="main">
      <h3>Instructions</h3>
      <p *ngFor="#para of instructions">{{para}}</p>
      <p *ngIf="hint">Hint: {{hint}}</p>
      <p *ngIf="expectedLineData">
        <button (click)="playTune()">Play desired tune</button>
      </p>
      <hr>

      <blockly-app></blockly-app>
    </div>

    <xml id="blockly-toolbox-xml" style="display: none">
      <category name="Blocks" *ngIf="blockDefns.length > 0">
        <block *ngFor="#blockDefn of blockDefns"
               [attr.type]="blockDefn.type">
          <mutation [attr.options_json]="blockDefn.optionsJson">
          </mutation>
        </block>
      </category>
    </xml>
    `,
    directives: [blocklyApp.AppView],
    providers: [musicGame.LevelManagerService, musicGame.UtilsService]
  })
  .Class({
    constructor: [
        musicGame.LevelManagerService, function(levelManagerService) {
      var currentLevelData = levelManagerService.getCurrentLevelData();
      this.otherLevelSetsMetadata =
          levelManagerService.getOtherLevelSetsMetadata();
      this.levelSetId = levelManagerService.getLevelSetId();
      this.levelSetName = levelManagerService.getLevelSetName();
      this.currentLevelNumber = levelManagerService.getCurrentLevelNumber();
      this.levelNumbers = [];
      for (var i = 0; i < levelManagerService.getNumberOfLevels(); i++) {
        this.levelNumbers.push(i + 1);
      }

      this.blockDefns = levelManagerService.getToolboxBlockDefns();

      this.beatsPerMinute = currentLevelData.beatsPerMinute;
      this.expectedLineData = currentLevelData.expectedLine;

      blocklyApp.workspace.clear();
      this.hint = currentLevelData.hint;
      this.instructions = currentLevelData.htmlInstructions;
    }],
    playTune: function() {
      var expectedLine = new MusicLine();
      expectedLine.setFromChordsAndDurations(this.expectedLineData);

      musicPlayer.reset();
      musicPlayer.play(expectedLine, this.beatsPerMinute);
    },
    hasReached: function(levelNumber1Indexed) {
      return Number(levelNumber1Indexed - 1) <= Number(this.currentLevelNumber);
    }
  });
