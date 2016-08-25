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
goog.require('goog.dom');
goog.require('goog.math');
goog.require('goog.object');


Genetics.Visualization.UPDATE_DELAY_MSC = 500;

Genetics.Visualization.MOUSE_SRC = 'genetics/mouse.png';

Genetics.Visualization.AVATAR_SIZE = 40;
Genetics.Visualization.AVATAR_HALF_SIZE = Genetics.Visualization.AVATAR_SIZE / 2;
Genetics.Visualization.CHART_SIZE = 10;
Genetics.Visualization.CHART_HALF_SIZE = Genetics.Visualization.CHART_SIZE / 2;

Genetics.Visualization.DUST_SIZE = 50;
Genetics.Visualization.HEART_SIZE = 30;

Genetics.Visualization.DISPLAY_SIZE = 400;

/**
 * Speed of mouse in pixels per second
 * @type {number}
 */
Genetics.Visualization.MOUSE_SPEED = .05;

Genetics.Visualization.PLAYER_COLORS = [
  "#3366cc","#dc3912","#ff9900","#109618","#990099","#0099c6","#dd4477",
  "#66aa00","#b82e2e","#316395","#994499","#22aa99","#aaaa11","#6633cc",
  "#e67300","#8b0707","#651067","#329262","#5574a6","#3b3eac","#b77322",
  "#16d620","#b91383","#f4359e","#9c5935","#a9c413","#2a778d","#668d1c",
  "#bea413","#0c5922","#743411"];

/**
 * Indicates whether the game has ended.
 * @type {boolean}
 * @private
 */
Genetics.Visualization.gameOverReached_ = true;
/**
 * Mapping of mouse ID to mouse for mice currently being visualized.
 * @type {!Object.<string, !Genetics.Visualization.MouseAvatar>}
 * @private
 */
Genetics.Visualization.mice_ = {};

/**
 * List that specifies the order of players in the data tables for the charts.
 * @type {Array.<string>}
 * @private
 * @const
 */
Genetics.Visualization.playerOrder_ = [];

/**
 * Mapping of player id to the color assigned to them.
 * @type {Object.<number, string>}
 * @private
 * @const
 */
Genetics.Visualization.playerColor_;

Genetics.Visualization.areChartsVisible_;

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
 * The div that contains the html elements
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
 * @private
 */
Genetics.Visualization.pid_ = 0;

/**
 * Setup the visualization (run once).
 */
