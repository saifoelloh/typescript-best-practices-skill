# TypeScript Best Practices Skill

A comprehensive TypeScript/JavaScript code review skill based on authoritative sources and production-proven patterns.

## Status

🚧 **Under Development** - v0.1.0

## Available Skills

1.  **[Applying Clean Architecture](./applying-clean-architecture/SKILL.md)**: Enforces layer isolation, dependency inversion, and business logic purity. Includes automated layer violation checks.
2.  **[Ensuring Type Safety](./ensuring-type-safety/SKILL.md)**: Rules for strict typing, avoiding `any`, and leveraging advanced TS features.
3.  **[Handling Async Operations](./handling-async/SKILL.md)**: Best practices for Promises, async/await, and error handling in concurrent flows.
4.  **[Applying Design Patterns](./applying-design-patterns/SKILL.md)**: Guidance on GoF patterns and SOLID in modern TypeScript.
5.  **[Handling Errors](./handling-errors/SKILL.md)**: Standardizing error classes and propagation patterns.

## Repository Structure

Each skill follows the Anthropic Agent Skill documentation format:
- `SKILL.md`: The main instruction set with progressive disclosure.
- `scripts/`: Automated validation tools.
- `references/`: Detailed documentation and research sources.
```text
typescript-best-practices-skill/
├── ensuring-type-safety/        # TypeScript type system best practices
├── handling-async/              # Promises, async/await, concurrency
├── handling-errors/             # Error propagation & custom types
└── applying-design-patterns/    # Code smells, refactoring & GoF patterns
    ├── SKILL.md                 # Core orchestration
    ├── references/              # Modular documentation
    └── scripts/                 # Automated detection scripts
```

## Authoritative Sources

Based on:
- **"Effective TypeScript"** - Dan Vanderkam
- **"Programming TypeScript"** - Boris Cherny
- **"You Don't Know JS"** - Kyle Simpson
- **TypeScript Handbook** (Official)
- **Node.js Best Practices** (goldbergyoni/nodebestpractices)
- **"Production Ready GraphQL"** - Marc-André Giroux
- **Clean Architecture** - Robert C. Martin
- **Refactoring** - Martin Fowler
- **OWASP Security Guidelines**

## Author

**saifoelloh** (saifoelloh@gmail.com)

## License

MIT

## Contributing

Coming soon - repository structure in development
