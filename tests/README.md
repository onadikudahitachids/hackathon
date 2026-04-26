# API Quality Platform - Technical and Business Guide

## Overview

This project is an API quality platform for onboarding and integration flows. It combines:

- A modular Playwright API test suite.
- Reusable helpers for auth, requests, test data, assertions, and service mocking.
- A reliability dashboard generated from test execution reports.

Primary objective: reduce production defects in partner onboarding workflows by validating happy paths, negative paths, and edge scenarios continuously.

## Business Perspective

### Why this matters

- **Faster release confidence**: teams can verify API behavior before deployments and reduce rollback risk.
- **Lower integration risk**: validates auth, payload quality, and service contract expectations across partner-facing endpoints.
- **Improved operational reliability**: surfaces flaky areas and reliability score trends to support proactive quality improvement.
- **Better stakeholder visibility**: dashboard translates technical test data into concise reliability metrics useful for engineering leads, QA, and product owners.

### Business outcomes supported

- Fewer onboarding incidents caused by malformed payloads or auth failures.
- Reduced cycle time during feature delivery by catching regression early.
- Better prioritization of hardening work through flaky and auto-healed indicators.

## Technical Architecture

### Test Framework

- **Runner**: Playwright Test (`@playwright/test`)
- **Scope**: API-focused tests (no browser UI automation in this suite)
- **Patterns**:
  - AAA (Arrange, Act, Assert)
  - Independent/idempotent tests
  - Dynamic test data generation
  - Reusable helper abstraction for low duplication

### Test Coverage Areas

- Service-layer behavior:
  - `services/services/partnerService.js`
  - `services/services/pyronService.js`
- API contract and edge-case behavior via local mock server:
  - Auth required/invalid auth scenarios (`401`, `403`)
  - Validation failures (`400`/`422`)
  - Not found (`404`)
  - Empty response (`204`)
  - Timeout/slow endpoint behavior
  - Rate limit behavior (`429`, `retry-after`)

### Directory and Responsibilities

- `tests/api/`
  - `httpContracts.spec.js`: API contract and edge-case scenarios
  - `partnerService.spec.js`: partner service behavior validation
  - `pyronService.spec.js`: token retrieval and caching behavior
- `tests/helpers/`
  - `apiTestContext.js`: shared API setup/client/token utilities
  - `auth.js`: token fetch, cache, expiry handling, retry logic
  - `request.js`: request wrapper + structured failure logging
  - `dataFactory.js`: dynamic unique payload generation
  - `assertions.js`: reusable assertion helpers
  - `env.js`: environment variable access and defaults
  - `mockApiServer.js`: local deterministic API behavior simulation
  - `moduleLoader.js`, `testConfig.js`, `serviceTestFactory.js`: module/config test scaffolding
- `dashboard/`
  - `generateDashboard.js`: transforms Playwright JSON into dashboard data and output
  - `dist/index.html`: generated reliability dashboard

## Configuration and Environment

### Required install

- `npm install`

### Environment variables

- `BASE_URL`
  - Base API host for tests.
  - If not set, tests use local mock server URL.
- `AUTH_TOKEN_URL`
  - Auth token endpoint URL.
  - If not set, local mock endpoint `/auth/token` is used.
- Optional:
  - `CLIENT_ID`
  - `CLIENT_SECRET`

## Commands

- Run API tests only:
  - `npm run test:api`
- Run tests and generate dashboard:
  - `npm run test:report`
- Build dashboard from existing test report:
  - `npm run dashboard:build`

## Reliability Dashboard

Generated output:

- `dashboard/dist/index.html`

Dashboard includes:

- Test result summary (total/pass/fail/skipped/time/duration)
- Flaky tests list
- Auto-healed fixes list
- Reliability score
- Reliability trend graph

Use this dashboard in release reviews and standups to track quality trends over time.

## Quality and Best Practices Implemented

- No hardcoded external test URLs (env-driven config)
- Reusable helper architecture to minimize duplication
- Strong assertions beyond status-only checks
- Negative and edge-case coverage for critical failure modes
- Structured logging for easier failure triage
- Dynamic test data to avoid collisions in repeat runs

## Recommended Team Workflow

1. Run `npm run test:api` locally before PR.
2. Review failed test logs for request/response diagnostics.
3. Run `npm run test:report` for pre-release validation.
4. Review `dashboard/dist/index.html` for reliability trend and flaky behavior.
5. Prioritize fixes based on failing and flaky clusters.

## Current Limitations and Next Improvements

- Reliability trend currently reflects available run data in generated artifacts.
- Consider persisting historical run data for long-term trend analytics.
- Add CI pipeline artifact publishing for dashboard and Playwright report.
- Extend schema-level contract validation (e.g., Ajv/Zod) for stricter API guarantees.
