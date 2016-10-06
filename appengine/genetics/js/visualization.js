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
 * @const {number}
 */
Genetics.Visualization.UPDATE_DELAY_MSEC = 50;

/**
 * The width/height of the display in pixels.
 * @const {number}
 */
Genetics.Visualization.DISPLAY_SIZE = 400;

/**
 * The width/height of the dust cloud in pixels.
 * @const {number}
 */
Genetics.Visualization.DUST_SIZE = 50;

/**
 * The hex values of the player colors.
 * @const {!Array.<string>}
 */
Genetics.Visualization.COLOURS = ['#ff8b00', '#c90015', '#166c0b', '#11162a'];

/**
 * Indicates whether the game has been stopped.
 * @private {boolean}
 */
Genetics.Visualization.stopped_ = true;

/**
 * Indicates whether the game has ended.
 * @private {boolean}
 */
Genetics.Visualization.gameOverReached_ = true;

/**
 * The ranking of players after the end of the game.
 * @private {Object.<string, !Array.<number>>}
 */
Genetics.Visualization.gameRankings_ = null;

/**
 * Mapping of mouse ID to mouse for mice currently being visualized.
 * @private {!Object.<number, !Genetics.MouseAvatar>}
 */
Genetics.Visualization.mice_ = {};

/**
 * Is the charts tab open?
 * @private {boolean}
 */
Genetics.Visualization.areChartsVisible_ = false;

/**
 * Chart wrapper for chart with mice sex to count.
 * @private {google.visualization.ChartWrapper}
 */
Genetics.Visualization.populationChartWrapper_ = null;

/**
 * Chart wrapper for chart with count of pickFight owners.
 * @private {google.visualization.ChartWrapper}
 */
Genetics.Visualization.pickFightChartWrapper_ = null;

/**
 * Chart wrapper for chart with count of proposeMate owners.
 * @private {google.visualization.ChartWrapper}
 */
Genetics.Visualization.proposeMateChartWrapper_ = null;

/**
 * Chart wrapper for chart with count of acceptMate owners.
 * @private {google.visualization.ChartWrapper}
 */
Genetics.Visualization.acceptMateChartWrapper_ = null;

/**
 * The div that contains the HTML elements
 * @private {HTMLDivElement}
 */
Genetics.Visualization.display_ = null;

/**
 * Mapping of mouse sex to number of mice.
 * @private {!Object.<!Genetics.Mouse.Sex, number>}
 */
Genetics.Visualization.mouseSexes_ = {};

/**
 * List indexed by player ID of number of mice with pickFight function of that
 * player.
 * @private {!Array<number, number>}
 * @const
 */
Genetics.Visualization.pickFightOwners_ = [];

/**
 * List indexed by player ID of number of mice with proposeMate function of that
 * player.
 * @private {!Array.<number, number>}
 * @const
 */
Genetics.Visualization.proposeMateOwners_ = [];

/**
 * List indexed by player ID of number of mice with acceptMate function of that
 * player.
 * @private {!Array.<number, number>}
 * @const
 */
Genetics.Visualization.acceptMateOwners_ = [];

/**
 * PID of executing task.
 * @private {number}
 */
Genetics.Visualization.pid_ = 0;

/**
 * Setup the visualization (run once).
 */
