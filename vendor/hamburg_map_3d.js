/**
 * HAMBURG & GERMANY — ARCHIVAL 3D VECTOR MAP ENGINE (MapLibre GL JS + OpenFreeMap)
 * ---------------------------------------------------------------------------------
 * - Real OpenStreetMap vector tiles styled in a custom warm archival palette
 * - Real dense 3D extruded Hamburg architecture (zero toy blocks, zero empty gaps)
 * - Accurate historical May 1842 Great Fire perimeter overlay (toggleable)
 * - Native 60fps WebGL flyTo transitions between 16 German Bundesländer and 3D Hamburg
 * - Instant GPU feature-state hover on Bundesländer
 * - Compact circular numbered pins (01..07) with short hover tooltips (no giant bars)
 * - Tight native maxBounds invisible camera walls
 */
(function () {
  'use strict';

  const OPENFREEMAP_TILES = 'https://tiles.openfreemap.org/planet';
  const OPENFREEMAP_GLYPHS = 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf';

  const GERMANY_VIEW = {
    center: [10.45, 51.18],
    zoom: 4.82,
    pitch: 0,
    bearing: 0
  };

  const HAMBURG_VIEW = {
    center: [9.9902, 53.5512],
    zoom: 13.8,
    pitch: 52,
    bearing: -14
  };

  const STUTTGART_VIEW = {
    center: [9.1765, 48.7768],
    zoom: 14.1,
    pitch: 52,
    bearing: -14
  };

  const GERMANY_BOUNDS = [
    [3.8, 46.3],
    [17.0, 55.9]
  ];

  // Tight invisible walls covering Hamburg historic center up through Ohlsdorf
  const HAMBURG_BOUNDS = [
    [9.925, 53.516],
    [10.082, 53.648]
  ];

  // Tight invisible walls covering Stuttgart historic basin (Kessel)
  const STUTTGART_BOUNDS = [
    [9.115, 48.742],
    [9.235, 48.812]
  ];

  const CITY_3D_PRESETS = {
    stuttgart: {
      view: STUTTGART_VIEW,
      mobileZoom: 13.25,
      bounds: STUTTGART_BOUNDS,
      accent: '#7A2E3A',
      zoneLayers: ['stuttgart-zone-fill', 'stuttgart-zone-outline', 'stuttgart-zone-label']
    },
    hamburg: {
      view: HAMBURG_VIEW,
      mobileZoom: 13.15,
      bounds: HAMBURG_BOUNDS,
      accent: '#C23B1A',
      zoneLayers: ['great-fire-fill', 'great-fire-outline', 'great-fire-label']
    }
  };

  const CITY_COORDS = {
    stuttgart: [9.1829, 48.7758],
    hamburg: [9.9937, 53.5511],
    dresden: [13.7373, 51.0504],
    berlin: [13.405, 52.52],
    frankfurt: [8.6821, 50.1109],
    munich: [11.582, 48.1351]
  };

  const CITY_TO_STATE = {
    stuttgart: 'baden',
    hamburg: 'hamburg',
    dresden: 'sachsen',
    berlin: 'berlin',
    frankfurt: 'hessen',
    munich: 'bayern'
  };

  const SHORT_LANDMARK_NAMES = {
    'st-1': {
      ru: 'StadtPalais · Зюсс',
      ua: 'StadtPalais · Зюсс',
      de: 'StadtPalais · Süß',
      en: 'StadtPalais · Süß'
    },
    'st-2': {
      ru: 'Hospitalkirche · Шубарт',
      ua: 'Hospitalkirche · Шубарт',
      de: 'Hospitalkirche · Schubart',
      en: 'Hospitalkirche · Schubart'
    },
    'st-3': {
      ru: 'Altes Schloss · Karlsschule',
      ua: 'Altes Schloss · Karlsschule',
      de: 'Altes Schloss · Karlsschule',
      en: 'Altes Schloss · Karlsschule'
    },
    'st-4': {
      ru: 'Hoppenlau · В. Гауф',
      ua: 'Hoppenlau · В. Гауф',
      de: 'Hoppenlau · W. Hauff',
      en: 'Hoppenlau · W. Hauff'
    },
    'st-5': {
      ru: 'Schillerplatz (1839)',
      ua: 'Schillerplatz (1839)',
      de: 'Schillerplatz (1839)',
      en: 'Schillerplatz (1839)'
    },
    'st-6': {
      ru: 'Staatsgalerie · 1848',
      ua: 'Staatsgalerie · 1848',
      de: 'Staatsgalerie · 1848',
      en: 'Staatsgalerie · 1848'
    },
    'st-7': {
      ru: 'Дом Гегеля (Hegel-Haus)',
      ua: 'Дім Гегеля (Hegel-Haus)',
      de: 'Hegel-Haus',
      en: 'Hegel-Haus'
    },
    'st-8': {
      ru: 'Silberburg · Мёрике',
      ua: 'Silberburg · Мьоріке',
      de: 'Silberburg · Mörike',
      en: 'Silberburg · Mörike'
    },
    'hm-1': {
      ru: 'Отель у Альстера',
      ua: 'Готель біля Альстера',
      de: 'Hotel · Binnenalster',
      en: 'Binnenalster Hotel'
    },
    'hm-2': {
      ru: 'Hamburger Kunsthalle',
      ua: 'Hamburger Kunsthalle',
      de: 'Hamburger Kunsthalle',
      en: 'Hamburger Kunsthalle'
    },
    'hm-3': {
      ru: 'Deichstraße (1842)',
      ua: 'Deichstraße (1842)',
      de: 'Deichstraße (1842)',
      en: 'Deichstraße (1842)'
    },
    'hm-4': {
      ru: 'St. Nikolai · Ратуша',
      ua: 'St. Nikolai · Ратуша',
      de: 'St. Nikolai · Rathaus',
      en: 'St. Nikolai · Old Hall'
    },
    'hm-5': {
      ru: 'Музей истории',
      ua: 'Музей історії',
      de: 'Hamburg Museum',
      en: 'History Museum'
    },
    'hm-6': {
      ru: 'Caffamacherreihe (1843)',
      ua: 'Caffamacherreihe (1843)',
      de: 'Caffamacherreihe (1843)',
      en: 'Caffamacherreihe (1843)'
    },
    'hm-7': {
      ru: 'Некрополь Ольсдорф',
      ua: 'Некрополь Ольсдорф',
      de: 'Friedhof Ohlsdorf',
      en: 'Ohlsdorf Cemetery'
    }
  };

  // Historical May 5-8, 1842 Great Fire of Hamburg footprint (real geographic coordinates)
  const GREAT_FIRE_1842_GEOJSON = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { name: 'BRANDGEBIET · MAI 1842' },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [9.9862, 53.5453], // Deichstraße 42 (origin)
            [9.9854, 53.5472], // Rödingsmarkt edge
            [9.9874, 53.5494], // Mühlenbrücke / Alter Wall west
            [9.9906, 53.5515], // Alsterarkaden / Neuer Wall corner
            [9.9922, 53.5535], // Jungfernstieg west waterfront
            [9.9978, 53.5522], // Jungfernstieg / Ballindamm corner
            [10.0014, 53.5558], // Alstertor / Ballindamm north
            [10.0038, 53.5546], // Ferdinandstraße / Gertrudenkirchhof
            [10.0044, 53.5518], // Brandsende / Rosenstraße
            [10.0015, 53.5498], // Mönckebergstraße / St. Petri east
            [9.9974, 53.5484], // Bergstraße / Domplatz
            [9.9936, 53.5471], // Trostbrücke / St. Nikolai south-east
            [9.9904, 53.5456], // Nikolaifleet south
            [9.9862, 53.5453]
          ]]
        }
      }
    ]
  };

  // Historical 18th–19th century Residenzstadt & Literary Core of Stuttgart
  const STUTTGART_RESIDENZ_GEOJSON = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { name: 'RESIDENZSTADT · 1738–1848' },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [9.1722, 48.7796], // Hospitalkirche / Büchsenstraße NW
            [9.1774, 48.7809], // Schlossplatz / Königstraße N
            [9.1852, 48.7798], // Akademiegarten / Kulturmeile NE
            [9.1860, 48.7754], // StadtPalais / Charlottenplatz SE
            [9.1782, 48.7724], // Eberhardstraße / Hegel-Haus S
            [9.1726, 48.7746], // Calwer Straße / Rotebühl SW
            [9.1722, 48.7796]
          ]]
        }
      }
    ]
  };

  const BUNDESLAENDER_LABELS_GEOJSON = {
    type: 'FeatureCollection',
    features: [
      { name: 'SCHLESWIG-HOLSTEIN', coords: [9.75, 54.24] },
      { name: 'MECKLENBURG-VORPOMMERN', coords: [12.55, 53.72] },
      { name: 'NIEDERSACHSEN', coords: [9.15, 52.72] },
      { name: 'BRANDENBURG', coords: [13.45, 52.12] },
      { name: 'SACHSEN-ANHALT', coords: [11.65, 51.92] },
      { name: 'NORDRHEIN-WESTFALEN', coords: [7.55, 51.45] },
      { name: 'HESSEN', coords: [9.05, 50.65] },
      { name: 'THÜRINGEN', coords: [11.05, 50.86] },
      { name: 'SACHSEN', coords: [13.35, 51.02] },
      { name: 'RHEINLAND-PFALZ', coords: [7.35, 49.92] },
      { name: 'BADEN-WÜRTTEMBERG', coords: [9.15, 48.58] },
      { name: 'BAYERN', coords: [11.55, 48.95] }
    ].map((item) => ({
      type: 'Feature',
      properties: { name: item.name },
      geometry: { type: 'Point', coordinates: item.coords }
    }))
  };

  function buildArchivalStyle() {
    return {
      version: 8,
      name: 'Archival Editorial 3D',
      glyphs: OPENFREEMAP_GLYPHS,
      light: {
        anchor: 'viewport',
        color: '#FFF6E6',
        intensity: 0.44,
        position: [1.3, 195, 42]
      },
      sources: {
        openfreemap: {
          type: 'vector',
          url: OPENFREEMAP_TILES
        }
      },
      layers: [
        {
          id: 'background',
          type: 'background',
          paint: {
            'background-color': '#EFE9DC'
          }
        },
        {
          id: 'landuse-residential',
          type: 'fill',
          source: 'openfreemap',
          'source-layer': 'landuse',
          minzoom: 9,
          filter: ['in', 'class', 'residential', 'commercial', 'industrial', 'suburb', 'neighbourhood'],
          paint: {
            'fill-color': '#EAE2D1',
            'fill-opacity': 0.72
          }
        },
        {
          id: 'landcover-wood-grass',
          type: 'fill',
          source: 'openfreemap',
          'source-layer': 'landcover',
          minzoom: 9,
          filter: ['in', 'class', 'wood', 'grass', 'farmland', 'wetland'],
          paint: {
            'fill-color': [
              'match',
              ['get', 'class'],
              'wood', '#C7D2B9',
              'grass', '#D4DCC7',
              '#D8DEC9'
            ],
            'fill-opacity': 0.85
          }
        },
        {
          id: 'park-cemetery',
          type: 'fill',
          source: 'openfreemap',
          'source-layer': 'landuse',
          minzoom: 9,
          filter: ['in', 'class', 'park', 'cemetery', 'pitch', 'stadium', 'recreation_ground'],
          paint: {
            'fill-color': [
              'match',
              ['get', 'class'],
              'cemetery', '#C5D0B8',
              '#CED7C0'
            ],
            'fill-outline-color': 'rgba(90, 108, 78, 0.25)'
          }
        },
        {
          id: 'park-layer',
          type: 'fill',
          source: 'openfreemap',
          'source-layer': 'park',
          minzoom: 9,
          paint: {
            'fill-color': '#CED7C0',
            'fill-opacity': 0.85
          }
        },
        {
          id: 'water-fill',
          type: 'fill',
          source: 'openfreemap',
          'source-layer': 'water',
          paint: {
            'fill-color': '#5C8090'
          }
        },
        {
          id: 'water-outline',
          type: 'line',
          source: 'openfreemap',
          'source-layer': 'water',
          minzoom: 10,
          paint: {
            'line-color': '#456473',
            'line-width': 1
          }
        },
        {
          id: 'waterway-lines',
          type: 'line',
          source: 'openfreemap',
          'source-layer': 'waterway',
          minzoom: 10,
          paint: {
            'line-color': '#5C8090',
            'line-width': ['interpolate', ['linear'], ['zoom'], 10, 0.8, 15, 3.2]
          }
        },
        {
          id: 'roads-railway',
          type: 'line',
          source: 'openfreemap',
          'source-layer': 'transportation',
          minzoom: 11,
          filter: ['==', 'class', 'rail'],
          paint: {
            'line-color': '#B6AA97',
            'line-width': ['interpolate', ['linear'], ['zoom'], 11, 0.7, 16, 1.5],
            'line-dasharray': [4, 3],
            'line-opacity': 0.7
          }
        },
        {
          id: 'roads-minor-casing',
          type: 'line',
          source: 'openfreemap',
          'source-layer': 'transportation',
          minzoom: 12.5,
          filter: ['in', 'class', 'minor', 'service', 'track', 'path', 'pedestrian'],
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': '#D2C7B4',
            'line-width': ['interpolate', ['linear'], ['zoom'], 12.5, 1.4, 16, 6.2]
          }
        },
        {
          id: 'roads-minor',
          type: 'line',
          source: 'openfreemap',
          'source-layer': 'transportation',
          minzoom: 12.5,
          filter: ['in', 'class', 'minor', 'service', 'track', 'path', 'pedestrian'],
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': '#F8F4EC',
            'line-width': ['interpolate', ['linear'], ['zoom'], 12.5, 0.9, 16, 4.6]
          }
        },
        {
          id: 'roads-major-casing',
          type: 'line',
          source: 'openfreemap',
          'source-layer': 'transportation',
          minzoom: 10,
          filter: ['in', 'class', 'motorway', 'trunk', 'primary', 'secondary', 'tertiary'],
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': '#BFB29B',
            'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1.6, 14, 5.2, 16.5, 11.5]
          }
        },
        {
          id: 'roads-major',
          type: 'line',
          source: 'openfreemap',
          'source-layer': 'transportation',
          minzoom: 10,
          filter: ['in', 'class', 'motorway', 'trunk', 'primary', 'secondary', 'tertiary'],
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': '#FCF9F2',
            'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1.0, 14, 3.8, 16.5, 9.2]
          }
        },
        {
          id: 'bridges-casing',
          type: 'line',
          source: 'openfreemap',
          'source-layer': 'transportation',
          minzoom: 12,
          filter: ['==', 'brunnel', 'bridge'],
          layout: { 'line-cap': 'butt', 'line-join': 'round' },
          paint: {
            'line-color': '#8E8272',
            'line-width': ['interpolate', ['linear'], ['zoom'], 12, 2.2, 16, 9.5]
          }
        },
        {
          id: 'bridges-fill',
          type: 'line',
          source: 'openfreemap',
          'source-layer': 'transportation',
          minzoom: 12,
          filter: ['==', 'brunnel', 'bridge'],
          layout: { 'line-cap': 'butt', 'line-join': 'round' },
          paint: {
            'line-color': '#F5EFE3',
            'line-width': ['interpolate', ['linear'], ['zoom'], 12, 1.4, 16, 7.2]
          }
        },
        {
          id: 'country-borders-world',
          type: 'line',
          source: 'openfreemap',
          'source-layer': 'boundary',
          maxzoom: 10,
          filter: ['==', 'admin_level', 2],
          paint: {
            'line-color': '#9A8F7E',
            'line-width': 1,
            'line-opacity': 0.55
          }
        },
        {
          id: 'buildings-2d-mid',
          type: 'fill',
          source: 'openfreemap',
          'source-layer': 'building',
          minzoom: 11,
          maxzoom: 13.4,
          paint: {
            'fill-color': '#DFD5C2',
            'fill-outline-color': '#CBBFA9',
            'fill-opacity': ['interpolate', ['linear'], ['zoom'], 11, 0.35, 12.6, 0.85, 13.3, 0]
          }
        },
        {
          id: 'buildings-3d',
          type: 'fill-extrusion',
          source: 'openfreemap',
          'source-layer': 'building',
          minzoom: 12.2,
          paint: {
            'fill-extrusion-color': [
              'interpolate',
              ['linear'],
              ['coalesce', ['get', 'render_height'], 12],
              0, '#E7DFCD',
              16, '#DDD1BC',
              32, '#CFC0A7',
              60, '#BCA88C',
              110, '#A89174'
            ],
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              12.2, 0,
              13.1, ['coalesce', ['get', 'render_height'], 12]
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              12.2, 0,
              13.1, ['coalesce', ['get', 'render_min_height'], 0]
            ],
            'fill-extrusion-opacity': 0.94,
            'fill-extrusion-vertical-gradient': true
          }
        },
        {
          id: 'water-labels',
          type: 'symbol',
          source: 'openfreemap',
          'source-layer': 'water_name',
          minzoom: 11.5,
          layout: {
            'text-field': ['coalesce', ['get', 'name:de'], ['get', 'name']],
            'text-font': ['Noto Sans Italic'],
            'text-size': ['interpolate', ['linear'], ['zoom'], 11.5, 10, 15, 13],
            'text-letter-spacing': 0.14
          },
          paint: {
            'text-color': '#F4EFE4',
            'text-halo-color': 'rgba(54, 83, 97, 0.85)',
            'text-halo-width': 1.4
          }
        },
        {
          id: 'road-labels',
          type: 'symbol',
          source: 'openfreemap',
          'source-layer': 'transportation_name',
          minzoom: 14.3,
          layout: {
            'symbol-placement': 'line',
            'text-field': ['coalesce', ['get', 'name:de'], ['get', 'name']],
            'text-font': ['Noto Sans Regular'],
            'text-size': 10.5,
            'text-max-angle': 30
          },
          paint: {
            'text-color': '#4F483E',
            'text-halo-color': '#F3EFE6',
            'text-halo-width': 1.6
          }
        },
        {
          id: 'district-labels',
          type: 'symbol',
          source: 'openfreemap',
          'source-layer': 'place',
          minzoom: 11.5,
          maxzoom: 14.6,
          filter: ['in', 'class', 'suburb', 'quarter', 'neighbourhood'],
          layout: {
            'text-field': ['upcase', ['coalesce', ['get', 'name:de'], ['get', 'name']]],
            'text-font': ['Noto Sans Bold'],
            'text-size': 10,
            'text-letter-spacing': 0.16
          },
          paint: {
            'text-color': 'rgba(20, 19, 17, 0.52)',
            'text-halo-color': 'rgba(239, 233, 220, 0.9)',
            'text-halo-width': 1.5
          }
        }
      ]
    };
  }

  class HamburgMapStage {
    constructor(opts) {
      this.container = opts.container;
      this.onSelectLandmark = opts.onSelectLandmark || function () {};
      this.onSelectCityFromCountry = opts.onSelectCityFromCountry || function () {};
      this.onModeChange = opts.onModeChange || function () {};
      this.getLandmarksData = opts.getLandmarksData || function () { return []; };
      this.getCitiesData = opts.getCitiesData || function () { return []; };
      this.getLang = opts.getLang || function () { return 'en'; };
      this.loc = opts.loc || function (obj, key) { return obj[key]; };

      this.mode = 'city'; // 'city' | 'country'
      this.activeLandmarkId = null;
      this.activeCityId = opts.initialCityId && CITY_3D_PRESETS[opts.initialCityId] ? opts.initialCityId : 'stuttgart';
      this.active3DCityId = this.activeCityId;
      this.fireLayerVisible = true;
      this.hoveredStateId = null;
      this.landmarkMarkers = {};
      this.countryMarkers = {};
      this.mapReady = false;

      this.initMap();
    }

    getPreset(cityId) {
      return CITY_3D_PRESETS[cityId || this.active3DCityId] || CITY_3D_PRESETS.stuttgart;
    }

    getShortLandmarkName(lm) {
      const lang = this.getLang();
      const dict = SHORT_LANDMARK_NAMES[lm.id];
      if (dict && dict[lang]) return dict[lang];
      const full = this.loc(lm, 'name') || lm.id;
      return full.split('(')[0].trim();
    }

    initMap() {
      if (!window.maplibregl) return;
      this.container.innerHTML = '';

      const preset = this.getPreset(this.active3DCityId);
      const isMobile =
        window.matchMedia &&
        window.matchMedia('(max-width: 820px), (pointer: coarse)').matches;
      const startZoom = (this.container.clientWidth || 640) < 520 ? preset.mobileZoom : preset.view.zoom;

      this.map = new window.maplibregl.Map({
        container: this.container,
        style: buildArchivalStyle(),
        center: preset.view.center,
        zoom: startZoom,
        pitch: preset.view.pitch,
        bearing: preset.view.bearing,
        minZoom: 12.0,
        maxZoom: 17.8,
        maxPitch: 64,
        maxBounds: preset.bounds,
        cooperativeGestures: isMobile,
        antialias: true,
        attributionControl: false
      });

      // Subtle minimal zoom buttons bottom-left
      this.map.addControl(
        new window.maplibregl.NavigationControl({ showCompass: false, visualizePitch: false }),
        'bottom-left'
      );

      // Compact attribution
      this.map.addControl(
        new window.maplibregl.AttributionControl({ compact: true }),
        'bottom-right'
      );

      this.map.on('load', () => {
        this.mapReady = true;
        this.addCustomLayers();
        this.buildLandmarkHTMLPins();
        this.buildCountryCityPins();
        this.syncMarkerVisibility();
      });

      this.map.on('zoom', () => {
        this.syncMarkerVisibility();
      });
    }

    addCustomLayers() {
      const map = this.map;

      // 1. 16 GERMAN BUNDESLÄNDER (GPU feature-state instant hover, visible in Germany view)
      if (window.GERMANY_BUNDESLAENDER_GEOJSON) {
        const geo = JSON.parse(JSON.stringify(window.GERMANY_BUNDESLAENDER_GEOJSON));
        const palette = [
          '#E3DBC8', '#DDD3BE', '#E7E0CF', '#D9CEB8',
          '#E0D7C3', '#E8E2D2', '#D8CBB4', '#E2DAC6'
        ];
        this.stateFeatureIds = {};
        geo.features.forEach((f, idx) => {
          f.id = idx + 1;
          const normName = ((f.properties && f.properties.name) || '').toLowerCase();
          const isHH = normName.includes('hamburg');
          const isBW = normName.includes('baden');
          f.properties._isHamburg = isHH;
          f.properties._isBaden = isBW;
          f.properties._baseColor = isBW ? '#D9C2C6' : isHH ? '#C23B1A' : palette[idx % palette.length];
          if (isBW) this.stateFeatureIds.baden = f.id;
          else if (isHH) this.stateFeatureIds.hamburg = f.id;
          else if (normName === 'sachsen' || normName.includes('saxony')) this.stateFeatureIds.sachsen = f.id;
          else if (normName.includes('berlin')) this.stateFeatureIds.berlin = f.id;
          else if (normName.includes('hessen') || normName.includes('hesse')) this.stateFeatureIds.hessen = f.id;
          else if (normName.includes('bayern') || normName.includes('bavaria')) this.stateFeatureIds.bayern = f.id;
        });

        map.addSource('bundeslaender', {
          type: 'geojson',
          data: geo
        });

        map.addLayer({
          id: 'bundeslaender-fill',
          type: 'fill',
          source: 'bundeslaender',
          maxzoom: 9.8,
          paint: {
            'fill-color': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              ['case', ['get', '_isHamburg'], '#C23B1A', '#DEC7A4'],
              ['boolean', ['feature-state', 'hover'], false],
              ['case', ['get', '_isHamburg'], '#D64825', '#F6F1E4'],
              ['get', '_baseColor']
            ],
            'fill-opacity': [
              'interpolate', ['linear'], ['zoom'],
              7.2, 0.96,
              9.5, 0
            ]
          }
        });

        map.addLayer({
          id: 'bundeslaender-border',
          type: 'line',
          source: 'bundeslaender',
          maxzoom: 9.8,
          paint: {
            'line-color': '#141311',
            'line-width': [
              'case',
              ['boolean', ['feature-state', 'selected'], false], 2.1,
              ['boolean', ['feature-state', 'hover'], false], 1.8,
              1.05
            ],
            'line-opacity': [
              'interpolate', ['linear'], ['zoom'],
              7.2, 0.78,
              9.5, 0
            ]
          }
        });

        // Instant GPU hover on Bundesländer
        map.on('mousemove', 'bundeslaender-fill', (e) => {
          if (this.mode !== 'country') return;
          if (!e.features || !e.features.length) return;
          const fid = e.features[0].id;
          if (this.hoveredStateId !== null && this.hoveredStateId !== fid) {
            map.setFeatureState({ source: 'bundeslaender', id: this.hoveredStateId }, { hover: false });
          }
          this.hoveredStateId = fid;
          map.setFeatureState({ source: 'bundeslaender', id: fid }, { hover: true });
          map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'bundeslaender-fill', () => {
          if (this.hoveredStateId !== null) {
            map.setFeatureState({ source: 'bundeslaender', id: this.hoveredStateId }, { hover: false });
            this.hoveredStateId = null;
          }
          if (this.mode === 'country') {
            map.getCanvas().style.cursor = '';
          }
        });

        // Clicking Baden-Württemberg (Stuttgart) or Hamburg flies right into that city's 3D view
        map.on('click', 'bundeslaender-fill', (e) => {
          if (this.mode !== 'country' || !e.features || !e.features.length) return;
          const props = e.features[0].properties || {};
          if (props._isBaden) {
            this.whooshToCity('stuttgart');
            this.onSelectCityFromCountry('stuttgart');
          } else if (props._isHamburg) {
            this.whooshToCity('hamburg');
            this.onSelectCityFromCountry('hamburg');
          }
        });
      }

      // 2. BUNDESLÄNDER LABELS
      map.addSource('bundeslaender-labels', {
        type: 'geojson',
        data: BUNDESLAENDER_LABELS_GEOJSON
      });
      map.addLayer({
        id: 'bundeslaender-labels-layer',
        type: 'symbol',
        source: 'bundeslaender-labels',
        maxzoom: 8.2,
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Bold'],
          'text-size': 9.2,
          'text-letter-spacing': 0.12
        },
        paint: {
          'text-color': 'rgba(20, 19, 17, 0.54)',
          'text-halo-color': 'rgba(239, 233, 220, 0.75)',
          'text-halo-width': 1.2,
          'text-opacity': ['interpolate', ['linear'], ['zoom'], 6.6, 1, 8.0, 0]
        }
      });

      // 3. GERMANY 6-CITY EXPEDITION ROUTE (macro view: Stuttgart -> Hamburg -> Dresden -> Berlin -> Frankfurt -> Munich)
      map.addSource('country-route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              CITY_COORDS.stuttgart,
              CITY_COORDS.hamburg,
              CITY_COORDS.dresden,
              CITY_COORDS.berlin,
              CITY_COORDS.frankfurt,
              CITY_COORDS.munich
            ]
          }
        }
      });
      map.addLayer({
        id: 'country-route-line',
        type: 'line',
        source: 'country-route',
        maxzoom: 9.0,
        paint: {
          'line-color': '#C23B1A',
          'line-width': 2,
          'line-dasharray': [4, 4],
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 7.0, 0.72, 8.8, 0]
        }
      });

      // 4. HISTORICAL 1842 GREAT FIRE OF HAMBURG FOOTPRINT (under 3D buildings for clean architectural integration!)
      map.addSource('great-fire-1842', {
        type: 'geojson',
        data: GREAT_FIRE_1842_GEOJSON
      });

      const beforeBuildings = map.getLayer('buildings-3d') ? 'buildings-3d' : undefined;

      map.addLayer({
        id: 'great-fire-fill',
        type: 'fill',
        source: 'great-fire-1842',
        minzoom: 11.2,
        paint: {
          'fill-color': '#C23B1A',
          'fill-opacity': ['interpolate', ['linear'], ['zoom'], 11.2, 0, 12.6, 0.16]
        }
      }, beforeBuildings);

      map.addLayer({
        id: 'great-fire-outline',
        type: 'line',
        source: 'great-fire-1842',
        minzoom: 11.2,
        paint: {
          'line-color': '#C23B1A',
          'line-width': 2,
          'line-dasharray': [4, 2.5],
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 11.2, 0, 12.6, 0.78]
        }
      }, beforeBuildings);

      map.addLayer({
        id: 'great-fire-label',
        type: 'symbol',
        source: 'great-fire-1842',
        minzoom: 13.0,
        maxzoom: 15.8,
        layout: {
          'text-field': 'BRANDGEBIET · MAI 1842',
          'text-font': ['Noto Sans Bold'],
          'text-size': 9.5,
          'text-letter-spacing': 0.18
        },
        paint: {
          'text-color': '#9E2A0E',
          'text-halo-color': 'rgba(243, 239, 230, 0.92)',
          'text-halo-width': 1.6
        }
      });

      // 4B. HISTORICAL STUTTGART RESIDENZSTADT OVERLAY (under 3D buildings!)
      map.addSource('stuttgart-residenz', {
        type: 'geojson',
        data: STUTTGART_RESIDENZ_GEOJSON
      });

      map.addLayer({
        id: 'stuttgart-zone-fill',
        type: 'fill',
        source: 'stuttgart-residenz',
        minzoom: 11.2,
        paint: {
          'fill-color': '#7A2E3A',
          'fill-opacity': ['interpolate', ['linear'], ['zoom'], 11.2, 0, 12.6, 0.14]
        }
      }, beforeBuildings);

      map.addLayer({
        id: 'stuttgart-zone-outline',
        type: 'line',
        source: 'stuttgart-residenz',
        minzoom: 11.2,
        paint: {
          'line-color': '#7A2E3A',
          'line-width': 2,
          'line-dasharray': [4, 2.5],
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 11.2, 0, 12.6, 0.76]
        }
      }, beforeBuildings);

      map.addLayer({
        id: 'stuttgart-zone-label',
        type: 'symbol',
        source: 'stuttgart-residenz',
        minzoom: 13.0,
        maxzoom: 15.8,
        layout: {
          'text-field': 'RESIDENZSTADT · 1738–1848',
          'text-font': ['Noto Sans Bold'],
          'text-size': 9.5,
          'text-letter-spacing': 0.16
        },
        paint: {
          'text-color': '#6E222E',
          'text-halo-color': 'rgba(243, 239, 230, 0.92)',
          'text-halo-width': 1.6
        }
      });

      // 5. EXPEDITION WALKING ROUTES (both Hamburg & Stuttgart under 3D buildings!)
      const allCities = this.getCitiesData();
      const hhCity = allCities.find((c) => c.id === 'hamburg');
      const stCity = allCities.find((c) => c.id === 'stuttgart');
      const hhLandmarks = (hhCity && hhCity.cityMap && hhCity.cityMap.landmarks) || [];
      const stLandmarks = (stCity && stCity.cityMap && stCity.cityMap.landmarks) || [];

      const hhCoreCoords = hhLandmarks
        .filter((l) => l.id !== 'hm-7' && Array.isArray(l.lngLat))
        .map((l) => l.lngLat);
      const lm6 = hhLandmarks.find((l) => l.id === 'hm-6');
      const lm7 = hhLandmarks.find((l) => l.id === 'hm-7');

      map.addSource('hamburg-route', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { kind: 'core' },
              geometry: { type: 'LineString', coordinates: hhCoreCoords }
            },
            ...(lm6 && lm7
              ? [{
                  type: 'Feature',
                  properties: { kind: 'ohlsdorf' },
                  geometry: {
                    type: 'LineString',
                    coordinates: [lm6.lngLat, [10.0014, 53.5562], [10.015, 53.582], lm7.lngLat]
                  }
                }]
              : [])
          ]
        }
      });

      map.addLayer({
        id: 'hamburg-route-core',
        type: 'line',
        source: 'hamburg-route',
        minzoom: 11.2,
        filter: ['==', 'kind', 'core'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#C23B1A',
          'line-width': 2.4,
          'line-dasharray': [3, 3],
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 11.2, 0, 12.6, 0.78]
        }
      }, beforeBuildings);

      map.addLayer({
        id: 'hamburg-route-ohlsdorf',
        type: 'line',
        source: 'hamburg-route',
        minzoom: 11.2,
        filter: ['==', 'kind', 'ohlsdorf'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#C23B1A',
          'line-width': 1.6,
          'line-dasharray': [1.5, 3.5],
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 11.2, 0, 12.6, 0.52]
        }
      }, beforeBuildings);

      // Stuttgart literary-philosophical walking loop (st-1 .. st-8)
      const stCoreCoords = stLandmarks
        .filter((l) => Array.isArray(l.lngLat))
        .map((l) => l.lngLat);

      map.addSource('stuttgart-route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: stCoreCoords }
        }
      });

      map.addLayer({
        id: 'stuttgart-route-core',
        type: 'line',
        source: 'stuttgart-route',
        minzoom: 11.2,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#7A2E3A',
          'line-width': 2.4,
          'line-dasharray': [3, 3],
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 11.2, 0, 12.6, 0.78]
        }
      }, beforeBuildings);

      // 6. GROUND HALO ANCHORS UNDER ALL 3D CITY LANDMARKS (Stuttgart + Hamburg)
      const allGeoLandmarks = [
        ...stLandmarks.filter((l) => Array.isArray(l.lngLat)).map((l) => ({ ...l, _accent: '#7A2E3A' })),
        ...hhLandmarks.filter((l) => Array.isArray(l.lngLat)).map((l) => ({ ...l, _accent: '#C23B1A' }))
      ];

      map.addSource('landmark-halos', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: allGeoLandmarks.map((l) => ({
            type: 'Feature',
            properties: { id: l.id, accent: l._accent },
            geometry: { type: 'Point', coordinates: l.lngLat }
          }))
        }
      });

      map.addLayer({
        id: 'landmark-halos-circle',
        type: 'circle',
        source: 'landmark-halos',
        minzoom: 11.8,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 12, 8, 16, 22],
          'circle-color': ['get', 'accent'],
          'circle-opacity': 0.16,
          'circle-stroke-color': ['get', 'accent'],
          'circle-stroke-width': 1.2,
          'circle-stroke-opacity': 0.55
        }
      }, beforeBuildings);
    }

    buildLandmarkHTMLPins() {
      // Remove existing markers cleanly
      Object.values(this.landmarkMarkers).forEach((m) => m.marker.remove());
      this.landmarkMarkers = {};
      if (!this.map) return;

      const landmarks = this.getLandmarksData(this.active3DCityId);
      landmarks.forEach((lm) => {
        if (!Array.isArray(lm.lngLat)) return;

        const shortName = this.getShortLandmarkName(lm);
        const root = document.createElement('div');
        root.className = 'map-marker-root';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `map-medallion ${lm.id === this.activeLandmarkId ? 'is-active' : ''}`;
        btn.setAttribute('aria-label', `${lm.num} ${shortName}`);
        btn.innerHTML = `
          <span class="map-medallion__dot">${lm.num}</span>
          <span class="map-medallion__tip">${shortName}</span>
        `;

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.focusLandmark(lm.id);
          this.onSelectLandmark(lm.id, true);
        });

        root.appendChild(btn);

        const marker = new window.maplibregl.Marker({
          element: root,
          anchor: 'center'
        })
          .setLngLat(lm.lngLat)
          .addTo(this.map);

        this.landmarkMarkers[lm.id] = { marker, root, el: btn, data: lm };
      });

      this.syncMarkerVisibility();
    }

    buildCountryCityPins() {
      Object.values(this.countryMarkers).forEach((m) => m.marker.remove());
      this.countryMarkers = {};
      if (!this.map) return;

      const cities = this.getCitiesData();
      cities.forEach((city) => {
        const coords = CITY_COORDS[city.id];
        if (!coords) return;

        const has3D = Boolean(CITY_3D_PRESETS[city.id]);
        const root = document.createElement('div');
        root.className = 'map-marker-root';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `country-city-pin ${has3D ? 'is-hamburg-hero' : ''} ${city.id === this.activeCityId ? 'is-selected' : ''}`;
        btn.innerHTML = `
          <span class="map3d-pin__num">№${city.issueNo}</span>
          <span>${this.loc(city, 'name')}</span>
          ${has3D ? '<span class="country-pin-cta">3D →</span>' : ''}
        `;

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.activeCityId = city.id;
          if (has3D) {
            this.whooshToCity(city.id);
            this.onSelectCityFromCountry(city.id);
          } else {
            this.onSelectCityFromCountry(city.id);
            this.updateCountryPinSelection();
          }
        });

        root.appendChild(btn);

        const marker = new window.maplibregl.Marker({
          element: root,
          anchor: 'bottom'
        })
          .setLngLat(coords)
          .addTo(this.map);

        this.countryMarkers[city.id] = { marker, root, el: btn };
      });

      this.syncMarkerVisibility();
    }

    // Compatibility alias used by app.js when switching language
    renderLockedCountryMap() {
      this.buildCountryCityPins();
    }

    updateCountryPinSelection() {
      Object.keys(this.countryMarkers).forEach((cid) => {
        this.countryMarkers[cid].el.classList.toggle('is-selected', cid === this.activeCityId);
      });

      if (this.map && this.mapReady && this.stateFeatureIds) {
        if (this.selectedStateId !== undefined && this.selectedStateId !== null) {
          try {
            this.map.setFeatureState({ source: 'bundeslaender', id: this.selectedStateId }, { selected: false });
          } catch {}
        }
        const stateKey = CITY_TO_STATE[this.activeCityId];
        const nextFid = stateKey ? this.stateFeatureIds[stateKey] : null;
        this.selectedStateId = nextFid || null;
        if (nextFid) {
          try {
            this.map.setFeatureState({ source: 'bundeslaender', id: nextFid }, { selected: true });
          } catch {}
        }
      }
    }

    focusCountryCity(cityId) {
      if (!this.map) return;
      this.activeCityId = cityId;
      this.updateCountryPinSelection();

      const isNarrow = (this.container.clientWidth || 0) < 520;
      const coords = CITY_COORDS[cityId] || GERMANY_VIEW.center;
      const targetCenter = [
        GERMANY_VIEW.center[0] * 0.78 + coords[0] * 0.22,
        GERMANY_VIEW.center[1] * 0.78 + coords[1] * 0.22
      ];
      const targetZoom = isNarrow ? 4.48 : GERMANY_VIEW.zoom;

      if (this.mode !== 'country') {
        this.mode = 'country';
        this.setActiveLandmarkPin(null);
        this.onModeChange('country');
        this.map.setMaxBounds(null);
        this.map.setMinZoom(4.0);
        this.map.dragRotate.disable();
        this.map.touchPitch.disable();

        this.map.flyTo({
          center: targetCenter,
          zoom: targetZoom,
          pitch: 0,
          bearing: 0,
          padding: { top: 0, bottom: 0, left: 0, right: 0 },
          duration: 1000,
          curve: 1.28,
          essential: true
        });

        this.map.once('moveend', () => {
          if (this.mode === 'country') {
            this.map.setMaxBounds(GERMANY_BOUNDS);
          }
        });
      } else {
        this.map.easeTo({
          center: targetCenter,
          zoom: targetZoom,
          duration: 520,
          essential: true
        });
      }
    }

    syncMarkerVisibility() {
      if (!this.map) return;
      const z = this.map.getZoom();
      const showCityPins = z >= 10.2;
      const showCountryPins = z < 9.2;

      Object.values(this.landmarkMarkers).forEach(({ root }) => {
        root.style.display = showCityPins ? '' : 'none';
      });
      Object.values(this.countryMarkers).forEach(({ root }) => {
        root.style.display = showCountryPins ? '' : 'none';
      });
    }

    setActiveLandmarkPin(landmarkId) {
      this.activeLandmarkId = landmarkId;
      Object.keys(this.landmarkMarkers).forEach((id) => {
        this.landmarkMarkers[id].el.classList.toggle('is-active', id === landmarkId);
      });
    }

    resetOverlayPadding() {
      if (!this.map || this.mode !== 'city') return;
      this.map.easeTo({
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        duration: 450,
        essential: true
      });
    }

    toggleFireLayer() {
      if (!this.map || !this.mapReady) return this.fireLayerVisible;
      this.fireLayerVisible = !this.fireLayerVisible;
      const vis = this.fireLayerVisible ? 'visible' : 'none';
      const layers = [
        'great-fire-fill', 'great-fire-outline', 'great-fire-label',
        'stuttgart-zone-fill', 'stuttgart-zone-outline', 'stuttgart-zone-label'
      ];
      layers.forEach((layerId) => {
        if (this.map.getLayer(layerId)) {
          this.map.setLayoutProperty(layerId, 'visibility', vis);
        }
      });
      return this.fireLayerVisible;
    }

    /* ========================================================================
       CAMERA FLIGHT CONTROLS (Seamless 60fps WebGL flyTo + Tight Bounds)
       ======================================================================== */
    whooshToCity(cityId) {
      if (!this.map) return;
      const targetId = cityId && CITY_3D_PRESETS[cityId] ? cityId : (this.active3DCityId || 'stuttgart');
      const preset = this.getPreset(targetId);
      const changedCity = this.active3DCityId !== targetId;
      const wasCountry = this.mode === 'country';

      this.mode = 'city';
      this.activeCityId = targetId;
      this.active3DCityId = targetId;
      this.onModeChange('city', targetId);

      if (changedCity) {
        this.activeLandmarkId = null;
        this.buildLandmarkHTMLPins();
      }
      this.updateCountryPinSelection();

      const isNarrow = (this.container.clientWidth || 0) < 520;
      const targetZoom = isNarrow ? preset.mobileZoom : preset.view.zoom;

      this.map.dragRotate.enable();
      this.map.touchPitch.enable();
      this.map.setMaxBounds(null);
      this.map.setMinZoom(4.5);

      this.map.flyTo({
        center: preset.view.center,
        zoom: targetZoom,
        pitch: preset.view.pitch,
        bearing: preset.view.bearing,
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        duration: wasCountry || changedCity ? 1250 : 750,
        curve: 1.35,
        essential: true
      });

      this.map.once('moveend', () => {
        if (this.mode === 'city' && this.active3DCityId === targetId) {
          this.map.setMinZoom(12.0);
          this.map.setMaxBounds(preset.bounds);
        }
      });
    }

    whooshToCountry() {
      if (!this.map) return;
      this.mode = 'country';
      this.setActiveLandmarkPin(null);
      this.onModeChange('country');

      const isNarrow = (this.container.clientWidth || 0) < 520;
      this.map.setMaxBounds(null);
      this.map.setMinZoom(4.0);
      this.map.dragRotate.disable();
      this.map.touchPitch.disable();

      this.map.flyTo({
        center: GERMANY_VIEW.center,
        zoom: isNarrow ? 4.45 : GERMANY_VIEW.zoom,
        pitch: GERMANY_VIEW.pitch,
        bearing: GERMANY_VIEW.bearing,
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        duration: 1050,
        curve: 1.3,
        essential: true
      });

      this.map.once('moveend', () => {
        if (this.mode === 'country') {
          this.map.setMaxBounds(GERMANY_BOUNDS);
        }
      });
    }

    rotateAngleStep() {
      if (!this.map || this.mode !== 'city') return;
      const nextBearing = this.map.getBearing() + 45;
      this.map.easeTo({
        bearing: nextBearing,
        duration: 600,
        essential: true
      });
    }

    focusLandmark(landmarkId) {
      if (!this.map) return;
      const landmarks = this.getLandmarksData(this.active3DCityId);
      const lm = landmarks.find((l) => l.id === landmarkId);
      if (!lm || !Array.isArray(lm.lngLat)) return;

      const targetCityId = this.active3DCityId || 'stuttgart';
      const preset = this.getPreset(targetCityId);
      const wasCountry = this.mode === 'country';
      this.mode = 'city';
      this.setActiveLandmarkPin(landmarkId);
      this.onModeChange('city', targetCityId);

      this.map.dragRotate.enable();
      this.map.touchPitch.enable();
      this.map.setMaxBounds(null);
      this.map.setMinZoom(4.5);

      const isWide = (this.container.clientWidth || 0) >= 620;
      const targetZoom = lm.id === 'hm-7' ? 14.6 : (lm.zoom ? Math.min(lm.zoom, 16.0) : 15.8);
      const targetPitch = lm.pitch ? Math.min(lm.pitch, 58) : 54;
      const targetBearing = typeof lm.bearing === 'number' ? lm.bearing : -14;

      this.map.flyTo({
        center: lm.lngLat,
        zoom: targetZoom,
        pitch: targetPitch,
        bearing: targetBearing,
        padding: isWide
          ? { top: 20, bottom: 20, left: 20, right: 360 }
          : { top: 14, bottom: 210, left: 14, right: 14 },
        duration: wasCountry ? 1300 : 850,
        curve: 1.3,
        essential: true
      });

      this.map.once('moveend', () => {
        if (this.mode === 'city' && this.active3DCityId === targetCityId) {
          this.map.setMinZoom(12.0);
          this.map.setMaxBounds(preset.bounds);
        }
      });
    }
  }

  window.HamburgDioramaStage = HamburgMapStage;
  window.HAMBURG_SHORT_LANDMARK_NAMES = SHORT_LANDMARK_NAMES;
})();
