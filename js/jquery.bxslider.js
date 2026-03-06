(function () {
  if (typeof window === 'undefined' || typeof window.jQuery === 'undefined') {
    return;
  }

  var $ = window.jQuery;

  function createPager(el) {
    var $pager = $('<div class="bx-pager" aria-hidden="true"></div>');
    var count = el.children('li').length;
    for (var i = 0; i < count; i++) {
      var $btn = $('<a href="javascript:void(0)" class="bx-pager-link" role="button"></a>');
      $btn.on('click', function (evt) {
        var idx = $(evt.currentTarget).data('index');
        el.data('bxSlider-instance').goToSlide(idx);
      });
      $btn.data('index', i);
      $pager.append($('<span class="bx-pager-item"></span>').append($btn));
    }
    return $pager;
  }

  function startAuto(instance, config) {
    instance.stop();
    instance._timer = window.setInterval(function () {
      if (instance._stopped) {
        return;
      }
      instance.nextSlide();
    }, config.pause || 3000);
  }

  $.fn.bxSlider = function (options) {
    var config = $.extend(
      {
        mode: 'horizontal',
        auto: false,
        autoControls: false,
        pause: 3000,
      },
      options || {}
    );

    return this.each(function () {
      var $el = $(this);
      if ($el.data('bxSlider-inited')) {
        return;
      }

      var $items = $el.children('li');
      if (!$items.length) {
        return;
      }

      var state = {
        index: 0,
        total: $items.length,
        _timer: null,
        _stopped: false,
      };

      function sync() {
        $items.removeClass('active-slide').hide().eq(state.index).addClass('active-slide').fadeIn(120);
        $el.children('.bx-pager').find('.bx-pager-link').removeClass('active');
        $el.children('.bx-pager').find('.bx-pager-link[data-index="' + state.index + '"]').addClass('active');
      }

      state.nextSlide = function () {
        state.index = (state.index + 1) % state.total;
        sync();
      };

      state.prevSlide = function () {
        state.index = (state.index - 1 + state.total) % state.total;
        sync();
      };

      state.goToSlide = function (idx) {
        if (typeof idx !== 'number' || idx < 0 || idx >= state.total) {
          return;
        }
        state.index = idx;
        sync();
      };

      state.start = function () {
        state._stopped = false;
        return state;
      };

      state.stop = function () {
        state._stopped = true;
        if (state._timer) {
          window.clearInterval(state._timer);
          state._timer = null;
        }
      };

      state.reloadSlider = function () {
        sync();
        return state;
      };

      state.destroy = function () {
        state.stop();
        $el.find('.bx-pager').remove();
        $items.removeClass('active-slide').css('display', '');
        $el.removeData('bxSlider-instance');
        $el.removeData('bxSlider-inited');
      };

      $el.data('bxSlider-instance', state).data('bxSlider-inited', true);
      $el.append(createPager($el));
      sync();

      var $pager = $el.children('.bx-pager');
      $pager.on('click', '.bx-pager-link', function (evt) {
        evt.preventDefault();
        state.goToSlide(Number($(evt.currentTarget).data('index')) || 0);
      });

      if (config.auto) {
        startAuto(state, config);
      }

      if (config.autoControls === false) {
        return state;
      }

      var $prev = $('<button type="button" class="bx-prev" aria-label="previous slide">&lt;</button>');
      var $next = $('<button type="button" class="bx-next" aria-label="next slide">&gt;</button>');
      $prev.on('click', function () {
        state.prevSlide();
      });
      $next.on('click', function () {
        state.nextSlide();
      });
      $el.before($next);
      $el.before($prev);

      $el.on('mouseenter', function () {
        state.stop();
      });
      $el.on('mouseleave', function () {
        if (config.auto) {
          startAuto(state, config);
        }
      });
    }).data('bxSlider-instance') || this;
  };
})();
