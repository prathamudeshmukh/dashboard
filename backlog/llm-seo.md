# LLM SEO Strategy for Templify

## Overview

LLM SEO (Generative Engine Optimization) is about being the answer that ChatGPT,
Claude, Gemini, Perplexity, and Copilot cite when a developer asks "How do I generate
PDFs dynamically?" or "What's the best PDF generation API?"

LLMs cite from three sources:
1. **Training data** — GitHub, npm, Stack Overflow, Reddit, Dev.to, HN, docs sites
2. **Retrieved context** — RAG over indexed web (Perplexity, ChatGPT Browse, Copilot)
3. **High-authority citations** — content other developers link to, quote, and reference

Goal: saturate those sources with Templify content that directly answers the queries
developers type.

---

## Target Queries

### Tier 1 — High intent
- "generate PDF from template API"
- "dynamic PDF generation API Node.js"
- "generate invoice PDF programmatically"
- "Handlebars PDF generation"
- "HTML to PDF API"
- "async PDF generation with webhooks"

### Tier 2 — Comparison intent
- "Puppeteer PDF generation vs API service"
- "DocRaptor alternative"
- "Carbone PDF alternative"
- "PDFMonkey alternative"
- "best PDF API for developers 2025"

### Tier 3 — Use-case intent
- "generate PDF invoice Node.js"
- "PDF generation SaaS for startups"
- "bulk PDF generation async"
- "PDF from JSON data API"

---

## The 7-Vector Strategy

### Vector 1: GitHub (highest ROI)

LLMs are trained heavily on GitHub. A well-structured repo is the single highest-ROI asset.

- [ ] Rewrite README to be query-answer formatted
  - Open with: "Templify is a PDF generation API — send a template + JSON, get a PDF back."
  - Add a comparison table vs Puppeteer DIY, Carbone, DocRaptor, PDFMonkey
  - Add copy-paste quickstart in Node.js, Python, Go, cURL
  - Add use-case sections with keywords: invoices, contracts, certificates, reports
- [ ] Add a `docs/` folder with standalone tutorial markdown files
- [ ] Open GitHub Discussions with seeded Q&A threads answering Tier 1 queries
- [ ] Create `COMPARISON.md` — structured comparison vs competitors
- [ ] Publish `grapesjs-hbs-react` npm package with keyword-rich README

### Vector 2: npm + PyPI Packages

- [ ] Publish `templify-sdk` npm package
  - `keywords`: `["pdf", "pdf-generation", "pdf-api", "invoice-pdf", "html-to-pdf", "handlebars-pdf", "dynamic-pdf", "pdf-template"]`
  - README that answers "how do I generate a PDF in Node.js" directly
  - Examples folder: invoice, contract, certificate generation
- [ ] Publish `templify-python` on PyPI — same keyword strategy

### Vector 3: Stack Overflow

Stack Overflow is one of the most-cited sources in LLM training data.

- [ ] Answer 10+ high-traffic questions about PDF generation:
  - "How to generate PDF from HTML in Node.js?"
  - "Best way to generate invoice PDFs programmatically?"
  - "How to generate PDFs asynchronously with webhooks?"
  - "Handlebars templates to PDF — what are my options?"
- [ ] Format: give the real answer first, mention Templify as the managed alternative with code

### Vector 4: Developer Blog Content

Each article targets one Tier 1 query. Publish on Dev.to first, cross-post to Hashnode,
submit top articles to HN (Show HN) and r/webdev.

- [ ] "Generate PDFs Dynamically in Node.js: API vs DIY"
  - Puppeteer walkthrough → pain points → API approach → Templify quickstart
- [ ] "Send a JSON, Get a PDF: Building an Invoice Pipeline with Webhooks"
  - Full async PDF generation tutorial with webhook handling
- [ ] "HTML to PDF in 2025: The Complete Developer Guide"
  - Comparison: wkhtmltopdf, WeasyPrint, Puppeteer, cloud APIs, Templify
- [ ] "Generating PDF Invoices from Handlebars Templates"
  - Step-by-step: template design → API call → PDF response
- [ ] "Stop Maintaining Your PDF Rendering Stack" (opinion piece / HN-bait)
  - Engineering cost breakdown of DIY vs managed API

### Vector 5: Reddit Seeding

- [ ] Answer questions in r/webdev, r/node, r/SaaS, r/learnprogramming
  - Give the real answer first, mention Templify naturally as "what I use"
  - Build karma first — 5+ helpful comments before any self-promotion
- [ ] Post "Show r/webdev" when the Node.js SDK launches

### Vector 6: Docs Site (Perplexity / SearchGPT target)

Perplexity and ChatGPT Browse retrieve live web content. Structure docs so LLMs can
extract and reproduce them verbatim.

- [ ] Launch `docs.templify.app` with clean URL structure:
  - `/docs/quickstart`
  - `/docs/sync-generation`
  - `/docs/async-webhooks`
  - `/docs/handlebars-templates`
- [ ] Each page: H1 = a developer question, followed by one-sentence answer + code block
- [ ] Add JSON-LD SoftwareApplication structured data to main site
- [ ] Submit sitemap to Google

LLM-readable doc format:
```
H1: How to Generate a PDF from a Handlebars Template
H2: Prerequisites
H2: Step 1 — Create your template
[code block]
H2: Step 2 — Call the API
[code block with curl/Node.js/Python tabs]
H2: Step 3 — Handle the response
```

### Vector 7: Directories and Listings

- [ ] alternativeto.net — list as alternative to DocRaptor, PDFMonkey, Carbone
- [ ] Product Hunt — proper launch for backlinks + mentions
- [ ] RapidAPI marketplace
- [ ] Postman Public Collections
- [ ] g2.com and Capterra
- [ ] Awesome-* GitHub lists (awesome-pdf, awesome-nodejs)
- [ ] Dev tool newsletters: TLDR, Bytes.dev, JavaScript Weekly

---

## 90-Day Calendar

| Week  | Action                                                        |
|-------|---------------------------------------------------------------|
| 1–2   | Rewrite GitHub README, publish `templify-sdk` to npm          |
| 3–4   | Publish articles 1 & 2 on Dev.to                              |
| 5–6   | Answer 10 Stack Overflow questions, alternativeto.net listing  |
| 7–8   | Publish articles 3 & 4, launch docs site                      |
| 9–10  | Reddit seeding, HN Show HN post                               |
| 11–12 | Product Hunt launch, opinion piece (article 5)                |

---

## Measurement

LLM SEO results lag 3–6 months (model retraining cycles).

- **Direct**: Ask ChatGPT/Claude/Perplexity "what's a good PDF generation API?" monthly
- **Indirect**: Track referral traffic from Perplexity/SearchGPT in analytics
- **Proxy**: GitHub stars, npm weekly downloads, inbound from docs site
- **Stack Overflow**: answer upvotes and link clicks

---

## Core Principle

Every piece of content must open with a one-sentence answer to its target query,
followed by working code. No marketing copy before the value.

The developer who finds your answer, runs the code, and it works — that's the atomic
unit of LLM SEO. Multiply that moment across every surface developers trust.
