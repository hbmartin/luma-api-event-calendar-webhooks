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
- **Use a single params object for a function argument when there are optional arguments or arguments of the same type**: this enables safe, name-based destructuring.

## When to Stop and Ask the User for Guidance

You should stop any time there is any ambiguity in the task specification or any lack of clarity on how to accomplish the task and ask the user for guidance.

Especially consider conceptual questions like:
- Is this introducing a new idea, or just expressing an existing one in a new place?
- Does this feel like it belongs close to the surface (API, UX, etc) or deep inside the system?
- If this thing I’m planning to introduce or change (whatever it is) spreads, will that be a good thing or a liability?
- What happens if we’re wrong and need to undo it? What’s the blast radius?
