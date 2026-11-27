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

  const ROOT_PREFIX = (document.body && document.body.dataset && document.body.dataset.root) || '';
  const SITE_ROOT_URL = new URL(ROOT_PREFIX || './', window.location.href).href.replace(/\/?$/, '/');

  function hasLocalTile(z, x, y) {
    const manifest = window.LOCAL_MAP_MANIFEST;
    if (!manifest || !manifest.tiles) return false;
    const boxes = manifest.tiles[String(z)];
    if (!Array.isArray(boxes)) return false;
    let inBox = false;
    for (let i = 0; i < boxes.length; i += 1) {
      const b = boxes[i];
      if (x >= b[0] && x <= b[1] && y >= b[2] && y <= b[3]) {
        inBox = true;
        break;
      }
    }
    if (!inBox) return false;
    if (Array.isArray(manifest.missing) && manifest.missing.indexOf(`${z}/${x}/${y}`) !== -1) {
      return false;
    }
    return true;
  }

  let localProtocolRegistered = false;
  function ensureLocalProtocol() {
    if (localProtocolRegistered || !window.maplibregl || typeof window.maplibregl.addProtocol !== 'function') return;
    localProtocolRegistered = true;

    window.maplibregl.addProtocol('localmap', async (params, abortController) => {
      const url = params && params.url ? String(params.url) : '';
      const signal = abortController ? abortController.signal : undefined;

      const tileMatch = url.match(/^localmap:\/\/tiles\/(\d+)\/(\d+)\/(\d+)(?:\.pbf)?$/);
      if (tileMatch) {
        const z = Number(tileMatch[1]);
        const x = Number(tileMatch[2]);
        const y = Number(tileMatch[3]);
        if (!hasLocalTile(z, x, y)) {
          return { data: new ArrayBuffer(0) };
        }
        try {
          const res = await fetch(`${SITE_ROOT_URL}vendor/map-tiles/${z}/${x}/${y}.pbf`, { signal });
          if (!res.ok) return { data: new ArrayBuffer(0) };
          return { data: await res.arrayBuffer() };
        } catch (err) {
          if (err && err.name === 'AbortError') throw err;
          return { data: new ArrayBuffer(0) };
        }
      }

      const fontMatch = url.match(/^localmap:\/\/fonts\/([^/]+)\/(\d+-\d+)(?:\.pbf)?$/);
      if (fontMatch) {
        const rawStack = decodeURIComponent(fontMatch[1]).split(',')[0].trim();
        const range = fontMatch[2];
        const manifest = window.LOCAL_MAP_MANIFEST;
        const okStack = manifest && Array.isArray(manifest.fonts) && manifest.fonts.indexOf(rawStack) !== -1;
        const okRange = manifest && Array.isArray(manifest.fontRanges) && manifest.fontRanges.indexOf(range) !== -1;
        if (!okStack || !okRange) {
          return { data: new ArrayBuffer(0) };
        }
        try {
          const res = await fetch(`${SITE_ROOT_URL}vendor/map-fonts/${encodeURIComponent(rawStack)}/${range}.pbf`, { signal });
          if (!res.ok) return { data: new ArrayBuffer(0) };
          return { data: await res.arrayBuffer() };
        } catch (err) {
          if (err && err.name === 'AbortError') throw err;
          return { data: new ArrayBuffer(0) };
        }
      }

      return { data: new ArrayBuffer(0) };
    });
  }

  const GERMANY_VIEW = {
    center: [11.52, 50.90],
    zoom: 4.64,
    mobileZoom: 4.22,
    pitch: 0,
    bearing: 0
  };

  const HAMBURG_VIEW = {
    center: [9.9899, 53.5506],
    zoom: 13.5,
    pitch: 50,
    bearing: -14
  };

  const STUTTGART_VIEW = {
    center: [9.1735, 48.7767],
    zoom: 13.8,
    pitch: 50,
    bearing: -14
  };

  const BERLIN_VIEW = {
    center: [13.4033, 52.5183],
    zoom: 14.4,
    pitch: 50,
    bearing: -14
  };

  const GERMANY_BOUNDS = [
    [2.8, 45.2],
    [20.2, 56.2]
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

  // Tight invisible walls covering Berlin historic Mitte / Museum Island / Schinkel Axis
  const BERLIN_BOUNDS = [
    [13.368, 52.505],
    [13.432, 52.532]
  ];

  const CITY_3D_PRESETS = {
    stuttgart: {
      view: STUTTGART_VIEW,
      homeZoom: 13.5,
      mobileZoom: 13.15,
      bounds: STUTTGART_BOUNDS,
      accent: '#7A2E3A',
      zoneLayers: ['stuttgart-zone-fill', 'stuttgart-zone-outline', 'stuttgart-zone-label']
    },
    hamburg: {
      view: HAMBURG_VIEW,
      homeZoom: 13.2,
      mobileZoom: 12.95,
      bounds: HAMBURG_BOUNDS,
      accent: '#C23B1A',
      zoneLayers: ['great-fire-fill', 'great-fire-outline', 'great-fire-label']
    },
    berlin: {
      view: BERLIN_VIEW,
      homeZoom: 14.0,
      mobileZoom: 13.6,
      bounds: BERLIN_BOUNDS,
      accent: '#2C4A52',
      zoneLayers: ['berlin-zone-fill', 'berlin-zone-outline', 'berlin-zone-label']
    }
  };

  const CITY_COORDS = {
    stuttgart: [9.1829, 48.7758],
    hamburg: [9.9937, 53.5511],
    dresden: [13.7373, 51.0504],
    berlin: [13.405, 52.52],
    frankfurt: [8.6821, 50.1109],
    munich: [11.582, 48.1351],
    vienna: [16.3738, 48.2082]
  };

  const CITY_TO_STATE = {
    stuttgart: 'baden',
    hamburg: 'hamburg',
    dresden: 'sachsen',
    berlin: 'berlin',
    frankfurt: 'hessen',
    munich: 'bayern',
    vienna: 'austria'
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
      ru: 'Зал у Альстера',
      ua: 'Зал біля Альстера',
      de: 'Tagungsort · Alster',
      en: 'Alster Seminar Hall'
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
    },
    'bln-1': {
      ru: 'Lustgarten · Гранитная чаша',
      ua: 'Lustgarten · Гранітна чаша',
      de: 'Lustgarten · Granitschale',
      en: 'Lustgarten · Granite Bowl'
    },
    'bln-2': {
      ru: 'Alte Nationalgalerie',
      ua: 'Alte Nationalgalerie',
      de: 'Alte Nationalgalerie',
      en: 'Alte Nationalgalerie'
    },
    'bln-3': {
      ru: 'Friedrichswerdersche Kirche',
      ua: 'Friedrichswerdersche Kirche',
      de: 'Friedrichswerdersche Kirche',
      en: 'Friedrichswerder Church'
    },
    'bln-4': {
      ru: 'Opernplatz · Крюгер',
      ua: 'Opernplatz · Крюгер',
      de: 'Bebelplatz · Krüger',
      en: 'Opernplatz · Krüger'
    },
    'bln-5': {
      ru: 'Bauakademie · Schloßbrücke',
      ua: 'Bauakademie · Schloßbrücke',
      de: 'Bauakademie · Schloßbrücke',
      en: 'Bauakademie · Schloßbrücke'
    },
    'bln-6': {
      ru: 'Schloßplatz · Breite Straße',
      ua: 'Schloßplatz · Breite Straße',
      de: 'Schloßplatz · Breite Straße',
      en: 'Schloßplatz · Breite Straße'
    },
    'bln-7': {
      ru: 'Parochialstraße · Гертнер',
      ua: 'Parochialstraße · Гертнер',
      de: 'Parochialstraße · Gaertner',
      en: 'Parochialstraße · Gaertner'
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

  // Historical Berlin Schinkel Axis & Museum Island Overlay (1813–1888)
  const BERLIN_SCHINKEL_AXIS_GEOJSON = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { name: 'MUSEUMSINSEL · SCHINKEL-ACHSE' },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [13.3915, 52.5225],
            [13.4040, 52.5218],
            [13.4142, 52.5184],
            [13.4138, 52.5154],
            [13.3915, 52.5146],
            [13.3915, 52.5225]
          ]]
        }
      }
    ]
  };

  // Simplified Austrian silhouette bordering southern Germany for Vienna extension
  const AUSTRIA_OUTLINE_GEOJSON = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: 100,
        properties: { id: 'AT', name: 'Österreich' },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [9.53, 47.27],
            [9.56, 47.42],
            [9.72, 47.54],
            [10.18, 47.55],
            [10.45, 47.42],
            [11.15, 47.45],
            [12.18, 47.69],
            [12.90, 47.65],
            [13.02, 47.82],
            [12.82, 48.10],
            [13.45, 48.55],
            [13.84, 48.77],
            [14.32, 48.62],
            [14.95, 49.02],
            [15.65, 48.88],
            [16.38, 48.82],
            [16.94, 48.62],
            [17.02, 48.35],
            [17.16, 48.01],
            [16.94, 47.72],
            [16.62, 47.62],
            [16.58, 47.34],
            [16.46, 47.00],
            [16.05, 46.84],
            [15.42, 46.66],
            [14.68, 46.46],
            [13.71, 46.52],
            [13.00, 46.60],
            [12.35, 46.72],
            [12.15, 47.02],
            [11.48, 47.00],
            [11.02, 46.84],
            [10.47, 46.84],
            [10.16, 46.94],
            [9.78, 47.02],
            [9.53, 47.27]
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
      { name: 'BAYERN', coords: [11.55, 48.95] },
      { name: 'ÖSTERREICH', coords: [14.30, 47.62] }
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
      glyphs: 'localmap://fonts/{fontstack}/{range}',
      light: {
        anchor: 'viewport',
        color: '#FFF6E6',
        intensity: 0.44,
        position: [1.3, 195, 42]
      },
      sources: {
        openfreemap: {
          type: 'vector',
          tiles: ['localmap://tiles/{z}/{x}/{y}'],
          minzoom: 0,
          maxzoom: 14,
          attribution: 'Kartendaten: © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap-Mitwirkende</a> (ODbL)'
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
      this.onHoverCity = opts.onHoverCity || function () {};
      this.onReady = opts.onReady || function () {};
      this.getLandmarksData = opts.getLandmarksData || function () { return []; };
      this.getCitiesData = opts.getCitiesData || function () { return []; };
      this.getLang = opts.getLang || function () { return 'en'; };
      this.loc = opts.loc || function (obj, key) { return obj[key]; };

      this.lockedCityId = opts.lockedCityId || null;
      this.isHomePreview = Boolean(opts.isHomePreview);
      this.mode = this.lockedCityId ? 'city' : (opts.initialMode === 'country' ? 'country' : 'city');
      this.activeLandmarkId = null;
      this.activeCityId = this.lockedCityId || opts.initialCityId || 'stuttgart';
      this.active3DCityId = (this.lockedCityId && CITY_3D_PRESETS[this.lockedCityId])
        ? this.lockedCityId
        : (opts.initialCityId && CITY_3D_PRESETS[opts.initialCityId] ? opts.initialCityId : 'stuttgart');
      this.trackFilter = 'all'; // 'all' | 'writers' | 'artists'
      this.fireLayerVisible = true;
      this.hoveredStateId = null;
      this.hoveredAustria = false;
      this.hoveredCityId = null;
      this.landmarkMarkers = {};
      this.countryMarkers = {};
      this.mapReady = false;

      this.initMap();
    }

    prefersReducedMotion() {
      return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }

    animDuration(ms) {
      return this.prefersReducedMotion() ? 0 : ms;
    }

    getPreset(cityId) {
      return CITY_3D_PRESETS[cityId || this.active3DCityId] || CITY_3D_PRESETS.stuttgart;
    }

    getTargetCityZoom(preset) {
      const w = this.container ? (this.container.clientWidth || 640) : 640;
      if (w < 500) return preset.mobileZoom;
      if (this.isHomePreview || w < 600) return preset.homeZoom || preset.view.zoom;
      return preset.view.zoom;
    }

    getCountryView() {
      const w = Math.max(280, (this.container && this.container.clientWidth) || 540);
      const h = Math.max(300, (this.container && this.container.clientHeight) || 490);
      const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
      const yN = mercY(55.06);
      const yS = mercY(46.37);
      const degSpanX = 17.16 - 5.87;
      const degSpanY = ((yN - yS) * 180) / Math.PI;
      const padX = w < 480 ? 12 : 14;
      const padY = 10;
      const availW = Math.max(180, w - padX * 2);
      const availH = Math.max(180, h - padY * 2);
      const zoomX = Math.log2((availW / degSpanX) / (512 / 360));
      const zoomY = Math.log2((availH / degSpanY) / (512 / 360));
      const zoom = Math.max(3.95, Math.min(5.15, Math.min(zoomX, zoomY)));
      return {
        center: [11.52, 50.90],
        zoom,
        pitch: 0,
        bearing: 0
      };
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
      ensureLocalProtocol();
      this.container.innerHTML = '';

      const preset = this.getPreset(this.active3DCityId);
      const startCountry = this.mode === 'country';
      const countryView = this.getCountryView();

      this.map = new window.maplibregl.Map({
        container: this.container,
        style: buildArchivalStyle(),
        center: startCountry ? countryView.center : preset.view.center,
        zoom: startCountry ? countryView.zoom : this.getTargetCityZoom(preset),
        pitch: startCountry ? 0 : preset.view.pitch,
        bearing: startCountry ? 0 : preset.view.bearing,
        minZoom: startCountry ? 3.8 : 12.0,
        maxZoom: startCountry ? 6.5 : 17.8,
        maxPitch: 64,
        maxBounds: startCountry ? GERMANY_BOUNDS : preset.bounds,
        cooperativeGestures: true,
        antialias: true,
        attributionControl: false
      });

      if (startCountry) {
        this.map.dragRotate.disable();
        this.map.touchPitch.disable();
      }

      // Subtle minimal zoom buttons bottom-left
      this.map.addControl(
        new window.maplibregl.NavigationControl({ showCompass: false, visualizePitch: false }),
        'bottom-left'
      );

      // Visible OpenStreetMap ODbL attribution
      this.map.addControl(
        new window.maplibregl.AttributionControl({ compact: false }),
        'bottom-right'
      );

      this.map.on('load', () => {
        this.mapReady = true;
        this.addCustomLayers();
        this.buildLandmarkHTMLPins();
        if (!this.lockedCityId) {
          this.buildCountryCityPins();
          this.updateCountryPinSelection();
        }
        this.syncMarkerVisibility();
        this.onReady();
      });

      this.map.on('zoom', () => {
        this.syncMarkerVisibility();
      });
    }

    addCustomLayers() {
      const map = this.map;
      const locked = this.lockedCityId;
      const beforeBuildings = map.getLayer('buildings-3d') ? 'buildings-3d' : undefined;

      // 1–3. MACRO GERMANY / AUSTRIA LAYERS (Home Hub only — omitted on single-city pages)
      if (!locked) {
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
            const isBLN = normName === 'berlin' || normName.includes('berlin');
            const isSN = normName === 'sachsen' || normName.includes('saxony');
            const isHE = normName.includes('hessen') || normName.includes('hesse');
            const isBY = normName.includes('bayern') || normName.includes('bavaria');
            f.properties._isHamburg = isHH;
            f.properties._isBaden = isBW;
            f.properties._isBerlin = isBLN;
            f.properties._cityId = isBW ? 'stuttgart' : isHH ? 'hamburg' : isSN ? 'dresden' : isBLN ? 'berlin' : isHE ? 'frankfurt' : isBY ? 'munich' : '';
            f.properties._baseColor = isBW ? '#D9C2C6' : isHH ? '#C23B1A' : isBLN ? '#C5D1D4' : palette[idx % palette.length];
            if (isBW) this.stateFeatureIds.baden = f.id;
            else if (isHH) this.stateFeatureIds.hamburg = f.id;
            else if (isSN) this.stateFeatureIds.sachsen = f.id;
            else if (isBLN) this.stateFeatureIds.berlin = f.id;
            else if (isHE) this.stateFeatureIds.hessen = f.id;
            else if (isBY) this.stateFeatureIds.bayern = f.id;
          });

          map.addSource('bundeslaender', { type: 'geojson', data: geo });

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
              'fill-opacity': ['interpolate', ['linear'], ['zoom'], 7.2, 0.96, 9.5, 0]
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
              'line-opacity': ['interpolate', ['linear'], ['zoom'], 7.2, 0.78, 9.5, 0]
            }
          });

          // Instant GPU hover on Bundesländer + bidirectional board sync
          map.on('mousemove', 'bundeslaender-fill', (e) => {
            if (this.mode !== 'country') return;
            if (!e.features || !e.features.length) return;
            const feat = e.features[0];
            const fid = feat.id;
            if (this.hoveredStateId !== null && this.hoveredStateId !== fid) {
              map.setFeatureState({ source: 'bundeslaender', id: this.hoveredStateId }, { hover: false });
            }
            this.hoveredStateId = fid;
            map.setFeatureState({ source: 'bundeslaender', id: fid }, { hover: true });
            const cid = (feat.properties && feat.properties._cityId) || null;
            map.getCanvas().style.cursor = cid ? 'pointer' : '';
            if (cid !== this.hoveredCityId) {
              this.hoveredCityId = cid;
              this.onHoverCity(cid);
            }
          });

          map.on('mouseleave', 'bundeslaender-fill', () => {
            if (this.hoveredStateId !== null) {
              map.setFeatureState({ source: 'bundeslaender', id: this.hoveredStateId }, { hover: false });
              this.hoveredStateId = null;
            }
            if (this.hoveredCityId) {
              this.hoveredCityId = null;
              this.onHoverCity(null);
            }
            if (this.mode === 'country') {
              map.getCanvas().style.cursor = '';
            }
          });

          // Calm click: highlight/select city in overview atlas (never ambush user with sudden 3D zoom)
          map.on('click', 'bundeslaender-fill', (e) => {
            if (this.mode !== 'country' || !e.features || !e.features.length) return;
            const cid = e.features[0].properties && e.features[0].properties._cityId;
            if (cid) {
              this.onSelectCityFromCountry(cid, false);
            }
          });
        }

        // 1B. NEIGHBORING AUSTRIA SILHOUETTE (Vienna Extension on Southeast Flank)
        map.addSource('austria-neighbor', { type: 'geojson', data: AUSTRIA_OUTLINE_GEOJSON });

        map.addLayer({
          id: 'austria-neighbor-fill',
          type: 'fill',
          source: 'austria-neighbor',
          maxzoom: 9.8,
          paint: {
            'fill-color': [
              'case',
              ['boolean', ['feature-state', 'selected'], false], '#DEC7A4',
              ['boolean', ['feature-state', 'hover'], false], '#F6F1E4',
              '#E6DFCE'
            ],
            'fill-opacity': ['interpolate', ['linear'], ['zoom'], 7.2, 0.88, 9.5, 0]
          }
        });

        map.addLayer({
          id: 'austria-neighbor-border',
          type: 'line',
          source: 'austria-neighbor',
          maxzoom: 9.8,
          paint: {
            'line-color': '#141311',
            'line-width': [
              'case',
              ['boolean', ['feature-state', 'selected'], false], 1.8,
              ['boolean', ['feature-state', 'hover'], false], 1.5,
              1.0
            ],
            'line-dasharray': [4, 3],
            'line-opacity': ['interpolate', ['linear'], ['zoom'], 7.2, 0.65, 9.5, 0]
          }
        });

        map.on('mousemove', 'austria-neighbor-fill', () => {
          if (this.mode !== 'country') return;
          this.hoveredAustria = true;
          try { map.setFeatureState({ source: 'austria-neighbor', id: 100 }, { hover: true }); } catch {}
          map.getCanvas().style.cursor = 'pointer';
          if (this.hoveredCityId !== 'vienna') {
            this.hoveredCityId = 'vienna';
            this.onHoverCity('vienna');
          }
        });

        map.on('mouseleave', 'austria-neighbor-fill', () => {
          if (this.hoveredAustria) {
            this.hoveredAustria = false;
            try { map.setFeatureState({ source: 'austria-neighbor', id: 100 }, { hover: false }); } catch {}
          }
          if (this.hoveredCityId === 'vienna') {
            this.hoveredCityId = null;
            this.onHoverCity(null);
          }
          if (this.mode === 'country') {
            map.getCanvas().style.cursor = '';
          }
        });

        map.on('click', 'austria-neighbor-fill', () => {
          if (this.mode !== 'country') return;
          this.onSelectCityFromCountry('vienna', false);
        });

        // 2. BUNDESLÄNDER LABELS
        map.addSource('bundeslaender-labels', { type: 'geojson', data: BUNDESLAENDER_LABELS_GEOJSON });
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

        // 3. SEPARATE CONCEPTUAL TRACK ROUTES
        const citiesList = this.getCitiesData();
        const artistCoords = citiesList.filter((c) => c.trackId === 'artists' && CITY_COORDS[c.id]).map((c) => CITY_COORDS[c.id]);
        const writerCoords = citiesList.filter((c) => c.trackId === 'writers' && CITY_COORDS[c.id]).map((c) => CITY_COORDS[c.id]);

        map.addSource('country-route-artists', {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'LineString', coordinates: artistCoords } }
        });
        map.addLayer({
          id: 'country-route-artists-line',
          type: 'line',
          source: 'country-route-artists',
          maxzoom: 9.0,
          paint: {
            'line-color': '#C23B1A',
            'line-width': 2.2,
            'line-dasharray': [4, 4],
            'line-opacity': ['interpolate', ['linear'], ['zoom'], 7.0, 0.78, 8.8, 0]
          }
        });

        map.addSource('country-route-writers', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              ...(writerCoords.length >= 2 ? [{ type: 'Feature', geometry: { type: 'LineString', coordinates: writerCoords } }] : []),
              ...writerCoords.map((pt) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: pt } }))
            ]
          }
        });
        map.addLayer({
          id: 'country-route-writers-line',
          type: 'line',
          source: 'country-route-writers',
          maxzoom: 9.0,
          filter: ['==', '$type', 'LineString'],
          paint: {
            'line-color': '#7A2E3A',
            'line-width': 2.4,
            'line-dasharray': [3, 3],
            'line-opacity': ['interpolate', ['linear'], ['zoom'], 7.0, 0.85, 8.8, 0]
          }
        });
        map.addLayer({
          id: 'country-route-writers-halo',
          type: 'circle',
          source: 'country-route-writers',
          maxzoom: 9.0,
          filter: ['==', '$type', 'Point'],
          paint: {
            'circle-radius': 18,
            'circle-color': '#7A2E3A',
            'circle-opacity': ['interpolate', ['linear'], ['zoom'], 7.0, 0.22, 8.8, 0],
            'circle-stroke-color': '#7A2E3A',
            'circle-stroke-width': 1.5,
            'circle-stroke-opacity': ['interpolate', ['linear'], ['zoom'], 7.0, 0.7, 8.8, 0]
          }
        });
      }

      // 4. HISTORICAL ZONES (scoped cleanly when lockedCityId is set)
      const wantHamburg = !locked || locked === 'hamburg';
      const wantStuttgart = !locked || locked === 'stuttgart';
      const wantBerlin = !locked || locked === 'berlin';

      if (wantHamburg) {
        map.addSource('great-fire-1842', { type: 'geojson', data: GREAT_FIRE_1842_GEOJSON });
        map.addLayer({
          id: 'great-fire-fill',
          type: 'fill',
          source: 'great-fire-1842',
          minzoom: 11.2,
          paint: { 'fill-color': '#C23B1A', 'fill-opacity': ['interpolate', ['linear'], ['zoom'], 11.2, 0, 12.6, 0.16] }
        }, beforeBuildings);
        map.addLayer({
          id: 'great-fire-outline',
          type: 'line',
          source: 'great-fire-1842',
          minzoom: 11.2,
          paint: { 'line-color': '#C23B1A', 'line-width': 2, 'line-dasharray': [4, 2.5], 'line-opacity': ['interpolate', ['linear'], ['zoom'], 11.2, 0, 12.6, 0.78] }
        }, beforeBuildings);
        map.addLayer({
          id: 'great-fire-label',
          type: 'symbol',
          source: 'great-fire-1842',
          minzoom: 13.0,
          maxzoom: 15.8,
          layout: { 'text-field': 'BRANDGEBIET · MAI 1842', 'text-font': ['Noto Sans Bold'], 'text-size': 9.5, 'text-letter-spacing': 0.18 },
          paint: { 'text-color': '#9E2A0E', 'text-halo-color': 'rgba(243, 239, 230, 0.92)', 'text-halo-width': 1.6 }
        });
      }

      if (wantStuttgart) {
        map.addSource('stuttgart-residenz', { type: 'geojson', data: STUTTGART_RESIDENZ_GEOJSON });
        map.addLayer({
          id: 'stuttgart-zone-fill',
          type: 'fill',
          source: 'stuttgart-residenz',
          minzoom: 11.2,
          paint: { 'fill-color': '#7A2E3A', 'fill-opacity': ['interpolate', ['linear'], ['zoom'], 11.2, 0, 12.6, 0.14] }
        }, beforeBuildings);
        map.addLayer({
          id: 'stuttgart-zone-outline',
          type: 'line',
          source: 'stuttgart-residenz',
          minzoom: 11.2,
          paint: { 'line-color': '#7A2E3A', 'line-width': 2, 'line-dasharray': [4, 2.5], 'line-opacity': ['interpolate', ['linear'], ['zoom'], 11.2, 0, 12.6, 0.76] }
        }, beforeBuildings);
        map.addLayer({
          id: 'stuttgart-zone-label',
          type: 'symbol',
          source: 'stuttgart-residenz',
          minzoom: 13.0,
          maxzoom: 15.8,
          layout: { 'text-field': 'RESIDENZSTADT · 1738–1848', 'text-font': ['Noto Sans Bold'], 'text-size': 9.5, 'text-letter-spacing': 0.16 },
          paint: { 'text-color': '#6E222E', 'text-halo-color': 'rgba(243, 239, 230, 0.92)', 'text-halo-width': 1.6 }
        });
      }

      if (wantBerlin) {
        map.addSource('berlin-schinkel-axis', { type: 'geojson', data: BERLIN_SCHINKEL_AXIS_GEOJSON });
        map.addLayer({
          id: 'berlin-zone-fill',
          type: 'fill',
          source: 'berlin-schinkel-axis',
          minzoom: 11.2,
          paint: { 'fill-color': '#2C4A52', 'fill-opacity': ['interpolate', ['linear'], ['zoom'], 11.2, 0, 12.6, 0.14] }
        }, beforeBuildings);
        map.addLayer({
          id: 'berlin-zone-outline',
          type: 'line',
          source: 'berlin-schinkel-axis',
          minzoom: 11.2,
          paint: { 'line-color': '#2C4A52', 'line-width': 2, 'line-dasharray': [4, 2.5], 'line-opacity': ['interpolate', ['linear'], ['zoom'], 11.2, 0, 12.6, 0.78] }
        }, beforeBuildings);
        map.addLayer({
          id: 'berlin-zone-label',
          type: 'symbol',
          source: 'berlin-schinkel-axis',
          minzoom: 13.0,
          maxzoom: 15.8,
          layout: { 'text-field': 'MUSEUMSINSEL · SCHINKEL-ACHSE', 'text-font': ['Noto Sans Bold'], 'text-size': 9.5, 'text-letter-spacing': 0.16 },
          paint: { 'text-color': '#213B42', 'text-halo-color': 'rgba(243, 239, 230, 0.92)', 'text-halo-width': 1.6 }
        });
      }

      // 5. EXPEDITION WALKING ROUTES (scoped cleanly to active/requested cities)
      const allCities = this.getCitiesData();
      const getLm = (cid) => {
        const c = allCities.find((x) => x.id === cid);
        return (c && c.cityMap && c.cityMap.landmarks) || [];
      };
      const hhLandmarks = wantHamburg ? getLm('hamburg') : [];
      const stLandmarks = wantStuttgart ? getLm('stuttgart') : [];
      const blnLandmarks = wantBerlin ? getLm('berlin') : [];

      if (wantHamburg) {
        const hhCoreCoords = hhLandmarks.filter((l) => l.id !== 'hm-7' && Array.isArray(l.lngLat)).map((l) => l.lngLat);
        const lm6 = hhLandmarks.find((l) => l.id === 'hm-6');
        const lm7 = hhLandmarks.find((l) => l.id === 'hm-7');
        map.addSource('hamburg-route', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              { type: 'Feature', properties: { kind: 'core' }, geometry: { type: 'LineString', coordinates: hhCoreCoords } },
              ...(lm6 && lm7
                ? [{ type: 'Feature', properties: { kind: 'ohlsdorf' }, geometry: { type: 'LineString', coordinates: [lm6.lngLat, [10.0014, 53.5562], [10.015, 53.582], lm7.lngLat] } }]
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
          paint: { 'line-color': '#C23B1A', 'line-width': 2.4, 'line-dasharray': [3, 3], 'line-opacity': ['interpolate', ['linear'], ['zoom'], 11.2, 0, 12.6, 0.78] }
        }, beforeBuildings);
        map.addLayer({
          id: 'hamburg-route-ohlsdorf',
          type: 'line',
          source: 'hamburg-route',
          minzoom: 11.2,
          filter: ['==', 'kind', 'ohlsdorf'],
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#C23B1A', 'line-width': 1.6, 'line-dasharray': [1.5, 3.5], 'line-opacity': ['interpolate', ['linear'], ['zoom'], 11.2, 0, 12.6, 0.52] }
        }, beforeBuildings);
      }

      if (wantStuttgart) {
        const stCoreCoords = stLandmarks.filter((l) => Array.isArray(l.lngLat)).map((l) => l.lngLat);
        map.addSource('stuttgart-route', {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'LineString', coordinates: stCoreCoords } }
        });
        map.addLayer({
          id: 'stuttgart-route-core',
          type: 'line',
          source: 'stuttgart-route',
          minzoom: 11.2,
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#7A2E3A', 'line-width': 2.4, 'line-dasharray': [3, 3], 'line-opacity': ['interpolate', ['linear'], ['zoom'], 11.2, 0, 12.6, 0.78] }
        }, beforeBuildings);
      }

      if (wantBerlin) {
        const blnCoreCoords = blnLandmarks.filter((l) => Array.isArray(l.lngLat)).map((l) => l.lngLat);
        map.addSource('berlin-route', {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'LineString', coordinates: blnCoreCoords } }
        });
        map.addLayer({
          id: 'berlin-route-core',
          type: 'line',
          source: 'berlin-route',
          minzoom: 11.2,
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#2C4A52', 'line-width': 2.4, 'line-dasharray': [3, 3], 'line-opacity': ['interpolate', ['linear'], ['zoom'], 11.2, 0, 12.6, 0.78] }
        }, beforeBuildings);
      }

      // 6. GROUND HALO ANCHORS UNDER LANDMARKS
      const allGeoLandmarks = [
        ...stLandmarks.filter((l) => Array.isArray(l.lngLat)).map((l) => ({ ...l, _accent: '#7A2E3A' })),
        ...hhLandmarks.filter((l) => Array.isArray(l.lngLat)).map((l) => ({ ...l, _accent: '#C23B1A' })),
        ...blnLandmarks.filter((l) => Array.isArray(l.lngLat)).map((l) => ({ ...l, _accent: '#2C4A52' }))
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
      if (!this.map || this.lockedCityId) return;

      const cities = this.getCitiesData();
      cities.forEach((city) => {
        const coords = CITY_COORDS[city.id];
        if (!coords) return;

        const has3D = Boolean(CITY_3D_PRESETS[city.id]);
        const isWriter = city.trackId === 'writers';
        const trackSym = isWriter ? '◆' : '●';
        const root = document.createElement('div');
        root.className = 'map-marker-root';
        root.dataset.trackId = city.trackId || 'artists';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `country-city-pin ${isWriter ? 'is-track-writers' : 'is-track-artists'} ${has3D ? 'is-hamburg-hero' : ''} ${city.id === this.activeCityId ? 'is-selected' : ''}`;
        btn.innerHTML = `
          <span class="map3d-pin__num">${trackSym} №${city.issueNo}</span>
          <span>${this.loc(city, 'name')}</span>
          ${has3D ? '<span class="country-pin-cta">3D →</span>' : ''}
        `;

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const want3D = Boolean(has3D && e.target && e.target.closest && e.target.closest('.country-pin-cta'));
          this.activeCityId = city.id;
          this.onSelectCityFromCountry(city.id, want3D);
        });

        btn.addEventListener('mouseenter', () => {
          this.setHoveredCity(city.id);
          this.onHoverCity(city.id);
        });
        btn.addEventListener('mouseleave', () => {
          this.setHoveredCity(null);
          this.onHoverCity(null);
        });

        root.appendChild(btn);

        const markerOpts =
          city.id === 'vienna'
            ? { element: root, anchor: 'bottom-right', offset: [18, 0] }
            : { element: root, anchor: 'bottom' };
        const marker = new window.maplibregl.Marker(markerOpts)
          .setLngLat(coords)
          .addTo(this.map);

        this.countryMarkers[city.id] = { marker, root, el: btn, trackId: city.trackId || 'artists' };
      });

      this.syncMarkerVisibility();
      this.applyTrackFilterToMap();
    }

    setHoveredCity(cityId) {
      this.hoveredCityId = cityId || null;
      Object.keys(this.countryMarkers).forEach((cid) => {
        this.countryMarkers[cid].el.classList.toggle('is-hovered', cid === this.hoveredCityId);
      });
      if (!this.map || !this.mapReady || !this.stateFeatureIds) return;
      if (this.hoveredStateId !== null) {
        try {
          this.map.setFeatureState({ source: 'bundeslaender', id: this.hoveredStateId }, { hover: false });
        } catch {}
        this.hoveredStateId = null;
      }
      if (this.hoveredAustria) {
        this.hoveredAustria = false;
        try {
          this.map.setFeatureState({ source: 'austria-neighbor', id: 100 }, { hover: false });
        } catch {}
      }
      if (!cityId) return;
      const stateKey = CITY_TO_STATE[cityId];
      if (stateKey === 'austria') {
        this.hoveredAustria = true;
        try {
          this.map.setFeatureState({ source: 'austria-neighbor', id: 100 }, { hover: true });
        } catch {}
      } else if (stateKey && this.stateFeatureIds[stateKey]) {
        this.hoveredStateId = this.stateFeatureIds[stateKey];
        try {
          this.map.setFeatureState({ source: 'bundeslaender', id: this.hoveredStateId }, { hover: true });
        } catch {}
      }
    }

    setTrackFilter(trackId) {
      this.trackFilter = trackId || 'all';
      this.applyTrackFilterToMap();
      if (this.map && this.mapReady && this.mode === 'country' && !this.lockedCityId) {
        const countryView = this.getCountryView();
        const dur = this.animDuration(560);
        if (this.trackFilter === 'writers') {
          this.map.easeTo({
            center: [10.1, 49.4],
            zoom: Math.min(5.35, countryView.zoom + 0.32),
            duration: dur,
            essential: true
          });
        } else {
          this.map.easeTo({
            center: countryView.center,
            zoom: countryView.zoom,
            duration: dur,
            essential: true
          });
        }
      }
    }

    applyTrackFilterToMap() {
      const f = this.trackFilter || 'all';
      Object.values(this.countryMarkers).forEach(({ el, trackId }) => {
        const dimmed = f !== 'all' && trackId !== f;
        el.classList.toggle('is-dimmed', dimmed);
      });
      if (this.map && this.mapReady) {
        const showArtists = f === 'all' || f === 'artists';
        const showWriters = f === 'all' || f === 'writers';
        if (this.map.getLayer('country-route-artists-line')) {
          this.map.setLayoutProperty('country-route-artists-line', 'visibility', showArtists ? 'visible' : 'none');
        }
        ['country-route-writers-line', 'country-route-writers-halo'].forEach((lid) => {
          if (this.map.getLayer(lid)) {
            this.map.setLayoutProperty(lid, 'visibility', showWriters ? 'visible' : 'none');
          }
        });
      }
    }

    // Compatibility alias used by app.js when switching language
    renderLockedCountryMap() {
      this.buildCountryCityPins();
    }

    updateCountryPinSelection() {
      Object.keys(this.countryMarkers).forEach((cid) => {
        this.countryMarkers[cid].el.classList.toggle('is-selected', cid === this.activeCityId);
      });

      if (this.map && this.mapReady && this.stateFeatureIds && !this.lockedCityId) {
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
        try {
          this.map.setFeatureState({ source: 'austria-neighbor', id: 100 }, { selected: this.activeCityId === 'vienna' });
        } catch {}
      }
    }

    focusCountryCity(cityId) {
      if (!this.map || this.lockedCityId) return;
      this.activeCityId = cityId;
      this.updateCountryPinSelection();

      const countryView = this.getCountryView();
      const coords = CITY_COORDS[cityId] || countryView.center;
      const targetCenter = [
        countryView.center[0] * 0.85 + coords[0] * 0.15,
        countryView.center[1] * 0.85 + coords[1] * 0.15
      ];
      const targetZoom = countryView.zoom;

      if (this.mode !== 'country') {
        this.mode = 'country';
        this.setActiveLandmarkPin(null);
        this.onModeChange('country');
        this.map.setMaxBounds(null);
        this.map.setMinZoom(3.8);
        this.map.setMaxZoom(6.5);
        this.map.dragRotate.disable();
        this.map.touchPitch.disable();

        this.map.flyTo({
          center: targetCenter,
          zoom: targetZoom,
          pitch: 0,
          bearing: 0,
          padding: { top: 0, bottom: 0, left: 0, right: 0 },
          duration: this.animDuration(900),
          curve: 1.28,
          essential: true
        });

        this.map.once('moveend', () => {
          if (this.mode === 'country') {
            this.map.setMaxBounds(GERMANY_BOUNDS);
          }
        });
      } else {
        this.map.setMaxZoom(6.5);
        this.map.easeTo({
          center: targetCenter,
          zoom: targetZoom,
          duration: this.animDuration(480),
          essential: true
        });
      }
    }

    syncMarkerVisibility() {
      if (!this.map) return;
      const z = this.map.getZoom();
      const showCityPins = this.lockedCityId ? true : z >= 10.2;
      const showCountryPins = !this.lockedCityId && z < 9.2;

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
        duration: this.animDuration(350),
        essential: true
      });
    }

    toggleFireLayer() {
      if (!this.map || !this.mapReady) return this.fireLayerVisible;
      this.fireLayerVisible = !this.fireLayerVisible;
      const vis = this.fireLayerVisible ? 'visible' : 'none';
      const layers = [
        'great-fire-fill', 'great-fire-outline', 'great-fire-label',
        'stuttgart-zone-fill', 'stuttgart-zone-outline', 'stuttgart-zone-label',
        'berlin-zone-fill', 'berlin-zone-outline', 'berlin-zone-label'
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
      const targetId = this.lockedCityId || (cityId && CITY_3D_PRESETS[cityId] ? cityId : (this.active3DCityId || 'stuttgart'));
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

      const targetZoom = this.getTargetCityZoom(preset);

      this.map.dragRotate.enable();
      this.map.touchPitch.enable();
      this.map.setMaxBounds(null);
      this.map.setMinZoom(this.lockedCityId ? 12.0 : 4.5);
      this.map.setMaxZoom(17.8);

      this.map.flyTo({
        center: preset.view.center,
        zoom: targetZoom,
        pitch: preset.view.pitch,
        bearing: preset.view.bearing,
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        duration: this.animDuration(wasCountry || changedCity ? 1150 : 700),
        curve: 1.32,
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
      if (!this.map || this.lockedCityId) return;
      this.mode = 'country';
      this.setActiveLandmarkPin(null);
      this.onModeChange('country');

      const countryView = this.getCountryView();
      this.map.setMaxBounds(null);
      this.map.setMinZoom(3.8);
      this.map.setMaxZoom(6.5);
      this.map.dragRotate.disable();
      this.map.touchPitch.disable();

      this.map.flyTo({
        center: countryView.center,
        zoom: countryView.zoom,
        pitch: countryView.pitch,
        bearing: countryView.bearing,
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        duration: this.animDuration(950),
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
        duration: this.animDuration(560),
        essential: true
      });
    }

    focusLandmark(landmarkId) {
      if (!this.map) return;
      const landmarks = this.getLandmarksData(this.active3DCityId);
      const lm = landmarks.find((l) => l.id === landmarkId);
      if (!lm || !Array.isArray(lm.lngLat)) return;

      const targetCityId = this.active3DCityId || 'stuttgart';
      const preset = this.getPreset(targetIdOr(targetCityId));
      function targetIdOr(v) { return v; }
      const wasCountry = this.mode === 'country';
      this.mode = 'city';
      this.setActiveLandmarkPin(landmarkId);
      this.onModeChange('city', targetCityId);

      this.map.dragRotate.enable();
      this.map.touchPitch.enable();
      this.map.setMaxBounds(null);
      this.map.setMinZoom(this.lockedCityId ? 12.0 : 4.5);
      this.map.setMaxZoom(17.8);

      const targetZoom = lm.id === 'hm-7' ? 14.5 : (lm.zoom ? Math.min(lm.zoom, 15.8) : 15.5);
      const targetPitch = lm.pitch ? Math.min(lm.pitch, 56) : 52;
      const targetBearing = typeof lm.bearing === 'number' ? lm.bearing : -14;

      this.map.flyTo({
        center: lm.lngLat,
        zoom: targetZoom,
        pitch: targetPitch,
        bearing: targetBearing,
        padding: { top: 24, bottom: 24, left: 24, right: 24 },
        duration: this.animDuration(wasCountry ? 1150 : 780),
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
