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
goog.require('Genetics.MouseAvatar');
goog.require('goog.dom');
goog.require('goog.math');
goog.require('goog.object');

/**
 * Number of milliseconds between update calls.
 * @type {number}
 */
Genetics.Visualization.UPDATE_DELAY_MSC = 500;

Genetics.Visualization.DUST_SIZE = 50;
Genetics.Visualization.HEART_SIZE = 30;

Genetics.Visualization.DISPLAY_SIZE = 400;

Genetics.Visualization.COLOURS = ['#ff8b00', '#c90015', '#166c0b', '#11162a'];

/**
 * Indicates whether the game has been stopped.
 * @type {boolean}
 * @private
 */
Genetics.Visualization.stopped_ = true;


/**
 * Indicates whether the game has ended.
 * @type {boolean}
 * @private
 */
Genetics.Visualization.gameOverReached_ = true;

/**
 *
 * @type {string}
 */
Genetics.Visualization.gameOverCause = '';

/**
 *
 * @type {!Object.<string, !Array.<number>>}
 * @const
 */
Genetics.Visualization.gameRankings = {};

/**
 * Mapping of mouse ID to mouse for mice currently being visualized.
 * @type {!Object.<string, !Genetics.MouseAvatar>}
 * @private
 */
Genetics.Visualization.mice_ = {};

/**
 * Is the charts tab open?
 * @type {boolean}
 * @private
 */
Genetics.Visualization.areChartsVisible_ = false;

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
 * The div that contains the HTML elements
 * @type {HTMLDivElement}
 * @private
 */
Genetics.Visualization.display_ = null;

/**
 * Mapping of mouse sex to number of mice.
 * @type {!Object.<!Genetics.Mouse.Sex, number>}
 * @private
 */
Genetics.Visualization.mouseSexes_ = {};

/**
 * List indexed by player ID of number of mice with pickFight function of that
 * player.
 * @type {!List<number, number>}
 * @const
 * @private
 */
Genetics.Visualization.pickFightOwners_ = [];

/**
 * List indexed by player ID of number of mice with proposeMate function of that
 * player.
 * @type {!List<number, number>}
 * @const
 * @private
 */
Genetics.Visualization.proposeMateOwners_ = [];

/**
 * List indexed by player ID of number of mice with acceptMate function of that
 * player.
 * @type {!List<number, number>}
 * @const
 * @private
 */
Genetics.Visualization.acceptMateOwners_ = [];

/**
 * PID of executing task.
 * @type {number}
 * @private
 */
Genetics.Visualization.pid_ = 0;

/**
 * Setup the visualization (run once).
 */
Genetics.Visualization.init = function() {
  // Sync the display size constant on mouseAvatar.
  Genetics.MouseAvatar.DISPLAY_SIZE = Genetics.Visualization.DISPLAY_SIZE;

  // Setup the tabs.
  Genetics.tabbar = new goog.ui.TabBar();
  Genetics.tabbar.decorate(document.getElementById('vizTabbar'));

  var changeTab = function(index) {
    // Show the correct tab contents.
    var names = ['displayContent', 'charts'];
    for (var i = 0, name; name = names[i]; i++) {
      var div = document.getElementById(name);
      if (name == 'displayContent') {
        div.style.visibility = (i == index) ? 'visible' : 'hidden';
      } else {
        Genetics.Visualization.areChartsVisible_ = (i == index);
        if (i == index) {
          Genetics.Visualization.drawCharts_();
        }
        div.style.display = (i == index) ? 'block' : 'none';
      }
    }
  };
  // Handle SELECT events dispatched by tabs.
  goog.events.listen(Genetics.tabbar, goog.ui.Component.EventType.SELECT,
      function(e) {
        var index = e.target.getParent().getSelectedTabIndex();
        changeTab(index);
      });

  changeTab(0);

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
    stackGraphOpts['colors'] = Genetics.Visualization.COLOURS;
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

  Genetics.Visualization.display_ = document.getElementById('display');
};

/**
 * Clear chart data and set chart labels.
 * @private
 */