Genetics.Visualization.init = function() {
  // Sync the display size constant on mouseAvatar.
  Genetics.MouseAvatar.DISPLAY_SIZE = Genetics.Visualization.DISPLAY_SIZE;

  var tabDiv = document.getElementById('vizTabbar');
  if (tabDiv) {
    // Setup the tabs.
    Genetics.tabbar = new goog.ui.TabBar();
    Genetics.tabbar.decorate(tabDiv);

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
  }

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

  Genetics.Visualization.areChartsVisible_ = false;
  Genetics.Visualization.eventNumber = 0;
  Genetics.Visualization.roundNumber_ = 0;
  Genetics.Visualization.eventIndex_ = 0;
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

  for (var playerId = 0, player; player = Genetics.Cage.players[playerId];
      playerId++) {
    // Assign a colour to each avatar.
    var hexColour = Genetics.Visualization.COLOURS[playerId];
    // Setup player name cell in stats table.
    var td = nameRow.cells[playerId];
    td.style.borderColor = hexColour;
    var nameDiv = td;
    var playerName = player.name;
    nameDiv.title = playerName;
    nameDiv.style.background = hexColour;
    var text = document.createTextNode(playerName);
    goog.dom.removeChildren(nameDiv);
    nameDiv.appendChild(text);
    // Setup stats percentages for each function if there is a div for it.
    td = statsRow.cells[playerId];
    td.style.borderColor = hexColour;
    var playerStat = {};
    // Setup pickFight percentage div.
    var pickFightDiv = td.getElementsByClassName('pickFightStat')[0];
    if (pickFightDiv) {
      pickFightDiv.style.background = hexColour;
      pickFightDiv.style.width = 0;
      playerStat['pickFightDiv'] = pickFightDiv;
    }
    var proposeMateDiv = td.getElementsByClassName('proposeMateStat')[0];
    if (proposeMateDiv) {;
      proposeMateDiv.style.background = hexColour;
      proposeMateDiv.style.width = 0;
      playerStat['proposeMateDiv'] = proposeMateDiv;
    }
    var acceptMateDiv = td.getElementsByClassName('acceptMateStat')[0];
    if (acceptMateDiv) {
      acceptMateDiv.style.background = hexColour;
      acceptMateDiv.style.width = 0;
      playerStat['acceptMateDiv'] = acceptMateDiv;
    }
    playerStat['td'] = td;

    // Store a reference to all the percentage divs.
    Genetics.Visualization.playerStatsDivs_.push(playerStat);
  }

  // Remove child DOM elements on display div.
  goog.dom.removeChildren(Genetics.Visualization.display_);
};

/**
 * Start the visualization running.
 */
Genetics.Visualization.start = function() {
  Genetics.Visualization.gameOverReached_ = false;
  Genetics.Visualization.gameRankings_ = null;
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
        Genetics.Visualization.displayGameEnd_();
        return;
      }
    }
    Genetics.Visualization.pid_ = setTimeout(Genetics.Visualization.update,
        Genetics.Visualization.UPDATE_DELAY_MSEC);
  }
};

/**
 * Whether the charts need to be redrawn because they were updated.
 * @private {boolean}
 */
Genetics.Visualization.chartsNeedUpdate_ = true;

/**
 * A reference to all the divs displaying the percentage of function ownership
 * for each player.
 * @private {!Array.<!Object.<string, HTMLDivElement|HTMLTableCellElement>>}
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
    if (playerStats['pickFightDiv']) {
      playerStats['pickFightDiv'].style.width = pickFightPercent + '%';
    }
    var proposeMatePercent = (100 *
        Genetics.Visualization.proposeMateOwners_[playerId] / mouseCount) || 0;
    if (playerStats['proposeMateDiv']) {
      playerStats['proposeMateDiv'].style.width = proposeMatePercent + '%';
    }
    var acceptMatePercent = (100 *
        Genetics.Visualization.acceptMateOwners_[playerId] / mouseCount) || 0;
    if (playerStats['acceptMateDiv']) {
      playerStats['acceptMateDiv'].style.width = acceptMatePercent + '%';
    }
    playerStats['td'].title = 'pickFight ' +
        Math.round(pickFightPercent * 100) / 100 + '%\nproposeMate ' +
        Math.round(proposeMatePercent * 100) / 100 + '%\nacceptMate ' +
        Math.round(acceptMatePercent * 100) / 100 + '%';
  }
};

/**
 * Redraw game charts.
 * @param {boolean=} opt_force Whether to draw charts even if they are not
 *     visible.
 * @private
 */
Genetics.Visualization.drawCharts_ = function(opt_force) {
  if (Genetics.Visualization.chartsNeedUpdate_ &&
      (opt_force || Genetics.Visualization.areChartsVisible_)) {
    // Redraw the charts in the charts tab.
    Genetics.Visualization.populationChartWrapper_.draw();
    Genetics.Visualization.pickFightChartWrapper_.draw();
    Genetics.Visualization.proposeMateChartWrapper_.draw();
    Genetics.Visualization.acceptMateChartWrapper_.draw();

    Genetics.Visualization.chartsNeedUpdate_ = false;
  }
};

/**
 * The current round number.
 * @private {number}
 */
Genetics.Visualization.roundNumber_ = 0;

