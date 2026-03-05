(function () {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const overlay = $('#overlay');
  const popupForms = $$('.popup_form_wrap');
  const FOCUSABLE_SELECTOR = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
  let activeModal = null;
  let lastFocusedElement = null;

  const buildFallbackImageDataUri = ({ title, bg = '#e3ebf8', accent = '#0d56c7', width = 1200, height = 675 }) => {
    const safeTitle = (title || '').replace(/&/g, '및').replace(/</g, '').replace(/>/g, '').replace(/"/g, "'");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bg}" stop-opacity="0.98"/>
          <stop offset="100%" stop-color="${accent}" stop-opacity="0.22"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <rect y="${height - 4}" width="100%" height="4" fill="${accent}" fill-opacity="0.42"/>
      <g fill="${accent}" opacity="0.16">
        <circle cx="${width * 0.18}" cy="${height * 0.24}" r="${Math.max(width, height) * 0.08}"/>
        <circle cx="${width * 0.84}" cy="${height * 0.72}" r="${Math.max(width, height) * 0.1}"/>
      </g>
      <text x="50%" y="50%" text-anchor="middle" fill="#17325f" font-family="Arial, 'Pretendard', 'Noto Sans KR'" font-size="${Math.max(22, Math.floor(width / 22))}" font-weight="700">
        SENSORIUM
      </text>
      <text x="50%" y="58%" text-anchor="middle" fill="#17325f" font-family="Arial, 'Pretendard', 'Noto Sans KR'" font-size="${Math.max(14, Math.floor(width / 40))}" font-weight="600">
        ${safeTitle || '이미지 준비 중'}
      </text>
    </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  const getFallbackTheme = (img) => {
    const source = img.getAttribute?.('src') || '';
    const altText = (img.getAttribute?.('alt') || '').toLowerCase();
    const classText = (img.className || '').toLowerCase();
    const hint = `${source} ${altText} ${classText}`.toLowerCase();

    if (/logo|foot|brand/.test(hint)) {
      return { title: 'SENSORIUM LOGO', bg: '#0f2e63', accent: '#57a4ff', width: 640, height: 180 };
    }
    if (/main_s|hero|slider|news|newsletter/.test(hint)) {
      return { title: 'HERO IMAGE', bg: '#112f67', accent: '#45b4ff', width: 1600, height: 700 };
    }
    if (/business_img|solution/.test(hint)) {
      return { title: '센서 솔루션', bg: '#eef5ff', accent: '#1d6de1', width: 1000, height: 560 };
    }
    if (/media_img|media/.test(hint)) {
      return { title: '자료 / 미디어', bg: '#f0f4ff', accent: '#2f66c7', width: 900, height: 540 };
    }
    if (/customer|partner|company|logo/.test(hint)) {
      return { title: '파트너사', bg: '#f5f8ff', accent: '#4b7fd9', width: 620, height: 260 };
    }
    return { title: 'SENSORIUM', bg: '#e9effb', accent: '#2d67c1', width: 1200, height: 675 };
  };

  const buildFallbackImageUrl = (img, retry = 1) => {
    const theme = getFallbackTheme(img);
    const suffix = (retry > 1) ? ` #${retry}` : '';
    return buildFallbackImageDataUri({
      ...theme,
      title: `${theme.title}${suffix}`,
    });
  };

  const setImagePlaceholder = (img) => {
    if (img.classList.contains('image-placeholder')) return;
    img.classList.add('image-placeholder');
    img.removeAttribute('srcset');
  };

  const shouldHandleImageAsset = (url = '') => {
    const source = (url || '').trim();
    if (!source || source === '#') return false;
    if (source.startsWith('data:')) return false;
    if (source.startsWith('http://') || source.startsWith('https://')) {
      return /sensorium\.co\.kr\//i.test(source);
    }
    if (source.startsWith('//')) {
      return /sensorium\.co\.kr/i.test(source);
    }
    return source.startsWith('/') || source.startsWith('./') || source.startsWith('../');
  };

  const buildFallbackBackgroundImage = (node, source, retry = 1) => {
    const hint = `${source || ''} ${(node.className || '')}`.toLowerCase();
    const classText = (node.className || '').toLowerCase();
    const img = { getAttribute: () => source, className: classText, classList: { contains: () => false } };
    const theme = getFallbackTheme(img);
    const svg = buildFallbackImageDataUri({
      ...theme,
      title: retry > 1 ? `${theme.title} #${retry}` : theme.title,
      width: 1400,
      height: 760,
    });
    return `url("${svg}")`;
  };

  const markBackgroundPlaceholder = (node) => {
    if (!node.classList.contains('image-placeholder-bg')) {
      node.classList.add('image-placeholder-bg');
    }
  };

  const setupImageFallbacks = () => {
    const images = $$('img');
    images.forEach((img) => {
      const source = img.getAttribute('src');
      const applyImageFallback = (fallbackIndex = 1) => {
        img.src = buildFallbackImageUrl(img, fallbackIndex);
        setImagePlaceholder(img);
        img.removeAttribute('srcset');
      };

      if (!source) {
        applyImageFallback(1);
        return;
      }

      if (!shouldHandleImageAsset(source)) {
        img.addEventListener('error', () => {
          applyImageFallback(2);
        }, { once: true });
        return;
      }

      const fallbackUrl = buildFallbackImageUrl(img, 1);
      const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      img.dataset.imageFallbackToken = token;
      img.dataset.imageFallbackSource = source;

      img.src = fallbackUrl;
      setImagePlaceholder(img);

      const probe = new Image();
      probe.onload = () => {
        if (img.dataset.imageFallbackToken !== token) return;
        if (img.dataset.imageFallbackSource !== source) return;

        img.src = source;
        img.classList.remove('image-placeholder');
        img.removeAttribute('srcset');
      };
      probe.onerror = () => {
        if (img.dataset.imageFallbackToken !== token) return;
        if (img.dataset.imageFallbackSource !== source) return;

        img.src = buildFallbackImageUrl(img, 2);
      };
      probe.src = source;
    });

    const backgroundTargets = $$('[style]');
    backgroundTargets.forEach((node, index) => {
      const styleText = node.getAttribute('style') || '';
      const match = styleText.match(/background-image\s*:\s*url\(([^)]+)\)/i);
      if (!match) return;

      const backgroundUrl = match[1].replace(/["']/g, '').trim();
      if (!shouldHandleImageAsset(backgroundUrl)) return;
      if (!backgroundUrl || backgroundUrl === 'none') return;

      const fallbackImage = () => buildFallbackBackgroundImage(node, backgroundUrl, index + 1);
      const token = `${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`;
      node.dataset.imageFallbackToken = token;
      node.dataset.imageFallbackSource = backgroundUrl;

      markBackgroundPlaceholder(node);
      node.style.backgroundImage = `${fallbackImage()}`;

      const probe = new Image();
      probe.onerror = () => {
        if (node.dataset.imageFallbackToken !== token) return;
        if (node.dataset.imageFallbackSource !== backgroundUrl) return;

        node.style.backgroundImage = `${buildFallbackBackgroundImage(node, backgroundUrl, 2)}`;
      };
      probe.onload = () => {
        if (node.dataset.imageFallbackToken !== token) return;
        if (node.dataset.imageFallbackSource !== backgroundUrl) return;

        node.style.backgroundImage = `url('${backgroundUrl}')`;
        node.classList.remove('image-placeholder-bg');
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

    tmNav?.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        setMobileNav(false);
      });
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
          return;
        }

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

(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

  const setMotionClass = () => {
    document.documentElement.classList.toggle('reduced-motion', motionPreference.matches);
  };

  const ensureFooterYear = () => {
    $$('.foot_wrap .copy, footer .copy').forEach((node) => {
      const currentYear = new Date().getFullYear();
      node.textContent = `copyright(c)${currentYear} SENSORIUM all right reserved.`;
    });
  };

  const initScrollProgress = () => {
    if (document.getElementById('scrollProgress')) return;
    const bar = document.createElement('div');
    const topButton = $('[data-scroll-top]');

    bar.id = 'scrollProgress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    let rafId = 0;
    const update = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const ratio = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      bar.style.setProperty('--scroll-progress', ratio.toFixed(4));
      if (topButton) {
        topButton.classList.toggle('is-visible', ratio > 0.04);
      }
      rafId = 0;
    };
    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  };

  const initAnchorSmooth = () => {
    $$('a[href^="#"]').forEach((link) => {
      const hash = link.getAttribute('href');
      if (!hash || hash === '#') return;
      const target = $(hash);
      if (!target) return;

      link.addEventListener('click', (event) => {
        event.preventDefault();
        target.scrollIntoView({ behavior: motionPreference.matches ? 'auto' : 'smooth', block: 'start' });
      });
    });
  };

  const initImageAndLinkHardening = () => {
    $$('img').forEach((img, index) => {
      if (!img.hasAttribute('loading')) {
        img.loading = index < 2 ? 'eager' : 'lazy';
      }
      if (!img.hasAttribute('decoding')) {
        img.decoding = 'async';
      }
      if (!img.hasAttribute('alt')) {
        img.setAttribute('alt', '');
      }
      if (index < 2 && !img.hasAttribute('fetchpriority')) {
        img.fetchPriority = 'high';
      }
    });

    $$('a[href^=\"mailto:\"], a[href^=\"tel:\"]').forEach((link) => {
      const href = link.getAttribute('href') || '';
      if (href && !link.getAttribute('aria-label')) {
        link.setAttribute('aria-label', `${link.textContent.trim() || href} ${href}`);
      }
    });
  };

  const initSectionReveal = () => {
    const nodes = $$(
      'section, .con03, .con04, .con05, .con06, .con08, .con0301, .news_slide_wrap, #footer, #contents > .split, #contents > .con'
    );

    if (!nodes.length) return;
    nodes.forEach((node) => node.classList.add('reveal'));

    if (!('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('in-view'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -15% 0px', threshold: 0.12 }
    );

    nodes.forEach((node) => {
      observer.observe(node);
    });
  };

  const initA11y = () => {
    const topButton = $('[data-scroll-top]');
    if (topButton) {
      topButton.setAttribute('type', 'button');
    }

    $$('.pc_navi a, .tm_nav a, .popup-close, #quick_popup_wrap button').forEach((el) => {
      if (el.matches('.popup-close')) return;
      if (!el.textContent.trim() && !el.getAttribute('aria-label')) {
        el.setAttribute('aria-label', el.getAttribute('title') || '링크');
      }
    });
  };

  const bootEnhanced = () => {
    if ('addEventListener' in motionPreference) {
      motionPreference.addEventListener('change', setMotionClass);
    }

    setMotionClass();
    ensureFooterYear();
    initScrollProgress();
    initAnchorSmooth();
    initImageAndLinkHardening();
    initSectionReveal();
    initA11y();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootEnhanced, { once: true });
  } else {
    bootEnhanced();
  }
})();
