# .vibe/work

Neutral placeholder per DL-17. Lane-specific work artifacts live here; no
business domain/roadmap/users/schema are inferred by the starter default.

Durable workflow memory (DL-33) is two-tier: canonical Evidence Packet 2.0.0
JSON, digests, lineage, and retention manifests under `.vibe/work/**` and
`.vibe/evidence/**/*.json` are versioned (tracked); only bulky archive-tier
sidecars and binary/large objects are ignored, and they must be captured with
`vibe-engineer archive` before cleanup. No path erases the sole record of why
work exists.
