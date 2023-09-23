/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Change the ports of all public links away from 8000.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

(function () {
  // Change all public links to use the default port (80 or 443).
  const publicLinks = document.getElementsByClassName('publicLink');
  for (let i = 0, link; link = publicLinks[i]; i++) {
    if (link.tagName === 'A') {
      const u = new URL(link.href);
      u.port = '';
      link.href = u.toString();
    } else if (link.tagName === 'FORM') {
      const u = new URL(link.action);
      u.port = '';
      link.action = u.toString();
    } else if (link.tagName === 'IMG') {
      const u = new URL(link.src);
      u.port = '';
      link.src = u.toString();
    }
  }
})();
