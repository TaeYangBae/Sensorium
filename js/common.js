(function () {
  if (typeof window === 'undefined' || typeof window.jQuery === 'undefined') {
    return;
  }

  var $ = window.jQuery;
  var body = $('body');

  function setNoScroll(flag) {
    if (flag) {
      body.addClass('no-scroll');
      return;
    }
    body.removeClass('no-scroll');
  }

  window.openSensoriumPopup = function (selector) {
    var $target = $(selector);
    if (!$target.length) {
      return;
    }
    $('.popup_form_wrap').removeClass('open').hide();
    $target.addClass('open').css('display', 'flex');
    $target.attr('aria-hidden', 'false');
    setNoScroll(true);
  };

  window.closeSensoriumPopup = function () {
    $('.popup_form_wrap').removeClass('open').hide().attr('aria-hidden', 'true');
    setNoScroll(false);
  };

  $(document).on('click', '.popup_close', function () {
    closeSensoriumPopup();
  });

  $(document).on('click', '.popup_form_wrap', function (evt) {
    if ($(evt.target).is('.popup_form_wrap')) {
      closeSensoriumPopup();
    }
  });

  $(document).on('keydown', function (evt) {
    if (evt.key === 'Escape') {
      closeSensoriumPopup();
    }
  });

  window.NA_lead = window.NA_lead || function () {
    if (typeof window.wcs !== 'undefined') {
      try {
        window.wcs.trans({ type: 'lead' });
      } catch (_) {}
    }
  };

  window.sensoriumFieldRequired = function (ids) {
    for (var i = 0; i < ids.length; i++) {
      var $input = $('#' + ids[i]);
      if (!$input.length) {
        continue;
      }
      if (($.trim(String($input.val() || '')) === '')) {
        $input.focus();
        return {
          ok: false,
          name: ids[i],
          message: '필수 입력값을 입력해주세요.'
        };
      }
    }
    return { ok: true };
  };

  window.sensoriumCheckPrivacy = function (target) {
    if (!$(target).is(':checked')) {
      alert('개인정보 처리방침에 동의해주세요.');
      return false;
    }
    return true;
  };

  window.zoomCheck = function () {
    var required = sensoriumFieldRequired(['z_company', 'z_name', 'z_position', 'z_tel']);
    if (!required.ok) {
      alert('필수 항목을 확인해주세요.');
      return false;
    }
    if (!sensoriumCheckPrivacy('#z_privacy_check')) {
      return false;
    }
    if (!$.trim($('#z_date').val()) || !$.trim($('#z_time').val())) {
      alert('회의 가능 시간을 확인해주세요.');
      return false;
    }
    return true;
  };

  window.inquiryCheck = function () {
    var required = sensoriumFieldRequired(['i_company', 'i_name', 'i_position', 'i_tel']);
    if (!required.ok) {
      alert('필수 항목을 확인해주세요.');
      return false;
    }
    if (!sensoriumCheckPrivacy('#i_privacy_check')) {
      return false;
    }
    if (!$.trim($('#i_date').val()) || !$.trim($('#i_time').val())) {
      alert('통화 가능 시간을 확인해주세요.');
      return false;
    }
    return true;
  };

  window.newsletterCheck = function () {
    var required = sensoriumFieldRequired(['n_name', 'n_email1', 'n_email2', 'n_company']);
    if (!required.ok) {
      alert('필수 항목을 확인해주세요.');
      return false;
    }
    if (!sensoriumCheckPrivacy('#n_privacy_check')) {
      return false;
    }
    return true;
  };

})();
