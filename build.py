#!/usr/bin/env python3
"""
Static Multi-Page Editorial & SEO Generator (v3)
------------------------------------------------
Single source of truth: content.json
Outputs:
  - data.js (synced mirror for client-side interactive scripts)
  - index.html (EN default home) + {en,de,ru,uk}/index.html (4 localized homes)
  - {en,de,ru,uk}/{city}/index.html (24 dedicated SEO city pages)
  - sitemap.xml, robots.txt, llms.txt

Zero external dependencies — Python 3 stdlib only.
Run: python build.py   (or double-click rebuild.bat on Windows)
"""

from __future__ import annotations

import copy
import html
import json
from datetime import date
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent
CONTENT_PATH = ROOT / "content.json"

# (internal data.js/content.json key, URL folder & ISO hreflang code, switcher label)
LANGS = [
    ("en", "en", "EN"),
    ("de", "de", "DE"),
    ("ru", "ru", "RU"),
    ("ua", "uk", "UA"),
]


def esc(val: Any) -> str:
    return html.escape(str(val or ""), quote=True)


def loc(obj: dict[str, Any] | None, base_key: str, lang: str) -> Any:
    if not obj:
        return ""
    suffix = {"ru": "Ru", "ua": "Ua", "de": "De", "en": "En"}.get(lang, "En")
    for k in (base_key + suffix, base_key + "En", base_key + "Ru", base_key):
        if k in obj and obj[k] is not None:
            return obj[k]
    return ""


def get_track(data: dict[str, Any], track_id: str) -> dict[str, Any]:
    for t in data.get("tracks", []):
        if t["id"] == track_id:
            return t
    return data["tracks"][0]


def analytics_snippet(cfg: dict[str, Any]) -> str:
    an = cfg.get("analytics") or {}
    parts = []
    if an.get("umamiWebsiteId"):
        src = esc(an.get("umamiSrc") or "https://cloud.umami.is/script.js")
        wid = esc(an["umamiWebsiteId"])
        parts.append(f'  <script defer src="{src}" data-website-id="{wid}"></script>')
    if an.get("cloudflareToken"):
        tok = esc(an["cloudflareToken"])
        parts.append(
            f'  <script defer src="https://static.cloudflareinsights.com/beacon.min.js" '
            f'data-cf-beacon=\'{{"token": "{tok}"}}\'></script>'
        )
    return "\n".join(parts)


def hreflang_links(base_url: str, page_subpath: str) -> str:
    """page_subpath is '' for home, or 'stuttgart/' for a city page."""
    base = base_url.rstrip("/")
    lines = []
    for _, url_lang, _ in LANGS:
        href = f"{base}/{url_lang}/{page_subpath}"
        lines.append(f'  <link rel="alternate" hreflang="{url_lang}" href="{esc(href)}" />')
    default_href = f"{base}/" if not page_subpath else f"{base}/en/{page_subpath}"
    lines.append(f'  <link rel="alternate" hreflang="x-default" href="{esc(default_href)}" />')
    return "\n".join(lines)


def render_head(
    *,
    data: dict[str, Any],
    lang: str,
    url_lang: str,
    root_prefix: str,
    title: str,
    description: str,
    canonical_url: str,
    page_subpath: str,
    og_image: str,
    json_ld_objects: list[dict[str, Any]],
    include_maplibre: bool = True,
    noindex: bool = False,
) -> str:
    cfg = data["siteConfig"]
    ver = esc(cfg.get("assetVersion", "9"))
    base_url = cfg.get("baseUrl", "https://dagrosimo.github.io").rstrip("/")
    abs_og_img = f"{base_url}/{og_image.lstrip('/')}" if og_image else ""
    ld_scripts = "\n".join(
        f'  <script type="application/ld+json">\n{json.dumps(obj, ensure_ascii=False, indent=2)}\n  </script>'
        for obj in json_ld_objects
    )
    map_css = f'  <link rel="stylesheet" href="{root_prefix}vendor/maplibre-gl.css" />\n' if include_maplibre else ""
    an_code = analytics_snippet(cfg)
    an_block = f"\n{an_code}" if an_code else ""
    robots_meta = '  <meta name="robots" content="noindex, follow" />\n' if noindex else ""
    alt_links = "" if noindex else f"{hreflang_links(base_url, page_subpath)}\n"

    return f"""<!DOCTYPE html>
<html lang="{esc(url_lang)}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(description)}" />
{robots_meta}  <link rel="canonical" href="{esc(canonical_url)}" />
{alt_links}  <meta property="og:type" content="website" />
  <meta property="og:title" content="{esc(title)}" />
  <meta property="og:description" content="{esc(description)}" />
  <meta property="og:url" content="{esc(canonical_url)}" />
  {f'<meta property="og:image" content="{esc(abs_og_img)}" />' if abs_og_img else ''}
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='%23141311'/><text x='16' y='21' font-family='Georgia,serif' font-size='14' font-weight='bold' fill='%23F3EFE6' text-anchor='middle'>SG</text></svg>" />
  <link rel="stylesheet" href="{root_prefix}vendor/fonts/fonts.css?v={ver}" />
{map_css}  <link rel="stylesheet" href="{root_prefix}styles.css?v={ver}" />
{ld_scripts}{an_block}
</head>"""


def render_lang_switch(root_prefix: str, active_url_lang: str, page_subpath: str) -> str:
    links = []
    for _, u_lang, label in LANGS:
        href = f"{root_prefix}{u_lang}/{page_subpath}"
        active_cls = " is-active" if u_lang == active_url_lang else ""
        links.append(
            f'<a class="lang-btn{active_cls}" href="{esc(href)}" hreflang="{esc(u_lang)}">{esc(label)}</a>'
        )
    return f'<div class="lang-switch" role="group" aria-label="Language">{"".join(links)}</div>'


def render_ticket_section(
    data: dict[str, Any],
    lang: str,
    url_lang: str,
    root_prefix: str = "",
    locked_city_id: str | None = None,
) -> str:
    tr = data["i18n"][lang]["tariffs"]
    cities = data["cities"]
    default_city = next((c for c in cities if c["id"] == locked_city_id), cities[0])

    seat_labels = {
        "ru": ["1 место", "2 места", "3–4 места"],
        "ua": ["1 місце", "2 місця", "3–4 місця"],
        "de": ["1 Platz", "2 Plätze", "3–4 Plätze"],
        "en": ["1 seat", "2 seats", "3–4 seats"],
    }[lang]

    cards_html = ""
    if not locked_city_id:
        cards_items = "".join(
            f"""
          <article class="tariff-card {'tariff-card--primary' if idx == 0 else ''}">
            <span class="mono-label">{esc(card['tag'])}</span>
            <h3>{esc(card['name'])}</h3>
            <div class="tariff-price">
              <strong>{esc(card['priceMain'])}</strong>
              <span>{esc(card['priceNote'])}</span>
            </div>
            <ul class="tariff-list">
              {''.join(f'<li>{esc(feat)}</li>' for feat in card['features'])}
            </ul>
            <button type="button" class="btn {'btn--primary' if idx == 0 else 'btn--outline'}" data-pick-card="{esc(card['id'])}">
              {esc(card['cta'])}
            </button>
          </article>"""
            for idx, card in enumerate(tr["cards"])
        )
        cards_html = f"""
        <div class="tariffs-grid" id="tariffs-grid">{cards_items}</div>
        <p class="included-note" id="included-note">{esc(tr['includedNote'])}</p>"""

    city_options = "".join(
        f'<option value="{esc(c["id"])}"{" selected" if c["id"] == default_city["id"] else ""}>'
        f'{esc(loc(c, "name", lang))} · {esc(loc(c, "dates", lang))}</option>'
        for c in cities
    )
    default_lang_val = {"en": "EN", "de": "DE", "ru": "RU", "ua": "UA"}[lang]

    return f"""
    <section class="ticket-section" id="ticket-section">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow" id="tariffs-eyebrow">{esc(tr['eyebrow'])}</p>
          <h2 class="section-title" id="tariffs-title">{esc(tr['title'])}</h2>
        </div>
{cards_html}
        <div class="fahrkarte-wrap">
          <div class="fahrkarte-head">
            <div>
              <h3 id="ticket-title">{esc(tr['ticketTitle'])}</h3>
            </div>
            <span class="mono-label stamp-pill" id="tp-reserve-badge">{esc(tr['badgeText'])}</span>
          </div>

          <div class="fahrkarte-grid">
            <form class="ticket-form" id="fahrkarte-form" novalidate>
              <div class="form-row">
                <label for="f-city" id="lbl-city">{esc(tr['form']['cityLabel'])}</label>
                <select id="f-city" name="city">{city_options}</select>
              </div>
              <div class="form-row form-row--two">
                <div>
                  <label for="f-seats" id="lbl-seats">{esc(tr['form']['seatsLabel'])}</label>
                  <select id="f-seats" name="seats">
                    <option value="1">{esc(seat_labels[0])}</option>
                    <option value="2">{esc(seat_labels[1])}</option>
                    <option value="3-4">{esc(seat_labels[2])}</option>
                  </select>
                </div>
                <div>
                  <label for="f-lang" id="lbl-lang">{esc(tr['form']['langLabel'])}</label>
                  <select id="f-lang" name="lang">
                    <option value="EN"{' selected' if default_lang_val == 'EN' else ''}>English</option>
                    <option value="DE"{' selected' if default_lang_val == 'DE' else ''}>Deutsch</option>
                    <option value="RU"{' selected' if default_lang_val == 'RU' else ''}>Русский</option>
                    <option value="UA"{' selected' if default_lang_val == 'UA' else ''}>Українська</option>
                  </select>
                </div>
              </div>
              <div class="form-row form-row--two">
                <div>
                  <label for="f-name" id="lbl-name">{esc(tr['form']['nameLabel'])}</label>
                  <input type="text" id="f-name" name="name" placeholder="{esc(tr['form']['namePlaceholder'])}" autocomplete="name" />
                </div>
                <div>
                  <label for="f-contact" id="lbl-contact">{esc(tr['form']['contactLabel'])}</label>
                  <input type="text" id="f-contact" name="contact" placeholder="{esc(tr['form']['contactPlaceholder'])}" />
                </div>
              </div>
              <div class="form-row">
                <label for="f-comment" id="lbl-comment">{esc(tr['form']['commentLabel'])}</label>
                <textarea id="f-comment" name="comment" rows="2" placeholder="{esc(tr['form']['commentPlaceholder'])}"></textarea>
              </div>
              <div class="form-actions form-actions--streamlined">
                <button type="submit" class="btn btn--primary btn--submit-main" id="btn-send-bot">{esc(tr['form']['sendBotBtn'])}</button>
                <p class="form-privacy-note">
                  {
                      {
                          "en": f'Non-binding pre-registration without payment. By submitting, you agree to data processing for contact purposes per our <a href="{esc(root_prefix)}{esc(url_lang)}/datenschutz/">Privacy Policy</a>.',
                          "de": f'Unverbindliche Vormerkung ohne Zahlungspflicht. Mit dem Absenden stimmen Sie der Verarbeitung Ihrer Angaben zur Kontaktaufnahme gemäß unserer <a href="{esc(root_prefix)}{esc(url_lang)}/datenschutz/">Datenschutzerklärung</a> zu.',
                          "ru": f'Предварительная заявка ни к чему не обязывает (без оплаты). Отправляя форму, вы соглашаетесь на обработку данных для обратной связи согласно <a href="{esc(root_prefix)}{esc(url_lang)}/datenschutz/">Политике конфиденциальности</a>.',
                          "ua": f'Попередня заявка ні до чого не зобов’язує (без оплати). Надсилаючи форму, ви погоджуєтесь на обробку даних для зворотного зв’язку згідно з <a href="{esc(root_prefix)}{esc(url_lang)}/datenschutz/">Політикою конфіденційності</a>.',
                      }[lang]
                  }
                </p>
              </div>
              <p class="copy-feedback mono-label" id="bot-status" aria-live="polite"></p>
            </form>

            <aside class="ticket-preview" id="ticket-preview-aside" aria-label="Ticket preview">
              <div class="ticket-preview__body">
                <div class="ticket-top">
                  <span class="mono-label">FAHRKARTE · SERGII GRYGORYSHYN</span>
                  <span class="mono-label" id="tp-issue">№ {esc(default_city['issueNo'])}</span>
                </div>
                <div class="ticket-route">
                  <span class="mono-label" id="tp-label-route">{esc(tr['ticketLabels']['route'])}</span>
                  <strong id="tp-city">{esc(loc(default_city, 'name', lang))}</strong>
                  <span class="mono-label" id="tp-dates">{esc(loc(default_city, 'dates', lang))}</span>
                </div>
                <dl class="ticket-specs">
                  <div>
                    <dt id="tp-label-format">{esc(tr['ticketLabels']['format'])}</dt>
                    <dd id="tp-format">{esc(tr['ticketLabels']['formatValue'])}</dd>
                  </div>
                  <div>
                    <dt id="tp-label-status">{esc(tr['ticketLabels']['status'])}</dt>
                    <dd id="tp-status">{esc(tr['ticketLabels']['statusValue'])}</dd>
                  </div>
                  <div>
                    <dt id="tp-label-group">{esc(tr['ticketLabels']['group'])}</dt>
                    <dd id="tp-group">{esc(tr['ticketLabels']['groupValue'])}</dd>
                  </div>
                  <div>
                    <dt id="tp-label-person">{esc(tr['ticketLabels']['person'])}</dt>
                    <dd id="tp-person">—</dd>
                  </div>
                </dl>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>"""


