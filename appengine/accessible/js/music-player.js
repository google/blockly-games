/**
 * Blockly Demos: Accessible Blockly
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
 * @fileoverview Utility functions and classes for a music game for
 *               screen-reader users.
 *
 * @author sll@google.com (Sean Lip)
 */

var CONSTANTS = {
  LINE_PLAYER: 'player',
  LINE_ACCOMPANIMENT: 'accompaniment',
  SKEW_LIMIT_MSEC: 50.0
};

// MUSIC LINE OBJECT

var MusicLine = function() {
  this.chords_ = [];
  this.currentBeat_ = 0.0;
};

MusicLine.prototype.getChords = function() {
  return this.chords_;
};

MusicLine.prototype.getDurationInMsecs = function(millisecsPerBeat) {
  return this.currentBeat_ * millisecsPerBeat;
};

MusicLine.prototype.addChord = function(midiPitches, durationInBeats) {
  this.chords_.push({
    midiPitches: midiPitches,
    durationInBeats: durationInBeats,
    delayInBeats: this.currentBeat_
  });

  this.currentBeat_ += durationInBeats;
};

MusicLine.prototype.addRest = function(durationInBeats) {
  this.currentBeat_ += durationInBeats;
};

// This method assumes that the lines are arranged in ascending order of
// delayInBeats.
MusicLine.prototype.isEqual = function(other) {
  if (this.chords_.length !== other.chords_.length) {
    return false;
  }

  for (var i = 0; i < this.chords_.length; i++) {
    if (this.chords_[i].durationInBeats != other.chords_[i].durationInBeats ||
        this.chords_[i].delayInBeats != other.chords_[i].delayInBeats) {
      return false;
    }

    var thisChordPitches = this.chords_[i].midiPitches.concat().sort();
    var otherChordPitches = other.chords_[i].midiPitches.concat().sort();
    if (thisChordPitches.length != otherChordPitches.length) {
      return false;
    }

    var mismatchedChord = thisChordPitches.some(function(pitch, index) {
      return pitch != otherChordPitches[index];
    });
    if (mismatchedChord) {
      return false;
    }
  }

  return true;
};

MusicLine.prototype.setFromChordsAndDurations = function(chordsAndDurations) {
  this.chords_ = [];
  this.currentBeat_ = 0.0;

  var that = this;
  chordsAndDurations.forEach(function(chordAndDuration) {
    if (chordAndDuration[0] === null) {
      that.addRest(chordAndDuration[1]);
    } else {
      that.addChord(chordAndDuration[0], chordAndDuration[1]);
    }
  });
};


// MUSIC PLAYER OBJECT (SINGLETON)

var MusicPlayer = function() {
  var ASSETS_PATH = '../third-party/midi-js-soundfonts/piano/';
  var notes = {
    '48': 'C3',
    '50': 'D3',
    '52': 'E3',
    '53': 'F3',
    '55': 'G3',
    '57': 'A3',
    '59': 'B3',
    '60': 'C4',
    '62': 'D4',
    '64': 'E4',
    '65': 'F4',
    '67': 'G4',
    '69': 'A4',
    '71': 'B4',
    '72': 'C5'
  };
  var sounds = [];
  for (var midiValue in notes) {
    sounds.push({
      src: notes[midiValue] + '.mp3',
      id: midiValue
    });
  }
  createjs['Sound']['registerSounds'](sounds, ASSETS_PATH);

  this.lines_ = {};
  this.activeTimeouts_ = [];

  this.reset();
};

MusicPlayer.prototype.reset = function() {
  createjs['Sound'].stop();
  this.activeTimeouts_.forEach(function(timeout) {
    clearTimeout(timeout);
  });

  for (key in this.lines_) {
    delete this.lines_[key];
  }
  this.lines_[CONSTANTS.LINE_PLAYER] = new MusicLine();
  this.lines_[CONSTANTS.LINE_ACCOMPANIMENT] = new MusicLine();

  this.activeTimeouts_ = [];
};

