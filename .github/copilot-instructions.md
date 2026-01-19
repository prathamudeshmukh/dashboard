# Copilot Instructions - Templify

This repository contains the Templify PDF generation platform. This file provides quick navigation to all AI agent guidance documents.

## Documentation Structure

### **Start Here: Project Context**

#### [**Technical Context**](../context/TECHNICAL_CONTEXT.md)
**Purpose**: Complete system architecture, data flows, and technical decisions  
**What it covers**:
- System overview and architecture
- Request flows (sync/async PDF generation)
- Database schema and data management
- External dependencies and integrations
- Key technical decisions and rationale

**When to use**: 
- First time working in this codebase
- Understanding how components interact
- Debugging cross-service issues
- Making architectural decisions

#### [**Business Context**](../context/BUSINESS_CONTEXT.md)
**Purpose**: Product requirements, business logic, and user workflows  
**What it covers**:
- Product overview and value proposition
- User workflows and features
- Business rules and constraints
- Integration patterns

**When to use**:
- Understanding product requirements
- Implementing new features
- Validating business logic

---

### **Coding Standards & Guidelines**

#### [**Core Standards**](guidelines/core-standards.md) ⭐ READ FIRST
**Purpose**: Universal coding principles applicable to ALL languages and projects  
**What it covers**:
- General principles (KISS, YAGNI, DRY, Boy Scout Rule, SOLID)
- Code smell detection and elimination
- Method/class size guidelines
- Naming conventions and readability requirements
- Cross-functional requirements (error handling, logging, security, performance, i18n)
- Testing best practices

**When to consider**: 
- **Before writing ANY code** - these are mandatory principles
- When reviewing code quality
- Resolving design decisions
- Identifying code smells

#### [**TypeScript & Next.js Standards**](guidelines/typescript-nextjs.md)
**Purpose**: TypeScript, Next.js App Router, and React best practices for the **dashboard** service  
**What it covers**:
- TypeScript type definitions and patterns
- Next.js App Router (Server/Client Components)
- API routes and server actions
- Database layer (Drizzle ORM)
- Background jobs (Inngest)
- Component design patterns
- Error handling & observability (Sentry, PostHog)
- Testing (Vitest, Playwright)
- Security and performance

**When to use**:
- Working on the `dashboard/` service
- Building Next.js pages or API routes
- Writing React components
- Database queries with Drizzle
- Inngest background jobs

#### [**Python & FastAPI Standards**](guidelines/python-fastapi.md)
**Purpose**: Python and FastAPI best practices for the **pdf2llm2html** service  
**What it covers**:
- Python type hints and docstrings
- FastAPI route patterns
- Pydantic models for validation
- Async/await best practices
- Error handling and custom exceptions
- Testing (pytest)
- Logging and observability
- OpenAI API integration patterns

**When to use**:
- Working on the `pdf2llm2html/` service
- Building FastAPI endpoints
- LLM integration (OpenAI Vision)
- PDF-to-image conversion
- Parallel processing

#### [**Node.js & Express Standards**](guidelines/nodejs-express.md)
**Purpose**: Node.js, Express, and Puppeteer best practices for the **job-runner** service  
**What it covers**:
- TypeScript with Express patterns
- Puppeteer browser management
- Browser pool implementation
- PDF generation from HTML
- Error handling and resource management
- Security (input sanitization, rate limiting)
- Testing (Vitest, k6 load tests)
- Docker deployment

**When to use**:
- Working on the `job-runner/` service
- Implementing PDF generation
- Browser pool optimization
- Resource management and cleanup
- Load testing and performance tuning

---

## Repository Structure

```
templify/
├── dashboard/          # Next.js dashboard (TypeScript)
│   ├── src/
│   │   ├── app/       # Next.js App Router
│   │   ├── components/
│   │   ├── inngest/   # Background jobs
│   │   ├── libs/      # Business logic
│   │   └── models/    # Database schema
│   └── context/       # Business & technical docs
├── job-runner/         # PDF generation service (TypeScript/Express)
│   └── src/
│       ├── controller/
│       └── util/
└── pdf2llm2html/       # PDF extraction service (Python/FastAPI)
    └── src/
        └── pdf2html_api/
```

---

## Recommended Workflow

### For Dashboard Development (Next.js/TypeScript)
1. **First visit**: Read [TECHNICAL_CONTEXT.md](../context/TECHNICAL_CONTEXT.md)
2. **Before coding**: Review [core-standards.md](guidelines/core-standards.md)
3. **While coding**: Follow [typescript-nextjs.md](guidelines/typescript-nextjs.md)
4. **Always**: Run `npm run check-types` and `npm test` before committing

### For Job Runner Development (Node.js/Express)
1. **First visit**: Read [TECHNICAL_CONTEXT.md](../context/TECHNICAL_CONTEXT.md) § "External Dependencies"
2. **Before coding**: Review [core-standards.md](guidelines/core-standards.md)
3. **While coding**: Follow [nodejs-express.md](guidelines/nodejs-express.md)
4. **Testing**: Use k6 for load testing (`npm run load-test`)

### For PDF Extraction Service (Python/FastAPI)
1. **First visit**: Read [TECHNICAL_CONTEXT.md](../context/TECHNICAL_CONTEXT.md) § "PDF→HTML extraction"
2. **Before coding**: Review [core-standards.md](guidelines/core-standards.md)
3. **While coding**: Follow [python-fastapi.md](guidelines/python-fastapi.md)
4. **Always**: Run `pytest` before committing

---

## Quick Reference by Task

| Task | Guidelines to Follow |
|------|---------------------|
| API endpoint (Next.js) | [Core](guidelines/core-standards.md) → [TypeScript/Next.js](guidelines/typescript-nextjs.md) § API Routes |
| React component | [Core](guidelines/core-standards.md) → [TypeScript/Next.js](guidelines/typescript-nextjs.md) § Components |
| Database query | [TypeScript/Next.js](guidelines/typescript-nextjs.md) § Database Layer |
| Inngest function | [TypeScript/Next.js](guidelines/typescript-nextjs.md) § Background Jobs |
| PDF generation | [Node.js/Express](guidelines/nodejs-express.md) § Puppeteer |
| PDF extraction | [Python/FastAPI](guidelines/python-fastapi.md) § Async/Await |
| Error handling | [Core](guidelines/core-standards.md) § Error Handling + service-specific guide |
| Testing | [Core](guidelines/core-standards.md) § Testing + service-specific guide |

---

## Code Review Checklist

Before submitting code for review:

- [ ] **Core Standards**: Applied SOLID principles, no code smells, small methods/classes
- [ ] **Types**: All TypeScript/Python functions have explicit types
- [ ] **Error Handling**: Comprehensive error handling with proper logging
- [ ] **Security**: Input validation, no hardcoded secrets, sanitized data
- [ ] **Testing**: Unit tests for new logic, integration tests for APIs
- [ ] **Observability**: Structured logging, Sentry/PostHog events tracked
- [ ] **Documentation**: Complex logic has explanatory comments (WHY, not WHAT)
- [ ] **Performance**: No N+1 queries, proper indexing, resource cleanup

---

## Additional Resources

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Inngest Docs](https://www.inngest.com/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Puppeteer Docs](https://pptr.dev/)
