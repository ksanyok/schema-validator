# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-10-26

### Added
- `schema-validator` CLI for URLs, local HTML and `.json`/`.jsonld` files, with `--types`, `--json` and `--strict`
- JSON-LD extraction with line numbers, CDATA/comment wrappers and detection of HTML-entity-encoded JSON
- Rules for 25+ rich result types and their common subtypes (NewsArticle, BlogPosting, Restaurant, Store…), with required and recommended properties
- Value checks: ISO 8601 dates and durations, numeric prices, ISO 4217 currencies, absolute URLs, ItemAvailability, rating ranges, breadcrumb positions
- Microdata and RDFa detection, example page with typical mistakes
- Library API (`validateUrl`, `validateHtml`, `validateJsonLd`, `extractJsonLd`, `RULES`) and GitHub Action

[1.0.0]: https://github.com/ksanyok/schema-validator/releases/tag/v1.0.0
