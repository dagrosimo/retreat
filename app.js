/**
 * APP CONTROLLER · V3 (Multi-Page Editorial Hub + City Rabbit Holes)
 * ------------------------------------------------------------------
 * Powers both:
 *   - Home pages (data-page="home"): 2-Track Germany Atlas, Lens Switcher, Schedule, Fahrkarte
 *   - City pages (data-page="city"): 3D City Map, Stuttgart Time-Loop, Hamburg 1840<->1843, Dossier, Fahrkarte
 */
(function () {
  'use strict';

  const DATA = window.EXPEDITIONS_DATA;
  if (!DATA) return;

  const BODY = document.body;
  const PAGE_TYPE = BODY.dataset.page || 'home'; // 'home' | 'city'
  const ROOT = BODY.dataset.root || '';
  const PAGE_LANG = BODY.dataset.lang || 'en';
  const URL_LANG = BODY.dataset.urlLang || (PAGE_LANG === 'ua' ? 'uk' : PAGE_LANG);
  const INITIAL_CITY = BODY.dataset.city || DATA.cities[0].id;

  const state = {
    lang: PAGE_LANG,
    activeCityId: INITIAL_CITY,
    active3DCityId: DATA.cities.some((c) => c.id === INITIAL_CITY && c.has3DMap) ? INITIAL_CITY : 'stuttgart',
    activeTrack: 'all', // 'all' | 'writers' | 'artists'
    mapView: PAGE_TYPE === 'home' ? 'country' : 'city',
    activeLandmarkId: null,
    dossierTab: 'story',
    archiveFilter: 'all',
    // Hamburg 1840 <-> 1843
    compareView: 'closeup',
    compareAutoPlay: true,
    compareTimer: null,
    compareInView: false,
    activePlate: 'plate1843a',
    activePersonId: 'p1',
    // Stuttgart 1738 -> 1855 Time-Loop
    activeTimeNodeId: 'n1',
    timeLoopAuto: false,
    timeLoopTimer: null,
    // Berlin 1831 <-> 1913 Veil Curtain
    berlinVeilLayer: 'l1',
    berlinVeilPos: 52,
    // City Hero mobile reel
    reelIndex: 0,
    reelTimer: null,
    // Lightbox & Map
    lightboxList: [],
    lightboxIndex: 0,
    mapLoaded: false,
    dioramaStage: null
  };

  /* ------------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------------ */
  function asset(p) {
    if (!p) return '';
    if (/^(https?:|data:|\/)/i.test(p)) return p;
    return ROOT + p;
  }

  function cityPageUrl(cityId) {
    return `${ROOT}${URL_LANG}/${cityId}/`;
  }

  function loc(obj, baseKey) {
    if (!obj) return '';
    const map = { ru: 'Ru', ua: 'Ua', de: 'De', en: 'En' };
    const suffix = map[state.lang] || 'En';
    return obj[baseKey + suffix] ?? obj[baseKey + 'En'] ?? obj[baseKey + 'Ru'] ?? obj[baseKey] ?? '';
  }

  function hexToRgba(hex, alpha) {
    const clean = (hex || '#141311').replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function setAccentColor(hex) {
    document.documentElement.style.setProperty('--city-accent', hex);
    document.documentElement.style.setProperty('--city-accent-soft', hexToRgba(hex, 0.1));
  }

  function getActiveCity() {
    return DATA.cities.find((c) => c.id === state.activeCityId) || DATA.cities[0];
  }

  function getActive3DCity(cityId) {
    const cid = cityId || state.active3DCityId;
    const found = DATA.cities.find((c) => c.id === cid && c.has3DMap);
    return found || DATA.cities.find((c) => c.has3DMap) || DATA.cities[0];
  }

  function getTrack(trackId) {
    return (DATA.tracks || []).find((t) => t.id === trackId) || DATA.tracks[0];
  }

  function getVisibleCities() {
    if (state.activeTrack === 'all') return DATA.cities;
    return DATA.cities.filter((c) => c.trackId === state.activeTrack);
  }

  function getAllArtifacts() {
    const out = [];
    DATA.cities.forEach((c) => {
      if (Array.isArray(c.artifacts)) out.push(...c.artifacts);
    });
    return out;
  }

  function getCityShortMonth(cityId) {
    const months = {
      stuttgart: { en: 'Jan', de: 'Jan', ru: 'Янв', ua: 'Січ' },
      hamburg: { en: 'Feb', de: 'Feb', ru: 'Фев', ua: 'Лют' },
      dresden: { en: 'Mar', de: 'Mär', ru: 'Мар', ua: 'Бер' },
      berlin: { en: 'Apr', de: 'Apr', ru: 'Апр', ua: 'Кві' },
      frankfurt: { en: 'May', de: 'Mai', ru: 'Май', ua: 'Тра' },
      munich: { en: 'Jun', de: 'Jun', ru: 'Июн', ua: 'Чер' },
      vienna: { en: 'Jul', de: 'Jul', ru: 'Июл', ua: 'Лип' }
    };
    return (months[cityId] && months[cityId][state.lang]) || '';
  }

  /* ------------------------------------------------------------------------
     Traffic Source / Referrer / UTM Capture (in-memory only, zero storage)
     ------------------------------------------------------------------------ */
  let inMemoryTrafficSource = 'direct';

  function captureTrafficSource() {
    try {
      const params = new URLSearchParams(window.location.search);
      const utmSrc = params.get('utm_source');
      const utmMed = params.get('utm_medium');
      const utmCamp = params.get('utm_campaign');
      if (utmSrc) {
        inMemoryTrafficSource = [utmSrc, utmMed, utmCamp].filter(Boolean).join(' / ');
        return;
      }
      if (document.referrer) {
        try {
          const refHost = new URL(document.referrer).hostname.replace(/^www\./, '');
          if (refHost && refHost !== window.location.hostname) {
            inMemoryTrafficSource = refHost;
            return;
          }
        } catch {
          inMemoryTrafficSource = document.referrer.slice(0, 60);
          return;
        }
      }
    } catch {}
  }

  function getTrafficSource() {
    return inMemoryTrafficSource || 'direct';
  }

  /* ------------------------------------------------------------------------
     Real 3D Vector Archival Map (Home Country Atlas + City 3D View)
     ------------------------------------------------------------------------ */
  function updateMap3DButtonsText() {
    const city3d = getActive3DCity();
    const cid = city3d ? city3d.id : 'stuttgart';

    const btnCountry = document.getElementById('btn-back-country');
    if (btnCountry) {
      const lbls = {
        ru: '← Карта маршрутов (DE + AT)',
        ua: '← Карта маршрутів (DE + AT)',
        de: '← Übersichtskarte (DE + AT)',
        en: '← All Routes (DE + AT)'
      };
      btnCountry.textContent = lbls[state.lang];
    }

    const zoomBtn = document.getElementById('btn-zoom-city');
    if (zoomBtn && city3d) {
      zoomBtn.textContent = `${loc(city3d, 'name')} 3D`;
    }

    const orbitBtn = document.getElementById('btn-orbit-3d');
    if (orbitBtn) {
      orbitBtn.textContent = { ru: '↻ Ракурс', ua: '↻ Ракурс', de: '↻ Winkel', en: '↻ Orbit' }[state.lang];
    }

    const zoneLabels =
      cid === 'stuttgart'
        ? { ru: 'Резиденция 1738', ua: 'Резиденція 1738', de: 'Residenz 1738', en: 'Altstadt 1738' }
        : cid === 'berlin'
        ? { ru: 'Ось Шинкеля', ua: 'Вісь Шинкеля', de: 'Schinkel-Achse', en: 'Schinkel Axis' }
        : { ru: 'Пожар 1842', ua: 'Пожежа 1842', de: 'Brand 1842', en: '1842 Fire' };
    const fireBtn = document.getElementById('btn-toggle-fire');
    if (fireBtn) fireBtn.textContent = zoneLabels[state.lang];

    const la = document.getElementById('legend-active');
    const lf = document.getElementById('legend-forming');
    const lw = document.getElementById('legend-wait');
    if (state.mapView === 'country' && PAGE_TYPE === 'home') {
      const tW = getTrack('writers');
      const tA = getTrack('artists');
      if (la) la.textContent = `${tW.symbol} ${loc(tW, 'name')}`;
      if (lf) lf.textContent = `${tA.symbol} ${loc(tA, 'name')}`;
      if (lw) {
        lw.textContent = {
          en: '3D Zoom: Stuttgart, Hamburg & Berlin',
          de: '3D-Zoom: Stuttgart, Hamburg & Berlin',
          ru: '3D-зум: Штутгарт, Гамбург и Берлин',
          ua: '3D-зум: Штутгарт, Гамбург і Берлін'
        }[state.lang];
      }
    } else {
      const legendLabels =
        cid === 'stuttgart'
          ? {
              ru: ['Точки Штутгарта (01–08)', 'Резиденция 1738–1848 и маршрут', 'ПКМ / Ctrl + мышь — вращение 3D'],
              ua: ['Точки Штутгарта (01–08)', 'Резиденція 1738–1848 і маршрут', 'ПКМ / Ctrl + миша — обертання 3D'],
              de: ['Stationen Stuttgart (01–08)', 'Residenzstadt 1738–1848 & Route', 'Rechtsklick / Strg — 3D drehen'],
              en: ['Stuttgart Stops (01–08)', 'Residenzstadt 1738–1848 & Route', 'Right-drag / Ctrl — Orbit 3D']
            }[state.lang]
          : cid === 'berlin'
          ? {
              ru: ['Точки Берлина (01–07)', 'Музейный остров и Ось Шинкеля', 'ПКМ / Ctrl + мышь — вращение 3D'],
              ua: ['Точки Берліна (01–07)', 'Музейний острів і Вісь Шинкеля', 'ПКМ / Ctrl + миша — обертання 3D'],
              de: ['Stationen Berlin (01–07)', 'Museumsinsel & Schinkel-Achse', 'Rechtsklick / Strg — 3D drehen'],
              en: ['Berlin Stops (01–07)', 'Museum Island & Schinkel Axis', 'Right-drag / Ctrl — Orbit 3D']
            }[state.lang]
          : {
              ru: ['Точки Гамбурга (01–07)', 'Зона пожара 1842 и маршрут', 'ПКМ / Ctrl + мышь — вращение 3D'],
              ua: ['Точки Гамбурга (01–07)', 'Зона пожежі 1842 і маршрут', 'ПКМ / Ctrl + миша — обертання 3D'],
              de: ['Stationen Hamburg (01–07)', 'Brandgebiet 1842 & Route', 'Rechtsklick / Strg — 3D drehen'],
              en: ['Hamburg Stops (01–07)', '1842 Fire Zone & Route', 'Right-drag / Ctrl — Orbit 3D']
            }[state.lang];
      if (la) la.textContent = legendLabels[0];
      if (lf) lf.textContent = legendLabels[1];
      if (lw) lw.textContent = legendLabels[2];
    }
  }

  function syncMapToolbarUI(mode, cityId) {
    state.mapView = mode;
    if (cityId && DATA.cities.some((c) => c.id === cityId && c.has3DMap)) {
      state.active3DCityId = cityId;
    }
    const isCity = mode === 'city';
    const btnBack = document.getElementById('btn-back-country');
    const btnZoom = document.getElementById('btn-zoom-city');
    const metaLbl = document.getElementById('map-meta-label');
    if (btnBack) btnBack.classList.toggle('is-active', !isCity);
    if (btnZoom) btnZoom.classList.toggle('is-active', isCity);
    if (metaLbl) {
      metaLbl.textContent = isCity
        ? DATA.i18n[state.lang].hub.mapMetaCity
        : DATA.i18n[state.lang].hub.mapMetaCountry;
    }

    updateMap3DButtonsText();

    const fireBtn = document.getElementById('btn-toggle-fire');
    const orbitBtn = document.getElementById('btn-orbit-3d');
    const dockEl = document.getElementById('hamburg-landmarks-dock');
    if (fireBtn) fireBtn.hidden = !isCity;
    if (orbitBtn) orbitBtn.hidden = !isCity;
    if (dockEl) dockEl.hidden = !isCity;
  }

  function init3DMap() {
    const container = document.getElementById('maplibre-canvas');
    if (!container || !window.HamburgDioramaStage || !window.maplibregl) return;

    const initialMode = PAGE_TYPE === 'home' ? 'country' : 'city';
    state.mapView = initialMode;

    state.dioramaStage = new window.HamburgDioramaStage({
      container,
      initialMode,
      initialCityId: state.activeCityId,
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
        if (openOverlay) renderLandmarkOverlay(landmarkId);
      },
      onSelectCityFromCountry: (cityId) => {
        selectCity(cityId, { syncForm: true, flyToCity: false, scrollTab: true });
      }
    });
    state.mapLoaded = true;
    syncMapToolbarUI(initialMode, state.active3DCityId);
    renderLandmarksDock();
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
        <img src="${asset(lm.img)}" alt="${loc(lm, 'name')}" data-lightbox-src="${lm.img}" />
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
     Home Hub: 2-Track Lens Switcher, Timeline, Departure Board & Mobile Tabs
     ------------------------------------------------------------------------ */
  function setTrackLens(trackId) {
    state.activeTrack = trackId || 'all';
    document.querySelectorAll('[data-track-lens]').forEach((btn) => {
      btn.classList.toggle('is-active', btn.getAttribute('data-track-lens') === state.activeTrack);
    });

    const banner = document.getElementById('track-manifesto-banner');
    const textEl = document.getElementById('track-manifesto-text');
    const noteEl = document.getElementById('track-future-note');
    if (banner) {
      if (state.activeTrack === 'all') {
        banner.hidden = true;
      } else {
        const trk = getTrack(state.activeTrack);
        banner.hidden = false;
        banner.style.setProperty('--banner-accent', trk.accentColor);
        if (textEl) textEl.textContent = loc(trk, 'manifesto');
        if (noteEl) noteEl.textContent = loc(trk, 'futureNote');
      }
    }

    if (state.dioramaStage && state.dioramaStage.setTrackFilter) {
      state.dioramaStage.setTrackFilter(state.activeTrack);
      if (state.mapView === 'city') {
        flyToGermanyMacro();
      }
    }

    const visible = getVisibleCities();
    if (visible.length && !visible.some((c) => c.id === state.activeCityId)) {
      selectCity(visible[0].id, { syncForm: true, flyToCity: false, scrollTab: false });
    } else {
      renderTimeline();
      renderCityCards();
    }
  }

  function renderTimeline() {
    const rail = document.getElementById('timeline-rail');
    if (!rail) return;
    const tr = DATA.i18n[state.lang];

    rail.innerHTML = tr.hub.months
      .map((m) => {
        const city = m.cityId ? DATA.cities.find((c) => c.id === m.cityId) : null;
        const hiddenByTrack = city && state.activeTrack !== 'all' && city.trackId !== state.activeTrack;
        const isActive = city && city.id === state.activeCityId && !hiddenByTrack;
        return `
        <button type="button"
          class="month-cell ${city && !hiddenByTrack ? 'has-city' : ''} ${isActive ? 'is-active' : ''} ${hiddenByTrack ? 'is-dimmed-track' : ''}"
          ${city && !hiddenByTrack ? `data-select-city="${city.id}"` : 'disabled'}>
          <span class="month-cell__name">${m.label}</span>
          <span class="month-cell__year">${m.year}</span>
          ${city ? `<span class="month-cell__city">${loc(city, 'name')}</span>` : ''}
        </button>`;
      })
      .join('');
  }

  function renderMobileCityTabs(scrollIntoView = false) {
    const tabsEl = document.getElementById('mobile-city-tabs');
    if (!tabsEl) return;

    tabsEl.innerHTML = getVisibleCities()
      .map((city) => {
        const isActive = city.id === state.activeCityId;
        const mon = getCityShortMonth(city.id);
        const trk = getTrack(city.trackId);
        return `
        <button type="button"
          role="tab"
          aria-selected="${isActive ? 'true' : 'false'}"
          class="mobile-city-tab ${isActive ? 'is-active' : ''}"
          style="--tab-accent: ${city.accentColor}"
          data-select-city="${city.id}">
          <span class="mobile-city-tab__num">${trk.symbol} ${city.issueNo}</span>
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
    const trk = getTrack(city.trackId);
    const v3 = DATA.i18n[state.lang].v3;

    const statusClass =
      city.status === 'active' ? 'is-active-status' : city.status === 'forming' ? 'is-forming-status' : '';
    const reserveLbl = { en: 'Pre-Register', de: 'Vormerken', ru: 'Предзапись', ua: 'Передзапис' }[state.lang];

    wrap.innerHTML = `
      <article class="mobile-active-card" style="--card-accent: ${city.accentColor}">
        <div class="mobile-active-card__head">
          <span class="track-pill track-pill--sm" style="--pill-accent: ${trk.accentColor}">${trk.symbol} ${loc(trk, 'name')}</span>
          <span class="city-card__status ${statusClass}">${loc(city, 'statusLabel')}</span>
        </div>
        <span class="mono-label mobile-active-card__issue">№${city.issueNo} · ${loc(city, 'dates')}</span>
        <h3 class="mobile-active-card__title">${loc(city, 'name')}: ${loc(city, 'title')}</h3>
        <p class="mobile-active-card__sub">${loc(city, 'subtitle')}</p>
        <div class="mobile-active-card__actions">
          <a href="${cityPageUrl(city.id)}" class="btn btn--primary mobile-active-card__btn">${v3.enterCityBtn}</a>
          <button type="button" class="btn btn--outline mobile-active-card__btn" data-prefill-city="${city.id}">${reserveLbl}</button>
        </div>
      </article>`;
  }

  function renderCityCards() {
    const container = document.getElementById('city-cards');
    const v3 = DATA.i18n[state.lang].v3;
    if (container) {
      container.innerHTML = getVisibleCities()
        .map((city) => {
          const isActive = city.id === state.activeCityId;
          const trk = getTrack(city.trackId);
          const statusClass =
            city.status === 'active' ? 'is-active-status' : city.status === 'forming' ? 'is-forming-status' : '';

          return `
          <div class="city-card city-card--hub ${isActive ? 'is-active' : ''}"
            style="--card-accent: ${city.accentColor}"
            data-select-city="${city.id}"
            data-city-track="${city.trackId}"
            tabindex="0">
            <span class="city-card__issue">№${city.issueNo}</span>
            <div class="city-card__main">
              <div class="city-card__top">
                <strong class="city-card__name">${loc(city, 'name')}</strong>
                <span class="city-card__dates">${loc(city, 'dates')}</span>
              </div>
              <span class="track-pill track-pill--sm" style="--pill-accent: ${trk.accentColor}">${trk.symbol} ${loc(trk, 'name')}</span>
              <p class="city-card__theme">${loc(city, 'title')}</p>
              <div class="city-card__foot">
                <span class="city-card__status ${statusClass}">${loc(city, 'statusLabel')}</span>
                <a href="${cityPageUrl(city.id)}" class="city-card__enter-link" data-city-link>${v3.enterCityBtn}</a>
              </div>
            </div>
          </div>`;
        })
        .join('');
    }

    renderMobileCityTabs(false);
    renderMobileActiveCityCard();
    updateMobileStickyCta();
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

  /* ------------------------------------------------------------------------
     City Page Dossier Tabs (Story / 4-Day Schedule / Archive)
     ------------------------------------------------------------------------ */
  function renderDossier() {
    const shell = document.getElementById('dossier-shell');
    if (!shell) return;
    const city = getActiveCity();
    const tr = DATA.i18n[state.lang].dossier;
    if (city.isLabStub) return; // Already cleanly pre-rendered in static HTML!

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
                  <img src="${asset(act.image)}" alt="${loc(act, 'imageCaption')}" loading="lazy" />
                  <figcaption>${loc(act, 'imageCaption')}</figcaption>
                </figure>
              </article>`;
            })
            .join('')}
        </div>`;
    } else if (state.dossierTab === 'schedule') {
      const dayMetaBadge = {
        en: '4–10 PARTICIPANTS · SEMINAR HALL & MUSEUMS',
        de: '4–10 TEILNEHMENDE · KONFERENZRAUM & MUSEEN',
        ru: '4–10 УЧАСТНИКОВ · ЗАЛ И МУЗЕИ',
        ua: '4–10 УЧАСНИКІВ · ЗАЛ І МУЗЕЇ'
      }[state.lang];

      bodyHtml = `
        <div class="schedule-panel">
          <div class="weekend-callout">${tr.scheduleNotice}</div>
          <div class="days-grid">
            ${city.days
              .map((day, idx) => {
                const isFinalDay4 = day.dayNum === 4 && city.days.length === 4;
                const slotLabels =
                  day.dayNum === 1
                    ? {
                        ru: ['УТРО · ПРИБЫТИЕ', 'ДЕНЬ · СТАРТ ПРОГРАММЫ', 'ВЕЧЕР · ЗНАКОМСТВО И ЛЕКЦИЯ'],
                        ua: ['РАНОК · ПРИБУТТЯ', 'ДЕНЬ · СТАРТ ПРОГРАМИ', 'ВЕЧІР · ЗНАЙОМСТВО І ЛЕКЦІЯ'],
                        de: ['MORGEN · ANREISE', 'TAG · AUFTAKT & PROGRAMM', 'ABEND · EINFÜHRUNG & GESPRÄCH'],
                        en: ['MORNING · ARRIVAL', 'AFTERNOON · OPENING WALK', 'EVENING · INTRODUCTION & TALK']
                      }[state.lang]
                    : day.dayNum === 5
                    ? {
                        ru: ['УТРО · ЗАКРЫТОЕ СОБРАНИЕ', 'АКТ · МОМЕНТ УЗНАВАНИЯ', 'ФИНАЛ · ПАМЯТНЫЙ ЗНАК И ОТЪЕЗД'],
                        ua: ['РАНОК · ЗАКРИТІ ЗБОРИ', 'АКТ · МОМЕНТ УПІЗНАННЯ', 'ФІНАЛ · ПАМ’ЯТНИЙ ЗНАК І ВІД’ЇЗД'],
                        de: ['MORGEN · GESCHLOSSENE RUNDE', 'AKT · MOMENT DES ERKENNENS', 'ABSCHLUSS · ERINNERUNG & ABREISE'],
                        en: ['MORNING · CLOSED ROOM', 'ACT · MOMENT OF RECOGNITION', 'CLOSING · KEEPSAKE & DEPARTURE']
                      }[state.lang]
                    : isFinalDay4
                    ? {
                        ru: ['УТРО · ФИНАЛЬНАЯ ЛЕКЦИЯ В ЗАЛЕ', 'ДЕНЬ · ПРОЩАЛЬНЫЙ МАРШРУТ И ОТЪЕЗД', 'ПОСЛЕ · АРХИВ И ИСТОЧНИКИ'],
                        ua: ['РАНОК · ФІНАЛЬНА ЛЕКЦІЯ В ЗАЛІ', 'ДЕНЬ · ПРОЩАЛЬНА ПРОГУЛЯНКА І ВІД’ЇЗД', 'ПІСЛЯ · АРХІВ І ДЖЕРЕЛА'],
                        de: ['MORGEN · ABSCHLUSSVORLESUNG', 'TAG · AUSKLANG & ABREISE', 'DANACH · LITERATUR & NOTIZEN'],
                        en: ['MORNING · CLOSING LECTURE', 'AFTERNOON · CLOSING & DEPARTURE', 'FOLLOW-UP · ARCHIVE & READING LIST']
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
                    <div class="day-slot"><h4>${slotLabels[0]}</h4><p>${loc(day, 'morning')}</p></div>
                    <div class="day-slot"><h4>${slotLabels[1]}</h4><p>${loc(day, 'afternoon')}</p></div>
                    <div class="day-slot"><h4>${slotLabels[2]}</h4><p>${loc(day, 'evening')}</p></div>
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
                <img src="${asset(art.src)}" alt="${loc(art, 'title')}" loading="lazy" />
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

    shell.innerHTML = `${tabsHtml}${bodyHtml}`;
  }

  /* ------------------------------------------------------------------------
     City Hero Mobile Reel (Hamburg 3-frame OR Stuttgart/Berlin 4-frame)
     ------------------------------------------------------------------------ */
  function renderHeroReelSlide(index) {
    const reel = document.getElementById('hero-mobile-reel');
    if (!reel) return;
    const mode = reel.dataset.reelMode || 'hamburg';
    const slides = reel.querySelectorAll('.hero-reel__slide');
    const bars = reel.querySelectorAll('.hero-reel__bar');
    if (!slides.length) return;

    const idx = ((index % slides.length) + slides.length) % slides.length;
    state.reelIndex = idx;

    const years =
      mode === 'stuttgart'
        ? ['1738', '1782', '1839', '1855']
        : mode === 'berlin'
        ? ['1813', '1831', '1834', '1846']
        : ['1840', '1842', '1843'];
    const caps =
      mode === 'stuttgart'
        ? {
            en: ['Enlightenment · Tyranny', 'Schiller · Romanticism', 'Bronze Duel · 1848', 'Hegel · Autumn Loop'],
            de: ['Aufklärung · Willkür', 'Schiller · Romantik', 'Denkmalstreit · 1848', 'Hegel · Herbstbogen'],
            ru: ['Просвещение · Тирания', 'Шиллер · Романтизм', 'Спор 1839 · Баррикады', 'Гегель · Петля времени'],
            ua: ['Просвітництво · Тиранія', 'Шиллер · Романтизм', 'Спір 1839 · Барикади', 'Гегель · Петля часу']
          }[state.lang]
        : mode === 'berlin'
        ? {
            en: ['Schinkel · Acropolis', 'Hummel · Granite Bowl', 'Gaertner · Panorama', 'Camera Survey'],
            de: ['Schinkel · Akropolis', 'Hummel · Granitschale', 'Gaertner · Panorama', 'Foto-Inventur'],
            ru: ['Шинкель · Собор', 'Хуммель · Гранитная чаша', 'Гертнер · Панорама', 'Срыв покрова'],
            ua: ['Шинкель · Собор', 'Хуммель · Гранітна чаша', 'Гертнер · Панорама', 'Десакралізація']
          }[state.lang]
        : DATA.i18n[state.lang].hero.triptych;

    slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
    bars.forEach((b, i) => {
      b.classList.remove('is-active', 'is-done');
      if (i < idx) b.classList.add('is-done');
      else if (i === idx) {
        void b.offsetWidth;
        b.classList.add('is-active');
      }
    });

    const yEl = document.getElementById('reel-year');
    const cEl = document.getElementById('reel-cap');
    if (yEl) yEl.textContent = years[idx] || '';
    if (cEl) cEl.textContent = caps[idx] || '';
  }

  function startHeroReelLoop() {
    if (state.reelTimer) {
      clearInterval(state.reelTimer);
      state.reelTimer = null;
    }
    const reel = document.getElementById('hero-mobile-reel');
    if (!reel) return;
    renderHeroReelSlide(state.reelIndex);
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    state.reelTimer = setInterval(() => {
      renderHeroReelSlide(state.reelIndex + 1);
    }, 4200);
  }

  /* ------------------------------------------------------------------------
     Stuttgart Signature Interactive: 1738 -> 1855 Time-Loop & Bronze Duel
     ------------------------------------------------------------------------ */
  function renderStuttgartTimeNode(nodeId) {
    const stage = document.getElementById('timeloop-stage');
    if (!stage || !DATA.stuttgartInteractive) return;
    const nodes = DATA.stuttgartInteractive.nodes;
    const node = nodes.find((n) => n.id === nodeId) || nodes[0];
    state.activeTimeNodeId = node.id;

    document.querySelectorAll('[data-tl-node].timeloop-node').forEach((btn) => {
      const id = btn.getAttribute('data-tl-node');
      btn.classList.toggle('is-active', id === node.id);
      btn.classList.toggle('is-echo-target', id === node.echoTargetId);
    });

    const img = document.getElementById('tl-img');
    const yr = document.getElementById('tl-year-badge');
    const echo = document.getElementById('tl-echo');
    const title = document.getElementById('tl-title');
    const excerpt = document.getElementById('tl-excerpt');
    const duelWrap = document.getElementById('tl-duel');
    const mapBtn = document.getElementById('tl-jump-map');
    const echoBtn = document.getElementById('tl-follow-echo');

    if (img) {
      img.src = asset(node.image);
      img.alt = loc(node, 'title');
    }
    if (yr) yr.textContent = node.year;
    if (echo) echo.textContent = loc(node, 'echo');
    if (title) title.textContent = loc(node, 'title');
    if (excerpt) excerpt.textContent = loc(node, 'excerpt');
    if (mapBtn) mapBtn.setAttribute('data-tl-landmark', node.landmarkId);

    const targetNode = nodes.find((n) => n.id === node.echoTargetId);
    if (echoBtn && targetNode) {
      echoBtn.setAttribute('data-tl-node', targetNode.id);
      const jumpWord = { en: 'Jump to Echo:', de: 'Zum Echo:', ru: 'К отклику:', ua: 'До відгуку:' }[state.lang];
      echoBtn.textContent = `${jumpWord} ${targetNode.year} · ${loc(targetNode, 'short')} →`;
    }

    if (duelWrap) {
      if (node.duel) {
        const d = node.duel;
        duelWrap.hidden = false;
        duelWrap.innerHTML = `
          <div class="duel-card">
            <span class="mono-label duel-card__tag">${loc(d, 'leftTag')}</span>
            <h4>${loc(d, 'leftTitle')}</h4>
            <p>${loc(d, 'leftText')}</p>
          </div>
          <div class="duel-card duel-card--alt">
            <span class="mono-label duel-card__tag">${loc(d, 'rightTag')}</span>
            <h4>${loc(d, 'rightTitle')}</h4>
            <p>${loc(d, 'rightText')}</p>
          </div>`;
      } else {
        duelWrap.hidden = true;
        duelWrap.innerHTML = '';
      }
    }
  }

  function toggleTimeLoopAuto() {
    const btn = document.getElementById('btn-timeloop-auto');
    state.timeLoopAuto = !state.timeLoopAuto;
    if (state.timeLoopTimer) {
      clearInterval(state.timeLoopTimer);
      state.timeLoopTimer = null;
    }
    if (btn) {
      const lbls = {
        en: state.timeLoopAuto ? '⏸ Pause Walk' : '▶ Auto-Walk (7 Turning Points)',
        de: state.timeLoopAuto ? '⏸ Pause' : '▶ Rundgang starten (7 Stationen)',
        ru: state.timeLoopAuto ? '⏸ Пауза' : '▶ Авто-прогулка по петле (7 узлов)',
        ua: state.timeLoopAuto ? '⏸ Пауза' : '▶ Авто-прогулянка петлею (7 вузлів)'
      }[state.lang];
      btn.textContent = lbls;
      btn.classList.toggle('is-active', state.timeLoopAuto);
      btn.setAttribute('aria-pressed', String(state.timeLoopAuto));
    }
    if (state.timeLoopAuto && DATA.stuttgartInteractive) {
      const nodes = DATA.stuttgartInteractive.nodes;
      state.timeLoopTimer = setInterval(() => {
        const cur = nodes.findIndex((n) => n.id === state.activeTimeNodeId);
        const nxt = nodes[(cur + 1) % nodes.length];
        renderStuttgartTimeNode(nxt.id);
      }, 4200);
    }
  }

  /* ------------------------------------------------------------------------
     Berlin Signature Interactive: Tearing the Sacred Veil (1831 <-> 1913)
     ------------------------------------------------------------------------ */
  function setBerlinVeilPos(rawVal) {
    const stage = document.getElementById('veil-stage');
    if (!stage) return;
    const clamped = Math.max(0, Math.min(100, Math.round(Number(rawVal) || 0)));
    state.berlinVeilPos = clamped;
    stage.style.setProperty('--veil-pos', `${clamped}%`);

    const rangeEl = document.getElementById('veil-range');
    if (rangeEl && Number(rangeEl.value) !== clamped) {
      rangeEl.value = String(clamped);
    }

    const leftBadge = document.getElementById('veil-left-badge');
    const rightBadge = document.getElementById('veil-right-badge');
    if (leftBadge) leftBadge.classList.toggle('is-faded', clamped < 18);
    if (rightBadge) rightBadge.classList.toggle('is-faded', clamped > 82);

    const readoutEl = document.getElementById('veil-readout');
    if (readoutEl) {
      const lbl = {
        en: 'Painting Veil',
        de: 'Gemälde-Schleier',
        ru: 'Покров живописи',
        ua: 'Покров живопису'
      }[state.lang];
      readoutEl.textContent = `${lbl}: ${clamped}%`;
    }

    document.querySelectorAll('[data-veil-preset]').forEach((btn) => {
      const pVal = Number(btn.getAttribute('data-veil-preset'));
      btn.classList.toggle('is-active', Math.abs(clamped - pVal) <= 4);
    });
  }

  function renderBerlinVeilLayer(layerId) {
    const bi = DATA.berlinInteractive;
    if (!bi || !document.getElementById('berlin-veil')) return;
    const isMenzel = layerId === 'menzel';
    state.berlinVeilLayer = isMenzel
      ? 'menzel'
      : bi.layers.some((l) => l.id === layerId)
      ? layerId
      : bi.layers[0].id;

    document.querySelectorAll('[data-veil-layer]').forEach((btn) => {
      const isMatch = btn.getAttribute('data-veil-layer') === state.berlinVeilLayer;
      btn.classList.toggle('is-active', isMatch);
      btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });

    const menzelPresetBtn = document.getElementById('btn-veil-menzel');
    if (menzelPresetBtn) menzelPresetBtn.classList.toggle('is-active', isMenzel);

    const curtainPanel = document.getElementById('berlin-curtain-panel');
    const menzelPanel = document.getElementById('berlin-menzel-panel');
    if (curtainPanel) curtainPanel.hidden = isMenzel;
    if (menzelPanel) menzelPanel.hidden = !isMenzel;
    if (isMenzel) return;

    const layer = bi.layers.find((l) => l.id === state.berlinVeilLayer) || bi.layers[0];
    const leftImg = document.getElementById('veil-left-img');
    const rightImg = document.getElementById('veil-right-img');
    const leftBadge = document.getElementById('veil-left-badge');
    const rightBadge = document.getElementById('veil-right-badge');
    const tagEl = document.getElementById('veil-tag');
    const titleEl = document.getElementById('veil-title');
    const lossEl = document.getElementById('veil-loss');
    const thesisEl = document.getElementById('veil-thesis');
    const jumpBtn = document.getElementById('veil-jump-map');

    if (leftImg) {
      leftImg.src = asset(layer.leftImg);
      leftImg.alt = loc(layer, 'leftBadge');
    }
    if (rightImg) {
      rightImg.src = asset(layer.rightImg);
      rightImg.alt = loc(layer, 'rightBadge');
      rightImg.className = `veil-img veil-img--right is-filter-${layer.rightFilter || 'daguerre'}`;
    }
    if (leftBadge) leftBadge.textContent = loc(layer, 'leftBadge');
    if (rightBadge) rightBadge.textContent = loc(layer, 'rightBadge');
    if (tagEl) tagEl.textContent = loc(layer, 'tag');
    if (titleEl) titleEl.textContent = loc(layer, 'title');
    if (lossEl) lossEl.textContent = loc(layer, 'loss');
    if (thesisEl) thesisEl.textContent = loc(layer, 'thesis');
    if (jumpBtn) jumpBtn.setAttribute('data-veil-landmark', layer.landmarkId);
  }

  /* ------------------------------------------------------------------------
     Hamburg Signature Interactive: Unified 1840 <-> 1843 Face Study
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
    const wrap = document.getElementById('compare-pins-view');
    const img1840 = document.getElementById('compare-1840-img');
    const img1843 = document.getElementById('compare-1843-img');
    if (!wrap || !img1840 || !img1843) return;

    const fc = DATA.faceComparison;
    const person = fc.persons.find((p) => p.id === state.activePersonId) || fc.persons[1];
    const canZoomPair = state.compareView === 'closeup' && person && person.onCanvas;

    wrap.classList.toggle('is-closeup', state.compareView === 'closeup');
    wrap.classList.toggle('is-full-canvas', state.compareView === 'full');

    if (canZoomPair) {
      const scale = 2.55;
      const tx40 = Math.max(-30, Math.min(30, 50 - person.face1840.x));
      const ty40 = Math.max(-30, Math.min(30, 50 - person.face1840.y));
      img1840.style.transform = `scale(${scale}) translate(${tx40}%, ${ty40}%)`;
      if (state.activePlate === 'plate1843a') {
        const tx43 = Math.max(-30, Math.min(30, 50 - person.face1843.x));
        const ty43 = Math.max(-30, Math.min(30, 50 - person.face1843.y));
        img1843.style.transform = `scale(${scale}) translate(${tx43}%, ${ty43}%)`;
      } else {
        img1843.style.transform = 'scale(1) translate(0%, 0%)';
      }
    } else {
      img1840.style.transform = 'scale(1) translate(0%, 0%)';
      img1843.style.transform = 'scale(1) translate(0%, 0%)';
    }

    const btnC = document.getElementById('btn-compare-closeup');
    const btnF = document.getElementById('btn-compare-full');
    if (btnC) btnC.classList.toggle('is-active', state.compareView === 'closeup');
    if (btnF) btnF.classList.toggle('is-active', state.compareView === 'full');
  }

  function renderCompareModule() {
    if (!document.getElementById('compare-pins-view')) return;
    const fc = DATA.faceComparison;
    const tr = DATA.i18n[state.lang].compare;

    const plateMap = {
      plate1843a: fc.daguerreotype1843a || fc.plate1843a,
      plate1843b: fc.daguerreotype1843b || fc.plate1843b,
      plate1842ruins: fc.daguerreotype1842ruins || fc.plate1842ruins
    };
    const img1843 = document.getElementById('compare-1843-img');
    img1843.src = asset(plateMap[state.activePlate] || fc.daguerreotype1843a || 'фото и картины/hamburg/photo_7_2026-11-18_13-34-16.jpg');

    const switcher = document.getElementById('plate-switcher');
    switcher.innerHTML = ['plate1843a', 'plate1843b', 'plate1842ruins']
      .map(
        (key) => `
      <button type="button" class="plate-switch-btn ${state.activePlate === key ? 'is-active' : ''}" data-plate="${key}">
        ${tr.plateButtons[key]}
      </button>`
      )
      .join('');

    const onCanvasPersons = fc.persons.filter((p) => p.onCanvas);
    document.getElementById('hotspots-1840').innerHTML = onCanvasPersons
      .map(
        (p) => `
      <span class="face-focus-ring ${p.id === state.activePersonId ? 'is-active' : ''}" style="left:${p.face1840.x}%; top:${p.face1840.y}%;" data-face-ring="${p.id}"></span>
      <button type="button" class="hotspot-pin ${p.id === state.activePersonId ? 'is-active' : ''}" style="left:${p.badge1840.x}%; top:${p.badge1840.y}%;" data-person-id="${p.id}" title="${loc(p, 'name')}">${p.num}</button>`
      )
      .join('');

    document.getElementById('hotspots-1843').innerHTML =
      state.activePlate === 'plate1843a'
        ? onCanvasPersons
            .map(
              (p) => `
      <span class="face-focus-ring ${p.id === state.activePersonId ? 'is-active' : ''}" style="left:${p.face1843.x}%; top:${p.face1843.y}%;" data-face-ring="${p.id}"></span>
      <button type="button" class="hotspot-pin ${p.id === state.activePersonId ? 'is-active' : ''}" style="left:${p.badge1843.x}%; top:${p.badge1843.y}%;" data-person-id="${p.id}" title="${loc(p, 'name')}">${p.num}</button>`
            )
            .join('')
        : '';

    document.getElementById('person-selector').innerHTML = fc.persons
      .map(
        (p) => `
      <button type="button" class="hero-chip ${p.id === state.activePersonId ? 'is-active' : ''}" data-person-id="${p.id}">
        <span>${p.num}</span> ${loc(p, 'name')}
      </button>`
      )
      .join('');

    updateActivePersonUI();
  }

  function updateActivePersonUI() {
    const dossierEl = document.getElementById('person-dossier');
    if (!dossierEl) return;
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

    dossierEl.innerHTML = `
      <div class="person-dossier__head">
        <h3>${person.num}. ${loc(person, 'name')} <small class="mono-label">(${person.years})</small></h3>
        <span class="mono-label">${loc(person, 'role')}</span>
      </div>
      <p class="person-bio-text">${loc(person, 'bio')}</p>
      <blockquote class="trial-excerpt">${loc(person, 'trialExcerpt')}</blockquote>
      <div class="person-dossier__cols">
        <div class="person-dossier__col"><h4>${lbl1840}</h4><p>${loc(person, 'desc1840')}</p></div>
        <div class="person-dossier__col"><h4>${lbl1843}</h4><p>${loc(person, 'desc1843')}</p></div>
      </div>
      <div class="person-works-wrap">
        <h4>${lblWorks}</h4>
        <div class="person-works-grid">
          ${person.works
            .map(
              (w) => `
            <div class="work-chip">
              <img src="${asset(w.thumb)}" alt="${w.title}" loading="lazy" />
              <div><strong>${w.title}</strong><small>${w.museum}</small></div>
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
      state.activePersonId = canvasIds[(cur + 1) % canvasIds.length];
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
          if (state.compareInView && state.compareAutoPlay) startCompareAutoTour();
          else stopCompareAutoTour();
        });
      },
      { threshold: 0.2 }
    );
    obs.observe(sec);
  }

  /* ------------------------------------------------------------------------
     Mobile Sticky CTA Bar (Silky fade after Hero, hides at Ticket Form)
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
     Fahrkarte Pre-Registration Form + Telegram Bot Delivery (+ Source Tracking)
     ------------------------------------------------------------------------ */
  function buildTicketMessage() {
    const citySel = document.getElementById('f-city');
    const cityId = (citySel && citySel.value) || state.activeCityId;
    const city = DATA.cities.find((c) => c.id === cityId) || DATA.cities[0];
    const seats = (document.getElementById('f-seats') && document.getElementById('f-seats').value) || '1';
    const groupLang = (document.getElementById('f-lang') && document.getElementById('f-lang').value) || 'EN';
    const guestFallback = { ru: 'Гость', ua: 'Гість', de: 'Gast', en: 'Guest' }[state.lang];
    const nameEl = document.getElementById('f-name');
    const contactEl = document.getElementById('f-contact');
    const commentEl = document.getElementById('f-comment');
    const name = (nameEl && nameEl.value.trim()) || guestFallback;
    const contact = (contactEl && contactEl.value.trim()) || '—';
    const comment = (commentEl && commentEl.value.trim()) || '';

    const msgDict = {
      en: { head: '📌 EXPEDITION PRE-REGISTRATION · 2027', city: 'City', dates: 'Dates', format: 'Format: 4-day / 3-night seminar program (conference hall & museums)', seats: 'Seats', lang: 'Group language', name: 'Name', contact: 'Contact', comment: 'Comment', src: 'Source' },
      de: { head: '📌 VORANMELDUNG EXPEDITION · 2027', city: 'Stadt', dates: 'Termine', format: 'Format: 4 Tage / 3 Nächte (Vorträge, Konferenzraum & Museen)', seats: 'Plätze', lang: 'Gruppensprache', name: 'Name', contact: 'Kontakt', comment: 'Kommentar', src: 'Quelle' },
      ru: { head: '📌 ПРЕДЗАПИСЬ НА ЭКСПЕДИЦИЮ · 2027', city: 'Город', dates: 'Даты', format: 'Формат: 4 дня / 3 ночи (лекции, конференц-зал и музеи)', seats: 'Количество мест', lang: 'Язык группы', name: 'Имя', contact: 'Контакт', comment: 'Комментарий', src: 'Источник' },
      ua: { head: '📌 ПЕРЕДЗАПИС НА ЕКСПЕДИЦІЮ · 2027', city: 'Місто', dates: 'Дати', format: 'Формат: 4 дні / 3 ночі (лекції, конференц-зал і музеї)', seats: 'Кількість місць', lang: 'Мова групи', name: 'Ім’я', contact: 'Контакт', comment: 'Коментар', src: 'Джерело' }
    }[state.lang];

    const lines = [
      msgDict.head,
      `${msgDict.city}: ${loc(city, 'name')} (№${city.issueNo})`,
      `${msgDict.dates}: ${loc(city, 'dates')}`,
      msgDict.format,
      `${msgDict.seats}: ${seats}`,
      `${msgDict.lang}: ${groupLang}`,
      `${msgDict.name}: ${name}`,
      `${msgDict.contact}: ${contact}`
    ];
    if (comment) lines.push(`${msgDict.comment}: ${comment}`);
    lines.push(`📊 ${msgDict.src}: ${getTrafficSource()} · ${window.location.pathname || '/'}`);

    return { text: lines.join('\n'), city, seats, groupLang, name };
  }

  function updateTicketPreview() {
    if (!document.getElementById('tp-city')) return;
    const { text, city, seats, groupLang, name } = buildTicketMessage();
    const issueEl = document.getElementById('tp-issue');
    const cityEl = document.getElementById('tp-city');
    const datesEl = document.getElementById('tp-dates');
    const personEl = document.getElementById('tp-person');
    const msgEl = document.getElementById('tp-message');
    if (issueEl) issueEl.textContent = `№ ${city.issueNo}`;
    if (cityEl) cityEl.textContent = loc(city, 'name');
    if (datesEl) datesEl.textContent = loc(city, 'dates');
    if (personEl) personEl.textContent = `${name} · ${seats} · ${groupLang}`;
    if (msgEl) msgEl.textContent = text;

    const handle = DATA.meta.telegramBot.fallbackHandle || 'Grygoryshyn';
    const directBtn = document.getElementById('btn-open-direct');
    if (directBtn) directBtn.href = `https://t.me/${handle}?text=${encodeURIComponent(text)}`;
  }

  function scrollToRegistrationForm() {
    const target = document.getElementById('ticket-section');
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      const nameInput = document.getElementById('f-name');
      if (nameInput) nameInput.focus({ preventScroll: true });
    }, 450);
  }

  async function sendToTelegramBot(payloadText) {
    const statusEl = document.getElementById('bot-status');
    const tr = DATA.i18n[state.lang].tariffs.form;
    statusEl.textContent = tr.sending;

    const endpoint = DATA.siteConfig && DATA.siteConfig.formEndpoint;
    if (endpoint) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: payloadText })
        });
        statusEl.textContent = res.ok ? tr.sentOk : tr.sentWarn;
      } catch {
        statusEl.textContent = tr.sentWarn;
      }
      return;
    }

    const botCfg = DATA.meta && DATA.meta.telegramBot;
    const token = botCfg && botCfg.token;
    if (!token) {
      statusEl.textContent = tr.sentWarn;
      return;
    }

    const { admins = [], knownChatIds = [] } = botCfg;
    const adminUsernamesLower = admins.map((a) => a.toLowerCase());
    const resolvedIds = new Set([...knownChatIds]);

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
    } catch {}

    try {
      const deliveries = await Promise.all(
        [...resolvedIds].map((chatId) =>
          fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: payloadText })
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
    if (!dialog) return;
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
    const idx = list.findIndex((a) => a.src === src || asset(a.src) === src);
    if (idx !== -1) openLightboxById(list[idx].id);
  }

  function renderLightboxContent() {
    const item = state.lightboxList[state.lightboxIndex];
    if (!item) return;
    document.getElementById('dialog-meta').textContent = `${item.dayRef} · ${item.year} · (${state.lightboxIndex + 1}/${state.lightboxList.length})`;
    document.getElementById('dialog-img').src = asset(item.src);
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

    state.activeCityId = cityId;
    setAccentColor(city.accentColor);

    const coordsEl = document.getElementById('map-active-coords');
    if (coordsEl) coordsEl.textContent = city.coords;

    renderTimeline();
    renderCityCards();
    if (scrollTab) renderMobileCityTabs(true);

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
      const fCity = document.getElementById('f-city');
      if (fCity) fCity.value = cityId;
      updateTicketPreview();
    }
  }

  /* ------------------------------------------------------------------------
     Event Delegation & Bindings
     ------------------------------------------------------------------------ */
  function bindEvents() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const drawer = document.getElementById('mobile-drawer');
    if (menuBtn && drawer) {
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
    }

    const heroPrimaryCta = document.getElementById('hero-cta-primary');
    if (heroPrimaryCta && PAGE_TYPE === 'home') {
      heroPrimaryCta.addEventListener('click', () => flyToGermanyMacro());
    }

    const btnBack = document.getElementById('btn-back-country');
    if (btnBack) btnBack.addEventListener('click', () => flyToGermanyMacro());

    const btnZoom = document.getElementById('btn-zoom-city');
    if (btnZoom) {
      btnZoom.addEventListener('click', () => {
        const target3D = state.active3DCityId || 'stuttgart';
        selectCity(target3D, { syncForm: true, flyToCity: true, scrollTab: true });
      });
    }

    const fireBtn = document.getElementById('btn-toggle-fire');
    if (fireBtn) {
      fireBtn.addEventListener('click', () => {
        if (state.dioramaStage && state.dioramaStage.toggleFireLayer) {
          const isOn = state.dioramaStage.toggleFireLayer();
          fireBtn.classList.toggle('is-active', isOn);
        }
      });
    }

    const orbitBtn = document.getElementById('btn-orbit-3d');
    if (orbitBtn) {
      orbitBtn.addEventListener('click', () => {
        if (state.dioramaStage) state.dioramaStage.rotateAngleStep();
      });
    }

    const ovClose = document.getElementById('ov-close');
    const ovPrev = document.getElementById('ov-prev');
    const ovNext = document.getElementById('ov-next');
    if (ovClose) ovClose.addEventListener('click', () => closeLandmarkOverlay());
    if (ovPrev) ovPrev.addEventListener('click', () => stepLandmarkOverlay(-1));
    if (ovNext) ovNext.addEventListener('click', () => stepLandmarkOverlay(1));

    const tlAuto = document.getElementById('btn-timeloop-auto');
    if (tlAuto) tlAuto.addEventListener('click', () => toggleTimeLoopAuto());

    // Delegated clicks
    document.addEventListener('click', (e) => {
      // Allow direct <a> links inside cards to navigate normally!
      if (e.target.closest('[data-city-link]')) return;

      const lensBtn = e.target.closest('[data-track-lens]');
      if (lensBtn) {
        setTrackLens(lensBtn.getAttribute('data-track-lens'));
        return;
      }

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

      const prefillBtn = e.target.closest('[data-prefill-city]');
      if (prefillBtn) {
        selectCity(prefillBtn.getAttribute('data-prefill-city'), { syncForm: true, flyToCity: false });
        scrollToRegistrationForm();
        return;
      }

      const pickCardBtn = e.target.closest('[data-pick-card]');
      if (pickCardBtn) {
        const cardId = pickCardBtn.getAttribute('data-pick-card');
        if (cardId === 'full') selectCity('stuttgart', { syncForm: true, flyToCity: false });
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

      const tlNode = e.target.closest('[data-tl-node]');
      if (tlNode) {
        if (state.timeLoopAuto) toggleTimeLoopAuto();
        renderStuttgartTimeNode(tlNode.getAttribute('data-tl-node'));
        return;
      }

      const tlMapBtn = e.target.closest('[data-tl-landmark]');
      if (tlMapBtn) {
        const lmId = tlMapBtn.getAttribute('data-tl-landmark');
        const mapSec = document.getElementById('city-map');
        if (mapSec) mapSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => focusLandmark3D(lmId, true), 350);
        return;
      }

      const veilLayerBtn = e.target.closest('[data-veil-layer]');
      if (veilLayerBtn) {
        renderBerlinVeilLayer(veilLayerBtn.getAttribute('data-veil-layer'));
        return;
      }

      const veilPresetBtn = e.target.closest('[data-veil-preset]');
      if (veilPresetBtn) {
        if (state.berlinVeilLayer === 'menzel') renderBerlinVeilLayer('l1');
        setBerlinVeilPos(veilPresetBtn.getAttribute('data-veil-preset'));
        return;
      }

      if (e.target.closest('#btn-veil-menzel') || e.target.closest('#veil-next-menzel')) {
        renderBerlinVeilLayer('menzel');
        return;
      }

      if (e.target.closest('#btn-veil-back')) {
        renderBerlinVeilLayer('l1');
        setBerlinVeilPos(state.berlinVeilPos || 52);
        return;
      }

      const veilMapBtn = e.target.closest('[data-veil-landmark]');
      if (veilMapBtn) {
        const lmId = veilMapBtn.getAttribute('data-veil-landmark');
        const mapSec = document.getElementById('city-map');
        if (mapSec) mapSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => focusLandmark3D(lmId, true), 350);
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
        if (isPinClick) state.compareView = 'closeup';
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

    // Hover highlight on Hamburg hotspots
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

    const veilRange = document.getElementById('veil-range');
    if (veilRange) {
      veilRange.addEventListener('input', (e) => {
        if (state.berlinVeilLayer === 'menzel') renderBerlinVeilLayer('l1');
        setBerlinVeilPos(e.target.value);
      });
    }

    // Form bindings
    ['f-city', 'f-seats', 'f-lang', 'f-name', 'f-contact', 'f-comment'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', updateTicketPreview);
      el.addEventListener('change', () => {
        if (id === 'f-city' && PAGE_TYPE === 'home') {
          selectCity(el.value, { syncForm: false, flyToCity: false });
        }
        updateTicketPreview();
      });
    });

    const form = document.getElementById('fahrkarte-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const { text } = buildTicketMessage();
        sendToTelegramBot(text);
      });
    }

    const copyBtn = document.getElementById('btn-copy-ticket');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const msgEl = document.getElementById('tp-message');
        const text = (msgEl && msgEl.textContent) || buildTicketMessage().text;
        const statusEl = document.getElementById('bot-status');
        try {
          await navigator.clipboard.writeText(text);
          if (statusEl) {
            statusEl.textContent = DATA.i18n[state.lang].tariffs.form.copied;
            setTimeout(() => { statusEl.textContent = ''; }, 3000);
          }
        } catch {
          if (statusEl) statusEl.textContent = text;
        }
      });
    }

    if (dialog) {
      document.getElementById('dialog-close').addEventListener('click', () => dialog.close());
      document.getElementById('dialog-prev').addEventListener('click', () => stepLightbox(-1));
      document.getElementById('dialog-next').addEventListener('click', () => stepLightbox(1));
      dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
      document.addEventListener('keydown', (e) => {
        if (!dialog.open) return;
        if (e.key === 'ArrowLeft') stepLightbox(-1);
        if (e.key === 'ArrowRight') stepLightbox(1);
      });
    }
  }

  /* ------------------------------------------------------------------------
     Init
     ------------------------------------------------------------------------ */
  function init() {
    captureTrafficSource();
    setAccentColor(getActiveCity().accentColor);
    init3DMap();
    if (PAGE_TYPE === 'home') {
      renderTimeline();
      renderCityCards();
    } else {
      renderStuttgartTimeNode('n1');
      if (document.getElementById('berlin-veil')) {
        renderBerlinVeilLayer('l1');
        setBerlinVeilPos(52);
      }
      renderCompareModule();
      updateAutoPlayButtonLabel();
      initCompareObserver();
      startHeroReelLoop();
      updateMobileStickyCta();
    }
    updateTicketPreview();
    bindEvents();
    initMobileStickyCta();
  }

  init();
})();