/**
 * The index of the next event to be processed or 0 if events are not
 * removed from EVENTS queue.
 * @private {number}
 */
Genetics.Visualization.eventIndex_ = 0;

/**
 * Process events in Cage events queue.
 * @private
 */
Genetics.Visualization.processCageEvents_ = function() {
  // Handle any queued events.
  var getMouseName = Genetics.Visualization.getMouseName_;
  while (Genetics.Visualization.eventIndex_ < Genetics.Cage.Events.length) {
    var event = Genetics.Cage.historyPreserved ?
        Genetics.Cage.Events[Genetics.Visualization.eventIndex_++] :
        Genetics.Cage.Events.shift();

    var mouse = (event['ID'] !== undefined) ?
        Genetics.Visualization.mice_[event['ID']] : null;
    var opponent = (event['OPT_OPPONENT'] !== undefined) ?
        Genetics.Visualization.mice_[event['OPT_OPPONENT']] : null;
    var askedMouse = (event['OPT_PARTNER'] !== undefined) ?
        Genetics.Visualization.mice_[event['OPT_PARTNER']] : null;
    if ((mouse && mouse.busy) || (opponent && opponent.busy) ||
        (askedMouse && askedMouse.busy)) {
      // If any involved mice are busy, process event later.
      if (Genetics.Visualization.historyPreserved) {
        Genetics.Visualization.eventIndex_--;
      } else {
        Genetics.Cage.Events.unshift(event);
      }
      break;
    }
    switch (event['TYPE']) {
      case 'ADD':
        var addedMouse =
            Genetics.Visualization.createMouseAvatar_(event['MOUSE']);
        var x = Math.random() * Genetics.Visualization.DISPLAY_SIZE -
            Genetics.MouseAvatar.WIDTH;
        var y = Math.random() * Genetics.Visualization.DISPLAY_SIZE -
            Genetics.MouseAvatar.WIDTH;

        Genetics.Visualization.animateAddMouse_(addedMouse, x, y, false,
            goog.bind(addedMouse.freeMouse, addedMouse));
        break;
      case 'START_GAME':
        Genetics.log('Starting game with ' + Genetics.Cage.players.length +
            ' players.');
        break;
      case 'NEXT_ROUND':
        Genetics.Visualization.roundNumber_++;
        break;
      case 'FIGHT':
        Genetics.Visualization.processFightEvent_(event, mouse, opponent);
        break;
      case 'MATE':
        Genetics.Visualization.processMateEvent_(event, mouse, askedMouse);
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
        Genetics.Visualization.levelSucceeded = event['IS_SUCCESS'];
        Genetics.Visualization.gameRankings_ = event['OPT_RANKINGS'];
        break;
      default:
        throw 'unhandled visualization event ' + JSON.stringify(event);
    }

  }
};

/**
 * Process fight events.
 * @param {!Object.<string, string|!Genetics.Mouse>} event
 * @param {!Genetics.MouseAvatar} instigator
 * @param {Genetics.MouseAvatar} opponent
 * @private
 */
Genetics.Visualization.processFightEvent_ = function(
    event, instigator, opponent) {
  var getMouseName = Genetics.Visualization.getMouseName_;
  var result = event['RESULT'];

  if (result == 'NONE') {
    // Show a peace sign.
    var afterPeace = function() {
      Genetics.log(getMouseName(instigator) + ' elected to never fight again.');
      instigator.freeMouse();
    };

    instigator.busy = true;
    Genetics.Visualization.showImageOverMouse_(instigator, 'genetics/peace.png',
        Genetics.MouseAvatar.WIDTH, 1000, afterPeace);
  } else {
    // Show a fight animation.
    var endFight = function() {
      instigator.freeMouse();
      if (result != 'SELF') {
        opponent.freeMouse();
      }
    };

    instigator.busy = true;
    if (result == 'SELF') {
      Genetics.Visualization.fight_(instigator, instigator, result, endFight);
    } else {
      opponent.busy = true;
      Genetics.Visualization.moveMiceTogether_(instigator, opponent,
          goog.partial(Genetics.Visualization.fight_, instigator, opponent,
              result, endFight));
    }
  }
};

/**
 * Whether mice wander after mating before being available for a new event.
 * @type {boolean}
 */
Genetics.Visualization.wanderAfterMate = true;

