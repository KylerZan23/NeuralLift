# ADR-001 — Program schema validation

## Status
Accepted

## Context
Generator output must be consistent and safe to render. A JSON Schema exists at `types/program.schema.json`.

## Decision
Use AJV (draft-07 compatible) with `ajv-formats` to validate program payloads in `POST /api/generate-program` before persisting to the database.

## Consequences
- Invalid payloads return HTTP 400 with `details` containing validation errors.
- Future schema updates require updating both the JSON Schema and tests.
- Console warnings are avoided by registering common formats via `ajv-formats`.

