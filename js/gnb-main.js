(function () {
  if (typeof window === 'undefined' || typeof window.jQuery === 'undefined') {
    return;
  }

  var $ = window.jQuery;

  function initDesktopNav() {
    $('.pc_navi > ul > li').each(function () {
      var $li = $(this);
      var open = function () {
        $li.addClass('active').children('.sub_menu').stop(true, true).slideDown(180);
      };
      var close = function () {
        $li.removeClass('active').children('.sub_menu').stop(true, true).slideUp(140);
      };

      $li.on('mouseenter focusin', open);
      $li.on('mouseleave focusout', close);
    });
  }

  function initMobileNav() {
    $(document).on('click', '.nav_btn', function () {
      var $btn = $(this);
      $btn.toggleClass('active');
      $('nav.tm_nav').stop(true, true).slideToggle(180);
    });

    $(document).on('click', '.tm_nav > dl > dt', function () {
      var $dt = $(this);
      var $dd = $dt.next('dd');
      $('.tm_nav > dl > dt').not($dt).removeClass('on').next('dd').slideUp(140);
      if (!$dd.is(':visible')) {
        $dt.addClass('on');
        $dd.slideDown(160);
      } else {
        $dt.removeClass('on');
        $dd.slideUp(140);
      }
    });
  }

  $(function () {
    initDesktopNav();
    initMobileNav();
    $('.pc_navi .sub_menu').hide();
    $('nav.tm_nav').hide();
  });
})();
