# PROJECT_RULES.md

# Revised Project Rules – Current Project Compliance

**Generated: 2026-01-07**
**Version: 3.2 – Strict Validation & Minimal Intervention**

## CRITICAL ENFORCEMENT RULES (MANDATORY)
>
> [!IMPORTANT]
> The following rules MUST be followed under ANY circumstances.

1. **ANALYSE THE WHOLE CODEBASE**: Before implementing any solution, perform a comprehensive scan of the relevant codebase areas to understand dependencies, existing patterns, and potential side effects. Do not assume; verify.
2. **USE SOLUTIONS WITH MINIMAL CODE POSSIBLE**: Prioritize simplicity. Refactor or reuse existing code over adding new complexities. If a feature can be enabled by configuration or uncommenting code, do that instead of rewriting.
3. **ENSURE NO REGRESSION**: Every change must be verified against existing functionality. New features must not break old ones. Verification steps must cover related components.

---

## Purpose

These rules define a strict enforcement framework for the current project. They ensure that all ongoing work, commits, fixes, and modifications adhere to the highest standards of structure, code quality, UI, performance, security, and validation.

**Note**: These rules do not prescribe creating new applications. They exist solely to maintain and enforce standards for the current project.

## GROUP 1: CODE QUALITY & DOCUMENTATION

### Documentation

* **Rule 1**: Keep all documentation complete, concise, and current.
  * Maintain a clear, up-to-date README.
  * Document all public APIs as applicable.
  * Include inline code comments (≥10% coverage).
  * Ensure package.json contains a correct description.
  * Keep documentation under version control.
  * Seek clarification if documentation is unclear or outdated.

### Code Quality & Security

* **Rule 2**: Enforce automated quality and security checks.
  * Lint, test, and verify code automatically.
  * Detect and resolve style, quality, and complexity issues.
  * Flag deprecated or unsafe patterns (`var`, `eval`, `with`, `arguments.callee`, `innerHTML`, `outerHTML`, `document.write`).
  * Remove console statements in production.
  * Track and resolve TODO/FIXME comments.

### Dependencies

* **Rule 3**: Maintain clean and up-to-date dependencies.
  * Detect deprecated or unmaintained packages.
  * Ensure consistent import/export usage.
  * Monitor cross-file reference integrity.
  * Flag projects with unusually high dependency count for review.

## GROUP 2: FILE ORGANIZATION & STRUCTURE

### File Management

* **Rule 4**: Maintain a unified file structure.
  * **React Native/Expo**: `app/`, `components/`, `assets/`, `tests/`, `docs/`, `scripts/`, `constants/`, `lib/`, `hooks/`.
  * **Web**: `src/`, `tests/`, `docs/`, `scripts/`, `config/`, `public/`.
  * File placement rules:
    * `*.tsx` → `components/` or `app/`
    * `*.ts` → `types/` or `lib/` or `constants/`
    * `*.js` → `lib/` or `utils/`
    * `*.test.*` → `tests/unit/`

### Structure Standardization

* **Rule 5**: Maintain consistent project layout.
  * Apply consistent naming: `PascalCase` (Components), `camelCase` (Utilities), `UPPER_SNAKE_CASE` (Constants).
  * Conduct periodic audits for missing/misplaced files.

## GROUP 3: CHANGE MANAGEMENT

### Pre-Change Analysis

* **Rule 6**: Evaluate every change before applying.
  * Review affected code, configs, and tests.
  * Map dependencies and imports.
  * Assess compatibility and conflicts.
  * Define safe rollout and rollback procedures.

### Safe Implementation

* **Rule 7**: Simulate and validate changes.
  * Run dry-run simulations before committing.
  * Backup files with timestamps.
  * Validate syntax and compatibility.
  * Execute verification tests on modified areas.

### Tracking & Rollback

* **Rule 8**: Maintain clear and reversible change history.
  * Log all changes with timestamps and descriptions.
  * Use Git branching for versioning and hotfixes.
  * Support instant rollback to stable states.

## GROUP 4: VALIDATION & QUALITY CONTROL

### Task Validation

* **Rule 9**: Ensure all tasks are fully validated.
  * Track tasks from initiation to closure.
  * Verify task-specific criteria before marking complete.

### Self-Verification

* **Rule 10**: Verify every modification immediately.
  * Confirm file operations.
  * Validate command execution and exit codes.
  * Check syntax, quality, and regression compliance.

### Quality Gate

* **Rule 11**: Enforce mandatory quality gates.
  * Minimum success rate: ≥80% on defined metrics.
  * Conduct full quality suite before merge or release.
  * Document and review critical or security-sensitive changes manually.

## GROUP 5: FINAL VERIFICATION & STABILITY

### System Stability

* **Rule 12**: Ensure project-wide stability after modifications.
  * Validate file permissions, syntax, and functionality.
  * Confirm command outputs and dependency integrity.
  * Detect and remove leftover debug or temporary code.

### Task Completion Certification

* **Rule 13**: Certify task completion.
  * Cross-verify via unified validation tools.
  * Maintain logs, summaries, and audit history.

## GROUP 6: CURRENT PROJECT SPECIFIC ENFORCEMENT

### UI / Component Enforcement

* Maintain existing modular structure and declarative patterns.
* Validate forms and UI components without introducing unrequested layouts or features.
* Ensure proper `SafeArea` usage.
* **Booking Process**: Booking flows must be implemented as dedicated pages with specific URLs (e.g., `/booking`), NOT as popups or modals. This ensures better shareability, SEO, and a focused user experience.

### State & Navigation

* Follow existing state management patterns; do not introduce unapproved global state logic.
* Respect current navigation structure.

### Performance & Optimization

* Avoid unnecessary re-renders; use memoization.
* Maintain existing image handling, startup, and splash screen behavior.

### Testing & Validation

* Run all existing tests; add tests only for modified functionality.

### Security & Data Handling

* Follow current authentication, input validation, and storage rules.
* Do not change secure APIs or HTTPS settings without review.

### Internationalization & Accessibility

* Maintain existing i18n, RTL, and accessibility features.
* Preserve scalable fonts and ARIA roles.