/**
 * Process mate events.
 * @param {!Object.<string, string|!Genetics.Mouse>} event
 * @param {!Genetics.MouseAvatar} proposingMouse
 * @param {Genetics.MouseAvatar} askedMouse
 * @private
 */
Genetics.Visualization.processMateEvent_ = function(
    event, proposingMouse, askedMouse) {
  var getMouseName = Genetics.Visualization.getMouseName_;

  var result = event['RESULT'];
  if (result == 'NONE') {
    Genetics.log(getMouseName(proposingMouse) +
        ' elected to never mate again.');
  } else if (result == 'SELF') {
    // Show a heart.
    var afterHeart = function() {
      Genetics.log(getMouseName(proposingMouse) +
          ' caught trying to mate with itself.');
      proposingMouse.freeMouse();
    };

    proposingMouse.busy = true;
    Genetics.Visualization.showImageOverMouse_(proposingMouse,
        'genetics/heart.png', Genetics.MouseAvatar.WIDTH, 1000, afterHeart);
  } else if (result == 'MATE_EXPLODED') {
    Genetics.log(getMouseName(askedMouse) + ' exploded after ' +
        getMouseName(proposingMouse) + ' asked it out.');
  } else if (result == 'REJECTION') {
    var x = goog.math.average(parseInt(proposingMouse.element.style.left, 10),
            parseInt(askedMouse.element.style.left, 10)) +
        Genetics.MouseAvatar.HALF_SIZE;
    var y = goog.math.average(parseInt(proposingMouse.element.style.top, 10),
            parseInt(askedMouse.element.style.top, 10)) +
        Genetics.MouseAvatar.HALF_SIZE;

    // Show a broken heart.
    var afterBroken = function() {
      Genetics.log(getMouseName(proposingMouse) + ' asked ' +
          getMouseName(askedMouse) + ' to mate, The answer is NO!');

      proposingMouse.freeMouse(Genetics.Visualization.wanderAfterMate);
      askedMouse.freeMouse(Genetics.Visualization.wanderAfterMate);
    };
    proposingMouse.busy = true;
    askedMouse.busy = true;
    Genetics.Visualization.moveMiceTogether_(proposingMouse, askedMouse,
        goog.partial(Genetics.Visualization.showImageOverMouse_, proposingMouse,
            'genetics/broken-heart.png', Genetics.MouseAvatar.WIDTH, 1000,
            afterBroken));
  } else {
    // result == 'SUCCESS' || result == 'INCOMPATIBLE' || result == 'INFERTILE'
    Genetics.log(getMouseName(proposingMouse, true, true) + ' asked ' +
        getMouseName(askedMouse, true, true) + ' to mate, The answer is YES!');

    var x = goog.math.average(parseInt(proposingMouse.element.style.left, 10),
            parseInt(askedMouse.element.style.left, 10)) +
        Genetics.MouseAvatar.HALF_SIZE;
    var y = goog.math.average(parseInt(proposingMouse.element.style.top, 10),
            parseInt(askedMouse.element.style.top, 10)) +
        Genetics.MouseAvatar.HALF_SIZE;

    var message;
    var heartSrc;
    if (result == 'SUCCESS') {
      // If mating is successful, create and add reference to offspring so that
      // future events involving that mouse that are detected before the end
      // of the birth animation will be able to access it.
      var offspring = Genetics.Visualization
          .createMouseAvatar_(event['OPT_OFFSPRING']);
      heartSrc = 'genetics/heart.png';
    } else if (result == 'INCOMPATIBLE') {
      message = getMouseName(proposingMouse) + ' mated with ' +
          getMouseName(askedMouse) + ', another ' + proposingMouse.sex + '.';
      heartSrc = 'genetics/rainbow-heart.png';
    } else if (result == 'INFERTILE') {
      message = 'Mating between ' + getMouseName(proposingMouse) +
          ' and ' + getMouseName(askedMouse) + ' failed because ' +
          getMouseName(askedMouse) + ' is sterile.';
      heartSrc = 'genetics/grey-heart.png';
    }

    var mateResult = function() {
      if (result == 'SUCCESS') {
        Genetics.Visualization.animateAddMouse_(offspring, x, y, true,
            goog.bind(offspring.freeMouse, offspring));
      } else {
        Genetics.log(message);
      }
      proposingMouse.freeMouse(Genetics.Visualization.wanderAfterMate);
      askedMouse.freeMouse(Genetics.Visualization.wanderAfterMate);
    };
    proposingMouse.busy = true;
    askedMouse.busy = true;
    Genetics.Visualization.moveMiceTogether_(proposingMouse, askedMouse,
        goog.partial(Genetics.Visualization.showImage_, heartSrc, x, y, 50, 700,
            mateResult));
  }
};


