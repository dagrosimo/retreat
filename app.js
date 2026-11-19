/**
 * APP CONTROLLER · V3 (3D Isometric MapLibre + Three.js + Overlay + Auto Cinema Video)
 */
(function () {
  'use strict';

  const DATA = window.EXPEDITIONS_DATA;
  if (!DATA) return;

  const state = {
    lang: 'ru',
    activeCityId: 'hamburg',
    mapView: 'city', // 'country' | 'city' (сосредоточены на 3D Гамбурге)
    activeLandmarkId: null,
    hubFilter: 'all',
    dossierTab: 'story',
    archiveFilter: 'all',
    compareMode: 'pins', // 'pins' | 'cinema'
    activePlate: 'plate1843a',
    activePersonId: 'p1',
    cinemaSeqIndex: 0,
    cinemaTimer: null,
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
    const suffix = map[state.lang] || 'Ru';
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

  function getHamburgCity() {
    return DATA.cities.find((c) => c.id === 'hamburg') || DATA.cities[0];
  }

  function getHamburgArtifacts() {
    const h = getHamburgCity();
    return h ? h.artifacts : [];
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

  /* ------------------------------------------------------------------------
     Language Gate (Pre-entry screen)
     ------------------------------------------------------------------------ */
  function initLanguageGate() {
    const gate = document.getElementById('lang-gate');
    const saved = sessionStorage.getItem('sg_exp_lang');
    if (saved && ['ru', 'ua', 'de', 'en'].includes(saved)) {
      gate.hidden = true;
    } else {
      gate.hidden = false;
    }

    document.querySelectorAll('[data-pick-lang]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const chosen = btn.getAttribute('data-pick-lang');
        sessionStorage.setItem('sg_exp_lang', chosen);
        applyLanguage(chosen);
        gate.hidden = true;
      });
    });
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
    renderCinemaSequenceStep();
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

    document.getElementById('gate-eyebrow').textContent = tr.gate.eyebrow;
    document.getElementById('gate-title').textContent = tr.gate.title;
    document.getElementById('gate-subtitle').textContent = tr.gate.subtitle;

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
    document.querySelectorAll('[data-hub-filter]').forEach((btn) => {
      const k = btn.getAttribute('data-hub-filter');
      if (tr.hub.filters[k]) btn.textContent = tr.hub.filters[k];
    });

    const btnCountryLabels = {
      ru: '← Вся Германия (16 земель)',
      ua: '← Уся Німеччина (16 земель)',
      de: '← Ganz Deutschland (16 Länder)',
      en: '← All Germany (16 States)'
    };
    const btnCityLabels = {
      ru: 'Гамбург 3D',
      ua: 'Гамбург 3D',
      de: 'Hamburg 3D',
      en: 'Hamburg 3D'
    };
    const btnOrbitLabels = {
      ru: '↻ Ракурс',
      ua: '↻ Ракурс',
      de: '↻ Winkel',
      en: '↻ Orbit'
    };
    const btnFireLabels = {
      ru: 'Пожар 1842',
      ua: 'Пожежа 1842',
      de: 'Brand 1842',
      en: '1842 Fire'
    };
    const mapLegendLabels = {
      ru: ['Точки маршрута (01–07)', 'Зона пожара 1842 и маршрут', 'ПКМ / Ctrl + мышь — вращение 3D'],
      ua: ['Точки маршруту (01–07)', 'Зона пожежі 1842 і маршрут', 'ПКМ / Ctrl + миша — обертання 3D'],
      de: ['Stationen (01–07)', 'Brandgebiet 1842 & Route', 'Rechtsklick / Strg — 3D drehen'],
      en: ['Route Stops (01–07)', '1842 Fire Zone & Route', 'Right-drag / Ctrl — Orbit 3D']
    }[state.lang];

    document.getElementById('btn-back-country').textContent = btnCountryLabels[state.lang];
    document.getElementById('btn-zoom-city').textContent = btnCityLabels[state.lang];
    document.getElementById('btn-orbit-3d').textContent = btnOrbitLabels[state.lang];
    const fireBtn = document.getElementById('btn-toggle-fire');
    if (fireBtn) fireBtn.textContent = btnFireLabels[state.lang];

    document.getElementById('legend-active').textContent = mapLegendLabels[0];
    document.getElementById('legend-forming').textContent = mapLegendLabels[1];
    document.getElementById('legend-wait').textContent = mapLegendLabels[2];
    document.getElementById('board-title').textContent = tr.hub.boardTitle;
    document.getElementById('board-threshold').textContent = tr.hub.boardThreshold;
    document.getElementById('map-meta-label').textContent =
      state.mapView === 'city' ? tr.hub.mapMetaCity : tr.hub.mapMetaCountry;

    // Compare & Cinema
    document.getElementById('compare-eyebrow').textContent = tr.compare.eyebrow;
    document.getElementById('compare-title').textContent = tr.compare.title;
    document.getElementById('compare-lead').textContent = tr.compare.lead;
    document.getElementById('btn-mode-pins').textContent = tr.compare.modePins;
    document.getElementById('btn-mode-cinema').textContent = tr.compare.modeCinema;
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
  function syncMapToolbarUI(mode) {
    state.mapView = mode;
    const isCity = mode === 'city';
    document.getElementById('btn-back-country').classList.toggle('is-active', !isCity);
    document.getElementById('btn-zoom-city').classList.toggle('is-active', isCity);
    document.getElementById('map-meta-label').textContent = isCity
      ? DATA.i18n[state.lang].hub.mapMetaCity
      : DATA.i18n[state.lang].hub.mapMetaCountry;

    const fireBtn = document.getElementById('btn-toggle-fire');
    const orbitBtn = document.getElementById('btn-orbit-3d');
    if (fireBtn) fireBtn.hidden = !isCity;
    if (orbitBtn) orbitBtn.hidden = !isCity;
  }

  function init3DMap() {
    if (!window.HamburgDioramaStage || !window.maplibregl) return;
    const container = document.getElementById('maplibre-canvas');
    if (!container) return;

    state.dioramaStage = new window.HamburgDioramaStage({
      container,
      getLandmarksData: () => {
        const hh = getHamburgCity();
        return (hh && hh.cityMap && hh.cityMap.landmarks) || [];
      },
      getCitiesData: () => DATA.cities || [],
      getLang: () => state.lang,
      loc: (obj, key) => loc(obj, key),
      onModeChange: (mode) => {
        syncMapToolbarUI(mode);
      },
      onSelectLandmark: (landmarkId, openOverlay) => {
        state.activeCityId = 'hamburg';
        state.activeLandmarkId = landmarkId;
        syncMapToolbarUI('city');
        renderLandmarksDock();
        if (openOverlay) {
          renderLandmarkOverlay(landmarkId);
        }
      },
      onSelectCityFromCountry: (cityId) => {
        selectCity(cityId, { syncForm: true, flyToCity: false });
      }
    });
    state.mapLoaded = true;
    syncMapToolbarUI('city');
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

  function flyToHamburg3D() {
    state.activeCityId = 'hamburg';
    syncMapToolbarUI('city');
    renderLandmarksDock();
    if (state.dioramaStage) {
      state.dioramaStage.whooshToCity();
    }
  }

  function focusLandmark3D(landmarkId, openOverlay = true) {
    const hh = getHamburgCity();
    const landmarks = hh.cityMap.landmarks || [];
    const lm = landmarks.find((l) => l.id === landmarkId) || landmarks[0];
    if (!lm) return;

    state.activeCityId = 'hamburg';
    state.activeLandmarkId = lm.id;
    syncMapToolbarUI('city');
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
    const hh = getHamburgCity();
    const landmarks = hh.cityMap.landmarks || [];
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
    const hh = getHamburgCity();
    const landmarks = hh.cityMap.landmarks || [];
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
    const hh = getHamburgCity();
    const landmarks = hh.cityMap.landmarks || [];
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

  function renderCityCards() {
    const container = document.getElementById('city-cards');
    const filtered = DATA.cities.filter((c) => {
      if (state.hubFilter === 'active') return c.status === 'active' || c.status === 'forming';
      if (state.hubFilter === 'lab') return c.isLabStub;
      return true;
    });

    container.innerHTML = filtered
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

    const tabsHtml = `
      <div class="dossier-tabs" role="tablist">
        <button type="button" class="dossier-tab ${state.dossierTab === 'story' ? 'is-active' : ''}" data-dossier-tab="story">
          📖 ${tr.tabs.story}
        </button>
        <button type="button" class="dossier-tab ${state.dossierTab === 'schedule' ? 'is-active' : ''}" data-dossier-tab="schedule">
          🗓 ${tr.tabs.schedule}
        </button>
        <button type="button" class="dossier-tab ${state.dossierTab === 'archive' ? 'is-active' : ''}" data-dossier-tab="archive">
          🖼 ${tr.tabs.archive}
        </button>
      </div>`;

    let bodyHtml = '';
    if (state.dossierTab === 'story') {
      bodyHtml = `
        <div class="acts-container">
          ${city.acts
            .map((act) => {
              const paras = loc(act, 'paragraphs') || act.paragraphsRu;
              return `
              <article class="act-block act-block--${act.tone}">
                <div class="act-text">
                  <div class="act-num">${act.num}</div>
                  <h3 class="act-title">${loc(act, 'title')}</h3>
                  ${paras.map((p) => `<p>${p}</p>`).join('')}
                  <div class="act-museum-plate">${loc(act, 'museumPlate')}</div>
                </div>
                <figure class="act-figure" data-lightbox-src="${act.image}">
                  <img src="${act.image}" alt="${loc(act, 'imageCaption')}" loading="lazy" />
                  <figcaption>${loc(act, 'imageCaption')}</figcaption>
                </figure>
              </article>`;
            })
            .join('')}
        </div>`;
    } else if (state.dossierTab === 'schedule') {
      bodyHtml = `
        <div class="schedule-panel">
          <div class="weekend-callout">${tr.scheduleNotice}</div>
          <div class="days-grid">
            ${city.days
              .map((day) => {
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
                        ua: ['РАНОК · ФІНАЛЬНА ЛЕКЦІЯ В ЗАЛІ', 'ДЕНЬ · ВИСЕЛЕННЯ І ВІД’ЇЗД', 'ПІСЛЯ · АРХІВ І ДЖЕРЕЛА'],
                        de: ['MORGEN · ABSCHLUSSVORLESUNG', 'TAG · CHECK-OUT & ABREISE', 'DANACH · LITERATUR & NOTIZEN'],
                        en: ['MORNING · CLOSING LECTURE', 'AFTERNOON · CHECK-OUT & DEPARTURE', 'FOLLOW-UP · ARCHIVE & READING LIST']
                      }[state.lang]
                    : [tr.blocks.morning, tr.blocks.afternoon, tr.blocks.evening];

                return `
              <article class="day-card">
                <div class="day-card__top">
                  <span class="mono-label">${loc(day, 'weekday')}</span>
                  <span class="mono-label">4–10 PARTICIPANTS · HOTEL + CONFERENCE HALL</span>
                </div>
                <h3 class="day-card__title">${loc(day, 'title')}</h3>
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
              </article>`;
              })
              .join('')}
          </div>
        </div>`;
    } else {
      const items = city.artifacts.filter((a) => (state.archiveFilter === 'all' ? true : a.category === state.archiveFilter));
      bodyHtml = `
        <div class="archive-panel">
          <div class="archive-filters">
            <button type="button" class="pill-btn ${state.archiveFilter === 'all' ? 'is-active' : ''}" data-archive-filter="all">${tr.archiveFilters.all}</button>
            <button type="button" class="pill-btn ${state.archiveFilter === 'pre' ? 'is-active' : ''}" data-archive-filter="pre">${tr.archiveFilters.pre}</button>
            <button type="button" class="pill-btn ${state.archiveFilter === 'fire' ? 'is-active' : ''}" data-archive-filter="fire">${tr.archiveFilters.fire}</button>
            <button type="button" class="pill-btn ${state.archiveFilter === 'daguerre' ? 'is-active' : ''}" data-archive-filter="daguerre">${tr.archiveFilters.daguerre}</button>
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
     Deepened Heroes & Clean Auto-Running Cinema Video (1840 -> 1843)
     ------------------------------------------------------------------------ */
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
      hotspots1843.style.display = 'block';
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

    const pinsView = document.getElementById('compare-pins-view');
    const cinemaView = document.getElementById('compare-cinema-view');
    pinsView.hidden = state.compareMode !== 'pins';
    cinemaView.hidden = state.compareMode !== 'cinema';
    document.querySelectorAll('[data-compare-mode]').forEach((b) => {
      b.classList.toggle('is-active', b.getAttribute('data-compare-mode') === state.compareMode);
    });
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
  }

  /* Автоматическое видео-приближение лиц: сначала проходит по картине 1840 г., затем по дагеротипу 1843 г. */
  function buildCinemaSequence() {
    const fc = DATA.faceComparison;
    const persons = fc.persons.filter((p) => p.onCanvas);
    const seq = [];

    // 1. Общий план картины 1840 г. + 5 лиц по очереди
    seq.push({ era: '1840', isOverview: true, src: fc.painting1840, person: null });
    persons.forEach((p) => {
      seq.push({ era: '1840', isOverview: false, src: fc.painting1840, person: p, face: p.face1840 });
    });

    // 2. Общий план дагеротипа 1843 г. + 5 лиц по очереди
    seq.push({ era: '1843', isOverview: true, src: fc.daguerreotype1843a, person: null });
    persons.forEach((p) => {
      seq.push({ era: '1843', isOverview: false, src: fc.daguerreotype1843a, person: p, face: p.face1843 });
    });

    return seq;
  }

  function renderCinemaSequenceStep() {
    const seq = buildCinemaSequence();
    const step = seq[state.cinemaSeqIndex % seq.length];
    if (!step) return;

    const imgEl = document.getElementById('cinema-img');
    const plaque = document.getElementById('cinema-floating-plaque');
    const bar = document.getElementById('cinema-progress-bar');

    if (imgEl.getAttribute('src') !== step.src) {
      imgEl.style.opacity = '0.25';
      setTimeout(() => {
        imgEl.src = step.src;
        imgEl.style.opacity = '1';
      }, 220);
    }

    if (step.isOverview) {
      imgEl.style.transform = 'scale(1.03) translate(0%, 0%)';
      plaque.classList.add('is-overview');
      const eraLabel1840 = {
        ru: ['1840 · МАСЛО, ХОЛСТ', 'Гамбургское общество художников', 'За два года до Великого пожара (Гюнтер Генслер)'],
        ua: ['1840 · ОЛІЯ, ПОЛОТНО', 'Гамбурзьке товариство художників', 'За два роки до Великої пожежі (Гюнтер Генслер)'],
        de: ['1840 · ÖL AUF LEINWAND', 'Hamburger Künstlerverein', 'Zwei Jahre vor dem Großen Brand (Günther Gensler)'],
        en: ['1840 · OIL ON CANVAS', 'Hamburg Artists’ Association', 'Two years before the Great Fire (Günther Gensler)']
      }[state.lang];
      const eraLabel1843 = {
        ru: ['6 МАЯ 1843 · СЕРЕБРЯНЫЙ ДАГЕРОТИП', 'Те же мастера год спустя после пожара', 'Сад на Caffamacherreihe (Карл Фердинанд Штельцнер)'],
        ua: ['6 ТРАВНЯ 1843 · СРІБНИЙ ДАГЕРОТИП', 'Ті самі майстри рік потому після пожежі', 'Сад на Caffamacherreihe (Карл Фердинанд Штельцнер)'],
        de: ['6. MAI 1843 · DAGUERREOTYPIE', 'Dieselben Künstler ein Jahr nach dem Brand', 'Im Garten an der Caffamacherreihe (C. F. Stelzner)'],
        en: ['MAY 6, 1843 · SILVER DAGUERREOTYPE', 'The surviving artists one year after the fire', 'Garden at Caffamacherreihe (C. F. Stelzner)']
      }[state.lang];
      const labels = step.era === '1840' ? eraLabel1840 : eraLabel1843;
      document.getElementById('cinema-plate-tag').textContent = labels[0];
      document.getElementById('cinema-person-name').textContent = labels[1];
      document.getElementById('cinema-person-quote').textContent = labels[2];
    } else {
      plaque.classList.remove('is-overview');
      // Точное центрирование лица (x%, y%) в кадре 6:5
      const scale = 2.45;
      const tx = Math.max(-28, Math.min(28, 50 - step.face.x));
      const ty = Math.max(-26, Math.min(26, 50 - step.face.y));
      imgEl.style.transform = `scale(${scale}) translate(${tx}%, ${ty}%)`;

      const eraPrefix =
        step.era === '1840'
          ? { ru: '1840 · КИСТЬ ГЕНСЛЕРА', ua: '1840 · ПЕНЗЕЛЬ ГЕНСЛЕРА', de: '1840 · GEMÄLDE', en: '1840 · PAINTING' }[state.lang]
          : { ru: '1843 · СЕРЕБРО ДАГЕРОТИПА', ua: '1843 · СРІБЛО ДАГЕРОТИПА', de: '1843 · DAGUERREOTYPIE', en: '1843 · DAGUERREOTYPE' }[state.lang];

      document.getElementById('cinema-plate-tag').textContent = `${eraPrefix} · №${step.person.num}`;
      document.getElementById('cinema-person-name').textContent = `${loc(step.person, 'name')} (${step.person.years})`;
      document.getElementById('cinema-person-quote').textContent = loc(step.person, 'role');
    }

    const pct = Math.round((((state.cinemaSeqIndex % seq.length) + 1) / seq.length) * 100);
    if (bar) bar.style.width = `${pct}%`;
  }

  function startAutoCinemaLoop() {
    stopAutoCinemaLoop();
    renderCinemaSequenceStep();
    state.cinemaTimer = setInterval(() => {
      const seq = buildCinemaSequence();
      state.cinemaSeqIndex = (state.cinemaSeqIndex + 1) % seq.length;
      renderCinemaSequenceStep();
    }, 3200);
  }

  function stopAutoCinemaLoop() {
    if (state.cinemaTimer) {
      clearInterval(state.cinemaTimer);
      state.cinemaTimer = null;
    }
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
    const groupLang = document.getElementById('f-lang').value || 'RU';
    const guestFallback = { ru: 'Гость', ua: 'Гість', de: 'Gast', en: 'Guest' }[state.lang];
    const name = document.getElementById('f-name').value.trim() || guestFallback;
    const contact = document.getElementById('f-contact').value.trim() || '—';
    const comment = document.getElementById('f-comment').value.trim();

    const lines = [
      `📌 ПРЕДЗАПИСЬ НА ЭКСПЕДИЦИЮ · 2027`,
      `Город: ${loc(city, 'name')}`,
      `Даты: ${loc(city, 'dates')}`,
      `Формат: Единая программа (4 дня / 3 ночи, общий отель)`,
      `Количество мест: ${seats}`,
      `Язык группы: ${groupLang}`,
      `Имя: ${name}`,
      `Контакт: ${contact}`
    ];
    if (comment) lines.push(`Комментарий: ${comment}`);

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
    const list = getHamburgArtifacts();
    const idx = list.findIndex((a) => a.id === artifactId);
    if (idx === -1) return;
    state.lightboxList = list;
    state.lightboxIndex = idx;
    renderLightboxContent();
    if (!dialog.open) dialog.showModal();
  }

  function openLightboxBySrc(src) {
    const list = getHamburgArtifacts();
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
  function selectCity(cityId, { syncForm = true, flyToCity = true } = {}) {
    const city = DATA.cities.find((c) => c.id === cityId);
    if (!city) return;

    state.activeCityId = cityId;
    setAccentColor(city.accentColor);
    history.replaceState(null, '', `#city=${cityId}`);
    document.getElementById('map-active-coords').textContent = city.coords;

    renderTimeline();
    renderCityCards();
    renderDossier();

    if (cityId === 'hamburg' && state.mapLoaded && flyToCity) {
      flyToHamburg3D();
    } else if (cityId !== 'hamburg' && state.mapLoaded && state.dioramaStage) {
      state.dioramaStage.activeCityId = cityId;
      state.dioramaStage.updateCountryPinSelection();
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

    document.querySelectorAll('[data-hub-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.hubFilter = btn.getAttribute('data-hub-filter');
        document.querySelectorAll('[data-hub-filter]').forEach((b) => b.classList.toggle('is-active', b === btn));
        renderCityCards();
      });
    });

    // 3D Map camera controls
    document.getElementById('btn-back-country').addEventListener('click', () => flyToGermanyMacro());
    document.getElementById('btn-zoom-city').addEventListener('click', () => flyToHamburg3D());
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
        selectCity(selectOnly.getAttribute('data-select-city'), { syncForm: true });
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
          selectCity('hamburg', { syncForm: true });
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

      const personBtn = e.target.closest('[data-person-id]');
      if (personBtn) {
        state.activePersonId = personBtn.getAttribute('data-person-id');
        updateActivePersonUI();
        return;
      }

      const plateBtn = e.target.closest('[data-plate]');
      if (plateBtn) {
        state.activePlate = plateBtn.getAttribute('data-plate');
        renderCompareModule();
        return;
      }

      const modeBtn = e.target.closest('[data-compare-mode]');
      if (modeBtn) {
        state.compareMode = modeBtn.getAttribute('data-compare-mode');
        renderCompareModule();
        if (state.compareMode === 'cinema') {
          state.cinemaSeqIndex = 0;
          startAutoCinemaLoop();
        } else {
          stopAutoCinemaLoop();
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
    initLanguageGate();
    applyLanguage(state.lang);
    init3DMap();
    renderLandmarksDock();
    selectCity(state.activeCityId, { syncForm: true, flyToCity: false });
    bindEvents();
  }

  init();
})();