def render_footer_and_chrome(
    data: dict[str, Any],
    lang: str,
    url_lang: str,
    root_prefix: str,
    sticky_city: dict[str, Any] | None = None,
    include_maplibre: bool = True,
    is_root_legal: bool = False,
) -> str:
    ver = esc(data["siteConfig"].get("assetVersion", "10"))
    legal_prefix = "../" if is_root_legal else f"{root_prefix}{url_lang}/"
    legal_links_labels = {
        "de": ("Impressum", "Datenschutzerklärung"),
        "en": ("Impressum / Legal Notice", "Privacy Policy"),
        "ru": ("Impressum (Реквизиты)", "Политика конфиденциальности"),
        "ua": ("Impressum (Реквізити)", "Політика конфіденційності"),
    }[lang]

    footer_html = f"""
  <footer class="site-footer{' site-footer--legal' if sticky_city is None else ''}">
    <div class="container footer-grid footer-grid--minimal">
      <div class="footer-brand">SERGII GRYGORYSHYN · {esc(data['meta']['brand'][lang].upper())}</div>
      <nav class="footer-legal-nav" aria-label="Legal">
        <a href="{esc(legal_prefix)}impressum/">{esc(legal_links_labels[0])}</a>
        <a href="{esc(legal_prefix)}datenschutz/">{esc(legal_links_labels[1])}</a>
      </nav>
    </div>
  </footer>"""

    if sticky_city is None:
        return f"""{footer_html}

  <script>
    (function () {{
      var b = document.getElementById('mobile-menu-btn');
      var d = document.getElementById('mobile-drawer');
      if (!b || !d) return;
      b.addEventListener('click', function () {{
        var ex = b.getAttribute('aria-expanded') === 'true';
        b.setAttribute('aria-expanded', String(!ex));
        d.hidden = ex;
      }});
    }})();
  </script>
</body>
</html>"""

    short_date = loc(sticky_city, "dates", lang).split("(")[0].replace("2027", "").rstrip(", ").strip()
    sticky_sub = {
        "en": "4–10 guests · No payment now",
        "de": "4–10 Pers. · Unverbindlich",
        "ru": "4–10 чел. · Без оплаты сейчас",
        "ua": "4–10 осіб · Без оплати зараз",
    }[lang]
    sticky_btn = {
        "en": "Pre-Register →",
        "de": "Vormerken →",
        "ru": "Предзапись →",
        "ua": "Передзапис →",
    }[lang]

    map_scripts = ""
    if include_maplibre:
        map_scripts = (
            f'  <script src="{root_prefix}vendor/maplibre-gl.js"></script>\n'
            f'  <script src="{root_prefix}vendor/bundeslaender.js"></script>\n'
            f'  <script src="{root_prefix}vendor/map-tiles/manifest.js?v={ver}"></script>\n'
            f'  <script src="{root_prefix}vendor/hamburg_map_3d.js?v={ver}"></script>\n'
        )

    return f"""{footer_html}

  <div class="mobile-sticky-cta" id="mobile-sticky-cta" aria-hidden="true">
    <div class="mobile-sticky-cta__info">
      <span class="mono-label mobile-sticky-cta__city" id="sticky-city-label">{esc(loc(sticky_city, 'name', lang).upper())} · {esc(short_date.upper())}</span>
      <span class="mobile-sticky-cta__sub" id="sticky-sub-label">{esc(sticky_sub)}</span>
    </div>
    <button type="button" class="btn btn--primary mobile-sticky-cta__btn" id="sticky-cta-btn" data-prefill-city="{esc(sticky_city['id'])}">
      {esc(sticky_btn)}
    </button>
  </div>

  <dialog class="artifact-dialog" id="artifact-dialog" aria-labelledby="dialog-title">
    <div class="dialog-shell">
      <div class="dialog-top">
        <span class="mono-label" id="dialog-meta">ARTIFACT</span>
        <div class="dialog-nav">
          <button type="button" class="dialog-icon-btn" id="dialog-prev" aria-label="Previous">←</button>
          <button type="button" class="dialog-icon-btn" id="dialog-next" aria-label="Next">→</button>
          <button type="button" class="dialog-icon-btn dialog-close" id="dialog-close" aria-label="Close">✕</button>
        </div>
      </div>
      <div class="dialog-img-wrap">
        <img id="dialog-img" src="" alt="" />
      </div>
      <div class="dialog-caption">
        <h3 id="dialog-title"></h3>
        <p class="mono-label" id="dialog-author"></p>
        <p id="dialog-note"></p>
      </div>
    </div>
  </dialog>

{map_scripts}  <script src="{root_prefix}data.js?v={ver}"></script>
  <script src="{root_prefix}app.js?v={ver}"></script>
</body>
</html>"""


def build_home_page(data: dict[str, Any], lang: str, url_lang: str, root_prefix: str, is_root_alias: bool = False) -> str:
    tr = data["i18n"][lang]
    v3 = tr["v3"]
    cfg = data["siteConfig"]
    base_url = cfg["baseUrl"].rstrip("/")
    canonical = f"{base_url}/" if is_root_alias else f"{base_url}/{url_lang}/"
    cities = data["cities"]
    tracks = data["tracks"]

    # Featured 2 upcoming full cities in Hero (Stuttgart #01 + Hamburg #02)
    featured = [c for c in cities if not c.get("isLabStub")][:2]
    featured_cards_html = ""
    for c in featured:
        trk = get_track(data, c["trackId"])
        c_href = f"{root_prefix}{url_lang}/{c['id']}/"
        featured_cards_html += f"""
            <a href="{esc(c_href)}" class="featured-dep-card" style="--dep-accent: {esc(c['accentColor'])}">
              <div class="featured-dep-card__img">
                <img src="{esc(root_prefix + c['heroImage'])}" alt="{esc(loc(c, 'name', lang))}" loading="eager" />
                <span class="mono-label featured-dep-card__num">№{esc(c['issueNo'])}</span>
              </div>
              <div class="featured-dep-card__body">
                <span class="track-pill" style="--pill-accent: {esc(trk['accentColor'])}">{esc(trk['symbol'])} {esc(loc(trk, 'name', lang))}</span>
                <strong class="featured-dep-card__city">{esc(loc(c, 'name', lang))}</strong>
                <span class="mono-label featured-dep-card__dates">{esc(loc(c, 'dates', lang))}</span>
                <p class="featured-dep-card__theme">{esc(loc(c, 'title', lang))}</p>
                <span class="mono-label featured-dep-card__cta">{esc(v3['enterCityBtn'])}</span>
              </div>
            </a>"""

    # Principles (pre-rendered for SEO!)
    principles_html = "".join(
        f"""
          <article class="principle-card">
            <span class="principle-card__num">{esc(item['num'])}</span>
            <h3>{esc(item['head'])}</h3>
            <p>{esc(item['body'])}</p>
          </article>"""
        for item in tr["principles"]["items"]
    )

    # Track switcher buttons
    track_btns = f'<button type="button" class="track-lens-btn is-active" data-track-lens="all">{esc(v3["allTracksBtn"])}</button>'
    for t in tracks:
        count = sum(1 for c in cities if c["trackId"] == t["id"])
        track_btns += (
            f'<button type="button" class="track-lens-btn" data-track-lens="{esc(t["id"])}" '
            f'style="--lens-accent: {esc(t["accentColor"])}">'
            f'<span class="track-lens-sym">{esc(t["symbol"])}</span> {esc(loc(t, "name", lang))} ({count})</button>'
        )

    # City Departure Board (pre-rendered in static HTML with real <a> links into every city!)
    board_cards_html = ""
    for idx, c in enumerate(cities):
        trk = get_track(data, c["trackId"])
        c_href = f"{root_prefix}{url_lang}/{c['id']}/"
        status_cls = "is-active-status" if c["status"] == "active" else ("is-forming-status" if c["status"] == "forming" else "")
        board_cards_html += f"""
              <div class="city-card city-card--hub {'is-active' if idx == 0 else ''}" style="--card-accent: {esc(c['accentColor'])}" data-select-city="{esc(c['id'])}" data-city-track="{esc(c['trackId'])}" tabindex="0">
                <span class="city-card__issue">№{esc(c['issueNo'])}</span>
                <div class="city-card__main">
                  <div class="city-card__top">
                    <strong class="city-card__name">{esc(loc(c, 'name', lang))}</strong>
                    <span class="city-card__dates">{esc(loc(c, 'dates', lang))}</span>
                  </div>
                  <span class="track-pill track-pill--sm" style="--pill-accent: {esc(trk['accentColor'])}">{esc(trk['symbol'])} {esc(loc(trk, 'name', lang))}</span>
                  <p class="city-card__theme">{esc(loc(c, 'title', lang))}</p>
                  <div class="city-card__foot">
                    <span class="city-card__status {status_cls}">{esc(loc(c, 'statusLabel', lang))}</span>
                    <a href="{esc(c_href)}" class="city-card__enter-link" data-city-link>{esc(v3['enterCityBtn'])}</a>
                  </div>
                </div>
              </div>"""

    # Speaker block (pre-rendered!)
    speaker_bio_html = "".join(f"<p>{esc(p)}</p>" for p in tr["speaker"]["bio"])
    speaker_facts_html = "".join(
        f"<div><dt>{esc(f['label'])}</dt><dd>{esc(f['val'])}</dd></div>"
        for f in tr["speaker"]["facts"]
    )

    # FAQ (pre-rendered!)
    faq_html = "".join(
        f"""
          <details class="faq-item" {'open' if idx == 0 else ''}>
            <summary>{esc(item['q'])}</summary>
            <p>{esc(item['a'])}</p>
          </details>"""
        for idx, item in enumerate(tr["faq"]["items"])
    )

    # JSON-LD structured data for Google & AI engines
    json_ld = [
        {
            "@context": "https://schema.org",
            "@type": "Person",
            "name": data["meta"]["author"]["en"],
            "alternateName": data["meta"]["author"]["ru"],
            "jobTitle": tr["speaker"]["role"],
            "url": base_url + "/",
            "sameAs": [data["meta"]["publicationsUrl"]],
        },
        {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": v3["seoTitle"],
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": idx + 1,
                    "name": f"{loc(c, 'name', lang)} — {loc(c, 'title', lang)}",
                    "url": f"{base_url}/{url_lang}/{c['id']}/",
                }
                for idx, c in enumerate(cities)
            ],
        },
        {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": item["q"],
                    "acceptedAnswer": {"@type": "Answer", "text": item["a"]},
                }
                for item in tr["faq"]["items"]
            ],
        },
    ]

    head = render_head(
        data=data,
        lang=lang,
        url_lang=url_lang,
        root_prefix=root_prefix,
        title=v3["seoTitle"],
        description=v3["seoDescription"],
        canonical_url=canonical,
        page_subpath="",
        og_image=cities[0]["heroImage"],
        json_ld_objects=json_ld,
        include_maplibre=True,
    )

    body = f"""
<body data-page="home" data-lang="{esc(lang)}" data-url-lang="{esc(url_lang)}" data-root="{esc(root_prefix)}" data-city="{esc(cities[0]['id'])}">
  <div class="archival-strip">
    <div class="container archival-strip__inner">
      <span class="mono-label" id="top-strip-text">{esc(tr['topStrip'])}</span>
      <span class="mono-label archival-strip__right" id="top-strip-right">{esc(tr['topStripRight'])}</span>
    </div>
  </div>

  <header class="site-header" id="site-header">
    <div class="container header-inner">
      <a href="#top" class="brand" aria-label="Back to top">
        <span class="brand__mark">SG</span>
        <span class="brand__text">
          <strong id="brand-author">{esc(data['meta']['author'][lang])}</strong>
          <small id="brand-sub">{esc(data['meta']['brand'][lang])}</small>
        </span>
      </a>

      <nav class="main-nav" aria-label="Section navigation">
        <a href="#hub">{esc(tr['nav']['map'])}</a>
        <a href="#principles">{esc(tr['nav']['how'])}</a>
        <a href="#speaker">{esc(tr['nav']['speaker'])}</a>
        <a href="#ticket-section" class="nav-cta">{esc(tr['nav']['ticket'])}</a>
      </nav>

      <div class="header-controls">
        {render_lang_switch(root_prefix, url_lang, "")}
        <button type="button" class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Menu" aria-expanded="false">
          <span></span><span></span>
        </button>
      </div>
    </div>
    <div class="mobile-drawer" id="mobile-drawer" hidden>
      <a href="#hub">{esc(tr['nav']['map'])}</a>
      <a href="#principles">{esc(tr['nav']['how'])}</a>
      <a href="#speaker">{esc(tr['nav']['speaker'])}</a>
      <a href="#ticket-section">{esc(tr['nav']['ticket'])}</a>
    </div>
  </header>

  <main id="top">
    <!-- 1. UNIVERSAL EDITORIAL HERO (Two Independent Curatorial Lines) -->
    <section class="hero hero--hub" id="hero-section">
      <div class="container hero-grid hero-grid--hub">
        <div class="hero-copy">
          <p class="eyebrow">{esc(v3['homeHeroEyebrow'])}</p>
          <h1 class="hero-title">{esc(tr['hero']['title'])}</h1>
          <p class="hero-subtitle hero-subtitle--home">{esc(v3['homeHeroLead'])}</p>
          <div class="hero-track-pills">
            {''.join(f'<span class="track-pill" style="--pill-accent:{esc(t["accentColor"])}">{esc(t["symbol"])} {esc(loc(t, "name", lang))}</span>' for t in tracks)}
          </div>
          <div class="hero-actions">
            <a href="#hub" class="btn btn--primary" id="hero-cta-primary">{esc(v3['homeCtaPrimary'])}</a>
            <a href="#ticket-section" class="btn btn--outline">{esc(v3['homeCtaSecondary'])}</a>
          </div>
        </div>

        <aside class="hero-departures" aria-label="{esc(v3['nextDeparturesLabel'])}">
          <div class="hero-departures__head">
            <span class="mono-label">{esc(v3['nextDeparturesLabel'])}</span>
            <span class="status-pulse" aria-hidden="true"></span>
          </div>
          <div class="hero-departures__grid">
{featured_cards_html}
          </div>
        </aside>
      </div>
    </section>

    <!-- 2. INTERACTIVE GERMANY ATLAS + 2-TRACK LENS SWITCHER + 2027 BOARD -->
    <section class="hub-section" id="hub">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow" id="hub-eyebrow">{esc(tr['hub']['eyebrow'])}</p>
          <h2 class="section-title" id="hub-title">{esc(tr['hub']['title'])}</h2>
          <p class="section-lead" id="hub-lead">{esc(tr['hub']['lead'])}</p>
        </div>

        <!-- 3-Way Conceptual Track Lens Switcher -->
        <div class="track-lens-bar" id="track-lens-bar" role="tablist" aria-label="Curatorial tracks">
          {track_btns}
        </div>
        <div class="track-manifesto-banner" id="track-manifesto-banner" hidden>
          <p id="track-manifesto-text"></p>
          <span class="mono-label" id="track-future-note"></span>
        </div>

        <!-- 12-Month Timeline Rail (Desktop) -->
        <div class="timeline-rail" id="timeline-rail" aria-label="2027 schedule"></div>

        <!-- Mobile Horizontal City Tabs right above Map -->
        <div class="mobile-city-tabs" id="mobile-city-tabs" role="tablist" aria-label="2027 Cities"></div>

        <div class="hub-grid">
          <div class="map-frame" id="map-frame">
            <div class="map-frame__meta">
              <span class="mono-label" id="map-meta-label">{esc(tr['hub']['mapMetaCountry'])}</span>
              <span class="mono-label" id="map-active-coords">{esc(cities[0]['coords'])}</span>
            </div>

            <div class="map3d-toolbar">
              <div class="map3d-toolbar__left">
                <button type="button" class="pill-btn is-active" id="btn-back-country">← All Germany (16 States)</button>
                <button type="button" class="pill-btn" id="btn-zoom-city">{esc(loc(cities[0], 'name', lang))} 3D</button>
              </div>
              <div class="map3d-toolbar__right">
                <button type="button" class="pill-btn is-active" id="btn-toggle-fire" hidden>Altstadt 1738</button>
                <button type="button" class="pill-btn" id="btn-orbit-3d" hidden>↻ Orbit</button>
              </div>
            </div>

            <div class="map3d-stage" id="map3d-stage">
              <div class="maplibre-canvas" id="maplibre-canvas" role="region" aria-label="Interactive Germany and 3D City Map"></div>
              <aside class="map-landmark-overlay" id="map-landmark-overlay" hidden aria-live="polite">
                <div class="map-overlay__top">
                  <span class="mono-label" id="ov-day"></span>
                  <div class="map-overlay__nav">
                    <button type="button" class="dialog-icon-btn" id="ov-prev" aria-label="Previous">←</button>
                    <button type="button" class="dialog-icon-btn" id="ov-next" aria-label="Next">→</button>
                    <button type="button" class="dialog-icon-btn" id="ov-close" aria-label="Close">✕</button>
                  </div>
                </div>
                <div class="map-overlay__body" id="map-overlay-body"></div>
              </aside>
            </div>

            <div class="landmarks-dock" id="hamburg-landmarks-dock" hidden aria-label="3D city stops"></div>

            <div class="map-zoom-bar">
              <span class="map-legend">
                <span class="legend-item"><i class="dot" style="background:#7A2E3A"></i> <span id="legend-active">{esc(loc(tracks[0], 'name', lang))}</span></span>
                <span class="legend-item"><i class="dot" style="background:#C23B1A"></i> <span id="legend-forming">{esc(loc(tracks[1], 'name', lang))}</span></span>
                <span class="legend-item"><i class="dot dot--wait"></i> <span id="legend-wait">3D: Stuttgart &amp; Hamburg</span></span>
              </span>
            </div>
          </div>

          <!-- Mobile Live Active City Card directly under map -->
          <div class="mobile-active-city" id="mobile-active-city" aria-live="polite"></div>

          <!-- Desktop 6-City Departure Board with direct links into each City Page -->
          <div class="board-column">
            <div class="board-header">
              <span class="mono-label" id="board-title">{esc(tr['hub']['boardTitle'])}</span>
              <span class="mono-label" id="board-threshold">{esc(tr['hub']['boardThreshold'])}</span>
            </div>
            <div class="city-cards" id="city-cards">
{board_cards_html}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. FOUR PILLARS OF THE FORMAT -->
    <section class="principles-section" id="principles">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow" id="principles-eyebrow">{esc(tr['principles']['eyebrow'])}</p>
          <h2 class="section-title" id="principles-title">{esc(tr['principles']['title'])}</h2>
        </div>
        <div class="principles-grid" id="principles-grid">{principles_html}</div>
        <p class="marginalia-note" id="small-format-note">{esc(tr['principles']['smallFormatNote'])}</p>
      </div>
    </section>

    <!-- 4. ABOUT SERGII GRYGORYSHYN (Lives cleanly on Home only!) -->
    <section class="speaker-section" id="speaker">
      <div class="container speaker-grid">
        <div class="speaker-portrait-col">
          <figure class="speaker-frame">
            <img src="{esc(root_prefix)}сергей/сергей.jpg" alt="{esc(tr['speaker']['name'])}" loading="lazy" />
            <figcaption class="mono-label" id="speaker-portrait-cap">{esc(tr['speaker']['portraitCap'])}</figcaption>
          </figure>
          <div class="video-slot">
            <div class="video-slot__play" aria-hidden="true">▶</div>
            <div>
              <strong id="video-title">{esc(tr['speaker']['videoTitle'])}</strong>
              <span class="mono-label" id="video-status">{esc(tr['speaker']['videoStatus'])}</span>
            </div>
          </div>
        </div>

        <div class="speaker-copy-col">
          <p class="eyebrow" id="speaker-eyebrow">{esc(tr['speaker']['eyebrow'])}</p>
          <h2 class="section-title" id="speaker-name">{esc(tr['speaker']['name'])}</h2>
          <p class="speaker-role" id="speaker-role">{esc(tr['speaker']['role'])}</p>
          <div class="speaker-bio" id="speaker-bio">{speaker_bio_html}</div>
          <dl class="speaker-facts" id="speaker-facts">{speaker_facts_html}</dl>
          <div class="speaker-actions">
            <a href="{esc(data['meta']['publicationsUrl'])}" target="_blank" rel="noopener noreferrer" class="btn btn--outline" id="speaker-pub-btn">
              {esc(tr['speaker']['pubBtn'])}
            </a>
          </div>
          <div class="lecture-chronicle">
            <div class="lecture-chronicle__grid">
              <img src="{esc(root_prefix)}сергей/лекция1.jpg" alt="Lecture session" loading="lazy" />
              <img src="{esc(root_prefix)}сергей/лекция2.jpg" alt="Seminar discussion" loading="lazy" />
            </div>
            <span class="mono-label" id="lecture-caption">{esc(tr['speaker']['lectureCaption'])}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. UNIVERSAL FAHRKARTE PRE-REGISTRATION -->
{render_ticket_section(data, lang, url_lang=url_lang, root_prefix=root_prefix, locked_city_id=None)}

    <!-- 6. FAQ -->
    <section class="faq-section" id="faq">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow" id="faq-eyebrow">{esc(tr['faq']['eyebrow'])}</p>
          <h2 class="section-title" id="faq-title">{esc(tr['faq']['title'])}</h2>
        </div>
        <div class="faq-list" id="faq-list">{faq_html}</div>
      </div>
    </section>
  </main>
{render_footer_and_chrome(data, lang, url_lang, root_prefix, cities[0], include_maplibre=True)}"""

    return head + body


