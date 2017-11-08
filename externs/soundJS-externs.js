/**
 * @fileoverview Externs for SoundJS.
 * @externs
 */

/**
 * Root namespace.
 */
var createjs = {};

/**
 * Sound namespace.
 */
createjs.Sound = {};

/**
 * Register an array of audio files for loading and future playback in Sound.
 * @param {Array.<string>} sounds An array of objects to load.
 * @param {string} basePath Set a path to be prepended to each src when loading.
 */
createjs.Sound.registerSounds = function(sounds, basePath) {};

/**
 * Play a sound.
 * @param {string} src The source or ID of the audio.
 */
createjs.Sound.play = function(src) {};
