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
    <div>
      <h1>Blockly Games: {{levelSetName}}</h1>
      <h2>Stage {{currentLevelNumber + 1}}</h2>
    </div>

    <div style="clear: both;"></div>

    <div role="main">
      <h3 id="instructions" tabindex="-1">Instructions</h3>
      <p id="instructionsText">{{levelData.instructions}}</p>
      <p *ngIf="levelData.hint">Hint: {{levelData.hint}}</p>

      <p *ngIf="levelData.expectedLine">
        <button (click)="playTune()">Play desired tune</button>
      </p>
      <hr>

      <blockly-app></blockly-app>
    </div>

    <xml id="blockly-toolbox-xml" style="display: none">
      <block *ngFor="#blockDefn of blockDefns"
             [attr.type]="blockDefn.type">
        <mutation [attr.options_json]="blockDefn.optionsJson">
        </mutation>
      </block>
    </xml>
    `,
    directives: [blocklyApp.AppView],
    providers: [musicGame.LevelManagerService, musicGame.UtilsService]
  })
  .Class({
    constructor: [
        musicGame.LevelManagerService, function(levelManagerService_) {
      this.levelManagerService = levelManagerService_;

      this.levelData = this.levelManagerService.getCurrentLevelData();
      this.levelSetId = this.levelManagerService.getLevelSetId();
      this.levelSetName = this.levelManagerService.getLevelSetName();
      this.currentLevelNumber =
          this.levelManagerService.getCurrentLevelNumber();
      this.levelNumbers = [];
      for (var i = 0; i < this.levelManagerService.getNumberOfLevels(); i++) {
        this.levelNumbers.push(i + 1);
      }
      this.blockDefns = this.levelManagerService.getToolboxBlockDefns();

      blocklyApp.workspace.clear();

      var that = this;
      ACCESSIBLE_GLOBALS.toolbarButtonConfig[0].action = function() {
        that.runCode();
      };
      ACCESSIBLE_GLOBALS.toolbarButtonConfig[1].action = function() {
        var expectedLine = new MusicLine();
        expectedLine.setFromChordsAndDurations(that.levelData.expectedLine);

        musicPlayer.reset();
        musicPlayer.play(expectedLine, that.levelData.beatsPerMinute);
      };
      ACCESSIBLE_GLOBALS.toolbarButtonConfig[1].isHidden = function() {
        return !that.levelData.expectedLine;
      };

      this.levelManagerService.loadExistingCode();

      if (this.levelData.introMessage) {
        alert(this.levelData.introMessage);
      }
    }],
    playTune: function() {
      var expectedLine = new MusicLine();
      expectedLine.setFromChordsAndDurations(this.levelData.expectedLine);

      musicPlayer.reset();
      musicPlayer.play(expectedLine, this.levelData.beatsPerMinute);
    },
    runCode: function() {
      if (blocklyApp.workspace.topBlocks_.length != 1) {
        this.levelManagerService.playOops_();

        var alertMessage =
            blocklyApp.workspace.topBlocks_.length == 0 ?
            'There are no blocks in the workspace.' :
            ('Not quite! You currently have more than one "island" in the ' +
             'workspace. Make sure all your blocks are joined together ' +
             'into a single program.');
        setTimeout(function() {
          alert(alertMessage);
        }, 500);

        return;
      }

      musicPlayer.reset();
      runCodeToPopulatePlayerLine();

      var that = this;
      musicPlayer.playPlayerLine(this.levelData.beatsPerMinute, function() {
        that.levelManagerService.gradeCurrentLevel();
      });
    },
  });
