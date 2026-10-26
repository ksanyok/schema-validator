# Getting started

## Requirements

Node.js 18 or newer. No other dependencies.

## Install

```bash
# one-off run
npx github:ksanyok/schema-validator https://example.com/product

# global CLI
npm install -g github:ksanyok/schema-validator

# as a library in your project
npm install github:ksanyok/schema-validator
```

## First run

```bash
schema-validator https://example.com/product
```

The header shows the number of JSON-LD blocks and the top-level types. Each problem is prefixed with the block number and the JSON path of the node (`[#1 offers]`), so you can find it in the source. `✖` errors make the item ineligible for rich results, `!` warnings are recommended improvements.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | No errors (warnings allowed unless `--strict`) |
| 1 | Errors found (or warnings with `--strict`) |
| 2 | Bad arguments or the check could not run |

## More examples

**Validate a local page or the bundled example**

```bash
schema-validator --file examples/product.html
```

**Validate a JSON-LD file from your build**

```bash
schema-validator --file dist/schema/product.jsonld --strict
```

**List every typed node**

```bash
schema-validator https://example.com/recipe --types
```

## Without installing anything

Use the [online Schema Validator](https://promopilot.link/en/tools/schema-validator.php?utm_source=github&utm_medium=repo&utm_campaign=tools&utm_content=schema-validator).