Genetics.Visualization.resetChartData_ = function() {
  if (google.visualization) {
    Genetics.Visualization.populationChartWrapper_.setDataTable(
        google.visualization.arrayToDataTable(
            [[{label: 'Time', type: 'number'},
              {label: Genetics.Mouse.Sex.MALE, type: 'number'},
              {label: Genetics.Mouse.Sex.FEMALE, type: 'number'}]],
            false));

    var playerLabels = [{label: 'Time', type: 'number'}];
    for (var i = 0, player; player = Genetics.Cage.players[i]; i++) {
      playerLabels.push({label: player.name, type: 'number'});
    }
    Genetics.Visualization.pickFightChartWrapper_.setDataTable(
        google.visualization.arrayToDataTable([playerLabels], false));
    Genetics.Visualization.proposeMateChartWrapper_.setDataTable(
        google.visualization.arrayToDataTable([playerLabels], false));
    Genetics.Visualization.acceptMateChartWrapper_.setDataTable(
        google.visualization.arrayToDataTable([playerLabels], false));

    Genetics.Visualization.chartsNeedUpdate_ = true;
  }
};

/**
 * Stop visualization.
 */
Genetics.Visualization.stop = function() {
  clearTimeout(Genetics.Visualization.pid_);
  Genetics.Visualization.stopped_ = true;
  for (var mouseId in Genetics.Visualization.mice_) {
    var mouseAvatar = Genetics.Visualization.mice_[mouseId];
    mouseAvatar.stop();
  }
};

/**
 * Stop and reset the visualization.
 */
Genetics.Visualization.reset = function() {
  Genetics.Visualization.stop();

  Genetics.Visualization.eventNumber = 0;
  // Reset stored information about mouse population.
  Genetics.Visualization.mice_ = {};
  Genetics.Visualization.mouseSexes_[Genetics.Mouse.Sex.MALE] = 0;
  Genetics.Visualization.mouseSexes_[Genetics.Mouse.Sex.FEMALE] = 0;
  Genetics.Visualization.pickFightOwners_.length = 0;
  Genetics.Visualization.proposeMateOwners_.length = 0;
  Genetics.Visualization.acceptMateOwners_.length = 0;
  // Set count for all players to 0.
  for (var i = 0; i < Genetics.Cage.players.length; i++) {
    Genetics.Visualization.pickFightOwners_.push(0);
    Genetics.Visualization.proposeMateOwners_.push(0);
    Genetics.Visualization.acceptMateOwners_.push(0);
  }
  // Clear chart and set labels for data table.
  Genetics.Visualization.resetChartData_();
  // Reset Player stats.
  Genetics.Visualization.playerStatsDivs_.length = 0;
  var nameRow = document.getElementById('playerNameRow');
  var statsRow = document.getElementById('playerStatRow');
  goog.dom.removeChildren(nameRow);
  goog.dom.removeChildren(statsRow);

  var needsWidthHeightSet = [];

  for (var playerId = 0, player; player = Genetics.Cage.players[playerId]; playerId++) {
    // Assign a colour to each avatar.
    var hexColour = Genetics.Visualization.COLOURS[playerId];
    var playerStat = {};
    // <td>
    //   <div class="playerStatName">Rabbit</div>
    //   <div>&nbsp;</div>
    // </td>
    var td = document.createElement('td');
    td.style.borderColor = hexColour;
    var nameDiv = document.createElement('div');
    nameDiv.className = 'playerStatContainer';
    var playerName = player.name;
    nameDiv.title = playerName;
    var div = document.createElement('div');
    div.className = 'playerStatName';
    div.style.background = hexColour;
    div.style.width = '100%';
    var text = document.createTextNode(playerName);
    div.appendChild(text);
    nameDiv.appendChild(div);
    td.appendChild(nameDiv);
    needsWidthHeightSet.push(nameDiv);
    var div = document.createElement('div');
    var text = document.createTextNode('\u00a0');
    div.appendChild(text);
    td.appendChild(div);
    nameRow.appendChild(td);
    // <td>
    //   <div class="playerStatName">Rabbit</div>
    //   <div class="pickFightStat" ></div>
    //   <div class="proposeMateStat" ></div>
    //   <div class="acceptMateStat" ></div>
    //   <div>&nbsp;</div>
    // </td>
    var td = document.createElement('td');
    td.style.borderColor = hexColour;
    var statsDiv = document.createElement('div');
    statsDiv.className = 'playerStatContainer';

    var pickFightDiv = document.createElement('div');
    pickFightDiv.style.background = hexColour;
    pickFightDiv.style.width = 0;
    pickFightDiv.style.height = 100 / 3 + '%';
    playerStat['pickFightDiv'] = pickFightDiv;
    statsDiv.appendChild(pickFightDiv);
    var proposeMateDiv = document.createElement('div');
    proposeMateDiv.style.background = hexColour;
    proposeMateDiv.style.width = 0;
    proposeMateDiv.style.height = 100 / 3 + '%';
    playerStat['proposeMateDiv'] = proposeMateDiv;
    statsDiv.appendChild(proposeMateDiv);
    var acceptMateDiv = document.createElement('div');
    acceptMateDiv.style.background = hexColour;
    acceptMateDiv.style.width = 0;
    acceptMateDiv.style.height = 100 / 3 + '%';
    playerStat['acceptMateDiv'] = acceptMateDiv;
    statsDiv.appendChild(acceptMateDiv);

    var div = document.createElement('div');
    div.className = 'mouseFunctionIcons';
    statsDiv.appendChild(div);

    td.appendChild(statsDiv);
    playerStat.mainDiv = statsDiv;
    needsWidthHeightSet.push(statsDiv);
    var div = document.createElement('div');
    div.style.height = '60px';
    var text = document.createTextNode('\u00a0');
    div.appendChild(text);
    td.appendChild(div);
    statsRow.appendChild(td);

    Genetics.Visualization.playerStatsDivs_.push(playerStat);
  }
  for (var i = 0; i < needsWidthHeightSet.length; i++) {
      var div = needsWidthHeightSet[i];
      div.style.width = (div.parentNode.offsetWidth - 2) + 'px';
      div.style.height = (div.parentNode.offsetHeight - 2) + 'px';
  }

  // Remove child DOM elements on display div.
  goog.dom.removeChildren(Genetics.Visualization.display_);
};

