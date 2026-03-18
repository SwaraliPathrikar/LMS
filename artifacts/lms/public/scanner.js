/**
 * scanner.js — Barcode scanner integration for the LMS Issue Book workflow.
 * Uses html5-qrcode (loaded via CDN or bundled import in BookCirculationPage).
 * This file is the standalone version for non-module contexts.
 * The React integration lives directly in BookCirculationPage.tsx.
 */

(function () {
  if (typeof window === 'undefined') return;

  window.LMSScanner = {
    instance: null,

    start: function (onScan, onError) {
      if (!window.Html5QrcodeScanner) {
        if (onError) onError('Html5QrcodeScanner not loaded');
        return;
      }
      var containerId = 'lms-barcode-scanner-container';
      var el = document.getElementById(containerId);
      if (!el) {
        el = document.createElement('div');
        el.id = containerId;
        document.body.appendChild(el);
      }

      this.instance = new window.Html5QrcodeScanner(
        containerId,
        { fps: 10, qrbox: { width: 250, height: 150 } },
        false
      );

      this.instance.render(
        function (decodedText) {
          if (onScan) onScan(decodedText);
        },
        function (errorMessage) {
          /* scan errors are noisy — ignore them */
        }
      );
    },

    stop: function () {
      if (this.instance) {
        this.instance.clear().catch(function () {});
        this.instance = null;
      }
    }
  };
})();
