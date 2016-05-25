// TODO dependency declarations

function Visualization() {
  this.updatedDataQueue = [];
};

Visualization.prototype.watchForUpdates = function() {
  this.UPDATE_TIMEOUT = 600;
  if(this.updatedDataQueue.length) {
    var toUpdate = this.updatedDataQueue.shift();
    this.drawChart(this.sexChart, 'Sex Distribution', toUpdate[0]);
    this.drawChart(this.mateQuestionChart, 'Gene Owner for mateQuestion', toUpdate[1]);
    this.drawChart(this.mateAnswerChart, 'Gene Owner for mateAnswer', toUpdate[2]);
    this.drawChart(this.pickFightChart, 'Gene Owner for pickFight', toUpdate[3]);
  }
  setTimeout(this.watchForUpdates.bind(this), this.UPDATE_TIMEOUT)
};

Visualization.prototype.drawChart = function(chart, title, data) {
  // Set chart options
  var options = {
    title: title,
    width: 600,
    height: 300,
  };
  chart.draw(data, options);
};

Visualization.prototype.createSexDataTable = function(geneStats) {
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Sex');
  data.addColumn('number', 'Mice Count');
  for(owner in geneStats) {
    data.addRow([owner, geneStats[owner]]);
  }
  return data;
};

Visualization.prototype.createGeneDataTable = function(geneStats) {
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Gene Owner');
  data.addColumn('number', 'Mice Count');
  for(owner in geneStats) {
    data.addRow([owner, geneStats[owner]]);
  }
  return data;
};

/**
 * Initializes visualization.
 * @param {array} cageStats A list that contains a mapping of each sex and 3 mappings of player owners to counts for mateQuestion, mateAnswer, and pickFight respectively.
 */
Visualization.prototype.populationInit = function(cageStats) {
  var sexes = cageStats[0];
  var mateQuestionOwners = cageStats[1];
  var mateAnswerOwners = cageStats[2];
  var pickFightOwners = cageStats[3];

  this.sexChart = new google.visualization.PieChart(document.getElementById('sex_chart_div'));
  this.mateQuestionChart = new google.visualization.PieChart(document.getElementById('mateQuestion_chart_div'));
  this.mateAnswerChart = new google.visualization.PieChart(document.getElementById('mateAnswer_chart_div'));
  this.pickFightChart = new google.visualization.PieChart(document.getElementById('pickFight_chart_div'));

  var sexData = this.createSexDataTable(sexes);
  var mateQuestionData = this.createGeneDataTable(mateQuestionOwners);
  var mateAnswerData = this.createGeneDataTable(mateAnswerOwners);
  var pickFightData = this.createGeneDataTable(pickFightOwners);

  var updatedData = [sexData, mateQuestionData, mateAnswerData, pickFightData];
  this.updatedDataQueue.push(updatedData);

  this.watchForUpdates();
};

Visualization.prototype.updateDataTable = function(data, geneStats) {
  for(var i = 0; i < data.getNumberOfRows(); i++) {
    var player = data.getFormattedValue(i, 0);
    if(geneStats[player] != data.getFormattedValue(i, 1)) {
console.log('change in ' + player + ' from ' + data.getFormattedValue(i, 1) + ' to ' + geneStats[player]);
      data.setValue(i, 1, geneStats[player]);
    }
  }
};

/**
 * Updates visualization.
 * @param {array} cageStats A list that contains a mapping of each sex and 3 mappings of player owners to counts for mateQuestion, mateAnswer, and pickFight respectively.
 */
Visualization.prototype.populationUpdate = function(cageStats) {
  var sexes = cageStats[0];
  var mateQuestionOwners = cageStats[1];
  var mateAnswerOwners = cageStats[2];
  var pickFightOwners = cageStats[3];

  var sexData = this.createSexDataTable(sexes);
  var mateQuestionData = this.createGeneDataTable(mateQuestionOwners);
  var mateAnswerData = this.createGeneDataTable(mateAnswerOwners);
  var pickFightData = this.createGeneDataTable(pickFightOwners);

  var updatedData = [sexData, mateQuestionData, mateAnswerData, pickFightData];
  this.updatedDataQueue.push(updatedData);
};

