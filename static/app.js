(function () {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const overlay = $('#overlay');
  const popupForms = $$('.popup_form_wrap');
  const FOCUSABLE_SELECTOR = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
  let activeModal = null;
  let lastFocusedElement = null;

  const buildFallbackImageUrl = (img, retry = 0) => {
    const source = img.getAttribute('src') || '';
    const altText = (img.getAttribute('alt') || '').toLowerCase();
    const classText = (img.className || '').toLowerCase();
    const fileName = source.split('/').pop().replace(/\.[^/.]+$/, '') || 'sensorium';
    const seedBase = encodeURIComponent((altText || fileName || 'sensorium').replace(/[^a-z0-9]+/gi, '-').slice(0, 56) || 'sensorium');

    const hint = `${source} ${altText} ${classText}`.toLowerCase();
    let query = 'smart safety technology';

    if (/logo|foot/.test(hint)) query = 'minimal technology logo';
    else if (/slider|hero|main_s|news|newsletter/.test(hint)) query = 'smart transportation city';
    else if (/business_img|solution/.test(hint)) query = 'industrial automation factory';
    else if (/media|partner|partner_slide|notice/.test(hint)) query = 'security monitoring';
    else if (/contect|contact|support/.test(hint)) query = 'modern office interior';

    const encodedQuery = encodeURIComponent(query);
    const firstUrl = `https://source.unsplash.com/1200x675/?${encodedQuery}&sig=${seedBase}`;
    if (retry === 0) return firstUrl;

    return `https://picsum.photos/seed/${seedBase}-fallback-${retry}/1200/675`;
  };

  const setupImageFallbacks = () => {
    const images = $$('img');
    images.forEach((img) => {
      const source = img.getAttribute('src');
      if (!source) return;
      img.dataset.imageFallbackRetry = '0';

      const onImageError = () => {
        const nextRetry = Number(img.dataset.imageFallbackRetry || '0') + 1;
        if (nextRetry > 3) {
          img.removeEventListener('error', onImageError);
          img.style.opacity = '0.9';
          img.style.backgroundColor = '#f3f5f7';
          return;
        }

        img.dataset.imageFallbackRetry = String(nextRetry);
        img.src = buildFallbackImageUrl(img, nextRetry);
      };

      img.addEventListener('error', onImageError);
    });

    const backgroundTargets = $$('[style]');
    backgroundTargets.forEach((node, index) => {
      const styleText = node.getAttribute('style') || '';
      const match = styleText.match(/background-image\s*:\s*url\(([^)]+)\)/i);
      if (!match) return;

      const backgroundUrl = match[1].replace(/["']/g, '').trim();
      const isSensoriumImage = backgroundUrl.includes('sensorium.co.kr') || backgroundUrl.startsWith('/data/') || backgroundUrl.startsWith('/img/');
      if (!isSensoriumImage) return;
      if (!backgroundUrl || backgroundUrl === 'none') return;
      if (backgroundUrl.indexOf('/data/') === -1 && backgroundUrl.indexOf('/img/') === -1) return;

      const probe = new Image();
      const fallbackImage = () => {
        const probeAlt = `${node.className || 'background'} image`;
        const probeImg = document.createElement('img');
        probeImg.setAttribute('alt', probeAlt);
        probeImg.setAttribute('src', backgroundUrl);
        return buildFallbackImageUrl(probeImg, index + 1);
      };

      probe.onerror = () => {
        node.style.backgroundImage = `url("${fallbackImage()}")`;
      };
      probe.src = backgroundUrl;
    });
  };

  const getFocusableElements = (root) => {
    return $$(`:is(${FOCUSABLE_SELECTOR})`, root).filter((el) => {
      if (!el.offsetParent && !el.getAttribute('tabindex')) return false;
      if (el.disabled) return false;
      const disabled = el.getAttribute('aria-disabled');
      if (disabled === 'true') return false;
      const style = getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
  };

  const removeFocusTrap = () => {
    if (!activeModal) return;
    const handler = activeModal._focusTrap;
    if (handler) {
      activeModal.removeEventListener('keydown', handler);
      delete activeModal._focusTrap;
    }

    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus({ preventScroll: true });
      lastFocusedElement = null;
    }

    activeModal = null;
  };

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
    removeFocusTrap();
    lockBody(false);
  };

  const openModal = (id) => {
    const target = document.getElementById(id);
    if (!target) return;

    removeFocusTrap();
    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;

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

    const focusable = getFocusableElements(target);
    const focusHandler = (event) => {
      if (event.key !== 'Tab') return;
      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    target._focusTrap = focusHandler;
    target.addEventListener('keydown', focusHandler);
    activeModal = target;
    lockBody(true);

    const first = focusable[0] || target;
    first.focus({ preventScroll: true });
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
    const menuItems = $$('nav.tm_nav dt');

    const closeMobileSections = () => {
      menuItems.forEach((item) => {
        item.classList.remove('on');
        item.setAttribute('aria-expanded', 'false');
        const next = item.nextElementSibling;
        if (next && next.tagName === 'DD') {
          next.style.display = 'none';
        }
      });
    };

    const setMobileNav = (open) => {
      if (!tmNav || !menuBtn) return;
      tmNav.classList.toggle('show', open);
      menuBtn.classList.toggle('active', open);
      if (menuBtn.matches('.mobile-menu-btn')) {
        menuBtn.setAttribute('aria-expanded', String(Boolean(open)));
      }
      menuBtn.setAttribute('aria-expanded', String(Boolean(open)));
      menuBtn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');

      if (!open) {
        closeMobileSections();
        lockBody(false);
        return;
      }
      lockBody(true);
    };

    menuBtn?.addEventListener('click', (event) => {
      event.preventDefault();
      const opened = tmNav?.classList.contains('show') ? false : true;
      setMobileNav(opened);
    });

    menuItems.forEach((dt) => {
      const panel = dt.nextElementSibling;
      if (panel && panel.tagName === 'DD') {
        const sectionId = panel.id || `mobile-section-${menuItems.indexOf(dt) + 1}`;
        panel.id = sectionId;
        dt.setAttribute('aria-controls', sectionId);
      }

      dt.setAttribute('role', 'button');
      dt.setAttribute('tabindex', '0');
      dt.setAttribute('aria-expanded', 'false');

      const toggleSection = () => {
        const isOpen = dt.classList.contains('on');
        closeMobileSections();

        if (!isOpen) {
          dt.classList.add('on');
          dt.setAttribute('aria-expanded', 'true');
          if (panel && panel.tagName === 'DD') {
            panel.style.display = 'block';
          }
        }
      };

      dt.addEventListener('click', () => {
        toggleSection();
      });

      dt.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') {
          return;
        }
        event.preventDefault();
        toggleSection();
      });
    });

    document.addEventListener('click', (event) => {
      if (!tmNav || !menuBtn) return;
      if (!tmNav.classList.contains('show')) return;
      if (tmNav.contains(event.target) || menuBtn.contains(event.target)) return;
      setMobileNav(false);
    });

    closeMobileSections();
    setMobileNav(false);
  };

  const closeMobileNav = () => {
    const tmNav = document.querySelector('nav.tm_nav');
    const menuBtn = document.querySelector('.nav_btn, .mobile-menu-btn');
    if (tmNav) tmNav.classList.remove('show');
    if (menuBtn) {
      menuBtn.classList.remove('active');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', '메뉴 열기');
    }
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
    setupImageFallbacks();
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
