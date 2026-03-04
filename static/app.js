(function () {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const overlay = $('#overlay');
  const popupForms = $$('.popup_form_wrap');

  const lockBody = (lock) => {
    document.body.classList.toggle('modal-open', lock);
  };

  const closeAllModals = () => {
    popupForms.forEach((modal) => {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
    });
    if (overlay) {
      overlay.classList.remove('show');
      overlay.setAttribute('aria-hidden', 'true');
    }
    lockBody(false);
  };

  const openModal = (id) => {
    const target = document.getElementById(id);
    if (!target) return;

    popupForms.forEach((modal) => {
      if (modal === target) return;
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
    });

    target.classList.add('show');
    target.setAttribute('aria-hidden', 'false');
    if (overlay) {
      overlay.classList.add('show');
      overlay.setAttribute('aria-hidden', 'false');
    }
    lockBody(true);

    const first = target.querySelector('input, textarea, button');
    if (first) first.focus({ preventScroll: true });
  };

  // floating quick buttons
  $$('[data-open]').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      const targetId = btn.getAttribute('data-open');
      if (targetId) {
        openModal(targetId);
      }
    });
  });

  $$('.popup-close, .popup_close, [data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      closeAllModals();
    });
  });

  if (overlay) {
    overlay.addEventListener('click', closeAllModals);
  }

  document.addEventListener('keyup', (event) => {
    if (event.key === 'Escape') {
      closeAllModals();
      closeMobileNav();
    }
  });

  $('[data-scroll-top]')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const setupFadeSlider = (trackSelector, dotSelector = null, interval = 4200) => {
    const track = $(trackSelector);
    if (!track) return;

    const slides = $$('.main_s, .slide', track);
    if (slides.length <= 1) return;

    let current = 0;
    let timer = 0;

    const update = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === current);
      });

      if (dotSelector) {
        const container = $(dotSelector);
        if (container) {
          const dots = $$('button', container);
          dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === current);
          });
        }
      }
    };

    const next = () => update(current + 1);

    const createDots = () => {
      if (!dotSelector) return;
      const container = $(dotSelector);
      if (!container) return;
      container.innerHTML = '';
      slides.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = idx === 0 ? 'active' : '';
        dot.setAttribute('aria-label', `${idx + 1}번째 슬라이드`);
        dot.addEventListener('click', () => {
          update(idx);
          restart();
        });
        container.appendChild(dot);
      });
    };

    const start = () => {
      stop();
      timer = window.setInterval(next, interval);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = 0;
      }
    };

    const restart = () => {
      start();
    };

    track.addEventListener('mouseenter', stop);
    track.addEventListener('mouseleave', start);

    createDots();
    update(0);
    start();
  };

  // main slider + news hero
  setupFadeSlider('.main_slider .bxslider', '#heroDots', 4200);

  const setupScroller = (trackId, step = 300) => {
    const prevBtn = $(`[data-carousel-prev="${trackId}"]`);
    const nextBtn = $(`[data-carousel-next="${trackId}"]`);
    const track = document.getElementById(trackId);
    if (!track) return;

    const move = (direction) => {
      const distance = direction * step;
      track.scrollBy({
        left: distance,
        behavior: 'smooth',
      });
    };

    prevBtn?.addEventListener('click', () => move(-1));
    nextBtn?.addEventListener('click', () => move(1));
  };

  setupScroller('partnerTrack', 250);
  setupScroller('newsletterTrack', 300);

  const setupMobileNav = () => {
    const menuBtn = document.querySelector('.nav_btn, .mobile-menu-btn');
    const tmNav = document.querySelector('nav.tm_nav');

    menuBtn?.addEventListener('click', (event) => {
      event.preventDefault();
      const opened = tmNav?.classList.toggle('show');
      menuBtn.classList.toggle('active', opened);
      if (menuBtn.matches('.mobile-menu-btn')) {
        menuBtn.setAttribute('aria-expanded', String(Boolean(opened)));
      }
      if (opened) {
        lockBody(true);
      } else {
        lockBody(false);
      }
    });

    $$('nav.tm_nav dt').forEach((dt) => {
      dt.addEventListener('click', () => {
        const next = dt.nextElementSibling;
        const open = dt.classList.toggle('on');
        if (next && next.tagName === 'DD') {
          next.style.display = open ? 'block' : 'none';
        }

        $$('nav.tm_nav dt').forEach((other) => {
          if (other === dt) return;
          other.classList.remove('on');
          const otherPanel = other.nextElementSibling;
          if (otherPanel && otherPanel.tagName === 'DD') {
            otherPanel.style.display = 'none';
          }
        });
      });
    });
  };

  const closeMobileNav = () => {
    const tmNav = document.querySelector('nav.tm_nav');
    const menuBtn = document.querySelector('.nav_btn, .mobile-menu-btn');
    if (tmNav) tmNav.classList.remove('show');
    menuBtn?.classList.remove('active');
    if (menuBtn?.matches('.mobile-menu-btn')) {
      menuBtn.setAttribute('aria-expanded', 'false');
    }
    if (!document.querySelector('.popup_form_wrap.show')) {
      lockBody(false);
    }
  };

  const setupDesktopNavTouch = () => {
    const items = $$('.pc_navi .has-sub');
    if (!items.length) return;

    items.forEach((item) => {
      const anchor = item.querySelector(':scope > a');
      if (!anchor) return;

      anchor.addEventListener('click', (event) => {
        if (!window.matchMedia('(max-width: 920px)').matches) {
          event.preventDefault();
          const isOpen = item.classList.contains('open');
          items.forEach((other) => {
            if (other !== item) {
              other.classList.remove('open');
              const otherAnchor = other.querySelector(':scope > a');
              if (otherAnchor) otherAnchor.setAttribute('aria-expanded', 'false');
            }
          });

          item.classList.toggle('open', !isOpen);
          anchor.setAttribute('aria-expanded', String(!isOpen));
        }
      });
    });

    document.addEventListener('click', (event) => {
      if (window.matchMedia('(min-width: 921px)').matches) {
        const hasOpen = items.find((item) => item.classList.contains('open'));
        if (!hasOpen) return;

        if (!hasOpen.contains(event.target)) {
          items.forEach((item) => {
            item.classList.remove('open');
            const a = item.querySelector(':scope > a');
            if (a) a.setAttribute('aria-expanded', 'false');
          });
        }
      }
    });
  };

  const setupForms = () => {
    const forms = [
      {
        id: 'zoomRequestForm',
        title: 'zoom 미팅 신청',
      },
      {
        id: 'inquiryForm',
        title: '문의 신청',
      },
      {
        id: 'newsletterForm',
        title: '뉴스레터 구독',
      },
    ];

    forms.forEach(({ id, title }) => {
      const form = document.getElementById(id);
      if (!form) return;
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const requiredCheckboxes = $$('input[required][type="checkbox"]', form);
        if (requiredCheckboxes.some((checkbox) => !checkbox.checked)) {
          alert('개인정보 처리 동의가 필요합니다.');
          return;
        }

        const values = Object.fromEntries(new FormData(form).entries());
        const name = `${values.r_name || values.name || values.company || '고객'}님`;
        alert(`${name} ${title}이(가) 접수되었습니다.`);
        form.reset();
        closeAllModals();
      });
    });
  };

  const setupHeader = () => {
    const header = document.getElementById('header');
    const onScroll = () => {
      if (!header) return;
      if (window.scrollY > 10) {
        header.classList.add('is-sticky');
      } else {
        header.classList.remove('is-sticky');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  };

  const boot = () => {
    setupMobileNav();
    setupDesktopNavTouch();
    setupForms();
    setupHeader();

    const hashTarget = document.querySelector(window.location.hash || '#');
    if (hashTarget) {
      window.requestAnimationFrame(() => {
        hashTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  };

  boot();
})();
