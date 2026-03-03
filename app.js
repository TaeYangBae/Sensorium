const menuButton = document.querySelector('.menu-toggle');
const menu = document.getElementById('menu');
const revealElements = document.querySelectorAll('.reveal');
const counterElement = document.querySelector('.big-number');
const navLinks = document.querySelectorAll('.menu-link[href^="#"]');
const anchorButtons = document.querySelectorAll('.btn[href^="#"], .hero-actions .btn');
const projects = document.querySelectorAll('.project[data-project]');
const detailPanel = document.getElementById('projectDetail');
const detailBadge = document.getElementById('detailBadge');
const detailTitle = document.getElementById('detailTitle');
const detailDescription = document.getElementById('detailDescription');
const detailClose = document.querySelector('.detail-close');
const detailOverlay = document.getElementById('detailOverlay');
const sections = Array.from(
  document.querySelectorAll('#works, #studio, #journal, #contact').values()
).filter(Boolean);

const workDetails = {
  nightline: {
    badge: 'Immersive Installation',
    title: 'Nightline Pavilion',
    text: '도시 야간 공원 조명 구조물과 음향 센서를 결합해, 관람자가 보행 속도에 따라 사운드와 빛의 패턴이 변하는 경험형 전시를 구현했습니다.',
  },
  pulse: {
    badge: 'Brand Campaign',
    title: 'Pulse 2089',
    text: '브랜드의 내러티브를 12개 모듈로 쪼개고, 스테이지 이벤트와 AR 트리거를 통해 참가자와 브랜드 경험이 연결되는 상호작용형 캠페인을 운영했습니다.',
  },
  urban: {
    badge: 'Space Experience',
    title: 'Urban Echoes',
    text: '도심형 팝업에서 동선 별 동기화 지점을 지정해 사람의 이동 반경별로 미디어월 콘텐츠 강도를 조절하는 몰입형 동선형 공연형 환경을 구성했습니다.',
  },
  liquid: {
    badge: 'Live Performance',
    title: 'Liquid Stage',
    text: '센서 기반 무대 데이터와 음악 빌드를 연동해 조명·음향·그래픽이 실시간으로 반응하는 콘서트 포맷을 제작했으며, 공연 직후까지 동일 경험을 유지하도록 오토모드 폴백도 설계했습니다.',
  },
};

const closeDetail = () => {
  if (!detailPanel || !detailOverlay) return;
  detailPanel.classList.remove('show');
  detailOverlay.classList.remove('show');
  detailPanel.setAttribute('aria-hidden', 'true');
  detailOverlay.setAttribute('aria-hidden', 'true');
};

const openDetail = (id) => {
  const data = workDetails[id];
  if (!data || !detailPanel) return;
  detailBadge.textContent = data.badge;
  detailTitle.textContent = data.title;
  detailDescription.textContent = data.text;
  detailPanel.classList.add('show');
  detailOverlay.classList.add('show');
  detailPanel.setAttribute('aria-hidden', 'false');
  detailOverlay.setAttribute('aria-hidden', 'false');
};

const toggleMenu = () => {
  if (menu) menu.classList.toggle('open');
};

menuButton?.addEventListener('click', (event) => {
  event.preventDefault();
  toggleMenu();
});

menu?.addEventListener('click', (event) => {
  const link = event.target;
  if (!(link instanceof HTMLAnchorElement)) return;
  const href = link.getAttribute('href');
  if (!href || href[0] !== '#') return;

  event.preventDefault();
  scrollToSection(href);
  updateActiveNav(href);
  if (window.innerWidth <= 720) {
    menu.classList.remove('open');
  }
});

anchorButtons.forEach((btn) => {
  const href = btn.getAttribute('href');
  if (!href || href[0] !== '#') return;
  btn.addEventListener('click', (event) => {
    event.preventDefault();
    scrollToSection(href);
  });
});

const animateCounter = (el) => {
  const target = Number(el?.dataset?.count || 0);
  if (!target || Number.isNaN(target)) return;
  const duration = 1200;
  const start = performance.now();

  const step = (time) => {
    const progress = Math.min((time - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(eased * target);
    el.textContent = `${value}`;
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = `${target}`;
    }
  };

  requestAnimationFrame(step);
};

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

for (const item of revealElements) {
  reveal.observe(item);
}

const scrollToSection = (hash) => {
  const target = document.querySelector(hash);
  if (!target) return;
  const headerOffset = document.querySelector('.topbar')?.offsetHeight || 0;
  const y = target.getBoundingClientRect().top + window.scrollY - headerOffset - 12;
  window.scrollTo({
    top: y,
    behavior: 'smooth',
  });
};

const updateActiveNav = (forceId = null) => {
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

window.addEventListener(
  'scroll',
  () => {
    if (!sections.length) return;
    const headerHeight = (document.querySelector('.topbar')?.offsetHeight || 0) + 30;
    let current = sections[0].id;

    for (const section of sections) {
      const top = section.getBoundingClientRect().top;
      if (top <= headerHeight) {
        current = section.id;
      }
    }

    updateActiveNav(`#${current}`);
  },
  { passive: true }
);

projects.forEach((project) => {
  const label = `자세히 보기: ${project.querySelector('h3')?.textContent || ''}`;
  project.setAttribute('tabindex', '0');
  project.setAttribute('role', 'button');
  project.setAttribute('aria-label', label);

  project.addEventListener('click', () => {
    const id = project.dataset.project;
    openDetail(id);
  });

  project.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const id = project.dataset.project;
      openDetail(id);
    }
  });
});

detailClose?.addEventListener('click', closeDetail);
detailOverlay?.addEventListener('click', closeDetail);

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeDetail();
    menu?.classList.remove('open');
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 720) {
    menu?.classList.remove('open');
  }
});

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

const projectsSection = document.querySelector('.cards');
if (projectsSection) {
  projectsSection.style.setProperty('--project-count', projectsSection.children.length);
}

document.addEventListener('DOMContentLoaded', () => {
  updateActiveNav('#works');
});

updateActiveNav('#works');