def render_city_hero_visual(data: dict[str, Any], city: dict[str, Any], lang: str, root_prefix: str) -> str:
    tr = data["i18n"][lang]
    if city["id"] == "hamburg":
        # Hamburg keeps its iconic 1840 -> 1842 -> 1843 triptych & live mobile montage!
        caps = tr["hero"]["triptych"]
        return f"""
        <div class="city-hero-visual">
          <div class="hero-mobile-reel hero-mobile-reel--city" id="hero-mobile-reel" aria-label="1840–1843 visual sequence">
            <div class="hero-reel__stage">
              <img class="hero-reel__slide is-active" data-reel-idx="0" data-lightbox-id="art-6" src="{esc(root_prefix)}фото и картины/hamburg/photo_6_2026-11-18_13-34-16.jpg" alt="1840 Painting" loading="eager" />
              <img class="hero-reel__slide hero-reel__slide--fire" data-reel-idx="1" data-lightbox-id="art-10" src="{esc(root_prefix)}фото и картины/hamburg/photo_10_2026-11-18_13-34-16.jpg" alt="1842 Great Fire" loading="eager" />
              <img class="hero-reel__slide hero-reel__slide--silver" data-reel-idx="2" data-lightbox-id="art-7" src="{esc(root_prefix)}фото и картины/hamburg/photo_7_2026-11-18_13-34-16.jpg" alt="1843 Daguerreotype" loading="eager" />
              <div class="hero-reel__scrim"></div>
              <div class="hero-reel__top">
                <span class="mono-label hero-reel__badge" id="reel-badge-dates">{esc(loc(city, 'name', lang).upper())} · {esc(loc(city, 'dates', lang).upper())}</span>
              </div>
              <div class="hero-reel__bottom">
                <div class="hero-reel__meta">
                  <span class="mono-label hero-reel__year" id="reel-year">1840</span>
                  <strong class="hero-reel__cap" id="reel-cap">{esc(caps[0])}</strong>
                </div>
                <div class="hero-reel__bars" role="tablist">
                  <button type="button" class="hero-reel__bar is-active" data-reel-pick="0" aria-label="1840"><span></span></button>
                  <button type="button" class="hero-reel__bar" data-reel-pick="1" aria-label="1842"><span></span></button>
                  <button type="button" class="hero-reel__bar" data-reel-pick="2" aria-label="1843"><span></span></button>
                </div>
              </div>
            </div>
          </div>

          <aside class="hero-showcase hero-showcase--city">
            <div class="showcase-header">
              <span class="mono-label">№{esc(city['issueNo'])} · {esc(loc(city, 'name', lang).upper())}</span>
              <span class="mono-label stamp-pill">{esc(loc(city, 'dates', lang).upper())}</span>
            </div>
            <div class="triptych">
              <figure class="triptych__item" data-lightbox-id="art-6">
                <img src="{esc(root_prefix)}фото и картины/hamburg/photo_6_2026-11-18_13-34-16.jpg" alt="1840 Painting" loading="eager" />
                <figcaption><span>1840</span> <em>{esc(caps[0])}</em></figcaption>
              </figure>
              <figure class="triptych__item triptych__item--fire" data-lightbox-id="art-10">
                <img src="{esc(root_prefix)}фото и картины/hamburg/photo_10_2026-11-18_13-34-16.jpg" alt="1842 Fire" loading="eager" />
                <figcaption><span>1842</span> <em>{esc(caps[1])}</em></figcaption>
              </figure>
              <figure class="triptych__item triptych__item--silver" data-lightbox-id="art-7">
                <img src="{esc(root_prefix)}фото и картины/hamburg/photo_7_2026-11-18_13-34-16.jpg" alt="1843 Daguerreotype" loading="eager" />
                <figcaption><span>1843</span> <em>{esc(caps[2])}</em></figcaption>
              </figure>
            </div>
            <div class="showcase-footer">
              <span class="status-pulse" aria-hidden="true"></span>
              <p class="mono-label showcase-status">{esc(loc(city, 'statusLabel', lang))}</p>
            </div>
          </aside>
        </div>"""

    if city["id"] == "stuttgart":
        caps_st = {
            "en": ["1738–1787 · Tyranny", "1782–1827 · Romanticism", "1839–1848 · Barricades", "1770–1855 · Hegel & Loop"],
            "de": ["1738–1787 · Willkür", "1782–1827 · Romantik", "1839–1848 · Barrikaden", "1770–1855 · Hegel & Bogen"],
            "ru": ["1738–1787 · Тирания", "1782–1827 · Романтизм", "1839–1848 · Баррикады", "1770–1855 · Гегель и петля"],
            "ua": ["1738–1787 · Тиранія", "1782–1827 · Романтизм", "1839–1848 · Барикади", "1770–1855 · Гегель і петля"],
        }[lang]
        imgs_st = [
            ("st-art-1", "фото и картины/stuttgart/stuttgart_act1_enlightenment.jpg", "1738"),
            ("st-art-2", "фото и картины/stuttgart/stuttgart_act2_romanticism.jpg", "1782"),
            ("st-art-3", "фото и картины/stuttgart/stuttgart_act3_schillerplatz.jpg", "1839"),
            ("st-art-4", "фото и картины/stuttgart/stuttgart_act4_hegel_autumn.jpg", "1855"),
        ]
        slides = "".join(
            f'<img class="hero-reel__slide{" is-active" if i == 0 else ""}" data-reel-idx="{i}" data-lightbox-id="{aid}" src="{esc(root_prefix + path)}" alt="{esc(caps_st[i])}" loading="eager" />'
            for i, (aid, path, _) in enumerate(imgs_st)
        )
        bars = "".join(
            f'<button type="button" class="hero-reel__bar{" is-active" if i == 0 else ""}" data-reel-pick="{i}" aria-label="{yr}"><span></span></button>'
            for i, (_, _, yr) in enumerate(imgs_st)
        )
        quad = "".join(
            f'<figure class="triptych__item" data-lightbox-id="{aid}"><img src="{esc(root_prefix + path)}" alt="{esc(caps_st[i])}" loading="eager" /><figcaption><span>{yr}</span> <em>{esc(caps_st[i].split("·")[-1].strip())}</em></figcaption></figure>'
            for i, (aid, path, yr) in enumerate(imgs_st)
        )
        return f"""
        <div class="city-hero-visual">
          <div class="hero-mobile-reel hero-mobile-reel--city" id="hero-mobile-reel" data-reel-mode="stuttgart" aria-label="Stuttgart 4-act visual sequence">
            <div class="hero-reel__stage">
              {slides}
              <div class="hero-reel__scrim"></div>
              <div class="hero-reel__top">
                <span class="mono-label hero-reel__badge">{esc(loc(city, 'name', lang).upper())} · {esc(loc(city, 'dates', lang).upper())}</span>
              </div>
              <div class="hero-reel__bottom">
                <div class="hero-reel__meta">
                  <span class="mono-label hero-reel__year" id="reel-year">1738</span>
                  <strong class="hero-reel__cap" id="reel-cap">{esc(caps_st[0].split('·')[-1].strip())}</strong>
                </div>
                <div class="hero-reel__bars" role="tablist">{bars}</div>
              </div>
            </div>
          </div>

          <aside class="hero-showcase hero-showcase--city">
            <div class="showcase-header">
              <span class="mono-label">№{esc(city['issueNo'])} · {esc(loc(city, 'name', lang).upper())}</span>
              <span class="mono-label stamp-pill">{esc(loc(city, 'dates', lang).upper())}</span>
            </div>
            <div class="triptych triptych--quad">{quad}</div>
            <div class="showcase-footer">
              <span class="status-pulse" aria-hidden="true"></span>
              <p class="mono-label showcase-status">{esc(loc(city, 'statusLabel', lang))}</p>
            </div>
          </aside>
        </div>"""

    # Upcoming city clean concept showcase
    return f"""
        <aside class="hero-showcase hero-showcase--city hero-showcase--stub">
          <div class="showcase-header">
            <span class="mono-label">№{esc(city['issueNo'])} · {esc(loc(city, 'region', lang).upper())}</span>
            <span class="mono-label stamp-pill">{esc(loc(city, 'dates', lang).upper())}</span>
          </div>
          <div class="stub-hero-img">
            <img src="{esc(root_prefix + city['heroImage'])}" alt="{esc(loc(city, 'name', lang))}" loading="eager" />
          </div>
          <div class="showcase-footer">
            <span class="status-pulse" aria-hidden="true"></span>
            <p class="mono-label showcase-status">{esc(loc(city, 'labStage', lang))}</p>
          </div>
        </aside>"""


def render_stuttgart_interactive(data: dict[str, Any], lang: str, root_prefix: str) -> str:
    v3 = data["i18n"][lang]["v3"]
    nodes = data["stuttgartInteractive"]["nodes"]
    first = nodes[0]
    btn_auto = {
        "en": "▶ Auto-Walk (7 Turning Points)",
        "de": "▶ Rundgang starten (7 Stationen)",
        "ru": "▶ Авто-прогулка по петле (7 узлов)",
        "ua": "▶ Авто-прогулянка петлею (7 вузлів)",
    }[lang]
    btn_map = {
        "en": "Show on 3D Map ↑",
        "de": "Auf der 3D-Karte zeigen ↑",
        "ru": "Показать точку на 3D-карте ↑",
        "ua": "Показати на 3D-карті ↑",
    }[lang]

    rail = "".join(
        f"""
          <button type="button" class="timeloop-node{' is-active' if i == 0 else ''}" data-tl-node="{esc(n['id'])}">
            <span class="timeloop-node__year">{esc(n['year'])}</span>
            <strong class="timeloop-node__name">{esc(loc(n, 'short', lang))}</strong>
          </button>"""
        for i, n in enumerate(nodes)
    )

    return f"""
    <section class="compare-section timeloop-section" id="city-trial">
      <div class="container">
        <div class="section-head section-head--split">
          <div>
            <p class="eyebrow">{esc(v3['cityInteractiveEyebrow'])}</p>
            <h2 class="section-title">{esc(v3['cityInteractiveTitle'])}</h2>
            <p class="section-lead">{esc(v3['cityInteractiveLead'])}</p>
          </div>
          <div class="compare-mode-switch">
            <button type="button" class="pill-btn" id="btn-timeloop-auto" aria-pressed="false">{esc(btn_auto)}</button>
          </div>
        </div>

        <div class="timeloop-rail" id="timeloop-rail" role="tablist" aria-label="Stuttgart timeline">{rail}</div>

        <article class="timeloop-stage" id="timeloop-stage" aria-live="polite">
          <div class="timeloop-stage__media">
            <img id="tl-img" src="{esc(root_prefix + first['image'])}" alt="{esc(loc(first, 'title', lang))}" />
            <span class="plate-year-badge" id="tl-year-badge">{esc(first['year'])}</span>
          </div>
          <div class="timeloop-stage__body">
            <span class="mono-label timeloop-echo" id="tl-echo">{esc(loc(first, 'echo', lang))}</span>
            <h3 id="tl-title">{esc(loc(first, 'title', lang))}</h3>
            <p class="timeloop-excerpt" id="tl-excerpt">{esc(loc(first, 'excerpt', lang))}</p>
            <div class="timeloop-duel" id="tl-duel" hidden></div>
            <div class="timeloop-stage__actions">
              <button type="button" class="btn btn--outline" id="tl-jump-map" data-tl-landmark="{esc(first['landmarkId'])}">{esc(btn_map)}</button>
              <button type="button" class="pill-btn" id="tl-follow-echo" data-tl-node="{esc(first['echoTargetId'])}">→</button>
            </div>
          </div>
        </article>
      </div>
    </section>"""


