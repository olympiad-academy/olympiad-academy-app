---
name: codebase-design
description: "Codebase-design discipline. Use when a module interface or seam must be designed, deepened, or restructured for testability using the shared deep-module vocabulary."
version: 2.0.0
invocation-policy: model_invoked
runtimeExecutionClaim: pending-live
---

# Deep-module codebase design

Design deep modules — substantial behavior behind a small interface at a clean seam, testable through that interface — using one shared vocabulary aligned with this repository's package ownership and domain-modeling standards.

## Shared vocabulary

Use these terms exactly; do not substitute component, service, API, or boundary.

- Module — anything with an interface and an implementation, at any scale.
- Interface — everything a caller must know to use the module correctly: signature, invariants, ordering, error modes, configuration, and performance.
- Implementation — the code inside the module, distinct from an adapter.
- Depth — leverage at the interface: behavior exercised per unit of interface learned; deep is a large amount of behavior behind a small interface.
- Seam — the location where a module's interface lives and behavior can vary without editing in place.
- Adapter — a concrete thing that satisfies an interface at a seam.
- Leverage — capability callers gain from depth; Locality — the concentration of change and knowledge maintainers gain from depth.

## Principles

1. Depth is a property of the interface, not the implementation; a deep module may hold internal seams its own tests cross. Completion: every proposed module states its interface and the behavior hidden behind it.
2. Apply the deletion test: if deleting the module makes complexity vanish it was a pass-through; if complexity reappears across callers it earns its keep. Completion: each retained seam names exactly what varies across it.
3. One adapter is a hypothetical seam; two adapters is a real one. Completion: no seam is introduced unless a second adapter or a locked decision requires it.
4. The interface is the test surface — callers and tests cross the same seam; accept dependencies rather than constructing them, and return results rather than hidden side effects. Completion: every design is testable through its interface with no reach past it.
5. Align each module with the repository's package ownership and locked domain language: the interface names the locked domain vocabulary and respects mechanical package boundaries. Completion: no proposed seam crosses a forbidden package boundary and every domain term matches the locked language.

## Rejected framings

Depth as an implementation-to-interface line ratio, interface as only the type-level surface, and boundary as a synonym for seam are all rejected — depth is leverage, interface is every fact a caller must know, and seam is the precise term.

A design decision is recorded where the plan marks it, cited by the locked decision or repository standard it derives from; a design that invents a material choice is rejected and routed to discovery. A repairable miss enters the same-run gap resolver and resumes automatically, and recovery is forward-only inside the run.
