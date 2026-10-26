# Troubleshooting

## "invalid JSON" but it works in Google's tool

Google's parser is lenient with some errors, such as trailing commas. Other consumers are not — fix the JSON.

## "the JSON is HTML-entity encoded"

Your template escapes the output (`&quot;` instead of `"`). Output raw JSON inside the script tag, with only `</` escaped.

## No JSON-LD found, but my CMS adds it

It may be injected by JavaScript. Google can render it, but this tool reads server HTML. Save the rendered page and use `--file`.

## Still stuck?

Open an [issue](https://github.com/ksanyok/schema-validator/issues/new/choose) with the command, the output (`--json` if possible) and your Node.js version — or compare with the [online version](https://promopilot.link/en/tools/schema-validator.php?utm_source=github&utm_medium=repo&utm_campaign=tools&utm_content=schema-validator).
