(function () {
  if (typeof window === 'undefined') {
    return;
  }

  function toNumber(value, fallback) {
    var num = parseInt(value, 10);
    return num === num ? num : fallback;
  }

  function Swiper(container, options) {
    this.options = options || {};
    this.container =
      typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) {
      return;
    }
    this.wrapper = this.container.querySelector('.swiper-wrapper') || this.container;
    this.slides = Array.prototype.slice.call(this.wrapper.children);
    this.index = 0;
    this.duration = toNumber(this.options.speed, 280);
    this.init();
  }

  Swiper.prototype.init = function () {
    this.total = this.slides.length;
    if (!this.total) {
      return;
    }
    this.update(true);
    var prevSel = this.options.navigation && this.options.navigation.prevEl;
    var nextSel = this.options.navigation && this.options.navigation.nextEl;
    if (prevSel) {
      var prev = typeof prevSel === 'string' ? document.querySelector(prevSel) : prevSel;
      if (prev) prev.addEventListener('click', this.prev.bind(this));
    }
    if (nextSel) {
      var next = typeof nextSel === 'string' ? document.querySelector(nextSel) : nextSel;
      if (next) next.addEventListener('click', this.next.bind(this));
    }
  };

  Swiper.prototype.visibleCount = function () {
    if (!this.container) return 1;
    var width = this.container.clientWidth;
    if (width >= 1080) return 4;
    if (width >= 768) return 3;
    if (width >= 480) return 2;
    return 1;
  };

  Swiper.prototype.update = function (silent) {
    if (!this.container || !this.slides.length) {
      return;
    }
    var per = Math.max(1, this.visibleCount());
    var width = this.container.clientWidth / per;
    for (var i = 0; i < this.slides.length; i++) {
      this.slides[i].style.width = width + 'px';
    }
    this.container.style.position = this.container.style.position || 'relative';
    this._applyTransform(this.index, silent);
  };

  Swiper.prototype._applyTransform = function (index, silent) {
    if (!this.wrapper) return;
    var per = Math.max(1, this.visibleCount());
    var limit = Math.max(0, this.total - per);
    if (this.total > 0 && index > limit) {
      this.index = limit;
    }
    if (index < 0) {
      this.index = 0;
    }
    var x = -(this.slides[0].offsetWidth || 0) * this.index;
    this.wrapper.style.transform = 'translate3d(' + x + 'px, 0, 0)';
    this.wrapper.style.transitionDuration = this.duration + 'ms';
    if (silent) {
      this.wrapper.style.transitionDuration = '0ms';
    }
  };

  Swiper.prototype.next = function () {
    if (!this.total) return this;
    var per = Math.max(1, this.visibleCount());
    if (this.index < this.total - per) {
      this.index++;
      this.update();
    }
    return this;
  };

  Swiper.prototype.prev = function () {
    if (!this.total) return this;
    if (this.index > 0) {
      this.index--;
      this.update();
    }
    return this;
  };

  Swiper.prototype.slideTo = function (index) {
    this.index = toNumber(index, 0);
    this.update();
    return this;
  };

  Swiper.prototype.on = function () {
    return this;
  };

  Swiper.prototype.destroy = function () {
    this.wrapper && (this.wrapper.style.transform = '');
    return this;
  };

  window.Swiper = Swiper;

  var all = document.querySelectorAll('.swiper-container');
  for (var i = 0; i < all.length; i++) {
    var container = all[i];
    if (container.__sensoriumSwiperInited) {
      continue;
    }
    container.__sensoriumSwiperInited = true;
    new Swiper(container, {
      navigation: {
        prevEl: container.querySelector('.swiper-button-prev'),
        nextEl: container.querySelector('.swiper-button-next'),
      },
      speed: 280,
    });
  }
})();
