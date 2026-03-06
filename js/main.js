(function () {
  if (typeof window === 'undefined' || typeof window.jQuery === 'undefined') {
    return;
  }

  var $ = window.jQuery;
  var slider = null;

  function initSlider() {
    var $main = $('.main_slider .bxslider');
    if (!$main.length) {
      return;
    }

    slider = $main.eq(0).bxSlider({
      mode: 'fade',
      auto: true,
      autoControls: false,
      pause: 3000,
      randomStart: true,
    });

    if (slider && slider.reloadSlider) {
      slider.reloadSlider();
    }
  }

  function ensureDateTimePickers() {
    if ($.fn.timepicker) {
      $('.i_time').timepicker();
    }

    $('.i_date').each(function () {
      var $input = $(this);
      $input.attr('type', 'text').attr('maxlength', 10).attr('placeholder', 'YYYY-MM-DD');
      $input.on('focus', function () {
        if (!this.value) {
          var now = new Date();
          var mm = String(now.getMonth() + 1).padStart(2, '0');
          var dd = String(now.getDate()).padStart(2, '0');
          this.value = now.getFullYear() + '-' + mm + '-' + dd;
        }
      });
    });
  }

  function wirePopups() {
    $(document).on('click', '.inquiry_banner, .newsletter_banner, .inquiry_form .submit_btn, .zoom_form .submit_btn, .newsletter_form .submit_btn', function (e) {
      if ($(this).hasClass('submit_btn')) {
        return;
      }
      e.preventDefault();

      var $target = $(this).hasClass('inquiry_banner') ? $('.inquiry_form') : $('.newsletter_form');
      if ($(this).hasClass('newsletter_banner')) {
        $target = $('.newsletter_form');
      } else if ($(this).hasClass('inquiry_banner')) {
        $target = $('.inquiry_form');
      }
      if (window.openSensoriumPopup) {
        window.openSensoriumPopup($target[0]);
      } else {
        $target.addClass('open').show();
      }
      return false;
    });
  }

  function wireNoticeTabs() {
    $('.notice_tab .bar').each(function () {
      if (!$(this).closest('.notice_tab').next().length) {
        return;
      }
    });
  }

  function initQuickTop() {
    $('#quick_popup_wrap .top_scroll').on('click', function (evt) {
      evt.preventDefault();
      $('html, body').animate({ scrollTop: 0 }, 480);
    });
  }

  function initImageFallbacks() {
    var selectors = $('img');
    selectors.each(function () {
      var $img = $(this);
      var src = $img.attr('src');
      if (!src || /^https?:\/\//i.test(src) || src.indexOf('/img/common/loading.gif') !== -1) {
        return;
      }
      $img.on('error', function () {
        $img.off('error');
        $img.attr('src', '/datafile/1234.png');
      });
    });
  }

  function initNewsNavButtons() {
    $('.con04 .slide_navigation .arrow').on('click', function () {
      var container = $('.news_slide_wrap .swiper-wrapper');
      if (!container.length) {
        return;
      }
      var isPrev = $(this).hasClass('swiper-button-prev') || $(this).is('.prev');
      var $slides = container.children('.slide');
      var first = container.children('.slide').first();
      if (!$slides.length) {
        return;
      }
      if (isPrev) {
        container.children('.slide').last().detach().prependTo(container);
      } else {
        container.children('.slide').first().detach().appendTo(container);
      }
    });
  }

  $(function () {
    initSlider();
    ensureDateTimePickers();
    wirePopups();
    wireNoticeTabs();
    initQuickTop();
    initImageFallbacks();
    initNewsNavButtons();

    $('#quick_popup_wrap').on('click', '.img', function (evt) {
      var $li = $(this).closest('li');
      if ($li.hasClass('inquiry_banner')) {
        window.openSensoriumPopup('.inquiry_form');
      }
      if ($li.hasClass('newsletter_banner')) {
        window.openSensoriumPopup('.newsletter_form');
      }
    });

    $('#bg').on('click', function () {
      if (window.closeSensoriumPopup) {
        closeSensoriumPopup();
      }
    });
  });
})();
