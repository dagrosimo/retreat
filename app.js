/**
 * APP CONTROLLER · SERGEI GRYGORYSHYN EXPEDITIONS PROTOTYPE
 */
(function () {
  'use strict';

  const DATA = window.EXPEDITIONS_DATA;
  if (!DATA) return;

  const state = {
    lang: 'ru',
    activeCityId: 'hamburg',
    hubFilter: 'all',
    dossierTab: 'story',
    scheduleMode: 'all',
    archiveFilter: 'all',
    compareMode: 'pins',
    activePlate: 'plate1843a',
    activePersonId: 'p1',
    lightboxList: [],
    lightboxIndex: 0
  };

  /* ------------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------------ */
  function loc(obj, baseKey) {
    if (!obj) return '';
    const suffix = state.lang === 'ua' ? 'Ua' : 'Ru';
    return obj[baseKey + suffix] ?? obj[baseKey + 'Ru'] ?? obj[baseKey] ?? '';
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

  function getHamburgArtifacts() {
    const h = DATA.cities.find((c) => c.id === 'hamburg');
    return h ? h.artifacts : [];
  }

  function setAccentColor(hex) {
    document.documentElement.style.setProperty('--city-accent', hex);
    document.documentElement.style.setProperty('--city-accent-soft', hexToRgba(hex, 0.1));
  }

  function parseInitialCityFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const qCity = params.get('city');
    const hashMatch = window.location.hash.match(/city=([a-z]+)/i);
    const candidate = qCity || (hashMatch ? hashMatch[1] : null);
    if (candidate && DATA.cities.some((c) => c.id === candidate)) {
      state.activeCityId = candidate;
    }
  }

  /* ------------------------------------------------------------------------
     Global I18N Static Bindings
     ------------------------------------------------------------------------ */
  function renderStaticI18n() {
    const tr = DATA.i18n[state.lang];
    document.documentElement.lang = state.lang === 'ua' ? 'uk' : 'ru';

    document.getElementById('top-strip-text').textContent = tr.topStrip;
    document.getElementById('brand-author').textContent = state.lang === 'ua' ? DATA.meta.authorUa : DATA.meta.authorRu;
    document.getElementById('brand-sub').textContent = state.lang === 'ua' ? DATA.meta.brandUa : DATA.meta.brandRu;

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

    // Hub headings & filters
    document.getElementById('hub-eyebrow').textContent = tr.hub.eyebrow;
    document.getElementById('hub-title').textContent = tr.hub.title;
    document.getElementById('hub-lead').textContent = tr.hub.lead;
    document.querySelectorAll('[data-hub-filter]').forEach((btn) => {
      const k = btn.getAttribute('data-hub-filter');
      if (tr.hub.filters[k]) btn.textContent = tr.hub.filters[k];
    });

    // Compare
    document.getElementById('compare-eyebrow').textContent = tr.compare.eyebrow;
    document.getElementById('compare-title').textContent = tr.compare.title;
    document.getElementById('compare-lead').textContent = tr.compare.lead;
    document.getElementById('btn-mode-pins').textContent = tr.compare.modePins;
    document.getElementById('btn-mode-slider').textContent = tr.compare.modeSlider;
    document.getElementById('btn-plate-1843a').textContent = tr.compare.plateButtons.plate1843a;
    document.getElementById('btn-plate-1843b').textContent = tr.compare.plateButtons.plate1843b;
    document.getElementById('btn-plate-1842ruins').textContent = tr.compare.plateButtons.plate1842ruins;
    document.getElementById('caption-1840').textContent = tr.compare.caption1840;
    document.getElementById('compare-disclaimer').textContent = tr.compare.disclaimer;
    document.getElementById('slider-hint').textContent = tr.compare.sliderHint;

    // Speaker
    document.getElementById('speaker-eyebrow').textContent = tr.speaker.eyebrow;
    document.getElementById('speaker-name').textContent = tr.speaker.name;
    document.getElementById('speaker-role').textContent = tr.speaker.role;
    document.getElementById('speaker-bio').innerHTML = tr.speaker.bio.map((p) => `<p>${p}</p>`).join('');
    document.getElementById('speaker-facts').innerHTML = tr.speaker.facts
      .map((f) => `<div><dt>${f.label}</dt><dd>${f.val}</dd></div>`)
      .join('');
    document.getElementById('speaker-pub-btn').textContent = `${tr.speaker.pubBtn} ↗`;
    document.getElementById('video-slot-title').textContent = tr.speaker.videoTitle;
    document.getElementById('video-slot-status').textContent = tr.speaker.videoStatus;
    document.getElementById('lecture-caption').textContent = tr.speaker.lectureCaption;

    // Tariffs & Form labels
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
        <button type="button" class="btn ${idx === 0 ? 'btn--primary' : 'btn--outline'}" data-pick-format="${card.id}">
          ${card.cta}
        </button>
      </article>`
      )
      .join('');
    document.getElementById('tariffs-included-note').textContent = tr.tariffs.includedNote;

    document.getElementById('ticket-title').textContent = tr.tariffs.ticketTitle;
    document.getElementById('ticket-subtitle').textContent = tr.tariffs.ticketSubtitle;
    document.getElementById('lbl-city').textContent = tr.tariffs.form.cityLabel;
    document.getElementById('lbl-format').textContent = tr.tariffs.form.formatLabel;
    document.getElementById('lbl-lang').textContent = tr.tariffs.form.langLabel;
    document.getElementById('lbl-name').textContent = tr.tariffs.form.nameLabel;
    document.getElementById('f-name').placeholder = tr.tariffs.form.namePlaceholder;
    document.getElementById('lbl-contact').textContent = tr.tariffs.form.contactLabel;
    document.getElementById('f-contact').placeholder = tr.tariffs.form.contactPlaceholder;
    document.getElementById('lbl-comment').textContent = tr.tariffs.form.commentLabel;
    document.getElementById('f-comment').placeholder = tr.tariffs.form.commentPlaceholder;
    document.getElementById('btn-send-telegram').textContent = tr.tariffs.form.sendBtn;
    document.getElementById('btn-copy-ticket').textContent = tr.tariffs.form.copyBtn;

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

    // Additional static UI chrome labels
    const isUa = state.lang === 'ua';
    document.getElementById('top-strip-right').textContent = isUa
      ? 'KEIN PAUSCHALREISEANGEBOT · ГРУПА 3–6 ОСІБ'
      : 'KEIN PAUSCHALREISEANGEBOT · ГРУППА 3–6 ЧЕЛ.';
    document.getElementById('triptych-cap-1').textContent = isUa ? 'Пензель · Затишок' : 'Кисть · Уют';
    document.getElementById('triptych-cap-2').textContent = isUa ? 'Вогонь · Злам' : 'Огонь · Слом';
    document.getElementById('triptych-cap-3').textContent = isUa ? 'Срібло · Документ' : 'Серебро · Документ';
    document.getElementById('legend-active').textContent = isUa ? 'Відкрито набір (скоро старт)' : 'Открыт набор (скоро старт)';
    document.getElementById('legend-forming').textContent = isUa ? 'Збір трійки' : 'Сбор тройки';
    document.getElementById('legend-wait').textContent = isUa ? 'Лист очікування / опитування' : 'Лист ожидания / опрос';
    document.getElementById('board-title').textContent = isUa ? 'ABFAHRTSTAFEL · ГРАФІК ПОЇЗДОК НА РІК' : 'ABFAHRTSTAFEL · ГРАФИК ПОЕЗДОК НА ГОД';
    document.getElementById('board-threshold').textContent = isUa ? 'ПОРІГ ЗАПУСКУ: 3 ОС.' : 'ПОРОГ ЗАПУСКА: 3 ЧЕЛ.';
    document.getElementById('speaker-portrait-cap').textContent = isUa ? 'СЕРГІЙ ГРИГОРИШИН · К.Ф.Н.' : 'СЕРГЕЙ ГРИГОРИШИН · К.Ф.Н.';
    document.getElementById('tp-reserve-badge').textContent = isUa ? 'РЕЗЕРВ БЕЗ ОНЛАЙН-ОПЛАТИ' : 'РЕЗЕРВ БЕЗ ОНЛАЙН-ОПЛАТЫ';
    document.getElementById('tp-label-route').textContent = isUa ? 'НАПРЯМОК' : 'НАПРАВЛЕНИЕ';
    document.getElementById('tp-label-format').textContent = 'ФОРМАТ';
    document.getElementById('tp-label-price').textContent = isUa ? 'ВАРТІСТЬ ПРОГРАМИ' : 'СТОИМОСТЬ ПРОГРАММЫ';
    document.getElementById('tp-label-spots').textContent = isUa ? 'СТАТУС ТРІЙКИ' : 'СТАТУС ТРОЙКИ';
    document.getElementById('tp-label-person').textContent = isUa ? 'УЧАСНИК / МОВА' : 'УЧАСТНИК / ЯЗЫК';
    document.getElementById('tp-label-msg').textContent = isUa ? 'ТЕКСТ ПОВІДОМЛЕННЯ ДЛЯ TELEGRAM' : 'ТЕКСТ СООБЩЕНИЯ ДЛЯ TELEGRAM';
    const langSel = document.getElementById('f-lang');
    langSel.options[2].textContent = isUa ? 'Обидві мови (не принципово)' : 'Оба языка (не принципиально)';
  }

  /* ------------------------------------------------------------------------
     Hub: 12-Month Timeline + SVG Pins + City Departure Board
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

  function renderSvgPins() {
    const group = document.getElementById('svg-city-pins');
    const ns = 'http://www.w3.org/2000/svg';
    group.innerHTML = '';

    DATA.cities.forEach((city) => {
      const isActive = city.id === state.activeCityId;
      const labelText = loc(city, 'name');
      const boxWidth = Math.max(66, labelText.length * 7.6 + 16);
      const labelOffsetX = city.id === 'frankfurt' ? -boxWidth - 14 : 14;

      const g = document.createElementNS(ns, 'g');
      g.setAttribute('class', `city-pin-group ${isActive ? 'is-active' : ''}`);
      g.setAttribute('data-select-city', city.id);
      g.setAttribute('tabindex', '0');
      g.setAttribute('role', 'button');
      g.setAttribute('aria-label', `${labelText} — ${loc(city, 'dates')}`);
      g.style.setProperty('--pin-color', city.accentColor);

      const halo = document.createElementNS(ns, 'circle');
      halo.setAttribute('class', 'pin-halo');
      halo.setAttribute('cx', city.svgPos.x);
      halo.setAttribute('cy', city.svgPos.y);
      halo.setAttribute('r', isActive ? '14' : '11');

      const core = document.createElementNS(ns, 'circle');
      core.setAttribute('class', 'pin-core');
      core.setAttribute('cx', city.svgPos.x);
      core.setAttribute('cy', city.svgPos.y);
      core.setAttribute('r', isActive ? '7' : '5.5');

      const rect = document.createElementNS(ns, 'rect');
      rect.setAttribute('class', 'pin-label-bg');
      rect.setAttribute('x', city.svgPos.x + labelOffsetX);
      rect.setAttribute('y', city.svgPos.y - 11);
      rect.setAttribute('width', boxWidth);
      rect.setAttribute('height', '22');
      rect.setAttribute('rx', '2');

      const text = document.createElementNS(ns, 'text');
      text.setAttribute('class', 'pin-label');
      text.setAttribute('x', city.svgPos.x + labelOffsetX + 8);
      text.setAttribute('y', city.svgPos.y + 4);
      text.textContent = labelText;

      g.appendChild(halo);
      g.appendChild(core);
      g.appendChild(rect);
      g.appendChild(text);
      group.appendChild(g);
    });

    const active = getActiveCity();
    document.getElementById('map-active-coords').textContent = active.coords;
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
          city.status === 'active'
            ? 'is-active-status'
            : city.status === 'forming'
            ? 'is-forming-status'
            : '';

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
          <a href="#ticket-section" class="btn btn--primary" data-prefill-city="${city.id}">
            ${city.isLabStub ? tr.labAction : DATA.i18n[state.lang].hub.reserveBtn}
          </a>
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
          <a href="#ticket-section" class="btn btn--outline" data-prefill-city="${city.id}">
            ${tr.labAction}
          </a>
        </div>`;
      return;
    }

    // Полное досье Гамбурга с 3 вкладками
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
            .map(
              (act) => `
            <article class="act-block act-block--${act.tone}">
              <div class="act-text">
                <div class="act-num">${act.num}</div>
                <h3 class="act-title">${loc(act, 'title')}</h3>
                ${(state.lang === 'ua' ? act.paragraphsUa : act.paragraphsRu).map((p) => `<p>${p}</p>`).join('')}
                <div class="act-museum-plate">${loc(act, 'museumPlate')}</div>
              </div>
              <figure class="act-figure" data-lightbox-src="${act.image}">
                <img src="${act.image}" alt="${loc(act, 'imageCaption')}" loading="lazy" />
                <figcaption>${loc(act, 'imageCaption')}</figcaption>
              </figure>
            </article>`
            )
            .join('')}
        </div>`;
    } else if (state.dossierTab === 'schedule') {
      const days = city.days.filter((d) => (state.scheduleMode === 'weekend' ? d.isWeekendCore : true));
      bodyHtml = `
        <div class="schedule-panel">
          <div class="schedule-toolbar">
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button type="button" class="pill-btn ${state.scheduleMode === 'all' ? 'is-active' : ''}" data-schedule-mode="all">
                ${tr.scheduleFilters.all}
              </button>
              <button type="button" class="pill-btn ${state.scheduleMode === 'weekend' ? 'is-active' : ''}" data-schedule-mode="weekend">
                ${tr.scheduleFilters.weekend}
              </button>
            </div>
            <span class="mono-label">${loc(city, 'dates')}</span>
          </div>
          <div class="weekend-callout">${tr.weekendNote}</div>
          <div class="days-grid">
            ${days
              .map(
                (day) => `
              <article class="day-card ${day.isWeekendCore ? 'is-weekend' : ''}">
                <div class="day-card__top">
                  <span class="mono-label">${loc(day, 'weekday')}</span>
                  ${day.isWeekendCore ? `<span class="mono-label stamp-pill">${state.lang === 'ua' ? 'WEEKEND CORE · СБ–НД' : 'WEEKEND CORE · СБ–ВС'}</span>` : '<span class="mono-label">OPENING DAYS</span>'}
                </div>
                <h3 class="day-card__title">${loc(day, 'title')}</h3>
                <p class="day-card__lead">${loc(day, 'lead')}</p>
                <div class="day-slots">
                  <div class="day-slot">
                    <h4>${tr.blocks.morning}</h4>
                    <p>${loc(day, 'morning')}</p>
                  </div>
                  <div class="day-slot">
                    <h4>${tr.blocks.afternoon}</h4>
                    <p>${loc(day, 'afternoon')}</p>
                  </div>
                  <div class="day-slot">
                    <h4>${tr.blocks.evening}</h4>
                    <p>${loc(day, 'evening')}</p>
                  </div>
                </div>
              </article>`
              )
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
     1840 <-> 1843 Interactive Comparison
     ------------------------------------------------------------------------ */
  function renderCompareModule() {
    const fc = DATA.faceComparison;
    const tr = DATA.i18n[state.lang].compare;

    // Plate switcher image & caption
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

    // Hotspots on 1840 & 1843a
    hotspots1840.innerHTML = fc.persons
      .map(
        (p) => `
      <button type="button"
        class="hotspot-pin ${p.id === state.activePersonId ? 'is-active' : ''}"
        style="left:${p.pos1840.x}%; top:${p.pos1840.y}%;"
        data-person-id="${p.id}"
        title="${loc(p, 'name')}">
        ${p.num}
      </button>`
      )
      .join('');

    hotspots1843.innerHTML = fc.persons
      .map(
        (p) => `
      <button type="button"
        class="hotspot-pin ${p.id === state.activePersonId ? 'is-active' : ''}"
        style="left:${p.pos1843.x}%; top:${p.pos1843.y}%;"
        data-person-id="${p.id}"
        title="${loc(p, 'name')}">
        ${p.num}
      </button>`
      )
      .join('');

    // Person chips
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

    // Active person dossier card
    updateActivePersonUI();

    // Toggle pins vs slider
    const pinsView = document.getElementById('compare-pins-view');
    const sliderView = document.getElementById('compare-slider-view');
    pinsView.hidden = state.compareMode !== 'pins';
    sliderView.hidden = state.compareMode !== 'slider';
    document.querySelectorAll('[data-compare-mode]').forEach((b) => {
      b.classList.toggle('is-active', b.getAttribute('data-compare-mode') === state.compareMode);
    });
  }

  function updateActivePersonUI() {
    const fc = DATA.faceComparison;
    document.querySelectorAll('[data-person-id]').forEach((el) => {
      el.classList.toggle('is-active', el.getAttribute('data-person-id') === state.activePersonId);
    });
    const activePerson = fc.persons.find((p) => p.id === state.activePersonId) || fc.persons[0];
    const h1840 = state.lang === 'ua' ? '1840 · ПЕНЗЕЛЬ ГЮНТЕРА ГЕНСЛЕРА' : '1840 · КИСТЬ ГЮНТЕРА ГЕНСЛЕРА';
    const h1843 = state.lang === 'ua' ? '6 ТРАВНЯ 1843 · СРІБЛО ДАГЕРОТИПА' : '6 МАЯ 1843 · СЕРЕБРО ДАГЕРОТИПА';
    document.getElementById('person-dossier').innerHTML = `
      <div class="person-dossier__head">
        <h3>${activePerson.num}. ${loc(activePerson, 'name')}</h3>
        <span class="mono-label">${loc(activePerson, 'role')}</span>
      </div>
      <div class="person-dossier__cols">
        <div class="person-dossier__col">
          <h4>${h1840}</h4>
          <p>${loc(activePerson, 'desc1840')}</p>
        </div>
        <div class="person-dossier__col">
          <h4>${h1843}</h4>
          <p>${loc(activePerson, 'desc1843')}</p>
        </div>
      </div>`;
  }

  /* ------------------------------------------------------------------------
     Fahrkarte Ticket Form & Live Preview
     ------------------------------------------------------------------------ */
  function populateTicketCitySelect() {
    const select = document.getElementById('f-city');
    const prev = select.value || state.activeCityId;
    select.innerHTML = DATA.cities
      .map((c) => `<option value="${c.id}">${loc(c, 'name')} · ${loc(c, 'dates')}</option>`)
      .join('');
    select.value = DATA.cities.some((c) => c.id === prev) ? prev : state.activeCityId;
  }

  function updateTicketFormatOptions() {
    const formatSel = document.getElementById('f-format');
    const currentVal = formatSel.value || 'full';
    if (state.lang === 'ua') {
      formatSel.options[0].textContent = '4 дні (Чт–Нд) · 390 €';
      formatSel.options[1].textContent = 'Вікенд (2 дні, Сб–Нд) · 260 €';
      formatSel.options[2].textContent = 'Лист очікування · 0 €';
    } else {
      formatSel.options[0].textContent = '4 дня (Чт–Вс) · 390 €';
      formatSel.options[1].textContent = 'Уикенд (2 дня, Сб–Вс) · 260 €';
      formatSel.options[2].textContent = 'Лист ожидания · 0 €';
    }
    formatSel.value = currentVal;
  }

  function updateTicketPreview() {
    const cityId = document.getElementById('f-city').value || state.activeCityId;
    const city = DATA.cities.find((c) => c.id === cityId) || DATA.cities[0];
    const formatVal = document.getElementById('f-format').value;
    const groupLang = document.getElementById('f-lang').value;
    const name = document.getElementById('f-name').value.trim() || (state.lang === 'ua' ? 'Гість' : 'Гость');
    const contact = document.getElementById('f-contact').value.trim() || '—';
    const comment = document.getElementById('f-comment').value.trim();

    let formatLabel = state.lang === 'ua' ? '4 дні (Чт–Нд)' : '4 дня (Чт–Вс)';
    let priceText = `${DATA.meta.prices.fullEarly} €`;
    if (formatVal === 'weekend') {
      formatLabel = state.lang === 'ua' ? 'Вікенд-ядро (2 дні)' : 'Уикенд-ядро (2 дня)';
      priceText = `${DATA.meta.prices.weekend} €`;
    } else if (formatVal === 'waitlist' || city.isLabStub) {
      formatLabel = state.lang === 'ua' ? 'Лист очікування (трійка)' : 'Лист ожидания (тройка)';
      priceText = state.lang === 'ua' ? '0 € зараз' : '0 € сейчас';
    }

    const seatLabel = state.lang === 'ua' ? 'місце №' : 'место №';
    const spotsText = city.isLabStub
      ? `${city.spotsFilled} / ${city.spotsMin}`
      : `${city.spotsFilled} / ${city.spotsMin} (${seatLabel}${Math.min(city.spotsFilled + 1, city.spotsMin)})`;

    document.getElementById('tp-issue').textContent = `№ ${city.issueNo}`;
    document.getElementById('tp-city').textContent = loc(city, 'name');
    document.getElementById('tp-dates').textContent = loc(city, 'dates');
    document.getElementById('tp-format').textContent = formatLabel;
    document.getElementById('tp-price').textContent = priceText;
    document.getElementById('tp-spots').textContent = spotsText;
    document.getElementById('tp-person').textContent = `${name} · ${groupLang}`;

    const messageLines =
      state.lang === 'ua'
        ? [
            `Заявка на експедицію (${loc(city, 'name')})`,
            `Дати: ${loc(city, 'dates')}`,
            `Формат: ${formatLabel} (${priceText})`,
            `Ім’я: ${name}`,
            `Контакт: ${contact}`,
            `Мова групи: ${groupLang}`
          ]
        : [
            `Заявка на экспедицию (${loc(city, 'name')})`,
            `Даты: ${loc(city, 'dates')}`,
            `Формат: ${formatLabel} (${priceText})`,
            `Имя: ${name}`,
            `Контакт: ${contact}`,
            `Язык группы: ${groupLang}`
          ];
    if (comment) messageLines.push(`${state.lang === 'ua' ? 'Коментар' : 'Комментарий'}: ${comment}`);

    const msgText = messageLines.join('\n');
    document.getElementById('tp-message').textContent = msgText;

    const tgHref = `https://t.me/${DATA.meta.telegramUsername}?text=${encodeURIComponent(msgText)}`;
    document.getElementById('btn-send-telegram').setAttribute('href', tgHref);
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
    if (idx !== -1) {
      openLightboxById(list[idx].id);
    }
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
     City Selection & Synchronization
     ------------------------------------------------------------------------ */
  function selectCity(cityId, syncForm = true) {
    const city = DATA.cities.find((c) => c.id === cityId);
    if (!city) return;

    state.activeCityId = cityId;
    setAccentColor(city.accentColor);
    history.replaceState(null, '', `#city=${cityId}`);

    renderTimeline();
    renderSvgPins();
    renderCityCards();
    renderDossier();

    if (syncForm) {
      const fCity = document.getElementById('f-city');
      fCity.value = cityId;
      const fFormat = document.getElementById('f-format');
      fFormat.value = city.isLabStub ? 'waitlist' : 'full';
      updateTicketPreview();
    }
  }

  /* ------------------------------------------------------------------------
     Event Delegation & Listeners
     ------------------------------------------------------------------------ */
  function bindEvents() {
    // Language switcher
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.lang = btn.getAttribute('data-lang');
        document.querySelectorAll('.lang-btn').forEach((b) => b.classList.toggle('is-active', b === btn));
        renderStaticI18n();
        renderTimeline();
        renderSvgPins();
        renderCityCards();
        renderDossier();
        renderCompareModule();
        populateTicketCitySelect();
        updateTicketFormatOptions();
        updateTicketPreview();
      });
    });

    // Mobile drawer toggle
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

    // Hub filters
    document.querySelectorAll('[data-hub-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.hubFilter = btn.getAttribute('data-hub-filter');
        document.querySelectorAll('[data-hub-filter]').forEach((b) => b.classList.toggle('is-active', b === btn));
        renderCityCards();
      });
    });

    // Delegated clicks across dynamic components
    document.addEventListener('click', (e) => {
      const cityTrigger = e.target.closest('[data-select-city]');
      if (cityTrigger) {
        selectCity(cityTrigger.getAttribute('data-select-city'), true);
        return;
      }

      const jumpBtn = e.target.closest('[data-jump-city]');
      if (jumpBtn) {
        selectCity(jumpBtn.getAttribute('data-jump-city'), true);
        return;
      }

      const prefillBtn = e.target.closest('[data-prefill-city]');
      if (prefillBtn) {
        selectCity(prefillBtn.getAttribute('data-prefill-city'), true);
        return;
      }

      const tabBtn = e.target.closest('[data-dossier-tab]');
      if (tabBtn) {
        state.dossierTab = tabBtn.getAttribute('data-dossier-tab');
        renderDossier();
        return;
      }

      const schedBtn = e.target.closest('[data-schedule-mode]');
      if (schedBtn) {
        state.scheduleMode = schedBtn.getAttribute('data-schedule-mode');
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
        return;
      }

      const pickFormatBtn = e.target.closest('[data-pick-format]');
      if (pickFormatBtn) {
        const format = pickFormatBtn.getAttribute('data-pick-format');
        document.getElementById('f-format').value = format;
        if (format === 'full' || format === 'weekend') {
          document.getElementById('f-city').value = 'hamburg';
          selectCity('hamburg', false);
        }
        updateTicketPreview();
        document.getElementById('ticket-section').scrollIntoView({ behavior: 'smooth' });
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

    // Keyboard support for SVG city pins
    document.getElementById('svg-city-pins').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const pin = e.target.closest('[data-select-city]');
        if (pin) {
          e.preventDefault();
          selectCity(pin.getAttribute('data-select-city'), true);
        }
      }
    });

    // Before/After slider
    const baRange = document.getElementById('ba-range');
    const baOverlay = document.getElementById('ba-overlay');
    const baHandle = document.getElementById('ba-handle');
    baRange.addEventListener('input', () => {
      const val = baRange.value;
      baOverlay.style.setProperty('--pos', `${val}%`);
      baHandle.style.left = `${val}%`;
    });

    // Form live bindings
    ['f-city', 'f-format', 'f-lang', 'f-name', 'f-contact', 'f-comment'].forEach((id) => {
      const el = document.getElementById(id);
      el.addEventListener('input', updateTicketPreview);
      el.addEventListener('change', () => {
        if (id === 'f-city') {
          selectCity(el.value, false);
        }
        updateTicketPreview();
      });
    });

    // Copy ticket text
    document.getElementById('btn-copy-ticket').addEventListener('click', async () => {
      const text = document.getElementById('tp-message').textContent;
      const feedback = document.getElementById('copy-feedback');
      try {
        await navigator.clipboard.writeText(text);
        feedback.textContent = DATA.i18n[state.lang].tariffs.form.copied;
        setTimeout(() => {
          feedback.textContent = '';
        }, 3000);
      } catch {
        feedback.textContent = text;
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
    parseInitialCityFromUrl();
    renderStaticI18n();
    populateTicketCitySelect();
    updateTicketFormatOptions();
    selectCity(state.activeCityId, true);
    renderCompareModule();
    bindEvents();
  }

  init();
})();
