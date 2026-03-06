(function () {
  if (typeof window === 'undefined' || typeof window.jQuery === 'undefined') {
    return;
  }

  var $ = window.jQuery;

  if (!$.fn.bxSlider) {
    $.fn.bxSlider = function () { return this; };
  }

  if (!$.fn.timepicker) {
    $.fn.timepicker = function () { return this; };
  }

  if (!$.fn.draggable) {
    $.fn.draggable = function () { return this; };
  }

  if (typeof window.Swiper === 'undefined') {
    window.Swiper = function () {
      return {
        on: function () { return this; },
        update: function () { return this; },
        destroy: function () { return this; },
      };
    };
    window.Swiper.prototype = {};
  }

  if (typeof window.NA_lead === 'undefined') {
    window.NA_lead = function () {};
  }
})();