/**
 * Start the visualization running.
 */
Genetics.Visualization.start = function() {
  Genetics.Visualization.gameOverReached_ = false;
  Genetics.Visualization.gameRankings = {};
  Genetics.Visualization.gameOverCause = '';
  Genetics.Visualization.stopped_ = false;
  Genetics.Visualization.update();
};

/**
 * Update the visualization.
 */
Genetics.Visualization.update = function() {
  if (!Genetics.Visualization.stopped_) {
    if (!Genetics.Visualization.gameOverReached_) {
      Genetics.Visualization.processCageEvents_();
      Genetics.Visualization.drawCharts_();
    } else {
      // Check that no mice are currently busy performing an animation sequence.
      var allMiceFree = true;
      for (var mouseID in Genetics.Visualization.mice_) {
        var mouseAvatar = Genetics.Visualization.mice_[mouseID];
        if (mouseAvatar.busy) {
          allMiceFree = false;
          break;
        }
      }
      if (allMiceFree) {
        // Display end game.
        Genetics.Visualization.displayGameEnd();
        return;
      }
    }
    Genetics.Visualization.pid_ = setTimeout(Genetics.Visualization.update,
        Genetics.Visualization.UPDATE_DELAY_MSC);
  }
};

/**
 * Whether the charts need to be redrawn because they were updated.
 * @type {boolean}
 * @private
 */
Genetics.Visualization.chartsNeedUpdate_ = true;

/**
 *
 * @type {!Array.<!Object.<HTMLDivElement>>}
 * @private
 */
Genetics.Visualization.playerStatsDivs_ = [];

/***
 * Update the percentage bars for player functions under the visualization.
 * @private
 */
Genetics.Visualization.updateStats_ = function() {
  var mouseCount = Genetics.Visualization.mouseSexes_[Genetics.Mouse.Sex.MALE] +
      Genetics.Visualization.mouseSexes_[Genetics.Mouse.Sex.FEMALE];
  for (var playerId = 0;
       playerId < Genetics.Visualization.playerStatsDivs_.length; playerId++) {
    var playerStats = Genetics.Visualization.playerStatsDivs_[playerId];
    var pickFightPercent = (100 *
        Genetics.Visualization.pickFightOwners_[playerId] / mouseCount) || 0;
    playerStats.pickFightDiv.style.width = pickFightPercent + '%';
    var proposeMatePercent = (100 *
        Genetics.Visualization.proposeMateOwners_[playerId] / mouseCount) || 0;
    playerStats.proposeMateDiv.style.width = proposeMatePercent + '%';
    var acceptMatePercent = (100 *
        Genetics.Visualization.acceptMateOwners_[playerId] / mouseCount) || 0;
    playerStats.acceptMateDiv.style.width = acceptMatePercent + '%';
    playerStats.mainDiv.title = 'pickFight ' +
        Math.round(pickFightPercent * 100) / 100 + '%\nproposeMate ' +
        Math.round(proposeMatePercent * 100) / 100 + '%\nacceptMate ' +
        Math.round(acceptMatePercent * 100) / 100 + '%';
  }
};

/**
 * Visualize the current state of the cage simulation (Genetics.Cage).
 * @private
 */