/**
 * Display the end game summary.
 * @private
 */
Genetics.Visualization.displayGameEnd_ = function() {
  Genetics.Visualization.stop();
  if (Genetics.Visualization.gameRankings_) {
    var functionWinnersText = {
      'pickFight': '',
      'proposeMate': '',
      'acceptMate': ''
    };
    var mouseFunctions = ['pickFight', 'proposeMate', 'acceptMate'];
    for (var i = 0; i < mouseFunctions.length; i++) {
      var mouseFunction = mouseFunctions[i];
      var functionWinnersList =
          Genetics.Visualization.gameRankings_[mouseFunction][0];
      for (var j = 0; functionWinnersList && j < functionWinnersList.length;
          j++) {
        var playerId = functionWinnersList[j];
        functionWinnersText[mouseFunction] +=
            Genetics.Cage.players[playerId].name + ' ';
      }
    }

    Genetics.log('Game ended with:' +
        ' PickFight Winners: ' + functionWinnersText['pickFight'] +
        ' proposeMate Winners: ' + functionWinnersText['proposeMate'] +
        ' acceptMate Winners: ' + functionWinnersText['acceptMate']);
  }

  if (Genetics.Visualization.levelSucceeded) {
    BlocklyInterface.saveToLocalStorage();
    BlocklyDialogs.congratulations();
    Genetics.log('Level Succeeded');
  } else if (!Genetics.Visualization.gameRankings_) {
    Genetics.log('Level Failed');
  }
};

/**
 * Add a row to the charts with the current status of mice.
 * @private
 */
Genetics.Visualization.updateChartData_ = function() {
  if (google.visualization) {
    Genetics.Visualization.populationChartWrapper_.getDataTable().addRow(
        [Genetics.Visualization.roundNumber_,
          Genetics.Visualization.mouseSexes_[Genetics.Mouse.Sex.MALE],
          Genetics.Visualization.mouseSexes_[Genetics.Mouse.Sex.FEMALE]]);

    var pickFightState = [Genetics.Visualization.roundNumber_];
    var proposeMateState = [Genetics.Visualization.roundNumber_];
    var acceptMateState = [Genetics.Visualization.roundNumber_];
    for (var playerId = 0; playerId < Genetics.Cage.players.length;
        playerId++) {
      pickFightState.push(Genetics.Visualization.pickFightOwners_[playerId]);
      proposeMateState.push(
          Genetics.Visualization.proposeMateOwners_[playerId]);
      acceptMateState.push(Genetics.Visualization.acceptMateOwners_[playerId]);
    }
    Genetics.Visualization.pickFightChartWrapper_.getDataTable()
        .addRow(pickFightState);
    Genetics.Visualization.proposeMateChartWrapper_.getDataTable()
        .addRow(proposeMateState);
    Genetics.Visualization.acceptMateChartWrapper_.getDataTable()
        .addRow(acceptMateState);

    Genetics.Visualization.chartsNeedUpdate_ = true;
  }
};

/**
 * Returns a string representation of the mouse.
 * @param {!Genetics.Mouse|!Genetics.MouseAvatar} mouse The mouse to represent
 *     as a string.
 * @param {boolean=} opt_showStats Whether to add the mouse stats to the string
 *     representation.
 * @param {boolean=} opt_showGenes Whether to add the gene owners to the string
 *     representation.
 * @return {string} The string representation of the mouse.
 * @private
 */
