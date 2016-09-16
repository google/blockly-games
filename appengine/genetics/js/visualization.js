/**
 * Blockly Games: Genetics
 *
 * Copyright 2016 Google Inc.
 * https://github.com/google/blockly-games
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview JavaScript for the visualization of the Genetics game.
 * @author kozbial@google.com (Monica Kozbial)
 */
'use strict';

goog.provide('Genetics.Visualization');

goog.require('Genetics.Cage');
goog.require('goog.object');


/**
 * Frames per second to draw.  Has no impact on game play, just the display.
 */
Genetics.Visualization.FPS = 36;

/**
 * Mapping of mouse ID to mouse for mice currently being visualized.
 * @type {!Object.<string, !Genetics.Mouse>}
 */
Genetics.Visualization.MICE = {};

/**
 * List that specifies the order of players in the data tables for the charts.
 * @type {Array.<string>}
 * @private
 */
Genetics.Visualization.playerOrder_ = [];

/**
 * Chart wrapper for chart with mice sex to count.
 * @type {google.visualization.ChartWrapper}
 * @private
 */
Genetics.Visualization.populationChartWrapper_ = null;

/**
 * Chart wrapper for chart with count of pickFight owners.
 * @type {google.visualization.ChartWrapper}
 * @private
 */
Genetics.Visualization.pickFightChartWrapper_ = null;

/**
 * Chart wrapper for chart with count of proposeMate owners.
 * @type {google.visualization.ChartWrapper}
 * @private
 */
Genetics.Visualization.proposeMateChartWrapper_ = null;

/**
 * Chart wrapper for chart with count of acceptMate owners.
 * @type {google.visualization.ChartWrapper}
 * @private
 */
Genetics.Visualization.acceptMateChartWrapper_ = null;

/**
 * Mapping of mouse sex to number of mice.
 * @type {!Object.<!Genetics.Mouse.Sex, number>}
 * @private
 */
Genetics.Visualization.mouseSexes_ = {};

/**
 * Mapping of player ID to number of mice with pickFight function of that
 * player.
 * @type {!Object<number, number>}
 * @private
 */
Genetics.Visualization.pickFightOwners_ = {};

/**
 * Mapping of player ID to number of mice with proposeMate function of that
 * player.
 * @type {!Object<number, number>}
 * @private
 */
Genetics.Visualization.proposeMateOwners_ = {};

/**
 * Mapping of player ID to number of mice with acceptMate function of that
 * player.
 * @type {!Object<number, number>}
 * @private
 */
Genetics.Visualization.acceptMateOwners_ = {};

/**
 * PID of executing task.
 * @type {number}
 */
Genetics.Visualization.pid = 0;

/**
 * Setup the visualization (run once).
 */
Genetics.Visualization.init = function() {
  var createCharts = function() {
    // Create the base options for chart style shared between charts.
    var chartOpts = {
      'hAxis': {'title': 'Time', 'titleTextStyle': {'color': '#333'},
        'format': '0'},
      'vAxis': {'minValue': 0},
      'chartArea': { 'left': '8%', 'top': '8%', 'width': '60%',
        'height': '70%' },
      'backgroundColor': 'white'
    };
    var stackGraphOpts = goog.object.unsafeClone(chartOpts);
    stackGraphOpts['isStacked'] = 'relative';
    stackGraphOpts['lineWidth'] = 0;
    stackGraphOpts['areaOpacity'] = 0.8;
    stackGraphOpts['vAxis']['maxValue'] = 1;
    var populationChartOpts = chartOpts;
    var pickFightOpts = stackGraphOpts;
    var proposeMateOpts = goog.object.clone(stackGraphOpts);
    var acceptMateOpts = goog.object.clone(stackGraphOpts);

    populationChartOpts['title'] = 'Population';
    populationChartOpts['colors'] = ['#ADD8E6', '#FFB5C1'];
    populationChartOpts['isStacked'] = true;
    populationChartOpts['vAxis']['maxValue'] = Genetics.Cage.MAX_POPULATION;
    Genetics.Visualization.populationChartWrapper_ =
        new google.visualization.ChartWrapper({
          'chartType': 'AreaChart',
          'options': populationChartOpts,
          'containerId': 'populationChart'
        });
    pickFightOpts['title'] = 'Pick Fight';
    Genetics.Visualization.pickFightChartWrapper_ =
        new google.visualization.ChartWrapper({
          'chartType': 'AreaChart',
          'options': pickFightOpts,
          'containerId': 'pickFightChart'
        });
    proposeMateOpts['title'] = 'Propose Mate';
    Genetics.Visualization.proposeMateChartWrapper_ =
        new google.visualization.ChartWrapper({
          'chartType': 'AreaChart',
          'options': proposeMateOpts,
          'containerId': 'proposeMateChart'
        });
    acceptMateOpts['title'] = 'Accept Mate';
    Genetics.Visualization.acceptMateChartWrapper_ =
        new google.visualization.ChartWrapper({
          'chartType': 'AreaChart',
          'options': acceptMateOpts,
          'containerId': 'acceptMateChart'
        });

    // Set chart Data for all charts.
    Genetics.Visualization.resetChartData_();

    Genetics.Visualization.populationChartWrapper_.draw();
    Genetics.Visualization.pickFightChartWrapper_.draw();
    Genetics.Visualization.proposeMateChartWrapper_.draw();
    Genetics.Visualization.acceptMateChartWrapper_.draw();
  };
  google.charts.load('current', {'packages': ['corechart']});
  google.charts.setOnLoadCallback(createCharts);
};

