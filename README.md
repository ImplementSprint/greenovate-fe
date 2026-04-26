# FE Multi Template Repo

This repository hosts multiple frontend systems that share the FE multi-template CI/CD pipeline.

## Shelf Awareness

- System folder: `shelf-awareness`
- Vercel project secret: `VERCEL_PROJECT_ID_SHELF_AWARENESS`

## Required Repository Variable

Set `FE_MULTI_SYSTEMS_JSON` using the shape shown in `FE_MULTI_SYSTEMS_JSON.example.json`.

## Required Repository Secrets

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID_SHELF_AWARENESS`
- `SONAR_TOKEN`
- `SONAR_ORGANIZATION`
- `SONAR_PROJECT_KEY`

## Local Validation

```bash
cd shelf-awareness
npm install
npm run lint
npm run test
npm run build
```
