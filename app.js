const menuButton = document.querySelector('.menu-toggle');
const menu = document.getElementById('menu');
const revealElements = document.querySelectorAll('.reveal');
const counterElement = document.querySelector('.big-number');
const navLinks = document.querySelectorAll('.menu-link[href^="#"]');
const projects = document.querySelectorAll('.project[data-project]');
const detailPanel = document.getElementById('projectDetail');
const detailBadge = document.getElementById('detailBadge');
const detailTitle = document.getElementById('detailTitle');
const detailDescription = document.getElementById('detailDescription');
const detailClose = document.querySelector('.detail-close');
const detailOverlay = document.getElementById('detailOverlay');
let lastActiveElement;
const sections = Array.from(
  document.querySelectorAll('#works, #studio, #journal, #contact').values()
).filter(Boolean);

const workDetails = {
  nightline: {
    badge: 'Immersive Installation',
    title: 'Nightline Pavilion',
    text: '도시 야간 공원 조명 구조물과 음향 센서를 결합해, 관람자의 보행 속도에 따라 빛과 사운드 패턴이 변하는 몰입형 전시를 구현했습니다.',
  },
  pulse: {
    badge: 'Brand Campaign',
    title: 'Pulse 2089',
    text: '브랜드 내러티브를 12개 모듈로 쪼개고, 스테이지 이벤트와 AR 트리거로 참가자 참여 경험을 증폭하는 캠페인을 운영했습니다.',
  },
  urban: {
    badge: 'Space Experience',
    title: 'Urban Echoes',
    text: '도심형 팝업에서 동선별 동기화 포인트를 설정해 이동 반경에 맞춰 미디어월 콘텐츠의 강도와 리듬을 조정했습니다.',
  },
  liquid: {
    badge: 'Live Performance',
    title: 'Liquid Stage',
    text: '센서 기반 무대 데이터와 음악 빌드를 연동해 조명·음향·비주얼이 실시간 반응하는 콘서트 포맷을 제작했습니다.',
  },
};

const closeDetail = () => {
  if (!detailPanel || !detailOverlay) return;
  detailPanel.classList.remove('show');
  detailOverlay.classList.remove('show');
  detailPanel.setAttribute('aria-hidden', 'true');
  detailOverlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('detail-open');

  if (lastActiveElement && lastActiveElement.focus) {
    lastActiveElement.focus({ preventScroll: true });
  }
  lastActiveElement = null;
};

const openDetail = (id) => {
  const data = workDetails[id];
  if (!data || !detailPanel) return;
  lastActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  detailBadge.textContent = data.badge;
  detailTitle.textContent = data.title;
  detailDescription.textContent = data.text;
  detailPanel.classList.add('show');
  detailOverlay.classList.add('show');
  detailPanel.setAttribute('aria-hidden', 'false');
  detailOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('detail-open');
  detailClose?.focus({ preventScroll: true });
};

const toggleMenu = () => {
  if (!menu || !menuButton) return;
  const next = !menu.classList.contains('open');
  menu.classList.toggle('open', next);
  menuButton.setAttribute('aria-expanded', String(next));
};

menuButton?.addEventListener('click', (event) => {
  event.preventDefault();
  toggleMenu();
});

const scrollToSection = (hash) => {
  const target = document.querySelector(hash);
  if (!target) return;
  const headerOffset = document.querySelector('.topbar')?.offsetHeight || 0;
  const y = target.getBoundingClientRect().top + window.scrollY - headerOffset - 10;
  window.scrollTo({ top: y, behavior: 'smooth' });
};

const updateActiveNav = (forceId = null) => {
  if (!sections.length) return;

  const activeId = forceId
    ? forceId.replace('#', '')
    : sections.reduce((acc, section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= 140 ? section.id : acc;
      }, sections[0]?.id);

  navLinks.forEach((link) => {
    const href = link.getAttribute('href') || '';
    link.classList.toggle('active', href === `#${activeId}`);
  });
};

const handleAnchor = (event) => {
  const el = event.currentTarget;
  const href = el.getAttribute('href');
  if (!href || href[0] !== '#') return;

  event.preventDefault();
  scrollToSection(href);
  updateActiveNav(href);
  if (window.innerWidth <= 720) menu?.classList.remove('open');
};

navLinks.forEach((link) => {
  link.addEventListener('click', handleAnchor);
});

// 섹션 내부 CTA의 앵커 처리
document.querySelectorAll('.hero a[href^="#"], .btn[href^="#"]').forEach((el) => {
  el.addEventListener('click', handleAnchor);
});

projects.forEach((project) => {
  const label = `자세히 보기: ${project.querySelector('h3')?.textContent || ''}`;
  project.setAttribute('tabindex', '0');
  project.setAttribute('role', 'button');
  project.setAttribute('aria-label', label);

  const onOpen = () => {
    const id = project.dataset.project;
    openDetail(id);
  };

  project.addEventListener('click', onOpen);
  project.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen();
    }
  });
});

const reveal = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('show');
      reveal.unobserve(entry.target);
    }
  },
  {
    threshold: 0.16,
    rootMargin: '0px 0px -10% 0px',
  }
);
for (const item of revealElements) reveal.observe(item);

detailClose?.addEventListener('click', closeDetail);
detailOverlay?.addEventListener('click', closeDetail);

const animateCounter = (el) => {
  const target = Number(el?.dataset?.count || 0);
  if (!target || Number.isNaN(target)) return;
  const start = performance.now();
  const duration = 1200;

  const step = (time) => {
    const progress = Math.min((time - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = `${Math.floor(eased * target)}`;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = `${target}`;
  };

  requestAnimationFrame(step);
};

const studioSection = document.getElementById('studio');
if (studioSection && counterElement) {
  const studioObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        animateCounter(counterElement);
        studioObserver.disconnect();
      }
    },
    { threshold: 0.4 }
  );
  studioObserver.observe(studioSection);
}

window.addEventListener(
  'scroll',
  () => {
    updateActiveNav();
  },
  { passive: true }
);

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeDetail();
    menu?.classList.remove('open');
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 720) menu?.classList.remove('open');
});

window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash;
  if (hash) {
    const target = document.querySelector(hash);
    if (target) {
      scrollToSection(hash);
      updateActiveNav(hash);
      return;
    }
  }
  updateActiveNav('#works');
  if (menuButton) {
    menuButton.setAttribute('aria-expanded', 'false');
  }
});
