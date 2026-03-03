(() => {
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const mobileNav = document.getElementById('mobileNav');
  const openModalBtn = document.querySelectorAll('[data-open-modal]');
  const closeModalBtn = document.querySelectorAll('[data-close-modal]');
  const overlay = document.getElementById('overlay');
  const topScrollBtn = document.querySelector('[data-scroll-top]');

  const overlayClose = () => {
    document.querySelectorAll('.modal.show').forEach((m) => m.classList.remove('show'));
    if (overlay) {
      overlay.classList.remove('show');
      overlay.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('modal-open', 'noscroll');
    const opened = document.querySelector('[data-opened-modal]');
    if (opened) {
      opened.removeAttribute('data-opened-modal');
    }
  };

  const openModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    overlayClose();
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    modal.setAttribute('data-opened-modal', 'true');
    if (overlay) {
      overlay.classList.add('show');
      overlay.setAttribute('aria-hidden', 'false');
    }
    document.body.classList.add('modal-open', 'noscroll');
    const first = modal.querySelector('input, button, textarea');
    if (first) first.focus({ preventScroll: true });
  };

  const closeMobile = () => {
    if (!mobileNav) return;
    mobileNav.classList.remove('show');
    mobileBtn?.classList.remove('active');
    if (mobileBtn) mobileBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('noscroll');
  };

  mobileBtn?.addEventListener('click', () => {
    if (!mobileNav) return;
    const isOpen = mobileNav.classList.toggle('show');
    mobileBtn.classList.toggle('active', isOpen);
    mobileBtn.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('noscroll', isOpen);
  });

  overlay?.addEventListener('click', () => {
    closeMobile();
    overlayClose();
  });

  openModalBtn.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.getAttribute('data-open-modal');
      if (!id) return;
      openModal(id);
    });
  });

  closeModalBtn.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      overlayClose();
    });
  });

  topScrollBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('keyup', (event) => {
    if (event.key === 'Escape') {
      overlayClose();
      closeMobile();
    }
  });

  // 메인 슬라이더
  const sliderTrack = document.querySelector('[data-slider-track]');
  const sliderDots = document.querySelector('[data-slider-dots]');
  const prevBtn = document.querySelector('[data-slider-prev]');
  const nextBtn = document.querySelector('[data-slider-next]');

  if (sliderTrack && sliderDots) {
    const slides = Array.from(sliderTrack.querySelectorAll('.slide'));
    let current = 0;
    let timer = 0;

    slides.forEach((slide, idx) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.setAttribute('aria-label', `${idx + 1}번째 슬라이드로 이동`);
      if (idx === 0) d.classList.add('active');
      d.addEventListener('click', () => goTo(idx));
      sliderDots.appendChild(d);
    });

    const dots = Array.from(sliderDots.querySelectorAll('button'));

    const goTo = (index) => {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      sliderTrack.style.transition = 'transform .45s ease';
      sliderTrack.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((b, i) => b.classList.toggle('active', i === current));
    };

    const next = () => goTo(current + 1);
    const prev = () => goTo(current - 1);

    prevBtn?.addEventListener('click', () => {
      prev();
      resetTimer();
    });
    nextBtn?.addEventListener('click', () => {
      next();
      resetTimer();
    });

    const start = () => {
      stop();
      timer = window.setInterval(next, 5000);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = 0;
      }
    };

    const resetTimer = () => {
      start();
    };

    sliderTrack.addEventListener('mouseenter', stop);
    sliderTrack.addEventListener('mouseleave', start);

    goTo(0);
    start();
  }

  // 모바일 아코디언 메뉴
  document.querySelectorAll('.mobile-nav .accordion').forEach((btn) => {
    btn.addEventListener('click', () => {
      const panel = btn.nextElementSibling;
      if (!panel) return;
      const isOpen = panel.classList.toggle('active');
      btn.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) {
        btn.classList.add('open');
      } else {
        btn.classList.remove('open');
      }
    });
  });

  // 데스크톱 메뉴(홍보실 포함) 클릭 토글 지원
  const desktopNav = document.querySelector('.gnb');
  const desktopHasSub = document.querySelectorAll('.gnb .has-sub');
  const closeDesktopSubMenus = () => {
    desktopHasSub.forEach((item) => {
      item.classList.remove('is-open');
      const trigger = item.querySelector(':scope > a');
      if (trigger) {
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  };

  desktopHasSub.forEach((item) => {
    const trigger = item.querySelector(':scope > a');
    if (!trigger) return;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.addEventListener('click', (event) => {
      if (window.matchMedia('(max-width: 840px)').matches) return;
      event.preventDefault();

      const isOpen = item.classList.contains('is-open');
      closeDesktopSubMenus();
      if (!isOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.addEventListener('click', (event) => {
    if (!desktopNav) return;
    if (!desktopNav.contains(event.target)) {
      closeDesktopSubMenus();
    }
  });

  // 캐러셀(파트너/뉴스레터)
  const moveCarousel = (id, direction = 1) => {
    const track = document.getElementById(id);
    if (!track) return;
    const item = track.querySelector('figure, article');
    if (!item) return;
    const itemWidth = item.getBoundingClientRect().width + 12;
    track.scrollBy({ left: itemWidth * 3 * direction, behavior: 'smooth' });
  };

  document.querySelectorAll('[data-carousel-prev]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-carousel-prev');
      if (id) moveCarousel(id, -1);
    });
  });

  document.querySelectorAll('[data-carousel-next]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-carousel-next');
      if (id) moveCarousel(id, 1);
    });
  });

  // 고객센터 탭
  document.querySelectorAll('[data-tab-btn]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-tab-btn');
      const target = document.querySelector(`[data-tab-panel="${key}"]`);
      if (!key || !target) return;

      document.querySelectorAll('[data-tab-btn]').forEach((b) => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-selected', String(b === btn));
      });

      document.querySelectorAll('[data-tab-panel]').forEach((panel) => {
        panel.classList.toggle('active', panel === target);
      });
    });
  });

  // 폼 핸들링
  const onSubmitForm = (id, title) => {
    const form = document.getElementById(id);
    if (!form) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const payload = Object.fromEntries(data.entries());
      const name = (payload.name || '').trim();
      const email1 = (payload.email1 || '').trim();
      const email2 = (payload.email2 || '').trim();

      if (id === 'newsletterForm' && email1 && !/^[^@\s]+$/.test(email1)) {
        alert('이메일 형식이 올바르지 않습니다.');
        return;
      }

      if (id === 'newsletterForm' && (!email1 || !email2)) {
        alert('이메일을 정확히 입력해주세요.');
        return;
      }

      if (name.length < 2) {
        alert('이름은 최소 2자 이상 입력해주세요.');
        return;
      }

      alert(`${title}이(가) 접수되었습니다.`);
      form.reset();
      overlayClose();
    });
  };

  onSubmitForm('inquiryForm', '문의 신청');
  onSubmitForm('newsletterForm', '뉴스레터 구독 신청');
  onSubmitForm('zoomForm', 'zoom 미팅 신청');

  // 시작 시 현재 경로 해시 반영
  const setActiveHash = () => {
    const hash = window.location.hash;
    if (!hash) return;
    const target = document.querySelector(hash);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  window.addEventListener('load', setActiveHash);
  window.addEventListener('hashchange', setActiveHash);
})();
