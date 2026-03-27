# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-27

### Added
- **Core Skill: Applying Clean Architecture**: Comprehensive guide based on Robert C. Martin's textbook, including layer violation detection scripts.
- **Core Skill: Applying Design Patterns (GoF)**: Detailed mapping of 23 GoF patterns to TypeScript idioms, including Strategy pattern smell detection.
- **Automated Verification**: Native JS scripts in `scripts/` directories for all modules to detect code smells and architectural violations.
- **Progressive Disclosure Documenting**: Standardized `SKILL.md` (lean) and `references/RULES.md` (detailed) for all modules.

### Changed
- **Repository Restructuring**: Reorganized the codebase into 5 modular skill domains (`type-safety`, `async`, `errors`, `clean-architecture`, `design-patterns`).
- **Standardization**: Refactored legacy modules (`handling-errors`, `handling-async`) to match the new high-quality agentic standard.
- **Readability**: Updated `README.md` with clear links and navigation for all skills.

### Fixed
- Bloated `handling-errors/SKILL.md` resolved by moving technical details to reference catalogs.
- Inconsistent metadata across skill instruction sets.
