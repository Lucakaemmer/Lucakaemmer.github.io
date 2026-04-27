"""
Fetches publications from a Google Scholar profile and inserts new entries
into publications.html between the HTML comment markers.

Usage: python scripts/fetch_publications.py
"""

import json
import re
import sys
import time
from pathlib import Path

import requests
from bs4 import BeautifulSoup

SCHOLAR_URL = (
    "https://scholar.google.com/citations"
    "?user=UzZ-Sy4AAAAJ&sortby=pubdate&pagesize=100&hl=en"
)
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

REPO_ROOT = Path(__file__).parent.parent
HTML_FILE = REPO_ROOT / "publications.html"
JSON_FILE = REPO_ROOT / "scripts" / "publications.json"

# Name variants to highlight with pub-me class
NAME_VARIANTS = [
    r"K[äa]mmer,?\s+L\.?",
    r"L\.?\s+K[äa]mmer",
    r"Kaemmer,?\s+L\.?",
    r"L\.?\s+Kaemmer",
]

# Heuristic keywords that suggest a conference rather than journal
CONFERENCE_KEYWORDS = [
    "conference", "symposium", "workshop", "proceedings", "annual meeting",
    "journal of vision", "vsss", "vss", "ccn", "caos", "caos conference",
    "cognitive computational", "vision sciences", "neural information",
    "neurips", "icml", "iclr", "cvpr", "eccv", "iccv",
]


def normalize(title: str) -> str:
    return re.sub(r"[^\w\s]", "", title.lower()).strip()


def is_conference(venue: str) -> bool:
    v = venue.lower()
    return any(kw in v for kw in CONFERENCE_KEYWORDS)


def make_venue_tag(venue: str) -> str:
    """Extract a short tag from venue string."""
    venue = venue.strip().rstrip(",.")
    # Use the first meaningful part before a comma or parenthesis
    tag = re.split(r"[,(]", venue)[0].strip()
    # Abbreviate long names
    if len(tag) > 12:
        words = tag.split()
        tag = "".join(w[0].upper() for w in words if w[0].isupper()) or tag[:10]
    return tag or venue[:10]


def highlight_author(authors: str) -> str:
    """Wrap Luca's name in pub-me span."""
    for pattern in NAME_VARIANTS:
        authors = re.sub(
            pattern,
            lambda m: f'<span class="pub-me">{m.group()}</span>',
            authors,
        )
    return authors


def build_pub_item(title: str, authors: str, tag: str) -> str:
    authors_html = highlight_author(authors)
    return (
        "            <li class=\"pub-item\">\n"
        "              <div class=\"pub-content\">\n"
        "                <div class=\"pub-main\">\n"
        f"                  <span class=\"pub-title\">{title}</span>\n"
        f"                  <span class=\"pub-authors\">{authors_html}</span>\n"
        "                </div>\n"
        "                <div class=\"pub-meta\">\n"
        f"                  <span class=\"pub-note\">{tag}</span>\n"
        "                </div>\n"
        "              </div>\n"
        "            </li>"
    )


def build_year_group(year: int, items_html: str) -> str:
    return (
        f"        <div class=\"pub-year-group\">\n"
        f"          <h4 class=\"pub-year-label\">{year}</h4>\n"
        f"          <ul class=\"pub-list\">\n"
        f"{items_html}\n"
        f"          </ul>\n"
        f"        </div>"
    )


def insert_into_section(section_html: str, year: int, item_html: str) -> str:
    """
    Insert item_html into the correct year group within section_html.
    Creates a new year group if the year doesn't exist, maintaining
    reverse-chronological order.
    """
    year_label = f'<h4 class="pub-year-label">{year}</h4>'

    if year_label in section_html:
        # Append to existing year group's pub-list
        closing = f"          </ul>\n        </div>"
        # Find the right year group's closing tag
        idx = section_html.index(year_label)
        close_idx = section_html.index(closing, idx)
        insert_at = close_idx
        return (
            section_html[:insert_at]
            + item_html + "\n"
            + section_html[insert_at:]
        )
    else:
        # Create a new year group and insert in the right position
        new_group = build_year_group(year, item_html)
        # Find where to insert (after groups with higher years, before lower)
        year_pattern = re.compile(r'<h4 class="pub-year-label">(\d{4})</h4>')
        groups = list(year_pattern.finditer(section_html))
        insert_pos = len(section_html)  # default: append at end
        for match in groups:
            if int(match.group(1)) < year:
                # Found a year smaller than ours — insert before it
                # Find the start of this pub-year-group div
                group_start = section_html.rfind(
                    '        <div class="pub-year-group">', 0, match.start()
                )
                if group_start != -1:
                    insert_pos = group_start
                break
        return (
            section_html[:insert_pos]
            + new_group + "\n"
            + section_html[insert_pos:]
        )