/**
 * Stop visualization.
 */
Genetics.Visualization.stop = function() {
  clearTimeout(Genetics.Visualization.pid);
};

/**
 * Clear chart data and set chart labels.
 * @private
 */
Genetics.Visualization.resetChartData_ = function() {
  Genetics.Visualization.populationChartWrapper_.setDataTable(
      google.visualization.arrayToDataTable(
          [[{label: 'Time', type: 'number'},
            {label: Genetics.Mouse.Sex.MALE, type: 'number'},
            {label: Genetics.Mouse.Sex.FEMALE, type: 'number'}]],
          false));

  // Create list of player labels and store order of players to use when
  // population data updates.
  Genetics.Visualization.playerOrder_.length = 0;
  var playerLabels = [{label: 'Time', type: 'number'}];
  for (var playerId in Genetics.Cage.players) {
    if (Genetics.Cage.players.hasOwnProperty(playerId)) {
      playerLabels.push({label: Genetics.Cage.players[playerId][0],
        type: 'number'});
      Genetics.Visualization.playerOrder_.push(playerId);
    }
  }
  Genetics.Visualization.pickFightChartWrapper_.setDataTable(
      google.visualization.arrayToDataTable([playerLabels], false));
  Genetics.Visualization.proposeMateChartWrapper_.setDataTable(
      google.visualization.arrayToDataTable([playerLabels], false));
  Genetics.Visualization.acceptMateChartWrapper_.setDataTable(
      google.visualization.arrayToDataTable([playerLabels], false));

  Genetics.Visualization.chartsUpdated_ = true;
};

/**
 * Stop and reset the visualization.
 */
Genetics.Visualization.reset = function() {
  Genetics.Visualization.stop();

  // Reset stored information about mouse population.
  Genetics.Visualization.eventNumber = 0;
  Genetics.Visualization.mouseSexes_[Genetics.Mouse.Sex.MALE] = 0;
  Genetics.Visualization.mouseSexes_[Genetics.Mouse.Sex.FEMALE] = 0;
  Genetics.Visualization.MICE = {};
  Genetics.Visualization.pickFightOwners_ = {};
  Genetics.Visualization.proposeMateOwners_ = {};
  Genetics.Visualization.acceptMateOwners_ = {};
  // Reset chart colors
  Genetics.Visualization.populationChartWrapper_
      .setOption('backgroundColor', 'white');
  Genetics.Visualization.pickFightChartWrapper_
      .setOption('backgroundColor', 'white');
  Genetics.Visualization.proposeMateChartWrapper_
      .setOption('backgroundColor', 'white');
  Genetics.Visualization.acceptMateChartWrapper_
      .setOption('backgroundColor', 'white');
  // Clear chart and set labels for data table.
  Genetics.Visualization.resetChartData_();
  // Set count for all players to 0.
  for (var i = 0; i < Genetics.Visualization.playerOrder_.length; i++) {
    var playerId = Genetics.Visualization.playerOrder_[i];
    Genetics.Visualization.pickFightOwners_[playerId] = 0;
    Genetics.Visualization.proposeMateOwners_[playerId] = 0;
    Genetics.Visualization.acceptMateOwners_[playerId] = 0;
  }
};

/**
 * Time when the previous frame was drawn.
 */
Genetics.Visualization.lastFrame = 0;

/**
 * Delay between previous frame was drawn and the current frame was scheduled.
 */
Genetics.Visualization.lastDelay = 0;

/**
 * Start the visualization running.
 */
Genetics.Visualization.start = function() {
  Genetics.Visualization.update();
};