Genetics.Visualization.getMouseName_ = function(
    mouse, opt_showStats, opt_showGenes) {
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
  var name = names[mouse.id % names.length || 0];
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
 * Play death animation (unless 'FIGHT'), remove mouse from display, and update
 * game statistics.
 * @param {!Genetics.MouseAvatar} mouseAvatar
 * @param {string} reason Type of death, either "EXPLOSION", "FIGHT",
 *     "OVERPOPULATION", or "RETIRE".
 * @private
 */
Genetics.Visualization.killMouse_ = function(mouseAvatar, reason) {
  Genetics.Visualization.removeMouseAvatar_(mouseAvatar);

  if (reason != 'FIGHT') {
    var x = parseInt(mouseAvatar.element.style.left) +
        Genetics.MouseAvatar.WIDTH / 2;
    var y = parseInt(mouseAvatar.element.style.top) +
        Genetics.MouseAvatar.WIDTH / 2;
    if (reason == 'EXPLOSION') {
      // The mouse exploded.
      Genetics.Visualization.showImage_('genetics/explode.png', x, y,
          Genetics.MouseAvatar.WIDTH, 1000);
    } else if (reason == 'OVERPOPULATION') {
      // The mouse died because of overpopulation
      Genetics.Visualization.showImage_('genetics/kickedOut.png', x, y,
          Genetics.MouseAvatar.WIDTH, 1000);
    } else {  // reason == 'RETIRE'
      // The mouse died normally.
      Genetics.Visualization.showImage_('genetics/retire.png', x, y,
          Genetics.MouseAvatar.WIDTH, 1000);
    }
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
 * @param {!Function} callback The function to call once the two mice have
 *     reached the same place.
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
 * Animate a fight between the the instigator and opponent mouse.
 * @param {!Genetics.MouseAvatar} instigator The mouse instigating the fight.
 * @param {!Genetics.MouseAvatar} opponent The mouse challenged in the fight.
 * @param {string} result The type of result, either 'WIN', 'LOSS', 'TIE', or
 *     'SELF".
 * @param {!Function} callback The function to call after the event is animated.
 * @private
 */
Genetics.Visualization.fight_ = function(
    instigator, opponent, result, callback) {
  var getMouseName = Genetics.Visualization.getMouseName_;
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
 * Adds a mouse to the display without animation.
 * @param {!Genetics.Mouse} mouse The mouse to add to the display.
 * @param {number} x The x position of the mouse.
 * @param {number} y The y position of the mouse.
 * @param {number} direction The direction of the mouse in radians.
 */
Genetics.Visualization.addMouse = function(mouse, x, y, direction) {
  var getMouseName = Genetics.Visualization.getMouseName_;
  var mouseAvatar = Genetics.Visualization.createMouseAvatar_(mouse);
  mouseAvatar.direction = direction;

  var xPos = goog.math.clamp(x - Genetics.MouseAvatar.HALF_SIZE, 0,
      Genetics.Visualization.DISPLAY_SIZE - Genetics.MouseAvatar.WIDTH);
  var yPos = goog.math.clamp(y - Genetics.MouseAvatar.HALF_SIZE, 0,
      Genetics.Visualization.DISPLAY_SIZE - Genetics.MouseAvatar.HEIGHT);
  mouseAvatar.element.style.left = xPos + 'px';
  mouseAvatar.element.style.top = yPos + 'px';

  // Update statistics to include new mouse.
  Genetics.Visualization.mouseSexes_[mouseAvatar.sex]++;
  Genetics.Visualization.pickFightOwners_[mouseAvatar.pickFightOwner]++;
  Genetics.Visualization.proposeMateOwners_[mouseAvatar.proposeMateOwner]++;
  Genetics.Visualization.acceptMateOwners_[mouseAvatar.acceptMateOwner]++;
  Genetics.Visualization.updateStats_();

  mouseAvatar.element.style.display = 'block';
  mouseAvatar.freeMouse();
  Genetics.log(getMouseName(mouseAvatar, true, true) + ' added to game.');
};

/**
 * Adds mouse html element to display div, animates the mouse appearing and
 * updates the statistics after animation.
 * @param {!Genetics.MouseAvatar} mouseAvatar The mouse to animate adding.
 * @param {number} x The x position of the mouse.
 * @param {number} y The y position of the mouse.
 * @param {boolean} isBirth Whether the add event is a birth.
 * @param {!Function} callback The function to call after the event is animated.
 * @private
 */
Genetics.Visualization.animateAddMouse_ = function(
    mouseAvatar, x, y, isBirth, callback) {
  var getMouseName = Genetics.Visualization.getMouseName_;

  var xPos = goog.math.clamp(x - Genetics.MouseAvatar.HALF_SIZE, 0,
      Genetics.Visualization.DISPLAY_SIZE - Genetics.MouseAvatar.WIDTH);
  var yPos = goog.math.clamp(y - Genetics.MouseAvatar.HALF_SIZE, 0,
      Genetics.Visualization.DISPLAY_SIZE - Genetics.MouseAvatar.HEIGHT);
  mouseAvatar.element.style.left = xPos + 'px';
  mouseAvatar.element.style.top = yPos + 'px';

  var afterDroppingIn = function(e) {
    if (e.target == mouseAvatar.element) {
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
      if (isBirth) Genetics.Visualization.updateChartData_();
      Genetics.Visualization.updateStats_();

      mouseAvatar.element.style['animationName'] = 'none';
      mouseAvatar.element
          .removeEventListener('animationEnd', afterDroppingIn, false);
      callback();
    }
  };

  mouseAvatar.element.addEventListener('animationend', afterDroppingIn, false);
  mouseAvatar.element.style['animation'] = 'bounceIn 500ms';

  mouseAvatar.element.style.display = 'block';
};

/**
 * Shows image over mouse for specified duration.
 * @param {Genetics.MouseAvatar} mouseAvatar The mouse to display the image
 *     above.
 * @param {string} imageSrc The image source.
 * @param {number} size The size of the image to display in pixels.
 * @param {number} duration The duration to show the image in milliseconds.
 * @param {!Function=} opt_callback The function to call after finishing
 *     displaying the image.
 * @private
 */
Genetics.Visualization.showImageOverMouse_ = function(
    mouseAvatar, imageSrc, size, duration, opt_callback) {
  mouseAvatar.stopMove();
  var x = parseInt(mouseAvatar.element.style.left, 10) +
      Genetics.MouseAvatar.WIDTH / 2;
  var y = parseInt(mouseAvatar.element.style.top, 10) +
      Genetics.MouseAvatar.WIDTH / 2;

  Genetics.Visualization.showImage_(imageSrc, x, y, size, duration,
      opt_callback);
};

/**
 * Shows image at specified position for specified duration.
 * @param {string} imageSrc The image source.
 * @param {number} x The x position of the image.
 * @param {number} y The y position of the image.
 * @param {number} size The size of the image to display in pixels.
 * @param {number} duration The duration to show the image in milliseconds.
 * @param {Function=} opt_callback The function to call after finishing
 *     displaying the image.
 * @private
 */
Genetics.Visualization.showImage_ = function(
    imageSrc, x, y, size, duration, opt_callback) {
  var img = document.createElement('img');
  img.src = imageSrc;
  img.style.width = size + 'px';
  img.style.height = size + 'px';
  img.style.position = 'absolute';
  img.style.left = x - size / 2 + 'px';
  img.style.top = y - size / 2 + 'px';

  var afterShow = function(e) {
    if (e.target == img) {
      img.parentNode.removeChild(img);
      if (opt_callback) {
        opt_callback();
      }
    }
  };
  img.addEventListener('animationend', afterShow, false);
  img.style['animation'] = 'bounceIn ' + duration + 'ms';
  Genetics.Visualization.display_.appendChild(img);
};

/**
 * Creates a mouse avatar from the mouse and adds to mapping.
 * @param {!Genetics.Mouse} mouse
 * @return {!Genetics.MouseAvatar}
 * @private
 */
Genetics.Visualization.createMouseAvatar_ = function(mouse) {
  var mouseAvatar = new Genetics.MouseAvatar(mouse);
  // Store mapping to this mouse avatar.
  Genetics.Visualization.mice_[mouseAvatar.id] = mouseAvatar;
  // Make mouse not visible and add it to display.
  mouseAvatar.element.style.display = 'none';
  Genetics.Visualization.display_.appendChild(mouseAvatar.element);
  return mouseAvatar;
};

/**
 * Removes mouse from display and updates mapping.
 * @param {!Genetics.MouseAvatar} mouseAvatar
 * @private
 */
Genetics.Visualization.removeMouseAvatar_ = function(mouseAvatar) {
  // Stop any queued mouse animations.
  mouseAvatar.stop();
  // Remove mouse from display
  Genetics.Visualization.display_.removeChild(mouseAvatar.element);
  // Remove mapping to mouse avatar.
  delete Genetics.Visualization.mice_[mouseAvatar.id];
};


