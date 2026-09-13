# Marketing Reference

**Live at <https://davlatshermatov.github.io/Test-website/>**

A static, mobile-first reference site for marketers: strategy frameworks, a
19-channel comparison, 43 metric formulas, six working calculators, copy-ready
playbooks and a 153-term searchable glossary.

No build step, no framework, no package manager, no third-party requests.
Open `index.html` in a browser and it works.

## Pages

| File | What's in it |
| --- | --- |
| `index.html` | Overview, the funnel, rules of thumb, and how to read the numbers |
| `fundamentals.html` | 4 Ps / 7 Ps, STP, positioning, JTBD, funnel models, brand vs performance, SWOT / Porter / PESTEL, pricing, product–market fit |
| `channels.html` | 19 channels compared on cost model, time to results and failure mode; how to choose by customer value; cost ranges; attribution reality |
| `metrics.html` | 43 formulas across 36 metrics, grouped by funnel stage, each with its target range and the way it gets misread |
| `calculators.html` | Unit economics, break-even ROAS, funnel model, A/B significance, sample size planner, email campaign value |
| `playbooks.html` | Campaign brief, launch checklist, landing page audit, deliverability checks, SEO audit, creative testing, customer interviews, operating cadence, first 90 days |
| `glossary.html` | 153 searchable, category-filterable terms |

Assets live in `assets/css/styles.css` and `assets/js/`.

## Running it

Any static file server works. The calculators and glossary also work from
`file://`, but a server is closer to production:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploying

Already deployed. `.github/workflows/deploy-pages.yml` publishes to GitHub Pages
on every push to `claude/marketing-info-website-35ijih`, which is this repo's
default branch. There is no build step — the workflow uploads the repository
root as-is.

The workflow uses `actions/configure-pages` with `enablement: true`, so it
created the Pages site itself on its first run. Nothing needs clicking in
Settings.

`sitemap.xml`, `robots.txt` and the Open Graph / Twitter tags are all built
around the base URL `https://davlatshermatov.github.io/Test-website/`. **If you
move this to a custom domain or rename the repo, those absolute URLs all need
updating** — they're in the `<head>` of each page, in `sitemap.xml` and in
`robots.txt`. `.nojekyll` is present so a branch-based Pages build would also
serve the files untouched.

The social card at `assets/og-image.png` is a 1200×630 render; regenerate it if
the headline numbers change.

## How it's built

Deliberate constraints, and why:

- **No build step.** The HTML you edit is the HTML that ships. Anyone can
  change a benchmark without installing Node.
- **No CDN, no external fonts.** Zero third-party requests and zero cookies —
  verified in a browser, not assumed. A system font stack renders instantly and
  cannot be blocked.
- **Progressive enhancement.** Every page is fully readable with JavaScript
  disabled. The nav starts expanded in the HTML and JS collapses it, so a
  no-JS visitor can still reach every page. The glossary is the one exception
  (its whole purpose is search); it says so in a `<noscript>` block and points
  at the metrics page for the same formulas.
- **Theming.** Colour tokens are CSS custom properties. The site follows the OS
  theme by default; a toggle overrides it and persists in `localStorage`, and a
  small inline script in each `<head>` applies the stored value before first
  paint so there's no flash. Every `localStorage` access is wrapped in
  `try`/`catch` — it throws in some private-browsing modes.
- **Calculators run locally.** Nothing entered is sent anywhere. Each ships
  with realistic default values so the page is useful before you type.
- **Glossary is data, not markup.** `assets/js/glossary.js` holds one array of
  `{ t, c, d, f }` objects. Search, category chips and the result count all
  derive from it, so adding a term is one line. Entries render through DOM APIs
  rather than `innerHTML`.

## Editing the content

- **Text, tables, checklists** — edit the HTML directly. The header and footer
  are duplicated across the seven pages; that's the cost of having no build
  step, and it's a deliberate trade.
- **Glossary terms** — add an object to the `TERMS` array in
  `assets/js/glossary.js`. Set `c` to an existing category or a new one (the
  filter chips are generated from the data). `f` is optional.
- **Calculators** — each is a function in `assets/js/calculators.js` wired to a
  `<section class="calc" id="…">`. Inputs are read by element id; outputs are
  written to `.r-value` spans by id.

## About the benchmark numbers

Every range on this site is presented as a **directional range compiled from
publicly reported industry data**, never as a target. That framing is
deliberate: published marketing benchmarks mix wildly different business
models, age quickly, and come from self-selected samples.

If you replace any of them, keep the caveat. A benchmark quoted without one is
how teams end up optimising toward someone else's business.

## Verification

Checked before shipping rather than assumed:

- Every page parses with balanced tags, no duplicate ids, no `<label for>`
  pointing at a missing input, and every internal link and anchor resolving.
- Rendered in Chromium at 390×844: no page scrolls horizontally, the nav
  collapses, and no tap target is under 38px. Wide tables scroll inside their
  own container.
- All six calculators verified against independent Python implementations. The
  A/B test is a two-proportion z-test; the normal CDF uses the
  Abramowitz & Stegun 7.1.26 `erf` approximation (max error ~1.4e-7, which is
  five orders of magnitude below the four decimal places shown).
- Glossary: 153 terms, no duplicates, sorted, search and category filter
  exercised in a real browser.
- Zero third-party requests and zero cookies across all seven pages.
- Canonical, Open Graph and Twitter tags on every page, each with a unique
  canonical URL; `sitemap.xml` parses as well-formed XML.
