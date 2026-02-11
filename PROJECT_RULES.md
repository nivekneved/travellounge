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

---

# AGENT OPERATIONAL GUIDELINES

(Consolidated from Rules 3)

## Always Connect to Real Backend Services

* You must always respond and all communication must be in English
* You must always connect to the latest live backend server on Vercel and fetch real live data
* Never implement local mocks, proxy servers, or simulated data

## Development Process Guidelines

* Always read all the docs first
* Always use existing test files
* ALWAYS CHECK IF WE HAVE EXISTING FILES FIRST
* THEN DISCUSS THE ERROR AND THE FIX
* All environment variables and API keys are stored in settings on Vercel

## User Interaction & Design Preferences

* User prefers to guide UI design by providing template images, expecting interfaces to be redesigned according to provided visual templates

## Additional Guidelines Based on Project Structure

### API Endpoint Structure

* API endpoints follow a specific structure with /api/v1 as the base path
* Authentication is required for most endpoints using Bearer tokens
* Different user roles (patient, admins, doctors, secretaries) have different access levels

### Environment Configuration

* Environment variables should be properly configured in .env, .env.local, .env.development, and .env.production files
* Different environments may have different configurations (e.g., PayPal sandbox vs live mode)

### Testing Approach

* Comprehensive test files exist for ALL API endpoints
* Tests should be run to verify functionality before and after changes
* ALL credentials should be tested

## Analysis & Debugging

* You must analyze the codebase by flows end to end as each user type.
* You must not remove, alter, or break existing functionality unless explicitly instructed.
* You must only revert your own changes if they caused an error or if the user explicitly requests it.
* You must validate that all previously mentioned tasks have been completed successfully.
* You must check for outdated references, including audit logging.

## Simplicity, Clarity, and Style

* You must keep implementation simple, readable, modular, and optimized.
* You must mimic and maintain existing style, formatting, naming, structure, frameworks, typing, and architecture.
* You must standardize project structure (e.g., move all screen components to src/screens).
* You must apply the principle of “one function, one task.”
* You must ensure accessibility, usability, and responsive layouts.
* You must keep Git commits clean and descriptive.

## Analysis Before Action

* You must analyze surrounding code, tests, and configuration before making changes.
* You must focus on why logic exists, not just what it does.
* You must fulfill user requests thoroughly but not go beyond scope without confirmation.
* You must explain first if asked how to do something.
* You must not perform unrequested actions — always get approval first.
* You must simulate fixes (dry-run) before applying them.
* You must validate each step to prevent unintended side effects.
* You must comment code instead of deleting or modifying when unsure.
* You must stay focused on the current task.

## Dependencies and Environment Awareness

* You must not assume libraries or frameworks are available.
* You must verify usage via imports, config files, or neighboring files.
* You must not trust outdated documentation — ask for clarification when unsure.

## File System and Path Rules

* You must confirm the working directory and absolute path before file operations.
* You must not use "&&" as a statement separator.
* You must always construct absolute paths from the project root plus relative paths.

## Verification and Validation

* You must self-verify after every change, file operation, or command.
* You must run tests, linters, type-checkers, and build commands after changes.
* You must validate that all required tasks are completed successfully.
* You must copy and save all necessary files, or copy them if not.
* You must check for outdated references (e.g., audit logging).
