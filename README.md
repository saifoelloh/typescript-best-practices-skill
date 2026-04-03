# TypeScript Best Practices Skill

A modular TypeScript/JavaScript code review toolkit with heuristic smell detectors and curated best-practice documentation.

## Status

🧪 **Beta** — `v1.1.0-beta`

Detectors are **heuristic-based** (regex + AST via ts-morph). They catch common smells with reasonable accuracy but are not equivalent to full ESLint rule coverage. See [TRACEABILITY.md](./TRACEABILITY.md) for per-rule detection status and known limitations.

## Requirements

- **Node.js** ≥ 22 (Node 20 is the minimum supported floor; see `engines` in package.json)
- **npm** ≥ 9

## Quickstart

```bash
# Install dependencies
npm install

# Run all detectors against a target project
npm run check:all -- /path/to/your/project

# Run a specific detector
npm run check:architecture -- /path/to/your/project
npm run check:type-safety -- /path/to/your/project
npm run check:async -- /path/to/your/project
npm run check:errors -- /path/to/your/project
npm run check:design-patterns -- /path/to/your/project

# Run tests
npm test
```

## Available Skills

| # | Skill | Description | Detector |
|---|-------|-------------|----------|
| 1 | [Applying Clean Architecture](./applying-clean-architecture/SKILL.md) | Layer isolation, dependency inversion, business logic purity | `layer_violation_check.js` |
| 2 | [Ensuring Type Safety](./ensuring-type-safety/SKILL.md) | Strict mode, unsafe assertions, `any` escape hatches | `strict_mode_check.js` |
| 3 | [Handling Async Operations](./handling-async/SKILL.md) | Promises, async/await, floating promises, forEach misuse | `async_smell_check.js` |
| 4 | [Handling Errors](./handling-errors/SKILL.md) | Empty catches, thrown non-Errors, swallowed promise errors | `error_smell_check.js` |
| 5 | [Applying Design Patterns](./applying-design-patterns/SKILL.md) | Strategy smell detection, god object detection | `detect-strategy-smell.js`, `god_object_check.js` |

## Repository Structure

Each skill follows the Anthropic Agent Skill documentation format:
- `SKILL.md` — Lean instruction set with progressive disclosure
- `scripts/` — Heuristic smell detectors (CLI tools)
- `references/` — Detailed rule catalogs and research sources

```text
typescript-best-practices-skill/
├── applying-clean-architecture/   # Clean Architecture layer rules
│   ├── SKILL.md
│   ├── scripts/
│   │   └── layer_violation_check.js
│   └── study-notes.md
├── applying-design-patterns/      # GoF patterns & refactoring smells
│   ├── SKILL.md
│   ├── references/
│   │   ├── GOF_PATTERNS.md
│   │   └── RULES.md
│   └── scripts/
│       ├── detect-strategy-smell.js
│       └── god_object_check.js
├── ensuring-type-safety/          # TypeScript type system rules
│   ├── SKILL.md
│   ├── references/
│   │   └── RULES.md
│   └── scripts/
│       └── strict_mode_check.js
├── handling-async/                # Async/await & promise patterns
│   ├── SKILL.md
│   ├── references/
│   │   └── RULES.md
│   └── scripts/
│       └── async_smell_check.js
├── handling-errors/               # Error propagation & custom types
│   ├── SKILL.md
│   ├── references/
│   │   └── RULES.md
│   └── scripts/
│       └── error_smell_check.js
├── lib/                           # Shared utilities
│   ├── scanner.js
│   └── reporter.js
├── tests/                         # Detector tests & fixtures
│   ├── fixtures/
│   └── *.test.js
├── TRACEABILITY.md                # Rule → detector mapping
├── CHANGELOG.md
├── LICENSE
├── package.json
└── README.md
```

## CLI Output Format

All detectors use a consistent output format:

```
[RULE_ID][SEVERITY] path/to/file.ts:42 — Description of the finding
```

Pass `--json` for machine-readable JSON output. Detectors exit with code 1 when violations are found.

## Authoritative Sources

- **"Effective TypeScript"** — Dan Vanderkam
- **"Programming TypeScript"** — Boris Cherny
- **"You Don't Know JS"** — Kyle Simpson
- **TypeScript Handbook** (Official)
- **Node.js Best Practices** (goldbergyoni/nodebestpractices)
- **Clean Architecture** — Robert C. Martin
- **Refactoring** — Martin Fowler
- **"Design Patterns"** — Gang of Four

## Contributing

1. Fork the repository
2. Create a feature branch
3. Ensure `npm test` passes
4. Submit a pull request

When adding a new rule:
- Add the rule to the appropriate `SKILL.md` and `references/RULES.md`
- If the rule is detectable, add or update the corresponding detector in `scripts/`
- Add test fixtures in `tests/fixtures/pass/` and `tests/fixtures/fail/`
- Update [TRACEABILITY.md](./TRACEABILITY.md) with the new rule entry

## Author

**saifoelloh** (saifoelloh@gmail.com)

## License

[MIT](./LICENSE)