/**
 * Start the visualization running.
 */
Genetics.Visualization.update = function() {
  Genetics.Visualization.display_();
  Genetics.Visualization.processCageEvents_();
  // Frame done.  Calculate the actual elapsed time and schedule the next frame.
  var now = Date.now();
  var workTime = now - Genetics.Visualization.lastFrame -
      Genetics.Visualization.lastDelay;
  var delay = Math.max(1, (1000 / Genetics.Visualization.FPS) - workTime);
  Genetics.Visualization.pid = setTimeout(Genetics.Visualization.update, delay);
  Genetics.Visualization.lastFrame = now;
  Genetics.Visualization.lastDelay = delay;
};

/**
 * Whether the charts need to be redrawn because they were updated.
 * @type {boolean}
 * @private
 */
Genetics.Visualization.chartsUpdated_ = true;

/**
 * Visualize the current state of the cage simulation (Genetics.Cage).
 * @private
 */
Genetics.Visualization.display_ = function() {
  // TODO(kozbial) draw current state of the cage.
  if (Genetics.Visualization.chartsUpdated_) {
    Genetics.Visualization.populationChartWrapper_.draw();
    Genetics.Visualization.pickFightChartWrapper_.draw();
    Genetics.Visualization.proposeMateChartWrapper_.draw();
    Genetics.Visualization.acceptMateChartWrapper_.draw();
    Genetics.Visualization.chartsUpdated_ = false;
  }
};

/**
 * Count for events to keep track of time passed for charts.
 * @type {number}
 */
Genetics.Visualization.eventNumber = 0;

/**
 * Process events in Cage events queue.
 * @private
 */