Genetics.Visualization.drawCharts_ = function() {
  if (Genetics.Visualization.chartsNeedUpdate_ &&
      Genetics.Visualization.areChartsVisible_) {
    // Redraw the charts in the charts tab.
    Genetics.Visualization.populationChartWrapper_.draw();
    Genetics.Visualization.pickFightChartWrapper_.draw();
    Genetics.Visualization.proposeMateChartWrapper_.draw();
    Genetics.Visualization.acceptMateChartWrapper_.draw();

    Genetics.Visualization.chartsNeedUpdate_ = false;
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

    var mouse = (event['ID'] != null) ?
        Genetics.Visualization.mice_[event['ID']] : null;
    var opponent = (event['OPT_OPPONENT'] != null) ?
        Genetics.Visualization.mice_[event['OPT_OPPONENT']] : null;
    var askedMouse = (event['OPT_PARTNER'] != null) ?
        Genetics.Visualization.mice_[event['OPT_PARTNER']] : null;
    if ((mouse && mouse.busy) || (opponent && opponent.busy) ||
        (askedMouse && askedMouse.busy)) {
      // If any involved mice are busy, process event later.
      Genetics.Cage.EVENTS.unshift(event);
      break;
    }
    switch (event['TYPE']) {
      case 'ADD':
        var addedMouse =
            Genetics.Visualization.createMouseAvatar(event['MOUSE']);
        var x = Math.random() * Genetics.Visualization.DISPLAY_SIZE -
            Genetics.MouseAvatar.WIDTH;
        var y = Math.random() * Genetics.Visualization.DISPLAY_SIZE -
            Genetics.MouseAvatar.WIDTH;

        Genetics.Visualization.addMouse_(addedMouse, x, y, false,
            function() { this.busy = false;}.bind(addedMouse));
        break;
      case 'START_GAME':
        Genetics.log('Starting game with ' + Genetics.Cage.players.length +
            ' players.');
        break;
      case 'FIGHT':
        Genetics.Visualization.processFightEvent(event, mouse, opponent);
        break;
      case 'MATE':
        Genetics.Visualization.processMateEvent(event, mouse, askedMouse);
        break;
      case 'RETIRE':
        Genetics.Visualization.killMouse_(mouse, 'RETIRE');
        Genetics.log(getMouseName(mouse) + ' dies after a productive life.');
        break;
      case 'OVERPOPULATION':
        Genetics.Visualization.killMouse_(mouse, 'OVERPOPULATION');
        Genetics.log('Cage has gotten too cramped ' + getMouseName(mouse) +
            ' can\'t compete with the younger mice and dies.');
        break;
      case 'EXPLODE':
        var source = event['SOURCE'];
        var cause = event['CAUSE'];
        Genetics.Visualization.killMouse_(mouse, 'EXPLOSION');
        Genetics.log(getMouseName(mouse) + ' exploded in ' + source +
            ' because \"' + cause + '\"');
        break;
      case 'END_GAME':
        Genetics.Visualization.gameOverReached_ = true;
        Genetics.Visualization.gameOverCause = event['CAUSE'];
        Genetics.Visualization.gameRankings = {
          'pickFight': event['PICK_FIGHT_RANK'],
          'proposeMate': event['PROPOSE_MATE_RANK'],
          'acceptMate': event['ACCEPT_MATE_RANK']};
        break;
    }

  }
};

/**
 * Display the end game summary.
 */
Genetics.Visualization.displayGameEnd = function() {
  var functionWinnersText = {'pickFight': '', 'proposeMate': '',
    'acceptMate': '' };
  var mouseFunctions = ['pickFight', 'proposeMate', 'acceptMate'];
  for (var i = 0; i < mouseFunctions.length; i++) {
    var mouseFunction = mouseFunctions[i];
    var functionWinnersList =
        Genetics.Visualization.gameRankings[mouseFunction][0];
    for (var j = 0; functionWinnersList && j < functionWinnersList.length;
        j++) {
      var playerId = functionWinnersList[j];
      Genetics.Visualization.playerStatsDivs_[playerId][mouseFunction + 'Div']
          .classList += 'winningFunction';
      functionWinnersText[mouseFunction] +=
          Genetics.Cage.players[playerId].name + ' ';
    }
  }

  // TODO decide whether to do this?
  // Stop visualization.
  // Genetics.Visualization.stop();

  var endGameDiv = document.createElement('div');
  endGameDiv.setAttribute('class', 'endGameDisplay');
  Genetics.Visualization.display_.appendChild(endGameDiv);

  Genetics.log('Game ended because ' + Genetics.Visualization.gameOverCause +
      '. PickFight Winners: ' + functionWinnersText['pickFight'] +
      ' proposeMate Winners: ' + functionWinnersText['proposeMate'] +
      ' acceptMate Winners: ' + functionWinnersText['acceptMate']);
};