def fetch_scholar() -> list[dict]:
    print("Fetching Google Scholar profile...")
    try:
        resp = requests.get(SCHOLAR_URL, headers=HEADERS, timeout=20)
    except requests.RequestException as e:
        print(f"Network error: {e}")
        return []

    if resp.status_code != 200:
        print(f"Blocked or error — HTTP {resp.status_code}. Skipping.")
        return []

    soup = BeautifulSoup(resp.text, "html.parser")
    rows = soup.select("tr.gsc_a_tr")

    if not rows:
        print("No publication rows found — Scholar may have blocked the request.")
        return []

    print(f"Found {len(rows)} publications on Scholar.")
    pubs = []
    for row in rows:
        title_el = row.select_one("a.gsc_a_at")
        gray_els = row.select("div.gs_gray")
        year_el = row.select_one("td.gsc_a_y span.gsc_a_h")

        if not title_el:
            continue

        title = title_el.get_text(strip=True)
        authors = gray_els[0].get_text(strip=True) if len(gray_els) > 0 else ""
        venue = gray_els[1].get_text(strip=True) if len(gray_els) > 1 else ""
        year_str = year_el.get_text(strip=True) if year_el else ""
        year = int(year_str) if year_str.isdigit() else None

        pubs.append({
            "title": title,
            "authors": authors,
            "venue": venue,
            "year": year,
            "type": "conference" if is_conference(venue) else "journal",
        })

    return pubs


def main():
    data = json.loads(JSON_FILE.read_text())
    known = set(data["known_titles"])

    pubs = fetch_scholar()
    if not pubs:
        sys.exit(0)

    html = HTML_FILE.read_text(encoding="utf-8")

    # Extract the two managed sections
    def extract_section(marker: str) -> tuple[str, int, int]:
        begin = f"<!-- BEGIN:{marker} -->"
        end = f"<!-- END:{marker} -->"
        start = html.index(begin) + len(begin)
        stop = html.index(end)
        return html[start:stop], start, stop

    journal_content, j_start, j_end = extract_section("journal-articles")
    conf_content, c_start, c_end = extract_section("conference-contributions")

    new_titles = []
    changed = False

    for pub in pubs:
        norm = normalize(pub["title"])
        if norm in known:
            continue

        year = pub["year"]
        if year is None:
            print(f"Skipping (no year): {pub['title']}")
            continue

        tag = make_venue_tag(pub["venue"]) if pub["venue"] else "—"
        item_html = build_pub_item(pub["title"], pub["authors"], tag)

        if pub["type"] == "journal":
            journal_content = insert_into_section(journal_content, year, item_html)
            section_label = "Journal Articles"
        else:
            conf_content = insert_into_section(conf_content, year, item_html)
            section_label = "Conference Contributions"

        print(f"Added [{section_label} {year}]: {pub['title']}")
        new_titles.append(norm)
        changed = True

    if not changed:
        print("No new publications found.")
        sys.exit(0)

    # Rebuild HTML with updated sections (offsets shift after first replacement,
    # so rebuild from the original string using the stored indices)
    begin_j = "<!-- BEGIN:journal-articles -->"
    end_j = "<!-- END:journal-articles -->"
    begin_c = "<!-- BEGIN:conference-contributions -->"
    end_c = "<!-- END:conference-contributions -->"

    html = (
        html[: html.index(begin_j) + len(begin_j)]
        + journal_content
        + html[html.index(end_j):]
    )
    html = (
        html[: html.index(begin_c) + len(begin_c)]
        + conf_content
        + html[html.index(end_c):]
    )

    HTML_FILE.write_text(html, encoding="utf-8")

    data["known_titles"].extend(new_titles)
    JSON_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False))

    print(f"Done — added {len(new_titles)} new publication(s).")


if __name__ == "__main__":
    main()