Genetics.Visualization.init = function() {
  // Setup the tabs.
  Genetics.tabbar = new goog.ui.TabBar();
  Genetics.tabbar.decorate(document.getElementById('vizTabbar'));

  var changeTab = function(index) {
    // Show the correct tab contents.
    var names = ['display', 'charts'];
    for (var i = 0, name; name = names[i]; i++) {
      var div = document.getElementById(name);
      if(name == 'display') {
        div.style.visibility = (i == index) ? 'visible' : 'hidden';
      } else {
        Genetics.Visualization.areChartsVisible_ = (i == index) ? true : false;
        if(i == index) {
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
    stackGraphOpts['colors'] = Genetics.Visualization.PLAYER_COLORS;
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
  Genetics.Visualization.populationChartWrapper_.setDataTable(
      google.visualization.arrayToDataTable(
          [[{label: 'Time', type: 'number'},
            {label: Genetics.Mouse.Sex.MALE, type: 'number'},
            {label: Genetics.Mouse.Sex.FEMALE, type: 'number'}]],
          false));

  Genetics.Visualization.playerColor_ = {};
  // Create list of player labels and store order of players to use when
  // population data updates and assign the colors for each player.
  var colorIndex = 0;
  Genetics.Visualization.playerOrder_.length = 0;
  var playerLabels = [{label: 'Time', type: 'number'}];
  for (var playerId in Genetics.Cage.players) {
    playerLabels.push({label: Genetics.Cage.players[playerId].name,
      type: 'number'});
    Genetics.Visualization.playerOrder_.push(playerId);
    Genetics.Visualization.playerColor_[playerId] =
        Genetics.Visualization.PLAYER_COLORS[colorIndex++ %
        Genetics.Visualization.PLAYER_COLORS.length];
  }
  Genetics.Visualization.pickFightChartWrapper_.setDataTable(
      google.visualization.arrayToDataTable([playerLabels], false));
  Genetics.Visualization.proposeMateChartWrapper_.setDataTable(
      google.visualization.arrayToDataTable([playerLabels], false));
  Genetics.Visualization.acceptMateChartWrapper_.setDataTable(
      google.visualization.arrayToDataTable([playerLabels], false));

  Genetics.Visualization.chartsNeedUpdate_ = true;
};

/**
 * Stop visualization.
 */
Genetics.Visualization.stop = function() {
  clearTimeout(Genetics.Visualization.pid_);
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
  Genetics.Visualization.mice_ = {};
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

  // Remove child DOM elements on display div.
  goog.dom.removeChildren(Genetics.Visualization.display_);
};

/**
 * Start the visualization running.
 */
Genetics.Visualization.start = function() {
  Genetics.Visualization.gameOverReached_ = false;
  Genetics.Visualization.update();
};

/**
 * Update the visualization.
 */
Genetics.Visualization.update = function() {
  Genetics.Visualization.processCageEvents_();
  Genetics.Visualization.drawCharts_();
  Genetics.Visualization.makeMiceMeander_();

  Genetics.Visualization.pid_ = setTimeout(Genetics.Visualization.update,
      Genetics.Visualization.UPDATE_DELAY_MSC);
};

/**
 * Whether the charts need to be redrawn because they were updated.
 * @type {boolean}
 * @private
 */
Genetics.Visualization.chartsNeedUpdate_ = true;

/**
 * Visualize the current state of the cage simulation (Genetics.Cage).
 * @private
 */
Genetics.Visualization.drawCharts_ = function() {
  if(Genetics.Visualization.chartsNeedUpdate_ && Genetics.Visualization.areChartsVisible_) {
    // Update the chart data on the screen.
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

    var mouse = (event['ID'] != null) ? Genetics.Visualization.mice_[event['ID']] : null;
    var opponent = (event['OPT_OPPONENT'] != null) ?
        Genetics.Visualization.mice_[event['OPT_OPPONENT']] : null;
    var askedMouse = (event['OPT_PARTNER'] != null) ?
        Genetics.Visualization.mice_[event['OPT_PARTNER']] : null;
    if((mouse && mouse.busy) || (opponent && opponent.busy) || (askedMouse && askedMouse.busy)) {
      // If any involved mice are busy, process event and execute animation later.
      Genetics.Cage.EVENTS.unshift(event);
      break;
    }
    switch (event['TYPE']) {
      case 'ADD':
        var addedMouse = Genetics.Visualization.createMouseAvatar(event['MOUSE']);
        var x = Math.random() * Genetics.Visualization.DISPLAY_SIZE -
            Genetics.Visualization.AVATAR_SIZE;
        var y = Math.random() * Genetics.Visualization.DISPLAY_SIZE -
            Genetics.Visualization.AVATAR_SIZE;

        Genetics.Visualization.addMouse(addedMouse, x, y, false,
            function() { this.busy = false;}.bind(addedMouse));
        break;
      case 'START_GAME':
        Genetics.log('Starting game with ' +
            Object.keys(Genetics.Cage.players).length + ' players.');
        break;
      case 'FIGHT':
        Genetics.Visualization.processFightEvent(event, mouse, opponent);
        break;
      case 'MATE':
        Genetics.Visualization.processMateEvent(event, mouse, askedMouse);
        break;
      case 'RETIRE':
        Genetics.Visualization.killMouse(mouse, 'NORMAL');
        Genetics.log(getMouseName(mouse) + ' dies after a productive life.');
        break;
      case 'OVERPOPULATION':
        Genetics.Visualization.killMouse(mouse, 'NORMAL');
        Genetics.log('Cage has gotten too cramped ' + getMouseName(mouse) +
            ' can\'t compete with the younger mice and dies.');
        break;
      case 'EXPLODE':
        var source = event['SOURCE'];
        var cause = event['CAUSE'];
        Genetics.Visualization.killMouse(mouse, 'EXPLOSION');
        Genetics.log(getMouseName(mouse) + ' exploded in ' + source +
            ' because ' + cause);
        break;
      case 'SPIN':
        var source = event['SOURCE'];
        Genetics.Visualization.killMouse(mouse, 'EXPLOSION');
        Genetics.log(getMouseName(mouse) + ' spun in circles after ' + source +
            ' was called.');
        break;
      case 'END_GAME':
        Genetics.Visualization.gameOverReached_ = true;
        var cause = event['CAUSE'];
        var pickFightWinnerId = event['PICK_FIGHT_WINNER'];
        var proposeMateWinnerId = event['PROPOSE_MATE_WINNER'];
        var acceptMateWinnerId = event['ACCEPT_MATE_WINNER'];

        var pickFightWinner = (pickFightWinnerId == null) ? 'none' :
            Genetics.Cage.players[pickFightWinnerId].name;
        var proposeMateWinner = (proposeMateWinnerId == null) ? 'none' :
            Genetics.Cage.players[proposeMateWinnerId].name;
        var acceptMateWinner = (acceptMateWinnerId == null) ? 'none' :
            Genetics.Cage.players[acceptMateWinnerId].name;
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

  }
};

Genetics.Visualization.processFightEvent = function(event, instigator, opt_opponent) {
  var getMouseName = Genetics.Visualization.getMouseName;
  var opponent = opt_opponent || null;
  var result = event['RESULT'];

  if(result == 'NONE') {
    // Show peace sign over mouse.
    // TODO
    Genetics.log(getMouseName(instigator) +
        ' elected to never fight again.');
  } else {
    var endFight = function() {
      instigator.busy = false;
      console.log(instigator.id + ' is not busy');
      if(result != 'SELF') {
        opponent.busy = false;
        console.log(opponent.id + ' is not busy');
      }
    };

    instigator.busy = true;
    console.log(instigator.id + ' is busy');
    if (result == 'SELF') {
      Genetics.Visualization.fight(instigator, instigator, result, endFight);
    } else {
      opponent.busy = true;
      console.log(opponent.id + ' is busy');
      Genetics.Visualization.moveMiceTogether_(instigator, opponent,
          goog.bind(Genetics.Visualization.fight, null, instigator, opponent, result, endFight));
    }
  }
};

Genetics.Visualization.processMateEvent = function(event, proposingMouse,
    opt_askedMouse) {
  var getMouseName = Genetics.Visualization.getMouseName;
  var askedMouse = opt_askedMouse || null;

  var result = event['RESULT'];
  if(result == 'NONE') {
    Genetics.log(getMouseName(proposingMouse) +
        ' elected to never mate again.');
  } else if(result == 'SELF') {
    Genetics.log(getMouseName(proposingMouse) +
        ' caught trying to mate with itself.');
  } else if(result == 'MATE_EXPLODED') {
    Genetics.Visualization.killMouse(askedMouse, 'EXPLOSION');
    Genetics.log(getMouseName(askedMouse) + ' exploded after ' +
        getMouseName(proposingMouse) + ' asked it out.');
  } else if(result == 'REJECTION') {
    Genetics.log(getMouseName(proposingMouse) + ' asked ' +
        getMouseName(askedMouse) + ' to mate, The answer is NO!');
  } else {
    // result == 'SUCCESS' || result == 'INCOMPATIBLE' || result == 'INFERTILE'
    Genetics.log(getMouseName(proposingMouse, true, true) + ' asked ' +
        getMouseName(askedMouse, true, true) + ' to mate, The answer ' +
        'is YES!');

    var x = goog.math.average(parseInt(proposingMouse.element.style.left, 10),
            parseInt(askedMouse.element.style.left, 10)) +
        Genetics.Visualization.AVATAR_HALF_SIZE;
    var y = goog.math.average(parseInt(proposingMouse.element.style.top, 10),
            parseInt(askedMouse.element.style.top, 10)) +
        Genetics.Visualization.AVATAR_HALF_SIZE;

    if (result == 'SUCCESS') {
      // If mating is successful, create and add reference to offspring so that
      // future events involving that mouse that are detected before the end
      // of the birth animation will be able to access it.
      var offspring = Genetics.Visualization.createMouseAvatar(event['OPT_OFFSPRING']);
    }

    var mateResult = function () {
      if(result == 'SUCCESS') {
        Genetics.Visualization.addMouse(offspring, x, y, true,
            function() { offspring.busy = false; console.log(offspring.id + ' is not busy');});
      } else if(result == 'INCOMPATIBLE') {
        Genetics.log(getMouseName(proposingMouse) + ' mated with ' +
            getMouseName(askedMouse) + ', another ' + proposingMouse.sex +
            '.');
      } else {  // result == 'INFERTILE'
        Genetics.log('Mating between ' + getMouseName(proposingMouse) +
            ' and ' + getMouseName(askedMouse) + ' failed because ' +
            getMouseName(askedMouse) + ' is sterile.');
      }
      // TODO delay setting this so that parents can't just die immediately.
      proposingMouse.busy = false;
      askedMouse.busy = false;
      console.log(proposingMouse.id + ' is not busy');
      console.log(askedMouse.id + ' is not busy');
    };

    proposingMouse.busy = true;
    askedMouse.busy = true;
    console.log(proposingMouse.id + ' is busy');
    console.log(askedMouse.id + ' is busy');
    Genetics.Visualization.moveMiceTogether_(proposingMouse, askedMouse,
        goog.bind(Genetics.Visualization.showHeart_, null, result, x, y, mateResult));

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

  Genetics.Visualization.chartsNeedUpdate_ = true;
};

/**
 * Returns a string representation of the mouse.
 * @param {!Genetics.Mouse|!Genetics.Visualization.MouseAvatar} mouse
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
  return mouse.id + name; // TODO rm id
};

Genetics.Visualization.makeMiceMeander_ = function() {
  for(var mouseId in Genetics.Visualization.mice_) {
    var mouseAvatar = Genetics.Visualization.mice_[mouseId];
    if (!mouseAvatar.busy) {
      // Choose a direction based off current direction.
      // TODO incorporate number of updates per second into this...
      var range = Math.PI/2;
      var direction = mouseAvatar.direction + Math.random() * range - range/2;
      var distance = Genetics.Visualization.MOUSE_SPEED *  Genetics.Visualization.UPDATE_DELAY_MSC;
      var xDelta = Math.cos(direction) * distance;
      var yDelta = Math.sin(direction) * distance;

      var oldX = parseInt(mouseAvatar.element.style.left);
      var oldY = parseInt(mouseAvatar.element.style.top);

      var x = oldX - xDelta;
      var y = oldY - yDelta;

      Genetics.Visualization.moveMouseTo_(mouseAvatar, x, y, null,
          Genetics.Visualization.UPDATE_DELAY_MSC);
    }
  }
};

Genetics.Visualization.moveMouseTo_ = function(mouseAvatar, x, y, opt_callback, opt_time) {
  var xPos = goog.math.clamp(x, 0,
      Genetics.Visualization.DISPLAY_SIZE -
          Genetics.Visualization.AVATAR_SIZE);
  var yPos = goog.math.clamp(y, 0,
      Genetics.Visualization.DISPLAY_SIZE -
          Genetics.Visualization.AVATAR_SIZE);

  var startX = parseInt(mouseAvatar.element.style.left);
  var startY = parseInt(mouseAvatar.element.style.top);
  var xDelta = startX - xPos;
  var yDelta = startY - yPos;
  if(!opt_time) {
    var distance = Math.sqrt( xDelta * xDelta + yDelta * yDelta);
    opt_time = distance/Genetics.Visualization.MOUSE_SPEED;
  }

  mouseAvatar.direction = Math.atan2(yDelta, xDelta);

  var onArrival = function(e) {
    // if(e.target == mouseAvatar.element) {
      // mouseAvatar.element.removeEventListener('transitionend', onArrival, false);
      // mouseAvatar.element.style.left = xPos + 'px';
      // mouseAvatar.element.style.top = yPos + 'px';
      // mouseAvatar.element.style['transition'] = 'none';
      if (opt_callback) {
        opt_callback();
      }
    // }
  };
  mouseAvatar.element.style['transition'] = 'top ' + opt_time + 'ms linear, left ' + opt_time + 'ms linear';
  mouseAvatar.element.style.left = xPos + 'px';
  mouseAvatar.element.style.top = yPos + 'px';

  // mouseAvatar.element.addEventListener('transitionend', onArrival, false);
  setTimeout(onArrival, opt_time);
};

/**
 *
 * @param {Genetics.Visualization.MouseAvatar} mouseAvatar
 * @param {string} reason Type of death, either "EXPLODE", "FIGHT", or "NORMAL".
 * @private
 */
Genetics.Visualization.killMouse = function(mouseAvatar, reason) {
  Genetics.Visualization.display_.removeChild(mouseAvatar.element);

  if (reason == 'EXPLOSION') {
    // The mouse exploded.
    // TODO(kozbial) play explosion animation
  } else if (reason == 'FIGHT') {
    // TODO(kozbial) play ghost animation
  } else {
    // The mouse died normally.
    // TODO(kozbial) play tombstone animation
  }

  // Remove mapping to mouse avatar.
  delete Genetics.Visualization.mice_[mouseAvatar.id];
  // Update statistics to no longer count dead mouse.
  Genetics.Visualization.mouseSexes_[mouseAvatar.sex] -= 1;
  Genetics.Visualization.pickFightOwners_[mouseAvatar.pickFightOwner] -= 1;
  Genetics.Visualization.proposeMateOwners_[mouseAvatar.proposeMateOwner] -= 1;
  Genetics.Visualization.acceptMateOwners_[mouseAvatar.acceptMateOwner] -= 1;
  Genetics.Visualization.updateChartData_();
};

/**
 *
 * @param {Genetics.Visualization.MouseAvatar} mouse0
 * @param {Genetics.Visualization.MouseAvatar} mouse1
 * @param {function} callback
 */
Genetics.Visualization.moveMiceTogether_ = function(mouse0, mouse1, callback) {
  // Find point in between mice for them to move to.
  var x = goog.math.average(parseInt(mouse0.element.style.left),
      parseInt(mouse1.element.style.left));
  var y = goog.math.average(parseInt(mouse0.element.style.top),
      parseInt(mouse1.element.style.top));

  var direction = Math.atan2(parseInt(mouse0.element.style.top, 10) - y,
      parseInt(mouse0.element.style.left, 10) - x);
  // Calculate offset points so that mice don't overlap.
  var xOffset = Genetics.Visualization.AVATAR_HALF_SIZE * Math.cos(direction);
  var yOffset = Genetics.Visualization.AVATAR_HALF_SIZE * Math.sin(direction);

  var hasOtherMouseArrived = false;
  var mouseArrived = function () {
    if (hasOtherMouseArrived) {
      // Turn mice towards each other.
      var direction = Math.atan2(parseInt(mouse0.element.style.top, 10) - y,
          parseInt(mouse0.element.style.left, 10) - x);
      mouse0.direction = direction;
      mouse1.direction = direction + Math.PI;

      callback();
    }
    hasOtherMouseArrived = true;
  };

  // Turn mice towards each other
  // delta * half size *speed

  // Move mice towards each other and start fighting when they both arrive.
  Genetics.Visualization.moveMouseTo_(mouse0, x + xOffset, y + yOffset,
      mouseArrived);
  Genetics.Visualization.moveMouseTo_(mouse1, x - xOffset, y - yOffset,
      mouseArrived);
};

/**
 *
 * @param {Genetics.Visualization.MouseAvatar} instigator
 * @param {Genetics.Visualization.MouseAvatar} opponent
 * @param {string} result The type of result, either 'WIN', 'LOSS', 'TIE', or
 * 'SELF".
 * @param {function} callback Function to call at the end of fight animation.
 */
Genetics.Visualization.fight = function(instigator, opponent, result, callback) {
  var getMouseName = Genetics.Visualization.getMouseName;
  var fightCloud = document.getElementById('dust').cloneNode(true);
  // Calculate the position of the cloud over the mice.
  var cloudTop = goog.math.average(parseInt(instigator.element.style.top, 10),
          parseInt(opponent.element.style.top, 10)) +
      Genetics.Visualization.AVATAR_HALF_SIZE -
      Genetics.Visualization.DUST_SIZE/2;
  var cloudLeft = goog.math.average(parseInt(instigator.element.style.left, 10),
          parseInt(opponent.element.style.left, 10)) +
      Genetics.Visualization.AVATAR_HALF_SIZE -
      Genetics.Visualization.DUST_SIZE/2;

  fightCloud.style.top = cloudTop + 'px';
  fightCloud.style.left = cloudLeft + 'px';

  var afterFightCloud = function(e) {
    if (e.target == fightCloud) {
      fightCloud.removeEventListener('animationend', afterFightCloud, false);
      if (result == 'WIN') {
        Genetics.log(getMouseName(instigator) + ' fights and kills ' +
            getMouseName(opponent) + '.');
        Genetics.Visualization.killMouse(opponent, 'FIGHT');
      } else if (result == 'LOSS') {

        Genetics.log(getMouseName(instigator) + ' fights and is ' +
            'killed by ' + getMouseName(opponent) + '.');
        Genetics.Visualization.killMouse(instigator, 'FIGHT');
      } else if (result == 'TIE') {
        Genetics.log(getMouseName(instigator) + ' fights ' +
            getMouseName(opponent) + ' to a draw.');
      } else {  // If result is 'SELF'.
        Genetics.Visualization.killMouse(instigator, 'FIGHT');
        Genetics.log(getMouseName(instigator) +
            ' chose itself when asked whom to fight with. ' +
            getMouseName(instigator) + ' is being executed to put ' +
            'it out of its misery.');
      }
      instigator.element.style.display = '';
      opponent.element.style.display = '';
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
 * @param {Genetics.Visualization.MouseAvatar} mouseAvatar
 * @param {number} x
 * @param {number} y
 * @param {boolean} isBirth
 * @param {function} callback
 * @private
 */
Genetics.Visualization.addMouse = function(mouseAvatar, x, y, isBirth, callback) {
  var getMouseName = Genetics.Visualization.getMouseName;

  var xPos = goog.math.clamp(x - Genetics.Visualization.AVATAR_HALF_SIZE, 0,
      Genetics.Visualization.DISPLAY_SIZE - Genetics.Visualization.AVATAR_SIZE);
  var yPos = goog.math.clamp(y - Genetics.Visualization.AVATAR_HALF_SIZE, 0,
      Genetics.Visualization.DISPLAY_SIZE - Genetics.Visualization.AVATAR_SIZE);
  mouseAvatar.element.style.left = xPos + 'px';
  mouseAvatar.element.style.top = yPos + 'px';

  Genetics.Visualization.display_.appendChild(mouseAvatar.element);

  var afterDroppingIn = function(e) {
    if(isBirth) {
      Genetics.log(getMouseName(mouseAvatar, true, true) + ' was born!');
    } else {
      Genetics.log(getMouseName(mouseAvatar, true, true) + ' added to game.');
    }
    // Update statistics to include new mouse.
    Genetics.Visualization.mouseSexes_[mouseAvatar.sex] += 1;
    Genetics.Visualization.pickFightOwners_[mouseAvatar.pickFightOwner] += 1;
    Genetics.Visualization.proposeMateOwners_[mouseAvatar.proposeMateOwner] += 1;
    Genetics.Visualization.acceptMateOwners_[mouseAvatar.acceptMateOwner] += 1;
    Genetics.Visualization.updateChartData_();

    mouseAvatar.element.style['animationName'] = 'none';
    mouseAvatar.element
        .removeEventListener('animationEnd', afterDroppingIn, false);
    callback();
  };

  mouseAvatar.element.addEventListener('animationend', afterDroppingIn, false);
  mouseAvatar.element.style['animation'] = 'bounceIn 500ms';
};

/**
 *
 * @param {string} type Type of heart to display, either "SUCCESS", "INFERTILE", or "INCOMPATIBLE".
 * @param x
 * @param y
 * @param callback
 * @private
 */
Genetics.Visualization.showHeart_ = function(type, x, y, callback) {
  var heart = document.getElementById('heart').cloneNode(true);
  heart.style.left = x - Genetics.Visualization.HEART_SIZE/2 + 'px';
  heart.style.top = y - Genetics.Visualization.HEART_SIZE/2 + 'px';
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

Genetics.Visualization.createMouseAvatar = function(mouse) {
  var mouseAvatar = new Genetics.Visualization.MouseAvatar(mouse);
  // Store mapping to this mouse avatar.
  Genetics.Visualization.mice_[mouseAvatar.id] = mouseAvatar;
  return mouseAvatar;
};

/**
 * Stores mouse attributes and visualization information. On creation, updates graph infromation
 * with newly tracked mouse.
 * @param {Genetics.Mouse} mouse
 * @constructor
 * @private
 */
Genetics.Visualization.MouseAvatar = function(mouse) {
  // Store mouse information
  this.id = mouse.id;
  this.sex = mouse.sex;
  this.size = mouse.size;
  this.pickFightOwner = mouse.pickFightOwner;
  this.proposeMateOwner = mouse.proposeMateOwner;
  this.acceptMateOwner = mouse.acceptMateOwner;

  // Create html element for the mouse.
  this.element = document.createElementNS(Blockly.SVG_NS, 'svg');
  this.element.setAttribute('id', 'mouse-' + mouse.id);
  this.element.setAttribute('class', 'mouse');
  this.element.setAttribute('width', Genetics.Visualization.AVATAR_SIZE + 'px');
  this.element.setAttribute('height',
      Genetics.Visualization.AVATAR_SIZE + 'px');
  this.element.style.transformOrigin = Genetics.Visualization.AVATAR_HALF_SIZE + 'px ' + Genetics.Visualization.AVATAR_HALF_SIZE + 'px';

  // Add mouse sprite to element.
  var image = document.createElementNS(Blockly.SVG_NS, 'image');
  image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      Genetics.Visualization.MOUSE_SRC);
  image.setAttribute('height', Genetics.Visualization.AVATAR_SIZE + 'px');
  image.setAttribute('width', Genetics.Visualization.AVATAR_SIZE + 'px');
  image.style.transformOrigin = Genetics.Visualization.AVATAR_HALF_SIZE + 'px ' + Genetics.Visualization.AVATAR_HALF_SIZE + 'px';
  this.element.appendChild(image);

  // Add tooltip for element.
  var tooltip = document.createElementNS(Blockly.SVG_NS, 'text');
  tooltip.setAttribute('class', 'tooltip');
  // tooltip.setAttribute('visibility', 'hidden');
  tooltip.innerHTML = 'sdfsdf';
  // Genetics.Visualization.display_.appendChild(tooltip);

  var showTooltip = function(e) {

  };
  var hideTooltip = function(e) {

  };
  this.element.addEventListener('mousemove', showTooltip, true);
  this.element.addEventListener('onmouseout', hideTooltip, true);

  // Calculate the pie chart arc start/end based on avatar size.
  var xOffset = Genetics.Visualization.AVATAR_HALF_SIZE - Genetics.Visualization.CHART_HALF_SIZE;
  var yOffset = xOffset + Genetics.Visualization.AVATAR_HALF_SIZE/4;
  var radius = Genetics.Visualization.CHART_HALF_SIZE;
  var x1 = radius + xOffset;
  var y1 = yOffset;
  var x2 = radius * (1 + 0.5*Math.sqrt(3)) + xOffset;
  var y2 = radius * 1.5 + yOffset;
  var x3 = radius * (1 - 0.5*Math.sqrt(3)) + xOffset;
  var y3 = radius * 1.5 + yOffset;
  var centerX = radius + xOffset;
  var centerY = radius + yOffset;

  // Draw top right slice.
  var proposeMateSlice = document.createElementNS(Blockly.SVG_NS, 'path');
  proposeMateSlice.setAttribute('d', 'M ' + x1 + ' ' + y1 +
      ' A ' + radius + ' ' + radius + ', 0, 0, 1, ' +
      x2 + ' ' + y2 + ' L ' + centerX + ' ' + centerY + ' Z');
  proposeMateSlice.setAttribute('fill',
      Genetics.Visualization.playerColor_[this.proposeMateOwner]);
  this.element.appendChild(proposeMateSlice);

  // Draw bottom slice.
  var pickFightSlice = document.createElementNS(Blockly.SVG_NS, 'path');
  pickFightSlice.setAttribute('d', 'M ' + x2 + ' ' + y2 +
      ' A ' + radius + ' ' + radius + ', 0, 0, 1, ' +
      x3 + ' ' + y3 + ' L ' + centerX + ' ' + centerY + ' Z');
  pickFightSlice.setAttribute('fill',
      Genetics.Visualization.playerColor_[this.pickFightOwner]);
  this.element.appendChild(pickFightSlice);

  // Draw top left slice.
  var acceptMateSlice = document.createElementNS(Blockly.SVG_NS, 'path');
  acceptMateSlice.setAttribute('d', 'M ' + x3 + ' ' + y3 +
      ' A ' + radius + ' ' + radius + ', 0, 0, 1, ' +
      x1 + ' ' + y1 + ' L ' + centerX + ' ' + centerY + ' Z');
  acceptMateSlice.setAttribute('fill',
      Genetics.Visualization.playerColor_[this.acceptMateOwner]);
  this.element.appendChild(acceptMateSlice);

  Object.defineProperty(this, 'direction', {
    set: function(direction) {
      // Convert direction to a value between 0-2PI
      while (direction < 0) {
        direction += 2 * Math.PI;
      }
      while (direction > 2 * Math.PI) {
        direction -= 2 * Math.PI;
      }
      // Determine what the change of direction is.
      var delta = direction - this.direction;
      if(delta > Math.PI) {
        delta -= 2*Math.PI
      } else if(delta < - Math.PI) {
        delta += 2*Math.PI
      }
      if (delta > 0) {
        // If the mouse turned right.
      } if (delta > 0) {
        // If the mouse turned left.
      } else {
        // Mouse went straight
      }
      // Rotate mouse image to match direction facing.
      this.element.style.transform =
          'rotate(' + (direction - Math.PI/2) + 'rad)';
      this.direction_ = direction;
    },
    get: function() {
      return this.direction_;
    }
  });

  // Choose a random direction for the mouse to face;
  this.direction = Math.random() * 2 * Math.PI;

  // Mouse is busy until it is added to the display.
  this.busy = true;
};