/**
 * Process fight events.
 * @param {!Object.<string, string|!Genetics.Mouse>} event
 * @param {!Genetics.MouseAvatar} instigator
 * @param {!Genetics.MouseAvatar} opt_opponent
 */
Genetics.Visualization.processFightEvent = function(event, instigator,
    opt_opponent) {
  var getMouseName = Genetics.Visualization.getMouseName;
  var opponent = opt_opponent || null;
  var result = event['RESULT'];

  if (result == 'NONE') {
    // TODO Show peace sign over mouse.
    Genetics.log(getMouseName(instigator) +
        ' elected to never fight again.');
  } else {
    var endFight = function() {
      instigator.busy = false;
      if (result != 'SELF') {
        opponent.busy = false;
      }
    };

    instigator.busy = true;
    if (result == 'SELF') {
      Genetics.Visualization.fight_(instigator, instigator, result, endFight);
    } else {
      opponent.busy = true;
      Genetics.Visualization.moveMiceTogether_(instigator, opponent,
          goog.bind(Genetics.Visualization.fight_, null, instigator, opponent,
              result, endFight));
    }
  }
};

/**
 * Process mate events.
 * @param {!Object.<string, string|!Genetics.Mouse>} event
 * @param {!Genetics.MouseAvatar} proposingMouse
 * @param {!Genetics.MouseAvatar} opt_askedMouse
 */
Genetics.Visualization.processMateEvent = function(event, proposingMouse,
    opt_askedMouse) {
  var getMouseName = Genetics.Visualization.getMouseName;
  var askedMouse = opt_askedMouse || null;

  var result = event['RESULT'];
  if (result == 'NONE') {
    Genetics.log(getMouseName(proposingMouse) +
        ' elected to never mate again.');
  } else if (result == 'SELF') {
    Genetics.log(getMouseName(proposingMouse) +
        ' caught trying to mate with itself.');
  } else if (result == 'MATE_EXPLODED') {
    Genetics.log(getMouseName(askedMouse) + ' exploded after ' +
        getMouseName(proposingMouse) + ' asked it out.');
  } else if (result == 'REJECTION') {
    Genetics.log(getMouseName(proposingMouse) + ' asked ' +
        getMouseName(askedMouse) + ' to mate, The answer is NO!');
  } else {
    // result == 'SUCCESS' || result == 'INCOMPATIBLE' || result == 'INFERTILE'
    Genetics.log(getMouseName(proposingMouse, true, true) + ' asked ' +
        getMouseName(askedMouse, true, true) + ' to mate, The answer ' +
        'is YES!');

    var x = goog.math.average(parseInt(proposingMouse.element.style.left, 10),
            parseInt(askedMouse.element.style.left, 10)) +
        Genetics.MouseAvatar.HALF_SIZE;
    var y = goog.math.average(parseInt(proposingMouse.element.style.top, 10),
            parseInt(askedMouse.element.style.top, 10)) +
        Genetics.MouseAvatar.HALF_SIZE;

    if (result == 'SUCCESS') {
      // If mating is successful, create and add reference to offspring so that
      // future events involving that mouse that are detected before the end
      // of the birth animation will be able to access it.
      var offspring = Genetics.Visualization
          .createMouseAvatar(event['OPT_OFFSPRING']);
    }

    var mateResult = function() {
      if (result == 'SUCCESS') {
        Genetics.Visualization.addMouse_(offspring, x, y, true,
            function() { offspring.busy = false;});
      } else if (result == 'INCOMPATIBLE') {
        Genetics.log(getMouseName(proposingMouse) + ' mated with ' +
            getMouseName(askedMouse) + ', another ' + proposingMouse.sex +
            '.');
      } else {  // result == 'INFERTILE'
        Genetics.log('Mating between ' + getMouseName(proposingMouse) +
            ' and ' + getMouseName(askedMouse) + ' failed because ' +
            getMouseName(askedMouse) + ' is sterile.');
      }
      // Have the parent mice move around before participating in a new event.
      proposingMouse.moveAbout(3, function() { proposingMouse.busy = false; });
      askedMouse.moveAbout(3, function() { askedMouse.busy = false; });
    };
    proposingMouse.busy = true;
    askedMouse.busy = true;
    Genetics.Visualization.moveMiceTogether_(proposingMouse, askedMouse,
        goog.bind(Genetics.Visualization.showHeart_, null, result, x, y,
            mateResult));

  }
};

