# Luma API with Events and Webhooks

Search and browse https://docs.luma.com/ for information.

## Working Guide
- After adding any code or functionality, write thorough unit tests (using vitest) and check coverage.
- After making any changes always execute `pnpm format && pnpm build && pnpm test` to verify
- Fix any pnpm format issues (even if they are unrelated)
- never run publint with pnpm, instead always use `npx publint --pack npm`
- One file = one purpose (no 800-line “service.ts”).
- No “utils” without a namespace (e.g., shared/transport/httpErrors.ts, not utils.ts).

## TypeScript
- **Type everything**: params, returns, config objects, and external integrations; avoid `any` 
- **Use interfaces**: for complex types and objects, including ports and DTOs
- **Use namespaces**: for organizing related types and functions
- **Make Illegal States Unrepresentable**: If something should never happen, encode that rule in the type system instead of comments or runtime checks.
  - Discriminated unions instead of flags + nullable fields
  - Branded domain types instead of primitives
  - Narrowed constructors / factory functions
- **Avoid Type Assertions (as)**: Every as is a potential runtime crash hidden from the compiler.
  - Replace with: Narrowing functions or Exhaustive pattern matching or Refined input types
- **Prefer Union Types Over Boolean Flags**: Boolean flags destroy invariants.
- **Separate Pure Logic from Side Effects**: Functions that return void hide meaning from the compiler.
  - Prefer Pure functions with explicit inputs/outputs.
- **Error handling**: Throw domain/application errors (e.g. `DomainError`, `NotFoundError`), then map them to HTTP responses in a global error handler.
