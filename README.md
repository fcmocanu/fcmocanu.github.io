# fcmocanu.github.io

A deliberately small Jekyll site, built by GitHub Pages straight from this branch (no Actions, no theme gem).

```
_config.yml            name, links, nav
index.html             about + research + recent papers
publications/          full list, filterable by topic
cv/                    short web CV
_data/publications.yml generated from the CV's BibTeX
_layouts/, _includes/  one layout, two includes
assets/                style.css, lattice.js (the logo that melts on hover), favicon
scripts/bib2yml.py     BibTeX -> _data/publications.yml
```

## Updating publications

The CV repo (`fcmocanu/CV`) is the source of truth.

```sh
python3 scripts/bib2yml.py ../CV/publications/pubs.bib
```

Topics for the filter are guessed from titles; override any in `TOPIC_OVERRIDES` in the script.

## Previewing locally

```sh
bundle install
bundle exec jekyll serve   # http://localhost:4000
```