/**
 * Add a row to the charts with the current status of mice.
 * @private
 */
Genetics.Visualization.updateChartData_ = function() {
  Genetics.Visualization.eventNumber++;
  Genetics.Visualization.populationChartWrapper_.getDataTable().addRow(
      [Genetics.Visualization.eventNumber,
       Genetics.Visualization.mouseSexes_[Genetics.Mouse.Sex.MALE],
       Genetics.Visualization.mouseSexes_[Genetics.Mouse.Sex.FEMALE]]);

  var pickFightState = [Genetics.Visualization.eventNumber];
  var proposeMateState = [Genetics.Visualization.eventNumber];
  var acceptMateState = [Genetics.Visualization.eventNumber];
  for (var playerId = 0; playerId < Genetics.Cage.players.length; playerId++) {
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

  Genetics.Visualization.chartsNeedUpdate_ = true;
};

/**
 * Returns a string representation of the mouse.
 * @param {!Genetics.Mouse|!Genetics.MouseAvatar} mouse
 * The mouse to represent as a string.
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

  var genes = '(' + Genetics.Cage.players[mouse.proposeMateOwner].name + '/' +
      Genetics.Cage.players[mouse.acceptMateOwner].name + '/' +
      Genetics.Cage.players[mouse.pickFightOwner].name + ')';
  var mouseStats = '[id:' + mouse.id + '/size:' + mouse.size + '/sex: ' +
      mouse.sex + ']';
  var names = (mouse.sex == Genetics.Mouse.Sex.FEMALE) ? FEMININE_NAMES :
      MASCULINE_NAMES;
  var name = names[Math.floor(mouse.id / 2) % names.length || 0];
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

/**
 *
 * @param {!Genetics.MouseAvatar} mouseAvatar
 * @param {string} reason Type of death, either "EXPLODE", "FIGHT",
 * "OVERPOPULATION", or "RETIRE".
 * @private
 */
Genetics.Visualization.killMouse_ = function(mouseAvatar, reason) {
  Genetics.Visualization.removeMouseAvatar(mouseAvatar);

  if (reason == 'EXPLOSION') {
    // The mouse exploded.
    var explosion = document.createElement('div');
    explosion.setAttribute('class', 'explode');
    explosion.style.top = mouseAvatar.element.style.top;
    explosion.style.left = mouseAvatar.element.style.left;
    var afterAnimation = function() {
      explosion.removeEventListener('animationend', afterAnimation, false);
      Genetics.Visualization.display_.removeChild(explosion);
    };
    explosion.addEventListener('animationend', afterAnimation, false);
    Genetics.Visualization.display_.appendChild(explosion);
  } else if (reason == 'OVERPOPULATION') {
    // The mouse died because of overpopulation
    var kick = document.createElement('div');
    kick.setAttribute('class', 'kickedOut');
    kick.style.top = mouseAvatar.element.style.top;
    kick.style.left = mouseAvatar.element.style.left;
    var afterAnimation = function() {
      kick.removeEventListener('animationend', afterAnimation, false);
      Genetics.Visualization.display_.removeChild(kick);
    };
    kick.addEventListener('animationend', afterAnimation, false);
    Genetics.Visualization.display_.appendChild(kick);
  } else if (reason == 'RETIRE') {
    // The mouse died normally.
    var tombstone = document.createElement('div');
    tombstone.setAttribute('class', 'retire');
    tombstone.style.top = mouseAvatar.element.style.top;
    tombstone.style.left = mouseAvatar.element.style.left;
    var afterAnimation = function() {
      tombstone.removeEventListener('animationend', afterAnimation, false);
      Genetics.Visualization.display_.removeChild(tombstone);
    };
    tombstone.addEventListener('animationend', afterAnimation, false);
    Genetics.Visualization.display_.appendChild(tombstone);
  }

  // Update statistics to no longer count dead mouse.
  Genetics.Visualization.mouseSexes_[mouseAvatar.sex]--;
  Genetics.Visualization.pickFightOwners_[mouseAvatar.pickFightOwner]--;
  Genetics.Visualization.proposeMateOwners_[mouseAvatar.proposeMateOwner]--;
  Genetics.Visualization.acceptMateOwners_[mouseAvatar.acceptMateOwner]--;
  Genetics.Visualization.updateChartData_();
  Genetics.Visualization.updateStats_();
};

/**
 * Move the given two mice together to the same point on the screen.
 * @param {!Genetics.MouseAvatar} mouse0 A mouse to move together.
 * @param {!Genetics.MouseAvatar} mouse1 A mouse to move together.
 * @param {function} callback The function to call once the two mice have
 * reached the same place.
 * @private
 */
Genetics.Visualization.moveMiceTogether_ = function(mouse0, mouse1, callback) {
  // Find point in between mice for them to move to.
  var mouse0X = parseInt(mouse0.element.style.left, 10);
  var mouse1X = parseInt(mouse1.element.style.left, 10);
  var mouse0Y = parseInt(mouse0.element.style.top, 10);
  var mouse1Y = parseInt(mouse1.element.style.top, 10);
  var x = goog.math.average(mouse0X, mouse1X);
  var y = goog.math.average(mouse0Y, mouse1Y);

  var movementDir = Math.atan2(mouse0Y - y, mouse0X - x);
  // Calculate offset points so that mice don't overlap.
  var xOffset = Genetics.MouseAvatar.HALF_SIZE * Math.cos(movementDir);
  var yOffset = Genetics.MouseAvatar.HALF_SIZE * Math.sin(movementDir);

  var mouse0TargetX = x + xOffset;
  var mouse0TargetY = y + yOffset;
  var mouse1TargetX = x - xOffset;
  var mouse1TargetY = y - yOffset;

  var hasOtherMouseArrived = false;
  var mouseArrived = function() {
    if (hasOtherMouseArrived) {
      // Turn mice towards each other.
      var mouseXDir = Math.atan2(y - mouse0TargetY, x - mouse0TargetX);
      mouse0.direction = mouseXDir;
      mouse1.direction = mouseXDir + Math.PI;

      callback();
    }
    hasOtherMouseArrived = true;
  };

  // Move mice towards each other and start fighting when they both arrive.
  mouse0.move(mouse0TargetX, mouse0TargetY, mouseArrived);
  mouse1.move(mouse1TargetX, mouse1TargetY, mouseArrived);
};

/**
 *
 * @param {!Genetics.MouseAvatar} instigator
 * @param {!Genetics.MouseAvatar} opponent
 * @param {string} result The type of result, either 'WIN', 'LOSS', 'TIE', or
 * 'SELF".
 * @param {function} callback Function to call at the end of fight animation.
 * @private
 */
Genetics.Visualization.fight_ = function(instigator, opponent, result,
    callback) {
  var getMouseName = Genetics.Visualization.getMouseName;
  var fightCloud = document.getElementById('dust').cloneNode(true);
  // Calculate the position of the cloud over the mice.
  var cloudTop = goog.math.average(parseInt(instigator.element.style.top, 10),
          parseInt(opponent.element.style.top, 10)) +
      Genetics.MouseAvatar.HALF_SIZE -
      Genetics.Visualization.DUST_SIZE / 2;
  var cloudLeft = goog.math.average(parseInt(instigator.element.style.left, 10),
          parseInt(opponent.element.style.left, 10)) +
      Genetics.MouseAvatar.HALF_SIZE -
      Genetics.Visualization.DUST_SIZE / 2;

  fightCloud.style.top = cloudTop + 'px';
  fightCloud.style.left = cloudLeft + 'px';

  var afterFightCloud = function(e) {
    if (e.target == fightCloud) {
      fightCloud.removeEventListener('animationend', afterFightCloud, false);
      instigator.element.style.display = '';
      opponent.element.style.display = '';
      if (result == 'WIN') {
        Genetics.log(getMouseName(instigator) + ' fights and kills ' +
            getMouseName(opponent) + '.');
        Genetics.Visualization.killMouse_(opponent, 'FIGHT');
      } else if (result == 'LOSS') {

        Genetics.log(getMouseName(instigator) + ' fights and is ' +
            'killed by ' + getMouseName(opponent) + '.');
        Genetics.Visualization.killMouse_(instigator, 'FIGHT');
      } else if (result == 'TIE') {
        Genetics.log(getMouseName(instigator) + ' fights ' +
            getMouseName(opponent) + ' to a draw.');
      } else {  // If result is 'SELF'.
        Genetics.Visualization.killMouse_(instigator, 'FIGHT');
        Genetics.log(getMouseName(instigator) +
            ' chose itself when asked whom to fight with. ' +
            getMouseName(instigator) + ' is being executed to put ' +
            'it out of its misery.');
      }
      fightCloud.parentNode.removeChild(fightCloud);
      callback();
    }
  };
  fightCloud.addEventListener('animationend', afterFightCloud, false);

  Genetics.Visualization.display_.appendChild(fightCloud);

  // Hide mice fighting while cloud animation runs.
  instigator.element.style.display = 'none';
  opponent.element.style.display = 'none';
};

/**
 * Adds mouse html element to display div, animates the mouse appearing and
 * updates the statistics after animation.
 * @param {!Genetics.MouseAvatar} mouseAvatar
 * @param {number} x
 * @param {number} y
 * @param {boolean} isBirth
 * @param {function} callback
 * @private
 */
Genetics.Visualization.addMouse_ = function(mouseAvatar, x, y, isBirth,
    callback) {
  var getMouseName = Genetics.Visualization.getMouseName;

  var xPos = goog.math.clamp(x - Genetics.MouseAvatar.HALF_SIZE, 0,
      Genetics.Visualization.DISPLAY_SIZE - Genetics.MouseAvatar.WIDTH);
  var yPos = goog.math.clamp(y - Genetics.MouseAvatar.HALF_SIZE, 0,
      Genetics.Visualization.DISPLAY_SIZE - Genetics.MouseAvatar.HEIGHT);
  mouseAvatar.element.style.left = xPos + 'px';
  mouseAvatar.element.style.top = yPos + 'px';

  var afterDroppingIn = function(e) {
    if (isBirth) {
      Genetics.log(getMouseName(mouseAvatar, true, true) + ' was born!');
    } else {
      Genetics.log(getMouseName(mouseAvatar, true, true) + ' added to game.');
    }
    // Update statistics to include new mouse.
    Genetics.Visualization.mouseSexes_[mouseAvatar.sex]++;
    Genetics.Visualization.pickFightOwners_[mouseAvatar.pickFightOwner]++;
    Genetics.Visualization.proposeMateOwners_[mouseAvatar.proposeMateOwner]++;
    Genetics.Visualization.acceptMateOwners_[mouseAvatar.acceptMateOwner]++;
    Genetics.Visualization.updateChartData_();
    Genetics.Visualization.updateStats_();

    mouseAvatar.element.style['animationName'] = 'none';
    mouseAvatar.element
        .removeEventListener('animationEnd', afterDroppingIn, false);
    callback();
  };

  mouseAvatar.element.addEventListener('animationend', afterDroppingIn, false);
  mouseAvatar.element.style['animation'] = 'bounceIn 500ms';

  mouseAvatar.element.style.display = 'block';
};

/**
 *
 * @param {string} type Type of heart to display, either "SUCCESS", "INFERTILE",
 * or "INCOMPATIBLE".
 * @param {number} x
 * @param {number} y
 * @param {function} callback
 * @private
 */
Genetics.Visualization.showHeart_ = function(type, x, y, callback) {
  var heart = document.getElementById('heart').cloneNode(true);
  heart.style.left = x - Genetics.Visualization.HEART_SIZE / 2 + 'px';
  heart.style.top = y - Genetics.Visualization.HEART_SIZE / 2 + 'px';
  if (type == 'SUCCESS') {
    heart.children[0].className += ' heart-success';
  } else if (type == 'INFERTILE') {
    heart.children[0].className += ' heart-infertile';
  } else {
    heart.children[0].className += ' heart-incompatible';
  }
  var afterDisplay = function(e) {
    if (e.target == heart) {
      heart.parentNode.removeChild(heart);
      callback();
    }
  };
  heart.addEventListener('animationend', afterDisplay, false);
  heart.style['animation'] = 'bounceIn 700ms';
  Genetics.Visualization.display_.appendChild(heart);
};

/**
 *
 * @param {!Genetics.Mouse} mouse
 * @return {!Genetics.MouseAvatar}
 */
Genetics.Visualization.createMouseAvatar = function(mouse) {
  var mouseAvatar = new Genetics.MouseAvatar(mouse);
  // Store mapping to this mouse avatar.
  Genetics.Visualization.mice_[mouseAvatar.id] = mouseAvatar;
  // Make mouse not visible and add it to display.
  mouseAvatar.element.style.display = 'none';
  Genetics.Visualization.display_.appendChild(mouseAvatar.element);
  return mouseAvatar;
};

/**
 *
 * @param {!Genetics.MouseAvatar} mouseAvatar
 */
Genetics.Visualization.removeMouseAvatar = function(mouseAvatar) {
  // Stop any queued mouse animations.
  mouseAvatar.stop();
  // Remove mouse from display
  Genetics.Visualization.display_.removeChild(mouseAvatar.element);
  // Remove mapping to mouse avatar.
  delete Genetics.Visualization.mice_[mouseAvatar.id];
};


