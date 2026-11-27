/**
 * APP CONTROLLER · V3 (Smart Hybrid Map + Editorial Trial Lectures + Fahrkarte)
 * -----------------------------------------------------------------------------
 * Powers both:
 *   - Home pages (data-page="home"): Lazy sticky 2-Track Germany & Austria Atlas,
 *     opt-in 3D City Preview, Departure Board hover sync, validated Fahrkarte
 *   - City pages (data-page="city"): Trial Lecture (Time-Loop / Spotlight / Veil),
 *     Compact 56/44 Split 3D Map & Stop Inspector, Dossier, Fahrkarte
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
    // Hamburg 1840 <-> 1843 Spotlight
    compareAutoPlay: false,
    compareTimer: null,
    compareInView: false,
    activePlate: 'plate1843a',
    activePersonId: 'p1',
    mobileCompareYear: '1840',
    // Stuttgart 1738 -> 1855 Time-Loop
    activeTimeNodeId: 'n1',
    timeLoopAuto: false,
    timeLoopTimer: null,
    // Berlin 1831 <-> 1900 Veil Curtain
    berlinVeilLayer: 'l1',
    berlinVeilPos: 52,
    // City Hero mobile reel
    reelIndex: 0,
    reelTimer: null,
    // Lightbox & Lazy Map
    lightboxList: [],
    lightboxIndex: 0,
    mapLoaded: false,
    mapLoadingPromise: null,
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

  function prefersReducedMotion() {
    return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
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

  function formatTariffPrimaryCta(city) {
    const cname = loc(city, 'name');
    return {
      en: `Pre-Register for ${cname}`,
      de: `Unverbindlich für ${cname} vormerken`,
      ru: `Записаться предварительно (${cname})`,
      ua: `Записатися попередньо (${cname})`
    }[state.lang];
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
     Lazy MapLibre Loader + Option 1 Smart Hybrid / City Split Controller
     ------------------------------------------------------------------------ */
  function loadStylesheetOnce(href) {
    if (document.querySelector('link[data-lazy-maplibre]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute('data-lazy-maplibre', '1');
    document.head.appendChild(link);
  }

  function loadScriptSequential(urls) {
    return urls.reduce(
      (chain, url) =>
        chain.then(
          () =>
            new Promise((resolve, reject) => {
              const s = document.createElement('script');
              s.src = url;
              s.async = false;
              s.onload = () => resolve();
              s.onerror = () => reject(new Error(`Failed to load ${url}`));
              document.head.appendChild(s);
            })
        ),
      Promise.resolve()
    );
  }

  function ensureMapEngineLoaded() {
    if (state.mapLoaded && state.dioramaStage) {
      return Promise.resolve();
    }
    const canvas = document.getElementById('maplibre-canvas');
    if (!canvas) return Promise.resolve();

    if (window.HamburgDioramaStage && window.maplibregl) {
      init3DMap();
      return Promise.resolve();
    }

    if (state.mapLoadingPromise) {
      return state.mapLoadingPromise;
    }

    const frame = document.getElementById('map-frame');
    const ver = (frame && frame.dataset && frame.dataset.assetVer) || (DATA.siteConfig && DATA.siteConfig.assetVersion) || '18';

    loadStylesheetOnce(`${ROOT}vendor/maplibre-gl.css`);

    const scripts = [`${ROOT}vendor/maplibre-gl.js`];
    if (PAGE_TYPE === 'home') {
      scripts.push(`${ROOT}vendor/bundeslaender.js`);
    }
    scripts.push(`${ROOT}vendor/map-tiles/manifest.js?v=${ver}`);
    scripts.push(`${ROOT}vendor/hamburg_map_3d.js?v=${ver}`);

    state.mapLoadingPromise = loadScriptSequential(scripts)
      .then(() => {
        init3DMap();
      })
      .catch((err) => {
        state.mapLoadingPromise = null;
        throw err;
      });

    return state.mapLoadingPromise;
  }

  function initLazyMapObserver() {
    const target = document.getElementById(PAGE_TYPE === 'home' ? 'hub' : 'city-map');
    const canvas = document.getElementById('maplibre-canvas');
    if (!target || !canvas) return;

    if (!('IntersectionObserver' in window)) {
      ensureMapEngineLoaded();
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          obs.disconnect();
          ensureMapEngineLoaded();
        }
      },
      { rootMargin: '60px 0px' }
    );
    obs.observe(target);
  }

  function updateMap3DButtonsText() {
    const city3d = getActive3DCity();
    const cid = city3d ? city3d.id : 'stuttgart';

    const btnCountry = document.getElementById('btn-back-country');
    if (btnCountry) {
      btnCountry.textContent = DATA.i18n[state.lang].hub.backToCountry;
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
      if (lw) lw.textContent = DATA.i18n[state.lang].hub.legend[2];
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

  function renderHome3DPreviewBar() {
    const bar = document.getElementById('home-3d-preview-bar');
    if (!bar) return;
    if (PAGE_TYPE !== 'home' || state.mapView !== 'city') {
      bar.hidden = true;
      return;
    }
    const city3d = getActive3DCity();
    const landmarks = (city3d && city3d.cityMap && city3d.cityMap.landmarks) || [];
    const activeLm = landmarks.find((l) => l.id === state.activeLandmarkId);
    const shortMap = window.HAMBURG_SHORT_LANDMARK_NAMES || {};
    const stopLblEl = document.getElementById('home-3d-stop-label');
    const linkEl = document.getElementById('home-3d-city-link');
    const backBtn = document.getElementById('home-3d-back-btn');

    if (stopLblEl) {
      if (activeLm) {
        const sName = (shortMap[activeLm.id] && shortMap[activeLm.id][state.lang]) || loc(activeLm, 'name').split('(')[0].trim();
        stopLblEl.textContent = `${loc(city3d, 'name').toUpperCase()} · ${activeLm.num} ${sName}`;
      } else {
        const tapHint = {
          en: '3D Overview · Click any numbered stop',
          de: '3D-Überblick · Station antippen',
          ru: '3D-обзор · Нажмите любую точку (01–08)',
          ua: '3D-огляд · Натисніть будь-яку точку'
        }[state.lang];
        stopLblEl.textContent = `${loc(city3d, 'name').toUpperCase()} · ${tapHint}`;
      }
    }
    if (linkEl) {
      linkEl.href = cityPageUrl(city3d.id);
      linkEl.textContent = `${loc(city3d, 'name')}: ${DATA.i18n[state.lang].v3.enterCityBtn}`;
    }
    if (backBtn) {
      backBtn.textContent = DATA.i18n[state.lang].hub.backToCountry;
    }
    bar.hidden = false;
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
    if (fireBtn) fireBtn.hidden = !isCity;
    if (orbitBtn) orbitBtn.hidden = !isCity;
    renderHome3DPreviewBar();
  }

  function setBoardCardHover(cityId) {
    document.querySelectorAll('.city-card--hub').forEach((card) => {
      card.classList.toggle('is-hovered', Boolean(cityId && card.getAttribute('data-select-city') === cityId));
    });
  }

  function init3DMap() {
    if (state.mapLoaded && state.dioramaStage) return;
    const container = document.getElementById('maplibre-canvas');
    if (!container || !window.HamburgDioramaStage || !window.maplibregl) return;

    const initialMode = PAGE_TYPE === 'home' ? 'country' : 'city';
    const lockedCityId = PAGE_TYPE === 'city' ? state.activeCityId : null;
    state.mapView = initialMode;

    state.dioramaStage = new window.HamburgDioramaStage({
      container,
      initialMode,
      initialCityId: state.activeCityId,
      lockedCityId,
      isHomePreview: PAGE_TYPE === 'home',
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
      onHoverCity: (cityId) => {
        setBoardCardHover(cityId);
      },
      onSelectLandmark: (landmarkId) => {
        const c3d = getActive3DCity();
        state.activeCityId = c3d.id;
        state.activeLandmarkId = landmarkId;
        syncMapToolbarUI('city', c3d.id);
        renderLandmarksDock();
        if (PAGE_TYPE === 'city') {
          renderLandmarkInspector(landmarkId);
        } else {
          renderHome3DPreviewBar();
        }
      },
      onSelectCityFromCountry: (cityId, want3D = false) => {
        selectCity(cityId, { syncForm: true, flyToCity: Boolean(want3D), scrollTab: true });
      },
      onReady: () => {
        if (PAGE_TYPE === 'city') {
          const lms = (getActive3DCity() && getActive3DCity().cityMap && getActive3DCity().cityMap.landmarks) || [];
          const firstId = state.activeLandmarkId || (lms[0] && lms[0].id);
          if (firstId) {
            state.activeLandmarkId = firstId;
            if (state.dioramaStage && state.dioramaStage.setActiveLandmarkPin) {
              state.dioramaStage.setActiveLandmarkPin(firstId);
            }
            renderLandmarksDock();
            renderLandmarkInspector(firstId);
          }
        }
      }
    });
    state.mapLoaded = true;
    syncMapToolbarUI(initialMode, state.active3DCityId);
    renderLandmarksDock();
  }

  function flyToGermanyMacro() {
    if (PAGE_TYPE !== 'home') return;
    state.activeLandmarkId = null;
    syncMapToolbarUI('country');
    if (state.dioramaStage) {
      state.dioramaStage.whooshToCountry();
    }
  }

  function flyToCity3D(cityId) {
    const target = getActive3DCity(cityId);
    if (!target) return Promise.resolve();
    return ensureMapEngineLoaded().then(() => {
      state.activeCityId = target.id;
      state.active3DCityId = target.id;
      state.activeLandmarkId = null;
      syncMapToolbarUI('city', target.id);
      renderLandmarksDock();
      if (state.dioramaStage) {
        state.dioramaStage.whooshToCity(target.id);
      }
    });
  }

  function focusLandmark3D(landmarkId) {
    const city3d = getActive3DCity();
    const landmarks = (city3d && city3d.cityMap && city3d.cityMap.landmarks) || [];
    const lm = landmarks.find((l) => l.id === landmarkId) || landmarks[0];
    if (!lm) return Promise.resolve();

    return ensureMapEngineLoaded().then(() => {
      state.activeCityId = city3d.id;
      state.activeLandmarkId = lm.id;
      syncMapToolbarUI('city', city3d.id);
      renderLandmarksDock();
      if (state.dioramaStage) {
        state.dioramaStage.focusLandmark(lm.id);
      }
      if (PAGE_TYPE === 'city') {
        renderLandmarkInspector(lm.id);
      } else {
        renderHome3DPreviewBar();
      }
    });
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
        <button type="button" role="tab" aria-selected="${isActive ? 'true' : 'false'}" class="dock-chip ${isActive ? 'is-active' : ''}" data-dock-landmark="${lm.id}">
          <span>${lm.num}</span> ${shortName}
        </button>`;
      })
      .join('');
  }

  function renderLandmarkInspector(landmarkId) {
    if (PAGE_TYPE !== 'city') return;
    const city3d = getActive3DCity();
    const landmarks = (city3d && city3d.cityMap && city3d.cityMap.landmarks) || [];
    const lm = landmarks.find((l) => l.id === landmarkId) || landmarks[0];
    const bodyEl = document.getElementById('map-overlay-body');
    const dayEl = document.getElementById('ins-day');
    if (!lm || !bodyEl) return;

    const secTitles = {
      ru: ['Архитектура и история места', 'Философская практика на месте', 'Ключевые артефакты локации'],
      ua: ['Архітектура та історія місця', 'Філософська практика на місці', 'Ключові артефакти локації'],
      de: ['Architektur & Ortsgeschichte', 'Philosophische Praxis vor Ort', 'Zentrale Artefakte'],
      en: ['Architecture & Site History', 'On-Site Philosophical Practice', 'Key Site Artifacts']
    }[state.lang];

    if (dayEl) dayEl.textContent = `${lm.num} · ${loc(lm, 'day').toUpperCase()}`;
    bodyEl.innerHTML = `
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
  }

  function stepLandmarkInspector(delta) {
    const city3d = getActive3DCity();
    const landmarks = (city3d && city3d.cityMap && city3d.cityMap.landmarks) || [];
    if (!landmarks.length) return;
    const curIdx = landmarks.findIndex((l) => l.id === state.activeLandmarkId);
    const nextIdx = ((curIdx === -1 ? 0 : curIdx) + delta + landmarks.length) % landmarks.length;
    focusLandmark3D(landmarks[nextIdx].id);
  }

  /* ------------------------------------------------------------------------
     Home Hub: 2-Track Lens Switcher, Departure Board & Mobile Tabs
     ------------------------------------------------------------------------ */
  function setTrackLens(trackId) {
    state.activeTrack = trackId || 'all';
    document.querySelectorAll('[data-track-lens].track-lens-btn').forEach((btn) => {
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
      if (state.mapView === 'city') {
        flyToGermanyMacro();
      }
      state.dioramaStage.setTrackFilter(state.activeTrack);
    }

    const visible = getVisibleCities();
    if (visible.length && !visible.some((c) => c.id === state.activeCityId)) {
      selectCity(visible[0].id, { syncForm: true, flyToCity: false, scrollTab: false });
    } else {
      renderCityCards();
    }
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
          ${city.has3DMap ? `<button type="button" class="btn btn--outline mobile-active-card__btn" data-preview-3d="${city.id}">3D →</button>` : ''}
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
          const previewBtn = city.has3DMap
            ? `<button type="button" class="city-card__3d-btn" data-preview-3d="${city.id}">3D →</button>`
            : '';

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
                <div class="city-card__actions">
                  ${previewBtn}
                  <a href="${cityPageUrl(city.id)}" class="city-card__enter-link" data-city-link>${v3.enterCityBtn}</a>
                </div>
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
     City Page Dossier Tabs (Story / Schedule / Archive)
     ------------------------------------------------------------------------ */
  function renderDossier() {
    const shell = document.getElementById('dossier-shell');
    if (!shell) return;
    const city = getActiveCity();
    const tr = DATA.i18n[state.lang].dossier;
    if (city.isLabStub) return;

    const storyTabLabel = (city.dossierTabs && loc(city.dossierTabs, 'story')) || tr.tabs.story;
    const scheduleTabLabel = (city.dossierTabs && loc(city.dossierTabs, 'schedule')) || tr.tabs.schedule;
    let archiveTabLabel = (city.dossierTabs && loc(city.dossierTabs, 'archive')) || tr.tabs.archive;
    const artLen = (city.artifacts && city.artifacts.length) || 0;
    if (artLen && !archiveTabLabel.includes('(')) {
      archiveTabLabel = `${archiveTabLabel} (${artLen})`;
    }

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
    if (prefersReducedMotion()) return;
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
    if (!state.timeLoopAuto && prefersReducedMotion()) {
      const nodes = (DATA.stuttgartInteractive && DATA.stuttgartInteractive.nodes) || [];
      if (nodes.length) {
        const cur = nodes.findIndex((n) => n.id === state.activeTimeNodeId);
        renderStuttgartTimeNode(nodes[(cur + 1) % nodes.length].id);
      }
      return;
    }
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
     Berlin Signature Interactive: Tearing the Sacred Veil (5-Step Radiogroup)
     ------------------------------------------------------------------------ */
  function setBerlinVeilPos(rawVal, hideHint = false) {
    const stage = document.getElementById('veil-stage');
    if (!stage) return;
    const clamped = Math.max(0, Math.min(100, Math.round(Number(rawVal) || 0)));
    state.berlinVeilPos = clamped;
    stage.style.setProperty('--veil-pos', `${clamped}%`);

    const rangeEl = document.getElementById('veil-range');
    if (rangeEl && Number(rangeEl.value) !== clamped) {
      rangeEl.value = String(clamped);
    }

    if (hideHint) {
      const hintEl = document.getElementById('veil-drag-hint');
      if (hintEl) hintEl.classList.add('is-dismissed');
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
      btn.setAttribute('aria-checked', isMatch ? 'true' : 'false');
    });

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
     Hamburg Signature Interactive: Dual-Frame Spotlight 1840 <-> 1843
     ------------------------------------------------------------------------ */
  function updateAutoPlayButtonLabel() {
    const btn = document.getElementById('btn-compare-autoplay');
    if (!btn) return;
    const labels = {
      en: state.compareAutoPlay ? '⏸ Pause Tour' : '▶ Play Spotlight Tour',
      de: state.compareAutoPlay ? '⏸ Tour pausieren' : '▶ Spotlight-Tour starten',
      ru: state.compareAutoPlay ? '⏸ Пауза' : '▶ Кино-обход прожектором',
      ua: state.compareAutoPlay ? '⏸ Пауза' : '▶ Огляд прожектором'
    }[state.lang];
    btn.textContent = labels;
    btn.classList.toggle('is-active', state.compareAutoPlay);
    btn.setAttribute('aria-pressed', String(state.compareAutoPlay));
  }

  function renderSpotlightOverlays() {
    const svg1840 = document.getElementById('spotlight-1840');
    const svg1843 = document.getElementById('spotlight-1843');
    const zoom1840 = document.getElementById('zoom-1840');
    const zoom1843 = document.getElementById('zoom-1843');
    const hs1840 = document.getElementById('hotspots-1840');
    const hs1843 = document.getElementById('hotspots-1843');
    const note1843 = document.getElementById('plate-1843-note');
    if (!svg1840 || !svg1843) return;

    const fc = DATA.faceComparison;
    const onCanvasPersons = fc.persons.filter((p) => p.onCanvas);
    const person = fc.persons.find((p) => p.id === state.activePersonId) || fc.persons[1];
    const hasSpotlight = Boolean(person && person.onCanvas);
    const reduce = prefersReducedMotion();
    const isMain1843 = state.activePlate === 'plate1843a';

    const drawSvg = (svgEl, activePlateOk, faceKey, badgeKey, filterId, maskId) => {
      if (!activePlateOk) {
        svgEl.innerHTML = '';
        return;
      }
      const linesHtml = onCanvasPersons
        .map((p) => {
          const f = p[faceKey];
          const b = p[badgeKey];
          const isAct = p.id === state.activePersonId;
          return `<line x1="${(f.x * 12.15).toFixed(1)}" y1="${(f.y * 10).toFixed(1)}" x2="${(b.x * 12.15).toFixed(1)}" y2="${(b.y * 10).toFixed(1)}" class="spot-leader ${isAct ? 'is-active' : ''}" />`;
        })
        .join('');

      const targetFace = hasSpotlight ? person[faceKey] : null;
      const cx = targetFace ? (targetFace.x * 12.15).toFixed(1) : '600';
      const cy = targetFace ? (targetFace.y * 10).toFixed(1) : '500';
      const maskRectColor = hasSpotlight ? 'rgba(16, 15, 13, 0.70)' : 'rgba(16, 15, 13, 0.25)';

      svgEl.innerHTML = `
        <defs>
          <filter id="${filterId}"><feGaussianBlur stdDeviation="11" /></filter>
          <mask id="${maskId}">
            <rect width="1215" height="1000" fill="white" />
            ${hasSpotlight ? `<circle cx="${cx}" cy="${cy}" r="78" fill="black" filter="url(#${filterId})" />` : ''}
          </mask>
        </defs>
        <rect width="1215" height="1000" fill="${maskRectColor}" ${hasSpotlight ? `mask="url(#${maskId})"` : ''} />
        ${hasSpotlight ? `<circle cx="${cx}" cy="${cy}" r="74" class="spot-halo" />` : ''}
        ${linesHtml}`;
    };

    drawSvg(svg1840, true, 'face1840', 'badge1840', 'spot-blur-40', 'spot-mask-40');
    drawSvg(svg1843, isMain1843, 'face1843', 'badge1843', 'spot-blur-43', 'spot-mask-43');

    // Sync active badge state & pin opacity
    if (hs1840) {
      hs1840.querySelectorAll('[data-person-id]').forEach((el) => {
        el.classList.toggle('is-active', el.getAttribute('data-person-id') === state.activePersonId);
      });
    }
    if (hs1843) {
      hs1843.querySelectorAll('[data-person-id]').forEach((el) => {
        el.classList.toggle('is-active', el.getAttribute('data-person-id') === state.activePersonId);
      });
    }

    if (note1843) {
      if (isMain1843) {
        note1843.hidden = true;
      } else {
        note1843.textContent = {
          en: 'No identified portrait markers on this archival plate',
          de: 'Keine nummerierten Porträt-Marker auf dieser Platte',
          ru: 'На этой архивной пластине нет индивидуальной разметки лиц',
          ua: 'На цій архівній пластині немає індивідуальної розмітки облич'
        }[state.lang];
        note1843.hidden = false;
      }
    }

    // Gentle synchronized spotlight zoom on both frames
    const applyGentleZoom = (wrapEl, enabled, pt) => {
      if (!wrapEl) return;
      if (!enabled || !hasSpotlight || reduce || !pt) {
        wrapEl.style.transformOrigin = '50% 50%';
        wrapEl.style.transform = 'scale(1)';
      } else {
        wrapEl.style.transformOrigin = `${pt.x}% ${pt.y}%`;
        wrapEl.style.transform = 'scale(1.14)';
      }
    };
    applyGentleZoom(zoom1840, true, person && person.face1840);
    applyGentleZoom(zoom1843, isMain1843, person && person.face1843);
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
    img1843.src = asset(plateMap[state.activePlate] || fc.daguerreotype1843a);

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
      <button type="button" class="hotspot-pin ${p.id === state.activePersonId ? 'is-active' : ''}" style="left:${p.badge1840.x}%; top:${p.badge1840.y}%;" data-person-id="${p.id}" title="${loc(p, 'name')}">${p.num}</button>`
      )
      .join('');

    document.getElementById('hotspots-1843').innerHTML =
      state.activePlate === 'plate1843a'
        ? onCanvasPersons
            .map(
              (p) => `
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

    renderSpotlightOverlays();
  }

  function setMobileCompareYear(yr) {
    state.mobileCompareYear = yr === '1843' ? '1843' : '1840';
    const wrap = document.getElementById('compare-pins-view');
    if (wrap) {
      wrap.classList.toggle('is-show-1840', state.mobileCompareYear === '1840');
      wrap.classList.toggle('is-show-1843', state.mobileCompareYear === '1843');
    }
    document.querySelectorAll('[data-compare-year]').forEach((btn) => {
      const match = btn.getAttribute('data-compare-year') === state.mobileCompareYear;
      btn.classList.toggle('is-active', match);
      btn.setAttribute('aria-selected', match ? 'true' : 'false');
    });
  }

  function restartCompareTourBar() {
    const bar = document.getElementById('compare-tour-bar');
    if (!bar) return;
    bar.style.transition = 'none';
    bar.style.width = '0%';
    if (!state.compareAutoPlay) return;
    void bar.offsetWidth;
    bar.style.transition = 'width 3.6s linear';
    bar.style.width = '100%';
  }

  function startCompareAutoTour() {
    stopCompareAutoTour();
    if (!state.compareAutoPlay || prefersReducedMotion()) return;
    const canvasIds = DATA.faceComparison.persons.filter((p) => p.onCanvas).map((p) => p.id);
    if (!canvasIds.length) return;
    restartCompareTourBar();
    state.compareTimer = setInterval(() => {
      if (!state.compareAutoPlay) return;
      const cur = canvasIds.indexOf(state.activePersonId);
      state.activePersonId = canvasIds[(cur + 1) % canvasIds.length];
      if (state.activePlate !== 'plate1843a') {
        state.activePlate = 'plate1843a';
        renderCompareModule();
      } else {
        updateActivePersonUI();
      }
      restartCompareTourBar();
    }, 3600);
  }

  function stopCompareAutoTour() {
    if (state.compareTimer) {
      clearInterval(state.compareTimer);
      state.compareTimer = null;
    }
    const bar = document.getElementById('compare-tour-bar');
    if (bar) {
      bar.style.transition = 'none';
      bar.style.width = '0%';
    }
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
     Fahrkarte Pre-Registration Form: Validation, Ticket Stub & Stamp
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
    const cityDur = loc(city, 'duration') || DATA.i18n[state.lang].tariffs.ticketLabels.formatValue;

    const msgDict = {
      en: { head: 'EXPEDITION PRE-REGISTRATION · 2027', city: 'City', dates: 'Dates', format: 'Format', seats: 'Seats', lang: 'Group language', name: 'Name', contact: 'Contact', comment: 'Comment', src: 'Source' },
      de: { head: 'VORANMELDUNG EXPEDITION · 2027', city: 'Stadt', dates: 'Termine', format: 'Format', seats: 'Plätze', lang: 'Gruppensprache', name: 'Name', contact: 'Kontakt', comment: 'Kommentar', src: 'Quelle' },
      ru: { head: 'ПРЕДЗАПИСЬ НА ЭКСПЕДИЦИЮ · 2027', city: 'Город', dates: 'Даты', format: 'Формат', seats: 'Количество мест', lang: 'Язык группы', name: 'Имя', contact: 'Контакт', comment: 'Комментарий', src: 'Источник' },
      ua: { head: 'ПЕРЕДЗАПИС НА ЕКСПЕДИЦІЮ · 2027', city: 'Місто', dates: 'Дати', format: 'Формат', seats: 'Кількість місць', lang: 'Мова групи', name: 'Ім’я', contact: 'Контакт', comment: 'Коментар', src: 'Джерело' }
    }[state.lang];

    const lines = [
      msgDict.head,
      `${msgDict.city}: ${loc(city, 'name')} (№${city.issueNo})`,
      `${msgDict.dates}: ${loc(city, 'dates')}`,
      `${msgDict.format}: ${cityDur}`,
      `${msgDict.seats}: ${seats}`,
      `${msgDict.lang}: ${groupLang}`,
      `${msgDict.name}: ${name}`,
      `${msgDict.contact}: ${contact}`
    ];
    if (comment) lines.push(`${msgDict.comment}: ${comment}`);
    lines.push(`${msgDict.src}: ${getTrafficSource()} · ${window.location.pathname || '/'}`);

    return { text: lines.join('\n'), city, seats, groupLang, name, cityDur };
  }

  function updateTicketPreview() {
    if (!document.getElementById('tp-city')) return;
    const { city, seats, groupLang, name, cityDur } = buildTicketMessage();
    const issueEl = document.getElementById('tp-issue');
    const cityEl = document.getElementById('tp-city');
    const datesEl = document.getElementById('tp-dates');
    const fmtEl = document.getElementById('tp-format');
    const personEl = document.getElementById('tp-person');
    const serialEl = document.getElementById('tp-serial');
    const stubSeatsEl = document.getElementById('tp-stub-seats');

    if (issueEl) issueEl.textContent = `№ ${city.issueNo}`;
    if (cityEl) cityEl.textContent = loc(city, 'name');
    if (datesEl) datesEl.textContent = loc(city, 'dates');
    if (fmtEl) fmtEl.textContent = cityDur;
    if (personEl) personEl.textContent = `${name} · ${seats} · ${groupLang}`;
    if (serialEl) serialEl.textContent = `SER. 2027-${city.id.slice(0, 3).toUpperCase()}-${city.issueNo}`;
    if (stubSeatsEl) stubSeatsEl.textContent = `${seats} · ${groupLang}`;
  }

  function clearFieldError(inputId, errId) {
    const inp = document.getElementById(inputId);
    const err = document.getElementById(errId);
    if (inp) inp.setAttribute('aria-invalid', 'false');
    if (err) err.textContent = '';
  }

  function validateFahrkarteForm() {
    const nameEl = document.getElementById('f-name');
    const contactEl = document.getElementById('f-contact');
    const errNameEl = document.getElementById('err-name');
    const errContactEl = document.getElementById('err-contact');
    const msgs = {
      en: {
        name: 'Please enter your name (at least 2 characters).',
        contactReq: 'Please enter a Telegram @username, e-mail, or phone.',
        contactFmt: 'Use @username, email@domain.com, or a phone number.'
      },
      de: {
        name: 'Bitte geben Sie Ihren Namen ein (mind. 2 Zeichen).',
        contactReq: 'Bitte Telegram-@username, E-Mail oder Telefon angeben.',
        contactFmt: 'Format: @username, E-Mail-Adresse oder Telefonnummer.'
      },
      ru: {
        name: 'Пожалуйста, укажите имя (минимум 2 символа).',
        contactReq: 'Укажите Telegram @username, E-mail или телефон.',
        contactFmt: 'Формат: @username, name@email.com или телефон.'
      },
      ua: {
        name: 'Будь ласка, вкажіть ім’я (щонайменше 2 символи).',
        contactReq: 'Вкажіть Telegram @username, E-mail або телефон.',
        contactFmt: 'Формат: @username, name@email.com або телефон.'
      }
    }[state.lang];

    let firstInvalid = null;
    const nameVal = (nameEl && nameEl.value.trim()) || '';
    if (nameVal.length < 2) {
      if (nameEl) {
        nameEl.setAttribute('aria-invalid', 'true');
        firstInvalid = firstInvalid || nameEl;
      }
      if (errNameEl) errNameEl.textContent = msgs.name;
    } else {
      clearFieldError('f-name', 'err-name');
    }

    const contactVal = (contactEl && contactEl.value.trim()) || '';
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contactVal);
    const isTg = /^@?[a-zA-Z0-9_]{4,32}$/.test(contactVal);
    const digitsCount = contactVal.replace(/\D/g, '').length;
    const isPhone = digitsCount >= 6 && /^[+\d()\s-]{6,}$/.test(contactVal);

    if (!contactVal) {
      if (contactEl) {
        contactEl.setAttribute('aria-invalid', 'true');
        firstInvalid = firstInvalid || contactEl;
      }
      if (errContactEl) errContactEl.textContent = msgs.contactReq;
    } else if (!isEmail && !isTg && !isPhone) {
      if (contactEl) {
        contactEl.setAttribute('aria-invalid', 'true');
        firstInvalid = firstInvalid || contactEl;
      }
      if (errContactEl) errContactEl.textContent = msgs.contactFmt;
    } else {
      clearFieldError('f-contact', 'err-contact');
    }

    if (firstInvalid) {
      firstInvalid.focus({ preventScroll: false });
      return false;
    }
    return true;
  }

  function stampTicket(label) {
    const stampEl = document.getElementById('ticket-stamp');
    if (!stampEl) return;
    stampEl.textContent = label;
    stampEl.classList.remove('is-stamped');
    stampEl.hidden = false;
    void stampEl.offsetWidth;
    stampEl.classList.add('is-stamped');
  }

  function renderDirectFallbackActions(payloadText, city) {
    const wrap = document.getElementById('ticket-direct-actions');
    if (!wrap) return;
    const tr = DATA.i18n[state.lang].tariffs.form;
    const handle = (DATA.meta && DATA.meta.telegramBot && DATA.meta.telegramBot.fallbackHandle) || 'Grygoryshyn';
    const rawEmail = (DATA.legal && DATA.legal.email && !String(DATA.legal.email).includes('['))
      ? DATA.legal.email
      : 'grigorishinsv@gmail.com';
    const subject = `${loc(city, 'name')} 2027 · ${DATA.i18n[state.lang].tariffs.ticketTitle}`;
    const emailLbl = { en: 'Send via E-mail', de: 'Per E-Mail senden', ru: 'Отправить на E-mail', ua: 'Надіслати на E-mail' }[state.lang];

    wrap.innerHTML = `
      <a href="https://t.me/${encodeURIComponent(handle)}?text=${encodeURIComponent(payloadText)}" target="_blank" rel="noopener noreferrer" class="btn btn--primary">${tr.openDirectBtn}</a>
      <a href="mailto:${encodeURIComponent(rawEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(payloadText)}" class="btn btn--outline">${emailLbl}</a>
      <button type="button" class="pill-btn" id="btn-copy-generated">${tr.copyBtn}</button>`;
    wrap.hidden = false;

    const copyBtn = document.getElementById('btn-copy-generated');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const statusEl = document.getElementById('bot-status');
        try {
          await navigator.clipboard.writeText(payloadText);
          if (statusEl) statusEl.textContent = tr.copied;
        } catch {
          if (statusEl) statusEl.textContent = tr.sentWarn;
        }
      });
    }
  }

  function scrollToRegistrationForm(flashPrefill = false) {
    const target = document.getElementById('ticket-section');
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (flashPrefill) {
      const fCity = document.getElementById('f-city');
      const aside = document.getElementById('ticket-preview-aside');
      [fCity, aside].forEach((el) => {
        if (!el) return;
        el.classList.remove('is-prefill-flash');
        void el.offsetWidth;
        el.classList.add('is-prefill-flash');
      });
    }
    setTimeout(() => {
      const nameInput = document.getElementById('f-name');
      if (nameInput) nameInput.focus({ preventScroll: true });
    }, 450);
  }

  async function submitFahrkarte() {
    if (!validateFahrkarteForm()) return;

    const statusEl = document.getElementById('bot-status');
    const directEl = document.getElementById('ticket-direct-actions');
    const tr = DATA.i18n[state.lang].tariffs.form;
    const { text: payloadText, city } = buildTicketMessage();

    if (statusEl) statusEl.textContent = tr.sending;
    if (directEl) directEl.hidden = true;

    const endpoint = DATA.siteConfig && DATA.siteConfig.formEndpoint;
    if (endpoint) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: payloadText })
        });
        if (res.ok) {
          if (statusEl) statusEl.textContent = tr.sentOk;
          stampTicket({ en: 'PRE-REGISTERED', de: 'VORGEMERKT', ru: 'ПРЕДЗАПИСЬ', ua: 'ПЕРЕДЗАПИС' }[state.lang]);
          return;
        }
      } catch {}
    }

    if (statusEl) statusEl.textContent = tr.sentWarn;
    stampTicket({ en: 'TICKET READY', de: 'BEREIT', ru: 'БИЛЕТ ГОТОВ', ua: 'КВИТОК ГОТОВ' }[state.lang]);
    renderDirectFallbackActions(payloadText, city);
  }

  /* ------------------------------------------------------------------------
     Native <dialog> Lightbox (no empty src="" in DOM)
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
    const imgEl = document.getElementById('dialog-img');
    document.getElementById('dialog-meta').textContent = `${item.dayRef} · ${item.year} · (${state.lightboxIndex + 1}/${state.lightboxList.length})`;
    if (imgEl) {
      imgEl.src = asset(item.src);
      imgEl.alt = loc(item, 'title');
      imgEl.hidden = false;
    }
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
  function selectCity(cityId, { syncForm = true, flyToCity = false, scrollTab = false } = {}) {
    const city = DATA.cities.find((c) => c.id === cityId);
    if (!city) return;

    state.activeCityId = cityId;
    setAccentColor(city.accentColor);

    const coordsEl = document.getElementById('map-active-coords');
    if (coordsEl) coordsEl.textContent = city.coords;

    const primaryCardBtn = document.getElementById('tariff-primary-cta');
    if (primaryCardBtn) primaryCardBtn.textContent = formatTariffPrimaryCta(city);

    renderCityCards();
    if (scrollTab) renderMobileCityTabs(true);

    if (city.has3DMap) {
      state.active3DCityId = cityId;
      renderLandmarksDock();
    }

    if (flyToCity && city.has3DMap) {
      flyToCity3D(cityId);
    } else if (state.mapLoaded && state.dioramaStage) {
      updateMap3DButtonsText();
      if (PAGE_TYPE === 'home') {
        state.dioramaStage.focusCountryCity(cityId);
      }
    } else {
      updateMap3DButtonsText();
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
      heroPrimaryCta.addEventListener('click', () => {
        ensureMapEngineLoaded().then(() => flyToGermanyMacro());
      });
    }

    const btnBack = document.getElementById('btn-back-country');
    const homeBackBtn = document.getElementById('home-3d-back-btn');
    if (btnBack) btnBack.addEventListener('click', () => flyToGermanyMacro());
    if (homeBackBtn) homeBackBtn.addEventListener('click', () => flyToGermanyMacro());

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

    const ovPrev = document.getElementById('ov-prev');
    const ovNext = document.getElementById('ov-next');
    if (ovPrev) ovPrev.addEventListener('click', () => stepLandmarkInspector(-1));
    if (ovNext) ovNext.addEventListener('click', () => stepLandmarkInspector(1));

    const tlAuto = document.getElementById('btn-timeloop-auto');
    if (tlAuto) tlAuto.addEventListener('click', () => toggleTimeLoopAuto());

    // Bidirectional hover sync between Home Departure Board & Germany Map
    const cardsHost = document.getElementById('city-cards');
    if (cardsHost) {
      cardsHost.addEventListener('mouseover', (e) => {
        const card = e.target.closest('.city-card--hub');
        if (card && state.dioramaStage && state.dioramaStage.setHoveredCity) {
          state.dioramaStage.setHoveredCity(card.getAttribute('data-select-city'));
        }
      });
      cardsHost.addEventListener('mouseout', (e) => {
        const card = e.target.closest('.city-card--hub');
        if (!card) return;
        const related = e.relatedTarget && e.relatedTarget.closest ? e.relatedTarget.closest('.city-card--hub') : null;
        if (related !== card && state.dioramaStage && state.dioramaStage.setHoveredCity) {
          state.dioramaStage.setHoveredCity(related ? related.getAttribute('data-select-city') : null);
        }
      });
      cardsHost.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const card = e.target.closest('.city-card--hub');
        if (!card) return;
        if (e.target !== card && e.target.closest('a, button')) return;
        e.preventDefault();
        selectCity(card.getAttribute('data-select-city'), { syncForm: true, flyToCity: false, scrollTab: false });
      });
    }

    // Delegated clicks
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-city-link]')) return;

      const lensBtn = e.target.closest('[data-track-lens]');
      if (lensBtn) {
        ensureMapEngineLoaded();
        setTrackLens(lensBtn.getAttribute('data-track-lens'));
        return;
      }

      const previewBtn = e.target.closest('[data-preview-3d]');
      if (previewBtn) {
        e.stopPropagation();
        const cid = previewBtn.getAttribute('data-preview-3d');
        selectCity(cid, { syncForm: true, flyToCity: true, scrollTab: false });
        return;
      }

      const dockBtn = e.target.closest('[data-dock-landmark]');
      if (dockBtn) {
        focusLandmark3D(dockBtn.getAttribute('data-dock-landmark'));
        return;
      }

      const selectOnly = e.target.closest('[data-select-city]');
      if (selectOnly) {
        const fromTab = selectOnly.classList.contains('mobile-city-tab');
        selectCity(selectOnly.getAttribute('data-select-city'), { syncForm: true, flyToCity: false, scrollTab: fromTab });
        return;
      }

      const prefillBtn = e.target.closest('[data-prefill-city]');
      if (prefillBtn) {
        selectCity(prefillBtn.getAttribute('data-prefill-city'), { syncForm: true, flyToCity: false });
        scrollToRegistrationForm(true);
        return;
      }

      const pickCardBtn = e.target.closest('[data-pick-card]');
      if (pickCardBtn) {
        const cardId = pickCardBtn.getAttribute('data-pick-card');
        if (cardId === 'full') {
          const cur = getActiveCity();
          const targetId = cur && cur.status === 'active' ? cur.id : 'stuttgart';
          selectCity(targetId, { syncForm: true, flyToCity: false });
        }
        scrollToRegistrationForm(true);
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
        setTimeout(() => focusLandmark3D(lmId), 260);
        return;
      }

      const veilLayerBtn = e.target.closest('[data-veil-layer]');
      if (veilLayerBtn) {
        renderBerlinVeilLayer(veilLayerBtn.getAttribute('data-veil-layer'));
        return;
      }

      if (e.target.closest('#veil-next-menzel')) {
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
        setTimeout(() => focusLandmark3D(lmId), 260);
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

      const cmpYrBtn = e.target.closest('[data-compare-year]');
      if (cmpYrBtn) {
        setMobileCompareYear(cmpYrBtn.getAttribute('data-compare-year'));
        return;
      }

      const personBtn = e.target.closest('[data-person-id]');
      if (personBtn) {
        state.activePersonId = personBtn.getAttribute('data-person-id');
        state.compareAutoPlay = false;
        stopCompareAutoTour();
        updateAutoPlayButtonLabel();
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

      const autoBtn = e.target.closest('#btn-compare-autoplay');
      if (autoBtn) {
        if (!state.compareAutoPlay && prefersReducedMotion()) {
          const ids = DATA.faceComparison.persons.filter((p) => p.onCanvas).map((p) => p.id);
          const cur = ids.indexOf(state.activePersonId);
          state.activePersonId = ids[(cur + 1) % ids.length];
          updateActivePersonUI();
          return;
        }
        state.compareAutoPlay = !state.compareAutoPlay;
        updateAutoPlayButtonLabel();
        if (state.compareAutoPlay) {
          state.activePlate = 'plate1843a';
          renderCompareModule();
          startCompareAutoTour();
        } else {
          stopCompareAutoTour();
        }
      }
    });

    const veilRange = document.getElementById('veil-range');
    if (veilRange) {
      veilRange.addEventListener('input', (e) => {
        if (state.berlinVeilLayer === 'menzel') renderBerlinVeilLayer('l1');
        setBerlinVeilPos(e.target.value, true);
      });
    }

    // Form bindings & instant inline error clear
    ['f-city', 'f-seats', 'f-lang', 'f-name', 'f-contact', 'f-comment'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', () => {
        if (id === 'f-name') clearFieldError('f-name', 'err-name');
        if (id === 'f-contact') clearFieldError('f-contact', 'err-contact');
        updateTicketPreview();
      });
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
        submitFahrkarte();
      });
    }

    if (dialog) {
      document.getElementById('dialog-close').addEventListener('click', () => dialog.close());
      document.getElementById('dialog-prev').addEventListener('click', () => stepLightbox(-1));
      document.getElementById('dialog-next').addEventListener('click', () => stepLightbox(1));
      dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
      dialog.addEventListener('close', () => {
        const dImg = document.getElementById('dialog-img');
        if (dImg) {
          dImg.hidden = true;
          dImg.removeAttribute('src');
        }
      });
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
    initLazyMapObserver();
    if (PAGE_TYPE === 'home') {
      renderCityCards();
    } else {
      renderStuttgartTimeNode('n1');
      if (document.getElementById('berlin-veil')) {
        renderBerlinVeilLayer('l1');
        setBerlinVeilPos(52, false);
      }
      renderCompareModule();
      updateAutoPlayButtonLabel();
      startHeroReelLoop();
      updateMobileStickyCta();
    }
    updateTicketPreview();
    bindEvents();
    initMobileStickyCta();
  }

  init();
})();
