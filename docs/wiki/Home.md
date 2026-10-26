# Schema Validator

`schema-validator` pulls every `<script type="application/ld+json">` block out of a page (or reads a `.jsonld` file), parses it, walks nested objects and `@graph`, and checks each typed node against the properties Google requires and recommends for rich results. It also validates the values that most often break eligibility: ISO 8601 dates and durations, prices with currency symbols or thousands separators, lowercase currency codes, relative image URLs, ratings outside their scale and breadcrumb positions out of order.

- **[Getting started](Getting-Started)** — install, first run, reading the output
- **[FAQ](FAQ)** — common questions
- **[Troubleshooting](Troubleshooting)** — errors and how to fix them

Prefer a browser? The same check runs online at **[PromoPilot](https://promopilot.link/en/tools/schema-validator.php?utm_source=github&utm_medium=repo&utm_campaign=tools&utm_content=schema-validator)** — free, no sign-up.
