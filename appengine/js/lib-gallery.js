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
goog.require('BlocklyStorage');


/**
 * Display a dialog for submitting work to the gallery.
 */
BlocklyGallery.showGalleryForm = function() {
  // Encode the XML.
  document.getElementById('galleryXml').value = BlocklyInterface.getCode();

  var content = document.getElementById('galleryDialog');
  var style = {
    width: '40%',
    left: '30%',
    top: '3em'
  };

  if (!BlocklyGallery.showGalleryForm.runOnce_) {
    var cancel = document.getElementById('galleryCancel');
    cancel.addEventListener('click', BlocklyDialogs.hideDialog, true);
    cancel.addEventListener('touchend', BlocklyDialogs.hideDialog, true);
    var ok = document.getElementById('galleryOk');
    ok.addEventListener('click', BlocklyGallery.gallerySubmit_, true);
    ok.addEventListener('touchend', BlocklyGallery.gallerySubmit_, true);
    // Only bind the buttons once.
    BlocklyGallery.showGalleryForm.runOnce_ = true;
  }
  var origin = document.getElementById('submitButton');
  BlocklyDialogs.showDialog(content, origin, true, true, style,
      function() {
        document.body.removeEventListener('keydown',
            BlocklyGallery.galleryKeyDown_, true);
        });
  document.body.addEventListener('keydown', BlocklyGallery.galleryKeyDown_,
      true);
  // Wait for the opening animation to complete, then focus the title field.
  setTimeout(function() {
    document.getElementById('galleryTitle').focus();
  }, 250);
};

/**
 * If the user presses enter, or escape, hide the dialog.
 * Enter submits the form, escape does not.
 * @param {!Event} e Keyboard event.
 * @private
 */
BlocklyGallery.galleryKeyDown_ = function(e) {
  if (e.keyCode == 27) {
    BlocklyDialogs.hideDialog(true);
  } else if (e.keyCode == 13) {
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
 * @param {string=} [opt_method='POST'] The HTTP request method to use.
 */
BlocklyGallery.makeFormRequest_ =
    function(form, opt_onSuccess, opt_onFailure, opt_method) {
  var data = [];
  for (var i = 0, element; (element = form.elements[i]); i++) {
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
  var title = document.getElementById('galleryTitle');
  if (!title.value.trim()) {
    title.value = '';
    title.focus();
    return;
  }

  var form = document.getElementById('galleryForm');
  var onSuccess = function() {
    BlocklyDialogs.storageAlert(null, BlocklyGames.getMsg('Games_submitted'));
  };
  BlocklyGallery.makeFormRequest_(form, onSuccess);
  BlocklyDialogs.hideDialog(true);
};
