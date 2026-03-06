(function() {
  if (typeof window === 'undefined' || typeof window.jQuery === 'undefined') {
    return;
  }

  var $ = window.jQuery;
  var easing = $.easing || ($.easing = {});

  function clamp(x) {
    return x < 0 ? 0 : x > 1 ? 1 : x;
  }

  easing.linear = function (x) {
    return x;
  };

  easing.easeInOutQuad = function (x) {
    x = clamp(x);
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  };

  easing.easeOutCubic = function (x) {
    x = clamp(x);
    return 1 - Math.pow(1 - x, 3);
  };

  easing.easeOutQuart = function (x) {
    x = clamp(x);
    return 1 - Math.pow(1 - x, 4);
  };
})();
