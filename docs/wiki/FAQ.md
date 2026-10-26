# FAQ

## Does passing this guarantee rich results?

No. Valid markup makes a page eligible; Google still decides whether to show rich results based on quality, policies and the query. Missing required properties, however, guarantees they will not show.

## JSON-LD, microdata or RDFa?

Google recommends JSON-LD — it is separate from the HTML and easiest to maintain. This tool validates JSON-LD and only detects the other two formats.

## Why is a relative image URL a problem?

Structured data is often processed apart from the page. Use absolute URLs (`https://…`) for images, logos and links.

## Is FAQPage still worth adding?

Google shows FAQ rich results only for a limited set of authoritative sites now, but the markup is still valid and used by other consumers, including AI assistants.

## Can I add my own types?

Yes — `RULES` is a plain object exported from the library. Add an entry with `required` and `recommended` arrays before calling the validator.