def render_hamburg_interactive(data: dict[str, Any], lang: str, root_prefix: str) -> str:
    tr = data["i18n"][lang]["compare"]
    cmp_labels = {
        "en": ("Close-Up: 1840 ↔ 1843", "Full Canvas (Pins)", "⏸ Auto-Tour", "1840 · PAINTING", "1843 · DAGUERREOTYPE"),
        "de": ("Nahaufnahme: 1840 ↔ 1843", "Gesamtansicht (Pins)", "⏸ Auto-Tour", "1840 · GEMÄLDE", "1843 · DAGUERREOTYPIE"),
        "ru": ("Крупный план: 1840 ↔ 1843", "Общий план (пины)", "⏸ Авто-обход", "1840 · ХОЛСТ", "1843 · ДАГЕРОТИП"),
        "ua": ("Крупний план: 1840 ↔ 1843", "Загальний план (піни)", "⏸ Авто-огляд", "1840 · ПОЛОТНО", "1843 · ДАГЕРОТИП"),
    }[lang]

    return f"""
    <section class="compare-section" id="compare">
      <div class="container">
        <div class="section-head section-head--split">
          <div>
            <p class="eyebrow" id="compare-eyebrow">{esc(tr['eyebrow'])}</p>
            <h2 class="section-title" id="compare-title">{esc(tr['title'])}</h2>
            <p class="section-lead" id="compare-lead">{esc(tr['lead'])}</p>
          </div>
          <div class="compare-mode-switch" role="group" aria-label="Face study controls">
            <button type="button" class="pill-btn is-active" id="btn-compare-closeup" data-compare-view="closeup">{esc(cmp_labels[0])}</button>
            <button type="button" class="pill-btn" id="btn-compare-full" data-compare-view="full">{esc(cmp_labels[1])}</button>
            <button type="button" class="pill-btn is-active" id="btn-compare-autoplay" aria-pressed="true">{esc(cmp_labels[2])}</button>
          </div>
        </div>

        <div id="compare-pins-view" class="compare-pins-view is-closeup">
          <div class="compare-dual-grid">
            <figure class="compare-plate">
              <div class="plate-stage" id="plate-1840-stage">
                <img id="compare-1840-img" src="{esc(root_prefix)}фото и картины/hamburg/photo_6_2026-11-18_13-34-16.jpg" alt="1840 Painting" loading="lazy" />
                <span class="plate-year-badge" id="badge-1840">{esc(cmp_labels[3])}</span>
                <div class="hotspot-layer" id="hotspots-1840"></div>
              </div>
              <figcaption class="museum-caption" id="cap-1840">{esc(tr['caption1840'])}</figcaption>
            </figure>

            <figure class="compare-plate">
              <div class="plate-stage" id="plate-1843-stage">
                <img id="compare-1843-img" src="{esc(root_prefix)}фото и картины/hamburg/photo_7_2026-11-18_13-34-16.jpg" alt="1843 Daguerreotype" loading="lazy" />
                <span class="plate-year-badge plate-year-badge--silver" id="badge-1843">{esc(cmp_labels[4])}</span>
                <div class="hotspot-layer" id="hotspots-1843"></div>
              </div>
              <figcaption class="museum-caption" id="cap-1843">{esc(tr['caption1843'])}</figcaption>
            </figure>
          </div>

          <div class="plate-switcher" id="plate-switcher" role="group" aria-label="Select archival plate"></div>
          <div class="hero-selector" id="person-selector" role="tablist" aria-label="Select artist"></div>
          <article class="person-dossier" id="person-dossier" aria-live="polite"></article>
          <p class="marginalia-note" id="compare-disclaimer">{esc(tr['disclaimer'])}</p>
        </div>
      </div>
    </section>"""


def render_static_dossier(data: dict[str, Any], city: dict[str, Any], lang: str, root_prefix: str) -> str:
    tr = data["i18n"][lang]["dossier"]
    if city.get("isLabStub"):
        clues_html = "".join(
            f"""
            <article class="lab-clue-card">
              <span class="mono-label">{esc(clue['code'])}</span>
              <h4>{esc(loc(clue, 'title', lang))}</h4>
              <p>{esc(loc(clue, 'desc', lang))}</p>
            </article>"""
            for clue in city.get("labClues", [])
        )
        return f"""
        <div class="dossier-shell" id="dossier-shell">
          <div class="lab-panel">
            <div class="lab-stage-banner">
              <div>
                <span class="mono-label">{esc(tr['labLabel'])}</span>
                <p style="margin:6px 0 0; font-weight:600;">{esc(loc(city, 'labStage', lang))}</p>
              </div>
              <span class="mono-label">{esc(loc(city, 'region', lang))}</span>
            </div>
            <h3 style="margin:0 0 16px; font-family:var(--font-display); font-size:1.7rem;">{esc(tr['labCluesTitle'])}</h3>
            <div class="lab-clues-grid">{clues_html}</div>
          </div>
        </div>"""

    # Full city: pre-render all 4 Acts right in HTML for SEO & AI crawlers!
    story_lbl = (city.get("dossierTabs") and loc(city["dossierTabs"], "story", lang)) or tr["tabs"]["story"]
    sched_lbl = (city.get("dossierTabs") and loc(city["dossierTabs"], "schedule", lang)) or tr["tabs"]["schedule"]
    arch_lbl = (city.get("dossierTabs") and loc(city["dossierTabs"], "archive", lang)) or tr["tabs"]["archive"]

    acts_html = ""
    for idx, act in enumerate(city.get("acts", [])):
        paras = loc(act, "paragraphs", lang) or act.get("paragraphsRu", [])
        p_html = "".join(f"<p>{esc(p)}</p>" for p in paras)
        acts_html += f"""
              <article class="act-block act-block--{esc(act['tone'])}{' is-expanded' if idx == 0 else ''}" data-mobile-accordion>
                <div class="act-text">
                  <button type="button" class="mobile-acc-head" data-toggle-acc aria-expanded="{'true' if idx == 0 else 'false'}">
                    <span class="act-num">{esc(loc(act, 'num', lang) or act.get('num', ''))}</span>
                    <span class="act-title">{esc(loc(act, 'title', lang))}</span>
                    <span class="mobile-acc-chevron" aria-hidden="true"></span>
                  </button>
                  <div class="mobile-acc-body">
                    {p_html}
                    <div class="act-museum-plate">{esc(loc(act, 'museumPlate', lang))}</div>
                  </div>
                </div>
                <figure class="act-figure mobile-acc-body" data-lightbox-src="{esc(act['image'])}">
                  <img src="{esc(root_prefix + act['image'])}" alt="{esc(loc(act, 'imageCaption', lang))}" loading="lazy" />
                  <figcaption>{esc(loc(act, 'imageCaption', lang))}</figcaption>
                </figure>
              </article>"""

    return f"""
        <div class="dossier-shell" id="dossier-shell">
          <div class="dossier-tabs" role="tablist">
            <button type="button" class="dossier-tab is-active" data-dossier-tab="story">📖 {esc(story_lbl)}</button>
            <button type="button" class="dossier-tab" data-dossier-tab="schedule">🗓 {esc(sched_lbl)}</button>
            <button type="button" class="dossier-tab" data-dossier-tab="archive">🖼 {esc(arch_lbl)}</button>
          </div>
          <div class="acts-container">{acts_html}</div>
        </div>"""


