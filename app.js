/**
 * APP CONTROLLER · V3 (3D Isometric MapLibre + Three.js + Overlay + Auto Cinema Video)
 */
(function () {
  'use strict';

  const DATA = window.EXPEDITIONS_DATA;
  if (!DATA) return;

  const state = {
    lang: 'en',
    activeCityId: 'stuttgart',
    active3DCityId: 'stuttgart',
    mapView: 'city', // 'country' | 'city'
    activeLandmarkId: null,
    dossierTab: 'story',
    archiveFilter: 'all',
    compareView: 'closeup', // 'closeup' | 'full'
    compareAutoPlay: true,
    compareTimer: null,
    compareInView: false,
    activePlate: 'plate1843a',
    activePersonId: 'p1',
    reelIndex: 0,
    reelTimer: null,
    lightboxList: [],
    lightboxIndex: 0,
    mapInstance: null,
    mapLoaded: false,
    htmlMarkers: []
  };

  /* ------------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------------ */
  function loc(obj, baseKey) {
    if (!obj) return '';
    const map = { ru: 'Ru', ua: 'Ua', de: 'De', en: 'En' };
    const suffix = map[state.lang] || 'En';
    return obj[baseKey + suffix] ?? obj[baseKey + 'En'] ?? obj[baseKey + 'Ru'] ?? obj[baseKey] ?? '';
  }

  function hexToRgba(hex, alpha) {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function getActiveCity() {
    return DATA.cities.find((c) => c.id === state.activeCityId) || DATA.cities[0];
  }

  function getActive3DCity(cityId) {
    const cid = cityId || state.active3DCityId;
    const found = DATA.cities.find((c) => c.id === cid && c.has3DMap);
    return found || DATA.cities.find((c) => c.has3DMap) || DATA.cities[0];
  }

  function getHamburgCity() {
    return DATA.cities.find((c) => c.id === 'hamburg') || DATA.cities[0];
  }

  function getAllArtifacts() {
    const out = [];
    DATA.cities.forEach((c) => {
      if (Array.isArray(c.artifacts)) out.push(...c.artifacts);
    });
    return out;
  }

  function setAccentColor(hex) {
    document.documentElement.style.setProperty('--city-accent', hex);
    document.documentElement.style.setProperty('--city-accent-soft', hexToRgba(hex, 0.1));
  }

  function parseInitialUrl() {
    const params = new URLSearchParams(window.location.search);
    const qLang = params.get('lang');
    if (qLang && ['ru', 'ua', 'de', 'en'].includes(qLang)) {
      state.lang = qLang;
      sessionStorage.setItem('sg_exp_lang', qLang);
    } else {
      const savedLang = sessionStorage.getItem('sg_exp_lang');
      if (savedLang && ['ru', 'ua', 'de', 'en'].includes(savedLang)) {
        state.lang = savedLang;
      }
    }

    const qCity = params.get('city');
    const hashMatch = window.location.hash.match(/city=([a-z]+)/i);
    const candidate = qCity || (hashMatch ? hashMatch[1] : null);
    if (candidate && DATA.cities.some((c) => c.id === candidate)) {
      state.activeCityId = candidate;
    }
  }

  function applyLanguage(lang) {
    if (!['ru', 'ua', 'de', 'en'].includes(lang)) return;
    state.lang = lang;
    sessionStorage.setItem('sg_exp_lang', lang);
    document.querySelectorAll('.lang-btn').forEach((b) => b.classList.toggle('is-active', b.getAttribute('data-lang') === lang));

    renderStaticI18n();
    renderTimeline();
    renderCityCards();
    renderLandmarksDock();
    refreshMapMarkers();
    if (state.activeLandmarkId) renderLandmarkOverlay(state.activeLandmarkId);
    renderDossier();
    renderCompareModule();
    renderHeroReelSlide(state.reelIndex);
    populateTicketCitySelect();
    updateTicketFormSelects();
    updateTicketPreview();
  }

  /* ------------------------------------------------------------------------
     Global I18N Static Bindings
     ------------------------------------------------------------------------ */
  function renderStaticI18n() {
    const tr = DATA.i18n[state.lang];
    document.documentElement.lang = state.lang === 'ua' ? 'uk' : state.lang;

    document.getElementById('top-strip-text').textContent = tr.topStrip;
    document.getElementById('top-strip-right').textContent = tr.topStripRight;
    document.getElementById('brand-author').textContent = DATA.meta.author[state.lang];
    document.getElementById('brand-sub').textContent = DATA.meta.brand[state.lang];

    document.querySelectorAll('[data-nav]').forEach((el) => {
      const key = el.getAttribute('data-nav');
      if (tr.nav[key]) el.textContent = tr.nav[key];
    });

    // Hero
    document.getElementById('hero-eyebrow').textContent = tr.hero.eyebrow;
    document.getElementById('hero-hook').textContent = tr.hero.storyHook;
    document.getElementById('hero-title').textContent = tr.hero.title;
    document.getElementById('hero-subtitle').textContent = tr.hero.subtitle;
    document.getElementById('hero-cta-primary').textContent = tr.hero.ctaPrimary;
    document.getElementById('hero-cta-secondary').textContent = tr.hero.ctaSecondary;
    document.getElementById('hero-badge-title').textContent = tr.hero.badgeTitle;
    document.getElementById('hero-badge-dates').textContent = tr.hero.badgeDates;
    document.getElementById('hero-badge-status').textContent = tr.hero.badgeStatus;
    document.getElementById('triptych-cap-1').textContent = tr.hero.triptych[0];
    document.getElementById('triptych-cap-2').textContent = tr.hero.triptych[1];
    document.getElementById('triptych-cap-3').textContent = tr.hero.triptych[2];

    const mobileHeroMeta = {
      en: {
        reelBadge: 'HAMBURG · FEB 25–28, 2027',
        facts: '№01 STUTTGART (JAN 28–31) · №02 HAMBURG (FEB 25–28) · 4–10 GUESTS',
        stickyCity: 'STUTTGART · JAN 28–31',
        stickySub: '4–10 guests · No payment now',
        stickyBtn: 'Pre-Register →'
      },
      de: {
        reelBadge: 'HAMBURG · 25.–28. FEB 2027',
        facts: '№01 STUTTGART (28.–31. JAN) · №02 HAMBURG (25.–28. FEB) · 4–10 PERS.',
        stickyCity: 'STUTTGART · 28.–31. JAN',
        stickySub: '4–10 Pers. · Unverbindlich',
        stickyBtn: 'Vormerken →'
      },
      ru: {
        reelBadge: 'ГАМБУРГ · 25–28 ФЕВ 2027',
        facts: '№01 ШТУТГАРТ (28–31 ЯНВ) · №02 ГАМБУРГ (25–28 ФЕВ) · 4–10 ЧЕЛ.',
        stickyCity: 'ШТУТГАРТ · 28–31 ЯНВ',
        stickySub: '4–10 чел. · Без оплаты сейчас',
        stickyBtn: 'Предзапись →'
      },
      ua: {
        reelBadge: 'ГАМБУРГ · 25–28 ЛЮТ 2027',
        facts: '№01 ШТУТГАРТ (28–31 СІЧ) · №02 ГАМБУРГ (25–28 ЛЮТ) · 4–10 ОСІБ',
        stickyCity: 'ШТУТГАРТ · 28–31 СІЧ',
        stickySub: '4–10 осіб · Без оплати зараз',
        stickyBtn: 'Передзапис →'
      }
    }[state.lang];

    const reelBadgeEl = document.getElementById('reel-badge-dates');
    const mobileFactsEl = document.getElementById('hero-mobile-facts');
    const stickyCityEl = document.getElementById('sticky-city-label');
    const stickySubEl = document.getElementById('sticky-sub-label');
    const stickyBtnEl = document.getElementById('sticky-cta-btn');
    if (reelBadgeEl) reelBadgeEl.textContent = mobileHeroMeta.reelBadge;
    if (mobileFactsEl) mobileFactsEl.textContent = mobileHeroMeta.facts;
    if (stickyCityEl) stickyCityEl.textContent = mobileHeroMeta.stickyCity;
    if (stickySubEl) stickySubEl.textContent = mobileHeroMeta.stickySub;
    if (stickyBtnEl) stickyBtnEl.textContent = mobileHeroMeta.stickyBtn;

    // Principles
    document.getElementById('principles-eyebrow').textContent = tr.principles.eyebrow;
    document.getElementById('principles-title').textContent = tr.principles.title;
    document.getElementById('principles-grid').innerHTML = tr.principles.items
      .map(
        (item) => `
      <article class="principle-card">
        <span class="principle-card__num">${item.num}</span>
        <h3>${item.head}</h3>
        <p>${item.body}</p>
      </article>`
      )
      .join('');
    document.getElementById('small-format-note').textContent = tr.principles.smallFormatNote;

    // Hub headings & map controls
    document.getElementById('hub-eyebrow').textContent = tr.hub.eyebrow;
    document.getElementById('hub-title').textContent = tr.hub.title;
    document.getElementById('hub-lead').textContent = tr.hub.lead;

    const btnCountryLabels = {
      ru: '← Вся Германия (16 земель)',
      ua: '← Уся Німеччина (16 земель)',
      de: '← Ganz Deutschland (16 Länder)',
      en: '← All Germany (16 States)'
    };
    const btnOrbitLabels = {
      ru: '↻ Ракурс',
      ua: '↻ Ракурс',
      de: '↻ Winkel',
      en: '↻ Orbit'
    };

    document.getElementById('btn-back-country').textContent = btnCountryLabels[state.lang];
    document.getElementById('btn-orbit-3d').textContent = btnOrbitLabels[state.lang];
    updateMap3DButtonsText();
    document.getElementById('board-title').textContent = tr.hub.boardTitle;
    document.getElementById('board-threshold').textContent = tr.hub.boardThreshold;
    document.getElementById('map-meta-label').textContent =
      state.mapView === 'city' ? tr.hub.mapMetaCity : tr.hub.mapMetaCountry;

    // Compare & Unified Live Face Study
    document.getElementById('compare-eyebrow').textContent = tr.compare.eyebrow;
    document.getElementById('compare-title').textContent = tr.compare.title;
    document.getElementById('compare-lead').textContent = tr.compare.lead;

    const cmpControls = {
      en: { closeup: 'Close-Up: 1840 ↔ 1843', full: 'Full Canvas (Pins)', b1840: '1840 · PAINTING', b1843: '1843 · DAGUERREOTYPE' },
      de: { closeup: 'Nahaufnahme: 1840 ↔ 1843', full: 'Gesamtansicht (Pins)', b1840: '1840 · GEMÄLDE', b1843: '1843 · DAGUERREOTYPIE' },
      ru: { closeup: 'Крупный план: 1840 ↔ 1843', full: 'Общий план (пины)', b1840: '1840 · ХОЛСТ', b1843: '1843 · ДАГЕРОТИП' },
      ua: { closeup: 'Великий план: 1840 ↔ 1843', full: 'Загальний план (піни)', b1840: '1840 · ПОЛОТНО', b1843: '1843 · ДАГЕРОТИП' }
    }[state.lang];

    const btnCloseup = document.getElementById('btn-compare-closeup');
    const btnFull = document.getElementById('btn-compare-full');
    const badge1840 = document.getElementById('badge-1840');
    const badge1843 = document.getElementById('badge-1843');
    if (btnCloseup) btnCloseup.textContent = cmpControls.closeup;
    if (btnFull) btnFull.textContent = cmpControls.full;
    if (badge1840) badge1840.textContent = cmpControls.b1840;
    if (badge1843) badge1843.textContent = cmpControls.b1843;
    updateAutoPlayButtonLabel();

    document.getElementById('btn-plate-1843a').textContent = tr.compare.plateButtons.plate1843a;
    document.getElementById('btn-plate-1843b').textContent = tr.compare.plateButtons.plate1843b;
    document.getElementById('btn-plate-1842ruins').textContent = tr.compare.plateButtons.plate1842ruins;
    document.getElementById('caption-1840').textContent = tr.compare.caption1840;
    document.getElementById('compare-disclaimer').textContent = tr.compare.disclaimer;

    // Speaker
    document.getElementById('speaker-eyebrow').textContent = tr.speaker.eyebrow;
    document.getElementById('speaker-name').textContent = tr.speaker.name;
    document.getElementById('speaker-role').textContent = tr.speaker.role;
    document.getElementById('speaker-portrait-cap').textContent = tr.speaker.portraitCap;
    document.getElementById('speaker-bio').innerHTML = tr.speaker.bio.map((p) => `<p>${p}</p>`).join('');
    document.getElementById('speaker-facts').innerHTML = tr.speaker.facts
      .map((f) => `<div><dt>${f.label}</dt><dd>${f.val}</dd></div>`)
      .join('');
    document.getElementById('speaker-pub-btn').textContent = `${tr.speaker.pubBtn} ↗`;
    document.getElementById('video-slot-title').textContent = tr.speaker.videoTitle;
    document.getElementById('video-slot-status').textContent = tr.speaker.videoStatus;
    document.getElementById('lecture-caption').textContent = tr.speaker.lectureCaption;

    // Tariffs & Pre-registration form
    document.getElementById('tariffs-eyebrow').textContent = tr.tariffs.eyebrow;
    document.getElementById('tariffs-title').textContent = tr.tariffs.title;
    document.getElementById('tariffs-grid').innerHTML = tr.tariffs.cards
      .map(
        (card, idx) => `
      <article class="tariff-card ${idx === 0 ? 'tariff-card--featured' : ''}">
        <div>
          <span class="mono-label">${card.tag}</span>
          <h3 class="tariff-card__name">${card.name}</h3>
          <div class="tariff-card__price">${card.priceMain}</div>
          <p class="tariff-card__note">${card.priceNote}</p>
          <ul class="tariff-card__list">
            ${card.features.map((f) => `<li>${f}</li>`).join('')}
          </ul>
        </div>
        <button type="button" class="btn ${idx === 0 ? 'btn--primary' : 'btn--outline'}" data-pick-card="${card.id}">
          ${card.cta}
        </button>
      </article>`
      )
      .join('');
    document.getElementById('tariffs-included-note').textContent = tr.tariffs.includedNote;

    document.getElementById('ticket-title').textContent = tr.tariffs.ticketTitle;
    document.getElementById('ticket-subtitle').textContent = tr.tariffs.ticketSubtitle;
    document.getElementById('tp-reserve-badge').textContent = tr.tariffs.badgeText;
    document.getElementById('lbl-city').textContent = tr.tariffs.form.cityLabel;
    document.getElementById('lbl-seats').textContent = tr.tariffs.form.seatsLabel;
    document.getElementById('lbl-lang').textContent = tr.tariffs.form.langLabel;
    document.getElementById('lbl-name').textContent = tr.tariffs.form.nameLabel;
    document.getElementById('f-name').placeholder = tr.tariffs.form.namePlaceholder;
    document.getElementById('lbl-contact').textContent = tr.tariffs.form.contactLabel;
    document.getElementById('f-contact').placeholder = tr.tariffs.form.contactPlaceholder;
    document.getElementById('lbl-comment').textContent = tr.tariffs.form.commentLabel;
    document.getElementById('f-comment').placeholder = tr.tariffs.form.commentPlaceholder;
    document.getElementById('btn-send-bot').textContent = tr.tariffs.form.sendBotBtn;
    document.getElementById('btn-open-direct').textContent = tr.tariffs.form.openDirectBtn;
    document.getElementById('btn-copy-ticket').textContent = tr.tariffs.form.copyBtn;

    document.getElementById('tp-label-route').textContent = tr.tariffs.ticketLabels.route;
    document.getElementById('tp-label-format').textContent = tr.tariffs.ticketLabels.format;
    document.getElementById('tp-format').textContent = tr.tariffs.ticketLabels.formatValue;
    document.getElementById('tp-label-status').textContent = tr.tariffs.ticketLabels.status;
    document.getElementById('tp-status').textContent = tr.tariffs.ticketLabels.statusValue;
    document.getElementById('tp-label-group').textContent = tr.tariffs.ticketLabels.group;
    document.getElementById('tp-group').textContent = tr.tariffs.ticketLabels.groupValue;
    document.getElementById('tp-label-person').textContent = tr.tariffs.ticketLabels.person;
    document.getElementById('tp-label-msg').textContent = tr.tariffs.ticketLabels.msg;

    // FAQ
    document.getElementById('faq-eyebrow').textContent = tr.faq.eyebrow;
    document.getElementById('faq-title').textContent = tr.faq.title;
    document.getElementById('faq-list').innerHTML = tr.faq.items
      .map(
        (item, idx) => `
      <details class="faq-item" ${idx === 0 ? 'open' : ''}>
        <summary>${item.q}</summary>
        <p>${item.a}</p>
      </details>`
      )
      .join('');

    // Footer
    document.getElementById('footer-legal').textContent = tr.footer.legalNotice;
    document.getElementById('footer-impressum').textContent = tr.footer.impressum;
    document.getElementById('footer-credit').textContent = tr.footer.archiveCredit;
  }

  /* ------------------------------------------------------------------------
     Real 3D Vector Archival Map (MapLibre GL + OpenFreeMap + 16 Bundesländer)
     ------------------------------------------------------------------------ */
  function updateMap3DButtonsText() {
    const city3d = getActive3DCity();
    const isStuttgart = city3d && city3d.id === 'stuttgart';

    const zoomBtn = document.getElementById('btn-zoom-city');
    if (zoomBtn && city3d) {
      zoomBtn.textContent = `${loc(city3d, 'name')} 3D`;
    }

    const zoneLabels = isStuttgart
      ? { ru: 'Резиденция 1738', ua: 'Резиденція 1738', de: 'Residenz 1738', en: 'Altstadt 1738' }
      : { ru: 'Пожар 1842', ua: 'Пожежа 1842', de: 'Brand 1842', en: '1842 Fire' };
    const fireBtn = document.getElementById('btn-toggle-fire');
    if (fireBtn) fireBtn.textContent = zoneLabels[state.lang];

    const legendLabels = isStuttgart
      ? {
          ru: ['Точки Штутгарта (01–08)', 'Резиденция 1738–1848 и маршрут', 'ПКМ / Ctrl + мышь — вращение 3D'],
          ua: ['Точки Штутгарта (01–08)', 'Резиденція 1738–1848 і маршрут', 'ПКМ / Ctrl + миша — обертання 3D'],
          de: ['Stationen Stuttgart (01–08)', 'Residenzstadt 1738–1848 & Route', 'Rechtsklick / Strg — 3D drehen'],
          en: ['Stuttgart Stops (01–08)', 'Residenzstadt 1738–1848 & Route', 'Right-drag / Ctrl — Orbit 3D']
        }[state.lang]
      : {
          ru: ['Точки Гамбурга (01–07)', 'Зона пожара 1842 и маршрут', 'ПКМ / Ctrl + мышь — вращение 3D'],
          ua: ['Точки Гамбурга (01–07)', 'Зона пожежі 1842 і маршрут', 'ПКМ / Ctrl + миша — обертання 3D'],
          de: ['Stationen Hamburg (01–07)', 'Brandgebiet 1842 & Route', 'Rechtsklick / Strg — 3D drehen'],
          en: ['Hamburg Stops (01–07)', '1842 Fire Zone & Route', 'Right-drag / Ctrl — Orbit 3D']
        }[state.lang];

    const la = document.getElementById('legend-active');
    const lf = document.getElementById('legend-forming');
    const lw = document.getElementById('legend-wait');
    if (la) la.textContent = legendLabels[0];
    if (lf) lf.textContent = legendLabels[1];
    if (lw) lw.textContent = legendLabels[2];
  }

  function syncMapToolbarUI(mode, cityId) {
    state.mapView = mode;
    if (cityId && DATA.cities.some((c) => c.id === cityId && c.has3DMap)) {
      state.active3DCityId = cityId;
    }
    const isCity = mode === 'city';
    document.getElementById('btn-back-country').classList.toggle('is-active', !isCity);
    document.getElementById('btn-zoom-city').classList.toggle('is-active', isCity);
    document.getElementById('map-meta-label').textContent = isCity
      ? DATA.i18n[state.lang].hub.mapMetaCity
      : DATA.i18n[state.lang].hub.mapMetaCountry;

    updateMap3DButtonsText();

    const fireBtn = document.getElementById('btn-toggle-fire');
    const orbitBtn = document.getElementById('btn-orbit-3d');
    const dockEl = document.getElementById('hamburg-landmarks-dock');
    if (fireBtn) fireBtn.hidden = !isCity;
    if (orbitBtn) orbitBtn.hidden = !isCity;
    if (dockEl) dockEl.hidden = !isCity;
  }

  function init3DMap() {
    if (!window.HamburgDioramaStage || !window.maplibregl) return;
    const container = document.getElementById('maplibre-canvas');
    if (!container) return;

    const initial3D = DATA.cities.some((c) => c.id === state.activeCityId && c.has3DMap)
      ? state.activeCityId
      : 'stuttgart';
    state.active3DCityId = initial3D;

    state.dioramaStage = new window.HamburgDioramaStage({
      container,
      initialCityId: initial3D,
      getLandmarksData: (cityId) => {
        const c = getActive3DCity(cityId);
        return (c && c.cityMap && c.cityMap.landmarks) || [];
      },
      getCitiesData: () => DATA.cities || [],
      getLang: () => state.lang,
      loc: (obj, key) => loc(obj, key),
      onModeChange: (mode, cityId) => {
        syncMapToolbarUI(mode, cityId);
      },
      onSelectLandmark: (landmarkId, openOverlay) => {
        const c3d = getActive3DCity();
        state.activeCityId = c3d.id;
        state.activeLandmarkId = landmarkId;
        syncMapToolbarUI('city', c3d.id);
        renderLandmarksDock();
        if (openOverlay) {
          renderLandmarkOverlay(landmarkId);
        }
      },
      onSelectCityFromCountry: (cityId) => {
        selectCity(cityId, { syncForm: true, flyToCity: false, scrollTab: true });
      }
    });
    state.mapLoaded = true;
    syncMapToolbarUI('city', initial3D);
  }

  function refreshMapMarkers() {
    if (!state.dioramaStage) return;
    state.dioramaStage.buildLandmarkHTMLPins();
    state.dioramaStage.renderLockedCountryMap();
  }

  function flyToGermanyMacro() {
    closeLandmarkOverlay();
    syncMapToolbarUI('country');
    if (state.dioramaStage) {
      state.dioramaStage.whooshToCountry();
    }
  }

  function flyToCity3D(cityId) {
    const target = getActive3DCity(cityId);
    state.activeCityId = target.id;
    state.active3DCityId = target.id;
    closeLandmarkOverlay();
    syncMapToolbarUI('city', target.id);
    renderLandmarksDock();
    if (state.dioramaStage) {
      state.dioramaStage.whooshToCity(target.id);
    }
  }

  function flyToHamburg3D() {
    flyToCity3D('hamburg');
  }

  function focusLandmark3D(landmarkId, openOverlay = true) {
    const city3d = getActive3DCity();
    const landmarks = (city3d && city3d.cityMap && city3d.cityMap.landmarks) || [];
    const lm = landmarks.find((l) => l.id === landmarkId) || landmarks[0];
    if (!lm) return;

    state.activeCityId = city3d.id;
    state.activeLandmarkId = lm.id;
    syncMapToolbarUI('city', city3d.id);
    renderLandmarksDock();

    if (state.dioramaStage) {
      state.dioramaStage.focusLandmark(lm.id);
    }

    if (openOverlay) {
      renderLandmarkOverlay(lm.id);
    }
  }

  function renderLandmarksDock() {
    const dock = document.getElementById('hamburg-landmarks-dock');
    if (!dock) return;
    const city3d = getActive3DCity();
    const landmarks = (city3d && city3d.cityMap && city3d.cityMap.landmarks) || [];
    const shortMap = window.HAMBURG_SHORT_LANDMARK_NAMES || {};

    dock.innerHTML = landmarks
      .map((lm) => {
        const isActive = lm.id === state.activeLandmarkId;
        const shortName =
          (shortMap[lm.id] && shortMap[lm.id][state.lang]) ||
          loc(lm, 'name').split('(')[0].trim();
        return `
        <button type="button" class="dock-chip ${isActive ? 'is-active' : ''}" data-dock-landmark="${lm.id}">
          <span>${lm.num}</span> ${shortName}
        </button>`;
      })
      .join('');
  }

  function renderLandmarkOverlay(landmarkId) {
    const city3d = getActive3DCity();
    const landmarks = (city3d && city3d.cityMap && city3d.cityMap.landmarks) || [];
    const lm = landmarks.find((l) => l.id === landmarkId);
    const overlay = document.getElementById('map-landmark-overlay');
    if (!lm || !overlay) return;

    const secTitles = {
      ru: ['Архитектура и история места', 'Философская практика на месте', 'Ключевые артефакты локации'],
      ua: ['Архітектура та історія місця', 'Філософська практика на місці', 'Ключові артефакти локації'],
      de: ['Architektur & Ortsgeschichte', 'Philosophische Praxis vor Ort', 'Zentrale Artefakte'],
      en: ['Architecture & Site History', 'On-Site Philosophical Practice', 'Key Site Artifacts']
    }[state.lang];

    document.getElementById('ov-day').textContent = `${lm.num} · ${loc(lm, 'day').toUpperCase()}`;
    document.getElementById('map-overlay-body').innerHTML = `
      <div class="map-overlay__hero">
        <img src="${lm.img}" alt="${loc(lm, 'name')}" data-lightbox-src="${lm.img}" />
        <div>
          <h4 class="map-overlay__title">${loc(lm, 'name')}</h4>
          <span class="map-overlay__addr">${lm.address || ''}</span>
        </div>
      </div>
      <div class="map-overlay__section">
        <h5>${secTitles[0]}</h5>
        <p>${loc(lm, 'history') || loc(lm, 'concept')}</p>
      </div>
      <div class="map-overlay__section">
        <h5>${secTitles[1]}</h5>
        <p>${loc(lm, 'practice') || loc(lm, 'concept')}</p>
      </div>
      <div class="map-overlay__artifacts">
        <strong>${secTitles[2]}:</strong><br/>
        ${loc(lm, 'artifacts') || ''}
      </div>`;

    overlay.hidden = false;
  }

  function closeLandmarkOverlay() {
    const overlay = document.getElementById('map-landmark-overlay');
    if (overlay) overlay.hidden = true;
    state.activeLandmarkId = null;
    if (state.dioramaStage && state.dioramaStage.setActiveLandmarkPin) {
      state.dioramaStage.setActiveLandmarkPin(null);
      if (state.dioramaStage.resetOverlayPadding) {
        state.dioramaStage.resetOverlayPadding();
      }
    }
    renderLandmarksDock();
  }

  function stepLandmarkOverlay(delta) {
    const city3d = getActive3DCity();
    const landmarks = (city3d && city3d.cityMap && city3d.cityMap.landmarks) || [];
    if (!landmarks.length) return;
    const curIdx = landmarks.findIndex((l) => l.id === state.activeLandmarkId);
    const nextIdx = ((curIdx === -1 ? 0 : curIdx) + delta + landmarks.length) % landmarks.length;
    focusLandmark3D(landmarks[nextIdx].id, true);
  }

  /* ------------------------------------------------------------------------
     Hub Timeline & City Departure Board
     ------------------------------------------------------------------------ */
  function renderTimeline() {
    const tr = DATA.i18n[state.lang];
    const rail = document.getElementById('timeline-rail');

    rail.innerHTML = tr.hub.months
      .map((m) => {
        const city = m.cityId ? DATA.cities.find((c) => c.id === m.cityId) : null;
        const isActive = city && city.id === state.activeCityId;
        return `
        <button type="button"
          class="month-cell ${city ? 'has-city' : ''} ${isActive ? 'is-active' : ''}"
          ${city ? `data-select-city="${city.id}"` : 'disabled'}>
          <span class="month-cell__name">${m.label}</span>
          <span class="month-cell__year">${m.year}</span>
          ${city ? `<span class="month-cell__city">${loc(city, 'name')}</span>` : ''}
        </button>`;
      })
      .join('');
  }

  function getCityShortMonth(cityId) {
    const months = {
      stuttgart: { en: 'Jan', de: 'Jan', ru: 'Янв', ua: 'Січ' },
      hamburg: { en: 'Feb', de: 'Feb', ru: 'Фев', ua: 'Лют' },
      dresden: { en: 'Mar', de: 'Mär', ru: 'Мар', ua: 'Бер' },
      berlin: { en: 'Apr', de: 'Apr', ru: 'Апр', ua: 'Кві' },
      frankfurt: { en: 'May', de: 'Mai', ru: 'Май', ua: 'Тра' },
      munich: { en: 'Jun', de: 'Jun', ru: 'Июн', ua: 'Чер' }
    };
    return (months[cityId] && months[cityId][state.lang]) || '';
  }

  function renderMobileCityTabs(scrollIntoView = false) {
    const tabsEl = document.getElementById('mobile-city-tabs');
    if (!tabsEl) return;

    tabsEl.innerHTML = DATA.cities
      .map((city) => {
        const isActive = city.id === state.activeCityId;
        const mon = getCityShortMonth(city.id);
        return `
        <button type="button"
          role="tab"
          aria-selected="${isActive ? 'true' : 'false'}"
          class="mobile-city-tab ${isActive ? 'is-active' : ''}"
          style="--tab-accent: ${city.accentColor}"
          data-select-city="${city.id}">
          <span class="mobile-city-tab__num">${city.issueNo}</span>
          <span class="mobile-city-tab__name">${loc(city, 'name')}</span>
          <span class="mobile-city-tab__mon">${mon}</span>
        </button>`;
      })
      .join('');

    if (scrollIntoView) {
      const activeBtn = tabsEl.querySelector('.mobile-city-tab.is-active');
      if (activeBtn && typeof activeBtn.scrollIntoView === 'function') {
        activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }

  function renderMobileActiveCityCard() {
    const wrap = document.getElementById('mobile-active-city');
    if (!wrap) return;
    const city = getActiveCity();
    if (!city) return;

    const statusClass =
      city.status === 'active' ? 'is-active-status' : city.status === 'forming' ? 'is-forming-status' : '';

    const labels = {
      en: { program: city.isLabStub ? 'Preview Concept ↓' : 'View Program ↓', reserve: 'Pre-Register →' },
      de: { program: city.isLabStub ? 'Konzept ansehen ↓' : 'Programm ↓', reserve: 'Vormerken →' },
      ru: { program: city.isLabStub ? 'Смотреть концепт ↓' : 'Программа ↓', reserve: 'Предзапись →' },
      ua: { program: city.isLabStub ? 'Дивитись концепт ↓' : 'Програма ↓', reserve: 'Передзапис →' }
    }[state.lang];

    wrap.innerHTML = `
      <article class="mobile-active-card" style="--card-accent: ${city.accentColor}">
        <div class="mobile-active-card__head">
          <span class="mono-label mobile-active-card__issue">№${city.issueNo} · ${loc(city, 'dates')}</span>
          <span class="city-card__status ${statusClass}">${loc(city, 'statusLabel')}</span>
        </div>
        <h3 class="mobile-active-card__title">${loc(city, 'name')}: ${loc(city, 'title')}</h3>
        <p class="mobile-active-card__sub">${loc(city, 'subtitle')}</p>
        <div class="mobile-active-card__actions">
          <a href="#dossier" class="btn btn--outline mobile-active-card__btn" data-scroll-dossier>${labels.program}</a>
          <button type="button" class="btn btn--primary mobile-active-card__btn" data-prefill-city="${city.id}">${labels.reserve}</button>
        </div>
      </article>`;
  }

  function updateMobileStickyCta() {
    const city = getActiveCity();
    const stickyCityEl = document.getElementById('sticky-city-label');
    const stickyBtnEl = document.getElementById('sticky-cta-btn');
    if (!city) return;
    if (stickyCityEl) {
      const shortDate = loc(city, 'dates').split('(')[0].replace(/2027/g, '').replace(/,\s*$/, '').trim();
      stickyCityEl.textContent = `${loc(city, 'name').toUpperCase()} · ${shortDate.toUpperCase()}`;
    }
    if (stickyBtnEl) {
      stickyBtnEl.setAttribute('data-prefill-city', city.id);
    }
  }

  function renderCityCards() {
    const container = document.getElementById('city-cards');
    container.innerHTML = DATA.cities
      .map((city) => {
        const isActive = city.id === state.activeCityId;
        const statusClass =
          city.status === 'active' ? 'is-active-status' : city.status === 'forming' ? 'is-forming-status' : '';

        return `
        <button type="button"
          class="city-card ${isActive ? 'is-active' : ''}"
          style="--card-accent: ${city.accentColor}"
          data-select-city="${city.id}">
          <span class="city-card__issue">№${city.issueNo}</span>
          <div>
            <div class="city-card__top">
              <strong class="city-card__name">${loc(city, 'name')}</strong>
              <span class="city-card__dates">${loc(city, 'dates')}</span>
            </div>
            <p class="city-card__theme">${loc(city, 'title')}</p>
            <span class="city-card__status ${statusClass}">${loc(city, 'statusLabel')}</span>
          </div>
          <span class="city-card__arrow" aria-hidden="true">→</span>
        </button>`;
      })
      .join('');

    renderMobileCityTabs(false);
    renderMobileActiveCityCard();
    updateMobileStickyCta();
  }

  /* ------------------------------------------------------------------------
     Dynamic City Dossier
     ------------------------------------------------------------------------ */
  function renderDossier() {
    const city = getActiveCity();
    const tr = DATA.i18n[state.lang].dossier;
    const shell = document.getElementById('dossier-shell');

    const headerHtml = `
      <div class="dossier-header">
        <div>
          <div class="dossier-header__meta">
            <span class="mono-label">DOSSIER №${city.issueNo} · ${city.coords}</span>
            <span class="mono-label stamp-pill">${loc(city, 'statusLabel')}</span>
          </div>
          <h2 class="dossier-title">${loc(city, 'name')}: ${loc(city, 'title')}</h2>
          <p class="dossier-subtitle">${loc(city, 'subtitle')}</p>
        </div>
        <div>
          <div class="mono-label" style="margin-bottom:8px;">${loc(city, 'dates')}</div>
          <button type="button" class="btn btn--primary" data-prefill-city="${city.id}">
            ${city.isLabStub ? tr.labAction : DATA.i18n[state.lang].hub.reserveBtn}
          </button>
        </div>
      </div>`;

    if (city.isLabStub) {
      shell.innerHTML = `
        ${headerHtml}
        <div class="lab-panel">
          <div class="lab-stage-banner">
            <div>
              <span class="eyebrow" style="margin-bottom:4px;">${tr.labLabel}</span>
              <p style="margin:0; font-weight:500;">${loc(city, 'labStage')}</p>
            </div>
            <span class="mono-label">${loc(city, 'region')}</span>
          </div>
          <h3 style="font-family:var(--font-display); font-size:1.7rem; margin:0 0 18px;">${tr.labCluesTitle}</h3>
          <div class="lab-clues-grid">
            ${city.labClues
              .map(
                (clue) => `
              <article class="lab-clue-card">
                <span class="mono-label">${clue.code}</span>
                <h4>${loc(clue, 'title')}</h4>
                <p>${loc(clue, 'desc')}</p>
              </article>`
              )
              .join('')}
          </div>
          <button type="button" class="btn btn--outline" data-prefill-city="${city.id}">
            ${tr.labAction}
          </button>
        </div>`;
      return;
    }

    const storyTabLabel = (city.dossierTabs && loc(city.dossierTabs, 'story')) || tr.tabs.story;
    const scheduleTabLabel = (city.dossierTabs && loc(city.dossierTabs, 'schedule')) || tr.tabs.schedule;
    const archiveTabLabel = (city.dossierTabs && loc(city.dossierTabs, 'archive')) || tr.tabs.archive;

    const tabsHtml = `
      <div class="dossier-tabs" role="tablist">
        <button type="button" class="dossier-tab ${state.dossierTab === 'story' ? 'is-active' : ''}" data-dossier-tab="story">
          📖 ${storyTabLabel}
        </button>
        <button type="button" class="dossier-tab ${state.dossierTab === 'schedule' ? 'is-active' : ''}" data-dossier-tab="schedule">
          🗓 ${scheduleTabLabel}
        </button>
        <button type="button" class="dossier-tab ${state.dossierTab === 'archive' ? 'is-active' : ''}" data-dossier-tab="archive">
          🖼 ${archiveTabLabel}
        </button>
      </div>`;

    let bodyHtml = '';
    if (state.dossierTab === 'story') {
      bodyHtml = `
        <div class="acts-container">
          ${city.acts
            .map((act, idx) => {
              const paras = loc(act, 'paragraphs') || act.paragraphsRu;
              return `
              <article class="act-block act-block--${act.tone} ${idx === 0 ? 'is-expanded' : ''}" data-mobile-accordion>
                <div class="act-text">
                  <button type="button" class="mobile-acc-head" data-toggle-acc aria-expanded="${idx === 0 ? 'true' : 'false'}">
                    <span class="act-num">${loc(act, 'num') || act.num}</span>
                    <span class="act-title">${loc(act, 'title')}</span>
                    <span class="mobile-acc-chevron" aria-hidden="true"></span>
                  </button>
                  <div class="mobile-acc-body">
                    ${paras.map((p) => `<p>${p}</p>`).join('')}
                    <div class="act-museum-plate">${loc(act, 'museumPlate')}</div>
                  </div>
                </div>
                <figure class="act-figure mobile-acc-body" data-lightbox-src="${act.image}">
                  <img src="${act.image}" alt="${loc(act, 'imageCaption')}" loading="lazy" />
                  <figcaption>${loc(act, 'imageCaption')}</figcaption>
                </figure>
              </article>`;
            })
            .join('')}
        </div>`;
    } else if (state.dossierTab === 'schedule') {
      const dayMetaBadge = {
        en: '4–10 PARTICIPANTS · HOTEL + CONFERENCE HALL',
        de: '4–10 TEILNEHMENDE · HOTEL + KONFERENZRAUM',
        ru: '4–10 УЧАСТНИКОВ · ОТЕЛЬ + КОНФЕРЕНЦ-ЗАЛ',
        ua: '4–10 УЧАСНИКІВ · ГОТЕЛЬ + КОНФЕРЕНЦ-ЗАЛ'
      }[state.lang];

      bodyHtml = `
        <div class="schedule-panel">
          <div class="weekend-callout">${tr.scheduleNotice}</div>
          <div class="days-grid">
            ${city.days
              .map((day, idx) => {
                const slotLabels =
                  day.dayNum === 1
                    ? {
                        ru: ['УТРО · ЛОГИСТИКА', 'ДЕНЬ · ЗАСЕЛЕНИЕ В ЕДИНЫЙ ОТЕЛЬ', 'ВЕЧЕР · ЗНАКОМСТВО И УЖИН'],
                        ua: ['РАНОК · ЛОГІСТИКА', 'ДЕНЬ · ПОСЕЛЕННЯ В ЄДИНИЙ ГОТЕЛЬ', 'ВЕЧІР · ЗНАЙОМСТВО І ВЕЧЕРЯ'],
                        de: ['MORGEN · ANREISE', 'TAG · GEMEINSAMER CHECK-IN', 'ABEND · KENNENLERN-DINNER'],
                        en: ['MORNING · ARRIVAL', 'AFTERNOON · UNIFIED HOTEL CHECK-IN', 'EVENING · WELCOME DINNER']
                      }[state.lang]
                    : day.dayNum === 4
                    ? {
                        ru: ['УТРО · ФИНАЛЬНАЯ ЛЕКЦИЯ В ЗАЛЕ', 'ДЕНЬ · ВЫСЕЛЕНИЕ И ОТЪЕЗД', 'ПОСЛЕ · АРХИВ И ИСТОЧНИКИ'],
                        ua: ['РАНОК · ФІНАЛЬНА ЛЕКЦІЯ В ЗАЛІ', 'ДЕНЬ · ВИСЕЛЕННЯ І ВІД’ЇЗД', 'ПІСЛЯ · АРХИВ І ДЖЕРЕЛА'],
                        de: ['MORGEN · ABSCHLUSSVORLESUNG', 'TAG · CHECK-OUT & ABREISE', 'DANACH · LITERATUR & NOTIZEN'],
                        en: ['MORNING · CLOSING LECTURE', 'AFTERNOON · CHECK-OUT & DEPARTURE', 'FOLLOW-UP · ARCHIVE & READING LIST']
                      }[state.lang]
                    : [tr.blocks.morning, tr.blocks.afternoon, tr.blocks.evening];

                return `
              <article class="day-card ${idx === 0 ? 'is-expanded' : ''}" data-mobile-accordion>
                <button type="button" class="day-card__trigger" data-toggle-acc aria-expanded="${idx === 0 ? 'true' : 'false'}">
                  <div class="day-card__top">
                    <span class="mono-label">${loc(day, 'weekday')}</span>
                    <span class="mono-label day-card__meta">${dayMetaBadge}</span>
                  </div>
                  <div class="day-card__title-row">
                    <h3 class="day-card__title">${loc(day, 'title')}</h3>
                    <span class="mobile-acc-chevron" aria-hidden="true"></span>
                  </div>
                </button>
                <div class="mobile-acc-body">
                  <p class="day-card__lead">${loc(day, 'lead')}</p>
                  <div class="day-slots">
                    <div class="day-slot">
                      <h4>${slotLabels[0]}</h4>
                      <p>${loc(day, 'morning')}</p>
                    </div>
                    <div class="day-slot">
                      <h4>${slotLabels[1]}</h4>
                      <p>${loc(day, 'afternoon')}</p>
                    </div>
                    <div class="day-slot">
                      <h4>${slotLabels[2]}</h4>
                      <p>${loc(day, 'evening')}</p>
                    </div>
                  </div>
                </div>
              </article>`;
              })
              .join('')}
          </div>
        </div>`;
    } else {
      const items = city.artifacts.filter((a) => (state.archiveFilter === 'all' ? true : a.category === state.archiveFilter));
      const filterDefs = city.archiveFilters
        ? Object.keys(city.archiveFilters).map((k) => ({ key: k, label: city.archiveFilters[k][state.lang] || city.archiveFilters[k].en }))
        : [
            { key: 'all', label: tr.archiveFilters.all },
            { key: 'pre', label: tr.archiveFilters.pre },
            { key: 'fire', label: tr.archiveFilters.fire },
            { key: 'daguerre', label: tr.archiveFilters.daguerre }
          ];
      bodyHtml = `
        <div class="archive-panel">
          <div class="archive-filters">
            ${filterDefs
              .map(
                (f) => `<button type="button" class="pill-btn ${state.archiveFilter === f.key ? 'is-active' : ''}" data-archive-filter="${f.key}">${f.label}</button>`
              )
              .join('')}
          </div>
          <div class="artifacts-grid">
            ${items
              .map(
                (art) => `
              <figure class="artifact-card" data-lightbox-id="${art.id}">
                <img src="${art.src}" alt="${loc(art, 'title')}" loading="lazy" />
                <div class="artifact-card__body">
                  <span class="mono-label">${art.dayRef} · ${art.year}</span>
                  <figcaption class="artifact-card__title">${loc(art, 'title')}</figcaption>
                  <span class="mono-label">${loc(art, 'author')}</span>
                  <p class="artifact-card__note">${loc(art, 'note')}</p>
                </div>
              </figure>`
              )
              .join('')}
          </div>
        </div>`;
    }

    shell.innerHTML = headerHtml + tabsHtml + bodyHtml;
  }

  /* ------------------------------------------------------------------------
     Mobile Hero Live Montage (Variant A: 1840 -> 1842 -> 1843)
     ------------------------------------------------------------------------ */
  const REEL_YEARS = ['1840', '1842', '1843'];

  function renderHeroReelSlide(index) {
    const reel = document.getElementById('hero-mobile-reel');
    if (!reel) return;
    const tr = DATA.i18n[state.lang].hero;
    const idx = ((index % 3) + 3) % 3;
    state.reelIndex = idx;

    reel.querySelectorAll('.hero-reel__slide').forEach((img, i) => {
      img.classList.toggle('is-active', i === idx);
    });
    reel.querySelectorAll('.hero-reel__bar').forEach((bar, i) => {
      bar.classList.toggle('is-active', i === idx);
      bar.classList.toggle('is-done', i < idx);
    });

    const yearEl = document.getElementById('reel-year');
    const capEl = document.getElementById('reel-cap');
    if (yearEl) yearEl.textContent = REEL_YEARS[idx];
    if (capEl) capEl.textContent = tr.triptych[idx] || '';
  }

  function startHeroReelLoop() {
    if (state.reelTimer) clearInterval(state.reelTimer);
    renderHeroReelSlide(state.reelIndex);
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    state.reelTimer = setInterval(() => {
      renderHeroReelSlide(state.reelIndex + 1);
    }, 3400);
  }

  /* ------------------------------------------------------------------------
     Mobile Sticky CTA Bar (Appears after Hero, hides at Registration Form)
     ------------------------------------------------------------------------ */
  function initMobileStickyCta() {
    const bar = document.getElementById('mobile-sticky-cta');
    const hero = document.getElementById('hero-section');
    const ticket = document.getElementById('ticket-section');
    if (!bar || !hero || !ticket || !('IntersectionObserver' in window)) return;

    let heroVisible = true;
    let ticketVisible = false;

    const syncBar = () => {
      const show = !heroVisible && !ticketVisible;
      bar.classList.toggle('is-visible', show);
      bar.setAttribute('aria-hidden', String(!show));
    };

    const heroObs = new IntersectionObserver(
      (entries) => {
        heroVisible = entries[0].isIntersecting;
        syncBar();
      },
      { threshold: 0 }
    );
    const ticketObs = new IntersectionObserver(
      (entries) => {
        ticketVisible = entries[0].isIntersecting;
        syncBar();
      },
      { threshold: 0.05 }
    );
    heroObs.observe(hero);
    ticketObs.observe(ticket);
  }

  /* ------------------------------------------------------------------------
     Unified Synchronized 1840 <-> 1843 Face Study & Auto-Tour
     ------------------------------------------------------------------------ */
  function updateAutoPlayButtonLabel() {
    const btn = document.getElementById('btn-compare-autoplay');
    if (!btn) return;
    const labels = {
      en: state.compareAutoPlay ? '⏸ Auto-Tour' : '▶ Play Tour',
      de: state.compareAutoPlay ? '⏸ Auto-Tour' : '▶ Tour starten',
      ru: state.compareAutoPlay ? '⏸ Авто-обход' : '▶ Кино-обход',
      ua: state.compareAutoPlay ? '⏸ Авто-огляд' : '▶ Кіно-огляд'
    }[state.lang];
    btn.textContent = labels;
    btn.classList.toggle('is-active', state.compareAutoPlay);
    btn.setAttribute('aria-pressed', String(state.compareAutoPlay));
  }

  function applyCompareZoom() {
    const fc = DATA.faceComparison;
    const person = fc.persons.find((p) => p.id === state.activePersonId) || fc.persons[1];
    const img1840 = document.getElementById('compare-1840-img');
    const img1843 = document.getElementById('compare-1843-img');
    const wrap = document.getElementById('compare-pins-view');
    if (!img1840 || !img1843 || !wrap) return;

    const canZoomPair = state.compareView === 'closeup' && person && person.onCanvas;
    wrap.classList.toggle('is-closeup', state.compareView === 'closeup');
    wrap.classList.toggle('is-full-canvas', state.compareView === 'full');

    if (canZoomPair) {
      const scale = 2.55;
      const tx40 = Math.max(-30, Math.min(30, 50 - person.face1840.x));
      const ty40 = Math.max(-28, Math.min(28, 50 - person.face1840.y));
      img1840.style.transform = `scale(${scale}) translate(${tx40}%, ${ty40}%)`;

      if (state.activePlate === 'plate1843a') {
        const tx43 = Math.max(-30, Math.min(30, 50 - person.face1843.x));
        const ty43 = Math.max(-28, Math.min(28, 50 - person.face1843.y));
        img1843.style.transform = `scale(${scale}) translate(${tx43}%, ${ty43}%)`;
      } else {
        img1843.style.transform = 'scale(1) translate(0%, 0%)';
      }
    } else {
      img1840.style.transform = 'scale(1) translate(0%, 0%)';
      img1843.style.transform = 'scale(1) translate(0%, 0%)';
    }

    document.querySelectorAll('[data-compare-view]').forEach((b) => {
      b.classList.toggle('is-active', b.getAttribute('data-compare-view') === state.compareView);
    });
  }

  function renderCompareModule() {
    const fc = DATA.faceComparison;
    const tr = DATA.i18n[state.lang].compare;

    const img1843 = document.getElementById('compare-1843-img');
    const cap1843 = document.getElementById('caption-1843');
    const hotspots1843 = document.getElementById('hotspots-1843');
    const hotspots1840 = document.getElementById('hotspots-1840');

    const plateMap = {
      plate1843a: fc.daguerreotype1843a,
      plate1843b: fc.daguerreotype1843b,
      plate1842ruins: fc.daguerreotype1842ruins
    };
    img1843.src = plateMap[state.activePlate] || fc.daguerreotype1843a;
    if (state.activePlate === 'plate1843a') {
      cap1843.textContent = tr.caption1843;
      hotspots1843.style.display = '';
    } else if (state.activePlate === 'plate1843b') {
      cap1843.textContent = tr.plateButtons.plate1843b;
      hotspots1843.style.display = 'none';
    } else {
      cap1843.textContent = tr.plateButtons.plate1842ruins;
      hotspots1843.style.display = 'none';
    }

    document.querySelectorAll('[data-plate]').forEach((btn) => {
      btn.classList.toggle('is-active', btn.getAttribute('data-plate') === state.activePlate);
    });

    const canvasPersons = fc.persons.filter((p) => p.onCanvas);

    hotspots1840.innerHTML = canvasPersons
      .map(
        (p) => `
      <div class="face-focus-ring ${p.id === state.activePersonId ? 'is-active' : ''}"
        style="left:${p.face1840.x}%; top:${p.face1840.y}%;"
        data-face-ring="${p.id}"></div>
      <button type="button"
        class="hotspot-pin ${p.id === state.activePersonId ? 'is-active' : ''}"
        style="left:${p.badge1840.x}%; top:${p.badge1840.y}%;"
        data-person-id="${p.id}"
        title="${loc(p, 'name')}">
        ${p.num}
      </button>`
      )
      .join('');

    hotspots1843.innerHTML = canvasPersons
      .map(
        (p) => `
      <div class="face-focus-ring ${p.id === state.activePersonId ? 'is-active' : ''}"
        style="left:${p.face1843.x}%; top:${p.face1843.y}%;"
        data-face-ring="${p.id}"></div>
      <button type="button"
        class="hotspot-pin ${p.id === state.activePersonId ? 'is-active' : ''}"
        style="left:${p.badge1843.x}%; top:${p.badge1843.y}%;"
        data-person-id="${p.id}"
        title="${loc(p, 'name')}">
        ${p.num}
      </button>`
      )
      .join('');

    document.getElementById('person-selector').innerHTML = fc.persons
      .map(
        (p) => `
      <button type="button"
        class="hero-chip ${p.id === state.activePersonId ? 'is-active' : ''}"
        data-person-id="${p.id}">
        <span>${p.num}</span> ${loc(p, 'name')}
      </button>`
      )
      .join('');

    updateActivePersonUI();
  }

  function updateActivePersonUI() {
    const fc = DATA.faceComparison;
    document.querySelectorAll('[data-person-id]').forEach((el) => {
      el.classList.toggle('is-active', el.getAttribute('data-person-id') === state.activePersonId);
    });
    document.querySelectorAll('[data-face-ring]').forEach((el) => {
      el.classList.toggle('is-active', el.getAttribute('data-face-ring') === state.activePersonId);
    });

    const person = fc.persons.find((p) => p.id === state.activePersonId) || fc.persons[1];
    const lbl1840 = { ru: '1840 · КИСТЬ ГЮНТЕРА ГЕНСЛЕРА', ua: '1840 · ПЕНЗЕЛЬ ГЕНСЛЕРА', de: '1840 · GEMÄLDE GENSLER', en: '1840 · GENSLER PAINTING' }[state.lang];
    const lbl1843 = { ru: '6 МАЯ 1843 · СЕРЕБРО ДАГЕРОТИПА', ua: '6 ТРАВНЯ 1843 · СРІБЛО', de: '6. MAI 1843 · DAGUERREOTYPIE', en: 'MAY 6, 1843 · DAGUERREOTYPE' }[state.lang];
    const lblWorks = { ru: 'Основные работы и артефакты маршрута', ua: 'Основні роботи та артефакти', de: 'Hauptwerke & Exponate', en: 'Major Works & Artifacts' }[state.lang];

    document.getElementById('person-dossier').innerHTML = `
      <div class="person-dossier__head">
        <h3>${person.num}. ${loc(person, 'name')} <small class="mono-label">(${person.years})</small></h3>
        <span class="mono-label">${loc(person, 'role')}</span>
      </div>
      <p class="person-bio-text">${loc(person, 'bio')}</p>
      <blockquote class="trial-excerpt">${loc(person, 'trialExcerpt')}</blockquote>
      <div class="person-dossier__cols">
        <div class="person-dossier__col">
          <h4>${lbl1840}</h4>
          <p>${loc(person, 'desc1840')}</p>
        </div>
        <div class="person-dossier__col">
          <h4>${lbl1843}</h4>
          <p>${loc(person, 'desc1843')}</p>
        </div>
      </div>
      <div class="person-works-wrap">
        <h4>${lblWorks}</h4>
        <div class="person-works-grid">
          ${person.works
            .map(
              (w) => `
            <div class="work-chip">
              <img src="${w.thumb}" alt="${w.title}" loading="lazy" />
              <div>
                <strong>${w.title}</strong>
                <small>${w.museum}</small>
              </div>
            </div>`
            )
            .join('')}
        </div>
      </div>`;

    applyCompareZoom();
  }

  function startCompareAutoTour() {
    stopCompareAutoTour();
    if (!state.compareAutoPlay || !state.compareInView) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvasIds = DATA.faceComparison.persons.filter((p) => p.onCanvas).map((p) => p.id);
    if (!canvasIds.length) return;

    state.compareTimer = setInterval(() => {
      if (!state.compareAutoPlay || !state.compareInView) return;
      const cur = canvasIds.indexOf(state.activePersonId);
      const next = canvasIds[(cur + 1) % canvasIds.length];
      state.activePersonId = next;
      state.activePlate = 'plate1843a';
      updateActivePersonUI();
    }, 3800);
  }

  function stopCompareAutoTour() {
    if (state.compareTimer) {
      clearInterval(state.compareTimer);
      state.compareTimer = null;
    }
  }

  function initCompareObserver() {
    const sec = document.getElementById('compare');
    if (!sec || !('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          state.compareInView = entry.isIntersecting;
          if (state.compareInView && state.compareAutoPlay) {
            startCompareAutoTour();
          } else {
            stopCompareAutoTour();
          }
        });
      },
      { threshold: 0.2 }
    );
    obs.observe(sec);
  }

  /* ------------------------------------------------------------------------
     Fahrkarte Pre-Registration Form & Telegram Bot Delivery
     ------------------------------------------------------------------------ */
  function populateTicketCitySelect() {
    const select = document.getElementById('f-city');
    const prev = select.value || state.activeCityId;
    select.innerHTML = DATA.cities
      .map((c) => `<option value="${c.id}">${loc(c, 'name')} · ${loc(c, 'dates')}</option>`)
      .join('');
    select.value = DATA.cities.some((c) => c.id === prev) ? prev : state.activeCityId;
  }

  function updateTicketFormSelects() {
    const seatsSel = document.getElementById('f-seats');
    const val = seatsSel.value || '1';
    const labels = {
      ru: ['1 место', '2 места', '3–4 места'],
      ua: ['1 місце', '2 місця', '3–4 місця'],
      de: ['1 Platz', '2 Plätze', '3–4 Plätze'],
      en: ['1 seat', '2 seats', '3–4 seats']
    }[state.lang];
    seatsSel.options[0].textContent = labels[0];
    seatsSel.options[1].textContent = labels[1];
    seatsSel.options[2].textContent = labels[2];
    seatsSel.value = val;
  }

  function buildTicketMessage() {
    const cityId = document.getElementById('f-city').value || state.activeCityId;
    const city = DATA.cities.find((c) => c.id === cityId) || DATA.cities[0];
    const seats = document.getElementById('f-seats').value || '1';
    const groupLang = document.getElementById('f-lang').value || 'EN';
    const guestFallback = { ru: 'Гость', ua: 'Гість', de: 'Gast', en: 'Guest' }[state.lang];
    const name = document.getElementById('f-name').value.trim() || guestFallback;
    const contact = document.getElementById('f-contact').value.trim() || '—';
    const comment = document.getElementById('f-comment').value.trim();

    const msgDict = {
      en: {
        head: '📌 EXPEDITION PRE-REGISTRATION · 2027',
        city: 'City',
        dates: 'Dates',
        format: 'Format: Unified 4-day / 3-night expedition (shared hotel)',
        seats: 'Seats',
        lang: 'Group language',
        name: 'Name',
        contact: 'Contact',
        comment: 'Comment'
      },
      de: {
        head: '📌 VORANMELDUNG EXPEDITION · 2027',
        city: 'Stadt',
        dates: 'Termine',
        format: 'Format: 4 Tage / 3 Nächte (gemeinsames Hotel)',
        seats: 'Plätze',
        lang: 'Gruppensprache',
        name: 'Name',
        contact: 'Kontakt',
        comment: 'Kommentar'
      },
      ru: {
        head: '📌 ПРЕДЗАПИСЬ НА ЭКСПЕДИЦИЮ · 2027',
        city: 'Город',
        dates: 'Даты',
        format: 'Формат: Единая программа (4 дня / 3 ночи, общий отель)',
        seats: 'Количество мест',
        lang: 'Язык группы',
        name: 'Имя',
        contact: 'Контакт',
        comment: 'Комментарий'
      },
      ua: {
        head: '📌 ПОПЕРЕДНІЙ ЗАПИС НА ЕКСПЕДИЦІЮ · 2027',
        city: 'Місто',
        dates: 'Дати',
        format: 'Формат: Єдина програма (4 дні / 3 ночі, спільний готель)',
        seats: 'Кількість місць',
        lang: 'Мова групи',
        name: 'Ім’я',
        contact: 'Контакт',
        comment: 'Коментар'
      }
    }[state.lang];

    const lines = [
      msgDict.head,
      `${msgDict.city}: ${loc(city, 'name')}`,
      `${msgDict.dates}: ${loc(city, 'dates')}`,
      msgDict.format,
      `${msgDict.seats}: ${seats}`,
      `${msgDict.lang}: ${groupLang}`,
      `${msgDict.name}: ${name}`,
      `${msgDict.contact}: ${contact}`
    ];
    if (comment) lines.push(`${msgDict.comment}: ${comment}`);

    return {
      city,
      seats,
      groupLang,
      name,
      contact,
      text: lines.join('\n')
    };
  }

  function updateTicketPreview() {
    const data = buildTicketMessage();
    document.getElementById('tp-issue').textContent = `№ ${data.city.issueNo}`;
    document.getElementById('tp-city').textContent = loc(data.city, 'name');
    document.getElementById('tp-dates').textContent = loc(data.city, 'dates');
    document.getElementById('tp-person').textContent = `${data.name} · ${data.seats} · ${data.groupLang}`;
    document.getElementById('tp-message').textContent = data.text;

    const tgHref = `https://t.me/${DATA.meta.telegramBot.fallbackHandle}?text=${encodeURIComponent(data.text)}`;
    document.getElementById('btn-open-direct').setAttribute('href', tgHref);
  }

  function scrollToRegistrationForm() {
    const formBox = document.getElementById('fahrkarte-box') || document.getElementById('fahrkarte-form');
    if (formBox) {
      formBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        const nameInput = document.getElementById('f-name');
        if (nameInput) nameInput.focus({ preventScroll: true });
      }, 450);
    }
  }

  async function sendToTelegramBot(payloadText) {
    const { token, admins, knownChatIds } = DATA.meta.telegramBot;
    const statusEl = document.getElementById('bot-status');
    const tr = DATA.i18n[state.lang].tariffs.form;
    statusEl.textContent = tr.sending;

    const cacheKey = 'sg_tg_admin_chats';
    let cachedIds = [];
    try {
      cachedIds = JSON.parse(localStorage.getItem(cacheKey) || '[]');
    } catch {
      cachedIds = [];
    }

    const adminUsernamesLower = admins.map((a) => a.toLowerCase());
    const resolvedIds = new Set([...(knownChatIds || []), ...cachedIds]);

    try {
      const updRes = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=50`);
      if (updRes.ok) {
        const updJson = await updRes.json();
        if (updJson.ok && Array.isArray(updJson.result)) {
          updJson.result.forEach((upd) => {
            const msg = upd.message || upd.edited_message;
            if (!msg || !msg.chat) return;
            const uname = (msg.from?.username || msg.chat?.username || '').toLowerCase();
            if (adminUsernamesLower.includes(uname) || msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
              resolvedIds.add(msg.chat.id);
            }
          });
        }
      }
    } catch {
      // Используем известные chat_id (496101883 и 6289254421)
    }

    try {
      localStorage.setItem(cacheKey, JSON.stringify([...resolvedIds]));

      const deliveries = await Promise.all(
        [...resolvedIds].map((chatId) =>
          fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: payloadText
            })
          })
        )
      );

      const anyOk = deliveries.some((r) => r.ok);
      statusEl.textContent = anyOk ? tr.sentOk : tr.sentWarn;
    } catch {
      statusEl.textContent = tr.sentWarn;
    }
  }

  /* ------------------------------------------------------------------------
     Native <dialog> Lightbox
     ------------------------------------------------------------------------ */
  const dialog = document.getElementById('artifact-dialog');

  function openLightboxById(artifactId) {
    const list = getAllArtifacts();
    const idx = list.findIndex((a) => a.id === artifactId);
    if (idx === -1) return;
    state.lightboxList = list;
    state.lightboxIndex = idx;
    renderLightboxContent();
    if (!dialog.open) dialog.showModal();
  }

  function openLightboxBySrc(src) {
    const list = getAllArtifacts();
    const idx = list.findIndex((a) => a.src === src);
    if (idx !== -1) openLightboxById(list[idx].id);
  }

  function renderLightboxContent() {
    const item = state.lightboxList[state.lightboxIndex];
    if (!item) return;
    document.getElementById('dialog-meta').textContent = `${item.dayRef} · ${item.year} · ${state.lightboxIndex + 1} / ${state.lightboxList.length}`;
    document.getElementById('dialog-img').src = item.src;
    document.getElementById('dialog-img').alt = loc(item, 'title');
    document.getElementById('dialog-title').textContent = loc(item, 'title');
    document.getElementById('dialog-author').textContent = loc(item, 'author');
    document.getElementById('dialog-note').textContent = loc(item, 'note');
  }

  function stepLightbox(delta) {
    if (!state.lightboxList.length) return;
    state.lightboxIndex = (state.lightboxIndex + delta + state.lightboxList.length) % state.lightboxList.length;
    renderLightboxContent();
  }

  /* ------------------------------------------------------------------------
     City Selection Synchronization
     ------------------------------------------------------------------------ */
  function selectCity(cityId, { syncForm = true, flyToCity = true, scrollTab = false } = {}) {
    const city = DATA.cities.find((c) => c.id === cityId);
    if (!city) return;

    const changedCity = state.activeCityId !== cityId;
    state.activeCityId = cityId;
    if (changedCity) {
      state.archiveFilter = 'all';
    }
    setAccentColor(city.accentColor);
    history.replaceState(null, '', `#city=${cityId}`);
    document.getElementById('map-active-coords').textContent = city.coords;

    renderTimeline();
    renderCityCards();
    if (scrollTab) renderMobileCityTabs(true);
    renderDossier();

    if (city.has3DMap) {
      state.active3DCityId = cityId;
      renderLandmarksDock();
      if (state.mapLoaded && flyToCity) {
        flyToCity3D(cityId);
      } else {
        updateMap3DButtonsText();
      }
    } else if (state.mapLoaded && state.dioramaStage) {
      closeLandmarkOverlay();
      syncMapToolbarUI('country');
      if (state.dioramaStage.focusCountryCity) {
        state.dioramaStage.focusCountryCity(cityId);
      } else {
        state.dioramaStage.activeCityId = cityId;
        state.dioramaStage.updateCountryPinSelection();
      }
    }

    if (syncForm) {
      document.getElementById('f-city').value = cityId;
      updateTicketPreview();
    }
  }

  /* ------------------------------------------------------------------------
     Event Delegation & Bindings
     ------------------------------------------------------------------------ */
  function bindEvents() {
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.addEventListener('click', () => applyLanguage(btn.getAttribute('data-lang')));
    });

    const menuBtn = document.getElementById('mobile-menu-btn');
    const drawer = document.getElementById('mobile-drawer');
    menuBtn.addEventListener('click', () => {
      const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', String(!expanded));
      drawer.hidden = expanded;
    });
    drawer.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        drawer.hidden = true;
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Hero primary CTA: "Explore Map of German States & 2027 Dates" -> open All Germany view!
    const heroPrimaryCta = document.getElementById('hero-cta-primary');
    if (heroPrimaryCta) {
      heroPrimaryCta.addEventListener('click', () => {
        flyToGermanyMacro();
      });
    }

    // 3D Map camera controls
    document.getElementById('btn-back-country').addEventListener('click', () => flyToGermanyMacro());
    document.getElementById('btn-zoom-city').addEventListener('click', () => {
      const target3D = state.active3DCityId || 'stuttgart';
      selectCity(target3D, { syncForm: true, flyToCity: true, scrollTab: true });
    });
    const fireBtn = document.getElementById('btn-toggle-fire');
    if (fireBtn) {
      fireBtn.addEventListener('click', () => {
        if (state.dioramaStage && state.dioramaStage.toggleFireLayer) {
          const isOn = state.dioramaStage.toggleFireLayer();
          fireBtn.classList.toggle('is-active', isOn);
        }
      });
    }
    document.getElementById('btn-orbit-3d').addEventListener('click', () => {
      if (state.dioramaStage) {
        state.dioramaStage.rotateAngleStep();
      }
    });

    // Map Overlay controls
    document.getElementById('ov-close').addEventListener('click', () => closeLandmarkOverlay());
    document.getElementById('ov-prev').addEventListener('click', () => stepLandmarkOverlay(-1));
    document.getElementById('ov-next').addEventListener('click', () => stepLandmarkOverlay(1));

    // Delegated clicks
    document.addEventListener('click', (e) => {
      const dockBtn = e.target.closest('[data-dock-landmark]');
      if (dockBtn) {
        focusLandmark3D(dockBtn.getAttribute('data-dock-landmark'), true);
        return;
      }

      const selectOnly = e.target.closest('[data-select-city]');
      if (selectOnly) {
        const fromTab = selectOnly.classList.contains('mobile-city-tab');
        selectCity(selectOnly.getAttribute('data-select-city'), { syncForm: true, scrollTab: fromTab });
        return;
      }

      const jumpBtn = e.target.closest('[data-jump-city]');
      if (jumpBtn) {
        selectCity(jumpBtn.getAttribute('data-jump-city'), { syncForm: true });
        return;
      }

      const prefillBtn = e.target.closest('[data-prefill-city]');
      if (prefillBtn) {
        selectCity(prefillBtn.getAttribute('data-prefill-city'), { syncForm: true });
        scrollToRegistrationForm();
        return;
      }

      const pickCardBtn = e.target.closest('[data-pick-card]');
      if (pickCardBtn) {
        const cardId = pickCardBtn.getAttribute('data-pick-card');
        if (cardId === 'full') {
          selectCity('stuttgart', { syncForm: true });
        }
        scrollToRegistrationForm();
        return;
      }

      const tabBtn = e.target.closest('[data-dossier-tab]');
      if (tabBtn) {
        state.dossierTab = tabBtn.getAttribute('data-dossier-tab');
        renderDossier();
        return;
      }

      const archBtn = e.target.closest('[data-archive-filter]');
      if (archBtn) {
        state.archiveFilter = archBtn.getAttribute('data-archive-filter');
        renderDossier();
        return;
      }

      const lbById = e.target.closest('[data-lightbox-id]');
      if (lbById) {
        openLightboxById(lbById.getAttribute('data-lightbox-id'));
        return;
      }

      const lbBySrc = e.target.closest('[data-lightbox-src]');
      if (lbBySrc) {
        openLightboxBySrc(lbBySrc.getAttribute('data-lightbox-src'));
        return;
      }

      const reelPick = e.target.closest('[data-reel-pick]');
      if (reelPick) {
        const idx = parseInt(reelPick.getAttribute('data-reel-pick'), 10);
        if (!Number.isNaN(idx)) {
          state.reelIndex = idx;
          startHeroReelLoop();
        }
        return;
      }

      const accBtn = e.target.closest('[data-toggle-acc]');
      if (accBtn) {
        const card = accBtn.closest('[data-mobile-accordion]');
        if (card) {
          const isOpen = card.classList.toggle('is-expanded');
          accBtn.setAttribute('aria-expanded', String(isOpen));
        }
        return;
      }

      const personBtn = e.target.closest('[data-person-id]');
      if (personBtn) {
        const isPinClick = personBtn.classList.contains('hotspot-pin');
        state.activePersonId = personBtn.getAttribute('data-person-id');
        state.compareAutoPlay = false;
        stopCompareAutoTour();
        updateAutoPlayButtonLabel();
        if (isPinClick) {
          state.compareView = 'closeup';
        }
        updateActivePersonUI();
        return;
      }

      const plateBtn = e.target.closest('[data-plate]');
      if (plateBtn) {
        state.activePlate = plateBtn.getAttribute('data-plate');
        state.compareAutoPlay = false;
        stopCompareAutoTour();
        updateAutoPlayButtonLabel();
        renderCompareModule();
        return;
      }

      const viewBtn = e.target.closest('[data-compare-view]');
      if (viewBtn) {
        state.compareView = viewBtn.getAttribute('data-compare-view');
        applyCompareZoom();
        return;
      }

      const autoBtn = e.target.closest('#btn-compare-autoplay');
      if (autoBtn) {
        state.compareAutoPlay = !state.compareAutoPlay;
        updateAutoPlayButtonLabel();
        if (state.compareAutoPlay) {
          state.compareView = 'closeup';
          state.activePlate = 'plate1843a';
          renderCompareModule();
          startCompareAutoTour();
        } else {
          stopCompareAutoTour();
        }
      }
    });

    // Hover highlight on hotspots
    document.addEventListener('mouseover', (e) => {
      const pin = e.target.closest('.hotspot-pin');
      if (pin) {
        const pid = pin.getAttribute('data-person-id');
        if (pid && pid !== state.activePersonId) {
          state.activePersonId = pid;
          updateActivePersonUI();
        }
      }
    });

    // Form bindings & Telegram Bot submission
    ['f-city', 'f-seats', 'f-lang', 'f-name', 'f-contact', 'f-comment'].forEach((id) => {
      const el = document.getElementById(id);
      el.addEventListener('input', updateTicketPreview);
      el.addEventListener('change', () => {
        if (id === 'f-city') {
          selectCity(el.value, { syncForm: false });
        }
        updateTicketPreview();
      });
    });

    document.getElementById('fahrkarte-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const { text } = buildTicketMessage();
      sendToTelegramBot(text);
    });

    document.getElementById('btn-copy-ticket').addEventListener('click', async () => {
      const text = document.getElementById('tp-message').textContent;
      const statusEl = document.getElementById('bot-status');
      try {
        await navigator.clipboard.writeText(text);
        statusEl.textContent = DATA.i18n[state.lang].tariffs.form.copied;
        setTimeout(() => {
          statusEl.textContent = '';
        }, 3000);
      } catch {
        statusEl.textContent = text;
      }
    });

    // Lightbox controls
    document.getElementById('dialog-close').addEventListener('click', () => dialog.close());
    document.getElementById('dialog-prev').addEventListener('click', () => stepLightbox(-1));
    document.getElementById('dialog-next').addEventListener('click', () => stepLightbox(1));
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close();
    });
    document.addEventListener('keydown', (e) => {
      if (!dialog.open) return;
      if (e.key === 'ArrowLeft') stepLightbox(-1);
      if (e.key === 'ArrowRight') stepLightbox(1);
    });
  }

  /* ------------------------------------------------------------------------
     Init
     ------------------------------------------------------------------------ */
  function init() {
    parseInitialUrl();
    applyLanguage(state.lang);
    init3DMap();
    renderLandmarksDock();
    selectCity(state.activeCityId, { syncForm: true, flyToCity: false });
    bindEvents();
    startHeroReelLoop();
    initMobileStickyCta();
    initCompareObserver();
  }

  init();
})();
