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
goog.require('goog.object');


/**
 * Frames per second to draw.  Has no impact on game play, just the display.
 */
Genetics.Visualization.FPS = 36;

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
      div.style.display = (i == index) ? 'block' : 'none';
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
  Genetics.Visualization.processCageEvents_();
  Genetics.Visualization.drawCharts_();
  // Frame done.  Calculate the actual elapsed time and schedule the next frame.
  var now = Date.now();
  var workTime = now - Genetics.Visualization.lastFrame -
      Genetics.Visualization.lastDelay;
  var delay = Math.max(1, (1000 / Genetics.Visualization.FPS) - workTime);
  Genetics.Visualization.pid_ = setTimeout(Genetics.Visualization.update, delay);
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
Genetics.Visualization.drawCharts_ = function() {
  if(Genetics.Visualization.chartsUpdated_) {
    // Update the chart data on the screen.
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
        var addedMouse = event['MOUSE'];
        Genetics.Visualization.addMouse(addedMouse);
        Genetics.log(getMouseName(addedMouse, true, true) + ' added to game.');
        break;
      case 'START_GAME':
        Genetics.Visualization.updateChartData_();
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
        Genetics.Visualization.removeMouse(mouse, 'NORMAL');
        Genetics.log(getMouseName(mouse) + ' dies after a productive life.');
        break;
      case 'OVERPOPULATION':
        Genetics.Visualization.removeMouse(mouse, 'NORMAL');
        Genetics.log('Cage has gotten too cramped ' + getMouseName(mouse) +
            ' can\'t compete with the younger mice and dies.');
        break;
      case 'EXPLODE':
        var source = event['SOURCE'];
        var cause = event['CAUSE'];
        Genetics.Visualization.removeMouse(mouse, 'EXPLOSION');
        Genetics.log(getMouseName(mouse) + ' exploded in ' + source +
            ' because ' + cause);
        break;
      case 'SPIN':
        var source = event['SOURCE'];
        Genetics.Visualization.removeMouse(mouse, 'EXPLOSION');
        Genetics.log(getMouseName(mouse) + ' spun in circles after ' + source +
            ' was called.');
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

Genetics.Visualization.processFightEvent = function(event, instigatingMouse, opt_opponent) {
  var getMouseName = Genetics.Visualization.getMouseName;
  var opponent = opt_opponent || null;

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
      Genetics.Visualization.removeMouse(instigatingMouse, 'FIGHT');
      break;
    case 'WIN':
      Genetics.Visualization.removeMouse(opponent, 'FIGHT');
      Genetics.log(getMouseName(instigatingMouse) + ' fights and kills ' +
          getMouseName(opponent) + '.');
      break;
    case 'TIE':
      Genetics.log(getMouseName(instigatingMouse) + ' fights ' +
          getMouseName(opponent) + ' to a draw.');
      break;
    case 'LOSS':
      Genetics.Visualization.removeMouse(instigatingMouse, 'FIGHT');
      Genetics.log(getMouseName(instigatingMouse) + ' fights and is ' +
          'killed by ' + getMouseName(opponent) + '.');
      break;
  }
};

Genetics.Visualization.processMateEvent = function(event, proposingMouse, opt_askedMouse) {
  var getMouseName = Genetics.Visualization.getMouseName;
  var askedMouse = opt_askedMouse || null;

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
      Genetics.log(getMouseName(proposingMouse) + ' mated with ' +
          getMouseName(askedMouse) + ', another ' + proposingMouse.sex +
          '.');
      break;
    case 'INFERTILE':
      Genetics.log('Mating between ' + getMouseName(proposingMouse) +
          ' and ' + getMouseName(askedMouse) + ' failed because ' +
          getMouseName(askedMouse) + ' is sterile.');
      break;
    case 'MATE_EXPLODED':
      Genetics.Visualization.removeMouse(askedMouse, 'EXPLOSION');
      Genetics.log(getMouseName(askedMouse) + ' exploded after ' +
          getMouseName(proposingMouse) + ' asked it out.');
      break;
    case 'REJECTION':
      Genetics.log(getMouseName(proposingMouse) + ' asked ' +
          getMouseName(askedMouse) + ' to mate, The answer is NO!');
      break;
    case 'SUCCESS':
      Genetics.log(getMouseName(proposingMouse, true, true) + ' asked ' +
          getMouseName(askedMouse, true, true) + ' to mate, The answer ' +
          'is YES!');
      var offspring = event['OPT_OFFSPRING'];
      Genetics.log(getMouseName(offspring, true, true) + ' was born!');
      Genetics.Visualization.addMouse(offspring, 0, 0);
      break;
  }
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

/**
 *
 * @param {Genetics.Mouse} mouse
 * @param {number=} opt_x
 * @param {number=} opt_y
 * @private
 */
Genetics.Visualization.addMouse = function(mouse, opt_x, opt_y) {
  var x = (opt_x != null) ? opt_x : Genetics.Visualization.display_.clientWidth/2;
  var y = (opt_y != null) ? opt_y : Genetics.Visualization.display_.clientHeight/2;

  var mouseAvatar = new Genetics.Visualization.MouseAvatar(mouse, x, y);

  Genetics.Visualization.display_.appendChild(mouseAvatar.element);

  // Store mapping to this mouse avatar.
  Genetics.Visualization.mice_[mouseAvatar.id] = mouseAvatar;
  // Update statistics to include new mouse.
  Genetics.Visualization.mouseSexes_[mouseAvatar.sex] += 1;
  Genetics.Visualization.pickFightOwners_[mouseAvatar.pickFightOwner] += 1;
  Genetics.Visualization.proposeMateOwners_[mouseAvatar.proposeMateOwner] += 1;
  Genetics.Visualization.acceptMateOwners_[mouseAvatar.acceptMateOwner] += 1;
};

/**
 *
 * @param {Genetics.Visualization.MouseAvatar} mouseAvatar
 * @param {string} reason Type of death, either "EXPLODE", "FIGHT", or "NORMAL".
 * @private
 */
Genetics.Visualization.removeMouse = function(mouseAvatar, reason) {
  mouseAvatar.die(reason);

  Genetics.Visualization.display_.removeChild(mouseAvatar.element);

  // Remove mapping to mouse avatar.
  delete Genetics.Visualization.mice_[mouseAvatar.id];
  // Update statistics to no longer count dead mouse.
  Genetics.Visualization.mouseSexes_[mouseAvatar.sex] -= 1;
  Genetics.Visualization.pickFightOwners_[mouseAvatar.pickFightOwner] -= 1;
  Genetics.Visualization.proposeMateOwners_[mouseAvatar.proposeMateOwner] -= 1;
  Genetics.Visualization.acceptMateOwners_[mouseAvatar.acceptMateOwner] -= 1;
};

/**
 * Stores mouse attributes and visualization information. On creation, updates graph infromation
 * with newly tracked mouse.
 * @param {Genetics.Mouse} mouse
 * @param {number} x
 * @param {number} y
 * @constructor
 * @private
 */
Genetics.Visualization.MouseAvatar = function(mouse, x, y) {
  // Store mouse information
  this.id = mouse.id;
  this.sex = mouse.sex;
  this.pickFightOwner = mouse.pickFightOwner;
  this.proposeMateOwner = mouse.proposeMateOwner;
  this.acceptMateOwner = mouse.acceptMateOwner;

  // Create html element for the mouse
  this.element = document.createElement('div');
  this.element.className = 'mouse';
  this.element.id = 'mouse-' + mouse.id;

  this.element.style.left = Math.max(x - 10, 0) + 'px';
  this.element.style.top = Math.max(y - 10, 0) + 'px';

  this.busy = false;

  this.alive = true;
};

/**
 * Triggers death animation and updates mappings to reflect mouse death.
 * @param {string} reason Type of death, either "EXPLODE", "FIGHT", or "NORMAL".
 * @private
 */
Genetics.Visualization.MouseAvatar.prototype.die = function(reason) {
  if (!this.alive) {
    return;
  }

  if (reason == 'EXPLOSION') {
    // The mouse exploded.
    // TODO(kozbial) play explosion animation
  } else if (reason == 'FIGHT') {
    // TODO(kozbial) play ghost animation
  } else {
    // The mouse died normally.
    // TODO(kozbial) play tombstone animation
  }

  this.alive = false;
};