def build_city_page(data: dict[str, Any], city: dict[str, Any], lang: str, url_lang: str, root_prefix: str) -> str:
    tr = data["i18n"][lang]
    v3 = tr["v3"]
    cfg = data["siteConfig"]
    base_url = cfg["baseUrl"].rstrip("/")
    page_subpath = f"{city['id']}/"
    canonical = f"{base_url}/{url_lang}/{page_subpath}"
    trk = get_track(data, city["trackId"])
    home_href = f"{root_prefix}{url_lang}/"
    seo = (city.get("seo") or {}).get(lang) or {
        "title": f"{loc(city, 'name', lang)} — {loc(city, 'title', lang)}",
        "description": loc(city, "subtitle", lang),
    }

    # Find next city in same track (or next in schedule if track has 1 city so far)
    same_track = [c for c in data["cities"] if c["trackId"] == city["trackId"]]
    if len(same_track) > 1:
        idx_in_t = next((i for i, c in enumerate(same_track) if c["id"] == city["id"]), 0)
        next_city = same_track[(idx_in_t + 1) % len(same_track)]
    else:
        all_c = data["cities"]
        idx_all = next((i for i, c in enumerate(all_c) if c["id"] == city["id"]), 0)
        next_city = all_c[(idx_all + 1) % len(all_c)]
    next_href = f"{root_prefix}{url_lang}/{next_city['id']}/"
    next_trk = get_track(data, next_city["trackId"])

    # Structured data for Google & AI engines (TouristTrip + BreadcrumbList + Person)
    landmarks = (city.get("cityMap") or {}).get("landmarks") or []
    json_ld = [
        {
            "@context": "https://schema.org",
            "@type": "TouristTrip",
            "name": f"{loc(city, 'name', lang)}: {loc(city, 'title', lang)}",
            "description": seo["description"],
            "touristType": [loc(trk, "name", lang), "Cultural & Philosophical Travelers"],
            "url": canonical,
            "provider": {
                "@type": "Person",
                "name": data["meta"]["author"]["en"],
                "sameAs": [data["meta"]["publicationsUrl"]],
            },
            "itinerary": {
                "@type": "ItemList",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": i + 1,
                        "name": loc(lm, "name", lang),
                    }
                    for i, lm in enumerate(landmarks)
                ],
            },
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": data["meta"]["brand"][lang], "item": f"{base_url}/{url_lang}/"},
                {"@type": "ListItem", "position": 2, "name": loc(city, "name", lang), "item": canonical},
            ],
        },
    ]

    has_3d = bool(city.get("has3DMap"))
    head = render_head(
        data=data,
        lang=lang,
        url_lang=url_lang,
        root_prefix=root_prefix,
        title=seo["title"],
        description=seo["description"],
        canonical_url=canonical,
        page_subpath=page_subpath,
        og_image=city.get("heroImage", ""),
        json_ld_objects=json_ld,
        include_maplibre=has_3d,
    )

    hook_text = loc(city, "heroHook", lang)
    hook_html = f'<blockquote class="hero-hook">{esc(hook_text)}</blockquote>' if hook_text else ""

    map_section_html = ""
    if has_3d:
        zone_btn_lbl = (
            {"ru": "Резиденция 1738", "ua": "Резиденція 1738", "de": "Residenz 1738", "en": "Altstadt 1738"}[lang]
            if city["id"] == "stuttgart"
            else {"ru": "Пожар 1842", "ua": "Пожежа 1842", "de": "Brand 1842", "en": "1842 Fire"}[lang]
        )
        map_section_html = f"""
    <section class="hub-section city-map-section" id="city-map">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">3D CARTOGRAPHY · {esc(loc(city, 'name', lang).upper())}</p>
          <h2 class="section-title">{esc(loc(city, 'name', lang))} 3D · {esc(tr['hub']['mapMetaCity'])}</h2>
        </div>

        <div class="map-frame" id="map-frame">
          <div class="map-frame__meta">
            <span class="mono-label" id="map-meta-label">{esc(tr['hub']['mapMetaCity'])}</span>
            <span class="mono-label" id="map-active-coords">{esc(city['coords'])}</span>
          </div>
          <div class="map3d-toolbar">
            <div class="map3d-toolbar__left">
              <button type="button" class="pill-btn" id="btn-back-country">← Germany</button>
              <button type="button" class="pill-btn is-active" id="btn-zoom-city">{esc(loc(city, 'name', lang))} 3D</button>
            </div>
            <div class="map3d-toolbar__right">
              <button type="button" class="pill-btn is-active" id="btn-toggle-fire">{esc(zone_btn_lbl)}</button>
              <button type="button" class="pill-btn" id="btn-orbit-3d">↻ Orbit</button>
            </div>
          </div>
          <div class="map3d-stage" id="map3d-stage">
            <div class="maplibre-canvas" id="maplibre-canvas" role="region" aria-label="{esc(loc(city, 'name', lang))} 3D Map"></div>
            <aside class="map-landmark-overlay" id="map-landmark-overlay" hidden aria-live="polite">
              <div class="map-overlay__top">
                <span class="mono-label" id="ov-day"></span>
                <div class="map-overlay__nav">
                  <button type="button" class="dialog-icon-btn" id="ov-prev" aria-label="Previous">←</button>
                  <button type="button" class="dialog-icon-btn" id="ov-next" aria-label="Next">→</button>
                  <button type="button" class="dialog-icon-btn" id="ov-close" aria-label="Close">✕</button>
                </div>
              </div>
              <div class="map-overlay__body" id="map-overlay-body"></div>
            </aside>
          </div>
          <div class="landmarks-dock" id="hamburg-landmarks-dock" aria-label="City landmarks"></div>
          <div class="map-zoom-bar">
            <span class="map-legend">
              <span class="legend-item"><i class="dot dot--active"></i> <span id="legend-active">Route Stops</span></span>
              <span class="legend-item"><i class="dot dot--forming"></i> <span id="legend-forming">Historical Zone</span></span>
              <span class="legend-item"><i class="dot dot--wait"></i> <span id="legend-wait">Right-drag / Ctrl — Orbit 3D</span></span>
            </span>
          </div>
        </div>
      </div>
    </section>"""

    interactive_html = ""
    if city["id"] == "stuttgart":
        interactive_html = render_stuttgart_interactive(data, lang, root_prefix)
    elif city["id"] == "hamburg":
        interactive_html = render_hamburg_interactive(data, lang, root_prefix)

    nav_trial_link = ""
    if city["id"] == "stuttgart":
        nav_trial_link = f'<a href="#city-trial">1738 ↺ 1855</a>'
    elif city["id"] == "hamburg":
        nav_trial_link = f'<a href="#compare">1840 ↔ 1843</a>'

    nav_map_link = f'<a href="#city-map">{esc(tr["nav"]["map"])}</a>' if has_3d else ""
    cta_primary_href = "#city-map" if has_3d else "#dossier"
    cta_primary_lbl = (
        f"{loc(city, 'name', lang)} 3D ↓" if has_3d else tr["nav"]["dossier"] + " ↓"
    )

    city_name = loc(city, "name", lang)
    city_title = loc(city, "title", lang)
    h1_text = city_title if city_name.lower() in city_title.lower() else f"{city_name}: {city_title}"
    mobile_facts_suffix = {
        "en": "4–10 GUESTS · HALL & MUSEUMS",
        "de": "4–10 PERS. · SEMINAR & MUSEEN",
        "ru": "4–10 ЧЕЛ. · ЗАЛ И МУЗЕИ",
        "ua": "4–10 ОСІБ · ЗАЛ І МУЗЕЇ",
    }[lang]

    body = f"""
<body data-page="city" data-lang="{esc(lang)}" data-url-lang="{esc(url_lang)}" data-root="{esc(root_prefix)}" data-city="{esc(city['id'])}" style="--city-accent: {esc(city['accentColor'])};">
  <div class="archival-strip">
    <div class="container archival-strip__inner">
      <a href="{esc(home_href)}" class="mono-label city-back-crumb">{esc(v3['backToAllRoutes'])}</a>
      <span class="mono-label archival-strip__right">{esc(trk['symbol'])} {esc(loc(trk, 'name', lang).upper())} · №{esc(city['issueNo'])}</span>
    </div>
  </div>

  <header class="site-header" id="site-header">
    <div class="container header-inner">
      <a href="{esc(home_href)}" class="brand" aria-label="All 2027 Expeditions">
        <span class="brand__mark">SG</span>
        <span class="brand__text">
          <strong>{esc(data['meta']['author'][lang])}</strong>
          <small>{esc(city_name)} · №{esc(city['issueNo'])}</small>
        </span>
      </a>

      <nav class="main-nav" aria-label="City navigation">
        <a href="{esc(home_href)}">{esc(v3['backToAllRoutes'])}</a>
        {nav_map_link}
        {nav_trial_link}
        <a href="#dossier">{esc(tr['nav']['dossier'])}</a>
        <a href="#ticket-section" class="nav-cta">{esc(tr['nav']['ticket'])}</a>
      </nav>

      <div class="header-controls">
        {render_lang_switch(root_prefix, url_lang, page_subpath)}
        <button type="button" class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Menu" aria-expanded="false">
          <span></span><span></span>
        </button>
      </div>
    </div>
    <div class="mobile-drawer" id="mobile-drawer" hidden>
      <a href="{esc(home_href)}">{esc(v3['backToAllRoutes'])}</a>
      {nav_map_link}
      {nav_trial_link}
      <a href="#dossier">{esc(tr['nav']['dossier'])}</a>
      <a href="#ticket-section">{esc(tr['nav']['ticket'])}</a>
    </div>
  </header>

  <main id="top">
    <!-- 1. BESPOKE CITY HERO -->
    <section class="hero hero--city" id="hero-section">
      <div class="container hero-grid">
        <div class="hero-copy">
          <div class="city-hero-eyebrow-row">
            <span class="track-pill" style="--pill-accent: {esc(trk['accentColor'])}">{esc(trk['symbol'])} {esc(loc(trk, 'name', lang))}</span>
            <span class="mono-label">№{esc(city['issueNo'])} · {esc(loc(city, 'region', lang).upper())}</span>
          </div>
          {hook_html}
          <h1 class="hero-title">{esc(h1_text)}</h1>
          <p class="hero-mobile-facts mono-label">{esc(loc(city, 'dates', lang).upper())} · {esc(mobile_facts_suffix)}</p>
          <p class="hero-subtitle">{esc(loc(city, 'subtitle', lang))}</p>
          <div class="hero-actions">
            <a href="{esc(cta_primary_href)}" class="btn btn--primary">{esc(cta_primary_lbl)}</a>
            <a href="#ticket-section" class="btn btn--outline">{esc(tr['hub']['reserveBtn'])}</a>
          </div>
        </div>
        {render_city_hero_visual(data, city, lang, root_prefix)}
      </div>
    </section>

    <!-- 2. CITY 3D MAP (Stuttgart / Hamburg) -->
{map_section_html}

    <!-- 3. BESPOKE CITY SIGNATURE INTERACTIVE -->
{interactive_html}

    <!-- 4. FULL CITY PROGRAM DOSSIER -->
    <section class="dossier-section" id="dossier">
      <div class="container">
{render_static_dossier(data, city, lang, root_prefix)}
      </div>
    </section>

    <!-- 5. COMPACT AUTHOR STRIP (No bloat; full bio lives on Home) -->
    <section class="author-strip-section">
      <div class="container">
        <div class="author-strip">
          <img src="{esc(root_prefix)}сергей/сергей.jpg" alt="{esc(tr['speaker']['name'])}" loading="lazy" />
          <div class="author-strip__text">
            <span class="mono-label">{esc(tr['speaker']['eyebrow'])}</span>
            <strong>{esc(tr['speaker']['name'])}</strong>
            <span>{esc(tr['speaker']['role'])}</span>
          </div>
          <a href="{esc(home_href)}#speaker" class="btn btn--outline author-strip__cta">{esc(v3['authorStripCta'])}</a>
        </div>
      </div>
    </section>

    <!-- 6. CITY-LOCKED FAHRKARTE PRE-REGISTRATION -->
{render_ticket_section(data, lang, url_lang=url_lang, root_prefix=root_prefix, locked_city_id=city['id'])}

    <!-- 7. NEXT STOP RABBIT-HOLE CROSS-LINK -->
    <section class="next-city-section">
      <div class="container">
        <a href="{esc(next_href)}" class="next-city-card" style="--next-accent: {esc(next_city['accentColor'])}">
          <div>
            <span class="mono-label">{esc(v3['nextInTrack'])}</span>
            <h3>№{esc(next_city['issueNo'])} · {esc(loc(next_city, 'name', lang))}: {esc(loc(next_city, 'title', lang))}</h3>
            <span class="mono-label">{esc(next_trk['symbol'])} {esc(loc(next_trk, 'name', lang))} · {esc(loc(next_city, 'dates', lang))}</span>
          </div>
          <span class="btn btn--outline">{esc(v3['enterCityBtn'])}</span>
        </a>
      </div>
    </section>
  </main>
{render_footer_and_chrome(data, lang, url_lang, root_prefix, city, include_maplibre=has_3d)}"""

    return head + body


def _tel_href(phone: str) -> str:
    return "".join(ch for ch in str(phone or "") if ch.isdigit() or ch == "+")


def render_legal_header(
    data: dict[str, Any],
    lang: str,
    url_lang: str,
    root_prefix: str,
    active_slug: str,
    is_root_legal: bool = False,
) -> str:
    home_href = "../" if is_root_legal else f"{root_prefix}{url_lang}/"
    legal_prefix = "../" if is_root_legal else f"{root_prefix}{url_lang}/"
    imp_href = f"{legal_prefix}impressum/"
    ds_href = f"{legal_prefix}datenschutz/"

    ui = {
        "en": {
            "backStrip": "← Back to Home",
            "stripRight": "LEGAL NOTICE · GERMANY (§ 5 DDG / GDPR)",
            "navHome": "← Home",
            "navImp": "Impressum",
            "navDs": "Privacy Policy",
        },
        "de": {
            "backStrip": "← Zurück zur Startseite",
            "stripRight": "RECHTLICHE HINWEISE · DEUTSCHLAND (§ 5 DDG / DSGVO)",
            "navHome": "← Startseite",
            "navImp": "Impressum",
            "navDs": "Datenschutzerklärung",
        },
        "ru": {
            "backStrip": "← На главную",
            "stripRight": "ПРАВОВАЯ ИНФОРМАЦИЯ · ГЕРМАНИЯ (§ 5 DDG / DSGVO)",
            "navHome": "← Главная",
            "navImp": "Impressum (Реквизиты)",
            "navDs": "Конфиденциальность",
        },
        "ua": {
            "backStrip": "← На головну",
            "stripRight": "ПРАВОВА ІНФОРМАЦІЯ · НІМЕЧЧИНА (§ 5 DDG / DSGVO)",
            "navHome": "← Головна",
            "navImp": "Impressum (Реквізити)",
            "navDs": "Конфіденційність",
        },
    }[lang]

    return f"""
  <div class="archival-strip">
    <div class="container archival-strip__inner">
      <a href="{esc(home_href)}" class="mono-label city-back-crumb">{esc(ui['backStrip'])}</a>
      <span class="mono-label archival-strip__right">{esc(ui['stripRight'])}</span>
    </div>
  </div>

  <header class="site-header" id="site-header">
    <div class="container header-inner">
      <a href="{esc(home_href)}" class="brand" aria-label="Home">
        <span class="brand__mark">SG</span>
        <span class="brand__text">
          <strong>{esc(data['meta']['author'][lang])}</strong>
          <small>{esc(data['meta']['brand'][lang])}</small>
        </span>
      </a>

      <nav class="main-nav" aria-label="Legal navigation">
        <a href="{esc(home_href)}">{esc(ui['navHome'])}</a>
        <a href="{esc(imp_href)}"{' class="nav-cta"' if active_slug == 'impressum' else ''}>{esc(ui['navImp'])}</a>
        <a href="{esc(ds_href)}"{' class="nav-cta"' if active_slug == 'datenschutz' else ''}>{esc(ui['navDs'])}</a>
      </nav>

      <div class="header-controls">
        {render_lang_switch(root_prefix, url_lang, f"{active_slug}/")}
        <button type="button" class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Menu" aria-expanded="false">
          <span></span><span></span>
        </button>
      </div>
    </div>
    <div class="mobile-drawer" id="mobile-drawer" hidden>
      <a href="{esc(home_href)}">{esc(ui['navHome'])}</a>
      <a href="{esc(imp_href)}">{esc(ui['navImp'])}</a>
      <a href="{esc(ds_href)}">{esc(ui['navDs'])}</a>
    </div>
  </header>"""