MusicPlayer.prototype.playNote_ = function(
    midiPitches, durationInSecs, expectedEpochTime) {
  // In Chrome, the timeouts start getting confused when the tab is
  // backgrounded (see e.g. http://stackoverflow.com/q/6032429), so we
  // halt the playthrough and remove all remaining notes from the play buffer.
  // Note that this is not an issue in Firefox.
  var currentEpochTime = (new Date).getTime();
  var timeDifference = Math.abs(expectedEpochTime - currentEpochTime);
  if (timeDifference > CONSTANTS.SKEW_LIMIT_MSEC) {
    this.reset();
    return;
  }

  var soundInstances = [];
  midiPitches.forEach(function(midiPitch) {
    soundInstances.push(createjs['Sound']['play'](String(midiPitch)));
  });

  setTimeout(function() {
    soundInstances.forEach(function(soundInstance) {
      soundInstance['stop']();
    });
  }, durationInSecs * 1000.0);
};

MusicPlayer.prototype.playLines_ = function(
    linesToPlay, beatsPerMinute, onFinishPlayerLineCallback) {
  var secsPerBeat = 60.0 / beatsPerMinute;
  var millisecsPerBeat = secsPerBeat * 1000.0;

  var startTime = (new Date).getTime();
  var that = this;
  linesToPlay.forEach(function(lineName) {
    that.lines_[lineName].getChords().forEach(function(chord) {
      // Play each pitch in a chord at most once.
      var uniquePitches = [];
      chord.midiPitches.forEach(function(pitch) {
        if (uniquePitches.indexOf(pitch) == -1) {
          uniquePitches.push(pitch);
        }
      });

      var expectedEpochTime =
          startTime +
          chord.delayInBeats * millisecsPerBeat;
      var elapsedTime = (new Date).getTime() - startTime;
      that.activeTimeouts_.push(setTimeout(function() {
        that.playNote_(
            uniquePitches, chord.durationInBeats * secsPerBeat,
            expectedEpochTime);
      }, chord.delayInBeats * millisecsPerBeat - elapsedTime));
    });
  });

  if (onFinishPlayerLineCallback) {
    that.activeTimeouts_.push(setTimeout(
        onFinishPlayerLineCallback,
        that.lines_[CONSTANTS.LINE_PLAYER].getDurationInMsecs(
            millisecsPerBeat)));
  }
};

MusicPlayer.prototype.setAccompaniment = function(accompaniment) {
  this.lines_[CONSTANTS.LINE_ACCOMPANIMENT].setFromChordsAndDurations(
      accompaniment);
};

MusicPlayer.prototype.doesPlayerLineEqual = function(otherLine) {
  return this.lines_[CONSTANTS.LINE_PLAYER].isEqual(otherLine);
};

MusicPlayer.prototype.addPlayerChord = function(midiPitches, durationInBeats) {
  this.lines_[CONSTANTS.LINE_PLAYER].addChord(midiPitches, durationInBeats);
};

MusicPlayer.prototype.getPlayerChords = function() {
  return this.lines_[CONSTANTS.LINE_PLAYER].chords_;
};

MusicPlayer.prototype.playPlayerLine = function(
    beatsPerMinute, onFinishPlayerLineCallback) {
  this.playLines_(
      [CONSTANTS.LINE_PLAYER], beatsPerMinute, onFinishPlayerLineCallback);
};

MusicPlayer.prototype.playAllLines = function(
    beatsPerMinute, onFinishPlayerLineCallback) {
  this.playLines_(
    [CONSTANTS.LINE_PLAYER, CONSTANTS.LINE_ACCOMPANIMENT], beatsPerMinute,
    onFinishPlayerLineCallback);
};

MusicPlayer.prototype.play = function(line, beatsPerMinute) {
  // TODO(sll): Refactor to use a different line for this.
  this.lines_[CONSTANTS.LINE_ACCOMPANIMENT] = line;
  this.playLines_([CONSTANTS.LINE_ACCOMPANIMENT], beatsPerMinute);
  this.lines_[CONSTANTS.LINE_ACCOMPANIMENT] = [];
};
