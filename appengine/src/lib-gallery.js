/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Common support code for gallery submission.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('BlocklyGallery');

goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('BlocklyStorage');


/**
 * Display a dialog for submitting work to the gallery.
 */
BlocklyGallery.showGalleryForm = function() {
  // Encode the XML.
  BlocklyGames.getElementById('galleryXml').value = BlocklyInterface.getCode();

  const content = BlocklyGames.getElementById('galleryDialog');
  const style = {
    width: '40%',
    left: '30%',
    top: '3em',
  };

  if (!BlocklyGallery.showGalleryForm.runOnce_) {
    const ok = BlocklyGames.getElementById('galleryOk');
    ok.addEventListener('click', BlocklyGallery.gallerySubmit_, true);
    ok.addEventListener('touchend', BlocklyGallery.gallerySubmit_, true);
    // Only bind the buttons once.
    BlocklyGallery.showGalleryForm.runOnce_ = true;
  }
  const origin = BlocklyGames.getElementById('submitButton');
  BlocklyDialogs.showDialog(content, origin, true, true, style,
      function() {
        document.body.removeEventListener('keydown',
            BlocklyGallery.galleryKeyDown_, true);
        });
  document.body.addEventListener('keydown', BlocklyGallery.galleryKeyDown_,
      true);
  // Wait for the opening animation to complete, then focus the title field.
  setTimeout(function() {
    BlocklyGames.getElementById('galleryTitle').focus();
  }, 250);
};

/**
 * If the user presses enter, or escape, hide the dialog.
 * Enter submits the form, escape does not.
 * @param {!Event} e Keyboard event.
 * @private
 */
BlocklyGallery.galleryKeyDown_ = function(e) {
  if (e.keyCode === 27) {
    BlocklyDialogs.hideDialog(true);
  } else if (e.keyCode === 13) {
    BlocklyGallery.gallerySubmit_();
  }
};

/**
 * Fire a new AJAX request.
 * @param {HTMLFormElement} form Form to retrieve request URL and data from.
 * @param {?Function=} opt_onSuccess Function to call after request completes
 *    successfully.
 * @param {?Function=} opt_onFailure Function to call after request completes
 *    unsuccessfully. Defaults to BlocklyStorage alert of request status.
 * @param {string=} opt_method The HTTP request method to use.  Default to POST.
 */
BlocklyGallery.makeFormRequest_ =
    function(form, opt_onSuccess, opt_onFailure, opt_method) {
  const data = [];
  for (const element of form.elements) {
    if (element.name) {
      data.push(encodeURIComponent(element.name) + '=' +
          encodeURIComponent(element.value));
    }
  }
  BlocklyStorage.makeRequest(
      form.action, data.join('&'), opt_onSuccess, opt_onFailure, opt_method);
};

/**
 * Submit the gallery submission form.
 * @private
 */
BlocklyGallery.gallerySubmit_ = function() {
  // Check that there is a title.
  const title = BlocklyGames.getElementById('galleryTitle');
  if (!title.value.trim()) {
    title.value = '';
    title.focus();
    return;
  }

  const form = BlocklyGames.getElementById('galleryForm');
  const onSuccess = function() {
    BlocklyDialogs.storageAlert(null,
        BlocklyGames.getMsg('Games.submitted', false));
  };
  BlocklyGallery.makeFormRequest_(form, onSuccess);
  BlocklyDialogs.hideDialog(true);
};