def build_impressum_page(
    data: dict[str, Any],
    lang: str = "de",
    url_lang: str = "de",
    root_prefix: str = "../",
    is_root_legal: bool = False,
) -> str:
    cfg = data["siteConfig"]
    base_url = cfg["baseUrl"].rstrip("/")
    legal = data.get("legal") or {}
    canonical = f"{base_url}/impressum/" if is_root_legal else f"{base_url}/{url_lang}/impressum/"

    entity = legal.get("entityName", "Sergii Grygoryshyn")
    street = legal.get("streetAddress", "")
    postal_city = legal.get("postalCity", "")
    email = legal.get("email", "")
    phone = legal.get("phone", "")
    tel_clean = _tel_href(phone)
    editorial = legal.get("editorialResponsible", f"{entity}, {street}, {postal_city}, Deutschland")

    has_placeholders = any(
        "[" in str(legal.get(k, ""))
        for k in ("entityName", "streetAddress", "postalCity", "email", "phone")
    )
    banner_html = (
        """
        <div class="legal-placeholder-banner" role="note">
          <strong>Hinweis vor Veröffentlichung:</strong> Bitte ersetzen Sie die markierten Platzhalter <code>[...]</code> in <code>content.json</code> (Abschnitt <code>"legal"</code>) durch Ihre echten Kontaktdaten und führen Sie <code>rebuild.bat</code> aus.
        </div>"""
        if has_placeholders
        else ""
    )

    de_href = f"{root_prefix}de/impressum/"
    lang_note_html = ""
    if lang != "de":
        notes = {
            "en": ("Note on language version: Under German law (§ 5 DDG), the German version is legally authoritative; this English translation is provided for your convenience.", "Open German version (DE) →"),
            "ru": ("О языковой версии: согласно законодательству Германии (§ 5 DDG), юридически обязывающей является немецкая версия; русский перевод предоставлен для удобства ознакомления.", "Открыть немецкую версию (DE) →"),
            "ua": ("Щодо мовної версії: відповідно до законодавства Німеччини (§ 5 DDG), юридично визначальною є німецька версія; український переклад надано для зручності ознайомлення.", "Відкрити німецьку версію (DE) →"),
        }[lang]
        lang_note_html = f"""
        <div class="legal-lang-note" role="note">
          <span>{esc(notes[0])}</span>
          <a href="{esc(de_href)}">{esc(notes[1])}</a>
        </div>"""

    country_display = {
        "de": legal.get("country", "Deutschland"),
        "en": "Germany (Deutschland)",
        "ru": "Германия (Deutschland)",
        "ua": "Німеччина (Deutschland)",
    }[lang]

    legal_form_display = {
        "de": legal.get("legalForm", "Freiberufliche Tätigkeit / Einzelperson"),
        "en": "Freelance / Individual Provider (Freiberufliche Tätigkeit / Einzelperson)",
        "ru": "Частная практика / физическое лицо (Freiberufliche Tätigkeit / Einzelperson)",
        "ua": "Приватна практика / фізична особа (Freiberufliche Tätigkeit / Einzelperson)",
    }[lang]

    vat_display = {
        "de": legal.get("vatId", ""),
        "en": "No VAT Identification Number (USt-IdNr.) issued — this website serves solely for non-binding pre-registration without payment processing.",
        "ru": "Идентификационный номер плательщика НДС (USt-IdNr.) не присвоен — данный сайт служит исключительно для ни к чему не обязывающей предварительной заявки без приёма оплаты.",
        "ua": "Ідентифікаційний номер платника ПДВ (USt-IdNr.) не присвоєно — цей сайт слугує виключно для попередньої заявки без зобов’язань та без прийому оплати.",
    }[lang]

    copy = {
        "de": {
            "headTitle": f"Impressum (§ 5 DDG) · {entity} — Philosophische Expeditionen",
            "headDesc": "Pflichtangaben gemäß § 5 Digitale-Dienste-Gesetz (DDG) und § 18 Abs. 2 MStV.",
            "eyebrow": "RECHTLICHE PFLICHTANGABEN · DEUTSCHLAND",
            "h1": "Impressum",
            "lead": "Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG) und § 18 Abs. 2 Medienstaatsvertrag (MStV).",
            "s1Title": "1. Anbieter &amp; Verantwortlicher (§ 5 DDG)",
            "dtName": "Name / Anbieter",
            "dtForm": "Rechtsform",
            "dtAddr": "Anschrift",
            "s2Title": "2. Kontakt (schnelle elektronische &amp; unmittelbare Erreichbarkeit)",
            "dtEmail": "E-Mail",
            "dtPhone": "Telefon",
            "dtTg": "Telegram (Vorab-Koordination)",
            "s3Title": "3. Umsatzsteuer-Identifikationsnummer / Steuerlicher Hinweis",
            "s4Title": "4. Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV",
            "s5Title": "5. Hinweis zur unverbindlichen Voranmeldung &amp; Leistungsabgrenzung",
            "s5Text": "Über diese Website erfolgt ausschließlich eine kostenfreie, unverbindliche Voranmeldung (Interessenbekundung) für die geplanten Termine 2027. Es werden über diese Website weder Zahlungen abgewickelt noch verbindliche Verträge geschlossen. Die angebotenen Leistungen beziehen sich ausschließlich auf das kuratierte Vortrags-, Seminar- und Exkursionsprogramm; Anreise und Hotelübernachtung werden von den Teilnehmenden gesondert und eigenständig unmittelbar bei den jeweiligen Anbietern gebucht (kein Pauschalreiseangebot im Sinne der §§ 651a ff. BGB).",
            "s6Title": "6. Verbraucherstreitbeilegung (§ 36 VSBG)",
            "s6Text": "Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
            "s7Title": "7. Urheberrecht &amp; Bildnachweise",
            "s7p1": "Die historischen Gemälde, Lithografien, Stiche und Daguerreotypien des 19. Jahrhunderts (u. a. Philipp Otto Runge, Günther Gensler, Peter &amp; Christoph Suhr, Hermann Biow, Carl Ferdinand Stelzner) sind gemeinfrei (<strong>Public Domain</strong>).",
            "s7p2": f"Die architektur- und literaturgeschichtlichen Illustrationsrekonstruktionen für Stuttgart (Abschnitt <em>Literarisches Stuttgart</em>) wurden eigens für das redaktionelle Archiv dieses Projekts erstellt. Alle redaktionellen Texte, Routenkonzepte und Porträtaufnahmen unterliegen dem Urheberrecht von {esc(entity)}.",
        },
        "en": {
            "headTitle": f"Legal Notice / Impressum (§ 5 DDG) · {entity} — Philosophical Expeditions",
            "headDesc": "Mandatory provider disclosures under German law (§ 5 DDG and § 18(2) MStV).",
            "eyebrow": "STATUTORY DISCLOSURES · GERMANY",
            "h1": "Impressum (Legal Notice)",
            "lead": "Information provided pursuant to § 5 of the German Digital Services Act (DDG) and § 18(2) of the Interstate Media Treaty (MStV).",
            "s1Title": "1. Service Provider &amp; Responsible Party (§ 5 DDG)",
            "dtName": "Name / Provider",
            "dtForm": "Legal Status",
            "dtAddr": "Postal Address",
            "s2Title": "2. Contact Details (Direct &amp; Electronic Communication)",
            "dtEmail": "Email",
            "dtPhone": "Phone",
            "dtTg": "Telegram (Pre-Coordination)",
            "s3Title": "3. VAT Identification Number / Tax Note",
            "s4Title": "4. Responsible for Editorial Content (§ 18(2) MStV)",
            "s5Title": "5. Non-Binding Pre-Registration &amp; Scope of Services",
            "s5Text": "This website exclusively provides free, non-binding pre-registration (expression of interest) for the planned 2027 expeditions. No payments are processed and no binding contracts are concluded through this site. Offered services cover only the curated lecture, seminar, and guided walk program; travel and hotel accommodation are booked and paid for independently by participants directly with the respective providers (not a package travel contract within the meaning of §§ 651a ff. BGB).",
            "s6Title": "6. Consumer Dispute Resolution (§ 36 VSBG)",
            "s6Text": "We are neither willing nor obliged to participate in dispute resolution proceedings before a consumer arbitration board.",
            "s7Title": "7. Copyright &amp; Image Credits",
            "s7p1": "The 19th-century historical paintings, lithographs, engravings, and daguerreotypes (including works by Philipp Otto Runge, Günther Gensler, Peter &amp; Christoph Suhr, Hermann Biow, and Carl Ferdinand Stelzner) are in the <strong>Public Domain</strong>.",
            "s7p2": f"The architectural and literary historical illustration reconstructions for Stuttgart (section <em>Literary Stuttgart</em>) were created specifically for this project’s editorial archive. All editorial texts, route concepts, and portrait photographs are subject to the copyright of {esc(entity)}.",
        },
        "ru": {
            "headTitle": f"Impressum (Реквизиты, § 5 DDG) · {entity} — Философские экспедиции",
            "headDesc": "Обязательные сведения о владельце сайта согласно законодательству Германии (§ 5 DDG и § 18 Abs. 2 MStV).",
            "eyebrow": "ПРАВОВАЯ ИНФОРМАЦИЯ · ГЕРМАНИЯ (§ 5 DDG)",
            "h1": "Impressum (Реквизиты и выходные данные)",
            "lead": "Обязательные сведения согласно § 5 Закона Германии о цифровых услугах (DDG) и § 18 абз. 2 Государственного договора о медиа (MStV).",
            "s1Title": "1. Поставщик услуг и ответственное лицо (§ 5 DDG)",
            "dtName": "Имя / Организатор",
            "dtForm": "Правовой статус",
            "dtAddr": "Почтовый адрес",
            "s2Title": "2. Контакты (быстрая электронная и прямая связь)",
            "dtEmail": "Эл. почта (Email)",
            "dtPhone": "Телефон",
            "dtTg": "Telegram (координация)",
            "s3Title": "3. Налоговый номер (USt-IdNr.) и примечание",
            "s4Title": "4. Ответственный за содержание согласно § 18 абз. 2 MStV",
            "s5Title": "5. Необязывающая предзапись и разграничение услуг",
            "s5Text": "На данном сайте осуществляется исключительно бесплатная и ни к чему не обязывающая предварительная запись (выражение интереса) на запланированные даты 2027 года. Через сайт не принимаются платежи и не заключаются обязывающие договоры. Предлагаемая программа охватывает исключительно авторские лекции, семинары и экскурсии; проезд и проживание в отеле участники бронируют и оплачивают самостоятельно напрямую у выбранных поставщиков (не является пакетным туром по смыслу §§ 651a ff. BGB).",
            "s6Title": "6. Потребительский арбитраж (§ 36 VSBG)",
            "s6Text": "Мы не обязаны и не готовы участвовать в процедурах урегулирования споров в органах потребительского арбитража.",
            "s7Title": "7. Авторское право и источники изображений",
            "s7p1": "Исторические полотна, литографии, гравюры и дагеротипы XIX века (Ф. О. Рунге, Г. Генслер, П. и К. Зур, Г. Биов, К. Ф. Штельцнер и др.) находятся в общественном достоянии (<strong>Public Domain</strong>).",
            "s7p2": f"Исторические и литературно-архитектурные реконструкции для Штутгарта созданы специально для редакционного архива данного проекта. Все авторские тексты, концепции маршрутов и портретные фотографии защищены авторским правом {esc(entity)}.",
        },
        "ua": {
            "headTitle": f"Impressum (Реквізити, § 5 DDG) · {entity} — Філософські експедиції",
            "headDesc": "Обов’язкові відомості про власника сайту згідно із законодавством Німеччини (§ 5 DDG та § 18 Abs. 2 MStV).",
            "eyebrow": "ПРАВОВА ІНФОРМАЦІЯ · НІМЕЧЧИНА (§ 5 DDG)",
            "h1": "Impressum (Реквізити та вихідні дані)",
            "lead": "Обов’язкові відомості відповідно до § 5 Закону Німеччини про цифрові послуги (DDG) та § 18 ч. 2 Державного договору про медіа (MStV).",
            "s1Title": "1. Постачальник послуг та відповідальна особа (§ 5 DDG)",
            "dtName": "Ім’я / Організатор",
            "dtForm": "Правовий статус",
            "dtAddr": "Поштова адреса",
            "s2Title": "2. Контакти (швидкий електронний та безпосередній зв’язок)",
            "dtEmail": "Ел. пошта (Email)",
            "dtPhone": "Телефон",
            "dtTg": "Telegram (координація)",
            "s3Title": "3. Податковий номер (USt-IdNr.) та примітка",
            "s4Title": "4. Відповідальний за зміст згідно з § 18 ч. 2 MStV",
            "s5Title": "5. Попередній запис без зобов’язань та розмежування послуг",
            "s5Text": "На цьому сайті здійснюється виключно безкоштовний попередній запис без жодних зобов’язань на заплановані дати 2027 року. Через сайт не приймаються платежі та не укладаються зобов’язуючі договори. Запропонована програма охоплює лише авторські лекції, семінари та екскурсії; проїзд і проживання в готелі учасники бронюють і оплачують самостійно безпосередньо у постачальників (не є пакетним туром у розумінні §§ 651a ff. BGB).",
            "s6Title": "6. Вирішення спорів із споживачами (§ 36 VSBG)",
            "s6Text": "Ми не зобов’язані й не маємо наміру брати участь у процедурах врегулювання спорів перед органами споживчого арбітражу.",
            "s7Title": "7. Авторське право та походження зображень",
            "s7p1": "Історичні полотна, літографії, гравюри та дагеротипи XIX століття (Ф. О. Рунге, Ґ. Ґенслер, П. і К. Зур, Г. Біов, К. Ф. Штельцнер тощо) перебувають у суспільному надбанні (<strong>Public Domain</strong>).",
            "s7p2": f"Історико-архітектурні та літературні ілюстрації-реконструкції для Штутгарта створені спеціально для редакційного архіву цього проєкту. Усі авторські тексти, концепції маршрутів та портретні світлини захищені авторським правом {esc(entity)}.",
        },
    }[lang]

    head = render_head(
        data=data,
        lang=lang,
        url_lang=url_lang,
        root_prefix=root_prefix,
        title=copy["headTitle"],
        description=copy["headDesc"],
        canonical_url=canonical,
        page_subpath="impressum/",
        og_image="",
        json_ld_objects=[],
        include_maplibre=False,
        noindex=True,
    )

    body = f"""
<body data-page="legal" data-lang="{esc(lang)}" data-url-lang="{esc(url_lang)}" data-root="{esc(root_prefix)}">
{render_legal_header(data, lang, url_lang, root_prefix, "impressum", is_root_legal=is_root_legal)}
  <main class="legal-page">
    <div class="container">
      <div class="legal-card">
        <p class="eyebrow">{esc(copy['eyebrow'])}</p>
        <h1 class="section-title">{esc(copy['h1'])}</h1>
        <p class="section-lead">{esc(copy['lead'])}</p>
{lang_note_html}{banner_html}
        <section class="legal-section">
          <h2>{copy['s1Title']}</h2>
          <dl class="legal-dl">
            <div><dt>{esc(copy['dtName'])}</dt><dd>{esc(entity)}</dd></div>
            <div><dt>{esc(copy['dtForm'])}</dt><dd>{esc(legal_form_display)}</dd></div>
            <div><dt>{esc(copy['dtAddr'])}</dt><dd>{esc(street)}<br/>{esc(postal_city)}<br/>{esc(country_display)}</dd></div>
          </dl>
        </section>

        <section class="legal-section">
          <h2>{copy['s2Title']}</h2>
          <dl class="legal-dl">
            <div><dt>{esc(copy['dtEmail'])}</dt><dd><a href="mailto:{esc(email)}">{esc(email)}</a></dd></div>
            <div><dt>{esc(copy['dtPhone'])}</dt><dd><a href="tel:{esc(tel_clean)}">{esc(phone)}</a></dd></div>
            <div><dt>{esc(copy['dtTg'])}</dt><dd>@Grygoryshyn</dd></div>
          </dl>
        </section>

        <section class="legal-section">
          <h2>{copy['s3Title']}</h2>
          <p>{esc(vat_display)}</p>
        </section>

        <section class="legal-section">
          <h2>{copy['s4Title']}</h2>
          <p>{esc(editorial)}</p>
        </section>

        <section class="legal-section">
          <h2>{copy['s5Title']}</h2>
          <p>{copy['s5Text']}</p>
        </section>

        <section class="legal-section">
          <h2>{copy['s6Title']}</h2>
          <p>{esc(copy['s6Text'])}</p>
        </section>

        <section class="legal-section">
          <h2>{copy['s7Title']}</h2>
          <p>{copy['s7p1']}</p>
          <p>{copy['s7p2']}</p>
        </section>
      </div>
    </div>
  </main>
{render_footer_and_chrome(data, lang, url_lang, root_prefix, sticky_city=None, include_maplibre=False, is_root_legal=is_root_legal)}"""
    return head + body


