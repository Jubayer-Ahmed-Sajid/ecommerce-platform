# Architecture Exception Protocol & Register

**Document Version:** 1.0.0  
**Status:** Active Protocol  

---

## 1. Exception Protocol

Architectural rules defined in [AGENTS.md](file:///c:/Projects/E-commerce%20platform/AGENTS.md) and [QUALITY-GATES.md](file:///c:/Projects/E-commerce%20platform/docs/architecture/QUALITY-GATES.md) are strictly binding. However, legitimate real-world engineering constraints occasionally necessitate temporary deviations. 

An architectural rule must **NEVER** be bypassed silently. Any exception must follow this protocol:

1. **Explicit Request:** Document the concrete technical or business constraint preventing compliance.
2. **Impact Assessment:** Detail the security, maintainability, and boundary impact of the deviation.
3. **Time-Bound Scope:** Define an expiration date or concrete trigger condition when the exception must be revisited or refactored.
4. **Registration:** Record the exception in the register below before merging code.

---

## 2. Standard Exception Template

```markdown
### EX-XXX: [Title of Exception]
* **Rule Violate:** [Reference rule in AGENTS.md or QUALITY-GATES.md]
* **Module / Component:** [Specific file path or assembly]
* **Justification:** [Why compliance is impossible or prohibitively expensive at current scale]
* **Scope:** [Exact classes, endpoints, or methods affected]
* **Owner:** [Lead engineer / Agent session ID]
* **Date Approved:** [YYYY-MM-DD]
* **Revisit Trigger:** [Concrete metric, release milestone, or timeline to resolve]
```

---

## 3. Active Exceptions Register

| Exception ID | Rule Affected | Target Scope | Justification Summary | Revisit Trigger |
|---|---|---|---|---|
| **EX-001** | Test Method Naming (CA1707) | `[**/*Test*.cs]` in `.editorconfig` | The .NET compiler analyzer CA1707 disallows underscores in identifier names. In unit and architecture test suites, the industry-standard convention `Method_Condition_ExpectedResult` relies on underscores for clarity. | Permanent exception for test projects only; production assemblies strictly enforce CA1707. |