Genetics.Visualization.processCageEvents_ = function() {
  // Handle any queued events.
  var getMouseName = Genetics.Visualization.getMouseName;
  while (Genetics.Cage.EVENTS.length) {
    var event = Genetics.Cage.EVENTS.shift();
    switch (event['TYPE']) {
      case 'ADD':
        var mouse = event['MOUSE'];
        Genetics.Visualization.addMouse_(mouse);
        Genetics.log(getMouseName(mouse, true, true) + ' added to game.');
        break;
      case 'START_GAME':
        Genetics.Visualization.updateChartData_();
        Genetics.log('Starting game with ' +
            Object.keys(Genetics.Cage.players).length + ' players.');
        break;
      case 'FIGHT':
          var instigatingMouse = Genetics.Visualization.MICE[event['ID']];
        switch (event['RESULT']) {
          case 'NONE':
            Genetics.log(getMouseName(instigatingMouse) +
                ' elected to never fight again.');
            break;
          case 'INVALID':
            Genetics.log(getMouseName(instigatingMouse) +
                ' is confused and won\'t fight again.');
            break;
          case 'SELF':
            Genetics.log(getMouseName(instigatingMouse) +
                ' chose itself when asked whom to fight with. ' +
                getMouseName(instigatingMouse) + ' is being executed to put ' +
                'it out of its misery.');
            Genetics.Visualization.removeMouse_(instigatingMouse);
            break;
          case 'WIN':
            var opponent = Genetics.Visualization.MICE[event['OPT_OPPONENT']];
            Genetics.log(getMouseName(instigatingMouse) + ' fights and kills ' +
                getMouseName(opponent) + '.');
            Genetics.Visualization.removeMouse_(opponent);
            break;
          case 'TIE':
            var opponent = Genetics.Visualization.MICE[event['OPT_OPPONENT']];
            Genetics.log(getMouseName(instigatingMouse) + ' fights ' +
                getMouseName(opponent) + ' to a draw.');
            break;
          case 'LOSS':
            var opponent = Genetics.Visualization.MICE[event['OPT_OPPONENT']];
            Genetics.log(getMouseName(instigatingMouse) + ' fights and is ' +
                'killed by ' + getMouseName(opponent) + '.');
            Genetics.Visualization.removeMouse_(instigatingMouse);
            break;
        }
        break;
      case 'MATE':
        var proposingMouse = Genetics.Visualization.MICE[event['ID']];
        switch (event['RESULT']) {
          case 'NONE':
            Genetics.log(getMouseName(proposingMouse) +
                ' elected to never mate again.');
            break;
          case 'INVALID':
            Genetics.log(getMouseName(proposingMouse) +
                ' is confused won\'t mate again.');
            break;
          case 'SELF':
            Genetics.log(getMouseName(proposingMouse) +
                ' caught trying to mate with itself.');
            break;
          case 'INCOMPATIBLE':
            var askedMouse = Genetics.Visualization.MICE[event['OPT_PARTNER']];
            Genetics.log(getMouseName(proposingMouse) + ' mated with ' +
                getMouseName(askedMouse) + ', another ' + proposingMouse.sex +
                '.');
            break;
          case 'INFERTILE':
            var askedMouse = Genetics.Visualization.MICE[event['OPT_PARTNER']];
            Genetics.log('Mating between ' + getMouseName(proposingMouse) +
                ' and ' + getMouseName(askedMouse) + ' failed because ' +
                getMouseName(askedMouse) + ' is sterile.');
            break;
          case 'MATE_EXPLODED':
            var askedMouse = Genetics.Visualization.MICE[event['OPT_PARTNER']];
            Genetics.log(getMouseName(askedMouse) + ' exploded after ' +
                getMouseName(proposingMouse) + ' asked it out.');
            Genetics.Visualization.removeMouse_(askedMouse);
            break;
          case 'REJECTION':
            var askedMouse = Genetics.Visualization.MICE[event['OPT_PARTNER']];
            Genetics.log(getMouseName(proposingMouse) + ' asked ' +
                getMouseName(askedMouse) + ' to mate, The answer is NO!');
            break;
          case 'SUCCESS':
            var askedMouse = Genetics.Visualization.MICE[event['OPT_PARTNER']];
            Genetics.log(getMouseName(proposingMouse, true, true) + ' asked ' +
                getMouseName(askedMouse, true, true) + ' to mate, The answer ' +
                'is YES!');
            var offspring = event['OPT_OFFSPRING'];
            Genetics.log(getMouseName(offspring, true, true) + ' was born!');
            Genetics.Visualization.addMouse_(offspring);
            break;
        }
        break;
      case 'RETIRE':
        var mouse = Genetics.Visualization.MICE[event['ID']];
        Genetics.log(getMouseName(mouse) + ' dies after a productive life.');
        Genetics.Visualization.removeMouse_(mouse);
        break;
      case 'OVERPOPULATION':
        var mouse = Genetics.Visualization.MICE[event['ID']];
        Genetics.log('Cage has gotten too cramped ' + getMouseName(mouse) +
            ' can\'t compete with the younger mice and dies.');
        Genetics.Visualization.removeMouse_(mouse);
        break;
      case 'EXPLODE':
        var mouse = Genetics.Visualization.MICE[event['ID']];
        var source = event['SOURCE'];
        var cause = event['CAUSE'];
        Genetics.log(getMouseName(mouse) + ' exploded in ' + source +
            ' because ' + cause);
        Genetics.Visualization.removeMouse_(mouse);
        break;
      case 'SPIN':
        var mouse = Genetics.Visualization.MICE[event['ID']];
        var source = event['SOURCE'];
        Genetics.log(getMouseName(mouse) + ' spun in circles after ' + source +
            ' was called.');
        Genetics.Visualization.removeMouse_(mouse);
        break;
      case 'END_GAME':
        var cause = event['CAUSE'];
        var pickFightWinner = event['PICK_FIGHT_WINNER'];
        var proposeMateWinner = event['PROPOSE_MATE_WINNER'];
        var acceptMateWinner = event['ACCEPT_MATE_WINNER'];
        if(cause != 'DOMINATION') {
          Genetics.Visualization.populationChartWrapper_
              .setOption('backgroundColor', 'black');
          Genetics.Visualization.pickFightChartWrapper_
              .setOption('backgroundColor', 'black');
          Genetics.Visualization.proposeMateChartWrapper_
              .setOption('backgroundColor', 'black');
          Genetics.Visualization.acceptMateChartWrapper_
              .setOption('backgroundColor', 'black');
        }
        Genetics.log('Game ended because ' + cause + '. PickFight Winner: ' +
            pickFightWinner + ' proposeMate Winner: ' + proposeMateWinner +
            ' acceptMate Winner: ' + acceptMateWinner);
        break;
    }
    if (event['TYPE'] != 'ADD') {
      Genetics.Visualization.eventNumber++;
      Genetics.Visualization.updateChartData_();
    }
  }
};

/**
 * Add a mouse to mapping and update  internal counts.
 * @param {!Genetics.Mouse} mouse
 * @private
 */
Genetics.Visualization.addMouse_ = function(mouse) {
  Genetics.Visualization.MICE[mouse.id] = mouse;
  Genetics.Visualization.mouseSexes_[mouse.sex] += 1;
  Genetics.Visualization.pickFightOwners_[mouse.pickFightOwner] += 1;
  Genetics.Visualization.proposeMateOwners_[mouse.proposeMateOwner] += 1;
  Genetics.Visualization.acceptMateOwners_[mouse.acceptMateOwner] += 1;
};