def build_datenschutz_page(
    data: dict[str, Any],
    lang: str = "de",
    url_lang: str = "de",
    root_prefix: str = "../",
    is_root_legal: bool = False,
) -> str:
    cfg = data["siteConfig"]
    base_url = cfg["baseUrl"].rstrip("/")
    legal = data.get("legal") or {}
    an = cfg.get("analytics") or {}
    canonical = f"{base_url}/datenschutz/" if is_root_legal else f"{base_url}/{url_lang}/datenschutz/"

    entity = legal.get("entityName", "Sergii Grygoryshyn")
    street = legal.get("streetAddress", "")
    postal_city = legal.get("postalCity", "")
    email = legal.get("email", "")
    phone = legal.get("phone", "")
    tel_clean = _tel_href(phone)
    last_updated = legal.get("lastUpdated", "25.11.2026")
    hosting_provider = legal.get("hostingProvider", "GitHub Pages")

    has_umami = bool(an.get("umamiWebsiteId"))
    has_cf = bool(an.get("cloudflareToken"))
    analytics_names = " / ".join(
        name for flag, name in ((has_umami, "Umami Analytics"), (has_cf, "Cloudflare Web Analytics")) if flag
    )

    analytics_disclosure = {
        "de": (
            f"Zur statistischen Auswertung von Seitenaufrufen nutzen wir ausschließlich eine datenschutzfreundliche, cookie-freie Webanalyse ({analytics_names}), die ohne Speicherung personenbezogener Cookies auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO arbeitet."
            if analytics_names
            else "Derzeit sind auf dieser Website keine externen Analyse- oder Werbe-Tracker aktiv."
        ),
        "en": (
            f"For aggregated page-view statistics we exclusively use privacy-friendly, cookie-free analytics ({analytics_names}) without personal tracking cookies pursuant to Art. 6(1)(f) GDPR."
            if analytics_names
            else "No external analytics or advertising trackers are currently active on this website."
        ),
        "ru": (
            f"Для агрегированной статистики посещений используется только без-cookie веб-аналитика ({analytics_names}) без рекламных трекеров на основании ст. 6 абз. 1 лит. f GDPR."
            if analytics_names
            else "В настоящее время внешние системы веб-аналитики и рекламные трекеры на сайте отключены."
        ),
        "ua": (
            f"Для агрегованої статистики відвідувань використовується лише веб-аналітика без cookie ({analytics_names}) без рекламних трекерів на підставі ст. 6 ч. 1 літ. f GDPR."
            if analytics_names
            else "Наразі зовнішні системи веб-аналітики та рекламні трекери на сайті не активні."
        ),
    }[lang]

    de_href = f"{root_prefix}de/datenschutz/"
    lang_note_html = ""
    if lang != "de":
        notes = {
            "en": ("Note on language version: Under German law (GDPR / TDDDG), the German version is legally authoritative; this English translation is provided for your convenience.", "Open German version (DE) →"),
            "ru": ("О языковой версии: согласно законодательству Германии (GDPR / TDDDG), юридически обязывающей является немецкая версия; русский перевод предоставлен для удобства ознакомления.", "Открыть немецкую версию (DE) →"),
            "ua": ("Щодо мовної версії: відповідно до законодавства Німеччини (GDPR / TDDDG), юридично визначальною є німецька версія; український переклад надано для зручності ознайомлення.", "Відкрити німецьку версію (DE) →"),
        }[lang]
        lang_note_html = f"""
        <div class="legal-lang-note" role="note">
          <span>{esc(notes[0])}</span>
          <a href="{esc(de_href)}">{esc(notes[1])}</a>
        </div>"""

    country_display = {
        "de": legal.get("country", "Deutschland"),
        "en": "Germany (Deutschland)",
        "ru": "Германия (Deutschland)",
        "ua": "Німеччина (Deutschland)",
    }[lang]

    copy = {
        "de": {
            "headTitle": f"Datenschutzerklärung (DSGVO) · {entity}",
            "headDesc": "Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO und TDDDG.",
            "eyebrow": f"DATENSCHUTZ NACH DSGVO & TDDDG · STAND: {last_updated}",
            "h1": "Datenschutzerklärung",
            "lead": "Informationen zur Verarbeitung personenbezogener Daten beim Besuch dieser Website gemäß der Datenschutz-Grundverordnung (DSGVO) und § 25 TDDDG.",
            "s1Title": "1. Allgemeine Hinweise &amp; Verantwortlicher (Art. 4 Nr. 7 DSGVO)",
            "s1Meta": f'E-Mail: <a href="mailto:{esc(email)}">{esc(email)}</a> · Telefon: <a href="tel:{esc(tel_clean)}">{esc(phone)}</a>',
            "s2Title": "2. Hosting &amp; Server-Logfiles (Art. 6 Abs. 1 lit. f DSGVO)",
            "s2Text": f"Diese Website wird als statische Webanwendung über {esc(hosting_provider)} bereitgestellt. Beim Aufruf der Seiten erfasst der Hosting-Anbieter aus Gründen der technischen Sicherheit und Systemstabilität automatisch Server-Logfiles (IP-Adresse, Datum und Uhrzeit des Abrufs, aufgerufene URL, Browsertyp und Betriebssystem). Rechtsgrundlage ist unser berechtigtes Interesse an einer sicheren und stabilen Bereitstellung (Art. 6 Abs. 1 lit. f DSGVO). Soweit hierbei eine Übermittlung in die USA erfolgt, stützt sich diese auf das EU-U.S. Data Privacy Framework sowie Standardvertragsklauseln.",
            "s3Title": "3. Lokale Ressourcen: Schriftarten &amp; interaktive 3D-Karten",
            "s3p1": "<strong>Lokale Schriftarten:</strong> Alle verwendeten Schriftarten (<em>Cormorant Garamond</em>, <em>Literata</em>, <em>IBM Plex Mono</em>) werden vollständig lokal von unserem eigenen Webspace ausgeliefert. Es findet beim Seitenaufruf keine Verbindung zu externen Servern von Google (<code>fonts.googleapis.com</code> oder <code>fonts.gstatic.com</code>) und keine Weitergabe Ihrer IP-Adresse an Dritte statt.",
            "s3p2": "<strong>Lokale 3D-Vektorkarten (OpenStreetMap / ODbL):</strong> Sämtliche Vektorkarten-Daten, Schriften und JavaScript-Bibliotheken für die interaktive Deutschland- und Stadtansicht (MapLibre GL JS) liegen vollständig lokal auf unserem eigenen Webspace. Beim Laden und Nutzen der Karten werden keine Anfragen an Drittanbieter (wie Google Maps oder externe Tile-Server) ausgelöst und keine IP-Adressen an externe Kartendienste übertragen. Die Kartendaten basieren auf <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\" rel=\"noopener noreferrer\">OpenStreetMap-Mitwirkenden (ODbL)</a>.",
            "s4Title": "4. Unverbindliche Voranmeldung (Fahrkarte) &amp; Kontaktaufnahme",
            "s4p1": "Bei Nutzung des Voranmeldeformulars <em>Fahrkarte</em> verarbeiten wir die von Ihnen eingegebenen Daten (Name, Kontaktangabe, Wunschstadt, Personenanzahl, bevorzugte Gruppensprache sowie optionale Anmerkung) ausschließlich zur Bearbeitung Ihrer unverbindlichen Anfrage und zur Kontaktaufnahme (Art. 6 Abs. 1 lit. b bzw. Art. 6 Abs. 1 lit. a DSGVO).",
            "s4p2": "<strong>Hinweis zum technischen Versand über Telegram:</strong> Beim Absenden des Formulars wird der Anfragetext zur unmittelbaren Benachrichtigung an einen Telegram-Bot übermittelt (Messenger-Infrastruktur außerhalb des EWR). Wenn Sie diese Übermittlung nicht wünschen, senden Sie das Formular bitte nicht ab und kontaktieren Sie uns stattdessen direkt per E-Mail oder Telefon (siehe Abschnitt 1).",
            "s4p3": "Ihre Angaben werden gelöscht, sobald sie für die Beantwortung Ihrer Anfrage und die weitere Abstimmung nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten bestehen.",
            "s5Title": "5. Cookies, Browser-Speicher (§ 25 TDDDG) &amp; Webanalyse",
            "s5p1": "Diese Website verwendet <strong>keine Cookies</strong> und speichert keinerlei Tracking- oder Sitzungsdaten in <code>localStorage</code> oder <code>sessionStorage</code>. Es erfolgt kein geräteübergreifendes Tracking und kein Auslesen von Endgeräteinformationen zu Marketingzwecken; ein Cookie-Einwilligungsbanner ist nach § 25 Abs. 2 TDDDG nicht erforderlich.",
            "s6Title": "6. Ihre Rechte als betroffene Person (Art. 15–21 &amp; Art. 77 DSGVO)",
            "s6Text": "Sie haben jederzeit das Recht auf Auskunft über Ihre verarbeiteten personenbezogenen Daten (Art. 15 DSGVO), Berichtigung (Art. 16 DSGVO), Löschung (Art. 17 DSGVO), Einschränkung der Verarbeitung (Art. 18 DSGVO), Datenübertragbarkeit (Art. 20 DSGVO) sowie Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21 DSGVO). Eine erteilte Einwilligung können Sie jederzeit mit Wirkung für die Zukunft widerrufen. Darüber hinaus besteht ein Beschwerderecht bei einer zuständigen Datenschutz-Aufsichtsbehörde (Art. 77 DSGVO).",
            "s7Title": "7. Stand dieser Datenschutzerklärung",
            "s7Text": f"Diese Datenschutzerklärung entspricht dem aktuellen technischen Stand dieser Website (Stand: {esc(last_updated)}) und wird bei wesentlichen Änderungen unserer Datenverarbeitungsprozesse aktualisiert.",
        },
        "en": {
            "headTitle": f"Privacy Policy (GDPR) · {entity}",
            "headDesc": "Information on personal data processing under the GDPR and German TDDDG.",
            "eyebrow": f"PRIVACY POLICY UNDER GDPR & TDDDG · UPDATED: {last_updated}",
            "h1": "Privacy Policy (Datenschutzerklärung)",
            "lead": "Information on how personal data is processed on this website in accordance with the General Data Protection Regulation (GDPR) and § 25 TDDDG.",
            "s1Title": "1. General Information &amp; Data Controller (Art. 4(7) GDPR)",
            "s1Meta": f'Email: <a href="mailto:{esc(email)}">{esc(email)}</a> · Phone: <a href="tel:{esc(tel_clean)}">{esc(phone)}</a>',
            "s2Title": "2. Hosting &amp; Server Log Files (Art. 6(1)(f) GDPR)",
            "s2Text": f"This website is served as a static web application via {esc(hosting_provider)}. When you access pages, the hosting provider automatically records technical server log files (IP address, date and time of access, requested URL, browser type, and operating system) to ensure security and operational stability under Art. 6(1)(f) GDPR. Where US servers are involved, transfers rely on the EU-U.S. Data Privacy Framework and Standard Contractual Clauses.",
            "s3Title": "3. Locally Hosted Assets: Fonts &amp; Interactive 3D Maps",
            "s3p1": "<strong>Local Fonts:</strong> All typefaces (<em>Cormorant Garamond</em>, <em>Literata</em>, <em>IBM Plex Mono</em>) are hosted locally on our own web space. Loading any page triggers zero connections to Google servers (<code>fonts.googleapis.com</code> or <code>fonts.gstatic.com</code>) and transfers no IP address to third parties.",
            "s3p2": "<strong>Local 3D Vector Maps (OpenStreetMap / ODbL):</strong> All vector map tiles, map font glyphs, and MapLibre GL JS scripts for our Germany atlas and city maps are hosted completely locally on our own web space. Viewing or interacting with the maps triggers zero external requests (such as Google Maps or remote tile servers) and transfers no IP addresses to external map providers. Map data is based on <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\" rel=\"noopener noreferrer\">OpenStreetMap contributors (ODbL)</a>.",
            "s4Title": "4. Non-Binding Pre-Registration (Fahrkarte) &amp; Contact",
            "s4p1": "When you submit the <em>Fahrkarte</em> form, we process the information you provide (name, contact details, preferred city, number of seats, preferred group language, and optional comment) exclusively to process your non-binding inquiry and contact you (Art. 6(1)(b) and Art. 6(1)(a) GDPR).",
            "s4p2": "<strong>Notice regarding Telegram delivery:</strong> Upon submission, your request text is transmitted to a Telegram bot to notify the organizer (messenger infrastructure located outside the EEA). If you prefer not to use Telegram transmission, please do not submit the form and instead contact us directly by email or phone (see Section 1).",
            "s4p3": "Your inquiry data is erased as soon as it is no longer needed for handling your request and no statutory retention obligations apply.",
            "s5Title": "5. Cookies, Browser Storage (§ 25 TDDDG) &amp; Analytics",
            "s5p1": "This website sets <strong>no cookies</strong> and stores no tracking or session data in <code>localStorage</code> or <code>sessionStorage</code>. No cross-device tracking or marketing storage takes place; therefore, no cookie consent banner is required under § 25(2) TDDDG.",
            "s6Title": "6. Your Rights as a Data Subject (Art. 15–21 &amp; Art. 77 GDPR)",
            "s6Text": "You have the right at any time to access your processed personal data (Art. 15 GDPR), request rectification (Art. 16 GDPR), erasure (Art. 17 GDPR), restriction of processing (Art. 18 GDPR), data portability (Art. 20 GDPR), and object to processing based on legitimate interests (Art. 21 GDPR). You may withdraw given consent at any time with future effect and lodge a complaint with a competent data protection supervisory authority (Art. 77 GDPR).",
            "s7Title": "7. Version of This Privacy Policy",
            "s7Text": f"This Privacy Policy reflects the current technical operation of this website (as of {esc(last_updated)}) and will be updated whenever our data processing setup changes.",
        },
        "ru": {
            "headTitle": f"Политика конфиденциальности (GDPR) · {entity}",
            "headDesc": "Информация об обработке персональных данных согласно регламенту ЕС (GDPR) и закону Германии TDDDG.",
            "eyebrow": f"КОНФИДЕНЦИАЛЬНОСТЬ (GDPR & TDDDG) · РЕДАКЦИЯ ОТ: {last_updated}",
            "h1": "Политика конфиденциальности (Datenschutzerklärung)",
            "lead": "Сведения об обработке персональных данных при использовании этого сайта в соответствии с Общим регламентом по защите данных (GDPR) и § 25 TDDDG.",
            "s1Title": "1. Общие положения и ответственное лицо (ст. 4 п. 7 GDPR)",
            "s1Meta": f'Email: <a href="mailto:{esc(email)}">{esc(email)}</a> · Телефон: <a href="tel:{esc(tel_clean)}">{esc(phone)}</a>',
            "s2Title": "2. Хостинг и журналы сервера (ст. 6 абз. 1 лит. f GDPR)",
            "s2Text": f"Этот сайт размещён как статическое веб-приложение на базе {esc(hosting_provider)}. При обращении к страницам провайдер хостинга в целях технической безопасности и стабильности автоматически регистрирует серверные логи (IP-адрес, дата и время запроса, запрошенный URL, тип браузера и ОС). Правовое основание — законный интерес в безопасном функционировании сайта (ст. 6 абз. 1 лит. f GDPR). Если задействуются серверы в США, передача опирается на EU-U.S. Data Privacy Framework и стандартные договорные положения ЕС.",
            "s3Title": "3. Локальные ресурсы: шрифты и интерактивные 3D-карты",
            "s3p1": "<strong>Локальные шрифты:</strong> все используемые шрифты (<em>Cormorant Garamond</em>, <em>Literata</em>, <em>IBM Plex Mono</em>) загружаются исключительно с нашего собственного сервера. При открытии страниц не устанавливаются соединения с серверами Google (<code>fonts.googleapis.com</code> или <code>fonts.gstatic.com</code>) и ваш IP-адрес не передаётся третьим лицам.",
            "s3p2": "<strong>Локальные 3D-векторные карты (OpenStreetMap / ODbL):</strong> все векторные тайлы карты Германии и городов, шрифтовые глифы и библиотека MapLibre GL JS размещены полностью локально на нашем сервере. При открытии и просмотре карт не выполняется ни одного запроса к сторонним картографическим серверам (Google Maps, OpenFreeMap и т. д.), и ваш IP-адрес никуда не передаётся. Картографические данные основаны на материалах <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\" rel=\"noopener noreferrer\">участников OpenStreetMap (лицензия ODbL)</a>.",
            "s4Title": "4. Предварительная заявка (Fahrkarte) и обратная связь",
            "s4p1": "При заполнении и отправке формы <em>Fahrkarte</em> мы обрабатываем указанные вами сведения (имя, контакт, выбранный город, количество мест, язык группы и комментарий) исключительно для рассмотрения вашей необязывающей заявки и обратной связи (ст. 6 абз. 1 лит. b и лит. a GDPR).",
            "s4p2": "<strong>Уведомление о передаче через Telegram:</strong> после нажатия кнопки отправки текст заявки пересылается в Telegram-бот для оповещения организатора (инфраструктура мессенджера расположена за пределами ЕЭЗ). Если вы не хотите использовать передачу в Telegram, пожалуйста, не отправляйте форму и свяжитесь с нами напрямую по электронной почте или телефону (см. раздел 1).",
            "s4p3": "Ваши данные удаляются сразу после того, как необходимость в них для обработки запроса и согласования деталей отпадает и отсутствуют установленные законом сроки хранения.",
            "s5Title": "5. Файлы cookie, хранилище браузера (§ 25 TDDDG) и веб-аналитика",
            "s5p1": "Сайт <strong>не использует cookie</strong> и не сохраняет данные отслеживания или сессии в <code>localStorage</code> либо <code>sessionStorage</code>. Устройства пользователей не считываются в маркетинговых целях, поэтому баннер согласия на cookie согласно § 25 абз. 2 TDDDG не требуется.",
            "s6Title": "6. Ваши права как субъекта данных (ст. 15–21 и ст. 77 GDPR)",
            "s6Text": "Вы вправе в любое время запросить доступ к вашим персональным данным (ст. 15 GDPR), их исправление (ст. 16 GDPR), удаление (ст. 17 GDPR), ограничение обработки (ст. 18 GDPR), переносимость (ст. 20 GDPR), а также возразить против обработки на основании законного интереса (ст. 21 GDPR). Согласие можно отозвать в любой момент на будущее; также вы вправе подать жалобу в компетентный надзорный орган по защите данных (ст. 77 GDPR).",
            "s7Title": "7. Актуальность настоящей политики",
            "s7Text": f"Настоящая Политика конфиденциальности отражает фактическую техническую работу сайта (по состоянию на {esc(last_updated)}) и обновляется при изменении процессов обработки данных.",
        },
        "ua": {
            "headTitle": f"Політика конфіденційності (GDPR) · {entity}",
            "headDesc": "Інформація про обробку персональних даних згідно з регламентом ЄС (GDPR) та німецьким законом TDDDG.",
            "eyebrow": f"КОНФІДЕНЦІЙНІСТЬ (GDPR & TDDDG) · РЕДАКЦІЯ ВІД: {last_updated}",
            "h1": "Політика конфіденційності (Datenschutzerklärung)",
            "lead": "Відомості про обробку персональних даних під час користування цим сайтом відповідно до Загального регламенту про захист даних (GDPR) та § 25 TDDDG.",
            "s1Title": "1. Загальні положення та відповідальна особа (ст. 4 п. 7 GDPR)",
            "s1Meta": f'Email: <a href="mailto:{esc(email)}">{esc(email)}</a> · Телефон: <a href="tel:{esc(tel_clean)}">{esc(phone)}</a>',
            "s2Title": "2. Хостинг і журнали сервера (ст. 6 ч. 1 літ. f GDPR)",
            "s2Text": f"Цей сайт розміщено як статичний вебзастосунок на базі {esc(hosting_provider)}. Під час відкриття сторінок провайдер хостингу з міркувань технічної безпеки та стабільності автоматично реєструє серверні логи (IP-адресу, дату й час запиту, URL, тип браузера та ОС). Правова підстава — законний інтерес у безпечному функціонуванні сайту (ст. 6 ч. 1 літ. f GDPR). Якщо задіяні сервери у США, передача спирається на EU-U.S. Data Privacy Framework і стандартні договірні положення ЄС.",
            "s3Title": "3. Локальні ресурси: шрифти та інтерактивні 3D-карти",
            "s3p1": "<strong>Локальні шрифти:</strong> усі використовувані шрифти (<em>Cormorant Garamond</em>, <em>Literata</em>, <em>IBM Plex Mono</em>) завантажуються виключно з нашого власного сервера. Під час відкриття сторінок не відбувається жодних підключень до серверів Google (<code>fonts.googleapis.com</code> або <code>fonts.gstatic.com</code>) і ваша IP-адреса не передається третім особам.",
            "s3p2": "<strong>Локальні 3D-векторні карти (OpenStreetMap / ODbL):</strong> усі векторні тайли карти Німеччини й міст, шрифтові гліфи та бібліотека MapLibre GL JS розміщені повністю локально на нашому сервері. Під час відкриття та перегляду карт не здійснюється жодного запиту до сторонніх картографічних серверів (Google Maps, OpenFreeMap тощо), і ваша IP-адреса нікуди не передається. Картографічні дані базуються на матеріалах <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\" rel=\"noopener noreferrer\">учасників OpenStreetMap (ліцензія ODbL)</a>.",
            "s4Title": "4. Попередня заявка (Fahrkarte) та зворотний зв’язок",
            "s4p1": "Під час заповнення та надсилання форми <em>Fahrkarte</em> ми обробляємо зазначені вами відомості (ім’я, контакт, обране місто, кількість місць, мова групи та коментар) виключно для опрацювання вашого попереднього запиту без зобов’язань та зворотного зв’язку (ст. 6 ч. 1 літ. b і літ. a GDPR).",
            "s4p2": "<strong>Повідомлення щодо передачі через Telegram:</strong> після натискання кнопки надсилання текст заявки пересилається до Telegram-бота для сповіщення організатора (інфраструктура месенджера розташована за межами ЄЕЗ). Якщо ви не бажаєте використовувати передачу через Telegram, не надсилайте форму, а зверніться до нас безпосередньо електронною поштою або телефоном (див. розділ 1).",
            "s4p3": "Ваші дані видаляються одразу після того, як потреба в них для опрацювання запиту й узгодження деталей відпадає та відсутні законодавчі строки зберігання.",
            "s5Title": "5. Файли cookie, сховище браузера (§ 25 TDDDG) та вебаналітика",
            "s5p1": "Сайт <strong>не використовує cookie</strong> і не зберігає дані відстеження чи сесії в <code>localStorage</code> або <code>sessionStorage</code>. Пристрої користувачів не зчитуються з маркетинговою метою, тому банер згоди на cookie за § 25 ч. 2 TDDDG не потрібен.",
            "s6Title": "6. Ваші права як суб’єкта даних (ст. 15–21 та ст. 77 GDPR)",
            "s6Text": "Ви маєте право в будь-який час запросити доступ до своїх персональних даних (ст. 15 GDPR), їх виправлення (ст. 16 GDPR), видалення (ст. 17 GDPR), обмеження обробки (ст. 18 GDPR), перенесення даних (ст. 20 GDPR), а також заперечити проти обробки на підставі законного інтересу (ст. 21 GDPR). Надану згоду можна відкликати у будь-який момент на майбутнє, а також подати скаргу до компетентного органу нагляду за захистом даних (ст. 77 GDPR).",
            "s7Title": "7. Актуальність цієї політики",
            "s7Text": f"Ця Політика конфіденційності відображає фактичну технічну роботу сайту (станом на {esc(last_updated)}) та оновлюється у разі зміни процесів обробки даних.",
        },
    }[lang]

    head = render_head(
        data=data,
        lang=lang,
        url_lang=url_lang,
        root_prefix=root_prefix,
        title=copy["headTitle"],
        description=copy["headDesc"],
        canonical_url=canonical,
        page_subpath="datenschutz/",
        og_image="",
        json_ld_objects=[],
        include_maplibre=False,
        noindex=True,
    )

    body = f"""
<body data-page="legal" data-lang="{esc(lang)}" data-url-lang="{esc(url_lang)}" data-root="{esc(root_prefix)}">
{render_legal_header(data, lang, url_lang, root_prefix, "datenschutz", is_root_legal=is_root_legal)}
  <main class="legal-page">
    <div class="container">
      <div class="legal-card">
        <p class="eyebrow">{esc(copy['eyebrow'])}</p>
        <h1 class="section-title">{esc(copy['h1'])}</h1>
        <p class="section-lead">{esc(copy['lead'])}</p>
{lang_note_html}
        <section class="legal-section">
          <h2>{copy['s1Title']}</h2>
          <p><strong>{esc(entity)}</strong><br/>
          {esc(street)}, {esc(postal_city)}, {esc(country_display)}<br/>
          {copy['s1Meta']}</p>
        </section>

        <section class="legal-section">
          <h2>{copy['s2Title']}</h2>
          <p>{copy['s2Text']}</p>
        </section>

        <section class="legal-section">
          <h2>{copy['s3Title']}</h2>
          <p>{copy['s3p1']}</p>
          <p>{copy['s3p2']}</p>
        </section>

        <section class="legal-section">
          <h2>{copy['s4Title']}</h2>
          <p>{copy['s4p1']}</p>
          <p>{copy['s4p2']}</p>
          <p>{copy['s4p3']}</p>
        </section>

        <section class="legal-section">
          <h2>{copy['s5Title']}</h2>
          <p>{copy['s5p1']}</p>
          <p>{esc(analytics_disclosure)}</p>
        </section>

        <section class="legal-section">
          <h2>{copy['s6Title']}</h2>
          <p>{copy['s6Text']}</p>
        </section>

        <section class="legal-section">
          <h2>{copy['s7Title']}</h2>
          <p>{copy['s7Text']}</p>
        </section>
      </div>
    </div>
  </main>
{render_footer_and_chrome(data, lang, url_lang, root_prefix, sticky_city=None, include_maplibre=False, is_root_legal=is_root_legal)}"""
    return head + body


