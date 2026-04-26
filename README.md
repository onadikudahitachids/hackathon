<<<<<<< HEAD
# hackathon
=======
# Hackathon API Quality Platform

This repository contains automation scripts and a production-style API quality platform built with Playwright for validating onboarding and integration flows.

## What is in this repo

- API-focused automated test suite using Playwright
- Reusable test helper modules (auth, request wrappers, data factory, assertions)
- Reliability dashboard generation from test execution results
- Existing onboarding/service scripts under `createDistricts/` and `services/`

## Quick Start for New Team Members

### 1) Prerequisites

- Node.js 18+ (recommended: latest LTS)
- npm

### 2) Install dependencies

- `npm install`

### 3) Run API tests

- `npm run test:api`

### 4) Generate reliability dashboard

- `npm run test:report`
- Open `dashboard/dist/index.html` in your browser

### 5) Optional environment variables

Set these when targeting non-local services:

- `BASE_URL` - Base API URL for tests
- `AUTH_TOKEN_URL` - Token endpoint URL
- `CLIENT_ID` - Optional auth client ID
- `CLIENT_SECRET` - Optional auth client secret

## Documentation

- Detailed test architecture and business/technical guide:
  - [`tests/README.md`](tests/README.md)

## Common Commands

- Run all Playwright tests: `npm test`
- Run API suite only: `npm run test:api`
- Build dashboard from existing report: `npm run dashboard:build`
- Run tests and build dashboard: `npm run test:report`

## Suggested Team Workflow

- Before pushing code, run: `npm run test:api`
- Before release/demo, run: `npm run test:report`
- Review:
  - `playwright-report/` for execution details
  - `dashboard/dist/index.html` for reliability summary and trend

## Notes

- Tests are designed to be modular, reusable, and idempotent.
- The framework emphasizes strong assertions and edge-case coverage.
>>>>>>> 2eda9dbea53d5fe2019c2d18bd793f0d1a3f6171
