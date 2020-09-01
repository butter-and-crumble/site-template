/* global ImageLoader, console */

(function () {
  'use strict';

  /**
   * When set to true, you get helpful console logs.
   * @const DEBUG
   */
  var DEBUG = false;

  // Check to see if the users browser cuts the mustard.
  if (!window.document.querySelector) {
    return false;
  }

  /**
   * This method fixes a browser bug in iOS8 Mobile Safari. When the
   * user opens a select menu, it triggers a change event. And in this
   * template a change event redirects the user to a new page.
   * @method mobileNavRedirectFix
   * @private
   */
  function mobileNavRedirectFix () {
    var mobileSelect = document.getElementById('mobileSelect');

    if (!mobileSelect) {
      if (DEBUG === true) {
        console.log('Cannot find the mobile select element.');
      }

      return false;
    }

    /**
     * Fixes a mobile bug where the dropdown navigation menu didn't work properly.
     * @method changeCallback
     * @private
     */
    var changeCallback = function () {
        var destination = mobileSelect.options[mobileSelect.selectedIndex].value;
        window.location = destination;
    };

    mobileSelect.addEventListener('change', changeCallback);
  }

  /**
   * Run ImageLoader on resize so images on the page get refreshed.
   * @method refreshImages
   * @private
   */
  function refreshImages() {
    var images = document.querySelectorAll('img[data-src]');

    for (var i = 0; i < images.length; i++) {
      ImageLoader.load(images[i]);
    }
  }

  document.addEventListener('DOMContentLoaded', mobileNavRedirectFix);
  window.addEventListener('resize', refreshImages);
}());