def write_sitemap(data: dict[str, Any]) -> None:
    base = data["siteConfig"]["baseUrl"].rstrip("/")
    today = date.today().isoformat()
    entries = []

    def add_url(loc_url: str, page_subpath: str, priority: str) -> None:
        alts = "\n".join(
            f'    <xhtml:link rel="alternate" hreflang="{u}" href="{base}/{u}/{page_subpath}"/>'
            for _, u, _ in LANGS
        )
        entries.append(
            f"""  <url>
    <loc>{loc_url}</loc>
    <lastmod>{today}</lastmod>
    <priority>{priority}</priority>
{alts}
  </url>"""
        )

    add_url(f"{base}/", "", "1.0")
    for _, u_lang, _ in LANGS:
        add_url(f"{base}/{u_lang}/", "", "0.95")
        for c in data["cities"]:
            prio = "0.9" if not c.get("isLabStub") else "0.7"
            add_url(f"{base}/{u_lang}/{c['id']}/", f"{c['id']}/", prio)

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
        'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
        + "\n".join(entries)
        + "\n</urlset>\n"
    )
    (ROOT / "sitemap.xml").write_text(xml, encoding="utf-8")


def write_robots(data: dict[str, Any]) -> None:
    base = data["siteConfig"]["baseUrl"].rstrip("/")
    txt = f"""User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

Sitemap: {base}/sitemap.xml
"""
    (ROOT / "robots.txt").write_text(txt, encoding="utf-8")


def write_llms_txt(data: dict[str, Any]) -> None:
    base = data["siteConfig"]["baseUrl"].rstrip("/")
    lines = [
        "# Sergii Grygoryshyn — Philosophical & Cultural Expeditions in Germany (2027)",
        "",
        "> Intimate 4-day / 3-night philosophical, literary, and art-historical expeditions across Germany led by PhD philosopher Sergii Grygoryshyn. Private central conference hall for morning and evening lectures, officially registered museum visits, and independent hotel booking by participants. Available in English, German, Russian, and Ukrainian.",
        "",
        f"- Author & Scholar: Sergii Grygoryshyn, PhD ({data['meta']['publicationsUrl']})",
        "- Format: 4 days / 3 nights, small group of 4–10 guests, pre-registration without upfront payment",
        "- Telegram Organizer: @Grygoryshyn",
        "",
        "## Curatorial Lines (Series)",
    ]
    for t in data["tracks"]:
        lines.append(f"- **{t['nameEn']}** ({t['nameDe']} / {t['nameRu']}): {t['manifestoEn']}")

    lines.append("")
    lines.append("## 2027 Expedition Cities & Direct Pages")
    for c in data["cities"]:
        trk = get_track(data, c["trackId"])
        lines.append(f"### №{c['issueNo']} {c['nameEn']} ({c['nameRu']} / {c['nameDe']}) — {c['datesEn']}")
        lines.append(f"- Track: {trk['nameEn']}")
        lines.append(f"- Theme: {c['titleEn']} / {c['titleRu']}")
        lines.append(f"- Summary: {c['subtitleEn']}")
        lines.append(f"- URLs: [EN]({base}/en/{c['id']}/) · [DE]({base}/de/{c['id']}/) · [RU]({base}/ru/{c['id']}/) · [UK]({base}/uk/{c['id']}/)")
        lms = (c.get("cityMap") or {}).get("landmarks") or []
        if lms:
            lines.append("- Key Landmarks & Museums: " + "; ".join(f"{lm['nameEn']}" for lm in lms))
        lines.append("")

    (ROOT / "llms.txt").write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    data = json.loads(CONTENT_PATH.read_text(encoding="utf-8"))

    # 1. Sync data.js mirror from content.json (strip client token if hidden or serverless endpoint active)
    js_data = copy.deepcopy(data)
    cfg = js_data.get("siteConfig") or {}
    if cfg.get("hideClientBotToken") or cfg.get("formEndpoint"):
        bot_cfg = (js_data.get("meta") or {}).get("telegramBot")
        if isinstance(bot_cfg, dict) and "token" in bot_cfg:
            bot_cfg["token"] = ""

    data_js_banner = (
        "/**\n"
        " * AUTO-GENERATED FROM content.json BY build.py — DO NOT EDIT DIRECTLY.\n"
        " * Edit content.json and run `python build.py` (or double-click rebuild.bat).\n"
        " */\n"
        "window.EXPEDITIONS_DATA = "
    )
    (ROOT / "data.js").write_text(
        data_js_banner + json.dumps(js_data, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )

    # 2. Generate root index.html (EN default)
    (ROOT / "index.html").write_text(
        build_home_page(data, "en", "en", "", is_root_alias=True),
        encoding="utf-8",
    )

    generated = 1

    # 3. Generate localized Homes + 24 individual City Pages + 8 localized legal pages
    for lang, url_lang, _ in LANGS:
        lang_dir = ROOT / url_lang
        lang_dir.mkdir(parents=True, exist_ok=True)
        (lang_dir / "index.html").write_text(
            build_home_page(data, lang, url_lang, "../", is_root_alias=False),
            encoding="utf-8",
        )
        generated += 1

        for city in data["cities"]:
            c_dir = lang_dir / city["id"]
            c_dir.mkdir(parents=True, exist_ok=True)
            (c_dir / "index.html").write_text(
                build_city_page(data, city, lang, url_lang, "../../"),
                encoding="utf-8",
            )
            generated += 1

        imp_dir = lang_dir / "impressum"
        imp_dir.mkdir(parents=True, exist_ok=True)
        (imp_dir / "index.html").write_text(
            build_impressum_page(data, lang=lang, url_lang=url_lang, root_prefix="../../", is_root_legal=False),
            encoding="utf-8",
        )
        generated += 1

        ds_dir = lang_dir / "datenschutz"
        ds_dir.mkdir(parents=True, exist_ok=True)
        (ds_dir / "index.html").write_text(
            build_datenschutz_page(data, lang=lang, url_lang=url_lang, root_prefix="../../", is_root_legal=False),
            encoding="utf-8",
        )
        generated += 1

    # 4. Generate root canonical German legal pages (/impressum/ & /datenschutz/)
    (ROOT / "impressum").mkdir(parents=True, exist_ok=True)
    (ROOT / "impressum" / "index.html").write_text(
        build_impressum_page(data, lang="de", url_lang="de", root_prefix="../", is_root_legal=True),
        encoding="utf-8",
    )
    generated += 1

    (ROOT / "datenschutz").mkdir(parents=True, exist_ok=True)
    (ROOT / "datenschutz" / "index.html").write_text(
        build_datenschutz_page(data, lang="de", url_lang="de", root_prefix="../", is_root_legal=True),
        encoding="utf-8",
    )
    generated += 1

    # 5. Generate SEO & AI discovery root files
    write_sitemap(data)
    write_robots(data)
    write_llms_txt(data)

    print(f"Built {generated} static HTML pages + data.js + sitemap.xml + robots.txt + llms.txt successfully!")


if __name__ == "__main__":
    main()