/**
 * Remove a mouse and update internal counts.
 * @param {!Genetics.Mouse} mouse
 * @private
 */
Genetics.Visualization.removeMouse_ = function(mouse) {
  Genetics.Visualization.mouseSexes_[mouse.sex] -= 1;
  Genetics.Visualization.pickFightOwners_[mouse.pickFightOwner] -= 1;
  Genetics.Visualization.proposeMateOwners_[mouse.proposeMateOwner] -= 1;
  Genetics.Visualization.acceptMateOwners_[mouse.acceptMateOwner] -= 1;
  delete Genetics.Visualization.MICE[mouse.id];
};

/**
 * Add a row to the charts with the current status of mice.
 * @private
 */
Genetics.Visualization.updateChartData_ = function() {
  Genetics.Visualization.populationChartWrapper_.getDataTable().addRow(
      [Genetics.Visualization.eventNumber,
       Genetics.Visualization.mouseSexes_[Genetics.Mouse.Sex.MALE],
       Genetics.Visualization.mouseSexes_[Genetics.Mouse.Sex.FEMALE]]);

  var pickFightState = [Genetics.Visualization.eventNumber];
  var proposeMateState = [Genetics.Visualization.eventNumber];
  var acceptMateState = [Genetics.Visualization.eventNumber];
  for (var i = 0; i < Genetics.Visualization.playerOrder_.length; i++) {
    var playerId = Genetics.Visualization.playerOrder_[i];
    pickFightState.push(Genetics.Visualization.pickFightOwners_[playerId]);
    proposeMateState.push(Genetics.Visualization.proposeMateOwners_[playerId]);
    acceptMateState.push(Genetics.Visualization.acceptMateOwners_[playerId]);
  }
  Genetics.Visualization.pickFightChartWrapper_.getDataTable()
      .addRow(pickFightState);
  Genetics.Visualization.proposeMateChartWrapper_.getDataTable()
      .addRow(proposeMateState);
  Genetics.Visualization.acceptMateChartWrapper_.getDataTable()
      .addRow(acceptMateState);

  Genetics.Visualization.chartsUpdated_ = true;
};

/**
 * Returns a string representation of the mouse.
 * @param {!Genetics.Mouse} mouse The mouse to represent as a string.
 * @param {boolean=} opt_showStats Whether to add the mouse stats to the string
 * representation.
 * @param {boolean=} opt_showGenes Whether to add the gene owners to the string
 * representation.
 * @return {string} The string representation of the mouse.
 */
Genetics.Visualization.getMouseName = function(mouse, opt_showStats,
    opt_showGenes) {
  // Credit: http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
  function romanize(value) {
    var roman = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V',
      'IV', 'I'];
    var decimal = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    if (value <= 0 || value >= 4000) return value;
    var romanNumeral = '';
    for (var i = 0; i < roman.length; i++) {
      while (value >= decimal[i]) {
        value -= decimal[i];
        romanNumeral += roman[i];
      }
    }
    return romanNumeral;
  }
  var FEMININE_NAMES = ['Monica', 'Danielle', 'Zena', 'Brianna', 'Katie',
      'Lacy', 'Leela', 'Suzy', 'Saphira', 'Missie', 'Flo', 'Lisa'];
  var MASCULINE_NAMES = ['Neil', 'Chris', 'Charlie', 'Camden', 'Rick', 'Dean',
      'Xavier', 'Zeke', 'Han', 'Samuel', 'Wade', 'Patrick'];

  var genes = '(' + Genetics.Cage.players[mouse.proposeMateOwner][0] + '/' +
      Genetics.Cage.players[mouse.acceptMateOwner][0] + '/' +
      Genetics.Cage.players[mouse.pickFightOwner][0] + ')';
  var mouseStats = '[id:' + mouse.id + '/size:' + mouse.size + '/sex: ' +
      mouse.sex + ']';
  var names = (mouse.sex == Genetics.Mouse.Sex.FEMALE) ? FEMININE_NAMES :
      MASCULINE_NAMES;
  var name = names[Math.floor(mouse.id/2) % names.length || 0];
  var ordinal = Math.floor(mouse.id / names.length) + 1;
  if (ordinal > 1) {
    name += ' ' + romanize(ordinal);
  }

  if (opt_showGenes) {
    name += ' ' + genes;
  }
  if (opt_showStats) {
    name += ' ' + mouseStats;
  }
  return name;
};
